# ADR-0007: KE-2 Topic Vocabulary and Content Assignment Boundary

**Registry entry:** `REG-0015` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-13. Implementation not started.

This ADR records the physical decision for `M7.0-track / KE-2`. It authorizes no migration, schema mapping, code, seed data, runtime wiring, search expansion, editorial UI, provider access, or later Knowledge Engine phase. Implementation remains gated by `REG-0015` and the Roadmap's `M7.0-track / KE-2` acceptance contract.

## Context

KE-1 (`e073879`) is reversible, runtime-inert application code. Phase 2 of `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` instead requires an independently curated topic vocabulary and durable Quran/Devotional-to-topic assignments. Stable topic identity, duplicate prevention, endpoint integrity, curation history, and deletion restrictions cannot be enforced by the KE-1 in-memory layer.

The Release-1 catalog remains frozen at 30 tables. `ALSAMAD_DATABASE_ARCHITECTURE.md` sections 1, 2.1, and 10 permit separately approved later additive packages while expressly assigning the Knowledge Graph zero Release-1 tables. KE-2 therefore must not be counted as table 31 or 32 of Release 1.

The critical endpoint problem is that Quran ayahs are canonically owned by `quran_ayahs`, while authenticated devotional items are owned through `devotional_items` and `content_items`. A text discriminator plus opaque ID would not be a PostgreSQL-enforced relationship, and copying either owner into the Knowledge Engine would violate canonical ownership.

## Decision

### 1. Classification and ownership

KE-2 is a **later additive, non-Release-1 package** owned solely by the `knowledge` module. It adds exactly two tables, `topics` and `content_topics`, after the Release-1 schema dependencies they reference exist. The historical Release-1 count remains exactly 30.

The Knowledge Engine owns topic identity and topic assignments only. Quran continues to own `quran_ayahs`; Devotional continues to own `devotional_items` and their `content_items` roots; Editorial continues to own staff identity.

### 2. `topics`

`topics` is the independently managed controlled vocabulary:

- `id uuid` is an application-generated UUIDv7 primary key with no database default and is immutable.
- `canonical_key varchar(160)` is required, unique, lowercase, stable, and immutable.
- `localized_names jsonb` is required and contains a non-empty object from locale code to non-blank display name. A deferred constraint trigger rejects arrays/scalars, empty objects, blank values, non-string values, or keys absent from `locales.code`. The existing `enforce_locale_identity_immutability` trigger in `0001_global_locales_geography.sql` prevents `locales.code` updates. Since M3 permits deletion when no existing dependency restricts it, KE-2 uses one database-owned transaction advisory-lock protocol instead of inventing non-deletability. The topic insert/update trigger and locale `BEFORE DELETE` trigger both acquire exactly `pg_advisory_xact_lock(hashtextextended('alsamad:ke2:locale-integrity', 0))` before their respective validation/reverse-reference queries. Both functions first require `current_setting('transaction_isolation') = 'read committed'` and reject every other isolation level, ensuring a post-lock query sees any preceding commit. The single lock persists through transaction end, removes row/event ordering, prevents cross-row lock-order deadlocks, and closes reference-write/delete races. Its coarse scope is intentional because locale/topic vocabulary mutations are low-frequency editorial control-plane writes; normal reads take no lock. Referenced deletion fails, unreferenced deletion retains the existing M3 lifecycle, and no third table is added. Topic labels are discovery metadata, not copied religious content. Missing requested-locale text fails closed through the existing locale fallback contract; KE-2 does not invent a label.
- `status varchar(16)` is required, defaults to `draft`, and is restricted to `draft`, `approved`, or `retired`.
- `created_by uuid` is required and references `editorial_users.id` with update/delete restricted.
- `approved_by uuid` and `approved_at timestamptz` are nullable together; `approved` requires both, while `draft` requires both null. `retired` preserves prior approval evidence when present.
- `created_at` and `updated_at` are required UTC `timestamptz`, defaulting to `current_timestamp`.

Canonical identity and creation evidence never change. Renaming is a localized-name update. Canonical-key correction creates a new topic and retires the old one; it never mutates the old key. Physical deletion is restricted once any assignment references the topic. Approved/retired topics are not hard-deleted through ordinary application writes.

### 3. `content_topics`

`content_topics` is the durable assignment edge:

- `id uuid` is an application-generated UUIDv7 primary key with no database default and is immutable.
- `topic_id uuid` is required and references `topics.id` with update/delete restricted.
- `quran_ayah_id uuid` is nullable and references `quran_ayahs.id` with update/delete restricted.
- `devotional_item_id uuid` is nullable and references `devotional_items.id` with update/delete restricted.
- A check requires **exactly one** of `quran_ayah_id` and `devotional_item_id` to be non-null. No generic module/type string or unvalidated polymorphic identifier exists.
- A constraint trigger requires any `devotional_item_id` to resolve through `devotional_items.content_item_id` to `content_items` with `owning_module = 'devotional'` and `content_type = 'dhikr'`. This deliberately limits KE-2 Devotional participation to Adhkar and excludes authentic Dua and Editorial General Dua.
- `weight numeric(4,3)` is required, defaults to `1.000`, and is checked from `0.000` through `1.000` inclusive. It is advisory ordering metadata only and cannot affect authenticity, verification, or publication.
- `review_state varchar(16)` is required, defaults to `draft`, and is restricted to `draft`, `approved`, or `rejected`.
- `curated_by uuid` is required and references `editorial_users.id` with update/delete restricted.
- `reviewed_by uuid`, `reviewed_at timestamptz`, and `review_notes text` are nullable. `approved`/`rejected` require reviewer and timestamp; `draft` requires both null. Reviewer must differ from curator for `approved` assignments. Notes are optional but must be non-blank when present.
- `created_at` and `updated_at` are required UTC `timestamptz`, defaulting to `current_timestamp`.

