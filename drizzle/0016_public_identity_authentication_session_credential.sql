create table public.session_credentials (
  session_id uuid primary key,
  credential_hash varchar(64) not null,

  constraint ck_session_credentials__credential_hash_sha256_hex
    check (credential_hash ~ '^[0-9a-f]{64}$'),

  constraint uq_session_credentials__credential_hash
    unique (credential_hash),

  constraint fk_session_credentials__session
    foreign key (session_id)
    references public.user_sessions(id)
    on update restrict
    on delete restrict
);
