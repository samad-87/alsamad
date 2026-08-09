# Alsamad — Database Architecture

**Status:** Approved Release 1 database architecture; documentation only

**Authoritative product source:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`

**Database:** PostgreSQL
**Application mapping:** Drizzle ORM
**Migration model:** Reviewed, forward-only SQL migrations

This document defines the smallest durable Release 1 schema and the additive expansion boundaries for later modules. It does not authorize implementation of any table, migration, provider, or later product module.

# 1. Scope and Status

| Status                    | Meaning                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Release 1**             | A physical table required by an approved initial-release journey and justified as a durable integrity boundary. |
| **Prepared**              | A documented capability or additive schema package that is not physically created in Release 1.                 |
| **Approved Later Module** | Approved product architecture on a separately authorized release track; zero Release 1 tables.                  |
| **Future / Research**     | Isolated design requiring evidence, licensing, safety validation, or a later decision; zero Release 1 tables.   |

Release 1 serves guests in Arabic and English while remaining unlimited-language by architecture. It includes the Quran reader, authenticated duas and adhkar, visibly separated Editorial General Duas, prayer and Hijri configuration, Muslim events, deterministic search, source provenance, and the minimum editorial and audit integrity needed to publish safely.

Authentication, synchronized preferences, bookmarks, and reading position remain Prepared and are not publicly activated in Release 1. Tasbeeh and ordinary display preferences remain local-first. Hadith, Talibeen Al-Halal, subscriptions, Alsamad Balance, notifications, semantic search, runtime AI, and the Knowledge Graph create no Release 1 tables.

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

The objective is not to maximize table count. The objective is **the smallest correct schema**. M1 froze the approved Release 1 catalog at exactly 30 physical tables. Any change to that boundary requires a post-M1 architecture decision before implementation; implementation evidence alone does not authorize a 29th or 31st table.

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

| Object             | Convention                                                   | Example                                 |
| ------------------ | ------------------------------------------------------------ | --------------------------------------- |
| Tables and columns | plural `snake_case`; singular FK stem                        | `content_revisions`, `content_item_id`  |
| Primary keys       | `id` (`uuid`, UUIDv7), unless a stable corpus key is primary | `id` plus unique surah/ayah coordinates |
| Foreign keys       | `<referenced_singular>_id`                                   | `content_item_id`                       |
| Unique constraints | `uq_<table>__<columns>`                                      | `uq_locales__tag`                       |
| Check constraints  | `ck_<table>__<rule>`                                         | `ck_geographic_areas__kind`             |
| Indexes            | `ix_<table>__<columns_or_purpose>`                           | `ix_content_revisions__published`       |
| Revisions          | Increasing `revision_number` unique within parent            | `(content_item_id, revision_number)`    |
| Provider IDs       | Provider plus opaque external key                            | `(provider_code, external_id)`          |

# 3. Release 1 Journeys

| Code | Approved journey                                                                        |
| ---- | --------------------------------------------------------------------------------------- |
| J1   | Guest opens the Arabic or English experience with correct direction and fallback.       |
| J2   | Guest browses surahs and reads exact Quran text with a reviewed translation.            |
| J3   | Guest can inspect edition, source, license, attribution, and provenance.                |
| J4   | Guest browses morning, evening, and contextual adhkar collections.                      |
| J5   | Guest browses and opens a dua with translation or transliteration.                      |
| J6   | Guest can distinguish authenticated content from Editorial General Dua.                 |
| J7   | Guest sees sourced repetition guidance without worship gamification.                    |
| J8   | Guest calculates prayer times using a disclosed method, city, and settings.             |
| J9   | Guest sees a qualified Hijri date and Muslim events for the selected region.            |
| J10  | Guest performs deterministic Arabic or English search with source-aware results.        |
| J11  | Editor imports, reviews, approves, publishes, corrects, archives, or withdraws content. |
| J12  | Administrator audits privileged and religious-content changes.                          |

# 4. Module Ownership and Release 1 Count

Every physical table has exactly one owning module. Cross-module writes use explicit services and transactions. Views are read models and never alternate sources of truth.

| Release 1 module                      | Physical tables |
| ------------------------------------- | --------------: |
| Global and locales                    |               2 |
| Content integrity                     |               8 |
| Quran                                 |               6 |
| Devotional content and translation    |               4 |
| Editorial                             |               3 |
| Prayer and calendar configuration     |               5 |
| Audit and publication history         |               2 |
| Deterministic search                  |               0 |
| Identity and synchronized preferences |               0 |
| **Total Release 1**                   |          **30** |

The number 30 is the outcome of the approved journeys and integrity boundaries, not a target quota. It is nevertheless the frozen Release 1 boundary: a proposed split or merge must stop for a separately approved post-M1 architecture decision before changing the physical catalog.

# 5. Minimal Release 1 Catalog

## 5.1 Global and locales — 2 tables

| Table              | Purpose and exact journey                                                                   | Essential constraints                                                                                                          | Why it cannot wait                                                                                                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `locales`          | Enabled locale registry for routing, direction, content availability, and fallback (J1).    | Unique canonical `code` and BCP 47-compatible `language_tag`; checked `direction`; non-self, acyclic fallback; enabled status. | Arabic and English routes and content references need stable locale identity. Scripts, UI messages, fallback rules, and CLDR formatting do not need separate tables.                                           |
| `geographic_areas` | Hierarchical country, region, and city identity used by prayer and Hijri defaults (J8, J9). | Checked `area_type`; scoped canonical codes; valid acyclic parent hierarchy; coordinates and IANA time-zone rules.             | Manual worldwide city selection and regional qualification require one stable geographic key. Separate country, region, city, and time-zone tables would add fragmentation without a stronger launch boundary. |

Standard script direction, CLDR formatting, IANA registries, UI strings, and locale fallback policy remain version-controlled configuration. Only exceptional, non-critical locale options may use bounded configuration data.

### 5.1.1 Executable M3 contract: `locales`

M3 authorizes this table as the first of exactly two Global and locales physical tables. No other Release 1, Prepared, Later, or Future table is authorized by M3.

| Column               | PostgreSQL type | Nullability and default                 | Contract                                                                                          |
| -------------------- | --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `id`                 | `uuid`          | Required; no database-generated default | Primary key generated by the application using UUIDv7; immutable.                                 |
| `code`               | `varchar(16)`   | Required                                | Unique lowercase canonical internal locale code, such as `ar` or `en`; immutable after reference. |
| `language_tag`       | `varchar(35)`   | Required                                | Unique, canonical BCP 47-compatible tag; case-normalized before persistence.                      |
| `language_code`      | `varchar(8)`    | Required                                | Lowercase ISO-style language identity.                                                            |
| `script_code`        | `varchar(4)`    | Nullable                                | When present, exactly four letters in title-case ISO 15924 style, such as `Arab` or `Latn`.       |
| `region_code`        | `varchar(3)`    | Nullable                                | When present, uppercase ISO 3166-1 alpha-2 or an approved numeric region code.                    |
| `direction`          | `varchar(3)`    | Required                                | Closed values `rtl` or `ltr`.                                                                     |
| `display_name`       | `varchar(100)`  | Required                                | Administrative English/global display label.                                                      |
| `native_name`        | `varchar(100)`  | Required                                | Native-language display label.                                                                    |
| `fallback_locale_id` | `uuid`          | Nullable                                | Self-reference to `locales.id`; `ON DELETE RESTRICT`; must not reference itself or form a cycle.  |
| `is_enabled`         | `boolean`       | Required; default `false`               | Operational locale activation state.                                                              |
| `sort_order`         | `integer`       | Required; default `0`                   | Deterministic, non-negative ordering.                                                             |
| `created_at`         | `timestamptz`   | Required; default `current_timestamp`   | Stored and interpreted in UTC.                                                                    |
| `updated_at`         | `timestamptz`   | Required; default `current_timestamp`   | Stored and interpreted in UTC.                                                                    |

The table has named uniqueness constraints on `code` and `language_tag`; checks for `direction IN ('rtl', 'ltr')`, `sort_order >= 0`, `fallback_locale_id <> id`, lowercase `code`, lowercase `language_code`, valid four-letter title-case `script_code` when present, and uppercase alphabetic or approved numeric `region_code` when present. It has indexes on `(is_enabled, sort_order)` and `fallback_locale_id`.

Direct self-reference is rejected by a check constraint. A PostgreSQL constraint trigger, `DEFERRABLE INITIALLY IMMEDIATE`, must inspect the complete fallback ancestor chain and reject every multi-level cycle by failing the transaction. An enabled locale may be a root with no fallback. Arabic and English are independent Release 1 root locales; neither falls back to the other. `language_tag` changes require an explicit administrative migration.

### 5.1.2 Executable M3 contract: `geographic_areas`

| Column             | PostgreSQL type | Nullability and default               | Contract                                                                                             |
| ------------------ | --------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `id`               | `uuid`          | Required; no database default         | UUIDv7 primary key generated by the application; immutable.                                          |
| `parent_id`        | `uuid`          | Nullable                              | Self-reference to `geographic_areas.id`; `ON DELETE RESTRICT`; no self-reference or hierarchy cycle. |
| `area_type`        | `varchar(16)`   | Required                              | Release 1 closed values `country`, `region`, or `city`.                                              |
| `country_code`     | `varchar(2)`    | Nullable at type level                | Uppercase ISO 3166-1 alpha-2; logically required for every Release 1 row.                            |
| `subdivision_code` | `varchar(16)`   | Nullable                              | Uppercase or provider-neutral canonical regional code.                                               |
| `city_code`        | `varchar(64)`   | Nullable                              | Provider-neutral stable city code where available.                                                   |
| `slug`             | `varchar(128)`  | Required                              | Lowercase ASCII canonical slug, unique within the same parent and area type.                         |
| `display_name`     | `varchar(160)`  | Required                              | Neutral administrative display name; not a localized public-name payload.                            |
| `timezone`         | `varchar(64)`   | Nullable                              | Valid IANA identifier; required for cities and optional for countries and regions.                   |
| `latitude`         | `numeric(9,6)`  | Nullable                              | When present, between -90 and 90.                                                                    |
| `longitude`        | `numeric(9,6)`  | Nullable                              | When present, between -180 and 180.                                                                  |
| `is_active`        | `boolean`       | Required; default `true`              | Operational activation state; deactivation is the normal removal mechanism.                          |
| `created_at`       | `timestamptz`   | Required; default `current_timestamp` | Stored and interpreted in UTC.                                                                       |
| `updated_at`       | `timestamptz`   | Required; default `current_timestamp` | Stored and interpreted in UTC.                                                                       |

The table checks `parent_id <> id`, the closed `area_type`, uppercase `country_code` when present, required `country_code` for all three Release 1 types, coordinate ranges, and the city parent/time-zone requirements. A country has no parent; a region has a country parent; a city has either a region or country parent. Every descendant must share the `country_code` of its country root. These type and country-root rules are database-enforced, including when parent inspection requires a trigger.

Uniqueness is enforced for `(parent_id, area_type, slug)`, for `country_code` on country rows, for `(country_code, subdivision_code)` where `subdivision_code` is non-null, and for `(country_code, city_code)` where `city_code` is non-null. Required indexes cover `parent_id`, `area_type`, `country_code`, `timezone`, and `is_active`. A `(latitude, longitude)` index is prohibited until an approved query demonstrates its need.

Direct self-parenting is rejected by a check. A PostgreSQL constraint trigger, `DEFERRABLE INITIALLY IMMEDIATE`, must inspect the complete ancestor chain and reject every multi-level hierarchy cycle by failing the transaction. Parent deletion is restricted; physical deletion is prohibited while descendants or dependent configuration exist; there is no cascade deletion. Operational removal uses `is_active = false`.

M3 adds neither a geographic-area translation table nor JSON localization columns. `display_name` is administrative and neutral. Localized public geographic names remain deferred to a separately approved later schema unit.

### 5.1.3 M3 deterministic seed authorization

M3 authorizes exactly two locale seed rows and no geographic rows:

| `code` | `language_tag` | `language_code` | `script_code` | `region_code` | `direction` | `display_name` | `native_name` | `is_enabled` | `sort_order` | fallback |
| ------ | -------------- | --------------- | ------------- | ------------- | ----------- | -------------- | ------------- | ------------ | ------------ | -------- |
| `ar`   | `ar`           | `ar`            | `Arab`        | `NULL`        | `rtl`       | `Arabic`       | `العربية`     | `true`       | `10`         | none     |
| `en`   | `en`           | `en`            | `Latn`        | `NULL`        | `ltr`       | `English`      | `English`     | `true`       | `20`         | none     |

The seed must use deterministic UUIDv7 identifiers, be idempotent, and leave each canonical locale present exactly once. Countries, regions, and cities enter only through a separately approved import or administrative workflow; M3 authorizes no geographic seed data.

## 5.2 Content integrity — 8 tables

| Table               | Purpose and exact journey                                                                                         | Essential constraints                                                                                                                                                 | Why it cannot wait                                                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `works`             | Canonical identity for cited corpora and works (J2–J7, J11).                                                      | Unique canonical key; checked `work_type`; stable identifier.                                                                                                         | Citations and editions require a language-independent root that survives provider and text changes.                                                            |
| `editions`          | Licensed, versioned rendering of a work (J2, J3, J11).                                                            | FK to work and license; unique work/key/version; published editions immutable; bounded provenance metadata with checksum and import version.                          | Exact Quran/source identity, attribution, and reproducible imports depend on an edition boundary.                                                              |
| `passages`          | Stable addressable unit within a work (J2–J7).                                                                    | FK to work and optional parent; unique work/canonical locator; valid hierarchy/order.                                                                                 | Source references must remain stable when edition text changes.                                                                                                |
| `passage_texts`     | Edition-specific original text for a passage (J2–J7).                                                             | FKs to edition and passage; unique pair; checksum; immutable after publication.                                                                                       | Exact source text cannot live in flexible JSON or be duplicated per language.                                                                                  |
| `licenses`          | Rights, attribution, and redistribution terms (J3, J11).                                                          | Unique provider/license/version; required attribution and effective terms; no secret contract payload.                                                                | The platform cannot safely publish licensed corpora without durable rights metadata.                                                                           |
| `source_references` | Structured evidence owned by an immutable content revision and citing a canonical work context (J3, J6, J7, J11). | Required revision and cited work; optional same-work edition/passage narrowing; role, locator, checksum, publication, and scoped-deduplication checks.                | Religious claims need readable, durable evidence. Revision ownership avoids a floating generic evidence join while multiple rows preserve multiple references. |
| `content_items`     | Stable root for publishable non-Quran content (J4–J7, J11).                                                       | Unique canonical key; checked content type; no current-text payload; ownership module fixed.                                                                          | Duas, adhkar, collections, and editorial content need identities independent of revision and translation.                                                      |
| `content_revisions` | Immutable version of a content item and publication candidate (J4–J7, J11).                                       | FK to item and predecessor; unique item/revision number; checksum; checked verification/publication states; optimistic-concurrency version; published rows immutable. | Review, translation binding, corrections, rollback, and withdrawal all require an immutable revision boundary.                                                 |

Content classification, verification, publication, and review remain independent checked columns even though they do not each require lookup tables. Provenance that belongs to an imported edition or revision is stored as typed columns plus bounded provider metadata; a separate lineage-event table may be added only when a real multi-stage import requires it.

### 5.2.1 Executable M4 boundary and dependency order

M4 authorizes exactly the eight Content integrity tables already counted in the frozen Release 1 catalog. The migration order is:

1. `licenses`;
2. `works`;
3. `editions`;
4. `passages`;
5. `passage_texts`;
6. `content_items`;
7. `content_revisions`; and
8. `source_references`.

The order is an implementation dependency order, not a permission to split or omit tables. After M4, exactly 10 of the 30 authorized Release 1 domain tables exist: the two M3 tables and these eight. M4 does not authorize Quran, devotional, translation, editorial, prayer, calendar, audit, publication-history, Prepared, Later, or Future tables. It authorizes no provider import and no selection of a Quran edition, translation, tafsir, dua, dhikr, or other external religious dataset.

The relationship model is exact: a language-independent `work` owns stable `passages`; a licensed `edition` renders one work; `passage_texts` hold the exact edition-specific text for those passages. A `content_item` is the stable non-Quran publishable identity and owns an append-only chain of immutable `content_revisions`. A `source_reference` belongs to one content revision and cites a structured work context, optionally narrowed to an edition and passage. `licenses` authorize edition publication; they do not convey canonical identity. Provider identifiers remain aliases in bounded provenance columns and never replace ALSAMAD primary keys or canonical keys.

### 5.2.2 `licenses`

| Column                              | PostgreSQL type | Nullability and default               | Contract                                                                                                                         |
| ----------------------------------- | --------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                                                             |
| `provider_code`                     | `varchar(64)`   | Required                              | Lowercase provider/legal-source code; external namespace, not canonical content identity.                                        |
| `license_key`                       | `varchar(128)`  | Required                              | Stable provider-scoped license identifier.                                                                                       |
| `version`                           | `varchar(64)`   | Required                              | Exact terms/version identifier.                                                                                                  |
| `name`                              | `varchar(200)`  | Required                              | Human-readable license name.                                                                                                     |
| `rights_scope`                      | `varchar(24)`   | Required                              | One of `public_domain`, `permission`, `open_license`, or `contract`.                                                             |
| `attribution_text`                  | `text`          | Required                              | Exact public attribution; nonblank.                                                                                              |
| `terms_url`                         | `text`          | Nullable                              | HTTPS public terms URL when available.                                                                                           |
| `retention_policy`                  | `varchar(24)`   | Required                              | One of `permanent`, `time_limited`, or `no_storage`.                                                                             |
| `retention_days`                    | `integer`       | Nullable                              | Required and positive only for `time_limited`; otherwise null.                                                                   |
| `in_application_display_allowed`    | `boolean`       | Required; default `false`             | Explicit permission to serve or display content as an integrated part of ALSAMAD.                                                |
| `standalone_redistribution_allowed` | `boolean`       | Required; default `false`             | Explicit permission to redistribute content independently as a dataset, raw dump, download catalog, bulk product, or equivalent. |
| `derivatives_allowed`               | `boolean`       | Required; default `false`             | Explicit derivative-work permission.                                                                                             |
| `effective_from`                    | `timestamptz`   | Required                              | Rights begin instant in UTC.                                                                                                     |
| `effective_until`                   | `timestamptz`   | Nullable                              | Exclusive rights expiry; later than `effective_from`.                                                                            |
| `status`                            | `varchar(16)`   | Required; default `draft`             | One of `draft`, `active`, `expired`, `revoked`.                                                                                  |
| `created_at`                        | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                                                               |
| `updated_at`                        | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                                                                  |

Constraints are `UNIQUE (provider_code, license_key, version)`; lowercase provider code; nonblank key, version, name, and attribution; valid closed vocabularies; valid HTTPS URL when present; coherent retention fields; and ordered effective dates. Indexes are `(status, effective_from, effective_until)` and `(provider_code, license_key)`. `id`, `provider_code`, `license_key`, `version`, and `effective_from` are immutable after insert. Activation requires nonblank attribution and a currently effective window. Revocation or expiry prevents new publication but preserves historical rows. Deletion is restricted while referenced; licenses are retained for the life of every dependent edition and publication record. Contract documents, credentials, and secret terms are prohibited.

Publication means serving or displaying content as an integrated part of ALSAMAD. It requires affirmative `in_application_display_allowed` permission and does not require `standalone_redistribution_allowed`. Publication does not grant or imply standalone redistribution, commercial use, sublicensing, derivative rights, permanent storage, or any other separate right. Each exercised capability must have its own affirmative permission; an unknown required right fails closed. The existing `redistribution_allowed` physical value is preserved by the ARC-001 forward migration under the renamed `standalone_redistribution_allowed` field and is never reinterpreted or used to infer application-display permission. New application-display values default to `false` until explicitly reviewed.

### 5.2.3 `works`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                                                        |
| ------------------------ | --------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `id`                     | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                            |
| `canonical_key`          | `varchar(160)`  | Required                              | Unique lowercase provider-independent identity; immutable.                                      |
| `work_type`              | `varchar(24)`   | Required                              | One of `quran`, `hadith_collection`, `dua_collection`, `dhikr_collection`, or `reference_work`. |
| `title`                  | `varchar(300)`  | Required                              | Neutral administrative title; not canonical source text.                                        |
| `original_language_code` | `varchar(8)`    | Required                              | Lowercase language code; language metadata only, not a translated work clone.                   |
| `authority_name`         | `varchar(300)`  | Nullable                              | Attributed compiler/author/authority where applicable.                                          |
| `description`            | `text`          | Nullable                              | Non-canonical administrative description.                                                       |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                              |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                                 |

Constraints are uniqueness of `canonical_key`; lowercase canonical key and language code; closed `work_type`; and nonblank required text. Indexes are `work_type` and `original_language_code`. `id`, `canonical_key`, and `work_type` are immutable after reference. A work is language-independent canonical identity: translations or scripts never create parallel canonical works merely because their display language differs. `ON DELETE RESTRICT` applies from every dependent edition, passage, and source reference; archival is operational and not represented by destructive deletion in M4.

### 5.2.4 `editions`

| Column                     | PostgreSQL type | Nullability and default               | Contract                                                                                   |
| -------------------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ |
| `id`                       | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                       |
| `work_id`                  | `uuid`          | Required                              | FK to `works.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.                      |
| `license_id`               | `uuid`          | Required                              | FK to `licenses.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable after publication. |
| `edition_key`              | `varchar(160)`  | Required                              | Provider-independent key within the work.                                                  |
| `version`                  | `varchar(64)`   | Required                              | Exact edition or import version.                                                           |
| `language_code`            | `varchar(8)`    | Required                              | Lowercase language code of exact source text.                                              |
| `script_code`              | `varchar(4)`    | Nullable                              | Title-case ISO 15924-style script code.                                                    |
| `display_name`             | `varchar(300)`  | Required                              | Administrative edition label.                                                              |
| `provider_code`            | `varchar(64)`   | Required                              | Lowercase provenance namespace.                                                            |
| `provider_edition_id`      | `varchar(256)`  | Required                              | Opaque external alias; never a primary or canonical key.                                   |
| `import_version`           | `varchar(128)`  | Required                              | Reproducible provider snapshot/resource version.                                           |
| `source_manifest_checksum` | `varchar(64)`   | Required                              | Lowercase SHA-256 hex of the approved source manifest.                                     |
| `provider_metadata`        | `jsonb`         | Required; default `'{}'::jsonb`       | Bounded object of non-secret provenance aliases only.                                      |
| `publication_state`        | `varchar(16)`   | Required; default `draft`             | One of `draft`, `validated`, `published`, `withdrawn`.                                     |
| `published_at`             | `timestamptz`   | Nullable                              | Required exactly for `published` or `withdrawn`.                                           |
| `created_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                         |
| `updated_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC last pre-publication update.                                                           |

Constraints are `UNIQUE (work_id, edition_key, version)`, `UNIQUE (provider_code, provider_edition_id, import_version)`, closed publication state, lowercase codes, script format, nonblank aliases, a 64-character lowercase SHA-256 checksum, JSON object size at most 16 KiB, and coherent `published_at`. Indexes are `work_id`, `license_id`, `(publication_state, work_id)`, and `(provider_code, provider_edition_id)`. Publication is permitted only through a trigger that confirms the referenced license is `active`, effective at `published_at`, permits storage, has `in_application_display_allowed = true`, and has not expired or been revoked. `standalone_redistribution_allowed` is not a publication prerequisite. Once an edition first enters `published`, every column except `publication_state`, `updated_at`, and a transition from `published` to `withdrawn` is immutable; withdrawal cannot return to publication. A correction creates a new edition version. Time-limited source data must be withdrawn and deleted according to its license unless separate durable rights exist; edition identity and required attribution evidence remain retained, while licensed payload removal is handled through restricted recovery procedures.

### 5.2.5 `passages`

| Column              | PostgreSQL type | Nullability and default               | Contract                                                                       |
| ------------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `id`                | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                           |
| `work_id`           | `uuid`          | Required                              | FK to `works.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.          |
| `parent_passage_id` | `uuid`          | Nullable                              | Self-FK; `ON UPDATE RESTRICT ON DELETE RESTRICT`; same work; no cycle.         |
| `canonical_locator` | `varchar(200)`  | Required                              | Stable provider-independent locator within the work; immutable.                |
| `passage_type`      | `varchar(24)`   | Required                              | One of `work`, `book`, `chapter`, `section`, `verse`, `entry`, or `paragraph`. |
| `sequence_number`   | `integer`       | Required                              | Positive deterministic sibling order.                                          |
| `depth`             | `smallint`      | Required                              | Zero through 15; root is zero and child is parent depth plus one.              |
| `created_at`        | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                             |
| `updated_at`        | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                |

