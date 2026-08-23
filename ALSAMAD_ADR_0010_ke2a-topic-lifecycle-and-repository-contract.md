# ADR-0010: KE-2A Topic Lifecycle and Repository Contract

**Registry entry:** `REG-0024` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-23. Implemented at commit `c1757790f579fd34838d9136c9420aa8168e9a2a`; the architecture decision remains unchanged.

This ADR supplements `ADR-0009`; it does not supersede it. `REG-0022`/`ADR-0009` remain the current authority for the KE-2A/KE-2B split, sequencing, dependency, migration-atomicity, and rollback decision. Historical/Superseded `ADR-0007` §§1–3 remain incorporated through `ADR-0009`. This ADR makes only previously unspecified KE-2A lifecycle, timestamp, active-editor, repository-operation, collision, and error behavior exact. It changes no `topics` column/type/default/FK/index/localization/UUIDv7 rule, no KE-2B or `content_topics` rule, and no migration number.

## Context

The KE-2A preflight found two implementation blockers. First, the authorized six-file boundary omitted `drizzle/meta/_journal.json`, although every committed Drizzle migration is registered there and repository verification treats that journal as established migration bookkeeping. Second, the incorporated `topics` specification named the three lifecycle states and evidence pairing but did not completely define legal transitions, terminality, deterministic lifecycle timestamps, the minimum repository operations, or stable failure categories. Implementing those gaps by inference would make persistent historical behavior depend on local implementation choice.

The journal correction is Roadmap boundary metadata, not architecture. The persistent lifecycle and evidence rules are architecturally material and data-shaping, so `REG-0024` and this supplemental ADR satisfy the Registry §7 threshold while preserving `ADR-0009` intact.

## Decision

### 1. Lifecycle and approval evidence

The complete allowed graph is:

```text
draft ───────→ approved
  │               │
  └──────→ retired ←┘
```

Only `draft → approved`, `draft → retired`, and `approved → retired` are allowed. `approved → draft`, `retired → draft`, `retired → approved`, `retired → retired`, and every reactivation of a retired topic are forbidden. Retirement is terminal.

Approval sets `approved_by` and `approved_at`. Retiring an approved topic preserves both fields unchanged. Retiring a draft topic leaves both null. Retirement never creates or rewrites approval evidence. Localized-name replacement is permitted only while a topic is draft or approved and only when the complete map actually changes.

Canonical-key correction never updates `canonical_key`. One atomic repository operation locks and retires the old draft/approved topic and creates a replacement with a new application-generated UUIDv7, its own `created_by`, `status = 'draft'`, and null `approved_by`/`approved_at`. A retired topic cannot be used as the old side of another correction.

### 2. Deterministic timestamps

`created_at` and the initial `updated_at` are database-generated through their existing `current_timestamp` defaults. `created_at` is immutable. `approved_at` is database-generated as part of approval; callers do not supply lifecycle timestamps.

Every actual localized-name replacement, approval, or retirement receives one database-owned lifecycle-event timestamp and strictly advances `updated_at`. Approval uses that same event timestamp for both `approved_at` and `updated_at`. Retirement changes `updated_at` only and preserves approval evidence. A no-op mutation is rejected before timestamp assignment and changes nothing.

The exact event expression is:

```sql
GREATEST(clock_timestamp(), OLD.updated_at + interval '1 microsecond')
```

The lifecycle trigger assigns this value to `NEW.updated_at`; on `draft → approved` it also assigns the same value to `NEW.approved_at`. It rejects application-supplied changes to `created_at`, `updated_at`, or `approved_at` outside those database-owned assignments. This expression is PostgreSQL-native, uses the smallest increment at PostgreSQL timestamp precision, and guarantees `NEW.updated_at > OLD.updated_at` even when the clock has not advanced.

For canonical replacement, the old row receives its retirement event timestamp; the new row receives fresh default-generated `created_at`/`updated_at` and null approval fields.

### 3. Active editor and transaction ownership

Each create, localized-name replacement, approval, retirement, and canonical-key correction verifies the required `editorial_users` actor has `status = 'active'` inside the same repository-owned `READ COMMITTED` transaction as the write. Lifecycle mutations acquire a row lock on the target topic before checking its state. This is the already-governed Editorial Identity consumer rule, not a redesign of `editorial_users`.

Read-by-ID is an ordinary read, accepts every topic lifecycle state, requires no actor, and acquires neither the locale-integrity advisory lock nor a topic row lock. The existing database-owned locale-integrity protocol remains exactly as incorporated through `ADR-0009`.

