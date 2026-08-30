# ADR-0012: Public ALSAMAD Durable Account Root Physical Contract

**Registry entry:** `REG-0029` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-30. Architecture/physical-contract decision only; not implemented and no implementation is authorized.

This ADR depends on `REG-0028` and accepted `ADR-0011`. `ADR-0011` remains the authority for the durable-account/authentication separation, provider neutrality, Editorial Identity separation, multi-client reuse, and dependent-module lifecycle boundary. This ADR makes only the smallest durable account-root persistence contract exact.

## Context

Public ALSAMAD Identity architecture is `OPEN / APPROVED`, while implementation remains `BLOCKED / NOT AUTHORIZED`. `ADR-0011` deliberately left the physical identifier, fields, constraints, lifecycle representation, and persistence unresolved. The first implementation-crossing audit determined that an exact Database and Security/privacy contract must precede any implementation authorization and that the smallest eventual unit is a provider-neutral, runtime-inert durable account root only.

The existing Database Architecture names `users` as the conceptual durable shared-account candidate. Renaming it would create a second vocabulary without improving ownership. Repository conventions use plural `snake_case` table names, application-generated UUIDv7 business identifiers, `timestamptz` evidence, and checked text for small closed vocabularies.

## Decision

### 1. Exact physical root

The future physical root is exactly `users`. It has exactly four columns:

| Column | PostgreSQL type | Nullability and default | Contract |
| --- | --- | --- | --- |
| `id` | `uuid` | `PRIMARY KEY NOT NULL`; no database default | Application-generated UUIDv7; opaque, ALSAMAD-owned, immutable, provider/client/module independent, never derived from contact or provider data, and never reused. |
| `status` | `varchar(24)` | `NOT NULL DEFAULT 'active'` | Exactly `active`, `disabled`, `deletion_pending`, or `deleted`. It represents only root access/deletion lifecycle, not authentication, moderation, entitlement, or module state. |
| `created_at` | `timestamptz` | `NOT NULL DEFAULT current_timestamp` | Immutable UTC creation evidence. |
| `updated_at` | `timestamptz` | `NOT NULL DEFAULT current_timestamp` | UTC lifecycle-change evidence; changes only with a real `status` transition and must strictly increase. |

`ck_users__status` enforces the four closed values. The primary key is the only index. There is no status index or speculative lookup index because this contract authorizes no query or runtime consumer.

A future database trigger named `trg_users__lifecycle_integrity` must fail closed by rejecting mutation of `id` or `created_at`; rejecting timestamp-only or no-op updates; requiring a strictly later `updated_at` for every status change; allowing entry to `deleted` only from `deletion_pending`; and rejecting every transition out of `deleted`. No other transition graph, reactivation rule, grace period, appeal, retention duration, legal hold, hard-delete rule, or anonymization rule is decided here. This representation can support later governed disposition without deciding whether a terminal row is ultimately retained, anonymized, or physically removed.

### 2. Data minimization and ownership

The sole purpose of `users` is stable shared ALSAMAD account identity. It contains no email, phone, username, display name, avatar, locale, provider or provider subject, password, passkey, OAuth identity, credential, session, recovery data, preference, saved item, bookmark, reading position, private routine, presentation/profile field, marketing/analytics/engagement field, Editorial Identity, Talibeen field, or Talibeen reference.

Authentication linkage remains a separate deferred `user_identities` candidate. Sessions remain a separate deferred and not-yet-justified `user_sessions` candidate. Recovery is an architectural invariant, not a row or column in this root. Preferences and saved items remain Prepared/deferred.

### 3. Runtime-inert migration boundary

A later Roadmap authorization may consider one isolated additive migration for `users` only, plus the minimum established schema/journal/verification files that it names exactly. That future migration must create zero seed rows, perform no backfill, create no real account, add no outgoing or dependent foreign key, and include no auth/provider/session/recovery/module data. This ADR assigns no migration filename and authorizes no migration, ORM schema, table creation, file, test, or implementation.

The inert unit must have zero runtime readers and writers; no repository or service; no app, route, API, UI, server action, background job, auth runtime, provider, seed, or composition-root consumer; and no production side effect. A schema declaration or migration in the repository would not make Public Identity operational.

### 4. API no-surface boundary

The root is internal and absent from public identifiers, request contracts, response contracts, serialization, REST, GraphQL, RPC, server actions, routes, and clients. No endpoint or account service is created or authorized. Future external representation requires its own API, privacy, Security, and Roadmap crossing and must not expose raw persistence merely because the table exists.

### 5. Privacy and security acceptance

The root is personal-data-capable architecture even though its first possible implementation must contain zero user rows. Before any inert implementation is accepted, evidence must prove the exact four-column schema and constraints; UUIDv7/no-default identifier boundary; zero seed/backfill/real rows; no credentials, secrets, provider/contact/presentation/Talibeen data; no runtime imports or consumers; exact migration and file scope; PostgreSQL constraint/trigger behavior; rollback; and a scoped diff.

Real-user activation remains separately blocked pending lawful basis, privacy notice, retention, deletion completion, access/export, backup behavior, audit/logging, provider metadata, subprocessors/transfers, support access, jurisdiction obligations, threat/data-flow review, and applicable provider/mechanism decisions.

### 6. Dependent modules and deletion

This root creates no dependent-module foreign key and no cascade. Future Talibeen or other private modules may reference `users.id` only after separately governed ownership, reference, deletion, retention, legal/safety, cleanup, and completion contracts. Editorial Identity remains separate and is never a `users` profile or substitute root.

### 7. Rollback and release boundary

Before any consumer or real row exists, the eventual isolated unit must be removable by reverting its exact schema/migration/journal/verification changes. It requires no data migration, provider cleanup, session revocation, API compatibility work, route cleanup, module cleanup, or user-data recovery because none may exist.

`PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`. A later Owner-reviewed Roadmap crossing must name the exact implementation files, migration, tests, acceptance evidence, and rollback before work begins.

## Why alternatives were rejected

- **`accounts` as a new table name:** duplicates the already established `users` physical-candidate vocabulary without changing ownership semantics.
- **Provider subject, email, phone, or username as the root:** makes mutable external/contact identity the durable cross-module key.
- **Bundling `user_identities`:** introduces linking, uniqueness, recovery, and takeover behavior not required by an inert root.
- **Bundling `user_sessions` or recovery persistence:** depends on later provider/runtime/security choices.
- **Profile, preferences, or saved-item fields:** violates purpose limitation and expands beyond identity.
- **A status index:** has no authorized query and is speculative.
- **Only `active`/`disabled`:** cannot preserve the approved deletion-in-progress and terminal-completion distinction.
- **Freezing terminal hard delete, tombstoning, or anonymization:** would decide retention and user-rights policy without the required later evidence.

## Reversibility and ADR threshold

The unused, runtime-inert unit is initially reversible, but the physical durable root becomes difficult to replace once authentication identities, clients, or modules reference it. Identifier, lifecycle, and deletion semantics are therefore material and data-shaping and meet the Registry §7 ADR threshold.

## Explicit exclusions

No implementation; table, ORM schema, migration, journal change, test, repository, service, seed, row, API, route, UI, runtime import, deployment, or real-user processing; no authentication linkage, provider selection/integration, credential, session, recovery implementation, preference, saved item, profile/presentation field, Editorial linkage, Talibeen linkage/persistence, dependent FK, or cascade; no Core Release 1 scope/table-count change; and no implementation or completion authority.