Constraints are `UNIQUE (work_id, canonical_locator)`, `UNIQUE NULLS NOT DISTINCT (work_id, parent_passage_id, sequence_number)`, positive sequence, bounded depth, closed type, nonblank locator, and no self-parent. Indexes are `(work_id, parent_passage_id, sequence_number)` and `parent_passage_id`. A `DEFERRABLE INITIALLY IMMEDIATE` constraint trigger rejects cycles, cross-work parents, and invalid depth. `id`, `work_id`, and `canonical_locator` are immutable; passage identity survives every edition-text correction. Deletion is restricted while children, passage text, or source references exist.

### 5.2.6 `passage_texts`

| Column                | PostgreSQL type | Nullability and default               | Contract                                                                 |
| --------------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| `id`                  | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                     |
| `edition_id`          | `uuid`          | Required                              | FK to `editions.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable. |
| `passage_id`          | `uuid`          | Required                              | FK to `passages.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable. |
| `text_content`        | `text`          | Required                              | Exact UTF-8 edition text; nonblank; never JSON.                          |
| `normalized_checksum` | `varchar(64)`   | Required                              | Lowercase SHA-256 hex of contract-normalized text.                       |
| `source_checksum`     | `varchar(64)`   | Required                              | Lowercase SHA-256 hex of exact imported UTF-8 bytes.                     |
| `publication_state`   | `varchar(16)`   | Required; default `draft`             | One of `draft`, `validated`, `published`, `withdrawn`.                   |
| `published_at`        | `timestamptz`   | Nullable                              | Required exactly for `published` or `withdrawn`.                         |
| `created_at`          | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                       |
| `updated_at`          | `timestamptz`   | Required; default `current_timestamp` | UTC last pre-publication update.                                         |

