# ADR-0014: Public ALSAMAD Authentication Identity Linkage Physical Contract

**Registry entry:** `REG-0032` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-09-01; corrected by explicit Owner decision — 2026-09-02. Provider-neutral physical-contract governance only; implementation and real-data processing are not authorized.

## Context

`REG-0028`/`ADR-0011` establish one durable ALSAMAD account distinct from authentication identities, sessions, recovery, Editorial Identity, and dependent-module profiles. `REG-0029`/`ADR-0012` freeze the minimal `users` root, and implemented `REG-0030` records its zero-row runtime-inert persistence as COMPLETE/PASS. `REG-0031`/`ADR-0013` then establish the provider-neutral linkage architecture: one account may have multiple authentication identities, one authentication identity may resolve to at most one account, ambiguous or cross-account mappings fail closed, mutable contact data never proves identity equivalence, and automatic merge, transfer, reassignment, or takeover is prohibited.

Those invariants require an ALSAMAD-owned durable mapping. Provider/runtime-only state cannot provide one stable cross-provider account reference, preserve ownership continuity while linkage evidence is retained, or enforce fail-closed non-reassignment under ALSAMAD's database authority. This ADR therefore freezes the smallest persistence contract capable of carrying that mapping while remaining empty, provider-neutral, runtime-inert, API-inert, session-independent, recovery-independent, and reversible while unused.

## Decision

### 1. Persistence necessity and ownership

A dedicated `user_identities` entity is justified. It owns only the durable mapping between one opaque external authentication identity and one existing `users.id`. It is not a credential store, provider account mirror, contact directory, session store, recovery store, public identity, profile, or audit-event system.

ALSAMAD owns the mapping and its stable row identity. A provider or authenticator remains authoritative only for its own future proof-of-control mechanism and subject semantics. No provider, adapter, runtime component, or mutation path is selected or authorized here.

### 2. Exact physical contract

The future physical table is exactly `user_identities` with exactly seven columns:

