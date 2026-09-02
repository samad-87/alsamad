create table if not exists user_identities (
  id uuid primary key,
  user_id uuid not null,
  authenticator_namespace varchar(128) collate "C" not null,
  subject text collate "C" not null,
  status varchar(16) not null,
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint ck_user_identities__id_uuidv7 check (
    (get_byte(uuid_send(id), 6) >> 4) = 7
    and (get_byte(uuid_send(id), 8) & 192) = 128
  ),
  constraint fk_user_identities__user foreign key (user_id)
    references users(id) on update restrict on delete restrict not deferrable,
  constraint ck_user_identities__authenticator_namespace check (
    authenticator_namespace ~ '^[a-z0-9][a-z0-9._-]{0,127}$'
  ),
  constraint ck_user_identities__subject_nonempty check (subject <> ''),
  constraint ck_user_identities__status check (status in ('active', 'retired')),
  constraint uq_user_identities__authenticator_subject unique (
    authenticator_namespace,
    subject
  )
);

create index ix_user_identities__user_id on user_identities(user_id);

create or replace function enforce_user_identities_integrity()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'user identity id is immutable' using errcode = '23514';
  end if;

  if new.user_id is distinct from old.user_id then
    raise exception 'user identity user_id is immutable' using errcode = '23514';
  end if;

  if new.authenticator_namespace is distinct from old.authenticator_namespace then
    raise exception 'user identity authenticator_namespace is immutable' using errcode = '23514';
  end if;

  if new.subject is distinct from old.subject then
    raise exception 'user identity subject is immutable' using errcode = '23514';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'user identity created_at is immutable' using errcode = '23514';
  end if;

  if new.status is not distinct from old.status then
    if new.updated_at is distinct from old.updated_at then
      raise exception 'user identity updated_at may change only with status' using errcode = '23514';
    end if;
    raise exception 'user identity update must make an actual governed change' using errcode = '23514';
  end if;

  if new.updated_at is not distinct from old.updated_at
    or new.updated_at <= old.updated_at then
    raise exception 'user identity status transition requires a later application-supplied updated_at' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger trg_user_identities__integrity
before update on user_identities
for each row execute function enforce_user_identities_integrity();
