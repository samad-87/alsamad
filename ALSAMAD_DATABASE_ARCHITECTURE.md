# Alsamad — Database Architecture

**Status:** Approved Release 1 database architecture; documentation only

**Authoritative product source:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`

**Database:** PostgreSQL
**Application mapping:** Drizzle ORM
**Migration model:** Reviewed, forward-only SQL migrations

This document defines the smallest durable Release 1 schema and the additive expansion boundaries for later modules. It does not authorize implementation of any table, migration, provider, or later product module.

# 1. Scope and Status

| Status | Meaning |
| --- | --- |
| **Release 1** | A physical table required by an approved initial-release journey and justified as a durable integrity boundary. |
| **Prepared** | A documented capability or additive schema package that is not physically created in Release 1. |
| **Approved Later Module** | Approved product architecture on a separately authorized release track; zero Release 1 tables. |
| **Future / Research** | Isolated design requiring evidence, licensing, safety validation, or a later decision; zero Release 1 tables. |

Release 1 serves guests in Arabic and English while remaining unlimited-language by architecture. It includes the Quran reader, authenticated duas and adhkar, visibly separated Editorial General Duas, prayer and Hijri configuration, Muslim events, deterministic search, source provenance, and the minimum editorial and audit integrity needed to publish safely.

Authentication, synchronized preferences, bookmarks, and reading position remain Prepared because the product architecture marks their Release 1 exposure as a pending decision. Tasbeeh and ordinary display preferences remain local-first. Hadith, Talibeen Al-Halal, subscriptions, Alsamad Balance, notifications, semantic search, runtime AI, and the Knowledge Graph create no Release 1 tables.

Documented Prepared, Later, or Future structures must not be migrated merely because they appear here. Each requires separate product, privacy, security, and implementation approval.

# 2. Architectural Principles

## 2.1 Schema Minimalism Principle

Database quality is not measured by table count.

Release 1 contains the smallest durable schema that correctly supports every approved Release 1 user journey while preserving data integrity, future extensibility, and clear ownership.

A physical table may exist only if it represents a durable integrity boundary that cannot reasonably be achieved through:

- an existing table;
- a configuration record;
- derived data;
- a database view;
- a constrained column;
- a bounded JSONB structure; or
- an additive future migration.

The objective is not “30 tables.” The objective is **the smallest correct schema**. A final count of 28, 30, 31, or 33 is acceptable when every retained table has a clear architectural justification.

Tables must not be preserved for symmetry, hypothetical future needs, an unapproved workflow, or merely to avoid an additive future migration. Before a table can enter Release 1, its proposal must identify:

1. the approved shipping journey that requires it;
2. its owning module;
3. the non-derivable durable state it owns;
4. the integrity boundary that cannot be enforced reasonably elsewhere; and
5. its retention and deletion requirements.

## 2.2 Database Ownership Principle

Every physical table must have exactly one owning module.

That owning module is solely responsible for enforcing the business rules governing writes to the table.

Other modules may read through stable services, views, or well-defined interfaces, but must not write directly unless explicitly authorized by the owning module.

Shared ownership of physical tables is prohibited.

This principle preserves:

- clear ownership;
- low coupling;
- predictable evolution;
- maintainable boundaries; and
- safe schema refactoring.

## 2.3 Database Evolution Principle

Release 1 intentionally contains only the minimum durable schema required to support approved Release 1 user journeys.

Future capabilities should be introduced through additive migrations whenever possible.

Existing identifiers, foreign-key relationships, canonical religious content, and stable integrity boundaries should remain compatible across releases.

Schema evolution should favor compatibility, incremental growth, and preservation of historical data rather than destructive redesign.

Major schema redesigns require explicit architectural justification.

## 2.4 Integrity and implementation rules

1. PostgreSQL is the source of truth; Drizzle is a typed mapping, not the integrity boundary.
2. SQL migrations are explicit, reviewable, forward-only in production, and tested against real PostgreSQL.
3. UUIDv7 is the default identifier for mutable business records. Stable natural identifiers are retained and uniquely constrained for canonical corpora.
4. Foreign keys, unique constraints, checks, exclusion constraints where justified, and transaction boundaries enforce every integrity rule PostgreSQL can express.
5. All timestamps are `timestamptz` in UTC. Local time uses validated IANA time-zone identifiers.
6. Canonical religious truth is normalized. Translations reference canonical passages or immutable content revisions; they never clone canonical identity.
7. Small closed launch vocabularies use checked text columns. A lookup table is added only when the vocabulary becomes independently managed or relationally significant.
8. JSONB is permitted only for bounded, schema-validated provider metadata, method parameters, or recurrence configuration. It must not hide canonical religious text, critical relationships, or unconstrained polymorphism.
9. Derived values are not persisted unless measured performance, reproducibility, reconciliation, or audit proves the need.
10. Audit and publication histories are append-only. Corrections create revisions or supersessions rather than destructive rewrites.
11. Soft deletion exists only for recoverable business objects. Sensitive data is hard-deleted or irreversibly anonymized according to policy.
12. External mutations use idempotency keys. Secrets, raw payment-card data, password material, and unnecessary precise location never enter this schema.

## 2.5 Naming conventions

| Object | Convention | Example |
| --- | --- | --- |
| Tables and columns | plural `snake_case`; singular FK stem | `content_revisions`, `content_item_id` |
| Primary keys | `id` (`uuid`, UUIDv7), unless a stable corpus key is primary | `id` plus unique surah/ayah coordinates |
| Foreign keys | `<referenced_singular>_id` | `content_item_id` |
| Unique constraints | `uq_<table>__<columns>` | `uq_locales__tag` |
| Check constraints | `ck_<table>__<rule>` | `ck_geographic_areas__kind` |
| Indexes | `ix_<table>__<columns_or_purpose>` | `ix_content_revisions__published` |
| Revisions | Increasing `revision_number` unique within parent | `(content_item_id, revision_number)` |
| Provider IDs | Provider plus opaque external key | `(provider_code, external_id)` |

# 3. Release 1 Journeys

| Code | Approved journey |
| --- | --- |
| J1 | Guest opens the Arabic or English experience with correct direction and fallback. |
| J2 | Guest browses surahs and reads exact Quran text with a reviewed translation. |
| J3 | Guest can inspect edition, source, license, attribution, and provenance. |
| J4 | Guest browses morning, evening, and contextual adhkar collections. |
| J5 | Guest browses and opens a dua with translation or transliteration. |
| J6 | Guest can distinguish authenticated content from Editorial General Dua. |
| J7 | Guest sees sourced repetition guidance without worship gamification. |
| J8 | Guest calculates prayer times using a disclosed method, city, and settings. |
| J9 | Guest sees a qualified Hijri date and Muslim events for the selected region. |
| J10 | Guest performs deterministic Arabic or English search with source-aware results. |
| J11 | Editor imports, reviews, approves, publishes, corrects, archives, or withdraws content. |
| J12 | Administrator audits privileged and religious-content changes. |

# 4. Module Ownership and Release 1 Count

Every physical table has exactly one owning module. Cross-module writes use explicit services and transactions. Views are read models and never alternate sources of truth.

| Release 1 module | Physical tables |
| --- | ---: |
| Global and locales | 2 |
| Content integrity | 8 |
| Quran | 6 |
| Devotional content and translation | 4 |
| Editorial | 3 |
| Prayer and calendar configuration | 5 |
| Audit and publication history | 2 |
| Deterministic search | 0 |
| Identity and synchronized preferences | 0 |
| **Total Release 1** | **30** |

The number 30 is the outcome of the approved journeys and integrity boundaries, not a target quota. If implementation evidence proves that one boundary must split or can safely merge, the count may change under the Schema Minimalism Principle.

# 5. Minimal Release 1 Catalog

## 5.1 Global and locales — 2 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `locales` | Enabled locale registry for routing, direction, content availability, and fallback (J1). | Unique valid BCP 47 `tag`; checked `direction`; fallback FK is non-self and cycles are rejected; enabled status. | Arabic and English routes and content references need stable locale identity. Scripts, UI messages, fallback rules, and CLDR formatting do not need separate tables. |
| `geographic_areas` | Hierarchical country, region, and city identity used by prayer and Hijri defaults (J8, J9). | Checked `kind`; unique scoped canonical code; valid parent-kind hierarchy; valid coordinates; validated IANA time-zone text. | Manual worldwide city selection and regional qualification require one stable geographic key. Separate country, region, city, and time-zone tables would add fragmentation without a stronger launch boundary. |

Standard script direction, CLDR formatting, IANA registries, UI strings, and locale fallback policy remain version-controlled configuration. Only exceptional, non-critical locale options may use bounded configuration data.

## 5.2 Content integrity — 8 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `works` | Canonical identity for cited corpora and works (J2–J7, J11). | Unique canonical key; checked `work_type`; stable identifier. | Citations and editions require a language-independent root that survives provider and text changes. |
| `editions` | Licensed, versioned rendering of a work (J2, J3, J11). | FK to work and license; unique work/key/version; published editions immutable; bounded provenance metadata with checksum and import version. | Exact Quran/source identity, attribution, and reproducible imports depend on an edition boundary. |
| `passages` | Stable addressable unit within a work (J2–J7). | FK to work and optional parent; unique work/canonical locator; valid hierarchy/order. | Source references must remain stable when edition text changes. |
| `passage_texts` | Edition-specific original text for a passage (J2–J7). | FKs to edition and passage; unique pair; checksum; immutable after publication. | Exact source text cannot live in flexible JSON or be duplicated per language. |
| `licenses` | Rights, attribution, and redistribution terms (J3, J11). | Unique provider/license/version; required attribution and effective terms; no secret contract payload. | The platform cannot safely publish licensed corpora without durable rights metadata. |
| `source_references` | Structured evidence attached directly to an immutable content revision or canonical passage (J3, J6, J7, J11). | Exactly one supported target context; FK to revision and/or cited work/edition/passage as constrained; role and locator checks; scoped deduplication. | Religious claims need readable, durable evidence. Direct attachment avoids a speculative generic evidence join while allowing multiple references as multiple rows. |
| `content_items` | Stable root for publishable non-Quran content (J4–J7, J11). | Unique canonical key; checked content type; no current-text payload; ownership module fixed. | Duas, adhkar, collections, and editorial content need identities independent of revision and translation. |
| `content_revisions` | Immutable version of a content item and publication candidate (J4–J7, J11). | FK to item and predecessor; unique item/revision number; checksum; checked verification/publication states; optimistic-concurrency version; published rows immutable. | Review, translation binding, corrections, rollback, and withdrawal all require an immutable revision boundary. |

Content classification, verification, publication, and review remain independent checked columns even though they do not each require lookup tables. Provenance that belongs to an imported edition or revision is stored as typed columns plus bounded provider metadata; a separate lineage-event table may be added only when a real multi-stage import requires it.

## 5.3 Quran — 6 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `quran_surahs` | Stable surah metadata and order (J2, J10). | Surah number unique and between 1 and 114; stable canonical key; valid ordering. | The Quran index and navigation depend on this canonical structure. |
| `quran_ayahs` | Stable ayah identity and coordinates (J2, J10). | FK to surah; unique surah/ayah number; positive ordered values. | Reader URLs, references, translations, and search need identity independent of edition text. |
| `quran_ayah_texts` | Exact Quran text for an edition and ayah (J2, J3, J10). | FKs to generic edition and ayah; unique pair; checksum; immutable after publication. | Canonical Arabic must be exact, edition-aware, and never hidden in JSON or a search copy. |
| `quran_structural_markers` | Juz, hizb, rub, page, and sajdah ranges (J2). | FK to edition and start/end ayahs; checked marker kind; valid ordered range; unique marker key per edition. | Durable reader navigation crosses ayah boundaries and should not distort ayah identity. |
| `quran_translation_editions` | Translator, locale, methodology, license, and version (J2, J3). | FKs to locale and license; unique key/version; reviewed status; immutable published version. | A Quran translation is an attributed edition, not anonymous localized text. |
| `quran_translation_texts` | Translation of one ayah in one translation edition (J2, J10). | FKs to translation edition and ayah; unique pair; checksum/version integrity. | Arabic/English reading and deterministic translation search require exact reviewed rows. |

Quran does not duplicate generic `works` or `editions`. Quran-specific tables reference the shared canonical identities. Audio remains UI-ready but its physical catalog is Prepared until licensed audio is confirmed for launch.

## 5.4 Devotional content and translation — 4 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `devotional_items` | Dua or dhikr identity linked to a content item (J4–J7, J10). | One-to-one FK to content item; unique canonical key; checked type; type-specific source/review checks. | Core duas and adhkar need domain behavior without duplicating canonical revision text. |
| `devotional_collections` | Morning, evening, and contextual collection identity (J4, J5). | FK to a versioned content item for title/description; unique canonical key; checked collection kind. | Approved collection journeys need a stable container independent of membership order. |
| `devotional_collection_items` | Ordered item membership and collection-specific repetition guidance (J4, J5, J7). | FKs to collection and item; unique pair and position; positive optional count; optional source reference; no reward field. | Order and guidance are facts of membership and cannot be derived from the item alone. |
| `content_translations` | Reviewed translation or transliteration of an exact content revision (J4–J6, J10). | FKs to revision and locale; checked rendering kind; unique revision/locale/kind/version; review outcome; published text immutable. | Bilingual devotional content requires a durable reviewed rendering without parallel translation subsystems. |

Editorial General Dua is separated by a checked devotional type, required editorial and religious-appropriateness reviews, source-claim constraints, and mandatory public labeling. A one-to-one detail table would add symmetry but no additional durable state. Repetition guidance belongs to collection membership or the reviewed item revision; it is never a worship ledger.

## 5.5 Editorial — 3 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `editorial_users` | Staff identity independent of optional public accounts (J11, J12). | Unique staff subject; active/disabled state; no public profile dependency. | Every review and privileged content action must identify a responsible human. |
| `editorial_role_grants` | Scoped least-privilege staff authorization (J11, J12). | FK to editorial user; checked role and scope; unique non-overlapping active grant; effective dates. | Publication and religious review require enforceable separation of duties. |
| `review_records` | Immutable language, source, religious, and editorial decisions (J11). | FK to exact revision or translation and reviewer; checked stage/outcome; unique decision version; append-only. | Required review gates cannot be reconstructed safely from mutable status alone. |

Queues are database views over status. Approvals are typed review records followed by publication events. Locks use optimistic concurrency. Assignments, shareable preview tokens, scheduled publication, and persisted queues remain Prepared until real workflow volume requires them.

## 5.6 Prayer and calendar configuration — 5 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `prayer_calculation_methods` | Versioned calculation authority, parameters, and disclosure (J8). | Unique code/version; checked method kind; schema-validated bounded parameters; published version immutable. | Prayer output must disclose and reproduce the selected calculation method. |
| `prayer_regional_defaults` | Geographic default method, Asr convention, and high-latitude rule (J8). | FKs to area and method; checked conventions; effective range; no overlapping active scope. | Safe regional defaults are required while preserving explicit user choice. |
| `hijri_calendar_methods` | Versioned calculated or observed calendar method (J9). | Unique code/version; checked method kind; authority identity and bounded parameters; immutable published version. | The platform must not imply one universal Hijri calculation. |
| `hijri_regional_adjustments` | Sourced regional qualification or shift (J9). | FKs to area and method; bounded adjustment; effective date range; source/authority fields; no conflicting confirmed scope. | Regional observation and authority differences are durable facts that affect the displayed date. |
| `muslim_events` | Canonical Muslim event with localized content and recurrence rule (J9). | Unique canonical key; validated bounded recurrence JSONB; method applicability; source/version; checked visibility. | The Release 1 calendar requires independently managed event identity and rules. |

Daily prayer times, next-prayer state, displayed Hijri date, and event occurrences are derived from inputs and configuration. They may be exposed through views or caches but are not canonical tables. Islamic month names and standard calendar labels remain locale configuration.

## 5.7 Audit and publication history — 2 tables

| Table | Purpose and exact journey | Essential constraints | Why it cannot wait |
| --- | --- | --- | --- |
| `publication_events` | Append-only publish, correct, archive, restore, and withdraw transitions (J11, J12). | FK to exact revision and actor; checked transition; unique idempotency key; reason for sensitive transitions; append-only. | The current public state and correction history must be accountable without separate approval, withdrawal, and correction tables. |
| `audit_events` | Minimal append-only privileged mutation trail (J11, J12). | Actor/action/target/time/correlation fields; unique event key; immutable; no duplicated religious payload or secrets. | Security and editorial accountability require a durable trail beyond domain publication events. |

Operational database incidents belong in monitoring and incident management, not in the product schema. A public correction-submission table is additive only if public correction intake ships.

# 6. Deterministic Search — No Physical Release 1 Tables

Release 1 search reads canonical content through a regular or materialized union view and uses:

- generated normalized Arabic/English search fields where appropriate;
- PostgreSQL full-text search and weighted `tsvector` expressions;
- `pg_trgm` indexes for justified fuzzy matching;
- checked corpus/type discriminators derived from canonical owners;
- locale, source, and verification filters from canonical joins; and
- an explicit normalizer version in application/configuration and rebuild procedures.

The search projection is rebuildable and never canonical truth. A physical `search_documents` projection may be introduced through an additive migration only when measured query plans or scale prove that a view/materialized view is insufficient. Search history, saved searches, aliases, semantic embeddings, analytics, and the Knowledge Graph do not create Release 1 tables.

# 7. Configuration and Derived Data

## 7.1 Version-controlled or constrained configuration

- UI message keys and values;
- locale fallback chains;
- script direction and Unicode behavior;
- CLDR date, number, and time formatting;
- IANA time-zone registry values;
- Islamic month names;
- closed content, verification, publication, review, role, rendering, marker, prayer, and Hijri vocabularies;
- stable technical routes and initial redirects;
- non-sensitive feature flags; and
- bounded provider identifiers and method metadata.

## 7.2 Derived data

- current published revision from publication history;
- search documents, normalized tokens, vectors, and rank inputs;
- Quran counts and navigation relationships;
- collection item counts;
- daily prayer schedules and next prayer;
- displayed Hijri date;
- Muslim event occurrences;
- canonical URLs built from locale and stable identifier;
- available locale lists;
- media variants;
- daily dua selection when deterministic; and
- local-first tasbeeh state.

A view or materialized view may optimize a read model without changing the physical canonical-table count. Any materialized view must be rebuildable and documented as non-authoritative.

# 8. Minimum Schema by Journey

| Journey | Required tables or mechanism |
| --- | --- |
| Arabic/English experience | `locales` plus version-controlled UI locale files. |
| Quran index and reader | `works`, `editions`, `licenses`, `quran_surahs`, `quran_ayahs`, `quran_ayah_texts`. |
| Quran translation | `quran_translation_editions`, `quran_translation_texts`. |
| Quran structural navigation | `quran_structural_markers`. |
| Source transparency | `works`, `editions`, `passages`, `passage_texts`, `source_references`, `licenses`. |
| Dua or dhikr detail | `content_items`, `content_revisions`, `devotional_items`, `content_translations`, `source_references`. |
| Morning/evening collections | Above plus `devotional_collections`, `devotional_collection_items`. |
| Editorial General Dua separation | Checked devotional type, required review records, source-claim constraints, and public labeling. |
| Prayer times | `geographic_areas`, `prayer_calculation_methods`, `prayer_regional_defaults`; outputs derived. |
| Hijri calendar and events | `geographic_areas`, `hijri_calendar_methods`, `hijri_regional_adjustments`, `muslim_events`; occurrences derived. |
| Deterministic search | Canonical tables plus generated columns, indexes, and a union/materialized view. |
| Editorial publishing | `editorial_users`, `editorial_role_grants`, `review_records`, `content_revisions`, `publication_events`, `audit_events`. |
| Correction or withdrawal | New revision where applicable plus `publication_events` and `audit_events`. |
| Tasbeeh | Local device storage; no PostgreSQL table. |

# 9. Prepared Identity and Synchronized Preferences

Core Release 1 operates without server-side user accounts. Quran, duas, adhkar, prayer, calendar, search, and tasbeeh are guest-first. If authentication, bookmarks, and synchronization are separately approved for launch, add this five-table package through an additive migration:

| Prepared table | Purpose | Minimum integrity boundary |
| --- | --- | --- |
| `users` | Private account root. | Stable UUID, checked status, deletion lifecycle. |
| `user_identities` | External authentication-provider link. | Unique provider/external subject; provider metadata minimized. |
| `user_sessions` | Revocable server session when not provider-managed. | Unique hashed token, expiry, revocation; no raw token storage. |
| `user_preferences` | Synchronized locale, theme, reading, and prayer choices. | One row per user; critical typed fields and bounded non-critical JSONB. |
| `user_saved_items` | Bookmarks and reading position. | Unique user/target/kind; constrained target types and privacy ownership. |

This package raises the physical count from 30 to 35 only if the pending product decision is approved. Separate provider, email, device, consent, notification, or preference tables require their own proven workflows; they are not included for symmetry.

# 10. Additive Expansion Path

Stable UUIDs and canonical keys for works, editions, passages, content items, locales, ayahs, and geographic areas protect later modules from destructive redesign.

| Module | Additive path | Release 1 physical tables |
| --- | --- | ---: |
| Hadith | Add collection, book, chapter, record, grade assertion, and translation tables referencing shared works, editions, passages, licenses, locales, reviews, and publication history. | 0 |
| Talibeen Al-Halal | Add an isolated privacy-first schema after identity is approved; reference users but keep profiles, discovery projections, introductions, conversations, blocks, and retention within the module. | 0 |
| Subscriptions | Add products, plans, effective prices, subscriptions, entitlements, and redacted provider events; never place billing state on content or users directly. | 0 |
| Alsamad Balance | Add an isolated immutable ledger only after policy approval; link accounts to users and never reward worship, time, repetition, streaks, or popularity. | 0 |
| Semantic search | Build rebuildable embeddings from versioned canonical search projections; store source ID/version and model version without changing canonical truth. | 0 |
| AI governance | Add corpus manifests, prompt/model versions, evaluations, incidents, and minimized traces only when runtime AI is authorized. | 0 |
| Notifications | Add preferences, templates, delivery attempts, and a transactional outbox immediately before a real asynchronous channel ships. | 0 |
| Knowledge Graph | Add nodes and edges as projections over stable canonical identifiers; promote only independently curated relations to durable state. | 0 |
| Media/audio | Add licensed asset, reciter, manifest, and accessibility records when launch scope confirms managed audio; keep binaries in object storage. | 0 |
| Advanced moderation | Add report, evidence, case, action, restriction, and appeal tables when public mutation or community workflows require them. | 0 |

All expansions use new tables, indexes, foreign keys, and views. They do not rewrite Release 1 canonical religious identities.

# 11. Explicitly Rejected Release 1 Fragmentation

The following former proposals do not remain physical Release 1 tables:

- separate language, script, country, region, city, time-zone, formatting, and locale-fallback registries;
- lookup tables for closed content, verification, publication, review, role, or corpus vocabularies;
- duplicated generic and Quran-specific work/edition roots;
- separate devotional source, translation, transliteration, repetition, and Editorial General Dua detail tables;
- provenance, withdrawal, correction, note, approval, queue, assignment, lock, scheduling, and preview tables without a distinct launch integrity boundary;
- separate prayer method-version/provider and Hijri authority/month/event-occurrence tables;
- persisted search documents, aliases, analytics, or history;
- database-managed UI messages;
- canonical slug, redirect, SEO-override, and structured-data workflow tables at launch;
- media variants and accessibility subsystems before managed media ships;
- an outbox before a reliable asynchronous consumer exists;
- product-database tables for database incidents or metric samples; and
- any Release 1 preparation table for Hadith, Talibeen, subscriptions, Balance, notifications, semantic search, AI governance, or the Knowledge Graph.

These decisions do not prohibit future tables. They require evidence and an additive migration at the point of need.

# 12. Simplification Risks and Controls

| Risk | Control |
| --- | --- |
| A checked vocabulary later needs editorial management. | Add a lookup table and FK through a forward migration while preserving stable codes. |
| A search view becomes too slow. | Measure plans, then add a rebuildable materialized or physical projection. |
| Import lineage becomes multi-stage. | Add an append-only provenance-event table referencing stable editions/revisions. |
| Editors need assignments or simultaneous editing. | Add assignments/leases; optimistic concurrency protects the initial workflow. |
| Bounded recurrence or provider JSONB drifts. | Validate against explicit application and database checks; version the schema. |
| One geographic hierarchy becomes operationally awkward. | Split through additive subtype tables while keeping geographic IDs stable. |
| Editorial General Dua is mislabeled. | Enforce checked type, required review gates, source-claim constraints, tests, and public presentation rules in the publication transaction. |
| Accounts launch later. | Migrate local preferences explicitly into the five-table synchronized package with user consent. |

The opposite risk is larger: speculative tables create conflicting truth, broader authorization surfaces, harder imports, status drift, more failure modes, and schema inertia before they support a public journey.

# 13. Validation Checklist

- The Schema Minimalism Principle governs every Release 1 table decision.
- The Database Ownership Principle gives every physical table exactly one owning module and prohibits unauthorized cross-module writes or shared ownership.
- The Database Evolution Principle preserves stable identifiers, foreign-key relationships, canonical religious content, integrity boundaries, and historical data through additive change whenever possible.
- The Release 1 physical catalog contains exactly 30 currently justified tables, not an arbitrary target.
- Every retained table names its shipping journey, integrity constraints, and reason it cannot wait.
- Prepared, Approved Later, and Future / Research designs create zero physical Release 1 tables.
- Quran and other canonical truth are normalized and never duplicated per language.
- Editorial General Dua is structurally enforced through type, review, source-claim, and presentation constraints.
- Content type, verification, publication, and review remain independent even when expressed as constrained columns.
- Search is deterministic, source-aware, and derived from canonical content.
- Prayer times, Hijri display dates, event occurrences, and tasbeeh state are not unnecessarily persisted.
- Authentication remains an additive five-table package pending explicit approval.
- Every table has one owning module and a stable identifier strategy.
- No giant unconstrained polymorphic table, premature event sourcing, premature partitioning, or speculative integration table is introduced.
- This document contains no SQL migration, application code, or deployment authorization.