Constraints are `UNIQUE (edition_id, passage_id)`, two valid SHA-256 values, nonblank text, closed publication state, and coherent `published_at`. Indexes are `passage_id` and `(edition_id, publication_state)`. A trigger rejects an edition/passage pair whose work IDs differ and forbids publication unless the edition is published under an enforceable license. Published rows are immutable except the one-way state transition to `withdrawn` and its timestamp; corrections require a new edition version and new passage-text row, never overwrite. Withdrawal preserves checksums and identity. Physical text retention follows the edition license, including Quran.Foundation's seven-day default unless written durable-storage permission or independent licensing is recorded.

### 5.2.7 `content_items`

| Column          | PostgreSQL type | Nullability and default               | Contract                                                                             |
| --------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `id`            | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                 |
| `canonical_key` | `varchar(160)`  | Required                              | Unique lowercase provider-independent identity; immutable.                           |
| `content_type`  | `varchar(32)`   | Required                              | One of `dua`, `dhikr`, `collection`, `article`, `guide`, or `editorial_general_dua`. |
| `origin_kind`   | `varchar(16)`   | Required                              | One of `canonical_source`, `editorial`, or `imported`.                               |
| `owning_module` | `varchar(32)`   | Required                              | One of `devotional`, `editorial`, or `knowledge`.                                    |
| `is_sensitive`  | `boolean`       | Required; default `false`             | Data-handling flag; religious content itself is not user-sensitive data.             |
| `created_at`    | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                   |
| `updated_at`    | `timestamptz`   | Required; default `current_timestamp` | UTC identity metadata update.                                                        |

Constraints are uniqueness and lowercase form of `canonical_key`; closed vocabularies; and the structural rule that `editorial_general_dua` requires `origin_kind = 'editorial'` and `owning_module = 'editorial'`, while no other type may use that combination. Indexes are `(content_type, owning_module)` and `origin_kind`. `id`, `canonical_key`, `content_type`, `origin_kind`, and `owning_module` are immutable after the first revision. The table carries no current text, translation, publication state, AI payload, or provider primary identity. Deletion is restricted while revisions or downstream domain records exist.

### 5.2.8 `content_revisions`

