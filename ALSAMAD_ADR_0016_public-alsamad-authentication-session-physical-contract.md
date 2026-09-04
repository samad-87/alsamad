# ADR-0016: Public ALSAMAD Authentication Session Physical Contract

**Registry entry:** `REG-0035` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-09-04. Provider-neutral, transport-neutral physical-contract governance only; implementation and real-data processing are not authorized.

## Context

`REG-0034` and accepted `ADR-0015` establish authentication sessions as server-managed, revocable authority contexts subordinate to exactly one durable ALSAMAD account and current authentication/security state. They require bounded-time authority, independent context revocation, account-wide invalidation, fail-closed evaluation, and separation from Recovery, but deliberately leave persistence and every token, provider, transport, API, and runtime mechanism unresolved.

The durable account root is governed by `REG-0028`/`ADR-0011` and `REG-0029`/`ADR-0012`, with its zero-row runtime-inert persistence complete under `REG-0030`. PostgreSQL is the repository's authoritative database integrity boundary, UUIDv7 is the default mutable-business-record identifier, derived values are not persisted without demonstrated need, and restrictive ownership relationships prevent silent destructive cascades. The Owner has selected PostgreSQL as canonical session-state persistence and accepted a minimum five-field derived-lifecycle direction.

## Decision

### 1. Authority and persistence ownership

PostgreSQL is the authoritative persistent source of truth for ALSAMAD authentication session state. A future cache or auxiliary server-managed store requires separate governance and must not silently replace PostgreSQL as canonical authority. This ADR designs no cache.

The future physical entity is exactly `user_sessions`. It represents operational session records only. It is not a credential store, token store, provider record, Recovery store, device registry, identity-assurance system, or immutable audit-event system.

### 2. Exact five-field contract

The physical contract has exactly five columns and no sixth field:

| Column | PostgreSQL type | Nullability and default | Contract |
| --- | --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY NOT NULL`; no database default | Application-generated UUIDv7 with the established RFC-variant integrity check; ALSAMAD-owned, opaque, immutable, never reused, and persistent session-record identity only. It is not a bearer credential or secret. |
| `user_id` | `uuid` | `NOT NULL`; no default | Immutable reference to exactly one durable `users.id`. |
| `created_at` | `timestamptz` | `NOT NULL`; no default | Explicit immutable UTC creation/issuance evidence and lower temporal bound for expiry and revocation; not immutable audit history. |
| `expires_at` | `timestamptz` | `NOT NULL`; no default | Explicit immutable UTC bounded-authority evidence, strictly later than `created_at`. |
| `revoked_at` | `timestamptz` | nullable; initially `NULL`; no default | `NULL` means no row-level revocation recorded. A non-null value means revoked, cannot precede `created_at`, and is immutable once set. |

`ck_user_sessions__id_uuidv7` follows the same repository-standard UUIDv7 and RFC-variant integrity approach as the other durable Public Identity physical contracts. No new identifier convention is created.

`fk_user_sessions__user` references `users(id)`, is non-null and `NOT DEFERRABLE`, and uses `ON UPDATE RESTRICT` and `ON DELETE RESTRICT`. `user_id` is immutable. Restriction prevents deletion of the durable root from silently cascading session authority; this ADR does not invent account lifecycle or deletion-completion behavior. There is no `user_identity_id`: a session authorizes the ALSAMAD account, not a provider or authentication identity.

`ck_user_sessions__expires_after_creation` requires `expires_at > created_at`. `ck_user_sessions__revoked_not_before_creation` requires `revoked_at IS NULL OR revoked_at >= created_at`.

A future integrity trigger named `trg_user_sessions__integrity` must reject mutation of `id`, `user_id`, `created_at`, or `expires_at`; permit only `revoked_at: NULL → valid timestamp`; reject clearing or rewriting a non-null `revoked_at`; and reject no-op lifecycle mutation. Its supporting function name remains an implementation detail. This physical contract authorizes no mutation caller.

### 3. Derived lifecycle

No lifecycle or status column is persisted:

- `ISSUED` is successful creation of the session record.
- `ACTIVE` requires `revoked_at IS NULL`, current time before `expires_at`, and current account/authentication/security evaluation permitting continued authority.
- `EXPIRED` means current time is at or after `expires_at`.
- `REVOKED` means `revoked_at IS NOT NULL`.
- `INVALID` is an evaluation outcome only and is never persisted as status.

`SUSPENDED` is not introduced. There is no generic mutable `updated_at`. The timestamp facts are not duplicated through a mutable enum.

No numeric TTL, idle lifetime, absolute-lifetime policy, sliding/fixed policy, remember-me duration, refresh lifetime, cleanup schedule, or clock-skew policy is decided.

### 4. Concurrency, indexes, and invalidation capability

Multiple concurrent sessions per account remain physically possible. `user_id` is not unique, and no maximum session count is frozen. Distinct rows provide independently revocable session contexts without storing device fingerprints.

The only index classes are the primary-key index on `id` and non-unique `ix_user_sessions__user_id`. Primary-key uniqueness on `id` is the only uniqueness rule. No expiry, revocation, credential/token, provider, cleanup, or speculative performance index is approved.

The `user_id` index permits all retained rows for an account to be located for future separately governed account-wide invalidation. Account disablement/closure and security-sensitive authentication-state change must remain compatible with fail-closed evaluation and row revocation. Transaction isolation, locking, concurrent issuance serialization, generation/version mechanisms, and runtime revoke-all algorithms remain later Security/runtime governance. No account, authentication, or session generation/version column is approved.

### 5. Credential and transport separation

Persistent session-record identity is conceptually and physically separate from any future bearer credential or secret used to resolve it. No raw bearer/session secret may be persisted in `user_sessions`.

This ADR decides no JWT-versus-opaque representation, token format or payload, hashing algorithm, encryption, credential lookup representation, refresh-token representation, rotation, or reuse detection. Any future credential-resolution persistence requires separate governance.

The contract is provider-neutral and transport-neutral. It selects no provider, password, passkey, magic link, cookie, authorization header, JWT, opaque bearer transport, endpoint, request/response contract, serialization, CSRF mechanism, middleware, login/signup flow, logout shape, or revoke-all shape.

### 6. Data minimization

The five-column contract contains no status/lifecycle enum, `user_identity_id`, `updated_at`, generation/version, credential or token field, credential/token hash, refresh token, lookup secret, rotation lineage, IP address, user agent, geolocation, device fingerprint, hardware identifier, advertising identifier, device label, trusted-device assertion, ownership assertion, provider metadata or payload, provider tokens, email, phone, contact identifier, assurance/trust/reputation/personhood/household field, Talibeen identity, Editorial identity, revocation reason, audit-event reference, cleanup metadata, or other speculative column.

Per-context isolation is not device tracking and conveys no physical-device identity, trusted status, ownership proof, identity assurance, reputation, or personhood.

### 7. Audit, privacy, retention, and real-data gates

Operational session state and immutable security/audit evidence remain separate. `created_at` and `revoked_at` are operational timestamps, not a complete append-only audit history.

Audit-event governance is not a prerequisite to this physical-contract governance decision or to a future separately authorized zero-row runtime-inert persistence implementation. Appropriate future audit/logging authority is required before real issuance. Real revocation or lifecycle mutation requires immutable event governance where existing authority requires it. Support/admin mutation requires separately governed immutable, purpose-bound actor/action/target/reason/outcome evidence. This ADR defines no audit-event schema.

Numeric retention is not frozen. This governance decision and a future separately authorized empty inert implementation may proceed without selecting a duration. No real issuance or processing is authorized until applicable governance and research resolve purpose, lawful basis, notice, retention, erasure, deletion completion, backups, access/export, correction where applicable, transfers/subprocessors, support access, legal holds, and jurisdiction obligations.

### 8. Recovery, provider, runtime, and API separation

Recovery remains separate and downstream. Password reset, account recovery, recovery tokens, provider/support recovery, and identity transfer are not represented through `user_sessions`.

Provider selection, login/signup behavior, credentials, runtime session resolution, API and transport behavior, account-wide algorithms, authentication-state mutation, support/admin operation, and production activation remain separately governed. `ALSAMAD_API_ARCHITECTURE.md` and Product Architecture are unchanged.

### 9. Future inert implementation posture and non-authority

A later Owner-reviewed Roadmap crossing may consider only an empty, zero-real-row, runtime-inert, verifier-backed, rollback-safe implementation after a separate readiness audit and explicit Owner implementation authorization. That later crossing must name the exact migration, schema, journal, verification, acceptance, and rollback boundary. This ADR assigns none of them.

`PUBLIC ALSAMAD AUTHENTICATION SESSION PHYSICAL CONTRACT = APPROVED`.

`PUBLIC ALSAMAD AUTHENTICATION SESSION PERSISTENCE IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

