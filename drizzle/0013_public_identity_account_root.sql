create table if not exists users (
  id uuid primary key,
  status varchar(24) not null default 'active',
  created_at timestamptz not null default current_timestamp,
  updated_at timestamptz not null default current_timestamp,
  constraint ck_users__id_uuidv7 check (
    (get_byte(uuid_send(id), 6) >> 4) = 7
    and (get_byte(uuid_send(id), 8) & 192) = 128
  ),
  constraint ck_users__status check (
    status in ('active', 'disabled', 'deletion_pending', 'deleted')
  )
);

do $$
declare
  column_count integer;
  constraint_count integer;
begin
  select count(*) into column_count
  from information_schema.columns
  where table_schema = 'public' and table_name = 'users';

  if column_count <> 4
    or not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
        and column_name = 'id' and data_type = 'uuid' and is_nullable = 'NO'
        and column_default is null
    )
    or not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
        and column_name = 'status' and data_type = 'character varying'
        and character_maximum_length = 24 and is_nullable = 'NO'
        and column_default like '%active%'
    )
    or not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
        and column_name = 'created_at' and data_type = 'timestamp with time zone'
        and is_nullable = 'NO' and column_default = 'CURRENT_TIMESTAMP'
    )
    or not exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = 'users'
        and column_name = 'updated_at' and data_type = 'timestamp with time zone'
        and is_nullable = 'NO' and column_default = 'CURRENT_TIMESTAMP'
    ) then
    raise exception 'users has a mismatched column contract' using errcode = '23514';
  end if;

  select count(*) into constraint_count
  from pg_constraint
  where conrelid = 'users'::regclass;

  if constraint_count <> 3
    or not exists (
      select 1 from pg_constraint
      where conrelid = 'users'::regclass and contype = 'p'
        and conkey = array[(select attnum from pg_attribute where attrelid = 'users'::regclass and attname = 'id')]::smallint[]
    )
    or not exists (
      select 1 from pg_constraint
      where conrelid = 'users'::regclass
        and conname = 'ck_users__id_uuidv7' and contype = 'c'
    )
    or not exists (
      select 1 from pg_constraint
      where conrelid = 'users'::regclass
        and conname = 'ck_users__status' and contype = 'c'
    ) then
    raise exception 'users has a mismatched constraint contract' using errcode = '23514';
  end if;
end;
$$;

create or replace function enforce_users_lifecycle_integrity()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'user id is immutable' using errcode = '23514';
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'user created_at is immutable' using errcode = '23514';
  end if;

  if new.status is not distinct from old.status then
    if new.updated_at is distinct from old.updated_at then
      raise exception 'user updated_at may change only with status' using errcode = '23514';
    end if;
    raise exception 'user update must make an actual governed change' using errcode = '23514';
  end if;

  if old.status = 'deleted' then
    raise exception 'deleted user is terminal' using errcode = '23514';
  end if;

  if new.status = 'deleted' and old.status <> 'deletion_pending' then
    raise exception 'deleted may be entered only from deletion_pending' using errcode = '23514';
  end if;

  if new.updated_at is not distinct from old.updated_at
    or new.updated_at <= old.updated_at then
    raise exception 'user status transition requires a later application-supplied updated_at' using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_users__lifecycle_integrity on users;
create trigger trg_users__lifecycle_integrity
before update on users
for each row execute function enforce_users_lifecycle_integrity();