| Column                     | PostgreSQL type | Nullability and default               | Contract                                                                            |
| -------------------------- | --------------- | ------------------------------------- | ----------------------------------------------------------------------------------- |
| `id`                       | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                |
| `content_item_id`          | `uuid`          | Required                              | FK to `content_items.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.       |
| `predecessor_revision_id`  | `uuid`          | Nullable                              | Self-FK; same item; must be prior revision; `ON DELETE RESTRICT`; immutable.        |
| `revision_number`          | `integer`       | Required                              | Positive, gap-free, increasing per content item.                                    |
| `source_text`              | `text`          | Required                              | Exact UTF-8 source-language revision text; nonblank.                                |
| `source_language_code`     | `varchar(8)`    | Required                              | Lowercase language code; language metadata, not duplicated canonical identity.      |
| `verification_state`       | `varchar(20)`   | Required; default `unverified`        | One of `unverified`, `source_verified`, `editorial_only`, or `rejected`.            |
| `publication_state`        | `varchar(16)`   | Required; default `draft`             | One of `draft`, `in_review`, `approved`, `published`, `withdrawn`, or `superseded`. |
| `provenance_kind`          | `varchar(16)`   | Required                              | One of `manual`, `provider`, or `editorial`.                                        |
| `provider_code`            | `varchar(64)`   | Nullable                              | Required only for provider provenance; lowercase external namespace.                |
| `provider_record_id`       | `varchar(256)`  | Nullable                              | Required only for provider provenance; opaque external alias.                       |
| `source_manifest_checksum` | `varchar(64)`   | Nullable                              | Required for provider provenance; lowercase SHA-256 hex.                            |
| `content_checksum`         | `varchar(64)`   | Required                              | Lowercase SHA-256 hex of contract-normalized revision payload.                      |
| `schema_version`           | `integer`       | Required; default `1`                 | Positive payload/checksum contract version.                                         |
| `lock_version`             | `integer`       | Required; default `1`                 | Positive optimistic-concurrency token before publication.                           |
| `published_at`             | `timestamptz`   | Nullable                              | Required exactly after publication (`published`, `withdrawn`, `superseded`).        |
| `created_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                  |
| `updated_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC last mutable-state update.                                                      |

Constraints are `UNIQUE (content_item_id, revision_number)`, `UNIQUE (content_item_id, content_checksum)`, coherent predecessor/null rules, positive versions, closed states, valid checksums, provider-field all-or-none rules, and coherent publication time. Indexes are `(content_item_id, publication_state, revision_number DESC)`, `predecessor_revision_id`, `(provider_code, provider_record_id) WHERE provider_code IS NOT NULL`, and `(publication_state, published_at)`. A `DEFERRABLE INITIALLY IMMEDIATE` constraint trigger enforces: revision 1 has no predecessor; every later revision points to revision number minus one for the same item; revision numbers are gap-free at transaction end; and no predecessor cycle exists. Publication requires an allowed verification state: `source_verified` for sourced religious content and `editorial_only` only for structurally identified Editorial General Dua or non-canonical editorial material. `unverified` and `rejected` revisions cannot publish.

Published revision payloads and provenance are immutable. The only post-publication mutations are one-way `published` to `withdrawn` or `superseded`, plus `updated_at`; neither state may return to publication. Corrections insert the next revision with the published revision as predecessor, preserve the previous row, and publish only after its own verification and source references pass. Rollback means publishing a new revision whose payload intentionally restores earlier content; it never republishes or edits an old row. AI-generated or AI-transformed output may be stored only outside this canonical schema during research; no M4 column, provenance kind, state transition, or trigger permits AI output to become canonical or published content.

### 5.2.9 `source_references`

| Column                | PostgreSQL type | Nullability and default               | Contract                                                                          |
| --------------------- | --------------- | ------------------------------------- | --------------------------------------------------------------------------------- |
| `id`                  | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                              |
| `content_revision_id` | `uuid`          | Required                              | FK to `content_revisions.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable. |
| `cited_work_id`       | `uuid`          | Required                              | FK to `works.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.             |
| `cited_edition_id`    | `uuid`          | Nullable                              | FK to `editions.id`; must belong to cited work; restricted deletion.              |
| `cited_passage_id`    | `uuid`          | Nullable                              | FK to `passages.id`; must belong to cited work; restricted deletion.              |
| `reference_role`      | `varchar(20)`   | Required                              | One of `primary_source`, `supporting`, `attribution`, or `context`.               |
| `locator_label`       | `varchar(300)`  | Required                              | Human-readable structured locator; nonblank.                                      |
| `quotation`           | `text`          | Nullable                              | Optional exact excerpt, subject to license; never the canonical source payload.   |
| `quotation_checksum`  | `varchar(64)`   | Nullable                              | Required exactly when quotation exists; SHA-256 of normalized quotation.          |
| `source_url`          | `text`          | Nullable                              | HTTPS evidence URL when applicable.                                               |
| `sort_order`          | `integer`       | Required; default `0`                 | Non-negative deterministic order within a revision.                               |
| `created_at`          | `timestamptz`   | Required; default `current_timestamp` | UTC creation time; row is immutable.                                              |

Constraints enforce closed role, nonblank locator, non-negative order, valid HTTPS URL, quotation/checksum pairing, valid SHA-256, and `UNIQUE (content_revision_id, cited_work_id, cited_edition_id, cited_passage_id, reference_role, locator_label) NULLS NOT DISTINCT`. Indexes are `(content_revision_id, sort_order)`, `cited_work_id`, `cited_edition_id`, and `cited_passage_id`. A trigger enforces that cited edition and passage, when present, belong to the cited work; when both are present their edition/work context agrees. Every published sourced religious revision requires at least one `primary_source` reference, enforced by a deferred publication-integrity constraint trigger. Editorial General Dua revisions require no claim of canonical provenance but must use `editorial_only`; if a source is supplied it remains a normal structured reference and does not change the editorial classification. Rows attached to a published revision are immutable and deletion-restricted; corrections create references for the new revision.

### 5.2.10 Checksums, publication, retention, and sensitivity

All M4 checksum columns contain lowercase 64-character hexadecimal SHA-256. The application computes checksums from UTF-8 bytes using a versioned normalization contract: source checksums use exact bytes; normalized text checksums use Unicode NFC, LF line endings, and no other whitespace, punctuation, tashkeel, or character folding. PostgreSQL recomputes and validates normalized text and revision checksums through `pgcrypto` trigger functions before insert/update; the migration may enable the `pgcrypto` extension but may create no bookkeeping table. Manifest checksums validate format in PostgreSQL and are reconciled against the external manifest by verification code. Any mismatch aborts the transaction.

Publication is a database-enforced boundary. Draft and validation data may be corrected before first publication. The first transition to published freezes identity, exact text, checksum, provenance, source, license, and publication timestamp. Withdrawal preserves historical integrity while preventing public serving. No hard delete is permitted for published identity or provenance. Licensed text may require payload erasure after expiry; the recovery procedure must first withdraw it, preserve the minimum lawful checksum/attribution evidence, and execute a separately reviewed forward corrective migration consistent with the recorded license. M4 stores public religious/editorial material and operational rights metadata, not personal data; it must contain no user profiles, worship behavior, credentials, secret contracts, or precise user location.

## 5.3 Quran — 6 tables

| Table                        | Purpose and exact journey                                       | Essential constraints                                                                                       | Why it cannot wait                                                                           |
| ---------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `quran_surahs`               | Stable surah metadata and order (J2, J10).                      | Surah number unique and between 1 and 114; stable canonical key; valid ordering.                            | The Quran index and navigation depend on this canonical structure.                           |
| `quran_ayahs`                | Stable ayah identity and coordinates (J2, J10).                 | FK to surah; unique surah/ayah number; positive ordered values.                                             | Reader URLs, references, translations, and search need identity independent of edition text. |
| `quran_ayah_texts`           | Exact Quran text for an edition and ayah (J2, J3, J10).         | FKs to generic edition and ayah; unique pair; checksum; immutable after publication.                        | Canonical Arabic must be exact, edition-aware, and never hidden in JSON or a search copy.    |
| `quran_structural_markers`   | Juz, hizb, rub, page, and sajdah ranges (J2).                   | FK to edition and start/end ayahs; checked marker kind; valid ordered range; unique marker key per edition. | Durable reader navigation crosses ayah boundaries and should not distort ayah identity.      |
| `quran_translation_editions` | Translator, locale, methodology, license, and version (J2, J3). | FKs to locale and license; unique key/version; reviewed status; immutable published version.                | A Quran translation is an attributed edition, not anonymous localized text.                  |
| `quran_translation_texts`    | Translation of one ayah in one translation edition (J2, J10).   | FKs to translation edition and ayah; unique pair; checksum/version integrity.                               | Arabic/English reading and deterministic translation search require exact reviewed rows.     |

Quran does not duplicate generic `works` or `editions`. Quran-specific tables reference the shared canonical identities. Quran.Foundation provider IDs are versioned aliases in bounded provider metadata, never canonical keys. Existing structural marker representation must support `ruku` and `manzil`; translation footnotes remain attached to their approved translation edition and tafsir remains a separately attributed edition/resource within the existing schema. Audio activation is conditional on its approval gate and does not add a Release 1 table.

### 5.3.1 Executable M5 boundary and dependency order

M5 authorizes exactly the six Quran tables already counted in the frozen catalog, in this dependency order:

1. `quran_surahs`
2. `quran_ayahs`
3. `quran_ayah_texts`
4. `quran_structural_markers`
5. `quran_translation_editions`
6. `quran_translation_texts`

Together with the two M3 and eight M4 tables, M5 makes the cumulative Release 1 domain count exactly **16 of 30**. It adds no devotional, editorial-workflow, public-account, Talibeen, subscription, payment, AI, semantic-search, community, notification, audio, word, import-manifest, staging, provider-mapping, or infrastructure table. `works`, `editions`, `passages`, `passage_texts`, `licenses`, `source_references`, `content_items`, and `content_revisions` remain the M4 authorities and must not be replaced or duplicated.

Every M5 primary key is an application-generated UUIDv7 with no database default. UUID version/variant validation uses the established M3/M4 database contract. All foreign keys use `ON UPDATE RESTRICT ON DELETE RESTRICT`. All timestamps are UTC `timestamptz`; `created_at` defaults to `current_timestamp`, and `updated_at` defaults to `current_timestamp` and changes only through an authorized mutation. Canonical identities, locators, coordinates, parentage, source bindings, checksums, and published rows are immutable as specified below. Hard deletion of referenced, validated, published, withdrawn, or imported rows is prohibited.

### 5.3.2 `quran_surahs`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                                                               |
| ------------------------ | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                     | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                                                         |
| `work_id`                | `uuid`          | Required                              | FK to the single approved Quran `works.id`; immutable.                                                 |
| `passage_id`             | `uuid`          | Required                              | Unique FK to the matching chapter `passages.id`; immutable.                                            |
| `canonical_key`          | `varchar(64)`   | Required                              | Provider-independent lowercase key `quran:surah:<number>`; immutable.                                  |
| `surah_number`           | `smallint`      | Required                              | Canonical chapter order, 1 through 114; immutable.                                                     |
| `ayah_count`             | `smallint`      | Required                              | Positive approved count for the selected canonical numbering contract; immutable after validation.     |
| `name_arabic`            | `varchar(120)`  | Required                              | Exact approved Arabic chapter name; nonblank; source-controlled, not silently normalized.              |
| `revelation_order`       | `smallint`      | Nullable                              | Positive and unique when an approved scholarly source supplies it.                                     |
| `revelation_place`       | `varchar(16)`   | Nullable                              | `makkah` or `madinah` only when approved; null means no claim.                                         |
| `provider_aliases`       | `jsonb`         | Required; default `'[]'::jsonb`       | Bounded array of external aliases; never canonical identity or credentials.                            |
| `source_record_checksum` | `varchar(64)`   | Required                              | SHA-256 of exact approved source record bytes; links reconciliation evidence to the approved manifest. |
| `publication_state`      | `varchar(16)`   | Required; default `draft`             | `draft`, `validated`, `published`, or `withdrawn`.                                                     |
| `published_at`           | `timestamptz`   | Nullable                              | Required exactly for `published` or `withdrawn`.                                                       |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                                                         |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | Last authorized pre-publication or withdrawal update.                                                  |

Constraints are `UNIQUE (work_id, surah_number)`, uniqueness of `passage_id` and `canonical_key`, `surah_number BETWEEN 1 AND 114`, positive `ayah_count`, bounded revelation order, closed optional revelation place and publication state, exact canonical-key derivation, coherent `published_at`, valid lowercase SHA-256, and a provider-alias array no larger than 16 KiB. Aliases have exactly nonblank lowercase `provider_code`, `resource_type = 'surah'`, opaque `external_id`, and `provider_version`; a constraint trigger rejects a duplicate `(provider_code, resource_type, external_id, provider_version)` across Quran surahs. A trigger requires the work type to be `quran`, the passage to belong to that work, have type `chapter`, locator `surah:<number>`, depth one, and sequence equal to `surah_number`. Indexes are `(work_id, surah_number)`, `passage_id`, `publication_state`, and a GIN index on `provider_aliases`.

`id`, `work_id`, `passage_id`, `canonical_key`, `surah_number`, structural facts, and the original source checksum are immutable at first validation. Provider aliases may only be append-only additions, or receive withdrawal metadata, through a reviewed source-version transition; an existing alias can never be reassigned or rewritten. Only `validated -> published -> withdrawn` and its timestamps may otherwise change afterward. Publication additionally requires the approved Quran work, complete 114-surah reconciliation, manifest/checksum evidence, active rights, and scholarly approval.

### 5.3.3 `quran_ayahs`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                                                    |
| ------------------------ | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| `id`                     | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                                              |
| `surah_id`               | `uuid`          | Required                              | FK to `quran_surahs.id`; immutable.                                                         |
| `passage_id`             | `uuid`          | Required                              | Unique FK to the matching verse `passages.id`; immutable.                                   |
| `canonical_key`          | `varchar(80)`   | Required                              | Provider-independent lowercase key `quran:ayah:<surah>:<ayah>`; immutable.                  |
| `ayah_number`            | `smallint`      | Required                              | Positive verse number within the surah; immutable.                                          |
| `global_sequence_number` | `smallint`      | Required                              | Positive gap-free Release 1 reader order across the approved numbering contract; immutable. |
| `provider_aliases`       | `jsonb`         | Required; default `'[]'::jsonb`       | Bounded external aliases with `resource_type = 'ayah'`; never canonical identity.           |
| `source_record_checksum` | `varchar(64)`   | Required                              | SHA-256 of exact approved structural source record bytes.                                   |
| `publication_state`      | `varchar(16)`   | Required; default `draft`             | `draft`, `validated`, `published`, or `withdrawn`.                                          |
| `published_at`           | `timestamptz`   | Nullable                              | Required exactly for `published` or `withdrawn`.                                            |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                                              |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | Last authorized pre-publication or withdrawal update.                                       |

Constraints are `UNIQUE (surah_id, ayah_number)`, global uniqueness of `passage_id`, `canonical_key`, and `global_sequence_number`, positive coordinates, exact canonical-key derivation, valid checksum, bounded aliases, closed publication state, and coherent publication time. A deferred constraint trigger requires `ayah_number <= quran_surahs.ayah_count`, contiguous `1..ayah_count` coordinates per complete surah, a gap-free global sequence across a complete release, and a verse passage whose work matches the surah work, whose parent is the surah passage, whose type is `verse`, whose locator is `<surah_number>:<ayah_number>`, and whose sequence equals `ayah_number`. A separate alias constraint trigger rejects duplicate provider/version ayah mappings. Indexes are `(surah_id, ayah_number)`, `global_sequence_number`, `passage_id`, `publication_state`, and GIN on aliases.

Identity, coordinates, order, passage binding, and the original source checksum freeze at validation. Provider aliases follow the same append-only/version-transition and no-reassignment rule as surah aliases. Publication requires its surah to be published, exact per-surah and release row counts to reconcile with the approved manifest, and all referenced rights and scholarly gates to pass. No provider's global verse ID becomes an ALSAMAD locator.

### 5.3.4 `quran_ayah_texts`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                                                  |
| ------------------------ | --------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| `id`                     | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                                            |
| `edition_id`             | `uuid`          | Required                              | FK to an approved Quran `editions.id`; immutable.                                         |
| `ayah_id`                | `uuid`          | Required                              | FK to `quran_ayahs.id`; immutable.                                                        |
| `passage_text_id`        | `uuid`          | Required                              | Unique FK to the exact M4 `passage_texts.id`; immutable.                                  |
| `source_record_checksum` | `varchar(64)`   | Required                              | SHA-256 of the provider record/envelope used for reconciliation; immutable at validation. |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                                            |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | Pre-validation metadata time; not a text-edit channel.                                    |

Constraints are `UNIQUE (edition_id, ayah_id)`, uniqueness of `passage_text_id`, and valid lowercase SHA-256. Indexes are `ayah_id`, `(edition_id, ayah_id)`, and `passage_text_id`. A constraint trigger requires the edition's work to be the ayah's Quran work, the passage text's edition to equal `edition_id`, and its passage to equal the ayah passage. Publication state, exact UTF-8 text, normalized and source checksums, license, manifest checksum, retention, and withdrawal are inherited from the referenced M4 edition and passage text; M5 never stores a second text payload. Every column freezes when the referenced passage text first becomes validated. Withdrawal of the edition or passage text immediately makes this row ineligible for serving. Payload deletion required by rights is performed through the M4 withdrawal/recovery contract and cannot orphan this specialization.

### 5.3.5 `quran_structural_markers`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                              |
| ------------------------ | --------------- | ------------------------------------- | --------------------------------------------------------------------- |
| `id`                     | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                        |
| `edition_id`             | `uuid`          | Required                              | FK to the exact Quran/Mushaf `editions.id`; immutable.                |
| `parent_marker_id`       | `uuid`          | Nullable                              | Self-FK for approved containment; same edition; no cycles.            |
| `marker_kind`            | `varchar(16)`   | Required                              | `juz`, `hizb`, `rub`, `manzil`, `ruku`, `page`, or `sajdah`.          |
| `marker_number`          | `smallint`      | Required                              | Positive ordinal within kind and edition.                             |
| `canonical_key`          | `varchar(96)`   | Required                              | Provider-independent edition-scoped key `<kind>:<number>`; immutable. |
| `start_ayah_id`          | `uuid`          | Required                              | FK to inclusive start `quran_ayahs.id`; immutable at validation.      |
| `end_ayah_id`            | `uuid`          | Required                              | FK to inclusive end `quran_ayahs.id`; immutable at validation.        |
| `provider_aliases`       | `jsonb`         | Required; default `'[]'::jsonb`       | Bounded external structural aliases; never canonical identity.        |
| `source_record_checksum` | `varchar(64)`   | Required                              | SHA-256 of exact structural source record bytes.                      |
| `publication_state`      | `varchar(16)`   | Required; default `draft`             | `draft`, `validated`, `published`, or `withdrawn`.                    |
| `published_at`           | `timestamptz`   | Nullable                              | Required exactly for `published` or `withdrawn`.                      |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                        |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | Last authorized pre-publication or withdrawal update.                 |

Constraints are `UNIQUE (edition_id, marker_kind, marker_number)`, `UNIQUE (edition_id, canonical_key)`, closed kind/state, positive number, exact canonical-key derivation, valid checksum, bounded aliases, and coherent publication time. A deferred trigger requires both ayahs to belong to the edition's Quran work, start global sequence not exceed end, same-edition parentage, strict range containment, and no parent cycle. Approved containment is `juz -> hizb -> rub`; `page`, `manzil`, `ruku`, and `sajdah` may be roots unless the source decision record explicitly approves a parent relation. Page numbers and ranges belong to an exact Mushaf/layout edition and are never treated as universal Quran coordinates. Indexes are `(edition_id, marker_kind, marker_number)`, `(edition_id, start_ayah_id, end_ayah_id)`, `parent_marker_id`, `publication_state`, and GIN on aliases. Duplicate provider/version aliases are rejected.

Identity, edition, kind, number, range, parentage, and the original source checksum freeze at validation. Provider aliases follow the same append-only/version-transition and no-reassignment rule as surah aliases. Publication requires the edition and all covered ayahs/texts to be publication-eligible and the marker set's declared counts/ranges to match the approved manifest. No word boundary, glyph position, font binary, word timing, or recitation timing is authorized in this table.

### 5.3.6 `quran_translation_editions`

| Column            | PostgreSQL type | Nullability and default               | Contract                                                                                 |
| ----------------- | --------------- | ------------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`              | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                                           |
| `edition_id`      | `uuid`          | Required                              | Unique FK to the attributed M4 translation `editions.id`; immutable.                     |
| `locale_id`       | `uuid`          | Required                              | FK to `locales.id`; immutable after validation.                                          |
| `license_id`      | `uuid`          | Required                              | FK to `licenses.id`; must equal the generic edition license; immutable after validation. |
| `translator_name` | `varchar(300)`  | Required                              | Exact approved public attribution; nonblank.                                             |
| `methodology`     | `text`          | Required                              | Bounded nonblank approved methodology disclosure.                                        |
| `review_status`   | `varchar(16)`   | Required; default `pending`           | `pending`, `approved`, `rejected`, or `withdrawn`.                                       |
| `reviewed_at`     | `timestamptz`   | Nullable                              | Required for `approved`, `rejected`, or `withdrawn`; null for pending.                   |
| `created_at`      | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                                           |
| `updated_at`      | `timestamptz`   | Required; default `current_timestamp` | Last authorized pre-approval or withdrawal update.                                       |

