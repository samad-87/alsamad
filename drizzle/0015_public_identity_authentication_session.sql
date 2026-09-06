-- REG-0036 / ADR-0016: empty, runtime-inert persistence only.
-- IDs are application-generated UUIDv7 record identities, never credentials.
-- The repository migration runner applies SQL inside one transaction.
create table user_sessions (
  id uuid primary key not null,
  user_id uuid not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  constraint ck_user_sessions__id_uuidv7 check (
    (get_byte(uuid_send(id), 6) >> 4) = 7
    and (get_byte(uuid_send(id), 8) & 192) = 128
  ),
  constraint fk_user_sessions__user foreign key (user_id)
    references users(id) on update restrict on delete restrict not deferrable,
  constraint ck_user_sessions__expires_after_creation check (expires_at > created_at),
  constraint ck_user_sessions__revoked_not_before_creation check (
    revoked_at is null or revoked_at >= created_at
  )
);

create index ix_user_sessions__user_id on user_sessions(user_id);

create function enforce_user_sessions_integrity()
returns trigger
language plpgsql
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'session record id is immutable' using errcode = '23514';
  end if;
  if new.user_id is distinct from old.user_id then
    raise exception 'session user_id is immutable' using errcode = '23514';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'session created_at is immutable' using errcode = '23514';
  end if;
  if new.expires_at is distinct from old.expires_at then
    raise exception 'session expires_at is immutable' using errcode = '23514';
  end if;
  if old.revoked_at is not null then
    raise exception 'session revocation cannot be cleared or rewritten' using errcode = '23514';
  end if;
  if new.revoked_at is null then
    raise exception 'session update must make an actual governed change' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger trg_user_sessions__integrity
before update on user_sessions
for each row execute function enforce_user_sessions_integrity();