### 4. Minimum repository operations

The persisted KE-2A model is named `TopicRecord`. It is distinct from the existing KE-1 presentation-only `KnowledgeTopic`; `src/lib/knowledge/types.ts` remains unchanged.

The repository exposes only these responsibilities:

1. **Create topic:** accept an application-generated UUIDv7, canonical key, complete localized-name map, and `createdBy`; create draft only; return `TopicRecord`.
2. **Read topic by ID:** return any-state `TopicRecord` or absence; provide no list/search/runtime behavior.
3. **Update localized names:** replace the complete map for draft/approved only; require an actual change and an active actor; return the updated record.
4. **Approve topic:** transition draft to approved using an active approving actor and database-owned evidence time; return the approved record.
5. **Retire topic:** transition draft/approved to terminal retired using an active actor while preserving approval evidence; return the retired record.
6. **Correct canonical key:** in one repository-owned `READ COMMITTED` transaction, retire the old draft/approved topic and create the new draft replacement; return both records.

Generic unrestricted CRUD is forbidden: no arbitrary patch/update, canonical-key mutation, identity/creator/`created_at` mutation, ordinary hard delete, generic status setter, retired-row resurrection, list/search API, or runtime import is authorized.

### 5. Minimum error contract

KE-2A uses one small topic-specific typed error contract with stable categories:

`validation` · `not_found` · `invalid_transition` · `canonical_key_conflict` · `inactive_editorial_actor` · `database_invariant`

- Pure input failure maps to `validation`.
- Missing mutation target maps to `not_found`.
- Forbidden lifecycle edge or lifecycle no-op maps to `invalid_transition`.
- Canonical-key uniqueness collision maps to `canonical_key_conflict`.
- Missing or inactive required actor maps to `inactive_editorial_actor`.
- Deferred locale failure, unsupported isolation, locking/concurrency invariant failure, or unexpected governed-constraint failure maps to `database_invariant`.

Read-by-ID absence returns absence, not `not_found`. A raw database error does not escape when it maps deterministically to one of these categories. An unexpected underlying database/infrastructure cause may be retained internally as the cause of `database_invariant`. This creates no global error framework.

### 6. Journal boundary

The exact implementation boundary is corrected by `REG-0024` and the Roadmap to include `drizzle/meta/_journal.json`. KE-2A implementation may append exactly one entry registering its mechanically assigned migration. Every existing entry remains byte-unchanged. The append contains only the next index, established version/breakpoint fields, a mechanically monotonic timestamp, and the tag derived exactly from the execution-time migration filename.

No number is assigned here. `0010` remains reserved for M6.1. Observation that `0012` would be lawful at the 2026-08-23 baseline is context only; execution recomputes from the then-authoritative state.

## Why alternatives were rejected

- **Leaving transition direction to repository code:** rejected because persistent historical meaning would depend on an unrecorded implementation choice.
- **Allowing retired-topic reactivation:** rejected because it weakens terminal history and is unnecessary when replacement is already the governed correction model.
- **Application-generated lifecycle timestamps:** rejected because database-owned event time provides one authoritative approval/update instant and avoids clock disagreement.
- **Generic CRUD:** rejected because it can bypass immutable identity, terminal retirement, evidence preservation, and canonical replacement.
- **Reusing KE-1 `KnowledgeTopic`:** rejected because that presentation-only type does not represent the persisted KE-2A lifecycle/evidence model and changing it would risk KE-1.
- **Omitting the Drizzle journal append:** rejected because it would leave the migration outside established committed bookkeeping and make the exact staged boundary inconsistent with repository precedent.

## Reversibility and ADR threshold

Before implementation, reversal is documentation-only. After topic rows exist, changing terminality, approval-history preservation, or timestamp meaning would require data review/migration and could reinterpret curated historical evidence. The decision is therefore architecturally material and data-shaping/content-integrity sensitive under Registry §7.

## Explicit exclusions

This ADR authorizes no implementation by itself and no KE-2B, `content_topics`, KE-3 or later phase, collection/reference/Duas adapter, generic edge, runtime/search/UI/provider/network/credential/AI work, seed data, M5/M6 status change, migration-number assignment, or prototype adoption. `REG-0022`/`ADR-0009` remain current for the split and sequencing decision; KE-2B remains `NOT STARTED / BLOCKED` and separately gated.