Constraints are uniqueness of `edition_id`, closed review status, coherent review time, nonblank attribution/methodology, and methodology length at most 8 KiB. A trigger requires the generic edition to belong to the approved Quran work, use the locale language, reference the same license, and carry its provider alias, import version, manifest checksum, and publication lifecycle in the M4 fields. Indexes are `(locale_id, review_status)`, `license_id`, and `review_status`. Publication requires `review_status = 'approved'`, active license and attribution, approved source decision, complete verse reconciliation, and the generic edition to be published. Published identity and attribution freeze; withdrawal is one-way and propagates to all translation texts.

Tafsir, footnotes, transliteration, and word-by-word resources do not masquerade as translations. If separately selected within Release 1, tafsir and footnotes use an attributed generic `edition` and its exact `passage_texts` under the existing M4 relationships; this table is reserved for approved translations. No such resource is selected or activated by M5's schema unit.

### 5.3.7 `quran_translation_texts`

| Column                   | PostgreSQL type | Nullability and default               | Contract                                                            |
| ------------------------ | --------------- | ------------------------------------- | ------------------------------------------------------------------- |
| `id`                     | `uuid`          | Required; no database default         | UUIDv7 primary key; immutable.                                      |
| `translation_edition_id` | `uuid`          | Required                              | FK to `quran_translation_editions.id`; immutable.                   |
| `ayah_id`                | `uuid`          | Required                              | FK to `quran_ayahs.id`; immutable.                                  |
| `passage_text_id`        | `uuid`          | Required                              | Unique FK to the exact translated M4 `passage_texts.id`; immutable. |
| `source_record_checksum` | `varchar(64)`   | Required                              | SHA-256 of exact provider record/envelope used for reconciliation.  |
| `created_at`             | `timestamptz`   | Required; default `current_timestamp` | Creation time.                                                      |
| `updated_at`             | `timestamptz`   | Required; default `current_timestamp` | Pre-validation metadata time; not a translation-edit channel.       |

Constraints are `UNIQUE (translation_edition_id, ayah_id)`, uniqueness of `passage_text_id`, and valid lowercase SHA-256. Indexes are `ayah_id`, `(translation_edition_id, ayah_id)`, and `passage_text_id`. A constraint trigger requires the passage text edition to equal the translation edition's generic edition and its passage to equal the ayah passage. Text, checksum, publication, license, manifest, retention, and withdrawal remain governed by M4. Every field freezes at validation. A translation row is publicly eligible only while its translation edition is approved and published, its passage text is published, its locale is enabled, and all license/retention gates remain valid.