This ADR grants physical-contract governance authority only. It grants no migration, schema/ORM implementation, persistence implementation, table creation, row or fixture, runtime reader/writer, credential/token, provider, login/signup, Recovery, API/transport, support/admin mutation, real identity or personal-data processing, production activation, deployment, staging, commit, push, or successor authority.

## Why alternatives were rejected

- **Provider or transport state as canonical session authority:** violates the approved PostgreSQL authority and provider/transport neutrality.
- **Session record ID as bearer credential:** collapses internal record identity into secret authority and risks leakage or replay.
- **Persisted status enum:** duplicates timestamp truth and can contradict expiry or revocation evidence.
- **Generation/version field now:** adds a second invalidation mechanism before runtime concurrency and serialization are governed.
- **`user_identity_id`:** incorrectly binds account authority to one replaceable authentication identity.
- **Raw token, token hash, or refresh representation:** prematurely decides credential lookup and rotation mechanics.
- **Device, IP, user-agent, or provider metadata:** is not necessary for the minimum authority contract and creates avoidable tracking and retention obligations.
- **Unique `user_id`:** would prohibit the concurrently valid, independently revocable session contexts required by `ADR-0015`.
- **Expiry or cleanup indexes now:** have no authorized runtime query or cleanup schedule and are speculative.
- **Audit fields in the operational row:** conflate current state with immutable, purpose-bound security evidence.

## Reversibility and ADR threshold

An unused zero-row implementation could initially be reversible, but session ownership, expiry, revocation, identifier separation, and lifecycle semantics become difficult to replace once real account access relies on them. Errors could create unbounded authority, ineffective revocation, account-state bypass, credential exposure, or unlawful tracking. This decision is material, security-sensitive, and data-shaping and therefore meets the Registry ADR threshold.

## Explicit exclusions

No implementation, SQL, migration, table, ORM/Drizzle declaration, journal modification, verifier/test, seed, fixture, row, runtime consumer, credential/token/hash/secret, provider selection/integration, login/signup, Recovery, API/route/middleware, cookie/header/serialization/CSRF mechanism, session resolution, support/admin mutation, real identity or personal data, retention duration, production activation, deployment, implementation file boundary, or successor unit is authorized.