Draft assignments may exist before their endpoint is publication-eligible. A deferred constraint trigger fails every insert/update that would leave an assignment approved unless canonical owner state is currently eligible. Quran requires the ayah and its surah to be `published` plus a currently active Arabic Quran release for that surah's `work_id` whose full live eligibility chain passes Database Architecture §5.3.12, including eligible text for the referenced ayah. Adhkar requires the canonical Devotional chain, `content_type = 'dhikr'`, and at least one revision with `publication_state = 'published'` and `verification_state = 'source_verified'`. Missing evidence fails closed. The approval transaction locks the matched owner rows; KE-2 stores no copy of these owner states and does not prevent later canonical safety transitions.

The exact partial unique indexes are `(topic_id, quran_ayah_id) WHERE quran_ayah_id IS NOT NULL AND review_state <> 'rejected'` and `(topic_id, devotional_item_id) WHERE devotional_item_id IS NOT NULL AND review_state <> 'rejected'`. Thus at most one draft/approved current row exists per canonical pair, while immutable rejected history may coexist with a corrected replacement. A `BEFORE UPDATE` guard rejects every update when `OLD.review_state = 'rejected'`; there is no exception for timestamps, weight, identity/endpoints, curator/reviewer, notes/evidence, or metadata. The replacement receives a new identity and lifecycle. Indexes on each non-null endpoint and `(topic_id, review_state)` support bounded lookup and review without becoming search infrastructure.

Assignments are visible to future consumers only in `approved` state, while the topic is `approved`, and while the canonical endpoint still passes the same owner-controlled eligibility predicate. Later Quran withdrawal/unpublication, release deactivation, rights failure, or other §5.3.12 eligibility loss, and later Adhkar withdrawal, supersession, or absence of a published `source_verified` revision, make the assignment immediately ineligible for reads without altering its historical row or blocking the owner transition. Rejection preserves the review decision. Correction creates a replacement assignment and rejects the incorrect one; endpoint/topic identity is immutable. Deletion of topics, canonical endpoints, or staff identities is restricted while referenced.

### 4. Runtime, data, and migration rules

- The initial migration creates empty tables only. No topic, Quran assignment, Adhkar assignment, religious content, or staff row is seeded.
- KE-2 remains runtime-inert: no application route, component, script composition root, runtime search, related-content band, admin surface, or AI consumer imports it.
- The migration is new, reviewed, additive, and forward-only. Committed migrations `0000` through `0009` and the reserved Release-1 migration sequence remain byte-unchanged. The KE-2 migration number is assigned only when its prerequisites and execution are authorized; it does not take `0010`, which is reserved for M6.
- Migration failure rolls back the whole two-table unit. Verification fixtures are synthetic, non-religious, transaction-scoped, and rolled back. There is no destructive down migration in production.
- Runtime absence of the package or approved rows is an honest empty state, never fabricated content or inferred assignments.

## Why alternatives were rejected

- **Generic `(module, kind, id)` endpoints:** rejected because PostgreSQL cannot enforce the referenced owner with a real FK.
- **Copying Quran/Devotional identity into a Knowledge node table:** rejected because it duplicates canonical ownership and would require a third table outside Phase 2.
- **One assignment table per owning module:** rejected because Phase 2 authorizes exactly one content-to-topic edge table and the two nullable FKs plus exactly-one check preserve real integrity.
- **A separate topic-name table:** rejected because Phase 2 is frozen to two tables. Bounded, locale-key-validated JSONB is permitted discovery metadata and stores no canonical religious text.
- **Free-text tags:** rejected because they have no stable, localized identity.
- **Including Duas through `devotional_items`:** rejected because Duas governance is unresolved and explicitly excluded from KE-2.
- **Adding KE-2 to the Release-1 30:** rejected because the Database Architecture classifies the Knowledge Graph as zero Release-1 tables and provides a lawful later additive path.

## Reversibility and ADR threshold

The decision is architecturally material because it adds persistent cross-module classification state and a new ownership boundary. Reversal after curated topic IDs and religious-content assignments exist would require data migration, cross-module reconstruction, and content-integrity review. Both parts of `ALSAMAD_DECISION_REGISTRY.md` section 7 are therefore met.

Before data exists, rollback is limited to transaction rollback or abandonment of the unexecuted migration. After implementation, corrections are additive/retiring rather than destructive rewrites.

## Explicit exclusions

Collections, source references, generic `knowledge_edges`, Articles/Guides, Hadith, Talibeen, Duas, topic/entity graphs, AI suggestions, semantic search, the AI Search Assistant, runtime search expansion, related-content UI, editorial/admin UI, seed data, provider/network/credential work, M5 Gate 4/5, canonical ownership changes, and every Knowledge Engine phase after Phase 2 remain unauthorized.