### 5.3.8 Canonical identity, provider aliases, and manifest boundary

ALSAMAD UUIDv7 IDs and canonical keys/locators are the only canonical identities. The canonical verse locator is exactly `<surah_number>:<ayah_number>` in decimal ASCII without padding; URLs and references resolve through it, never through provider IDs. Surah and ayah passage identities must match the Quran specialization one-to-one. Provider aliases are typed, versioned, opaque, bounded, non-secret JSON records; database triggers and import reconciliation reject an alias mapping to more than one canonical row. An alias may be added only through a reviewed source-version transition and may never rewrite canonical identity.

An approved import manifest is a version-controlled, immutable JSON artifact, not a Release 1 table. It contains a schema version; UUIDv7 `manifest_id`; provider code; provider snapshot/resource/version identifiers; requested resources and scopes; retrieval instant; source decision record; license and attribution evidence identifiers; retention deadline; redistribution/commercial-use decisions; expected files/resources, byte lengths, media types, row counts, and SHA-256 checksums; canonical numbering/layout declaration; adapter and normalization versions; fallback and deletion/exit procedures; and approver evidence. Its canonical UTF-8 bytes are SHA-256 hashed. The hash is persisted in `editions.source_manifest_checksum`; exact record hashes are persisted in the Quran tables and M4 passage texts. Surah/ayah structures without an edition are released only as part of a manifest-bound Quran work import whose manifest hash is recorded in the accompanying canonical Quran edition and reconciliation report. A missing or mismatched manifest, file checksum, record checksum, row count, source, license, retention decision, or approval fails closed.

### 5.3.9 Publication, withdrawal, retention, and deletion propagation

Publication is a release-level atomic transition, not row-by-row best effort. A Quran release is eligible only when canonical structure, exact passage texts, selected translations or structural layouts, manifests, row counts, checksums, licenses, attribution, source decisions, and scholarly approvals all reconcile. Draft or staging rows are never publicly served. M5 activation must use a stable release/version selector outside the canonical table count so readers cannot observe a mixed provider version.

Provider or rights withdrawal first disables fetching and public serving, records the event in operational audit evidence, and transactionally changes affected M4 editions/passage texts and M5 published rows to `withdrawn`. Dependents become ineligible even if propagation is still processing. Hard deletion is restricted. When a license requires payload deletion, the recovery process erases only the licensed payload after withdrawal and preserves only lawful minimum identity, checksum, attribution, manifest, decision, and audit evidence. Quran.Foundation material defaults to no more than seven days of cache/retention unless written durable rights or legally independent licensing is documented. Provider API availability alone never establishes redistribution, commercial, permanent-storage, or rehosting rights.

### 5.3.10 Executable M5.2 source manifest and run-evidence contract

Manifest schema v3 is the first corrected separation between immutable source/import authorization and mutable or append-only execution evidence. Both remain versioned JSON/object-storage artifacts, never physical tables.

#### Immutable `SourceImportManifest` v3

The source manifest exists before governed execution begins. Its identity is the pair `manifest_id` and `manifest_checksum`. The checksum is deterministic SHA-256 over the canonical serialization of every immutable v3 field below and no execution-evidence field.

| Field                                                        | Type/form                                                                                                | Contract                                                                                                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `manifest_schema_version`                                    | integer, exactly `3`                                                                                     | Selects the v3 reader and checksum contract.                                                                                                            |
| `manifest_id`                                                | UUIDv7 string                                                                                            | Immutable identity of one source-authorization version; never reused after any governed source/input change.                                            |
| `provider_code`                                              | lowercase string                                                                                         | External provider namespace; never canonical identity.                                                                                                  |
| `provider_environment`                                       | closed enum `sandbox`, `staging`, `production`                                                           | Declares controlled-vs-production origin; M5.2 authorizes only `sandbox`/`staging`.                                                                     |
| `resource_type`                                              | closed enum `surah`, `ayah`, `ayah_text`, `structural_marker`, `translation_edition`, `translation_text` | Matches the authorized M5 target; never a seventh resource kind.                                                                                        |
| `provider_resource_id`                                       | opaque string                                                                                            | Exact provider-scoped external alias; never a primary or canonical key.                                                                                 |
| `provider_resource_version`                                  | opaque string                                                                                            | Exact provider snapshot/resource version.                                                                                                               |
| `source_endpoint_identity`                                   | non-secret string                                                                                        | Approved HTTPS or internal source identity; never embeds credentials.                                                                                   |
| `intended_operation`, `import_mode`, `dry_run`               | bounded operation descriptor; existing import-mode enum; boolean                                         | Declares capabilities exercised and import scope; `dry_run` is always `true` in M5.2.                                                                   |
| `selected_edition_or_translation_ref`                        | required reference identifier                                                                            | Approved canonical target candidate/reference for governed execution; provider data never assigns an ALSAMAD canonical UUID.                            |
| `expected_counts`, `expected_bytes`, `expected_checksums`    | bounded maps of nonnegative values and lowercase SHA-256 hex                                             | Assertions independently known and approved before execution. An observed value is not copied here after the fact.                                      |
| `license_decision_ref`, `retention_decision`                 | decision reference and existing retention vocabulary                                                     | Approved legal and storage obligations; no contract payload.                                                                                            |
| `attribution_decision_ref`                                   | reference identifier                                                                                     | Approved attribution/provenance wording reference; never invented at import time.                                                                       |
| `in_application_display_decision`                            | explicit intended-capability decision                                                                    | Must approve an intended in-application display operation.                                                                                              |
| `commercial_use_decision`                                    | explicit intended-capability decision                                                                    | Must be resolved; denied is valid only when the operation is non-commercial.                                                                            |
| `standalone_redistribution_decision`                         | explicit intended-capability decision                                                                    | Must be resolved; denied is valid only when the operation performs no standalone redistribution.                                                        |
| `source_provenance_refs`, `approval_refs`                    | bounded arrays of identifiers                                                                            | Approved source, provenance, legal, and review evidence that authorizes execution; never generated run evidence.                                        |
| `fallback_exit_refs`                                         | bounded array of identifiers                                                                             | Approved fallback, withdrawal, deletion, and provider-exit policy references when applicable.                                                           |
| `adapter_contract_version`, `normalization_contract_version` | version strings                                                                                          | Exact authorized behavior contracts. A changed value requires a new manifest.                                                                           |
| `policy_obligations`                                         | bounded, schema-validated policy object                                                                  | Retention, synchronization, withdrawal, deletion, and other obligations that govern the intended operation; no mutable observation or provider payload. |
| `manifest_checksum`                                          | lowercase SHA-256 hex                                                                                    | Hash of canonical immutable v3 fields above, excluding only this checksum field. Execution evidence can never change it.                                |

Commercial-use and standalone-redistribution decisions must be explicitly resolved, but a known denied value is compatible with an intended operation that exercises neither capability. Unknown remains fail-closed, and no operation may exercise a denied capability.

Observed transport or normalized checksums belong to execution evidence unless the exact value was independently known and approved beforehand as an expected assertion. Request, start, fetch, checkpoint, completion, purge, or review timestamps; run, attempt, or process identity; retry/backoff state; actual counts; observed checksums; safe HTTP observations; mutable status or failure information; withdrawal/deletion observations; reconciliation; rollback; state history; generated evidence references; and final run/review disposition are prohibited from v3.

#### `ImportRunEvidence`

One immutable source manifest may link to multiple execution runs and attempts without changing manifest identity. Every `ImportRunEvidence` record binds to both `manifest_id` and `manifest_checksum` and owns or references:

- `run_id`, `attempt_id`, deterministic `run_key`, and executing process identity;
- request/start/fetch/checkpoint/completion/purge/evidence timestamps;
- retries, bounded backoff/timeout/429 outcomes, and redacted failure categories;
- checkpoints and actual/observed byte, row, transport, normalized, and rolling checksums;
- safe HTTP observations without tokens, cookies, or authorization data;
- state-transition history, current/terminal state, cancellation, staleness, and supersession evidence;
- reconciliation inputs/results, mismatches, final dry-run disposition, and review disposition;
- rollback, quarantine, staging, withdrawal, deletion, expiry, and purge outcomes; and
- payload-free audit events and generated evidence references.

Execution evidence is append-only or explicitly superseded and cannot mutate the source manifest or checksum. It remains bounded, payload-free, secret-free, provider-token-free, user-data-free, and religious-text-free.

Historical v1 manifests retain their original schema, canonical bytes, reader, and checksum meaning. Historical v2/ARC-001 manifests retain their original combined field and checksum semantics. Neither version is recomputed, migrated, or reinterpreted using v3. V2 remains historically verifiable but is not the corrected real-provider manifest contract.

### 5.3.11 Quarantine, idempotency, and reconciliation contract (M5.2)

**Quarantine.** Raw provider responses are held only in encrypted, access-limited, non-public temporary storage keyed by an import-attempt UUIDv7; quarantine is never a domain table and is never generally queryable. Default retention is seven days from `fetched_at` unless the recorded `retention_decision` grants a longer written right; expiry triggers automatic deletion. Logs and evidence redact payload and secrets, keeping only hashes, counts, and identifiers. Each quarantined object is bounded by the adapter's declared maximum payload size; oversized, malformed, or schema-invalid payloads are isolated as `quarantined` and never reach normalization or staging. Quarantined data may never feed general analytics, model training, or embeddings, and is purged, not archived, at retention expiry.

**Idempotency and checkpointing.** The deterministic import run key retains the SHA-256 identity inputs `(manifest_id, manifest_schema_version, provider_code, provider_snapshot_version, resource_id, resource_version, adapter_version)` and is additionally bound in run evidence to the exact `manifest_checksum`. `run_id` identifies one logical execution record; `attempt_id` identifies a concrete attempt or checksum-verified resume context. Operational retry with unchanged source authorization reuses the same manifest. Repeating a completed run key produces no new canonical rows; repeating a failed run resumes only from the last checksum-verified checkpoint linked to the same manifest ID/checksum, run key, resource/version, and compatible attempt context. Checkpoints identify attempt, manifest ID/hash, resource, cursor/offset, byte/row counts, rolling checksum, status, and recorded time, and contain no secret or payload. Identical replay is a no-op; conflicting, regressive, stale, cancelled, completed, or superseded progress fails closed. A changed source, resource, version, intended operation, legal decision, approved target, expected assertion, or adapter/normalization contract requires a new manifest and run key and cannot resume the old one. Canonical uniqueness in `quran_surahs`, `quran_ayahs`, `quran_structural_markers`, and the alias-duplicate triggers in 5.3.2–5.3.7 remain the final backstop against duplicate canonical rows regardless of import-harness behavior.

