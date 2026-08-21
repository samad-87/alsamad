# ADR-0008: Editorial Identity Foundation

**Registry entry:** `REG-0016` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-13. Implemented — commit `a2604ca`.

This ADR fixes the durable internal staff identity representation for the independently executed `M7-prerequisite / Editorial Identity Foundation`. It authorizes no migration, schema/code change, row, authentication, authorization, runtime wiring, administration surface, Phase 7 workflow, KE-2 implementation, or provider integration by itself.

## Context

The frozen Release-1 catalog already includes `editorial_users` because every review and privileged content action must identify a responsible human. `REG-0015` and `ADR-0007` make that dependency concrete for KE-2 through `topics.created_by`, `topics.approved_by`, `content_topics.curated_by`, and `content_topics.reviewed_by`.

Staff identity must remain stable when credentials, authentication providers, roles, contact details, or public-account participation change. Persisting a provider subject, email, username, or public-user ID as the durable Editorial FK would couple historical accountability to a mutable or optional external lifecycle. Conversely, requiring all Phase 7 workflow tables before creating the identity root delays an already-approved Release-1 integrity primitive without adding safety.

## Decision

### 1. Identity and ownership

`editorial_users` is owned solely by Editorial. Its `id` is the sole durable internal staff subject and the only identity future accountable domain FKs use.

`id` is `uuid PRIMARY KEY NOT NULL`, application-generated UUIDv7, immutable, and has no database default. Primary-key uniqueness is the unique-staff-subject guarantee. There is no second `staff_key`, `subject`, username, email, display name, provider subject, or public-user FK.

### 2. Exact physical contract

The table has exactly four columns:

| Column       | Contract                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| `id`         | `uuid PRIMARY KEY NOT NULL`; application-generated UUIDv7; immutable; no database default     |
| `status`     | `varchar(16) NOT NULL DEFAULT 'disabled'`; exactly `active` or `disabled`                     |
| `created_at` | `timestamptz NOT NULL DEFAULT current_timestamp`; immutable                                   |
| `updated_at` | `timestamptz NOT NULL DEFAULT current_timestamp`; changes when and only when `status` changes |

The allowed lifecycle is `disabled → active → disabled`, with later `disabled → active` reactivation permitted. Status is authentication-independent. A database trigger enforces that a status transition and a strictly later `updated_at` occur atomically; timestamp-only changes, no-op timestamp fabrication, mutation of `id`/`created_at`, and a status change without valid timestamp advancement fail closed.

The table has no outgoing foreign key. It creates zero rows and has no production bootstrap identity.

### 3. Historical accountability and deletion

Disabled identities remain valid historical FK targets. Disablement never deletes, rewrites, or invalidates prior attribution. Future consumers must reject a disabled actor for every new accountable action at their own database-enforced write boundary; this prerequisite does not create those consumer tables or triggers early.

Every future FK uses `ON UPDATE RESTRICT ON DELETE RESTRICT`. No cascade into accountable evidence is permitted. Once referenced, disablement replaces deletion. This unit authorizes no production hard-delete application capability.

### 4. Authentication boundary

Authentication identity is separate from durable Editorial identity. A future, separately governed auth-link relation may associate a verified provider/authentication identity with `editorial_users.id`. Provider namespace and external subject belong only in that future relation. Changing authentication provider, credential, email, or public-account state must never change `editorial_users.id` or historical FKs.

This decision authorizes no auth-link table, provider selection, public-user relationship, credential, password, passkey, MFA factor, recovery record, role, capability, scope, grant, session, or profile field.

### 5. Release and sequencing

`editorial_users` is already one of the frozen 30 Release-1 tables; early implementation changes sequencing, not scope or count. Physical count moves from 16 of 30 to 17 of 30. If M6 later adds its four already-counted tables, the physical count becomes 21 of 30.

The exact future implementation boundary is `src/db/schema.ts`, one mechanically numbered `drizzle/<next-authorized-forward-number>_editorial_identity_foundation.sql`, `drizzle/meta/_journal.json`, and `scripts/db-verify.mjs`. The journal file is authorized only for the single append required to register that one migration under the established Drizzle convention; unrelated journal rewriting is prohibited, and every existing journal entry remains unchanged.

The implementation uses one new forward-only migration numbered mechanically from the authoritative repository state at execution. It cannot use, rename, or displace M6's reserved `0010_devotional_content_foundation.sql`, and every existing migration remains byte-immutable. At baseline `ac12718`, `0011` is the expected non-reserved context, not a permanently preclaimed filename.

## Why alternatives were rejected

- **Provider subject as primary identity:** couples historical accountability to an external provider and makes provider replacement data-shaping.
- **Public `users.id` as staff identity:** violates the explicit separation between dedicated staff identity and optional public accounts.
- **A second human-readable staff key:** creates a speculative competing identity namespace with no proven assignment or rename authority.
- **Email, username, or display name:** mutable presentation/contact attributes are not durable identity.
- **Credentials, roles, grants, or sessions on this table:** mixes identity with authentication or authorization and prematurely implements Phase 7.
- **Terminal disablement:** repository authority requires revocable access but does not make identity disablement irreversible; reactivation preserves one historical human identity.
- **Waiting for all Phase 7 tables:** unnecessarily couples a minimal FK root to workflows and permissions it does not require.

## Reversibility and ADR threshold

This is architecturally material and difficult to reverse. Once cross-module content-integrity records reference staff UUIDs, replacing the identity root or conflating it with authentication identity requires cross-module migration and risks historical attribution. The decision therefore meets both parts of the Registry §7 threshold.

## Explicit exclusions

`editorial_role_grants`, `review_records`, `publication_events`, `audit_events`, auth linking, public identity, authentication/MFA/session/recovery data, roles/capabilities/scopes/grants, staff seed/bootstrap accounts, Admin API/UI, editorial workflows, KE-2 implementation, M6/Devotional work, Quran/provider work, M5 Gate 4/5, Phase 7 completion, and later Knowledge Engine phases remain unauthorized.
