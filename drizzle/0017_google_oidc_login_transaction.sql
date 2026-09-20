create table public.google_oidc_login_transactions (
  id uuid primary key,
  credential_hash varchar(64) not null,
  state varchar(128) not null,
  nonce varchar(128) not null,
  pkce_code_verifier varchar(128) not null,
  created_at timestamptz not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  constraint ck_google_oidc_login_transactions__id_uuidv7
    check ((get_byte(uuid_send(id), 6) >> 4) = 7 and (get_byte(uuid_send(id), 8) & 192) = 128),
  constraint ck_google_oidc_login_transactions__credential_hash_sha256_hex
    check (credential_hash ~ '^[0-9a-f]{64}$'),
  constraint uq_google_oidc_login_transactions__credential_hash
    unique (credential_hash),
  constraint ck_google_oidc_login_transactions__state_not_blank
    check (btrim(state) <> ''),
  constraint ck_google_oidc_login_transactions__nonce_not_blank
    check (btrim(nonce) <> ''),
  constraint ck_google_oidc_login_transactions__pkce_length
    check (char_length(pkce_code_verifier) between 43 and 128),
  constraint ck_google_oidc_login_transactions__expires_after_creation
    check (expires_at > created_at),
  constraint ck_google_oidc_login_transactions__consumed_not_before_creation
    check (consumed_at is null or consumed_at >= created_at)
);