**Reconciliation evidence.** A completed dry run emits append-only reconciliation evidence per run/attempt, bound to the immutable manifest ID/checksum. It includes expected-vs-actual surah and ayah counts, per-surah ayah counts, global-sequence continuity, duplicate and missing locators, checksum mismatches, translation coverage, orphaned provider records, unmatched provider aliases, withdrawn/deleted provider records, license/attribution completeness, and retention-deadline compliance. Any mismatch is a blocking run failure recorded outside the source manifest; reconciliation evidence is retained as audit evidence and is never silently waived. Reconciliation may be repeated without changing manifest identity, and one authoritative dry-run attempt may later be designated by review evidence without deleting earlier failed or superseded attempts. Rollback, purge, state history, and audit evidence follow the same linkage and append-only rule.

## 5.4 Devotional content and translation — 4 tables

| Table                         | Purpose and exact journey                                                          | Essential constraints                                                                                                              | Why it cannot wait                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `devotional_items`            | Dua or dhikr identity linked to a content item (J4–J7, J10).                       | One-to-one FK to content item; unique canonical key; checked type; type-specific source/review checks.                             | Core duas and adhkar need domain behavior without duplicating canonical revision text.                      |
| `devotional_collections`      | Morning, evening, and contextual collection identity (J4, J5).                     | FK to a versioned content item for title/description; unique canonical key; checked collection kind.                               | Approved collection journeys need a stable container independent of membership order.                       |
| `devotional_collection_items` | Ordered item membership and collection-specific repetition guidance (J4, J5, J7).  | FKs to collection and item; unique pair and position; positive optional count; optional source reference; no reward field.         | Order and guidance are facts of membership and cannot be derived from the item alone.                       |
| `content_translations`        | Reviewed translation or transliteration of an exact content revision (J4–J6, J10). | FKs to revision and locale; checked rendering kind; unique revision/locale/kind/version; review outcome; published text immutable. | Bilingual devotional content requires a durable reviewed rendering without parallel translation subsystems. |

Editorial General Dua is separated by a checked devotional type, required editorial and religious-appropriateness reviews, source-claim constraints, and mandatory public labeling. A one-to-one detail table would add symmetry but no additional durable state. Repetition guidance belongs to collection membership or the reviewed item revision; it is never a worship ledger.