| Column | PostgreSQL type | Nullability and default | Contract |
| --- | --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY NOT NULL`; no database default | Application-generated UUIDv7; immutable, opaque, ALSAMAD-owned linkage-row identity; never reused. |
| `user_id` | `uuid` | `NOT NULL`; no default | Immutable reference to `users.id`. |
| `authenticator_namespace` | `varchar(128)` with `C` collation | `NOT NULL`; no default | ALSAMAD-governed lowercase ASCII namespace token identifying a future authenticator/provider namespace, not a selected provider. |
| `subject` | `text` with `C` collation | `NOT NULL`; no default | Opaque external authentication subject stored exactly as supplied by a future governed adapter after provider-specific validation; no universal provider maximum, case folding, trimming, Unicode normalization, contact inference, hashing, or tokenization is decided here. |
| `status` | `varchar(16)` | `NOT NULL`; no default | Explicitly supplied as exactly `active` or `retired`; operational linkage state only. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT current_timestamp` | Immutable UTC evidence that the durable mapping row was first created. |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT current_timestamp` | UTC evidence of the latest real `status` transition; changes only with a status transition and must strictly increase. |

`ck_user_identities__id_uuidv7` enforces UUIDv7 and the RFC variant. `ck_user_identities__authenticator_namespace` requires the namespace to match exactly `[a-z0-9][a-z0-9._-]{0,127}`. The 128-character bound applies only to ALSAMAD's own controlled canonical namespace vocabulary; it claims no provider identifier or subject limit. `ck_user_identities__subject_nonempty` rejects an empty subject. Namespace and subject comparison is case-sensitive under PostgreSQL `C` collation. `text` avoids inventing a universal provider-subject maximum while keeping the subject opaque; provider-specific limits, validation, representation, and normalization remain later research. Status has no default because omission must not silently create a resolution-eligible mapping.

All seven columns have a distinct governed purpose: `id` is the stable ALSAMAD linkage-row reference; `user_id` is durable-account ownership; namespace plus subject is the provider-neutral canonical authentication-identity key; `status` distinguishes current resolution eligibility from retained inactive ownership evidence; `created_at` records first row creation; and `updated_at` records only the latest current-state transition. No audit/history/provider/contact column is added.

### 3. Durable-account relationship

`fk_user_identities__user` references `users(id)`. The FK is `NOT DEFERRABLE` with `ON UPDATE RESTRICT` and `ON DELETE RESTRICT`. `user_id` is non-nullable and immutable: a linkage row can never be orphaned, moved to another durable account, or preserved by nulling its owner.

Restriction, `deletion_pending`, and `deleted` are account-root lifecycle states and do not rewrite linkage ownership. The FK remains intact for every retained root row. A future runtime must fail closed according to current account state; no access behavior is authorized here. Physical removal of a referenced `users` row is blocked until separately governed linkage disposition, security lineage, retention, deletion-completion, and legal-hold rules have been satisfied.

### 4. Uniqueness and cardinality

`uq_user_identities__authenticator_subject` is an unconditional unique constraint on (`authenticator_namespace`, `subject`). It applies to every retained active or retired row. PostgreSQL, not application logic, therefore serializes concurrent attempts and guarantees that one retained external authentication identity has at most one durable mapping and cannot be reassigned to another account by inserting a replacement row while that evidence exists.

The constraint governs retained rows only. If later separately governed lawful erasure or retention expiry deletes the row, this table no longer retains the canonical key and cannot itself enforce post-erasure non-reassignment. Deletion does not authorize a new mapping. Provider-subject recycling, verified provider reassignment, account-deletion edge cases, or any other exceptional ownership transition require separate provider-specific research, proof, Security/privacy governance, and immutable audit evidence before runtime authorization. Without that authority, any attempted or ambiguous conflict fails closed. No permanent denylist, hash, tombstone, or other indefinitely retained identifier is approved.

No uniqueness constraint exists on `user_id`; one durable account may have multiple authentication identities. `ix_user_identities__user_id` is the only non-unique secondary index and exists to support FK/account-disposition integrity and later proof that an account's linkage rows have been addressed. The primary-key index, the unique-constraint index, and this FK index are the only indexes.

### 5. Lifecycle, unlink, replacement, and relink

The physical lifecycle is a retention-bounded inactive-record model:

- `active` means only that the mapping is physically eligible for a future separately governed resolution path.
- `retired` means the mapping is physically ineligible for resolution but remains associated with the same account while the row is lawfully retained.
- hard deletion is not part of the ordinary unlink contract;
- a retired row may be returned to `active` only as the same immutable row, for the same immutable account, namespace, and subject, through a future separately governed relink operation;
- replacement uses a different row for a different canonical (`authenticator_namespace`, `subject`) and retires the prior row; no predecessor column is added.

A future trigger named `trg_user_identities__integrity` must reject mutation of `id`, `user_id`, `authenticator_namespace`, `subject`, or `created_at`; reject timestamp-only and no-op updates; and require a strictly later explicitly supplied `updated_at` for every actual `status` transition. It does not authorize a mutation caller.

While retained, the row preserves stable ownership continuity and blocks reassignment through this table, but it is not a complete security audit log. `updated_at` records only the latest current-state transition; it does not preserve the number or timestamps of prior transitions, actor, reason, proof, request context, or immutable event history. Before any real unlink, replacement, or relink, separate Security/privacy/runtime governance must define and authorize immutable event evidence, actor/reason/proof metadata, access, retention, deletion, and legal-hold treatment. Until that later audit contract exists, no real lifecycle mutation is authorized.

Retention duration, lawful erasure, deletion completion, legal holds, backups, and jurisdiction-specific obligations remain later governance. Lawful deletion of a retained row removes this table's canonical ownership evidence and its uniqueness protection. It does not automatically authorize reassignment; absent separate exceptional-reassignment authority, later conflict or insufficient ownership evidence fails closed. Provider subject recycling is not modeled or supported by this contract.

### 6. Security and audit boundary

The linkage table contains only current operational state plus minimum retention-bounded ownership evidence. It contains no actor, IP address, user agent, request, proof, reason, support action, risk score, assurance detail, event history, or provider payload. Those are not added speculatively and remain a later purpose-bound audit/security subsystem decision.

The unconditional canonical-key uniqueness across retained rows, immutable account assignment, retained inactive record, restrictive FK, and fail-closed status model are the database anti-takeover boundary while evidence exists. Collision or duplicate insertion must fail; the table contains no conflict row and does not choose an account. Privileged/support read or mutation access, enumeration behavior, logging, encryption, hashing, tokenization, and subject-display policy remain unauthorized pending provider, threat, privacy, and operational research. Provider subjects and `users.id` remain internal sensitive identifiers and must not be serialized or exposed as public identifiers.

### 7. Data minimization and privacy boundary

The seven-column contract contains no email, phone, username, display name, profile/contact metadata, provider contact attribute, token, credential, password, passkey, public key, secret, code, session identifier, recovery data, assurance claim, provider payload, access token, refresh token, analytics, marketing data, Editorial identity, Talibeen data, or other module data.

Provider-neutral zero-row decisions—stable ownership while rows are retained, column shape, retained-row canonical uniqueness, FK behavior, active/retired representation, indexes, inertness, and rollback—are safe to settle now. Provider subject guarantees, limits, validation and normalization, secrecy representation, encryption/hashing/tokenization, provider metadata, subject recycling, exceptional reassignment, assurance, operational unlink/relink, and mechanism behavior require later provider/security research. Lawful basis, notice, purpose confirmation, retention duration, erasure, deletion completion, access/export, correction, backup treatment, audit/support access, subprocessors, transfers, jurisdiction obligations, and production threat/data-flow approval must be settled before any real authentication identity is stored or processed.

This physical contract is personal-data-capable architecture but authorizes no personal-data processing.

### 8. Runtime-inert implementation possibility

A later Owner-reviewed Roadmap crossing may consider one isolated additive migration for this exact table plus the minimum established schema, journal, and PostgreSQL verification files it names. Any such later unit must create zero seed, backfill, fixture, real, or production rows and have zero repository, service, API, route, UI, server action, provider, session, recovery, background, or other runtime consumer. This ADR assigns no migration number or implementation file boundary and authorizes no implementation.

Future implementation acceptance would have to prove the exact seven columns, types, namespace length, absence of a subject length bound, absence of a status default, collation, checks, immutable fields, status transitions, UUIDv7 boundary, unconditional concurrency-safe canonical uniqueness across retained active and retired rows, non-null restrictive non-deferrable FK, exact three-index boundary, absence of prohibited fields, isolated migration/journal scope, zero retained rows, zero runtime/API/provider/session/recovery consumers, quarantine preservation, and rollback evidence.

### 9. Reversibility

Before any consumer or real row exists, a later isolated implementation remains reversible through review of its exact unused schema/migration/journal/verification boundary. Migration execution must be atomic. Once a migration is committed or applied, repository history must not be rewritten; removal after application would require a separately reviewed forward cleanup migration and proof that `user_identities` is empty and unconsumed. No rollback SQL is authorized here.

After real mappings or consumers exist, removal or reshaping is not presumed reversible and requires data disposition, provider, security/audit, API/runtime, user-rights, and operational governance.

## Alternatives considered and rejected

- **No ALSAMAD persistence / provider-only mapping:** cannot preserve a provider-neutral durable account mapping or enforce ALSAMAD-owned fail-closed ownership continuity while evidence is retained.
- **Provider subject as `users.id`:** collapses replaceable authentication identity into the durable account root.
- **Email, phone, username, or display identity as the key:** mutable contact/presentation data is not proof of ownership and creates collision/takeover risk.
- **Application-only uniqueness:** does not close concurrent insertion races at the authoritative database boundary.
- **Partial uniqueness for active rows only:** would allow an identity with a retained retired record to be inserted against another account and violate retention-bounded ownership continuity.
- **Hard-delete-on-ordinary-unlink:** erases retained ownership evidence and permits silent reuse before retention, audit, and deletion obligations are governed. This does not prohibit later separately governed lawful erasure or retention expiry.
- **A permanent denylist or forever tombstone:** would decide indefinite identifier retention without privacy/legal authority and is expressly rejected.
- **`varchar(512)` subject:** invents an unsupported universal provider-subject maximum; unbounded `text` with deterministic `C` collation preserves provider neutrality.
- **Defaulting status to `active`:** omission could silently create a resolution-eligible row; future creation must supply explicit lifecycle intent.
- **Immutable append-only event log in this table:** conflates operational resolution state with a purpose-bound security audit subsystem.
- **Predecessor/replacement columns:** add lineage semantics not needed to enforce the canonical mapping; detailed event lineage belongs to later audit governance.
- **Provider-specific normalization, hashing, encryption, or tokenization now:** cannot be chosen safely without provider format, threat, lookup, collision, and operational research.
- **Contact, credential, session, recovery, or assurance columns:** violate purpose limitation and the established bounded-context separation.

## Implementation separation and release boundary

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE ARCHITECTURE = OPEN / APPROVED`.

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE PHYSICAL CONTRACT = APPROVED`.

`PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

Provider integration, sessions, recovery, APIs, runtime access, real authentication identity data, real personal-data processing, and broader Public ALSAMAD Identity implementation remain `BLOCKED / NOT AUTHORIZED`. A separate Owner-reviewed Roadmap implementation crossing is mandatory before any schema or verification work.

## Explicit exclusions

No SQL, table creation, migration, ORM/Drizzle declaration, journal modification, verifier/test, seed, backfill, row, fixture, provider selection/integration, OAuth/OIDC/passkey/password/email/SMS mechanism, credential, token, signup/login, session, recovery, API, route, server action, serialization, repository, service, runtime reader/writer, background job, account creation, real authentication identity, contact data, real personal-data processing, privileged/support access, audit-event implementation, Editorial linkage, Talibeen linkage, preference, saved item, deployment, implementation file boundary, staging, commit, push, or next implementation unit is authorized.
