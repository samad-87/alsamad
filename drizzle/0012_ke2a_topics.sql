create table if not exists topics (
  id uuid primary key,
  canonical_key varchar(160) not null,
  localized_names jsonb not null,
  status varchar(16) not null default 'draft',
  created_by uuid not null,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint uq_topics__canonical_key unique (canonical_key),
  constraint ck_topics__id_uuidv7 check (
    (get_byte(uuid_send(id), 6) >> 4) = 7
    and (get_byte(uuid_send(id), 8) & 192) = 128
  ),
  constraint ck_topics__canonical_key check (
    btrim(canonical_key) <> '' and canonical_key = lower(canonical_key)
  ),
  constraint ck_topics__localized_names check (
    jsonb_typeof(localized_names) = 'object'
    and localized_names <> '{}'::jsonb
  ),
  constraint ck_topics__status check (
    status in ('draft', 'approved', 'retired')
  ),
  constraint ck_topics__approval_evidence check (
    (status = 'draft' and approved_by is null and approved_at is null)
    or (status = 'approved' and approved_by is not null and approved_at is not null)
    or (
      status = 'retired'
      and (
        (approved_by is null and approved_at is null)
        or (approved_by is not null and approved_at is not null)
      )
    )
  ),
  constraint fk_topics__created_by foreign key (created_by)
    references editorial_users(id) on update restrict on delete restrict,
  constraint fk_topics__approved_by foreign key (approved_by)
    references editorial_users(id) on update restrict on delete restrict
);

create index if not exists ix_topics__status on topics(status);

create or replace function require_active_topic_editor(actor_id uuid)
returns void
language plpgsql
as $$
begin
  perform 1
  from editorial_users
  where id = actor_id and status = 'active'
  for share;

  if not found then
    raise exception 'topic mutation requires an active editorial actor'
      using errcode = '23503';
  end if;
end;
$$;

create or replace function require_ke2a_read_committed()
returns void
language plpgsql
as $$
begin
  if current_setting('transaction_isolation') <> 'read committed' then
    raise exception 'KE-2A locale integrity requires READ COMMITTED'
      using errcode = '23514';
  end if;
end;
$$;

create or replace function lock_ke2a_locale_integrity()
returns void
language plpgsql
as $$
begin
  perform require_ke2a_read_committed();
  perform pg_advisory_xact_lock(
    hashtextextended('alsamad:ke2:locale-integrity', 0)
  );
end;
$$;

create or replace function validate_topic_localized_names()
returns trigger
language plpgsql
as $$
declare
  localized_name record;
begin
  perform lock_ke2a_locale_integrity();

  for localized_name in
    select key, value from jsonb_each(new.localized_names)
  loop
    if jsonb_typeof(localized_name.value) <> 'string'
      or btrim(localized_name.value #>> '{}') = '' then
      raise exception 'topic localized_names values must be non-blank strings'
        using errcode = '23514';
    end if;

    if not exists (
      select 1 from locales where code = localized_name.key
    ) then
      raise exception 'topic localized_names key does not reference locales.code'
        using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists ctr_topics__localized_names on topics;
create constraint trigger ctr_topics__localized_names
after insert or update of localized_names on topics
deferrable initially deferred
for each row execute function validate_topic_localized_names();

create or replace function protect_locale_delete_from_topics()
returns trigger
language plpgsql
as $$
begin
  perform lock_ke2a_locale_integrity();

  if exists (
    select 1 from topics where localized_names ? old.code
  ) then
    raise exception 'locale is referenced by topics.localized_names'
      using errcode = '23503';
  end if;

  return old;
end;
$$;

drop trigger if exists tr_locales__protect_topics on locales;
create trigger tr_locales__protect_topics
before delete on locales
for each row execute function protect_locale_delete_from_topics();

create or replace function enforce_topics_lifecycle()
returns trigger
language plpgsql
as $$
declare
  event_timestamp timestamptz;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft'
      or new.approved_by is not null
      or new.approved_at is not null then
      raise exception 'topics must be created as draft without approval evidence'
        using errcode = '23514';
    end if;

    perform require_active_topic_editor(new.created_by);

    new.created_at := current_timestamp;
    new.updated_at := current_timestamp;
    return new;
  end if;

  if new.id is distinct from old.id then
    raise exception 'topic id is immutable' using errcode = '23514';
  end if;
  if new.canonical_key is distinct from old.canonical_key then
    raise exception 'topic canonical_key is immutable' using errcode = '23514';
  end if;
  if new.created_by is distinct from old.created_by then
    raise exception 'topic created_by is immutable' using errcode = '23514';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'topic created_at is immutable' using errcode = '23514';
  end if;
  if new.updated_at is distinct from old.updated_at
    or new.approved_at is distinct from old.approved_at then
    raise exception 'topic lifecycle timestamps are database-owned'
      using errcode = '23514';
  end if;

  if new.status is not distinct from old.status
    and new.localized_names is not distinct from old.localized_names
    and new.approved_by is not distinct from old.approved_by then
    raise exception 'topic mutation must make an actual governed change'
      using errcode = '23514';
  end if;

  if old.status = 'retired' then
    raise exception 'retired topic is terminal' using errcode = '23514';
  end if;

  event_timestamp := greatest(
    clock_timestamp(),
    old.updated_at + interval '1 microsecond'
  );

  if new.localized_names is distinct from old.localized_names then
    if new.status is distinct from old.status
      or new.approved_by is distinct from old.approved_by then
      raise exception 'localized-name replacement cannot combine lifecycle changes'
        using errcode = '23514';
    end if;
    if old.status not in ('draft', 'approved') then
      raise exception 'localized names may change only for draft or approved topics'
        using errcode = '23514';
    end if;
    new.updated_at := event_timestamp;
    return new;
  end if;

  if old.status = 'draft' and new.status = 'approved' then
    if new.approved_by is null then
      raise exception 'topic approval requires approved_by'
        using errcode = '23514';
    end if;
    perform require_active_topic_editor(new.approved_by);
    new.approved_at := event_timestamp;
    new.updated_at := event_timestamp;
    return new;
  end if;

  if old.status in ('draft', 'approved') and new.status = 'retired' then
    if new.approved_by is distinct from old.approved_by then
      raise exception 'topic retirement preserves approval evidence'
        using errcode = '23514';
    end if;
    new.approved_at := old.approved_at;
    new.updated_at := event_timestamp;
    return new;
  end if;

  raise exception 'invalid topic lifecycle transition'
    using errcode = '23514';
end;
$$;

drop trigger if exists tr_topics__lifecycle on topics;
create trigger tr_topics__lifecycle
before insert or update on topics
for each row execute function enforce_topics_lifecycle();

create or replace function protect_governed_topic_delete()
returns trigger
language plpgsql
as $$
begin
  if old.status in ('approved', 'retired') then
    raise exception 'approved or retired topics cannot be hard-deleted'
      using errcode = '23514';
  end if;
  return old;
end;
$$;

drop trigger if exists tr_topics__protect_delete on topics;
create trigger tr_topics__protect_delete
before delete on topics
for each row execute function protect_governed_topic_delete();