M6 authorizes exactly these four Release 1 devotional tables, in this dependency order: `devotional_items`; `devotional_collections`; `devotional_collection_items`; `content_translations` (`ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6, M6.1 Included scope). Together with the two M3, eight M4, and six M5 tables, M6 makes the cumulative Release 1 domain count exactly **20 of 30**. It adds no editorial, prayer/calendar, audit/publication-history, Prepared, Later, or Future table, and it neither replaces nor adds a column to `content_items` or `content_revisions`. Every M6 primary key is an application-generated UUIDv7 with no database default. All foreign keys use `ON UPDATE RESTRICT ON DELETE RESTRICT`. All timestamps are UTC `timestamptz`; `created_at` defaults to `current_timestamp`, and `updated_at` defaults to `current_timestamp` and changes only through an authorized mutation. These physical decisions are recorded in `ALSAMAD_DECISION_REGISTRY.md` REG-0001–REG-0008, with canonical-ownership and text-storage rationale in `ADR-0001` and `ADR-0002`.

### 5.4.1 `devotional_items`

| Column            | PostgreSQL type | Nullability and default               | Contract                                                                             |
| ----------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `id`              | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                 |
| `content_item_id` | `uuid`          | Required                              | Unique FK to `content_items.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable. |
| `canonical_key`   | `varchar(160)`  | Required                              | Unique lowercase provider-independent identity; immutable.                           |
| `created_at`      | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                   |
| `updated_at`      | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                      |

Constraints are `UNIQUE (content_item_id)`, `UNIQUE (canonical_key)`, and lowercase canonical-key form. A trigger requires the referenced `content_items` row to have `content_type IN ('dua', 'dhikr')` and `owning_module = 'devotional'`. Under the existing `ck_content_items__editorial_general_dua` check constraint (§5.2.7), a row with `content_type = 'editorial_general_dua'` always has `owning_module = 'editorial'` and can therefore never satisfy this trigger; Editorial General Dua never receives a `devotional_items` row (`ALSAMAD_DECISION_REGISTRY.md` REG-0001; `ADR-0001`). Indexes are `content_item_id` and `canonical_key`, both already required by their unique constraints; no further index is authorized absent a demonstrated query need.

`id`, `content_item_id`, and `canonical_key` are immutable after insert. This table stores no `content_type`, `owning_module`, verification state, publication state, or repetition guidance of its own; classification and publication eligibility remain governed entirely by the existing `content_items`/`content_revisions` mechanisms in §5.2.7–§5.2.8, and publication of the referenced revision still requires `verification_state = 'source_verified'` under the unchanged §5.2.8 trigger (REG-0002). Deletion is restricted while referenced by any `devotional_collection_items` row.

**Release 1 exclusions:** no independent type/classification column; no independent `publication_state` or `verification_state`; no repetition or count field; no provider alias or import-reconciliation checksum, since no provider-import concept applies to this table.

### 5.4.2 `devotional_collections`

| Column            | PostgreSQL type | Nullability and default               | Contract                                                                             |
| ----------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------ |
| `id`              | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                 |
| `content_item_id` | `uuid`          | Required                              | Unique FK to `content_items.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable. |
| `canonical_key`   | `varchar(160)`  | Required                              | Unique lowercase provider-independent identity; immutable.                           |
| `collection_kind` | `varchar(16)`   | Required                              | Closed values `morning`, `evening`, or `contextual`; immutable after insert.         |
| `created_at`      | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                   |
| `updated_at`      | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                      |

Constraints are `UNIQUE (content_item_id)` — a one-to-one relationship to canonical content identity, matching `devotional_items` — `UNIQUE (canonical_key)`, lowercase canonical-key form, and the closed `collection_kind` vocabulary (`ALSAMAD_DECISION_REGISTRY.md` REG-0003, REG-0004). A trigger requires the referenced `content_items` row to have `content_type = 'collection'` and `owning_module = 'devotional'`. Indexes are `content_item_id` and `canonical_key`, both already required by their unique constraints.

`id`, `content_item_id`, `canonical_key`, and `collection_kind` are immutable after insert. The collection's title and description are not stored here; they are the source text of the referenced content item's published revision, matching the `content_items`/`content_revisions` relationship already normative in §5.2.7–§5.2.8. This table carries no independent publication lifecycle. Deletion is restricted while referenced by any `devotional_collection_items` row.

**Release 1 exclusions:** no title/description column; no contextual sub-taxonomy within `collection_kind`; no independent publication or verification state.

### 5.4.3 `devotional_collection_items`

| Column                     | PostgreSQL type | Nullability and default               | Contract                                                                                                           |
| -------------------------- | --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `id`                       | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                                               |
| `devotional_collection_id` | `uuid`          | Required                              | FK to `devotional_collections.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`.                                        |
| `devotional_item_id`       | `uuid`          | Required                              | FK to `devotional_items.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`.                                              |
| `position`                 | `integer`       | Required                              | Positive deterministic order within the collection.                                                                |
| `repetition_count`         | `integer`       | Nullable                              | When present, positive sourced repetition guidance; never a persisted worship count.                               |
| `source_reference_id`      | `uuid`          | Nullable                              | Optional FK to `source_references.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; evidences the repetition guidance. |
| `created_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                                                 |
| `updated_at`               | `timestamptz`   | Required; default `current_timestamp` | UTC last administrative update.                                                                                    |

Constraints are `UNIQUE (devotional_collection_id, devotional_item_id)`, `UNIQUE (devotional_collection_id, position)`, positive `position`, and `repetition_count IS NULL OR repetition_count > 0`. No cross-table trigger is required: both referenced tables already restrict their own referential scope to `owning_module = 'devotional'` content (§5.4.1, §5.4.2), so ordinary FK/unique/check enforcement is sufficient. Indexes are `devotional_item_id` and `source_reference_id`, neither of which is the leading column of an existing unique constraint; `devotional_collection_id` needs no separate index, since it already leads both unique constraints above.

This table carries no reward, streak, or completion-count field (`ALSAMAD_DECISION_REGISTRY.md` REG-0005). Membership rows are not append-only: `position`, `repetition_count`, `source_reference_id`, and row presence may be administratively inserted, reordered, or removed. Ordinary physical deletion is permitted for membership changes; no soft-delete column and no membership-history table is introduced, since nothing in the schema references a `devotional_collection_items` row by foreign key (REG-0008).

**Release 1 exclusions:** no reward, streak, or worship-ledger field; no free-text second provenance system; no soft-delete or history infrastructure.

### 5.4.4 `content_translations`

| Column                | PostgreSQL type | Nullability and default               | Contract                                                                                                                                            |
| --------------------- | --------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | `uuid`          | Required; no database default         | Application-generated UUIDv7 primary key; immutable.                                                                                                |
| `content_revision_id` | `uuid`          | Required                              | FK to `content_revisions.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.                                                                   |
| `locale_id`           | `uuid`          | Required                              | FK to `locales.id`; `ON UPDATE RESTRICT ON DELETE RESTRICT`; immutable.                                                                             |
| `rendering_kind`      | `varchar(16)`   | Required                              | Closed values `translation` or `transliteration`; immutable.                                                                                        |
| `rendering_version`   | `integer`       | Required; default `1`                 | Positive version of this revision/locale/kind rendering; immutable.                                                                                 |
| `text_content`        | `text`          | Required                              | Exact UTF-8 rendered text; nonblank; immutable once first eligible.                                                                                 |
| `content_checksum`    | `varchar(64)`   | Required                              | Lowercase SHA-256 hex of the normalized `text_content`, under the existing §5.2.10 normalization contract; immutable once first eligible.           |
| `review_status`       | `varchar(16)`   | Required; default `pending`           | One of `pending`, `approved`, `rejected`, `withdrawn`, matching the vocabulary already used by `quran_translation_editions.review_status` (§5.3.6). |
| `reviewed_at`         | `timestamptz`   | Nullable                              | Required exactly for `approved`, `rejected`, or `withdrawn`; null for `pending`.                                                                    |
| `created_at`          | `timestamptz`   | Required; default `current_timestamp` | UTC creation time.                                                                                                                                  |
| `updated_at`          | `timestamptz`   | Required; default `current_timestamp` | UTC last pre-eligibility update.                                                                                                                    |

Constraints are `UNIQUE (content_revision_id, locale_id, rendering_kind, rendering_version)`, nonblank `text_content`, a valid lowercase SHA-256 `content_checksum`, closed `rendering_kind`/`review_status`, positive `rendering_version`, and coherent `reviewed_at`. No cross-table trigger is required; rendering eligibility is a read-time derivation, not a write-time constraint (see below). Indexes are `locale_id`, which is not the leading column of the unique constraint above; `content_revision_id` needs no separate index, since it already leads that constraint.

There is no independent `publication_state` column (`ADR-0002`). Rendering/public eligibility is derived, never stored: `review_status = 'approved'` **and** the referenced `content_revisions.publication_state = 'published'` **and** the referenced `locales.is_enabled = true`. Once first eligible, every column except `review_status` (one-way toward `withdrawn`) and `updated_at` is immutable; a correction inserts a new `rendering_version` row rather than editing the eligible one, matching the correction pattern already normative for `content_revisions` (§5.2.8). No fifth M6 table is introduced, and `passage_texts` is not reused (`ADR-0002`).

**Release 1 exclusions:** no independent `publication_state` column; no shared/fifth text-specialization table; no rendering kind beyond `translation`/`transliteration`; no provider or import concept.

## 5.5 Editorial — 3 tables

| Table                   | Purpose and exact journey                                             | Essential constraints                                                                                          | Why it cannot wait                                                              |
| ----------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `editorial_users`       | Staff identity independent of optional public accounts (J11, J12).    | Unique staff subject; active/disabled state; no public profile dependency.                                     | Every review and privileged content action must identify a responsible human.   |
| `editorial_role_grants` | Scoped least-privilege staff authorization (J11, J12).                | FK to editorial user; checked role and scope; unique non-overlapping active grant; effective dates.            | Publication and religious review require enforceable separation of duties.      |
| `review_records`        | Immutable language, source, religious, and editorial decisions (J11). | FK to exact revision or translation and reviewer; checked stage/outcome; unique decision version; append-only. | Required review gates cannot be reconstructed safely from mutable status alone. |

Queues are database views over status. Approvals are typed review records followed by publication events. Locks use optimistic concurrency. Assignments, shareable preview tokens, scheduled publication, and persisted queues remain Prepared until real workflow volume requires them.

## 5.6 Prayer and calendar configuration — 5 tables

| Table                        | Purpose and exact journey                                               | Essential constraints                                                                                                      | Why it cannot wait                                                                               |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `prayer_calculation_methods` | Versioned calculation authority, parameters, and disclosure (J8).       | Unique code/version; checked method kind; schema-validated bounded parameters; published version immutable.                | Prayer output must disclose and reproduce the selected calculation method.                       |
| `prayer_regional_defaults`   | Geographic default method, Asr convention, and high-latitude rule (J8). | FKs to area and method; checked conventions; effective range; no overlapping active scope.                                 | Safe regional defaults are required while preserving explicit user choice.                       |
| `hijri_calendar_methods`     | Versioned calculated or observed calendar method (J9).                  | Unique code/version; checked method kind; authority identity and bounded parameters; immutable published version.          | The platform must not imply one universal Hijri calculation.                                     |
| `hijri_regional_adjustments` | Sourced regional qualification or shift (J9).                           | FKs to area and method; bounded adjustment; effective date range; source/authority fields; no conflicting confirmed scope. | Regional observation and authority differences are durable facts that affect the displayed date. |
| `muslim_events`              | Canonical Muslim event with localized content and recurrence rule (J9). | Unique canonical key; validated bounded recurrence JSONB; method applicability; source/version; checked visibility.        | The Release 1 calendar requires independently managed event identity and rules.                  |

Daily prayer times, next-prayer state, displayed Hijri date, and event occurrences are derived from inputs and configuration. They may be exposed through views or caches but are not canonical tables. Islamic month names and standard calendar labels remain locale configuration.

## 5.7 Audit and publication history — 2 tables

| Table                | Purpose and exact journey                                                            | Essential constraints                                                                                                      | Why it cannot wait                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `publication_events` | Append-only publish, correct, archive, restore, and withdraw transitions (J11, J12). | FK to exact revision and actor; checked transition; unique idempotency key; reason for sensitive transitions; append-only. | The current public state and correction history must be accountable without separate approval, withdrawal, and correction tables. |
| `audit_events`       | Minimal append-only privileged mutation trail (J11, J12).                            | Actor/action/target/time/correlation fields; unique event key; immutable; no duplicated religious payload or secrets.      | Security and editorial accountability require a durable trail beyond domain publication events.                                   |

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

| Journey                          | Required tables or mechanism                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Arabic/English experience        | `locales` plus version-controlled UI locale files.                                                                       |
| Quran index and reader           | `works`, `editions`, `licenses`, `quran_surahs`, `quran_ayahs`, `quran_ayah_texts`.                                      |
| Quran translation                | `quran_translation_editions`, `quran_translation_texts`.                                                                 |
| Quran structural navigation      | `quran_structural_markers`.                                                                                              |
| Source transparency              | `works`, `editions`, `passages`, `passage_texts`, `source_references`, `licenses`.                                       |
| Dua or dhikr detail              | `content_items`, `content_revisions`, `devotional_items`, `content_translations`, `source_references`.                   |
| Morning/evening collections      | Above plus `devotional_collections`, `devotional_collection_items`.                                                      |
| Editorial General Dua separation | Checked devotional type, required review records, source-claim constraints, and public labeling.                         |
| Prayer times                     | `geographic_areas`, `prayer_calculation_methods`, `prayer_regional_defaults`; outputs derived.                           |
| Hijri calendar and events        | `geographic_areas`, `hijri_calendar_methods`, `hijri_regional_adjustments`, `muslim_events`; occurrences derived.        |
| Deterministic search             | Canonical tables plus generated columns, indexes, and a union/materialized view.                                         |
| Editorial publishing             | `editorial_users`, `editorial_role_grants`, `review_records`, `content_revisions`, `publication_events`, `audit_events`. |
| Correction or withdrawal         | New revision where applicable plus `publication_events` and `audit_events`.                                              |
| Tasbeeh                          | Local device storage; no PostgreSQL table.                                                                               |

# 9. Prepared Identity and Synchronized Preferences

Core Release 1 operates without server-side user accounts. Quran, duas, adhkar, prayer, calendar, search, and tasbeeh are guest-first. If authentication, bookmarks, and synchronization are separately approved for launch, add this five-table package through an additive migration:

| Prepared table     | Purpose                                                  | Minimum integrity boundary                                               |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `users`            | Private account root.                                    | Stable UUID, checked status, deletion lifecycle.                         |
| `user_identities`  | External authentication-provider link.                   | Unique provider/external subject; provider metadata minimized.           |
| `user_sessions`    | Revocable server session when not provider-managed.      | Unique hashed token, expiry, revocation; no raw token storage.           |
| `user_preferences` | Synchronized locale, theme, reading, and prayer choices. | One row per user; critical typed fields and bounded non-critical JSONB.  |
| `user_saved_items` | Bookmarks and reading position.                          | Unique user/target/kind; constrained target types and privacy ownership. |

This package raises the physical count from 30 to 35 only if the pending product decision is approved. Separate provider, email, device, consent, notification, or preference tables require their own proven workflows; they are not included for symmetry.

# 10. Additive Expansion Path

Stable UUIDs and canonical keys for works, editions, passages, content items, locales, ayahs, and geographic areas protect later modules from destructive redesign.

| Module              | Additive path                                                                                                                                                                                     | Release 1 physical tables |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------: |
| Hadith              | Add collection, book, chapter, record, grade assertion, and translation tables referencing shared works, editions, passages, licenses, locales, reviews, and publication history.                 |                         0 |
| Talibeen Al-Halal   | Add an isolated privacy-first schema after identity is approved; reference users but keep profiles, discovery projections, introductions, conversations, blocks, and retention within the module. |                         0 |
| Subscriptions       | Add products, plans, effective prices, subscriptions, entitlements, and redacted provider events; never place billing state on content or users directly.                                         |                         0 |
| Alsamad Balance     | Add an isolated immutable ledger only after policy approval; link accounts to users and never reward worship, time, repetition, streaks, or popularity.                                           |                         0 |
| Semantic search     | Build rebuildable embeddings from versioned canonical search projections; store source ID/version and model version without changing canonical truth.                                             |                         0 |
| AI governance       | Add corpus manifests, prompt/model versions, evaluations, incidents, and minimized traces only when runtime AI is authorized.                                                                     |                         0 |
| Notifications       | Add preferences, templates, delivery attempts, and a transactional outbox immediately before a real asynchronous channel ships.                                                                   |                         0 |
| Knowledge Graph     | Add nodes and edges as projections over stable canonical identifiers; promote only independently curated relations to durable state.                                                              |                         0 |
| Media/audio         | Add licensed asset, reciter, manifest, and accessibility records when launch scope confirms managed audio; keep binaries in object storage.                                                       |                         0 |
| Advanced moderation | Add report, evidence, case, action, restriction, and appeal tables when public mutation or community workflows require them.                                                                      |                         0 |

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

| Risk                                                    | Control                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| A checked vocabulary later needs editorial management.  | Add a lookup table and FK through a forward migration while preserving stable codes.                                                        |
| A search view becomes too slow.                         | Measure plans, then add a rebuildable materialized or physical projection.                                                                  |
| Import lineage becomes multi-stage.                     | Add an append-only provenance-event table referencing stable editions/revisions.                                                            |
| Editors need assignments or simultaneous editing.       | Add assignments/leases; optimistic concurrency protects the initial workflow.                                                               |
| Bounded recurrence or provider JSONB drifts.            | Validate against explicit application and database checks; version the schema.                                                              |
| One geographic hierarchy becomes operationally awkward. | Split through additive subtype tables while keeping geographic IDs stable.                                                                  |
| Editorial General Dua is mislabeled.                    | Enforce checked type, required review gates, source-claim constraints, tests, and public presentation rules in the publication transaction. |
| Accounts launch later.                                  | Migrate local preferences explicitly into the five-table synchronized package with user consent.                                            |

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
- Authentication remains an additive five-table Prepared package and is not active in Release 1.
- Quran.Foundation integration preserves the approved 30-table boundary; it adds provider mappings and provenance within existing bounded structures, not an optional 31st table.
- Every table has one owning module and a stable identifier strategy.
- No giant unconstrained polymorphic table, premature event sourcing, premature partitioning, or speculative integration table is introduced.
- This document contains no SQL migration, application code, or deployment authorization.
