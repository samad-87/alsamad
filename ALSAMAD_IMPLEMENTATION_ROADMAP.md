# ALSAMAD Implementation Roadmap

Authoritative dependency-aware implementation roadmap derived from the approved architecture documents.

## Mission

Convert approved architecture into an implementation sequence while preventing premature scope.

## Core Principles

- Architecture Before Implementation
- Smallest Durable Release
- Dependency-Ordered Delivery
- Evidence Before Completion
- No Premature Future Scope
- Security and Accessibility as Release Gates
- Religious Integrity Before Speed
- Real PostgreSQL Verification
- Additive Evolution
- Reversible Delivery
- One Approved Scope at a Time
- Mobile First, Desktop Excellent

### Mobile-first UI milestone requirement

ALSAMAD is a permanent Mobile First product (`ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §2, `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §2.12/§43). Every future UI implementation milestone's objective or acceptance criteria must explicitly state its mobile-first status, using wording such as "Designed Mobile First. Desktop Expanded." A UI milestone that does not record this status is incomplete and does not authorize implementation. This requirement applies only to milestones that implement UI; it does not retroactively reopen or modify the database-only milestones already defined below.

## Phase 0: Repository and architecture baseline

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 1: Release 1 scope freeze

### Objective

Freeze the exact Release 1 product, module, provider, authentication, database, and delivery boundaries and produce the approved handoff into M2. M1 is a documentation-and-verification milestone. It permits no application implementation.

### Dependencies

- M0 Architecture Baseline Locked.
- M0.5 Quran.Foundation Architecture Alignment complete.
- All twelve authoritative architecture documents and this roadmap are present and semantically consistent for Release 1.
- Prepared, Approved Later Module, and Future / Research capabilities remain isolated from Release 1.
- The verified M0.5 commit is synchronized with `origin/main` before M1 may pass for shared execution. A verified local-only M0.5 commit permits preparation and review of this contract, but not M1 completion.

### Definitive Release 1 capability checklist

| Release 1 capability                             | Boundary                                                                                                        | Owning module                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Arabic and English guest-first public experience | Arabic RTL and English LTR at launch; architecture remains ready for unlimited languages                        | Global and locales                 |
| Home/Today composition                           | Calm, sourced daily composition from approved Release 1 capabilities                                            | Public experience composition      |
| Quran index and reader                           | Provider-independent public contracts and canonical ALSAMAD identifiers                                         | Quran                              |
| Approved Quran text and script editions          | Only exact editions that pass rights, integrity, attribution, and production gates                              | Quran                              |
| Selected approved translations                   | Edition-specific, attributed, reviewed, and licensed                                                            | Quran                              |
| Selected approved tafsir and footnotes           | Only where authorized, attributed, and editorially approved                                                     | Quran                              |
| Quran audio                                      | Conditional; enabled only when all written rights and technical production gates pass                           | Quran                              |
| Morning and evening adhkar                       | Sourced, reviewed, and publication-controlled                                                                   | Devotional content and translation |
| Duas                                             | Sourced, reviewed, classified, translated where approved, and publication-controlled                            | Devotional content and translation |
| Editorial General Duas                           | Explicitly classified and visibly separated from Quranic and authenticated Sunnah content                       | Devotional content and translation |
| Deterministic cross-domain search                | Locally owned, source-aware, and limited to approved published content                                          | Deterministic search               |
| Quran.Foundation Search                          | Optional Quran-only upstream after written production approval; never the unified-search owner                  | Quran                              |
| Prayer times                                     | Method and regional configuration disclosed; outputs derived                                                    | Prayer and calendar configuration  |
| Hijri calendar and Muslim events                 | Qualified method, regional adjustment, and disclosure                                                           | Prayer and calendar configuration  |
| Tasbeeh                                          | Local-first; no account, cloud synchronization, scoring, or streak                                              | Public experience composition      |
| Staff-only administration authentication         | Mandatory before any Release 1 administration is usable                                                         | Editorial administration           |
| Editorial lifecycle                              | Import, review, correction, withdrawal, publication, and audit                                                  | Editorial administration           |
| Accessibility                                    | Release gate across public and administrative surfaces                                                          | Quality assurance                  |
| SEO                                              | Locale-aware, canonical, structured, and limited to approved public content                                     | Public experience composition      |
| Performance                                      | Release gate with safe provider degradation                                                                     | Infrastructure and deployment      |
| Security                                         | Least privilege, server-only secrets, authorization, and audit are release gates                                | Security                           |
| Observability                                    | Provider, content, application, and operational health without religious-content distortion                     | Observability and monitoring       |
| Privacy-safe minimal analytics                   | No worship scoring, invasive profiling, or unnecessary personal data                                            | Analytics and product intelligence |
| PWA/offline shell                                | Safe application shell and degraded behavior; no unauthorized permanent provider content or offline audio packs | Infrastructure and deployment      |

### Definitive excluded-scope checklist

| Excluded from Release 1                                       | Classification / reason                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| Public user accounts and public profiles                      | Prepared; guest-first Release 1                            |
| Synchronized cloud bookmarks and reading progress             | Prepared; requires later identity/privacy approval         |
| Quran.Foundation OAuth/User APIs                              | Prepared; never canonical ALSAMAD identity                 |
| Streaks and worship scoring                                   | Prohibited                                                 |
| QuranReflect social features                                  | Later or Future; no Release 1 social surface               |
| Rooms, posts, comments, public notes, and community features  | Excluded                                                   |
| Talibeen                                                      | Approved Later Module                                      |
| Subscriptions, payments, and Alsamad Balance                  | Approved Later Module                                      |
| Full Hadith corpus                                            | Approved Later Module                                      |
| Runtime generative religious AI                               | Future / Research; prohibited in Release 1 runtime answers |
| Semantic search, embeddings, and RAG indexing                 | Future / Research and subject to separate rights approval  |
| Advanced notifications                                        | Later                                                      |
| Local GPU infrastructure                                      | Future / Research                                          |
| Multi-region deployment                                       | Later                                                      |
| Offline audio packs                                           | Excluded unless separately authorized after Release 1      |
| Permanent Quran.Foundation storage without written permission | Prohibited; seven-day default applies                      |

All capabilities classified as Prepared, Approved Later Module, or Future / Research remain excluded even when an architecture document describes their additive future shape.

### Authoritative M1 decisions

1. Release 1 uses exactly 30 physical PostgreSQL tables.
2. No optional 31st table is authorized.
3. Additional tables require a post-M1 architecture decision. This freeze supersedes any earlier allowance to vary the Release 1 count during implementation; the approved 30-table catalog remains authoritative.
4. Staff authentication is mandatory for Release 1 administration.
5. Public-user authentication remains Prepared and excluded from Release 1.
6. Quran.Foundation is the primary Quran provider behind provider-independent adapters.
7. ALSAMAD canonical identifiers and public contracts remain provider-independent.
8. Quran audio is conditionally in scope and must ship disabled if licensing or technical gates do not pass.
9. No misleading audio placeholder may be shown when audio is disabled or unavailable.
10. Quran.Foundation content retention follows the seven-day default unless written permission or independent licensing permits longer storage.
11. Unified deterministic search remains locally owned.
12. Quran.Foundation Search is an optional approved upstream for Quran-only search after production approval.
13. AI remains outside runtime Release 1 religious answers.
14. Core reading operates without optional AI and Quran.Foundation User APIs.
15. Worship scoring and streak mechanics are prohibited.

### Module ownership matrix

| Owning module                      | Release 1 ownership                                                                                                                                    | Physical tables |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------: |
| Global and locales                 | Locale registry, direction/fallback, geographic identity, Arabic/English launch readiness, unlimited-language architecture                             |               2 |
| Content integrity                  | Works, editions, passages, exact text, licenses, sources, content identities, immutable revisions, provenance                                          |               8 |
| Quran                              | Canonical surah/ayah identity, approved Quran renderings, translations, structure, conditional audio, provider adapters and Quran-only upstream search |               6 |
| Devotional content and translation | Adhkar, duas, Editorial General Dua classification, collections, translations and transliterations                                                     |               4 |
| Editorial                          | Staff identities/grants and review records; import, review, approval, correction, withdrawal, and publication workflows                                |               3 |
| Prayer and calendar configuration  | Prayer methods/defaults, Hijri methods/adjustments, Muslim events, regional disclosure                                                                 |               5 |
| Audit and publication history      | Append-only publication and privileged-action audit evidence                                                                                           |               2 |
| Deterministic search               | Rebuildable local projections, normalization, filtering and ranking; no canonical or physical Release 1 table                                          |               0 |
| Public experience composition      | Home/Today, navigation, local-first tasbeeh, SEO and PWA presentation; no canonical table ownership                                                    |               0 |
| Security                           | Authentication and authorization policy, secrets, abuse controls and security gates; no separate canonical table ownership                             |               0 |
| Quality assurance                  | Accessibility, religious integrity, RTL/LTR, security and release evidence; no canonical table ownership                                               |               0 |
| Infrastructure and deployment      | PostgreSQL lifecycle, safe degraded behavior, PWA/offline shell and operational delivery; no product table ownership                                   |               0 |
| Observability and monitoring       | Operational signals and provider health; no product-database metric tables                                                                             |               0 |
| Analytics and product intelligence | Privacy-safe minimal analytics; no Release 1 product tables or worship metrics                                                                         |               0 |
| **Total**                          | **Exactly one owner for every capability and physical table**                                                                                          |          **30** |

### Database activation boundary

- The only authorized Release 1 physical database boundary is the 30-table catalog in `ALSAMAD_DATABASE_ARCHITECTURE.md`: 2 Global and locales, 8 Content integrity, 6 Quran, 4 Devotional content and translation, 3 Editorial, 5 Prayer and calendar configuration, and 2 Audit and publication history tables.
- Views, materialized views, indexes, constraints, and derived projections do not authorize an additional canonical physical table.
- Deterministic search owns zero physical Release 1 tables. A physical `search_documents` table is not authorized by M1.
- Public identity and synchronized-preference tables remain Prepared and inactive.
- Conditional Quran audio adds no Release 1 table.
- Prepared, Later, and Future modules add zero Release 1 tables.
- M2 must activate tables only in its explicitly authorized dependency sequence. It may not infer permission to create all domain tables at once.

### Provider dependency boundary

| Boundary                | M1 freeze                                                                                                                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary provider        | Quran.Foundation is primary for approved Quran content only.                                                                                                                                                               |
| Internal ports          | Provider use is mediated by the approved provider-independent contracts, beginning with `QuranContentProvider`; optional search, audio, catalog, sync, and user-interoperability ports remain separately capability-gated. |
| Public/domain contracts | Raw provider payloads, IDs, cursors, errors, URLs, credentials, and response objects never cross into ALSAMAD public APIs or canonical domain contracts.                                                                   |
| Canonical ownership     | ALSAMAD owns stable canonical identifiers, public routes, normalized contracts, editorial state, publication decisions, and unified deterministic search.                                                                  |
| Credentials             | Server-side only, environment-separated, least privilege, and never exposed to public clients.                                                                                                                             |
| Retention               | Seven days by default; longer retention requires written permission or independent direct licensing.                                                                                                                       |
| Content activation      | Exact editions, licenses, attribution, integrity checks, quotas, credentials, fallback, deletion/exit, and production approval must pass before activation.                                                                |
| Audio                   | Conditional and fail-closed: disabled with no misleading placeholder unless rights and technical gates pass.                                                                                                               |
| Search                  | Unified search remains local. Quran.Foundation Search may serve Quran-only queries only after its production gate and with deterministic local fallback.                                                                   |
| User APIs               | OAuth/User APIs remain Prepared; core reading cannot depend on them.                                                                                                                                                       |
| Failure behavior        | Preserve verified reading and safe degraded behavior; disable optional refresh, upstream search, and audio before core reading.                                                                                            |

### Application capabilities

M1 authorizes no application code, UI, routes, provider integration, background jobs, or runtime behavior. The capability and exclusion checklists are frozen inputs to later phases only.

### Admin capabilities

M1 authorizes no administration implementation. Later Release 1 administration must require staff authentication and least-privilege authorization and must support the approved editorial and audit lifecycle. Public authentication remains separate and excluded.

### Security requirements

- No provider credential or provider contract is exposed to a public client.
- Staff authentication and scoped authorization are mandatory before administrative access.
- Guest-first public reading does not depend on user identity.
- Provider failures, licensing failures, or unavailable optional capabilities fail closed and degrade safely.
- No M1 activity creates secrets, application data, tables, or deployed infrastructure.

### QA requirements

- Cross-document Release 1 consistency review.
- Deferred-scope review for every Prepared, Later, and Future capability.
- Exact ownership verification for every included capability and all 30 physical tables.
- Database, authentication, audio, provider-adapter, retention, search, AI, scoring, and streak boundary verification.
- Roadmap-reference verification and `git diff --check`.
- Repository status and synchronization inspection.

### Observability requirements

M1 creates no instrumentation. It freezes observability as a Release 1 gate covering application health, provider health, content freshness/withdrawal, import integrity, safe degradation, and operational evidence without recording worship behavior as a score.

### Analytics requirements

M1 creates no analytics implementation. Release 1 analytics remains minimal and privacy-safe, must avoid unnecessary identity or sensitive religious profiling, and must never introduce worship scoring, streaks, or engagement manipulation.

### Artifacts

This roadmap section is the sole M1 artifact and contains:

- the definitive Release 1 capability checklist;
- the definitive excluded-scope checklist;
- the module ownership matrix;
- the database activation boundary;
- the provider dependency boundary;
- the implementation-order handoff to M2;
- the unresolved-decision register categorized by blocking gate;
- the M1 acceptance checklist; and
- the M1 completion-evidence checklist.

No separate M1 document is required or authorized.

### Unresolved-decision register by blocking gate

These are activation or implementation gates, not permission to change the frozen Release 1 boundary.

| Blocking gate             | Unresolved operational selection                                                                                                                                                           | Blocks                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| Shared-execution gate     | Synchronize the verified M0.5 commit and this approved M1 roadmap amendment with `origin/main` in an authorized later request                                                              | M1 PASS for shared execution and start of M2                                    |
| Quran content gate        | Production access, exact text/script editions, translations, tafsir, footnotes, attribution, licenses, quotas, checksums/manifests, retention rights, fallback and deletion/exit procedure | Quran content activation, not M2 tooling foundation                             |
| Quran audio gate          | Reciters, commercial playback rights, attribution, cache/proxy/download policy, bandwidth, CORS/Range behavior, withdrawal and deletion                                                    | Audio activation only; failure means audio ships disabled                       |
| Quran search gate         | Production approval, quotas, privacy, edition mapping, relevance validation and fallback                                                                                                   | Quran.Foundation Quran-only Search; local deterministic search remains required |
| Staff authentication gate | Exact approved staff authentication provider and operational configuration                                                                                                                 | Administrative activation, not public guest access or M2 tooling foundation     |
| Devotional content gate   | Exact approved datasets, sources, licenses and review authorities                                                                                                                          | Devotional content import/publication                                           |
| Prayer/Hijri gate         | Exact providers/method datasets, regional policies and disclosures                                                                                                                         | Prayer/Hijri activation                                                         |
| Infrastructure gate       | PostgreSQL provider, hosting, object storage, backup/recovery objectives and production regions                                                                                            | Production deployment; local/test M2 foundation may proceed                     |
| Presentation gate         | Approved design tokens and Quran font rights/selection                                                                                                                                     | Public UI activation                                                            |
| Operations gate           | Analytics, observability and security provider selections plus launch date                                                                                                                 | Production launch                                                               |

No unresolved decision blocks the first M2 implementation unit, provided M1 has passed and M2 remains limited to repository and database tooling foundation without domain tables.

### Implementation-order handoff to M2

The first and only approved initial M2 implementation unit is:

> Repository and database tooling foundation for the approved 30-table Release 1 PostgreSQL architecture.

Only after M1 PASS, that unit may include:

- the database tooling selection already permitted by the architecture;
- environment validation;
- PostgreSQL local/test lifecycle;
- migration framework foundation;
- database safety guards; and
- a real PostgreSQL verification harness.

It may create no domain tables beyond the sequence explicitly authorized by M2. M1 itself must not implement any part of this unit.

### M1 acceptance checklist

- [ ] Release 1 included scope is explicit.
- [ ] Release 1 exclusions are explicit.
- [ ] Every capability and physical table has one owning module.
- [ ] Exactly 30 Release 1 physical tables remain authorized, with no optional 31st table.
- [ ] Staff authentication and public authentication are clearly separated.
- [ ] Audio is frozen as conditional and fail-closed with no misleading placeholder.
- [ ] Quran.Foundation ownership and provider-independent adapter boundaries are explicit.
- [ ] All Prepared, Approved Later Module, and Future / Research capabilities remain excluded.
- [ ] No semantic contradiction remains across the authoritative Release 1 documents.
- [ ] M2 can identify its first implementation unit without inference.
- [ ] All shared architecture commits are synchronized with `origin/main`.
- [ ] The working tree is clean except explicitly acknowledged pre-existing user content.
- [ ] No implementation has started.

### M1 completion-evidence checklist

- [ ] Current branch recorded.
- [ ] HEAD hash recorded.
- [ ] `origin/main` hash recorded.
- [ ] Branch synchronization status recorded.
- [ ] Roadmap-only diff reviewed.
- [ ] `git diff --check` passed.
- [ ] Authoritative-document consistency check passed.
- [ ] Release 1 inclusion matrix reviewed.
- [ ] Release 1 exclusion matrix reviewed.
- [ ] Ownership matrix reviewed.
- [ ] Exact 30-table boundary confirmed.
- [ ] Staff/public authentication boundary confirmed.
- [ ] Conditional audio boundary confirmed.
- [ ] Quran.Foundation adapter and retention boundaries confirmed.
- [ ] Exact first M2 implementation unit recorded.
- [ ] No code, UI, migration, test, deployment, commit, or push occurred during M1.

### Acceptance criteria

M1 passes only when every M1 acceptance and completion-evidence item is satisfied. A local roadmap amendment may be complete while M1 remains blocked from PASS by unsynchronized authoritative commits, a dirty unacknowledged worktree, a cross-document contradiction, or any implementation activity.

### Completion evidence

The M1 report must include the current branch, exact `HEAD` and `origin/main` hashes, synchronization status, roadmap diff, `git diff --check`, consistency and deferred-scope review results, all three scope/ownership matrices, the 30-table/authentication/audio/provider confirmations, the exact first M2 unit, changed-file inventory, and confirmation that no code, UI, migration, test, push, or deployment occurred.

### Rollback/recovery

If this M1 amendment introduces a contradiction, revert only the M1 change to `ALSAMAD_IMPLEMENTATION_ROADMAP.md`, preserve all other architecture work and pre-existing user content, do not begin M2, and report the exact inconsistency.

### Release status

Documentation and verification only. M1 is `PASS` only after every checklist item passes, including synchronization of shared architecture commits with `origin/main`. Until then M1 is `BLOCKED`; M2 is not authorized.

## Phase 2: Database foundation

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 3: Global locales and regional configuration

### Objective

Implement the provider-independent Global Locales and Regional Configuration foundation by activating exactly the first two authorized Release 1 domain tables, `locales` and `geographic_areas`, in dependency order. Preserve the frozen 30-table Release 1 catalog and establish database-enforced canonical locale identity, direction, fallback safety, geographic hierarchy, and regional identity without exposing a user interface or public API.

### Included scope

- Drizzle mappings for exactly `locales` and `geographic_areas`.
- One reviewed, forward-only migration for those two tables, their constraints, foreign keys, indexes, trigger functions, and constraint triggers.
- Deterministic, idempotent Release 1 seed rows for Arabic and English only.
- Real PostgreSQL verification of persistence, constraints, cycles, hierarchy, seed idempotency, and physical table count.
- Provider-independent canonical codes and UUIDv7 application-generated identities.

### Explicitly excluded scope

- Every other Release 1 physical table and every Prepared, Approved Later, or Future / Research table.
- Geographic seed rows, geographic imports, or administrative geographic workflows.
- A geographic translation table, JSON localization payload, or localized public area names.
- Quran.Foundation, Quran data, UI, public APIs, authentication, and administration features.
- M4 Content Integrity implementation.

### Dependencies

- M1 Release 1 scope freeze and exact 30-table catalog: PASS.
- M2 repository and database tooling foundation, including real PostgreSQL verification: PASS.
- The executable definitions in `ALSAMAD_DATABASE_ARCHITECTURE.md` section 5.1 are authoritative for all M3 columns and rules.

### Artifacts

- `src/db/schema.ts`
- `drizzle/0001_global_locales_geography.sql`
- `drizzle/meta/_journal.json`
- `scripts/db-seed.mjs`
- `scripts/db-verify.mjs`
- Database tests authorized below
- Schema diff; constraint, trigger, index, and seed inventories; and real PostgreSQL evidence

### Allowed files

Implementation may modify only:

- `src/db/schema.ts`
- `src/db/ids.ts`, only if required without changing UUIDv7 semantics
- `drizzle/0001_global_locales_geography.sql`
- `drizzle/meta/_journal.json`
- `scripts/db-seed.mjs`
- `scripts/db-verify.mjs`
- `tests/database-foundation.test.mjs`
- one new focused database test file, if required
- `package.json`, only if a verification command is strictly required

No other file may change without first proving necessity and obtaining scope approval.

### Database changes allowed

M3 authorizes exactly two Release 1 physical tables: `locales` and `geographic_areas`. Their exact columns, types, nullability, defaults, checks, unique constraints, foreign keys, indexes, immutability rules, and deletion behavior are defined in `ALSAMAD_DATABASE_ARCHITECTURE.md` sections 5.1.1–5.1.3. No infrastructure bookkeeping table may consume or exceed the approved 30-table boundary.

Direct self-reference is prevented by checks. Multi-level locale fallback and geographic hierarchy cycles are prevented by PostgreSQL constraint triggers that are `DEFERRABLE INITIALLY IMMEDIATE`, inspect the complete ancestor chain, and fail the transaction on any cycle. The migration contains the trigger functions and triggers, and real PostgreSQL tests cover their behavior.

### Seed authorization

The seed contains exactly the two independently rooted, enabled locales defined in the database architecture:

- Arabic: `ar`, `Arab`, `rtl`, sort order 10, no fallback.
- English: `en`, `Latn`, `ltr`, sort order 20, no fallback.

Both use deterministic application-generated UUIDv7 identifiers and persist exactly once under repeated seed execution. No geographic seed data is authorized.

### Application capabilities

This phase adds typed database access and verification only. It does not authorize UI, routes, public APIs, runtime locale switching, provider integration, or public geographic lookup.

### Admin capabilities

None. Countries, regions, and cities require a separately approved import or administrative workflow later.

### Security requirements

- Retain M2 database safety guards and reject unsafe database targets.
- Enforce canonical identity, hierarchy, cycle, coordinate, direction, country consistency, and deletion rules in PostgreSQL, not only application code.
- Use `ON DELETE RESTRICT`; prohibit cascade deletion and physical deletion while descendants or dependent configuration exist.
- Keep identifiers provider-independent and do not persist secrets or unnecessary user location.
- Treat `id` as immutable, `code` as immutable after reference, and `language_tag` changes as explicit administrative migrations.

### QA requirements

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run db:up`
- `npm run db:safety`
- `npm run db:migrate`
- `npm run db:seed` twice
- `npm run test:db`
- `npm run db:check`
- Real PostgreSQL constraint, trigger, schema, and table-count verification
- `git diff --check`
- `npm run db:down` while preserving the named volume

Migration reruns must be safe. All M2 verification remains green. Tests must prove UUIDv7 persistence, UTC timestamps, UTF-8 and Arabic/English round-trip, valid `rtl`/`ltr`, and rejection of every invalid case in the acceptance criteria.

### Observability requirements

Database verification must emit actionable pass/fail evidence without secrets or religious/user behavior. Migration failure, constraint rejection, trigger rejection, seed counts, table count, and clean shutdown must be visible in local/test output. M3 adds no production analytics or product instrumentation.

### Analytics requirements

None. Locale and geographic records are configuration, not user analytics. No user-location telemetry or worship measurement is authorized.

### Acceptance criteria

M3 passes only when:

- exactly two domain tables and zero unauthorized infrastructure tables exist;
- both schemas exactly match the approved section 5.1 contract;
- Arabic and English seed locales each exist exactly once and no geographic row is seeded;
- repeated migration and seed execution is safe and seed execution is idempotent;
- UUIDv7, UTC timestamps, UTF-8, Arabic and English round-trip, and `rtl`/`ltr` values persist correctly;
- invalid direction and locale self-fallback fail;
- a multi-level locale fallback cycle fails;
- geographic self-parenting and a multi-level geographic cycle fail;
- invalid hierarchy type and country-code inconsistency fail;
- invalid latitude or longitude and a city without a time zone fail;
- parent deletion with descendants fails;
- the physical table-count query returns exactly 2 domain tables;
- all existing M2 and repository verification is green.

### Completion evidence

Return the exact migration file; schema diff; inventories of constraints, triggers, indexes, and seeds; real PostgreSQL command results; the physical table-count query and result; cycle- and hierarchy-rejection evidence; seed-idempotency evidence; repository verification results; `git diff --check`; and clean shutdown evidence preserving the database volume.

### Rollback/recovery

Production migrations remain forward-only. Before release, failure recovery uses a disposable local/test database or restoration of the preserved named volume from a known-good backup; it must not use destructive ad hoc rollback against production. A corrective forward migration requires explicit review and must preserve canonical identifiers. Failed seed transactions roll back atomically and may be rerun safely.

### Next-phase handoff

After every M3 acceptance criterion passes, hand off the two stable canonical identities to **M4 — Content Integrity Foundation**. This contract does not authorize M4 implementation.

### Release status

Contract complete; implementation not started by this documentation task.

## Phase 4: Content Integrity foundation

### Objective

Implement the provider-independent Content Integrity foundation by activating exactly the eight Release 1 tables in `ALSAMAD_DATABASE_ARCHITECTURE.md` section 5.2. Establish durable work, edition, passage, exact-text, license, structured-source, content-identity, and immutable-revision boundaries before Quran or devotional content is implemented.

### Included scope

- Drizzle mappings and one reviewed forward-only migration for exactly `licenses`, `works`, `editions`, `passages`, `passage_texts`, `content_items`, `content_revisions`, and `source_references`.
- Every approved PostgreSQL constraint, FK, index, trigger function, constraint trigger, checksum, immutability, publication, provenance, license, revision-order, retention, and deletion rule in database architecture sections 5.2.1–5.2.10.
- `pgcrypto` only as a PostgreSQL extension required to recompute SHA-256; it creates no ALSAMAD domain or bookkeeping table.
- Real PostgreSQL verification, including UTF-8 Arabic text round-trip and all M2/M3 regression checks.

### Explicitly excluded scope

- All six Quran tables, all four devotional/translation tables, all editorial, prayer/calendar, audit/publication-history, Prepared, Later, and Future tables.
- Quran.Foundation integration, provider-specific schema coupling, content imports, dataset selection, and production content activation.
- Selection or seed of Quran editions, translations, tafsir, duas, adhkar, source corpora, religious passages, licenses, works, editions, or publishable content.
- UI, public APIs, authentication, staff workflow, review assignment, analytics, AI generation, and runtime religious answers.
- Any generic provenance-event, provider-alias, current-revision pointer, soft-delete, or search table.

### Dependencies

- M1 exact 30-table Release 1 scope: PASS.
- M2 Database Foundation: PASS.
- M3 Global Locales and Regional Configuration, including real PostgreSQL verification: PASS.
- Database architecture sections 5.2.1–5.2.10 are authoritative.

### Exact implementation sequence

1. enable `pgcrypto` and create `licenses`;
2. create `works`;
3. create `editions`;
4. create `passages`;
5. create `passage_texts`;
6. create `content_items`;
7. create `content_revisions`;
8. create `source_references`;
9. create cross-table validation, checksum, immutability, hierarchy, revision-order, license, and publication-integrity triggers only after all referenced tables exist.

### Artifacts and allowed files

Implementation may modify only:

- `src/db/schema.ts`;
- `drizzle/0002_content_integrity_foundation.sql`;
- `drizzle/meta/_journal.json`;
- `scripts/db-verify.mjs`;
- `tests/database-foundation.test.mjs`, only for static contract coverage; and
- one new focused `tests/content-integrity-database.test.mjs`, only if required.

`src/db/ids.ts` may change only if a proven defect prevents existing UUIDv7 semantics. `package.json` and `package-lock.json` may change only if `pgcrypto` verification cannot use existing tooling, and such necessity must be proven before editing. No seed file change is authorized because M4 authorizes no rows. No other file may change without a separately approved contract amendment.

### Database changes allowed

M4 authorizes exactly eight new physical Release 1 domain tables. Together with M3, the cumulative count becomes exactly 10 of 30. Migration filename is exactly `drizzle/0002_content_integrity_foundation.sql`. Migration bookkeeping does not count as a domain table, and the migration must not create any unauthorized infrastructure table.

All primary keys are application-generated UUIDv7 with no database default. FKs use `ON UPDATE RESTRICT ON DELETE RESTRICT`. The exact columns, PostgreSQL types, nullability, defaults, uniqueness, checks, indexes, immutable fields, and trigger requirements are fixed by database architecture section 5.2. Migration reruns must be safe and must neither weaken nor silently skip a mismatched existing object.

### Seed authorization and no-seed boundary

M4 authorizes **zero seed rows** and no modification to `scripts/db-seed.mjs`. Existing M3 `ar` and `en` seeds must remain exactly once; geographic rows remain zero. Synthetic records may exist only inside rolled-back verification transactions. No external religious dataset, license assertion, work, edition, passage, text, content item, revision, source reference, provider ID, or publication state may be seeded or imported.

### Application and admin capabilities

Typed database mapping and verification only. No UI, route, public API, provider adapter, import job, administration, editorial workflow, content-serving path, or public publication is authorized.

### Security, integrity, and retention requirements

- PostgreSQL, not application code, enforces checksums, license effectiveness, provenance completeness, publication eligibility, immutable publication, revision order, passage hierarchy, cross-work relationships, and restrictive deletion.
- Provider metadata is bounded, non-secret, and alias-only. Provider IDs never become canonical primary keys.
- Published corrections create a new edition version or content revision; old published records are never overwritten or republished.
- AI output has no canonical provenance path and cannot become published canonical content.
- Quran.Foundation storage remains subject to the seven-day default unless written durable-storage permission or independent licensing is recorded; M4 does not import its content.
- No personal data, user location, worship behavior, credentials, or secret contract payload is stored. Published integrity evidence is retained; license-driven payload removal follows the reviewed withdrawal/recovery procedure.

### Trigger requirements

The migration must provide named PostgreSQL functions/triggers for:

- immutable UUID and canonical identity fields;
- active/effective license enforcement at edition publication;
- one-way published-edition and published-passage-text immutability/withdrawal;
- passage same-work hierarchy, depth, and cycle rejection using a `DEFERRABLE INITIALLY IMMEDIATE` constraint trigger;
- edition/passage same-work validation for passage text;
- SHA-256 recomputation and rejection for normalized text and revision payloads;
- content-item identity immutability after first revision;
- revision predecessor, same-item, gap-free ordering, and cycle rejection using a `DEFERRABLE INITIALLY IMMEDIATE` constraint trigger;
- published revision immutability and one-way withdrawal/supersession;
- source-reference cited-work consistency; and
- deferred publication integrity requiring eligible verification, mandatory provenance, and at least one primary source for sourced religious content.

Triggers must be idempotently created, fail closed, use deterministic error messages suitable for tests, and never silently repair invalid religious content.

### Checksum and correction policy

Checksums use lowercase SHA-256 hex. Exact imported bytes use `source_checksum`; Unicode NFC plus LF-only line endings, without whitespace, punctuation, tashkeel, or character folding, produces normalized text/revision checksums. The checksum schema version is persisted for content revisions. PostgreSQL recomputes normalized checksums with `pgcrypto`; manifest checksum values are format-validated in PostgreSQL and externally reconciled by the verifier.

A published correction is always additive: create a new edition version or the next gap-free content revision, revalidate provenance/license/source evidence, then publish it. Withdrawal and supersession never mutate historical payloads. Recovery of earlier wording creates another revision; it does not edit or reactivate the old row.

### QA requirements

Run:

- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck`;
- `npm run build`;
- `npm run db:up`;
- `npm run db:safety`;
- `npm run db:migrate`;
- `npm run db:seed` twice;
- `npm run test:db`;
- `npm run db:check`;
- direct real-PostgreSQL schema, constraint, trigger, index, extension, and table-count inspection;
- a second `npm run db:migrate`;
- `git diff --check`; and
- `npm run db:down` while preserving the named volume.

All M2 and M3 checks must remain green. Verification data must run in transactions and roll back without leaving content rows.

### Observability and analytics requirements

Verification output must show table counts, constraints, triggers, indexes, checksum mismatches, license/provenance/publication rejection, revision ordering, deletion restriction, migration rerun, existing seed idempotency, UTF-8/Arabic round-trip, and shutdown without exposing content payloads or secrets. M4 adds no product analytics, user telemetry, or worship measurement.

### Acceptance criteria

M4 passes only when real PostgreSQL proves:

- exactly eight new M4 domain tables exist, the cumulative Release 1 domain count is exactly 10, and no unauthorized table exists;
- every exact column, type, nullability, default, FK, update/delete action, unique/check constraint, index, and required trigger matches section 5.2;
- application-generated IDs persist as UUIDv7 and timestamps behave in UTC;
- duplicate canonical keys, edition identities, passage locators/text pairs, revision numbers/checksums, provider aliases, and source references are rejected;
- invalid closed states, hierarchy, cross-work links, retention windows, license windows, provenance combinations, checksum formats/values, publication timestamps, and Editorial General Dua classification are rejected;
- publication under an inactive, expired, revoked, `no_storage`, or not-yet-effective license is rejected;
- published editions, passage texts, revisions, provenance, checksums, and attached references are immutable, while only approved one-way withdrawal/supersession transitions succeed;
- sourced religious revisions cannot publish without mandatory provider/manual provenance as applicable and at least one structured `primary_source` reference;
- unverified, rejected, AI-originated, or structurally misclassified editorial content cannot publish as canonical content;
- revision 1 has no predecessor, later revisions use the immediate same-item predecessor, numbering is gap-free, ordering/cycles are enforced at transaction end, and corrections create new revisions;
- parent, referenced license/work/edition/passage/item/revision, published evidence, and historical rows cannot be deleted in violation of restrictions;
- checksum recomputation accepts exact expected values and rejects a one-byte, Unicode-normalization, or Arabic-diacritic mismatch according to the declared policy;
- migration rerun succeeds without schema drift;
- the existing `ar` and `en` seeds remain exactly once after two seed runs, no geographic or M4 row is seeded, and seed idempotency passes;
- UTF-8 English and Arabic text, including tashkeel, round-trips exactly inside rolled-back verification transactions; and
- all M2, M3, repository, format, lint, strict TypeScript, build, safety, and database checks remain green.

### Completion evidence

Return the exact changed-file list and migration; schema, FK, constraint, trigger, index, extension, checksum, and seed inventories; SQL table-count query/results showing 8 M4 and 10 cumulative domain tables; representative accepted/rejected PostgreSQL transactions for every acceptance family; migration-rerun and seed-idempotency output; exact UTF-8/Arabic round-trip evidence; M2/M3 regression results; repository checks; preserved-volume shutdown evidence; proven defects fixed; and remaining blockers.

### Rollback/recovery

Production migrations are forward-only. Before release, recreate a disposable database or restore the preserved named volume from a known-good backup. After release, repair defects only through a reviewed forward migration that preserves UUIDs, canonical keys, checksums, published history, attribution, and license evidence. Never drop or rewrite published integrity rows as rollback. Failed imports/publications are atomic and leave no partial graph. License expiry or withdrawal first disables serving and publication; payload removal, when legally required, uses a separately reviewed recovery migration and retains only lawful minimum integrity evidence.

### First M5 handoff

After every M4 acceptance criterion passes, hand the stable `works`, `editions`, `passages`, `licenses`, and immutable publication primitives to **M5 — Quran data model and verified import**. M5 begins with provider-independent Quran structural tables and a content-activation gate; it must not import, select, or activate any Quran.Foundation resource until exact edition, rights, attribution, quota, checksum/manifest, retention, fallback, and deletion/exit approval exists. This M4 contract does not authorize M5 implementation.

### Release status

Contract complete; implementation not started by this documentation task.

## Phase 5: Quran data model and verified import

### Objective

Implement the provider-independent Quran structural and edition-specialization foundation by activating exactly the six Quran tables in `ALSAMAD_DATABASE_ARCHITECTURE.md` section 5.3, then prove a controlled, non-production import dry run without selecting or activating religious content in the architecture task. Preserve exact Quran text, canonical ALSAMAD identity, licensing, provenance, withdrawal, and provider-exit safety on top of the approved M4 integrity tables.

### Included scope and exact count

M5 authorizes only `quran_surahs`, `quran_ayahs`, `quran_ayah_texts`, `quran_structural_markers`, `quran_translation_editions`, and `quran_translation_texts`, in that dependency order. M5 adds exactly six domain tables and makes the cumulative Release 1 count exactly **16 of 30**: two M3, eight M4, and six M5. Exact columns, types, defaults, constraints, indexes, FK restrictions, immutability, provider aliases, locators, edition relationships, and withdrawal behavior are normative in database architecture sections 5.3.1–5.3.9.

M5 may also implement provider-independent import contracts, a Quran.Foundation content adapter, manifest validation, quarantine/staging/reconciliation logic, verification scripts, and focused database/import tests. These capabilities remain server-side and non-public.

### Explicitly excluded scope

- Every devotional, editorial-workflow, public-account, Talibeen, subscription, payment, AI, embedding, RAG, model-training, semantic-search, community, notification, prayer, calendar, audit/publication-history, Prepared, Later, and Future table.
- Any seventh Quran table, provider mapping table, import/manifests table, permanent staging table, word table, audio table, search table, or infrastructure table.
- Selection, import, seed, approval, or activation of an Arabic Quran edition, translation, tafsir, word-by-word resource, transliteration, recitation, audio, font, page layout, or Mushaf resource during this contract task.
- OAuth, Quran.Foundation User APIs, authenticated user scopes, public authentication, UI, public/admin routes, admin UI, unified search, and user features.
- Embeddings, RAG indexes, training corpora, raw redistribution, permanent caching, offline packs, long-term CDN mirroring, audio rehosting, word timing, and recitation timing.
- Silent correction, whitespace folding, punctuation folding, tashkeel removal, character substitution, or any normalization of canonical Quran text beyond the existing checksum-only NFC contract. Exact source bytes and rendered text remain separately checksummed.

Conditional Quran audio adds no table and is not authorized by M5 unless a later, separate activation decision proves written playback, commercial, cache/proxy/download, attribution, bandwidth, Range/CORS, retention, and withdrawal rights. Word-level and timing metadata are not in the frozen catalog and are not authorized.

### Dependencies

- M2 tooling, M3 locale/region foundation, and M4 content integrity: verified PASS on real PostgreSQL.
- Exact 30-table Release 1 catalog and M4's `works`, `editions`, `passages`, `passage_texts`, `licenses`, and source/checksum/publication controls remain unchanged.
- A source may proceed beyond discovery only after a separately approved source decision record and import manifest exist. Architecture completion alone does not approve a source.

### Quran.Foundation boundary

Quran.Foundation is the approved initial content provider behind provider-independent ports. Its IDs remain external aliases; ALSAMAD UUIDv7 identities and canonical locators remain authoritative. Content API credentials are server-only secrets, never schema values, manifests, logs, browser bundles, or public environment variables. Content access, Quran-only Search access, and authenticated User/OAuth scopes are separately capability-gated. M5 authorizes Content adapter work only; it authorizes no OAuth or user feature and no public search dependency.

The default Quran.Foundation retention/cache boundary is seven days unless written durable rights are attached to the source decision. API availability does not prove redistribution, commercial-use, derivative, caching, mirroring, download, or rehosting rights. Deletion/withdrawal events must be enforceable through manifest-to-edition/alias mappings and fail-closed serving. Provider dependency is not resolved until a legally independent fallback—with its own rights, checksums, validation, operational test, and exit procedure—passes the same gates. Until then, the product must expose the dependency as an unresolved release risk and degrade safely.

### Source-selection blocking gates

No resource crosses from discovery to approved manifest until every applicable gate is recorded as PASS:

| Resource class          | Blocking evidence                                                                                                                                                                                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arabic Quran edition    | Exact script/edition and numbering authority; text provenance; surah/ayah counts; byte and manifest checksums; attribution; scholarly approval; commercial, redistribution, retention, fallback, deletion, correction, and exit rights.         |
| Quran translations      | Exact translator/version/locale; methodology; complete/incomplete coverage; attribution; license and commercial/redistribution/retention rights; verse mapping; scholarly/language review; fallback and withdrawal procedure.                   |
| Tafsir and footnotes    | Exact author/work/edition; whether content is tafsir or annotation; passage mapping; attribution; license; commercial/redistribution/retention; editorial and scholarly review; fallback and deletion/exit rights.                              |
| Word-by-word resources  | Exact tokenization/script/edition alignment; token and verse checksums; linguistic attribution; license; commercial/redistribution/retention; timing separation; scholarly review; fallback and deletion. No word table is authorized.          |
| Transliteration         | Exact scheme/version/locale; edition alignment; limitations disclosure; attribution; license; review; commercial/redistribution/retention; fallback and withdrawal rights.                                                                      |
| Audio recitations       | Exact reciter/riwayah/mushaf alignment; file/segment checksums; written streaming, commercial, proxy/cache/download and rehosting rights; attribution; quotas/bandwidth/Range/CORS; retention; fallback; withdrawal. Ships disabled on failure. |
| Page/font/layout        | Exact Mushaf/layout/font version; page ranges and glyph fidelity; embedding/rendering/commercial/redistribution/offline rights; checksums; attribution; browser compatibility; fallback; withdrawal. Pages bind to an exact edition only.       |
| Every provider resource | Production credentials; stable resource/version identifiers; quotas/rate limits; privacy/security review; manifest format; SLA/degradation behavior; legally independent fallback status; deletion/exit mechanism; named approvers.             |

A conditional or unknown license, attribution, commercial-use, redistribution, retention, quota, fallback, deletion/exit, or scholarly decision is a blocking failure, not permission to import.

### Exact staged import lifecycle

1. **Discovery:** enumerate metadata only; record resource candidates, provider capabilities, risks, and no content payload in canonical storage.
2. **Provider resource selection:** create a source decision draft identifying exact resource, edition, version, scope, numbering/layout, and intended use; selection remains unapproved.
3. **License approval:** legal/content owners record in-application-display, attribution, commercial-use, standalone-redistribution, derivative, retention, caching, deletion, and exit decisions. Every capability exercised by the intended operation must be approved. A known denied commercial-use or standalone-redistribution capability is compatible with an operation that exercises neither; any unknown or denied required capability fails closed, and no denied capability may be exercised.
4. **Manifest creation:** produce immutable canonical JSON with manifest ID/version, provider snapshot, resource list, expected bytes/rows/checksums, adapter/normalization versions, rights evidence, retention deadline, fallback and approvers.
5. **Download/fetch:** server-side adapter fetches only manifest-listed resources with scoped credentials, quotas, timeouts, checkpoint token, and an import-attempt UUIDv7.
6. **Raw-response quarantine:** encrypted, access-limited, non-public temporary storage keyed by attempt; never a domain table; no canonical serving; expires at the earlier of the approved retention deadline or seven days by default.
7. **Schema validation:** reject unknown/missing fields, wrong types, unbounded payloads, unexpected resources, encoding errors, or provider-version drift.
8. **Checksum validation:** validate transport/file/resource hashes before parsing and exact record/source hashes after parsing; mismatch aborts the affected attempt.
9. **Normalization:** map structure and metadata deterministically while preserving exact canonical Quran UTF-8 bytes; normalization may compute a separate NFC checksum but may not alter stored canonical text.
10. **Deterministic identity mapping:** resolve provider aliases to existing UUIDv7/canonical locators or deterministically allocate new UUIDv7 rows from the manifest mapping artifact; reject ambiguous, duplicate, moved, or reused aliases.
11. **Staging:** load into transaction-scoped temporary tables or validated files outside the 30-table catalog; staging is isolated, non-public, retention-bound, and disposable.
12. **Reconciliation:** compare exact surah/ayah/edition/translation/marker counts, locators, ranges, gaps, duplicates, text bytes, row/file checksums, license/source references, and prior active version; emit signed evidence.
13. **Scholarly/content approval:** named reviewers approve exact manifest, reconciliation report, Arabic text fidelity, structural numbering, attribution, and each selected translated/tafsir/layout resource.
14. **Activation/publication:** one transaction inserts/reconciles canonical rows and moves a complete approved release to eligible state; mixed versions and partial publication are forbidden.
15. **Rollback:** before activation, roll back the transaction and discard staging/quarantine under retention rules; after activation, use withdrawal and a forward corrective version—never overwrite published text or migration history.
16. **Provider deletion/withdrawal:** immediately block serving/fetching by provider/version, withdraw dependent edition/text/specialization rows, preserve lawful evidence, erase payload when required, verify propagation, and activate fallback only if independently approved.
17. **Re-import/version transition:** create a new immutable manifest and provider snapshot, resume through checkpoints, reconcile old/new identities and content, obtain fresh approvals, atomically activate the new version, then withdraw the predecessor according to rights.

### Import execution contract

The idempotency key is the SHA-256 of `(manifest_id, manifest_schema_version, provider_code, provider_snapshot_version, resource_id, resource_version, adapter_version)` encoded by the manifest's canonical JSON contract. Repeating a completed key must produce no new canonical rows; repeating a failed key resumes only from the last checksum-verified immutable checkpoint. Checkpoints contain no secrets or Quran payload and identify attempt, manifest hash, resource, cursor/offset, byte count, row count, rolling checksum, and status. A changed resource/version/checksum creates a new attempt and cannot resume the old one.

Fetches may retry bounded transient errors with jitter and provider rate-limit compliance. Schema, checksum, rights, retention, duplicate identity, locator, row-count, or text-integrity failures are permanent until a new approved manifest. Each resource stage is atomic; the final canonical merge and release activation are one database transaction. A partial failure leaves no published or mixed-version rows and preserves quarantine/evidence only for the approved diagnostic window. Duplicate prevention is database-enforced by canonical uniques, specialization uniques, provider-alias triggers, and M4 provider edition uniqueness.

Reconciliation evidence contains manifest/import IDs and hashes, source/provider versions, adapter and schema versions, exact expected/observed counts by table/resource/surah, file and aggregate row checksums, missing/extra/duplicate locators, UTF-8 round-trip result, alias map diff, license/source decision identifiers, retention deadline, approval identities/times, database transaction/correlation ID, and final disposition. It must never log credentials or full religious payloads. No mismatch may be waived silently; a source correction requires a new provider version or explicit correction record and new manifest.

### Seed and real-import authorization

M5 authorizes **zero religious seed rows**. Production migrations and seeds contain no sample surah, ayah, Arabic text, translation, tafsir, marker, license assertion, provider ID, or manifest. Tests may create synthetic, clearly non-religious fixtures only inside transactions guaranteed to roll back. Real Quran data requires a separately approved source decision record and exact import manifest, followed by all provider, legal, source, scholarly, dry-run, and production gates. This documentation task selects and imports nothing.

### Allowed implementation files

The first implementation unit may change only:

- `src/db/schema.ts`;
- `drizzle/0004_quran_data_model.sql` as the next forward-only migration after committed `0003`;
- `drizzle/meta/_journal.json`;
- provider-independent contracts/modules under `src/lib/quran/import/`;
- Quran.Foundation adapter under `src/lib/providers/quran-foundation/`;
- import scripts `scripts/quran-import.mjs` and `scripts/quran-import-verify.mjs`;
- focused tests under `tests/quran-data-model/` and `tests/quran-import/`;
- `scripts/db-verify.mjs` only for cumulative schema/regression assertions;
- `.env.example` and `src/db/env.ts` only if server-side Content API variables are proven necessary, with placeholders only;
- `package.json` and `package-lock.json` only when an existing dependency cannot satisfy a documented checksum, schema-validation, or provider-client need.

No UI, public route, admin UI, authentication, unrelated module, seed file, earlier migration rewrite, architecture document, `docs/`, or patch-file change is authorized during implementation. A package or environment change without evidence is outside scope.

### Security, licensing, and privacy requirements

Credentials remain server-side, least-privilege, rotated, and redacted. Raw quarantine is encrypted, access-audited, payload-minimized, and retention-enforced. Logs contain hashes/counts/IDs, not full Quran text, tokens, contracts, or secrets. Fetchers enforce HTTPS, host allowlists, response-size/time limits, schema bounds, safe decompression, and quota backoff. Provider content cannot enter training, embeddings, RAG, analytics, permanent caches, CDN mirrors, offline packs, redistribution, or audio rehosting without separate written rights. Imports stop automatically at rights expiry or retention deadline.

### Observability and audit evidence

Emit attempt and correlation IDs, stage transitions, durations, retry counts, quota/rate-limit state, resource/version, expected/observed byte and row counts, checksum outcomes, alias/locator conflicts, retention deadline, approval-gate state, transaction outcome, withdrawal propagation, and recovery outcome. Alerts cover checksum/schema drift, partial failure, stale provider version, approaching retention expiry, failed deletion, missing fallback, and attempted publication without gates. Metrics must not expose content payloads, credentials, or user worship behavior. Evidence is retained only as permitted by license and security policy.

### M5 acceptance and separated gates

All acceptance uses real PostgreSQL and controlled provider verification. A schema-only result can never mark all of M5 PASS.

1. **Schema completion gate — `M5 Schema Foundation Verified`:** exact six new and 16 cumulative domain tables; all columns/types/defaults; UUIDv7; FK `RESTRICT`; unique/check/index/trigger inventories; immutability; canonical/provider separation; duplicate alias rejection; verse order and locator validation; structural range/layout validation; translation/content-integrity linkage; zero unauthorized table/seed row; synthetic UTF-8 Arabic exact round-trip and normalization-damage rejection; transaction rollback; all M2/M3/M4 checks green.
2. **Provider credential gate:** controlled server-side Content credentials work with least scope; secrets/redaction, quotas, timeouts, retries, and Content-vs-Search/User separation pass. Failure blocks provider dry run, not schema PASS.
3. **Legal/license gate:** every capability exercised by the intended operation has affirmative, written, machine-enforceable permission. For the REG-0009 non-commercial Quran use, in-application display, required storage/retention, license, and attribution must be approved; commercial use and standalone redistribution must be explicitly resolved and may be denied because the intended operation exercises neither. Unknown rights, denied required capabilities, expired/revoked rights, and incompatible/no-storage terms are rejected. No operation may exercise a denied capability, and the seven-day default is tested.
4. **Source-selection gate:** exact edition/resource/version, counts, numbering/layout, checksums, manifest, provider snapshot, quotas, fallback, and correction policy are approved. No source is implied by schema completion.
5. **Scholarly approval gate:** named reviewers approve exact Arabic bytes, verse mapping/order, structure, attribution, and each translation/tafsir/layout claim. No silent source correction is accepted.
6. **Import dry-run gate — `M5 Provider Import Dry Run Verified`:** against approved controlled resources and non-public staging, prove schema/checksum validation, exact row-count evidence, deterministic mapping, idempotency, retry/checkpoints, duplicate rejection, partial-failure recovery, transaction rollback, provider-version transition rehearsal, withdrawal/deletion propagation, retention/license rejection, publication rejection, exact UTF-8 round-trip, and reconciliation/audit evidence. Dry run publishes nothing.
7. **Production activation gate — `M5 Quran Import Activated`:** requires all prior gates, production manifest and source decision, legal fallback/exit decision, final scholarly approval, production dry-run parity, backup/recovery readiness, atomic activation, monitoring, withdrawal drill, and post-activation count/checksum verification. Only this gate authorizes public serving.

If only gate 1 passes, report exactly `M5 Schema Foundation Verified`; do not call the milestone operational or fully PASS. Gate 6 may add `M5 Provider Import Dry Run Verified`. Only gate 7 may report `M5 Quran Import Activated`.

### Verification commands and completion evidence

Implementation verification must run `npm run db:up`, database safety, migrations twice, exact schema/catalog inspection, focused schema/import tests, seeds twice, `npm run test:db`, controlled adapter dry run when its gates permit, `npm run db:check`, full `npm run verify`, Prettier, `git diff --check`, and `npm run db:down` while preserving the named volume. Acceptance evidence must include exact table/FK/constraint/index/trigger inventories; expected/observed counts; accepted and rejected SQL cases; aliases and locators; manifest/provider/checksum/license/retention evidence; byte-exact synthetic Arabic round trip; idempotent reruns; rollback/recovery/version-transition/withdrawal results; regression output; changed-file list; and all blockers. Secrets and full Quran payloads are prohibited from reports.

#### M5.1 verification record — 2026-08-09

- **Gate:** `M5 Schema Foundation Verified`.
- **Status:** `PASS`.
- **Authoritative commit:** `e05adc78605802fe3311edcfc860f2792d486cb9`.
- **Verified date:** 2026-08-09. Exact wall-clock execution time was not captured.
- **Verifier:** Independent Codex clean-checkout verification.
- **Environment:** Windows / PowerShell; Docker Desktop 4.84.0; Docker Engine 29.6.2; Docker Compose v5.3.1; PostgreSQL 17.10; committed `postgres:17-alpine` image.
- **Command chain:**

  ```text
  npm.cmd run db:up
  npm.cmd run db:safety
  npm.cmd run db:migrate
  npm.cmd run db:migrate
  npm.cmd run db:seed
  npm.cmd run db:seed
  npm.cmd run test:db
  npm.cmd run db:check
  npm.cmd run verify
  git diff --check
  npm.cmd run db:down
  ```

- **Lifecycle and database results:** exact normal-port `db:up` PASS; database safety PASS; initial migration PASS; migration rerun PASS; initial seed PASS; seed idempotency PASS; real PostgreSQL database verifier PASS; `db:check` PASS; exactly six M5.1 Quran tables and exactly sixteen cumulative Release 1 domain tables; M2/M3/M4 regressions PASS; required invalid cases rejected; synthetic fixture rollback PASS.
- **Repository results:** TypeScript PASS; lint PASS; Prettier PASS; repository tests PASS (158/158); production build PASS; full `npm run verify` PASS; `git diff --check` PASS.
- **Shutdown and repository state:** exact `db:down` PASS; the ALSAMAD named PostgreSQL volume was preserved; the verification checkout remained clean.
- **Seeds:** `ar = 1`; `en = 1`; geographic areas `= 0`; zero religious production seed rows.
- **Environment caveat:** Port `127.0.0.1:55432` was initially owned by the unrelated `ilixion-r5-postgres` container. For the authoritative final verification, that specific container was temporarily stopped; no container was removed and no Docker volume or data was deleted. ALSAMAD ran the exact normal-port lifecycle and verification passed. The ILIXION container was then restarted with its original container, volume, image, and port ownership intact.
- **Strict scope:** This PASS records only `M5 Schema Foundation Verified`. It does **not** establish or authorize `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, a real Quran provider fetch, provider credential activation, production manifest creation, Quran publication, M6 implementation, migration `0005`, or M7 / Knowledge Engine work. The independent M5 production-activation dependency remains unresolved.

### Rollback and recovery

Migration history is forward-only. Before activation, rollback discards the transaction and retention-bound staging/quarantine. After activation, withdraw the affected release, stop serving/fetching, preserve lawful checksums/attribution/audit evidence, and use a reviewed forward correction with a new manifest/version. Never edit published Quran text, reuse an import key for changed bytes, rewrite a committed migration, or fall back to an unapproved source. Restore service only from a checksum-verified approved release or legally independent approved fallback.

### First implementation unit

After this contract is committed, the only authorized first unit is **M5.1 — Quran Schema Foundation**: implement the six tables and database constraints in dependency order, register forward migration `0004`, extend database verification with synthetic rolled-back fixtures, and prove the Schema completion gate on real PostgreSQL. M5.1 must not add provider credentials/adapters, fetch data, create a real manifest, select a source, import Quran content, or activate publication.

### Next-phase handoff

After `M5 Schema Foundation Verified`, hand the stable schema to **M5.2 — Provider-Independent Import Harness and Controlled Dry Run** under a new explicit authorization. That handoff may build contracts, manifest/checksum tooling, quarantine/staging, reconciliation, and the Quran.Foundation Content adapter, but still cannot select a production resource or activate content without the remaining gates. M6 receives only a separately activated, licensed, verified Quran foundation; this contract does not authorize M5.2, production import, or M6 implementation.

### Release status

Architecture contract complete; implementation not started by this documentation task. No M5 PASS label is earned by documentation alone.

### M5.2 — Provider-Independent Import Harness and Controlled Dry Run

This is the new explicit authorization named by the Next-phase handoff above. It is a documentation-only architecture contract: it authorizes no code, migration, test, adapter, credential, fetch, import, or seed. `M5 Schema Foundation Verified` (M5.1) must already be `PASS` before any implementation against this contract begins.

**Objective.** Define the exact executable contract for a provider-independent Quran import harness that can support Quran.Foundation initially without coupling ALSAMAD canonical identity to provider IDs.

**Included scope.** Provider-independent import contracts; the import manifest schema in `ALSAMAD_DATABASE_ARCHITECTURE.md` sections 5.3.8 and 5.3.10; the adapter interface below; the quarantine and staging workflow in database architecture 5.3.11; dry-run execution; reconciliation; checkpoint and retry behavior; idempotency; withdrawal and deletion handling; and import evidence/audit outputs.

**Explicitly excluded scope.** Production activation; public Quran publication; real Quran.Foundation credentials (only placeholder/synthetic sandbox configuration is authorized); real provider fetch or real content import; Quran.Foundation Search API integration; OAuth/User API integration; audio ingestion; offline packs; permanent provider caching; embeddings, RAG, training, or semantic indexing of any provider or canonical content; UI or admin UI; and any new physical database table. M5.2 authorizes zero tables beyond the frozen 30-table catalog; the manifest, quarantine, checkpoint, and reconciliation artifacts remain non-table JSON/object-storage artifacts exactly as scoped in database architecture 5.3.8 and 5.3.10–5.3.11.

### M5.2 provider adapter interface

The Quran.Foundation adapter, and any future provider adapter, implements exactly this interface behind the existing provider-independent `QuranContentProvider` port defined in `ALSAMAD_API_ARCHITECTURE.md`'s M0.5 Quran provider boundary section:

| Method                                                               | Return contract                                                                                                                                                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `discoverResources()`                                                | List of resource descriptors (type, `provider_resource_id`, `provider_resource_version`, declared counts) with no content payload; read-only, no side effects.                                                 |
| `fetchResourceMetadata(resourceRef)`                                 | Single resource's HTTP-safe metadata (version token, counts, provider-supplied checksums if any); never full content.                                                                                          |
| `fetchPage(resourceRef, cursor)` / `fetchBatch(resourceRef, cursor)` | One bounded page/batch of raw provider records plus a next-cursor and byte/row counts; writes only to encrypted quarantine, never to canonical or staging tables.                                              |
| `normalizeProviderRecord(rawRecord)`                                 | A structurally normalized record matching the manifest's declared shape, plus a computed normalized checksum; must preserve exact canonical Quran UTF-8 bytes unchanged.                                       |
| `mapProviderIdentity(normalizedRecord)`                              | A proposed alias mapping (`provider_code`, `resource_type`, `external_id`, `provider_version`) to an existing canonical row or a deterministic new-row candidate; never a canonical UUID assignment by itself. |
| `validateProviderRecord(normalizedRecord)`                           | Pass/fail plus the list of violated rules; failure routes the record to quarantine, never to staging.                                                                                                          |
| `getVersionToken(resourceRef)`                                       | Opaque provider version/snapshot token used to detect drift and force a new manifest.                                                                                                                          |
| `getDeletionOrWithdrawalSignals(resourceRef)`                        | List of provider-reported deletion/withdrawal events since a given checkpoint; feeds the `withdrawn`/`deleted` state transitions.                                                                              |
| `verifyCompleteness(resourceType, expectedCounts)`                   | Pass/fail plus the exact count and locator diff, feeding reconciliation evidence.                                                                                                                              |
| `produceAttribution(resourceRef)`                                    | The exact required attribution text/reference for the resource; never invented or paraphrased.                                                                                                                 |
| `close()` / `cleanup()`                                              | Releases connections/credentials and clears in-memory secrets; idempotent.                                                                                                                                     |

The adapter must never: create ALSAMAD canonical IDs directly from provider IDs; publish content; bypass a license gate; persist secrets in logs; silently normalize canonical Quran text; or convert a provider error into a success result.

### M5.2 import state machine

`created` → `awaiting_source_approval` → `awaiting_license_approval` → `ready` → `fetching` → `quarantined` → `validating` → `normalized` → `staged` → `reconciling` → `dry_run_passed` | `dry_run_failed` → `awaiting_scholarly_approval` → `blocked` | `withdrawn` | `deleted` | `expired` | `superseded`.

- `created`: manifest drafted; no fetch attempted.
- `awaiting_source_approval`: blocked on the Phase 5 source-selection gate.
- `awaiting_license_approval`: blocked on the Phase 5 legal/license gate.
- `ready`: all pre-fetch approvals recorded; fetch not yet started.
- `fetching`: adapter retrieving pages/batches into quarantine.
- `quarantined`: raw response held in encrypted temporary storage pending validation.
- `validating`: schema and checksum validation in progress.
- `normalized`: structure/metadata normalized; canonical text bytes unchanged.
- `staged`: loaded into transaction-scoped or disposable staging outside the 30-table catalog.
- `reconciling`: counts, locators, checksums, and license/attribution evidence being compared.
- `dry_run_passed` / `dry_run_failed`: terminal dry-run outcome; `dry_run_passed` still publishes nothing.
- `awaiting_scholarly_approval`: reconciliation passed; awaiting named reviewer sign-off, still pre-activation.
- `blocked`: any unresolved gate failure; requires a new manifest or decision to proceed.
- `withdrawn`: a provider or rights withdrawal signal was received for this manifest's resource.
- `deleted`: quarantine/staging payload purged, by retention expiry or provider deletion signal.
- `expired`: retention deadline passed without activation; payload purged, manifest kept only as evidence.
- `superseded`: a newer manifest for the same resource/version lineage has replaced this one.

No production activation state (for example `activated` or `published`) is authorized by M5.2. Transitions are forward-only except into `blocked`, `withdrawn`, `deleted`, `expired`, or `superseded`, none of which may re-enter an earlier non-terminal state.

### M5.2 dry-run output contract

Every dry run emits, machine-readable (JSON) and human-readable (report), the same evidence set: manifest summary (`manifest_id`, `provider_code`, `resource_type`, `provider_resource_version`, `dry_run = true`); provider/resource identity and mapped canonical identity candidates; expected vs. actual counts; source and normalized checksums; non-blocking warnings; blocking errors (schema, checksum, rights, duplicate, or count failures); the reconciliation matrix defined in database architecture 5.3.11; unmapped and duplicate records; the retention deadline; the license decision and its status; the scholarly review status (always pre-approval in M5.2); publication eligibility, which is always `false` in M5.2; and rollback evidence describing what was discarded or purged and when.

### M5.2 security and observability requirements

Security: provider credentials remain server-side, environment-separated, and least-privilege scoped, and are never logged or embedded in a manifest, fixture, or patch; M5.2 authorizes no real credential, only placeholder/synthetic sandbox configuration. Secrets are redacted from every log, checkpoint, and evidence artifact. Every fetch attempt carries a correlation/request ID. No raw token is persisted. Idempotency keys and checkpoint tokens provide replay resistance. Adapters honor provider quotas with bounded retry and jitter; sustained limit breach moves the attempt to `blocked`, never a silent skip. Bounded per-request timeouts and a circuit breaker that opens on sustained provider failure force `blocked` rather than indefinite retry.

Observability: emit import run IDs, per-stage timings, request counts, retry counts, failure categories, provider-version drift, checksum drift, deletion/withdrawal events, retention-expiry proximity, dry-run pass/fail outcome, and provider quota/cost visibility. All logs are privacy-safe: no credentials, no full Quran or provider payload, no user data.

### M5.2 allowed implementation files

This is a documentation-only contract; no file below is created by this task. When a separately authorized implementation contract follows, it may modify only:

- `src/lib/quran/import/contracts.ts`
- `src/lib/quran/import/manifest.ts`
- `src/lib/quran/import/state-machine.ts`
- `src/lib/quran/import/reconciliation.ts`
- `src/lib/quran/import/checkpoints.ts`
- `src/lib/providers/quran-foundation/adapter.ts`
- `src/lib/providers/quran-foundation/types.ts`
- `scripts/quran-import.mjs`
- `scripts/quran-import-verify.mjs`
- focused tests under `tests/quran-import/`
- `.env.example` and `src/db/env.ts`, only if credentials are later separately authorized, with placeholders only
- `package.json` and `package-lock.json`, only with proven necessity

This list refines, for this specific implementation unit, the general `src/lib/quran/import/` and `src/lib/providers/quran-foundation/` grants already recorded in this phase's "Allowed implementation files" section; it does not add a file class beyond what that section already authorizes.

### M5.2A — Credential-Free Import Contract Conformance

This subsection is the separately authorized implementation unit required by the M5.2 contract above. It may proceed while Quran.Foundation credential rotation is pending. It authorizes only provider-independent, synthetic, non-networked audit and hardening of the already committed import harness; it creates no new milestone or gate and changes no existing M5 acceptance requirement.

**Authorized scope:** audit and harden the existing provider-independent import contracts; manifest schema and validation with synthetic metadata; import-state transitions; checkpoints; reconciliation; checksum utilities; exact Arabic UTF-8, tashkeel, and normalization-damage verification with synthetic non-religious fixtures; canonical/provider identity separation; secret-shaped field rejection and evidence redaction; generic bounded retry, backoff, timeout, circuit-breaker, and HTTP 429 classification through injected synthetic responses; update, withdrawal, deletion, expiry, cancellation, and supersession transitions; lossless attribution and provenance metadata handling as opaque values; generic transaction-rollback and disposable-staging abstractions that persist no provider content; audit-event structures limited to identifiers, hashes, counts, timings, outcomes, and redacted error categories; and focused provider-independent tests. Every network-capable adapter method must remain fail-closed.

**Explicit exclusions:** no credential use, inspection, validation, loading, or storage; authentication; Quran.Foundation API call; endpoint or base-URL activation; authenticated metadata discovery; guessed or frozen provider resource ID; guessed Arabic edition, script, riwayah, version, numbering, response-shape, or provider-metadata semantic; real provider response mapping; real Quran payload or religious fixture; real-resource manifest; provider-content quarantine; canonical import; real PostgreSQL provider dry run; scholarly approval based on guessed content; publication; any PASS claim for `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated`; M6; migration `0005`; or M7 / Knowledge Engine work.

**Allowed files:**

- `src/lib/quran/import/contracts.ts`
- `src/lib/quran/import/manifest.ts`
- `src/lib/quran/import/state-machine.ts`
- `src/lib/quran/import/reconciliation.ts`
- `src/lib/quran/import/checkpoints.ts`
- `src/lib/providers/quran-foundation/adapter.ts`
- `src/lib/providers/quran-foundation/types.ts`
- `scripts/quran-import.mjs`
- `scripts/quran-import-verify.mjs`
- focused tests under `tests/quran-import/`

No environment file, database file, migration, package manifest, application route, UI, architecture document, or other repository file is authorized by this unit.

**Acceptance criteria:**

- manifest validation is deterministic, immutable, provider-independent, and rejects missing, malformed, inconsistent, production-only, or secret-shaped synthetic fields;
- canonical identities remain ALSAMAD-owned and no provider identifier becomes or deterministically defines a canonical UUID;
- evidence and errors redact secret-shaped values and contain no credential, token, full payload, or religious text;
- SHA-256 generation and verification are deterministic, and malformed values, mismatches, changed bytes, and changed manifest inputs fail closed;
- synthetic non-religious Arabic UTF-8 and tashkeel round-trip byte-exactly, while normalization, whitespace, punctuation, diacritic, or character damage is detected and rejected under the existing checksum policy;
- only legal state-machine transitions succeed; blocked, withdrawal, deletion, expiry, cancellation, and supersession paths cannot silently re-enter an earlier active state;
- checkpoint sequences are monotonic and idempotent; completed replay is suppressed; checksum-conflicting, stale, regressive, or superseded runs fail closed;
- reconciliation reports missing, extra, duplicate, orphaned, withdrawn, count, locator, checksum, attribution, provenance, retention, and license mismatches without making publication eligible;
- synthetic rollback and disposable-staging behavior leaves no canonical row, provider payload, or mixed-version state;
- attribution and provenance metadata pass through losslessly as opaque values without invented wording or provider semantics;
- injected transient, timeout, sustained-failure, and HTTP 429 responses prove bounded retry/backoff and terminal blocking without any network access;
- no endpoint, credential field, real resource identifier, provider response shape, real Quran content, or religious fixture is added or frozen;
- `npm run quran:import:verify`, the synthetic `npm run quran:import:dry-run`, focused tests, `npm test`, full `npm run verify`, Prettier, and `git diff --check` pass; and
- the changed-file list is contained exactly within this unit's allowed files.

**Dependency and handoff:** M5.1 and the M5.2 architecture contract are complete, and REG-0009 records the non-commercial intended-use decision. Credential rotation may remain pending throughout M5.2A because this unit authorizes no access or fetch. Completing M5.2A does not satisfy the provider credential, legal/license, exact source-selection, scholarly, provider dry-run, or production activation gate. The next external dependency remains rotated Quran.Foundation credentials plus confirmed server-side Content API environment, access, and scope; no authenticated action may begin until that dependency is separately satisfied. M6 remains blocked on `M5 Quran Import Activated`.

### ARC-001 — License Publication Rights Separation

**Authorization:** REG-0010 and ADR-0003 approve one narrow implementation unit to bring the existing license schema, edition-publication trigger, M5.2 manifest legal evaluation, synthetic fixtures, and focused tests into conformance with the separate in-application-display and standalone-redistribution rights model. This unit authorizes no provider access, credentials, content fetch, real-resource manifest, real dry run, publication, M5 gate PASS, ARC-002 work, M6, or M7.

**Physical contract:** the forward migration renames the existing `redistribution_allowed` field to `standalone_redistribution_allowed`, preserving its original values and meaning, and adds `in_application_display_allowed boolean NOT NULL DEFAULT false`. Publication requires affirmative in-application-display permission and never infers it from historical redistribution values. Standalone redistribution remains separately recorded and is not a publication prerequisite. All existing license status, effective-window, attribution, retention, derivative, immutability, and withdrawal gates remain enforceable.

**Manifest contract:** add an explicit in-application-display decision and rename the redistribution decision to standalone redistribution under a new manifest schema version. Required capabilities exercised by the intended operation must be approved. Commercial-use and standalone-redistribution decisions must be known but may be denied when the intended operation exercises neither. Unknown remains blocking, and no denied capability may be exercised. Historical manifest versions and checksums retain their original semantics and are never reinterpreted. This unit does not address ARC-002's separate immutable-manifest/run-evidence question.

**Allowed files:**

- `src/db/schema.ts`
- `drizzle/0005_license_publication_rights_separation.sql`
- `drizzle/meta/_journal.json`
- `src/lib/quran/import/contracts.ts`
- `src/lib/quran/import/manifest.ts`
- `scripts/db-verify.mjs`
- `scripts/quran-import.mjs`
- `scripts/quran-import-verify.mjs`
- focused tests under `tests/quran-import/`

Migration `0002` is immutable and must not be edited. Migration `0005` is the next forward migration because committed migrations end at `0004`; it adds no table and preserves the 30-table Release 1 freeze. M6's future devotional migration, originally moved to `0006_devotional_content_foundation.sql` by this correction, then to `0007_devotional_content_foundation.sql` by the ARC-004 correction at `0006`, then to `0008_devotional_content_foundation.sql` following the AUD-001 correction at `0007` (see AUD-001 below), then to `0009_devotional_content_foundation.sql` following the ARC-005 reservation at `0008` (see ARC-005 below), now moves to `0010_devotional_content_foundation.sql` following the AUD-ARC005-001 reservation at `0009` (see AUD-ARC005-001/002 below). This numbering correction does not authorize M6.

**Acceptance:** real PostgreSQL verification proves the renamed standalone-redistribution value is preserved, application-display defaults false, no value is inferred, and publication succeeds with application display allowed plus standalone redistribution denied while failing when application display is denied or unknown. Manifest tests prove the corresponding approved/denied/unknown rules under a new schema version. Run focused Quran-import tests, `npm run quran:import:verify`, synthetic `npm run quran:import:dry-run`, database safety/migrations twice/seeds twice/`npm run test:db`/`npm run db:check`, `npm test`, full `npm run verify`, format check, `git diff --check`, and preserved-volume shutdown. M5.1's historical PASS remains valid; M5.2A's affected legal-gate behavior requires correction and re-verification. Neither later M5 gate passes through this unit.

### ARC-002 — Immutable Source Import Manifest versus Execution Evidence Separation

**Governance authority:** REG-0011 and ADR-0004 approve the v3 source-manifest/run-evidence separation and one later credential-free implementation unit. The current combined v2 contract hashes execution-time fields into an object described as immutable, preventing one approved source authorization from retaining a stable checksum across retries, attempts, and reconciliation. This decision authorizes no credential use, provider access, content fetch, real-resource manifest, provider dry run, publication, M5 gate PASS, ARC-003/004/005/006, M6, or M7.

**V3 contract:** `SourceImportManifest` contains only immutable source/import-authorization facts independently known and approved before execution. Its identity is `manifestId` plus deterministic `manifestChecksum`; the checksum covers only canonical immutable v3 fields. One manifest may link to multiple `ImportRunEvidence` records, each bound to both identity values. Run/attempt/process identity, timestamps, retries/backoff, checkpoints, actual counts, observed checksums and safe HTTP metadata, state transitions/status/errors, reconciliation, rollback/purge outcomes, audit events, generated evidence references, and final run/review disposition remain outside the manifest and cannot change its checksum.

Operational retry with unchanged source authorization reuses the manifest. A source/provider/resource/version, intended operation, legal or policy decision, approved target, expected assertion, or authorized adapter/normalization-contract change requires a new manifest identity/checksum. Existing completed-run replay suppression; checkpoint monotonicity, idempotency, conflict, staleness, cancellation, completion, and supersession rules; reconciliation blocking; rollback; provider independence; and payload/secret/religious-text redaction remain unchanged.

Historical v1 and v2 manifests retain their original schemas, canonical bytes, readers, and checksum meanings and are never recomputed or reinterpreted under v3. V2 remains historically verifiable but is not the corrected real-provider manifest contract. V3 is the first normative source-manifest/run-evidence separation.

**Authorized implementation boundary:** a later implementation task may modify only `src/lib/quran/import/contracts.ts`, `src/lib/quran/import/manifest.ts`, `src/lib/quran/import/checkpoints.ts`, `src/lib/quran/import/state-machine.ts` only where run linkage requires it, `src/lib/quran/import/reconciliation.ts` only where evidence linkage requires it, `scripts/quran-import.mjs`, `scripts/quran-import-verify.mjs`, and focused tests under `tests/quran-import/`. It may implement only v3 manifest construction/validation/checksum, separate run/evidence ownership and linkage, historical v1/v2 readers or verification fixtures, deterministic replay/checkpoint/reconciliation/rollback linkage, and credential-free synthetic conformance tests. Every provider network method remains fail-closed.

No environment, provider-access, database, migration, Drizzle, package, route, UI, architecture/governance, or unrelated test file is authorized by that later implementation unit. No new table is authorized; the Release 1 catalog remains frozen at 30 tables.

**Implementation acceptance:** focused synthetic tests must prove v3 checksum stability when only execution timestamps, attempts, checkpoints, observed counts/checksums, status, errors, reconciliation, rollback, or generated evidence references differ; a governed source/input change must change manifest identity/checksum; every run binds to both manifest ID and checksum; multiple runs/attempts link without manifest mutation; completed replay suppression and checkpoint conflict/staleness rules remain fail-closed; reconciliation and rollback are append-only and payload-free; and v1/v2 historical checksums remain verifiable only under their original version rules. Run `npm run quran:import:verify`, synthetic `npm run quran:import:dry-run`, focused Quran-import tests, `npm test`, full `npm run verify`, format check, and `git diff --check`. No database verification or migration is required because ARC-002 changes no schema.

**Status and handoff:** ARC-002 is implemented — `src/lib/quran/import/manifest.ts` and `src/lib/quran/import/contracts.ts` carry `ARC002_MANIFEST_SCHEMA_VERSION = 3` and the v3 source-manifest/run-evidence separation contract, committed at HEAD. M5.1 remains PASS; ARC-001 remains complete. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked. Provider dry-run work still requires those separate, unmet gates; this implementation does not itself pass either.

**Dependency boundaries:** ARC-002 is decided before ARC-003 conformance correction. ARC-004 is architecturally independent. ARC-005 is an independent release concern but downstream for activation. ARC-006 is independent governance/documentation work. None is solved or authorized here.

### ARC-004 — License-Version Immutability and Historical License Evidence

**Authorization:** REG-0012 and ADR-0005 approve one narrow implementation unit to strengthen `licenses` table immutability once a license version is first relied upon, and to tighten `SourceImportManifest` v3's license/attribution reference validation. This unit authorizes no provider access, credentials, content fetch, real-resource manifest, provider dry run, publication, M5 gate PASS, ARC-005/006 work, M6, or M7.

**Physical contract:** the forward migration extends license immutability beyond the existing identity tuple (`provider_code`, `license_key`, `version`, `effective_from`) to also freeze, once a license row's `status` first reaches `active`, its rights-bearing legal content: `rights_scope`, `attribution_text`, `terms_url`, `retention_policy`, `retention_days`, `in_application_display_allowed`, `standalone_redistribution_allowed`, `derivatives_allowed`, and `effective_until`. `status` itself remains changeable exactly as today, so that expiry, revocation, and withdrawal remain representable without rewriting the historical legal content that was relied upon. A later legal or provider revision requires a new license row under a new `version`, never an edit to an existing active row.

**Manifest contract:** `SourceImportManifest` v3's `licenseDecisionReference` and `attributionDecision`'s attribution reference must be non-blank and must identify the exact immutable license evidence relied upon. This unit adds that validation without changing manifest schema version, checksum semantics, or any other v3/v2/v1 field or behavior.

**Allowed files:**

- `src/db/schema.ts`
- `drizzle/0006_license_version_immutability.sql`
- `drizzle/meta/_journal.json`
- `src/lib/quran/import/contracts.ts`
- `src/lib/quran/import/manifest.ts`
- `scripts/db-verify.mjs`
- focused tests under `tests/quran-import/`
- `tests/database-foundation.test.mjs`

Migration `0005` is immutable and must not be edited. Migration `0006` is the next forward migration because committed migrations end at `0005`; it adds no table and preserves the 30-table Release 1 freeze. M6's future devotional migration moved from `0006_devotional_content_foundation.sql` to `0007_devotional_content_foundation.sql` after this correction, then to `0008_devotional_content_foundation.sql` following the later AUD-001 correction at `0007` (see AUD-001 below), then to `0009_devotional_content_foundation.sql` following the ARC-005 reservation at `0008` (see ARC-005 below), and now moves to `0010_devotional_content_foundation.sql` following the AUD-ARC005-001 reservation at `0009` (see AUD-ARC005-001/002 below). This numbering correction does not authorize M6.

**Acceptance:** real PostgreSQL verification proves that once a license row's `status` first reaches `active`, an `UPDATE` changing any of `rights_scope`, `attribution_text`, `terms_url`, `retention_policy`, `retention_days`, `in_application_display_allowed`, `standalone_redistribution_allowed`, `derivatives_allowed`, or `effective_until` is rejected, while a `status` transition alone continues to succeed exactly as today. Manifest tests prove a blank `licenseDecisionReference` or a blank required attribution reference is rejected, and that every existing ARC-001/ARC-002/ARC-003 test continues to pass unmodified. Run focused Quran-import tests, `npm run quran:import:verify`, synthetic `npm run quran:import:dry-run`, database safety/migrations twice/seeds twice/`npm run test:db`/`npm run db:check`, `npm test`, full `npm run verify`, format check, `git diff --check`, and preserved-volume shutdown.

**Status and handoff:** ARC-004 is implemented — `drizzle/0006_license_version_immutability.sql` is committed at HEAD. M5.1 remains PASS; ARC-001, ARC-002, and ARC-003 remain complete. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked. Real provider manifest creation and provider dry-run work still require those separate, unmet gates; this implementation does not itself pass either.

**Dependency boundaries:** ARC-004 is architecturally independent of ARC-005 (atomic Quran release selector) and ARC-006 (stale M6 prerequisite). Neither is solved or authorized here.

### AUD-001 — M5 Publication Trigger Table-Branching Correction

**Authorization:** A completed repository-wide adversarial audit found, and confirmed against real PostgreSQL using rolled-back transactions, that `enforce_m5_publication()` (`drizzle/0004_quran_data_model.sql`) cannot safely serve all three tables it is attached to. Its `quran_surahs`-specific reconciliation check references `NEW.work_id` inside a flat boolean expression guarded only by `tg_table_name='quran_surahs' AND (...)`, rather than a table-specific procedural branch. `work_id` exists on `quran_surahs` but not on `quran_ayahs` or `quran_structural_markers`, and PL/pgSQL resolves that field reference regardless of which table actually fired the trigger. This authorizes one narrow implementation unit to correct exactly that defect. It authorizes no provider access, credentials, content fetch, real-resource manifest, provider dry run, publication-policy change, ARC-005 work, M6, or M7.

**Defect statement:** AUD-001 is a confirmed M5 publication-trigger defect, not a new publication policy. The existing architecture already intends `quran_surahs`, `quran_ayahs`, and `quran_structural_markers` rows to be publishable (`ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.2, §5.3.3); the current implementation prevents the legitimate `draft`/`validated` → `published` transition for `quran_ayahs` and `quran_structural_markers` with a database error (`record "new" has no field "work_id"`, SQLSTATE `42703`) on every attempt. No existing test previously exercised this transition for those two tables, which is why the defect went undetected. This is a conformance/correctness repair.

**Physical contract:** the forward migration replaces only `enforce_m5_publication()`'s behavior with table-specific procedural branching — `IF tg_table_name='quran_surahs' THEN ... ELSIF tg_table_name='quran_ayahs' THEN ... ELSIF tg_table_name='quran_structural_markers' THEN ... END IF;` — preserving the existing intended validation behavior, exception messages, and SQLSTATE/error codes exactly. It must not weaken publication eligibility, alter Quran text, change schema/table ownership, add a table, or change read/release-selection semantics. Migration `0004` is immutable and is not edited.

**Allowed files:**

- `drizzle/0007_m5_publication_trigger_table_branching.sql` (migration number fixed at `0007`; a slightly different descriptive suffix is permitted if required by tooling)
- `drizzle/meta/_journal.json`
- `scripts/db-verify.mjs`
- focused tests under `tests/quran-import/` and/or `tests/database-foundation.test.mjs`

Migration `0004` is immutable and must not be edited. Migration `0007` is the next forward migration because committed migrations end at `0006`; it adds no table and preserves the 30-table Release 1 freeze. M6's future devotional migration moved from `0007_devotional_content_foundation.sql` to `0008_devotional_content_foundation.sql`, the next available number after this correction, then to `0009_devotional_content_foundation.sql` following the ARC-005 reservation at `0008` (see ARC-005 below), and now moves to `0010_devotional_content_foundation.sql` following the AUD-ARC005-001 reservation at `0009` (see AUD-ARC005-001/002 below). This numbering correction does not authorize ARC-005 or M6.

**Acceptance:** real PostgreSQL verification proves a valid `quran_surahs` publication still succeeds exactly as before; a valid `quran_ayahs` publication succeeds; a valid `quran_structural_markers` publication succeeds; invalid publication attempts for all three remain blocked with their existing exception messages/errcodes; no table-specific branch can reference a column belonging to another table; and a failed publication transaction leaves no partial publication state. Rerun all applicable M2/M3/M4/M5 and ARC-001–004 regressions, focused Quran-import tests, `npm run quran:import:verify`, synthetic `npm run quran:import:dry-run`, database safety/migrations twice/seeds twice/`npm run test:db`/`npm run db:check`, `npm test`, full `npm run verify`, format check, `git diff --check`, and preserved-volume shutdown.

**Status and handoff:** AUD-001 is implemented — `drizzle/0007_m5_publication_trigger_table_branching.sql` and its `scripts/db-verify.mjs` regression coverage are committed at HEAD `5a901ec`. `M5 Schema Foundation Verified` remains PASS; ARC-001, ARC-002, ARC-003, and ARC-004 remain complete. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked. This implementation satisfies the precondition for ARC-005 implementation to later begin, since a release-activation selector has no value if the content it would select can never be published; it does not itself authorize ARC-005 implementation.

**Dependency boundaries:** AUD-001 is independent of ARC-006. Its completion satisfies the precondition ARC-005 implementation depends on; ARC-005 is now decided and specified (`REG-0013`/`ADR-0006`, see ARC-005 below) but remains unimplemented and is not authorized here.

### ARC-005 — Atomic Quran Release Selector and Publication Consistency

**Authorization:** `REG-0013` and `ADR-0006` approve one narrow future implementation unit to add a database-enforced default-release selector for the Arabic Quran edition and, independently per locale, for approved translation editions. This decision authorizes no provider access, credentials, content fetch, real-resource manifest, provider dry run, publication, M5 gate PASS, ARC-006, M6, or M7. It authorizes no migration, schema change, or code today.

**Selector contract:** `editions` and `quran_translation_editions` each gain one additive `is_active_release boolean NOT NULL DEFAULT false` column, exempt from each table's existing post-publication immutability freeze alongside `publication_state`/`review_status` and `updated_at`. A `UNIQUE` partial index enforces at most one active `editions` row per `work_id` while `publication_state = 'published'`, and at most one active `quran_translation_editions` row per `locale_id` while `review_status = 'approved'` — two independent selector domains, never coupled, because canonical `quran_ayahs`/`quran_surahs` identity is edition-independent and every translation row already keys off `ayah_id` rather than a specific Arabic edition. A `CHECK` constraint on each table (`NOT is_active_release OR publication_state = 'published'`, respectively tied to `review_status = 'approved'`) makes it physically impossible for a withdrawn/rejected row to remain marked active. Activation and rollback are the same single-transaction, two-statement primitive (clear the prior active row for the scope, then set the new one); a failed switch leaves the prior state unchanged; zero-active is a valid, honestly-reported unavailable state and must never resolve through an implicit "most recent" fallback. Full rationale, alternatives, and rejected alternatives are recorded in `ADR-0006`; the full column/index/trigger contract is recorded in `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.12.

**Selector versus live eligibility (governs the future read path):** `is_active_release` is a default-selection signal, never independent proof of current servability — it cannot see the backing `licenses.status`/`effective_until`, a translation's backing generic `editions` state, or `locales.enabled`, and license time-expiry requires no write. Every public Quran read must re-derive the full live eligibility chain at read time, in the same bounded/transactionally consistent query that resolves the active candidate; an active-but-now-ineligible candidate fails closed exactly like zero-active, with no silent fallback to a different published edition or approved translation. Governed activation validates full eligibility at the moment of activation, but that is a point-in-time gate, not a standing guarantee. License revocation/expiry, generic-edition withdrawal, and locale disablement remain existing, unblocked, one-way safety operations; no cross-layer trigger is added to `licenses`/`editions` to block them or to auto-clear `is_active_release` when they occur. Read-time revalidation carries the correctness guarantee instead, and the Publisher/governed-activation workflow (`ALSAMAD_ADMIN_ARCHITECTURE.md` §30.1, §29.2) is responsible for explicit deactivation, rollback, or replacement once a loss is noticed. `src/lib/quran/content/db-source.ts` is not modified today, but its future implementation is bound by this contract; see `ADR-0006` and `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.12 for the full text.

**Allowed files (future implementation unit; not authorized today):**

- `src/db/schema.ts`
- `drizzle/0008_atomic_quran_release_selector.sql`
- `drizzle/meta/_journal.json`
- `scripts/db-verify.mjs`
- `tests/database-foundation.test.mjs`

Migration `0007` is immutable and must not be edited. Migration `0008` was the next available forward migration after AUD-001 at `0007` and is now committed (`drizzle/0008_atomic_quran_release_selector.sql`, HEAD `b6fea65`); it adds no table and preserves the 30-table Release 1 freeze. M6's future devotional migration moved from `0008_devotional_content_foundation.sql` to `0009_devotional_content_foundation.sql` following this reservation, and now moves to `0010_devotional_content_foundation.sql` following the AUD-ARC005-001 reservation at `0009` (see AUD-ARC005-001/002 below). This numbering history does not authorize ARC-005 implementation beyond what is separately recorded below, ARC-006, or M6.

**Acceptance (future implementation unit; not run today):** real PostgreSQL verification would need to prove that at most one `editions` row per `work_id` and at most one `quran_translation_editions` row per `locale_id` can be simultaneously active; that concurrent activation attempts for the same scope serialize through the partial unique index with exactly one commit succeeding; that withdrawal of an active row is rejected unless `is_active_release` is cleared in the same transaction; that a zero-active scope is queryable and reports honestly with no implicit fallback row; that activation and rollback are each a single atomic transaction with no externally observable intermediate state; and that all existing M2–M5 and ARC-001–004/AUD-001 regressions remain green. In addition, once the future read path exists, its tests must prove: an active-but-license-revoked candidate is not served; an active candidate whose license `effective_until` has elapsed is not served; an active translation whose locale becomes disabled is not served; an active translation whose backing generic edition becomes ineligible is not served; none of these cases triggers an automatic fallback to a different row; a zero-eligible-active scope fails closed identically to a zero-active scope; an explicit governed replacement/rollback succeeds atomically once performed; concurrent activation attempts still leave at most one active candidate; both activation-time eligibility validation and read-time eligibility revalidation independently pass their respective cases; and no read ever mixes content across inconsistent selector states between the two domains. None of this verification is run by this documentation-only decision.

**Status and handoff:** ARC-005 core implementation is complete — `drizzle/0008_atomic_quran_release_selector.sql` is committed at HEAD `b6fea65`, with the selector columns, partial unique indexes, `CHECK` constraints, activation-validation trigger, and `src/lib/quran/content/db-source.ts` read-path revalidation all in place and passing real PostgreSQL verification at implementation time. An independent post-implementation adversarial audit subsequently found two confirmed defects — `AUD-ARC005-001` (HIGH: the activation-validation trigger fires only on `UPDATE OF is_active_release` and never validates `INSERT ... is_active_release = true`, reproduced against real PostgreSQL for both `editions` and `quran_translation_editions`) and `AUD-ARC005-002` (MEDIUM: the committed query-plan regression assertion is tautological and never actually proved index usage) — recorded and authorized for correction below. `M5 Schema Foundation Verified` remains PASS; ARC-001, ARC-002, ARC-003, ARC-004, and AUD-001 remain complete or implemented as previously recorded. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked, independent of this decision. Neither the original implementation nor this status update selects a source, approves credentials, authorizes provider access, creates a real manifest, permits a fetch or dry run, or approves publication of any real content.

**Dependency boundaries:** ARC-005 is architecturally independent of ARC-004 and of ARC-006 (stale M6 prerequisite). It depended on AUD-001's completion as a precondition (satisfied) but did not itself depend on ARC-002/ARC-003 conformance work. `AUD-ARC005-001`/`AUD-ARC005-002` correction (below) must complete before ARC-006 begins. Neither ARC-006 nor M6 is solved or authorized here.

### AUD-ARC005-001 / AUD-ARC005-002 — ARC-005 Post-Implementation Correction

**Authorization:** An independent post-implementation adversarial audit of the committed ARC-005 implementation (HEAD `b6fea65`) found two confirmed defects, reproduced against real PostgreSQL, and issued a final verdict of "DEFECTS FOUND — correction required before proceeding," explicitly holding ARC-006 back until corrected. This authorizes one narrow future correction unit restoring the already-approved `ADR-0006` activation-validation guarantee and correcting a faulty verification assertion. It does not reopen `ADR-0006`, does not change the ARC-005 architecture or selector model, and authorizes no provider access, credentials, content fetch, real-resource manifest, provider dry run, publication, M5 gate PASS, ARC-006, M6, or M7. It authorizes no migration, schema change, or code today.

**AUD-ARC005-001 defect statement:** The committed `ADR-0006`/§5.3.12 activation-validation contract requires every transition into `is_active_release = true` to pass full activation eligibility, regardless of whether the row becomes active through `INSERT` or `UPDATE`. Migration `0008`'s `enforce_release_selector_activation()` is attached only as `BEFORE UPDATE OF is_active_release` on both `editions` and `quran_translation_editions`, so a row inserted directly with `is_active_release = true` (and `publication_state = 'published'` / `review_status = 'approved'` already set) bypasses activation validation entirely — reproduced live against real PostgreSQL for both tables. This is a conformance defect in the migration `0008` implementation, not a change to the approved selector design.

**AUD-ARC005-002 defect statement:** The committed `scripts/db-verify.mjs` ARC-005 query-plan assertion checks the literal substring `"Relation Name": "editions", "Node Type": "Seq Scan"`, but PostgreSQL's `EXPLAIN (FORMAT JSON)` always emits `"Node Type"` before `"Relation Name"` in each plan node, so the assertion can never match regardless of actual planner behavior. The prior "index-supported query" claim was not actually verified. This is a verification-harness defect, not a claim that the underlying indexes are structurally wrong.

**Physical contract:** the forward migration replaces `enforce_release_selector_activation()`'s trigger wiring so activation validation runs when `TG_OP = 'INSERT' AND NEW.is_active_release = true`, or `TG_OP = 'UPDATE' AND NEW.is_active_release = true AND OLD.is_active_release = false` — matching exactly the same eligibility checks already approved for the `UPDATE` path, with no new eligibility rule and no re-validation required on unrelated updates to an already-active row. It must preserve: existing `UPDATE` activation behavior; zero-active support; the partial unique-index selector domains (`editions` per `work_id`, `quran_translation_editions` per `locale_id`); read-time live eligibility in `src/lib/quran/content/db-source.ts` as the standing guarantee for later upstream eligibility changes; no-silent-fallback behavior; and withdrawal/rollback semantics. It must not add a table and must not add a column unless the committed `ADR-0006` contract is found to unexpectedly require one. Migration `0008` is immutable and is not edited.

**Verification contract:** the correction must add focused real-PostgreSQL tests proving `INSERT`-time activation cannot bypass eligibility for either selector domain (mirroring the already-reproduced audit evidence), and must correct the query-plan assertion to inspect `EXPLAIN (FORMAT JSON)` structurally or by plan-node fields rather than relying on JSON key ordering, distinguishing query boundedness/index compatibility from actual planner choice on tiny fixtures. PostgreSQL is not required to choose an index scan on tiny datasets where a sequential scan is legitimately cheaper, and the corrected test must not claim realistic-volume index usage was proven if fixtures remain too small to prove that; a bounded, disposable synthetic-cardinality fixture may be authorized for that purpose only if the frozen ARC-005 contract is found to require realistic-cardinality plan verification, and any such fixture must not alter production seed semantics.

**Allowed files (future correction unit; not authorized today):**

- `src/db/schema.ts`
- `drizzle/0009_arc005_insert_activation_validation.sql`
- `drizzle/meta/_journal.json`
- `scripts/db-verify.mjs`
- `tests/database-foundation.test.mjs`

Migration `0008` is immutable and must not be edited. Migration `0009` is reserved for this correction, the next available forward migration after ARC-005 at `0008`; it adds no table and preserves the 30-table Release 1 freeze. M6's future devotional migration moves from `0009_devotional_content_foundation.sql` to `0010_devotional_content_foundation.sql`, the next available number after this reservation (see Phase 6 below). This numbering reservation does not authorize this correction's implementation, ARC-006, or M6.

**Acceptance (future correction unit; not run today):** real PostgreSQL verification would need to prove that a direct `INSERT` with `is_active_release = true` is rejected under the same eligibility conditions already proven for `UPDATE` (unpublished/unapproved, ineligible license, disabled locale, unpublished backing edition) on both `editions` and `quran_translation_editions`; that existing `UPDATE`-path activation, zero-active support, partial-unique-index uniqueness, read-time live-eligibility revalidation, no-silent-fallback, and withdrawal/rollback behavior all remain exactly as previously verified; that the corrected query-plan assertion structurally inspects plan nodes rather than relying on key order and does not assert realistic-volume index usage unless a realistic-cardinality fixture actually justifies that claim; and that all existing M2–M5, ARC-001–004, AUD-001, and ARC-005 regressions remain green. None of this verification is run by this documentation-only correction.

**Status and handoff:** `AUD-ARC005-001`/`AUD-ARC005-002` are implemented at `1846588` through `drizzle/0009_arc005_insert_activation_validation.sql` and the corrected structural query-plan verification. `M5 Schema Foundation Verified` remains PASS; ARC-001, ARC-002, ARC-003, ARC-004, AUD-001, and ARC-005's core implementation remain complete or implemented as previously recorded. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked, independent of this correction. This implementation did not select a source, approve credentials, authorize provider access, create a real manifest, permit a fetch or dry run, or approve publication of any real content.

**Dependency boundaries:** This correction is architecturally independent of ARC-002/ARC-003/ARC-004 conformance work and does not reopen `ADR-0006`, `REG-0013`, or the ARC-005 selector design. Its completion at `1846588` satisfies the prerequisite for the documentation-only ARC-006 reconciliation; it does not authorize M6.

### M5.2 acceptance gates

Separated and sequential; passing one does not imply the next passes:

1. Contract complete — this document.
2. Provider credentials available — controlled sandbox credentials provisioned server-side.
3. Legal/license approval — rights, attribution, retention, commercial-use, and redistribution decisions recorded.
4. Source-selection approval — exact resource/edition/version approved for controlled use.
5. Controlled sandbox fetch — adapter fetch proven against sandbox/staging only.
6. Manifest generation — an immutable manifest is produced matching database architecture 5.3.10.
7. Quarantine validation — schema, checksum, and size validation proven on quarantined payloads.
8. Dry-run import — the full staged pipeline executes with `dry_run = true`.
9. Reconciliation pass — the reconciliation matrix shows zero unresolved blocking mismatch.
10. Scholarly review — named reviewers sign off on the dry-run evidence.
11. Production activation — outside M5.2; requires all prior gates plus the Phase 5 production activation gate (`M5 Quran Import Activated`).

This refines gate 6 (`M5 Provider Import Dry Run Verified`) from the M5 acceptance table above into its component sub-gates; it does not replace or relax that table.

### M5.2 open decisions

Left unresolved until Quran.Foundation replies: permanent storage rights beyond the seven-day default; exact attribution wording; commercial-use rights; translation-specific licenses; audio usage rights; Search API production access; exact quotas; long-term caching; offline use; redistribution rights; provider SLA; deletion/exit rights; and the approved legally independent fallback source. None of these unresolved items blocks this architecture contract; each blocks only the acceptance gate that depends on it.

### M5.2 release status

Architecture contract complete; implementation not started by this documentation task. No M5.2 PASS label is authorized until a separately approved implementation contract executes this unit and its dry-run gate passes on real PostgreSQL and a controlled sandbox provider.

### M5.2B — Quran.Foundation Credential-Gate Contract (Pre-Production/Production Configuration and Server-Side Token Acquisition)

This subsection is the separately authorized implementation unit M5.2A's own "Dependency and handoff" pointed to: "the next external dependency remains rotated Quran.Foundation credentials plus confirmed server-side Content API environment, access, and scope; no authenticated action may begin until that dependency is separately satisfied." Quran.Foundation credentials are now externally rotated; this unit authorizes exactly the credential configuration and server-side Content API token-acquisition boundary needed to satisfy that dependency — nothing more. It creates no new milestone, weakens no existing M5 acceptance requirement, and does not itself satisfy `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated`.

**Environment terminology mapping.** Quran.Foundation externally names its non-production environment "Pre-Production." The repository's `ProviderEnvironment` type (`src/lib/quran/import/contracts.ts`) is the closed vocabulary `"sandbox" | "staging" | "production"`, and `manifest.ts`'s `ALLOWED_ENVIRONMENTS` already restricts any constructible manifest to `{"sandbox", "staging"}` — `"production"` cannot be targeted by a manifest today, unchanged by this unit. This contract resolves the mapping explicitly and singularly: **Quran.Foundation "Pre-Production" maps to the repository's `"sandbox"` value.** `"sandbox"` is chosen, not `"staging"`, because every existing credential-specific reference in this Roadmap already pairs "sandbox" with credentials and configuration (M5.2 acceptance gate 2: "controlled sandbox credentials provisioned server-side"; M5.2 Explicitly excluded scope: "only placeholder/synthetic sandbox configuration is authorized"), and `"sandbox"` is the first-listed, primary non-production value in both `ProviderEnvironment` and `ALLOWED_ENVIRONMENTS`. `"staging"` remains a reserved, unmapped value in the type system; this unit does not assign it to any external environment and does not remove it from the type. "Production" remains the repository's `"production"` value, unchanged, and remains excluded from `ALLOWED_ENVIRONMENTS` until a separately authorized later gate changes that.

**Client API scope clarification.** "OAuth" in `ALSAMAD_IMPLEMENTATION_ROADMAP.md` line 670 ("M5 authorizes Content adapter work only; it authorizes no OAuth or user feature") and `ALSAMAD_SECURITY_ARCHITECTURE.md` line 439 ("Authorization Code + PKCE/OIDC account linking is Prepared only") refers exclusively to the user-facing Quran.Foundation User API / account-linking flow, which remains Prepared-only and out of scope here, unchanged. The server-to-server Content API token acquisition this unit authorizes is "Content adapter work" under the same line 670's own framing ("Content API credentials are server-only secrets... Content access... [is] separately capability-gated" from user/OAuth scopes) and is not the excluded "OAuth or user feature." No User API, account linking, or QF `sub` identity work is authorized by this unit.

**Authorized scope:**

- Defining placeholder-only environment-variable names (no values) for Pre-Production and Production Client ID/Client Secret pairs, and an explicit provider-environment selector, as normative repository configuration.
- Extending `QuranFoundationAdapterConfig` (`src/lib/providers/quran-foundation/types.ts`) with a credential/environment configuration shape.
- A new server-only environment/config module, following the existing `src/db/env.ts` pattern (one validated schema, one accessor function, no scattered `process.env.X`); its exact path is determined during implementation.
- Extending `src/lib/providers/quran-foundation/adapter.ts` with server-side Quran.Foundation Content API token acquisition **only** — using the explicitly selected environment's credential pair, retained in memory only, never persisted, logged, or embedded in a manifest/evidence/checkpoint/audit-event/database row.
- Focused, provider-independent-style tests proving structural credential validation, environment isolation, redaction, and fail-closed behavior using synthetic/injected values only — never a real secret.

**Explicit exclusions:** `discoverResources`, `fetchResourceMetadata`, `fetchBatch`, `getVersionToken`, `getDeletionOrWithdrawalSignals`, `produceAttribution`, or any other resource/content/metadata request; any real HTTP call to a Quran.Foundation endpoint; endpoint/base-URL activation; a real `SourceImportManifest`; provider dry run; publication; any PASS claim for `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated`; any Production credential use of any kind; any database, schema, or migration change; M6; M7; and any Quran.Foundation User API/OAuth account-linking work. The Roadmap's gate ordering (below) is preserved exactly; this unit does not compress or reorder it.

**Client ID classification:** a sensitive operational identifier, not an authentication secret. It may be read server-side and must not be exposed unnecessarily (no logging, no client bundle, no unredacted evidence), but possessing it is not by itself permission to access the provider.

**Client Secret classification:** a secret, unconditionally. It is server-only and must never enter logs, manifests, `ImportRunEvidence`, checkpoints, database rows, audit evidence, client bundles, URLs/query strings, or any persistence performed by import tooling — matching the existing `SECRET_MARKERS`/`findSecretField` rejection already enforced in `src/lib/quran/import/manifest.ts`.

**Access-token contract:** the later implementation must acquire a Quran.Foundation Content API access token server-side, only for the explicitly selected environment's credential pair; retain the token in memory only, never persisted (no database row, no manifest/evidence/checkpoint/audit-event field); never log the token or the `Authorization` header; treat token lifetime as bounded and reacquire on expiry rather than storing a durable or refresh token; never reuse a Pre-Production token against Production or vice versa; and fail closed on any acquisition or validation failure. No refresh-token persistence is authorized; if Quran.Foundation documentation later proves a refresh mechanism is required, it must be handled within this same server-only, no-persistence boundary unless a new explicit contract is separately authorized.

**Server-only boundary:** the credential/token module and every symbol it exports must be importable only from server-side code. No environment key may use a `NEXT_PUBLIC_` prefix. No secret or token may be serialized through a React Server Component payload, route metadata, static HTML, or build output. No client component or browser-reachable code may import the credential module, the config module, or the adapter's credential-bearing methods.

**Environment isolation:** Pre-Production (`sandbox`) code may read only Pre-Production credentials; Production code may read only Production credentials. No fallback from missing Pre-Production credentials to Production, and no fallback from missing Production credentials to Pre-Production, in either direction. Both credential sets may exist simultaneously in an operator's environment; selection is always explicit via the environment selector, never inferred or defaulted. Production is never the default value of the selector. Missing or incomplete credentials for the selected environment fail closed. Credential availability is explicitly not provider-use authorization — see Network authorization order below.

**Normative environment-variable names (placeholder names only; no value is authorized by this contract):**

- `QURAN_FOUNDATION_SANDBOX_CLIENT_ID`
- `QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET`
- `QURAN_FOUNDATION_PRODUCTION_CLIENT_ID`
- `QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET`
- `QURAN_FOUNDATION_ENVIRONMENT` — explicit selector; accepted values are exactly `sandbox` and `production` for this unit (matching the Pre-Production→`sandbox` mapping above); `staging` remains reserved and unmapped and is not an accepted value here. No default value is authorized; a missing or unrecognized selector fails closed.

**Allowed files (future implementation unit; not authorized today):**

- `.env.example` — placeholder names only, never values
- `src/lib/providers/quran-foundation/types.ts`
- `src/lib/providers/quran-foundation/adapter.ts` — token-acquisition boundary only, no fetch/metadata methods
- a new server-only environment/config module under `src/lib/providers/quran-foundation/` (exact filename determined during implementation)
- focused tests under `tests/quran-import/` or a new `tests/quran-foundation-credentials/` directory

No database file, migration, schema file, UI, application route, admin surface, architecture document, Decision Registry entry, or ADR is authorized by this unit.

**Gate-2 evidence — what counts as Credential Gate PASS** (refines M5.2 acceptance gate 2, "Provider credentials available — controlled sandbox credentials provisioned server-side"; does not replace or relax it):

- the selected provider environment is explicitly known (no default, no inference);
- the required Client ID for that environment is present;
- the required Client Secret for that environment is present;
- the credential pair passes structural validation (non-blank, expected shape) without any network call;
- the server-only boundary is proven (no client-bundle reachability, no `NEXT_PUBLIC_` key);
- secret redaction is proven (a secret-shaped value injected into any evidence/log path is rejected or redacted, exactly as `findSecretField`/`redactEvidence` already do for manifest/evidence construction);
- no persistence is proven (no credential or token value survives outside process memory);
- environment isolation is proven (Pre-Production code cannot read Production credentials and vice versa, and no fallback occurs when one set is absent);
- evidence records only safe metadata — selected environment name, structural-validation result, and timestamp/run identity if already governed elsewhere — and never a secret or token value.

Gate 2 can be structurally PASS on the above evidence alone, **before** any first network token validation — structural configuration/isolation/redaction proof does not require contacting the provider. Provider-side token acquisition and validation is a distinct, later step (Network authorization order, step 3 below) and is not required for Gate 2 itself; Gate 2 does not claim provider-side validation occurred, only that the local credential boundary is correctly configured and safe.

**Network authorization order (preserves the existing M5.2 gate sequence exactly; does not reorder it):**

1. Credential configuration implemented (this unit's code, once separately executed).
2. Credentials available (Gate 2, above).
3. Provider-side token acquisition/validation authorized — a distinct, later, separately authorized execution step; **not authorized by this contract**.
4. Legal/license gate (M5.2 acceptance gate 3).
5. Exact source-selection gate (M5.2 acceptance gate 4).
6. Controlled Pre-Production (`sandbox`) fetch (M5.2 acceptance gate 5).
7. Manifest generation, quarantine validation, dry-run import, reconciliation, and scholarly review (M5.2 acceptance gates 6–10), then production activation (M5.2 acceptance gate 11, itself requiring the Phase 5 `M5 Quran Import Activated` gate).

This unit authorizes step 1 only (the code enabling steps 2–3 to later occur safely). It does not itself authorize step 3 or any step after it. A separate execution authorization is required before any real token request, metadata discovery, or content fetch occurs.

**Production block:** Production credentials may exist in secure operator/hosting storage but must not be used by this implementation unit or by anything it authorizes. No Production token request, no Production metadata request, no Production manifest, and no Production fetch are authorized here. Production remains gated by M5.2 acceptance gate 11 and the Phase 5 production-activation gate (`M5 Quran Import Activated`), both `NOT PASS`.

**Governance note:** this unit was evaluated against `ALSAMAD_DECISION_REGISTRY.md` §3 and §7 and does not meet the Registry-entry or ADR threshold — it defines placeholder-only naming and operationalizes secret-handling policy already approved in `ALSAMAD_SECURITY_ARCHITECTURE.md` §13/§28.1 and the existing M5.2/M5.2A provider boundary; it changes no physical representation, no frozen data model, and no cross-module boundary, and creates no irreversible persisted or licensing consequence. Per `ALSAMAD_DECISION_REGISTRY.md` §2 item 4, `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s own milestone/gate mechanism is the correct and sufficient authority for this "when is implementation authorized" question.

**Dependency and handoff:** M5.1, the M5.2 architecture contract, and M5.2A remain complete/PASS as previously recorded. This unit's own implementation is complete — `src/lib/providers/quran-foundation/env.ts` (the credential/config module), the extended `QuranFoundationAdapterConfig` and `adapter.ts` token-acquisition boundary, and the five normative environment-variable keys are committed (`58782c3`), covered by 23 focused tests. No real credential value has been used and no provider network call has occurred. Completing this unit did not itself satisfy the legal/license, source-selection, scholarly, provider dry-run, or production-activation gate, and did not authorize any Production access. `M5 Schema Foundation Verified` remains PASS. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked, independent of this contract.

### M5.2C — Local Pre-Production Credential Validation Script

This subsection is the separately authorized implementation unit closing M5.2B's own remaining gap: M5.2B implemented the credential/config functions (`readQuranFoundationCredentials`, `buildCredentialGateEvidence` in `src/lib/providers/quran-foundation/env.ts`) but wired no executable entry point to them — no repository command exists that reads an operator's real local `QURAN_FOUNDATION_*` environment and reports whether it is structurally valid. This unit authorizes exactly one narrow, server-only CLI script that does that, and nothing else. It creates no new milestone, weakens no existing M5 acceptance requirement, and does not itself satisfy `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated`.

**Authorized scope:**

- One new server-only verification script/CLI (exact filename determined during implementation, e.g. `scripts/quran-credential-check.mjs`) that calls the already-implemented `buildCredentialGateEvidence` (and, only as needed for the Pre-Production-only guard below, `readQuranFoundationCredentials`) from `src/lib/providers/quran-foundation/env.ts` against the real `process.env` — no new credential-reading logic is authorized; this script is a thin CLI wrapper around the already-committed M5.2B functions.
- Exactly one new `package.json` script entry (e.g. `"quran:credential-check": "node --import tsx scripts/quran-credential-check.mjs"`) invoking it, matching the existing convention already used for `quran:import:verify`/`quran:import:dry-run`. No dependency addition, version bump, or other `package.json` change is authorized.
- Focused tests proving the script's output contract and exit-code behavior using injected/synthetic environment objects — never a real credential value.

**Explicit exclusions:** any Quran.Foundation network call of any kind; any token request; any metadata discovery; any content fetch; any use of the `QURAN_FOUNDATION_PRODUCTION_CLIENT_ID`/`QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET` values; any claim, label, or exit condition equivalent to Gate 2 provider-side validation, `M5 Provider Import Dry Run Verified`, or `M5 Quran Import Activated`; any change to those gates' recorded status; any credential persistence (file, database, cache); any new credential-reading or validation logic beyond invoking the already-committed M5.2B functions; and any database, schema, or migration change.

**Pre-Production-only guard:** unlike the underlying M5.2B library functions (which are generically environment-aware and already support `sandbox`/`production` symmetrically), this specific script must independently refuse to proceed if `QURAN_FOUNDATION_ENVIRONMENT=production` is set, reporting a safe `environment=production` / `credential_config=refused` / `reason=production_not_authorized_by_this_script` result and a non-zero exit code, without reading or reporting on the Production credential pair at all. This is a narrowing specific to this CLI tool, not a change to the underlying library's already-authorized `sandbox`/`production` symmetry, and it exists so this script cannot become an accidental Production-credential-checking tool merely because the selector is misconfigured.

**Safe output contract:** the script prints only the following key=value lines (or an equivalent structured form using the same field names) and nothing else — no Client ID value, no Client Secret value, no token, no length, prefix, hash, or masked fragment of either, since no committed security contract requires or permits that:

Pre-Production, structurally valid:

```
environment=sandbox
credential_config=valid
client_id_present=true
client_secret_present=true
server_only=true
provider_network_validation=not_performed
```

Pre-Production, structurally invalid (one `reason` value from a closed set — e.g. `missing_selector`, `invalid_selector`, `missing_client_id`, `missing_client_secret`):

```
environment=sandbox
credential_config=invalid
reason=missing_client_secret
client_id_present=true
client_secret_present=false
server_only=true
provider_network_validation=not_performed
```

Selector missing or unrecognized (environment itself unknown):

```
environment=unknown
credential_config=invalid
reason=invalid_selector
client_id_present=false
client_secret_present=false
server_only=true
provider_network_validation=not_performed
```

Production selected (refused by this script's own narrower guard, above):

```
environment=production
credential_config=refused
reason=production_not_authorized_by_this_script
client_id_present=false
client_secret_present=false
server_only=true
provider_network_validation=not_performed
```

`provider_network_validation` is always exactly the literal `not_performed` in every case this script can produce — this script never performs, and never claims to perform, provider-side validation. `credential_config=valid` exit code is `0`; every other case (`invalid` or `refused`) exits non-zero, matching this repository's existing fail-closed script convention (e.g. `scripts/db-safety.mjs`).

**Server-only requirement:** the script runs only under `node --import tsx` exactly like the existing `quran:import:verify`/`quran:import:dry-run` scripts; it is never imported by application/UI code and never bundled.

**Acceptance criteria:**

- running the script with a structurally valid Pre-Production environment prints exactly the safe `valid` contract above and exits `0`;
- running it with a missing/invalid selector, missing Client ID, or missing Client Secret prints exactly the corresponding safe `invalid` contract and exits non-zero;
- running it with `QURAN_FOUNDATION_ENVIRONMENT=production` prints exactly the safe `refused` contract, reads neither Production value, and exits non-zero;
- no invocation, under any input, ever prints a Client ID value, a Client Secret value, a token, or any partial/derived form of either;
- no invocation performs, or claims to have performed, any Quran.Foundation network access;
- `npm run typecheck`, `npm run lint` (zero warnings), the new focused tests, `npm test`, Prettier, and `git diff --check` pass;
- the changed-file list is contained exactly within this unit's allowed files.

**Dependency and handoff:** depends only on M5.2B's already-committed `env.ts` functions; adds no new credential-handling logic. Completing this unit later still does not satisfy the legal/license, source-selection, scholarly, provider dry-run, or production-activation gate, and does not authorize any Production access or any provider network call. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS, and M6 remains blocked, independent of this contract.

### M5.2D — Pre-Production Token Transport and Offline Validation Tooling

This subsection authorizes one **offline implementation and synthetic-verification unit only** behind M5.2B's already-accepted injected `QuranFoundationTokenTransport` boundary. It supplies the missing real-HTTP transport shape and an offline-testable validation CLI, but it authorizes no real credential use, token request, or other provider/network access. Implementation is **COMPLETE** at commit `8810b36`; that implementation evidence does not itself authorize or record a real provider request.

**Official protocol and environment mapping.** Quran.Foundation's official Content API documentation defines Pre-Production as `prelive`; ALSAMAD continues to represent that environment internally as `sandbox`, without renaming the committed credential keys. The fixed authentication operation for this unit is `POST https://prelive-oauth2.quran.foundation/oauth2/token`, using OAuth2 `client_credentials`, required scope `content`, HTTP Basic authentication with `client_id:client_secret`, `Content-Type: application/x-www-form-urlencoded`, and exactly `grant_type=client_credentials` plus `scope=content` in the form body. The response fields validated are `access_token`, `token_type`, `expires_in`, and `scope`; this Client Credentials flow has no refresh token. Authority: Quran.Foundation's official [Manual Authentication for Content APIs](https://api-docs.quran.foundation/docs/quickstart/manual-authentication/), [Content APIs OAuth2 Quickstart](https://api-docs.quran.foundation/docs/quickstart/), [Token Management for Content APIs](https://api-docs.quran.foundation/docs/quickstart/token-management/), and [Content APIs v4 authentication reference](https://api-docs.quran.foundation/docs/content_apis_versioned/4.0.0/content-apis/).

**Exact future implementation boundary.** A later M5.2D implementation may change only:

```text
src/lib/providers/quran-foundation/token-transport.ts
scripts/quran-token-check.mjs
tests/quran-import/token-transport.test.mjs
tests/quran-import/token-check-cli.test.mjs
package.json
```

`package.json` may receive exactly one command for the validation CLI and no dependency or unrelated change. `src/lib/providers/quran-foundation/adapter.ts`, `types.ts`, `env.ts`, `.env.example`, `package-lock.json`, and every other file remain outside the boundary. If implementation proves another file necessary, work must stop for governance-boundary reassessment.

**Transport contract.** The new transport is server-only and Pre-Production-only. It accepts only ALSAMAD `sandbox` credentials for this unit and rejects any other environment before reading Production credentials or starting network work. It uses only the fixed official endpoint above; issues exactly one `POST` per validation attempt; constructs HTTP Basic authentication from the supplied credentials; sends the exact form Content-Type, grant, and scope; applies a finite timeout; performs no automatic retry; and rejects a redirect or final response origin different from `https://prelive-oauth2.quran.foundation`. It fails closed on timeout, network error, non-2xx status, malformed JSON, an oversized bounded response, blank/missing `access_token`, non-positive/non-finite/non-integer `expires_in`, a `token_type` other than case-insensitive `bearer`, or a response scope that does not contain `content`. After validation it narrows the response to exactly `{ accessToken, expiresInSeconds }` through the existing `QuranFoundationTokenTransport` abstraction. Raw response bodies and sensitive material never cross that boundary or appear in errors/evidence.

This one-attempt tooling does not implement later runtime token management: no refresh token, early-renewal scheduler, shared cache, request-stampede coordination, or Content API `401` retry belongs here. The existing adapter may retain the returned token only in its process-local instance memory until immediate closure; no durable cache is authorized.

**CLI contract.** `scripts/quran-token-check.mjs` is a dedicated server-only, offline-testable composition boundary. It must require `QURAN_FOUNDATION_ENVIRONMENT=sandbox`; invoke the existing structural credential validation; instantiate only the dedicated Pre-Production transport; call `QuranFoundationAdapter.acquireAccessToken()` exactly once; reduce the outcome to the safe evidence fields below without inspecting token contents; close the adapter immediately; and exit `0` only after a successful, structurally valid exchange. It rejects Production before Production credential access or network activity. It must not call any Content API or database, `discoverResources()`, `fetchResourceMetadata()`, `fetchBatch()`, or `getVersionToken()`; create a manifest/import artifact; inspect, print, hash, persist, or otherwise derive evidence from token/credential material; or retry.

**Offline synthetic verification contract.** M5.2D implementation and tests perform zero provider/network access and use synthetic credentials plus an injected/mock HTTP operation only. Transport tests must prove: the exact Pre-Production URL; one `POST`; Basic authentication from synthetic values; exact form Content-Type, `grant_type=client_credentials`, and `scope=content`; Production rejection before network; finite-timeout abort; zero retry; redirect/cross-origin rejection; safe non-2xx failure; malformed/oversized-response failure; rejection of missing/blank access token, invalid expiry, non-bearer token type, and missing/incompatible scope; valid narrowing to only `accessToken` and `expiresInSeconds`; and complete sensitive-value redaction from errors.

CLI tests must prove: an invalid selector fails before network; Production fails before credential access/network; invalid synthetic sandbox credentials fail before network; valid synthetic credentials invoke exactly one injected request; PASS evidence is safe; FAIL evidence is safe and exits nonzero; discovery/resource/import/database paths are unreachable; adapter closure discards token state; and no M5 gate status changes. Existing M5.2B adapter, credential, memory-only lifecycle, environment-isolation, error-redaction, expiry, and close tests remain unchanged and green. Typecheck, lint, focused tests, full tests, targeted Prettier, production build, and `git diff --check` must pass, and the staged set must equal the five-file boundary above.

**Safe evidence contract.** The CLI may emit only these fields and closed values:

- `executed_at`
- `environment=preproduction`
- `internal_environment=sandbox`
- `credential_config=valid|invalid`
- `token_endpoint_attempted=yes|no`
- `token_endpoint_host=prelive-oauth2.quran.foundation`
- `http_status_class=2xx|4xx|5xx|network_error|timeout|not_attempted`
- `authentication=pass|fail|not_attempted`
- `token_returned=yes|no`
- `token_type_valid=yes|no|not_evaluated`
- `scope_valid=yes|no|not_evaluated`
- `expiry_metadata_valid=yes|no|not_evaluated`
- `redaction=pass|fail`
- `content_api_calls=0`
- `metadata_discovery_calls=0`
- `resource_calls=0`
- `database_mutations=0`
- `provider_validation=pass|fail`

No evidence, stdout/stderr, exception, log, test artifact, or committed file may contain the client secret, complete client identifier, Basic-auth material, `Authorization` header, access token, refresh token, raw response body, or any token/credential prefix, suffix, length, hash, fingerprint, or masked fragment. Client-ID presence/configuration validity is sufficient; its value is not evidence. Environment and credential files remain uncommitted, and tokens remain process-memory only.

**Historical real-network separation.** Implementing and committing M5.2D did **not** authorize a real token request. At M5.2D completion, controlled Pre-Production credential availability still had to be established locally under the committed credential boundary, followed by a separate Roadmap authorization for exactly one real Pre-Production token-validation request. M5.2E subsequently supplied that authorization, and the one request was executed under the fixed-endpoint, finite-timeout, zero-retry, no-Content-API, no-discovery/source-selection, safe-evidence, and immediate-token-disposal constraints recorded below. The M5.2E attempt passed and its authorization is consumed. No unused authorization remains; any future provider-network request requires new explicit governance authorization under the applicable Roadmap gate. That PASS proves only controlled Pre-Production authentication and does not imply Gate 3, Gate 4, provider dataset approval, content availability, dry-run approval, production activation, or M6 authorization.

**Network order and exclusions.** The binding order remains: credential configuration implemented; controlled credentials available; M5.2D transport/tooling governance and offline implementation complete; separate real-token execution authorization; one successful provider-side token validation; legal/license Gate 3; exact-source Gate 4; controlled sandbox fetch; then later manifest/import gates. This unit authorizes no Production credentials or host, credential inspection, real network operation, token request, metadata/resource enumeration, Content API call, source selection, manifest, fetch, import, database/schema/migration change, canonical-content mutation, provider-code change outside the exact new transport file, M5 Gate PASS, M6, KE-2, Phase 7, Duas, or Knowledge Engine work.

**Governance treatment and status truth.** No Registry entry or ADR is required: this is a reversible provider-specific implementation behind the accepted injected transport boundary and changes no persisted representation, canonical ownership, licensing decision, or difficult-to-reverse architecture. M5.2D governance and offline implementation are COMPLETE at commit `8810b36`; real provider validation was not executed or authorized by M5.2D. The later, separately authorized M5.2E execution below has since completed PASS and consumed its one-attempt authorization; no second token request is authorized, no Content API access occurred, and no downstream M5 gate advanced automatically. `M5 Schema Foundation Verified` remains PASS; M5 Gate 3 remains PARTIAL/incomplete; Gate 4 remains NOT STARTED/incomplete; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS; M6 remains BLOCKED; KE-2 and Phase 7 implementation remain NOT STARTED. M5.2D completion changes none of those statuses.

### M5.2E — One Controlled Pre-Production Token Validation Attempt

**Historical execution authorization and consumed contract.** This Roadmap section authorized exactly one execution of `npm run quran:token-check` with `QURAN_FOUNDATION_ENVIRONMENT=sandbox`, the locally controlled Pre-Production credentials whose M5.2B/M5.2C structural availability evidence was PASS, and the committed M5.2D implementation at `8810b36`. That execution was limited to exactly one outbound provider request: `POST https://prelive-oauth2.quran.foundation/oauth2/token`, under the committed HTTP Basic, form body, exact-origin, redaction, response-validation, finite-timeout, one-request, zero-retry, memory-only token, and adapter-close contracts. The authorized execution has occurred and the authorization is consumed. No second invocation or second real token request is authorized; any future provider-network request requires new explicit governance authorization under the applicable Roadmap gate.

**Hard boundary and exclusions.** The execution is Pre-Production-only. Production selection, credentials, endpoint, or fallback are prohibited. The operator and retained evidence must not inspect, print, log, hash, fingerprint, fragment, mask, or persist the Client ID value, Client Secret, Basic material, `Authorization` header, access token, or raw provider response. No redirect, Content API request, discovery, metadata/resource enumeration, Quran content fetch, source selection, manifest creation, import, database mutation, canonical-content mutation, Gate 4 work, provider dry run, activation, M6, KE-2, or Phase 7 work is authorized. The process stops after the one token exchange and immediate adapter closure; no Content API operation may follow a successful token response.

**Safe execution evidence.** Retained evidence is limited exactly to the M5.2D CLI's governed output: `executed_at`; `environment=preproduction`; `internal_environment=sandbox`; `credential_config=valid|invalid`; `token_endpoint_attempted=yes|no`; `token_endpoint_host=prelive-oauth2.quran.foundation`; safe `http_status_class`; `authentication`; `token_returned`; `token_type_valid`; `scope_valid`; `expiry_metadata_valid`; `redaction`; zero counts for Content API, metadata discovery, resource calls, and database mutations; and `provider_validation=pass|fail`. No stdout, stderr, report, or evidence artifact may retain any credential/token value, raw response, prefix, suffix, length, hash, fingerprint, masked fragment, or derived sensitive material.

**Execution record — PASS / COMPLETE; authorization consumed.** Governance is COMPLETE and the single authorized execution completed at `2026-08-13T23:05:36.295Z`. Provider-side authentication is VERIFIED: the controlled Pre-Production credentials authenticated successfully and the committed validator accepted a transient content-scope token response. The governed evidence is `environment=preproduction`, `internal_environment=sandbox`, `credential_config=valid`, `token_endpoint_attempted=yes`, `token_endpoint_host=prelive-oauth2.quran.foundation`, `http_status_class=2xx`, `authentication=pass`, `token_returned=yes`, `token_type_valid=yes`, `scope_valid=yes`, `expiry_metadata_valid=yes`, `redaction=pass`, `content_api_calls=0`, `metadata_discovery_calls=0`, `resource_calls=0`, `database_mutations=0`, and `provider_validation=pass`. Adapter closure disposed of transient token state according to the M5.2D boundary. The one-attempt authorization is CONSUMED; this record authorizes no retry or second provider request.

**PASS and failure semantics.** PASS means only that the one bounded Pre-Production OAuth request authenticated the controlled credentials, the committed response validator accepted `access_token`, `expires_in`, `token_type`, and `scope`, and the transient token was discarded through adapter closure. It does not complete M5 Gate 3 or Gate 4, approve a source/resource/dataset, validate Content API access, pass the provider dry run, activate Quran import, or authorize M6. Failure stops the unit after that one attempt, retains only the safe closed evidence above, advances no gate, and authorizes no automatic or manual retry. Any second real token attempt after either PASS or FAIL requires a new explicit execution authorization.

**Gate 3 reconciliation.** M5 Gate 3 remains PARTIAL/incomplete. M5.2E satisfied only the technical provider-authentication prerequisite; authentication success is not permission to exercise content rights. Gate 3 remains blocked by unresolved legal/license evidence and rights reconciliation for: in-application display rights; the applicable license/terms identity and effective state; attribution obligations; storage, caching, and retention rights; commercial-use classification; standalone redistribution classification; derivative/transformation limits; update, withdrawal, deletion, and revocation obligations; provider-exit and content-purge obligations; and compatibility with the proposed canonical storage/import model. No category is marked PASS by M5.2E.

**Order, acceptance, and status truth.** Current binding order and evidence are: (1) credential configuration implemented — COMPLETE; (2) controlled credentials structurally available — PASS; (3) provider-side token tooling implemented — M5.2D COMPLETE; (4) one controlled provider token validation — M5.2E PASS / COMPLETE, authorization CONSUMED; (5) Gate 3 legal/license completion — STILL PENDING; (6) Gate 4 source selection — NOT STARTED/incomplete; (7) controlled sandbox Content API fetch — NOT AUTHORIZED; and (8) later import dry-run and activation gates — NOT PASS. Acceptance evidence proves exactly one token endpoint attempt, no retry, the fixed Pre-Production host, Production exclusion, complete redaction, zero Content API/metadata/resource/database activity, and immediate token disposal. M5 Schema Foundation Verified remains PASS; provider-side authentication is PASS; M5 Gate 3 remains PARTIAL/incomplete; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS; M6 remains BLOCKED; and KE-2 and Phase 7 implementation remain NOT STARTED. No second token request is authorized by this execution record.

**Governance treatment.** Registry entry required: NO. ADR required: NO. This is a one-use operational authorization of an already-governed, committed, reversible provider-specific transport; it changes no persisted representation, ownership boundary, licensing decision, or difficult-to-reverse architecture.

## Phase 6: Devotional content and Editorial General Dua

### Objective

Implement the provider-independent Devotional Content and Translation foundation by activating exactly the four Release 1 tables in `ALSAMAD_DATABASE_ARCHITECTURE.md` section 5.4, and deliver the mobile-first Duas reading experience on top of them, matching the mobile-first Adhkar precedent already shipped in `7cd72ee`, while keeping Editorial General Dua structurally and visibly separated from authenticated devotional content. Designed Mobile First. Desktop Expanded. This phase completes journeys J4, J5, J6, and J7 without opening editorial administration workflows, public REST activation, or any table beyond the frozen 30-table catalog.

### Included scope

- Drizzle mappings and one reviewed forward-only migration for exactly `devotional_items`, `devotional_collections`, `devotional_collection_items`, and `content_translations`, in that dependency order, as scoped in database architecture section 5.4.
- The mobile-first Duas reading experience (category browsing, collection reading, UI-only bookmarking, source-trust presentation, honest empty/pending/available states), matching the shape already committed for Adhkar in `7cd72ee`.
- Retiring the pre-architecture `duaFixtures` rendering path in `src/app/[locale]/duas/` in favor of the same provider-independent content-source abstraction pattern already used by Quran (`src/lib/quran/content/`) and Adhkar (`src/lib/adhkar/content/`).
- Preserving the already-shipped, already-published Editorial General Dua library (`src/lib/general-duas.ts`) exactly as it exists at HEAD, as the one real, non-empty devotional entry point.
- A database-backed content source mirroring `src/lib/quran/content/db-source.ts`'s honest-empty/pending/available pattern, once the M6.1 schema exists.
- Real PostgreSQL verification of the four new tables' persistence, constraints, and cumulative table count.

### Explicitly excluded scope

- `editorial_users`, `editorial_role_grants`, `review_records`, and every other Editorial (5.5), Prayer/calendar (5.6), Audit/publication-history (5.7), Prepared, Approved Later, or Future/Research table. Editorial administration workflow — assignment, review queues, staff authentication, publication-event recording — is Phase 7 scope and is not authorized here.
- Activation of `GET /api/v1/devotional-items/{id}` or any other public REST route from `ALSAMAD_API_ARCHITECTURE.md` section 4.1. M6 database and read-abstraction work remains server-side and non-public, exactly as M5 kept Quran import server-side pending its own activation gate.
- Any admin UI or staff-facing devotional/Editorial General Dua workflow screen described in `ALSAMAD_ADMIN_ARCHITECTURE.md` sections 8 and 9. Those require the Phase 7 Editorial tables first.
- Deterministic search indexing (Phase 8), AI retrieval, embeddings, semantic search, or Knowledge Graph work of any kind. `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` and any Knowledge Engine implementation are M7.0-track and are explicitly not authorized by this contract.
- Repetition counters, streaks, or any worship measurement, consistent with the No Worship Scoring Principle; a repetition _display_ sourced from `devotional_collection_items` guidance is permitted, a logged or persisted count is not.
- Selection, drafting, or seeding of new Editorial General Dua entries, new adhkar collections, or new dua content beyond what is already committed at HEAD in `src/lib/general-duas.ts`. M6 authorizes zero new religious or editorial seed rows.
- Authentication, bookmarking persistence, or any Prepared five-table identity package.

### Dependencies

- M1 exact 30-table Release 1 catalog: PASS.
- M2 Database Foundation, M3 Global Locales and Regional Configuration, and M4 Content Integrity Foundation: PASS.
- M6 builds directly on M4's `content_items` and `content_revisions` (`content_type` already includes `dua`, `dhikr`, `collection`, and `editorial_general_dua`; `owning_module` already includes `devotional`; `verification_state` already includes `editorial_only`) — no M4 column change is authorized or required.
- **M5, complete through its production activation gate (`M5 Quran Import Activated`): required.** This document's own Phase 5 "Next-phase handoff" (line 807) states verbatim: _"M6 receives only a separately activated, licensed, verified Quran foundation; this contract does not authorize M5.2, production import, or M6 implementation."_ Committed history now includes the Quran schema, import-harness work, ARC-005's atomic release selectors (`b6fea65`), and the AUD-ARC005 correction in migration `0009` (`1846588`); no provider dry-run pass, license/source approval, scholarly approval, or production activation is evidenced anywhere in committed history. This M6 contract defines the executable units below; it does not itself clear any of them for implementation while `M5 Quran Import Activated` remains unmet. Note: commit `7cd72ee` (Adhkar mobile-first foundation) already implemented devotional-domain UI scope before this dependency was satisfied, without a recorded exception; this contract does not retroactively resolve that inconsistency, it only prevents repeating it for the remaining M6 units.
- Database architecture section 5.4 is authoritative for the four M6 tables' names, purpose, and essential constraints. Section 5.4 now carries per-table column, type, nullability, default, index, and trigger subsections (5.4.1–5.4.4), matching the detail level of sections 5.1.1–5.1.3, 5.2.2–5.2.9, and 5.3.2–5.3.7; this M6.1 documentation-prerequisite sub-blocker is satisfied, evidenced by commit `3069a7e` and the physical decisions already recorded at `REG-0001`–`REG-0008`. Satisfying this sub-blocker does not itself authorize M6.1 implementation: the broader phase-level prerequisite above — M5 complete through `M5 Quran Import Activated` — remains separately required and is currently `NOT PASS`, so M6 remains BLOCKED.
- The Roadmap's mobile-first UI milestone requirement (this document, lines 24–26) governs M6.0 and M6.2; this Objective and this phase's acceptance criteria record the required "Designed Mobile First. Desktop Expanded." status.

### Artifacts

- `src/db/schema.ts`
- `drizzle/0010_devotional_content_foundation.sql`
- `drizzle/meta/_journal.json`
- `scripts/db-verify.mjs`
- `tests/devotional-content-database.test.mjs`
- `src/lib/duas/` (content abstraction and client)
- `src/components/duas/` (presentation)
- `src/app/[locale]/duas/page.tsx` and its category/collection routes
- `tests/duas-content.test.mjs`, `tests/duas-routing.test.mjs`
- Schema diff; constraint, trigger, and index inventories; and real PostgreSQL evidence

### Database changes allowed

M6 authorizes exactly four new Release 1 physical domain tables: `devotional_items`, `devotional_collections`, `devotional_collection_items`, and `content_translations`. The Editorial Identity Foundation currently makes 17 of 30 Release 1 tables physical; M6 would therefore bring the cumulative physical count to exactly **21 of 30**. Migration filename is exactly `drizzle/0010_devotional_content_foundation.sql`, the reserved M6 migration number after the AUD-ARC005-001 migration at `0009`; the later `0011_editorial_identity_foundation.sql` does not displace that reservation. This numbering records dependency order only and does not authorize M6 while its gates remain blocked. No infrastructure bookkeeping table may consume or exceed the approved 30-table boundary, and no fifth devotional table (for example a separate repetition, source, or Editorial General Dua detail table) is authorized — database architecture §5.4 scopes exactly these four tables, and §11 explicitly rejects "separate devotional source, translation, transliteration, repetition, and Editorial General Dua detail tables" as Release 1 fragmentation.

All primary keys are application-generated UUIDv7 with no database default. FKs use `ON UPDATE RESTRICT ON DELETE RESTRICT`. Per the section 5.4 summary: `devotional_items` carries a one-to-one FK to `content_items`, a unique canonical key, and a checked type; `devotional_collections` carries a FK to a versioned content item for title/description and a unique canonical key; `devotional_collection_items` carries FKs to collection and item with a unique pair/position and no reward field; `content_translations` carries FKs to `content_revisions` and `locales` with a checked rendering kind and immutable published text. Exact column-level types, defaults, and constraint/trigger names follow the section 5.4 expansion required under Dependencies above.

### Seed authorization

M6 authorizes **zero religious or editorial seed rows**. No sample dua, dhikr, collection, or translation may be seeded or migrated as data. Tests may create synthetic, clearly non-religious fixtures only inside transactions guaranteed to roll back. The already-published `src/lib/general-duas.ts` library remains an in-repository editorial module, not a database seed, exactly as it exists at HEAD; M6 does not migrate it into the schema.

### Application capabilities

Typed database access, a provider-independent read abstraction, and the mobile-first guest-facing Duas presentation layer only, consistent with the already-shipped Adhkar precedent (`7cd72ee`). No public REST route from `ALSAMAD_API_ARCHITECTURE.md` §4.1 is activated; no authentication, bookmarking persistence, or write path is authorized. The reading experience must report the same three honest states (`empty`, `pending`, `available`) already established for Quran and Adhkar, and must never fabricate content.

### Admin capabilities

None. Devotional Content Administration and Editorial General Dua Administration (`ALSAMAD_ADMIN_ARCHITECTURE.md` §§8–9) require the Phase 7 Editorial tables and staff authentication; M6 defers them entirely.

### Security requirements

- PostgreSQL, not application code, enforces the one-to-one item/content-item link, unique canonical keys, checked devotional type, checked collection kind, unique collection membership/position, and checked translation rendering kind.
- Editorial General Dua remains distinguishable at the data layer purely through the already-approved `content_items.content_type = 'editorial_general_dua'` / `owning_module = 'editorial'` combination and `content_revisions.verification_state = 'editorial_only'`; M6 adds no new classification column and introduces no path for AI-generated or unverified content to publish as either authenticated or editorial devotional content.
- No worship behavior, repetition count, bookmark, or user-identifying data is persisted; `devotional_collection_items` carries no reward field, consistent with the No Worship Scoring Principle.
- Deletion remains `RESTRICT`; a published `content_translations` row is immutable, and only withdrawal/supersession through a new `content_revisions` row may change it.
- No secret, credential, or personal data is introduced by this phase.

### QA requirements

- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run db:up`
- `npm run db:safety`
- `npm run db:migrate`
- `npm run db:seed` twice
- `npm run test:db`
- `npm run db:check`
- `npm test`
- Real PostgreSQL constraint, trigger, schema, and cumulative table-count verification
- `git diff --check`
- `npm run db:down` while preserving the named volume

All M2, M3, M4, and M5 checks remain green. Consistent with `ALSAMAD_QUALITY_ASSURANCE_TESTING_ARCHITECTURE.md` §13, religious accuracy has the highest priority where applicable, real PostgreSQL verification is required whenever PostgreSQL behavior is under test, and human review remains authoritative for religious publication — M6 itself publishes nothing.

### Observability requirements

Database verification must emit actionable pass/fail evidence — table/constraint/trigger/index counts, cumulative table count, rejection cases — without secrets or religious payloads. UI-layer observability is limited to the same honest empty/pending/available status reporting already used by Quran and Adhkar. M6 adds no production analytics or product instrumentation.

### Analytics requirements

None beyond what `ALSAMAD_ANALYTICS_PRODUCT_INTELLIGENCE_ARCHITECTURE.md` §9 already scopes for Duas and Adhkar Intelligence: any future measurement must be evidence-based, provider-independent, and subordinate to religious authority, privacy, and safety. M6 itself ships no telemetry; streak, worship-score, leaderboard, or engagement-pressure instrumentation is permanently out of scope per the No Worship Scoring Principle.

### M6 acceptance and separated gates

1. **UI foundation gate — `M6.0 Duas Mobile-First Foundation Verified`:** the mobile-first Duas reading experience exists, reports honest empty/pending/available states, keeps Editorial General Dua visibly and structurally distinct, retires the `duaFixtures` rendering path, and passes its own focused tests. This gate requires no database schema.
2. **Schema completion gate — `M6.1 Devotional Schema Foundation Verified`:** exact four new and 21 cumulative Release 1 tables; all columns/types/defaults per the expanded section 5.4; UUIDv7; FK `RESTRICT`; unique/check/index/trigger inventories; zero unauthorized table/seed row; transaction rollback; all M2/M3/M4/M5 checks green.
3. **Integration gate — `M6.2 Devotional Content Integration Verified`:** a database-backed content source reads the M6.1 schema honestly (mirroring `src/lib/quran/content/db-source.ts`), proven against real PostgreSQL fixtures created and rolled back in a transaction, and the already-published Editorial General Dua library remains correctly classified end to end. Integration publishes nothing, activates no public API route, and does not itself require the M6.0 composition root to switch its default source.

If only gate 1 passes, report exactly `M6.0 Duas Mobile-First Foundation Verified`. If only gate 2 also passes, add `M6.1 Devotional Schema Foundation Verified`. Do not call the milestone operational or fully PASS until gate 3 also passes. No gate authorizes Phase 7, public API activation, or admin capability, and no gate relaxes the M5 production-activation dependency above.

### Completion evidence

Return the exact changed-file list; migration and schema diff; constraint/trigger/index/table-count inventories; representative accepted/rejected PostgreSQL cases; UI honest-state evidence for every devotional category defined by M6.0; regression results for M2–M5; repository checks; and any remaining blockers, most importantly the M5 production-activation dependency. The section 5.4 column-level documentation prerequisite is already satisfied.

### Rollback/recovery

Production migrations remain forward-only. Before release, failure recovery uses a disposable local/test database or restoration of the preserved named volume from a known-good backup. A corrective forward migration requires explicit review and must preserve canonical identifiers. UI-layer rollback is a normal reversible code change; no religious or editorial content is destructively edited in place.

### Next-phase handoff

After every M6 acceptance criterion passes, hand the stable devotional schema and mobile-first reading experience to **M7 — Editorial administration workflows**, which must reuse `editorial_users.id` after the independently governed Editorial Identity Foundation is implemented, adds `editorial_role_grants` and `review_records`, and opens the actual Devotional Content Administration and Editorial General Dua Administration workflows (`ALSAMAD_ADMIN_ARCHITECTURE.md` §§8–9). This contract does not authorize the Editorial Identity Foundation, M7 implementation, or any Knowledge Engine (M7.0-track) implementation.

### M6.0 — Duas Mobile-First Foundation

**Dependency position.** Independent of M6.1; requires no database schema. May proceed in parallel with, before, or after M6.1. Required, together with M6.1, before M6.2. Still subject to the phase-level M5 production-activation dependency above.

**Objective.** Designed Mobile First. Desktop Expanded. Deliver the same honest, static-content-source mobile-first reading experience for Duas that is already committed for Adhkar (`7cd72ee`) and for Quran (`22a1466`), replacing the pre-architecture `duaFixtures` rendering path while preserving the already-shipped Editorial General Dua library exactly as published.

**Included scope.**

- A provider-independent Duas content-source abstraction (types, category/collection structure, a static/honest-empty source, reader-data projection, search) under `src/lib/duas/`, mirroring the shape already committed under `src/lib/adhkar/content/`.
- Presentation components under `src/components/duas/` for category browsing, collection reading, UI-only bookmarking, and source-trust presentation.
- A structural, mandatory Editorial General Dua label/disclosure in the UI, satisfying journey J6 and `ALSAMAD_SECURITY_ARCHITECTURE.md` line 130's "mandatory label" and "prohibited authenticated badges" requirements.
- Reporting the already-published `src/lib/general-duas.ts` entries as `available` with a real, sourced item count, and every other, not-yet-approved devotional entry point as honestly `empty`.
- Updated `src/app/[locale]/duas/page.tsx` and its category routes; removal or replacement of the `duaFixtures`-based rendering is in scope.
- Focused tests: `tests/duas-content.test.mjs`, `tests/duas-routing.test.mjs`.

**Prohibited work.** Any database migration, schema change, or new physical table; any public REST route; any admin surface; any new Editorial General Dua entry beyond what is already committed; any repetition counter that persists or logs state; any change to `src/lib/adhkar/`, `src/lib/quran/`, or any Quran/Adhkar route; any change outside `src/lib/duas/`, `src/components/duas/`, the Duas app routes, `tests/duas-*.test.mjs`, and the minimum shared-file touches (`src/lib/i18n.ts`, `src/app/globals.css`, `src/components/home/sections.tsx`) strictly required to wire in the new category presentation, mirroring exactly how commit `7cd72ee` touched those same three shared files for Adhkar.

**Acceptance gates.** Format, lint, typecheck, build, and `npm test` pass; honest empty/pending/available states are proven for every Duas entry point; Editorial General Dua is visibly and structurally distinguished in the rendered UI; no fabricated religious or editorial text is rendered; the mobile-first objective wording is recorded per the Roadmap's mobile-first UI milestone requirement.

**PASS criteria.** `M6.0 Duas Mobile-First Foundation Verified` — all acceptance gates above pass and `npm test` is fully green including the new Duas test files.

**Handoff.** Hands a stable, provider-independent Duas read-abstraction interface to M6.2. Does not authorize M6.1 or M6.2 implementation by itself.

### M6.1 — Devotional Content Database Foundation

**Dependency position.** Independent of M6.0; depends only on M4 (`content_items`, `content_revisions`) and the section 5.4 column-level documentation prerequisite under Dependencies above. Required, together with M6.0, before M6.2. Still subject to the phase-level M5 production-activation dependency above.

**Objective.** Implement exactly the four Release 1 devotional tables — `devotional_items`, `devotional_collections`, `devotional_collection_items`, `content_translations` — in dependency order, register forward migration `0010`, and prove the Schema completion gate on real PostgreSQL.

**Included scope.**

1. create `devotional_items` (one-to-one FK to `content_items`);
2. create `devotional_collections` (FK to a versioned content item);
3. create `devotional_collection_items` (FKs to collection and item);
4. create `content_translations` (FKs to `content_revisions` and `locales`);
5. cross-table validation, uniqueness, and immutability triggers only after all referenced tables exist.

Real PostgreSQL verification of persistence, constraints, cumulative table count (21 of 30), and all M2/M3/M4/M5 regression checks.

**Prohibited work.** Any table beyond the four listed; any seed row; any provider adapter, import harness, or manifest logic (that pattern is M5-specific to an external provider and is not reused here); any UI, route, or admin change; any change to `src/db/ids.ts` except to fix a proven UUIDv7 defect; any change to `scripts/db-seed.mjs`.

**Acceptance gates.** Exact four new / 21 cumulative Release 1 tables exist and no unauthorized table exists; every column/type/default/FK/constraint/index/trigger matches the expanded section 5.4; duplicate canonical keys, invalid devotional/collection/rendering types, and invalid collection membership are rejected; published `content_translations` rows are immutable; migration rerun is safe; existing M3 seeds and the M4/M5 zero-seed boundary are undisturbed; all M2–M5 checks remain green.

**PASS criteria.** `M6.1 Devotional Schema Foundation Verified` — all acceptance gates above pass on real PostgreSQL.

**Handoff.** Hands a stable, empty devotional schema to M6.2. Does not authorize M6.2 implementation by itself, and does not authorize any seed or import.

### M6.2 — Verified Devotional Content Integration

**Dependency position.** Requires both `M6.0 Duas Mobile-First Foundation Verified` and `M6.1 Devotional Schema Foundation Verified` to PASS first, in addition to the phase-level M5 production-activation dependency above.

**Objective.** Connect the M6.0 read abstraction to the M6.1 schema through a database-backed content source, mirroring `src/lib/quran/content/db-source.ts`'s honest-empty/pending/available pattern, without seeding, importing, publishing, or activating any public API route.

**Included scope.**

- A `db-source.ts`-equivalent module per devotional table set that queries `devotional_items`, `devotional_collections`, `devotional_collection_items`, and `content_translations` and resolves to `empty`/`pending`/`available` exactly as `src/lib/quran/content/db-source.ts` does for Quran, failing closed (never throwing) on a missing or unreachable database.
- Verification, against real PostgreSQL fixtures created and rolled back in a transaction, that the module resolves every state correctly.
- Verification that the already-published Editorial General Dua entries remain correctly and visibly classified through the full read path.
- Regression proof that Quran's and Adhkar's existing integration and honest-state behavior are unaffected.

Consistent with `src/lib/quran/content/db-source.ts`'s own documented precedent ("not wired into any page as of M5.4"), M6.2 delivers a proven, standalone database-backed module; it does not itself require switching the M6.0 composition root's default source to it. That switch, if wanted, is a separate, later, minimal change and is not part of this unit's PASS criteria.

**Prohibited work.** Any seed row, import, or publication; any admin workflow; any REST route activation from `ALSAMAD_API_ARCHITECTURE.md` §4.1; any schema change (M6.1 is closed by this point); any repetition-count persistence.

**Acceptance gates.** The database source resolves every state correctly against real PostgreSQL fixtures; no credential or connection failure surfaces as anything other than the honest `empty` state; the already-published Editorial General Dua entries remain correctly classified; `npm test` remains fully green.

**PASS criteria.** `M6.2 Devotional Content Integration Verified` — all acceptance gates above pass, completing overall M6 PASS.

**Handoff.** After `M6.2 Devotional Content Integration Verified`, hand the complete, verified devotional foundation to **M7 — Editorial administration workflows**. This contract does not authorize M7 implementation.

### M6 release status

Architecture contract complete; implementation not started by this documentation task.

### Typography Phase 1 — Deterministic Arabic UI and Devotional Reading Fonts

**Governance and implementation status.** `REG-0017` selects Noto Sans Arabic `NotoSansArabic-v2.013` for Arabic UI and Noto Naskh Arabic `NotoNaskhArabic-v2.021` for general/devotional Arabic reading. Governance is **COMPLETE** and implementation is **COMPLETE** at commit `ee0bed65e6999a6546ead663c027072dc427e831`. Registry entry required: YES. ADR required: NO. The original governance unit authorized the bounded deterministic local A/B font-loading implementation without itself downloading or implementing fonts; the later implementation executed that authorization.

**Frozen sources, derivation, and delivery.** The official releases provide authoritative variable TTF sources, not native WOFF2 assets: `NotoSansArabic/full/variable-ttf/NotoSansArabic[wdth,wght].ttf` from `NotoSansArabic-v2.013.zip` and `NotoNaskhArabic/full/variable-ttf/NotoNaskhArabic[wght].ttf` from `NotoNaskhArabic-v2.021.zip`. Their archive SHA-256 values remain those frozen in REG-0017. The completed implementation produced and committed only the deterministic unsubsetted derivatives `NotoSansArabic[wdth,wght]-v2.013.woff2` at weights 400–800/default width and the regular 400 use of `NotoNaskhArabic[wght]-v2.021.woff2`.

Conversion must run in isolated temporary directories with Python 3.12.x (exact patch recorded), FontTools `4.63.0`, Brotli `1.2.0`, and exactly `fonttools ttLib.woff2 compress <input.ttf> -o <output.woff2>` using default transforms. No subsetting, glyph removal, intentional glyph reordering by application tooling, axis instancing/removal, family renaming, metadata editing, table pruning, hint removal, custom optimization, Quran binding, or application runtime dependency on the conversion toolchain is authorized. Python, FontTools, Brotli, archives, source TTFs, and conversion scripts are temporary implementation inputs and may not become application runtime dependencies or committed runtime assets.

**Reproducibility and integrity evidence.** Adoption required implementation to verify each official archive SHA-256; extract the exact governed TTF; record its SHA-256; record Python patch, FontTools, and Brotli versions plus the exact command; convert twice in separate clean temporary directories; require bit-identical derived SHA-256 outputs; and record the final WOFF2 SHA-256. Any mismatch was fail-closed. Source-to-derived/decompressed comparison verified `fvar`, `avar` where present, `gvar` where present, `GDEF`, `GSUB`, `GPOS`, `cmap`, `name`, `OS/2`, relevant hint/layout tables, Arabic shaping, mark positioning, and representative Arabic/tashkeel output. Expected WOFF2 table ordering, `head` flag, and applicable `DSIG` differences remain permitted. Each derived font remains under SIL OFL 1.1, ships with the applicable copyright and complete license notice, preserves family metadata, and must not imply upstream endorsement. Both fonts are self-hosted locally with no runtime third-party request. Safe fallbacks remain `Tahoma, Arial, sans-serif` and `serif` respectively.

**Quran and Latin separation.** A distinct `--font-quran` token may be created but must remain intentionally unbound. Noto Naskh Arabic is approved only for general/devotional reading; it is not an approved Quran font, may not be assigned as an implicit canonical Quran fallback, and authorizes no Quran binary or Quran typography activation. Quran typography remains behind the Presentation gate pending the approved canonical source/resource and script/edition, representative Uthmani/waqf/annotation/combining-mark/superscript-alif corpus, line-breaking and cross-platform shaping QA, exact Quran font/version, licensing/distribution evidence, and presentation approval. Latin-font selection remains unresolved and outside this unit.

**Implemented boundary.** Commit `ee0bed65e6999a6546ead663c027072dc427e831` changed only the authorized implementation paths:

- `src/app/fonts.ts`
- `src/components/shell.tsx`
- the exact reviewed typography hunk in `src/app/globals.css`
- `src/app/fonts/NotoSansArabic[wdth,wght]-v2.013.woff2`
- `src/app/fonts/NotoNaskhArabic[wght]-v2.021.woff2`
- the applicable OFL copyright/license notice file or files under `src/app/fonts/`
- `tests/font-loading.test.mjs`

Because `src/app/globals.css` contained unrelated local prototype work at governance time, implementation reviewed and staged only its exact typography hunk. No prototype CSS or other dirty work was authorized or adopted.

**Implementation acceptance evidence.** Commit `ee0bed65e6999a6546ead663c027072dc427e831` contains the accepted font assets, local loader and CSS role bindings, license notice, and static regression coverage. The reviewed derivation evidence passed the frozen reproducibility, checksums, font-table integrity, and representative non-Quran Arabic/tashkeel shaping contract. Both derived fonts resolve locally at build/runtime with no runtime third-party request; Arabic UI receives Noto Sans Arabic; committed devotional-reading surfaces receive Noto Naskh Arabic; English UI inherits neither the devotional nor Quran role; `--font-quran` remains unbound; the exact sources, derived assets, licenses, versions, commands, and checksums match REG-0017; Arabic/Quran text code points remain unchanged; and no Quran font activates.

**OPERATOR-OBSERVED REAL-BROWSER ACCEPTANCE EVIDENCE — `TYPOGRAPHY PHASE-1 REAL-BROWSER ACCEPTANCE = PASS`.** This is a durable record of operator-observed Chrome 151 verification, not automated test output and not evidence contained inside implementation commit `ee0bed65e6999a6546ead663c027072dc427e831`. The inspected route/viewports were:

- `/ar` — `390×844`;
- `/ar/calendar` — `1280×900`;
- `/ar/adhkar/morning` — `390×844`;
- `/ar/duas/general/a-calm-heart` — `390×844` and `1280×900`;
- `/en` — `1280×900`.

Computed styles showed Arabic UI resolving to the locally served Noto Sans Arabic role, devotional reading resolving to the locally served Noto Naskh Arabic role, and English UI remaining on the existing Latin/system stack. Inspection found no obvious glyph fallback, intact tashkeel and combining marks, no clipping, no severe layout or font-metric regression, no horizontal overflow at the inspected viewports, and no external browser-time font request; font resources were served locally. This acceptance was not canonical Quran typography QA: `--font-quran` remained unbound, no Quran typography was approved, and the Quran Presentation gate remains unchanged.

**Byte-exact third-party legal-artifact diff hygiene.** Normal staged-diff hygiene remains mandatory. Run `git diff --cached --check`; its only permitted nonzero finding for this unit is the already reviewed upstream trailing-whitespace diagnostic at `src/app/fonts/OFL-Noto-Arabic.txt:21`, for the added upstream line `fonts, including any derivative works, can be bundled, embedded, `, and no additional or different diagnostic is permitted. This exception applies only while that exact staged artifact has SHA-256 `a7a5a25eb188bf1cd96982030d53e23c33485c69b1044a562254226857ee13af` and its staged blob is byte-identical to the working-tree file, proven by equality between `git rev-parse :src/app/fonts/OFL-Noto-Arabic.txt` and `git hash-object -- src/app/fonts/OFL-Noto-Arabic.txt` together with the governed SHA-256 check. Also run `git diff --cached --check -- . ':(exclude)src/app/fonts/OFL-Noto-Arabic.txt'` and require zero findings for every other staged file. Fail closed if the SHA-256 differs, staged and working-tree blob identities differ, the OFL diagnostic changes, any further OFL diagnostic appears, or any other staged file has a whitespace error. The upstream notice must not be edited, stripped, regenerated, or line-ending-normalized; no global Git whitespace setting, broad `.gitattributes` exemption, `--no-verify` workaround, skipped diff check, or exception for another path is authorized.

**Explicit exclusions and status truth.** This unit authorizes no Quran font binary, Quran route/component restyling, Quran typography activation, canonical text change, provider/import/network work, visual redesign, Latin-font decision, Duas prototype adoption, Knowledge Engine work, database change, or search-runtime expansion. The Quran Presentation gate remains unresolved. M5 Gate 3 and Gate 4, Quran provider/import status, M6, KE-2, Phase 7, search runtime, and Duas governance remain unchanged.

### Sakīnah Visual Foundation Implementation

**Governance status.** `REG-0018` decides the Quiet Editorial Sanctuary Phase-1 semantic palette, surface hierarchy, tonal-separation/border/elevation preference, `12 / 20 / 32px` radius scale, 4px spacing foundation, and compact state-role distinctions. Governance is COMPLETE; implementation is **NOT STARTED**. Registry entry required: YES. ADR required: NO.

**Objective.** Implement only the governed semantic visual foundation so later page and shell redesign units consume one coherent token contract. This foundation reduces visible containers, keeps most sections unframed, favors flat or minimally outlined reading surfaces, uses grouped tone before border or shadow, reserves controlled elevation for actual floating layers, and prevents unrelated semantic objects from collapsing into one generic card or pill language.

**Exact future implementation boundary.** A later execution may change only:

- the exact reviewed visual-foundation token/primitives hunk in `src/app/globals.css`;
- `tests/visual-foundation.test.mjs`.

If implementation proves that a separate reusable committed token source is necessary, execution must stop for boundary review; REG-0018 does not silently authorize a third file. Because `src/app/globals.css` contains unrelated dirty prototype work at governance time, the future unit must inspect, review, and stage only its exact visual-foundation hunk.

**Allowed implementation.** The unit may reconcile the governed light/dark semantic palette tokens, radius tokens, surface roles, border/elevation tokens, approved spacing/rhythm aliases, and state-role primitive selectors. It may remove automatic border/shadow coupling from foundation primitives only where the reviewed token contract requires it. It must preserve accessibility, RTL/LTR logical behavior, reduced motion, existing functional behavior, and the governed and implemented REG-0017 typography roles.

**Acceptance.** Tests and complete diff review must prove: all frozen REG-0018 light/dark values and meanings are represented consistently; the authoritative radius scale is exactly controls `12px`, standard cards/surfaces `20px`, feature/modal `32px` only when warranted; tonal separation precedes border and shadow; canvas and reading roles receive no automatic elevation; shadows remain rare and dark mode introduces no glow; status/category/badge/filter/navigation/action/source roles remain distinguishable; color is not the sole status channel; gold is not a generic link accent; no Quran typography token becomes bound; and no unrelated dirty hunk is staged. Verification includes typecheck, relevant tests, production build, targeted lint/format checks, and exact staged-diff inspection.

**Explicit exclusions and status truth.** This unit does not authorize homepage, shell/header, desktop or mobile navigation, More overlay, Quran chrome, utility-page, or route redesign; dark-mode page redesign; final logo, symbol, brand lockup, icon-library, illustration, or Latin-font selection; Quran font, Mushaf layout, verse typography, canonical line height, verse-marker styling, Quran route/component/text change, or `--font-quran` binding; provider/M5, database, M6, KE-2, Phase-7, SEO, search-runtime, Duas, or Knowledge prototype work. Every later visual area remains a separate reviewable unit. M5/M6/KE-2/Phase-7 and Quran statuses remain unchanged.

### M7-prerequisite / Editorial Identity Foundation

**Governance status.** `REG-0016` and `ADR-0008` approve the architecture and exact physical contract for the independently sequenced Editorial Identity Foundation. Implementation is **NOT STARTED** and requires a later explicit execution against this gate. This prerequisite is not Phase 7 implementation and does not authorize any workflow or runtime surface.

**Objective.** Add exactly the already-counted Release-1 `editorial_users` table defined by `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.5.1 as the Editorial-owned, provider-independent, runtime-inert, seed-free durable FK root for accountable humans.

**Exact future implementation boundary.** A later execution may touch only:

```
src/db/schema.ts
drizzle/<next-authorized-forward-number>_editorial_identity_foundation.sql
drizzle/meta/_journal.json
scripts/db-verify.mjs
```

The migration number is assigned mechanically from the authoritative repository state at execution. At baseline `ac12718`, `0011` is only the observed lawful non-reserved context and is not permanently preclaimed. `0010_devotional_content_foundation.sql` remains reserved for M6 and may not be used, renamed, or displaced. `drizzle/meta/_journal.json` may receive exactly the single mechanical append required to register this one migration; no unrelated journal rewrite is authorized, every existing journal entry remains unchanged, and every existing migration remains byte-unchanged.

**Implementation constraints.** Add exactly four columns: `id`, `status`, `created_at`, and `updated_at`. Add no outgoing FK and no row. No application repository/domain module, authentication integration, authorization, runtime import, API, route, component, UI, workflow, or bootstrap identity is permitted. Absence of rows is the honest fail-closed state.

**Acceptance contract.** An implementation commit may be made only when real PostgreSQL and repository verification prove:

1. exactly one table, `editorial_users`, is added and remains an already-counted Release-1 Editorial table;
2. valid application-generated UUIDv7 is accepted, non-v7 UUID is rejected under the established contract, no database UUID default exists, duplicate ID is rejected, and ID update is rejected;
3. `created_at` update is rejected; status accepts only `active`/`disabled` and defaults to `disabled`;
4. `disabled → active`, `active → disabled`, and reactivation `disabled → active` succeed;
5. status and a strictly later `updated_at` change atomically; status change without valid timestamp advancement, timestamp-only mutation, and no-op timestamp fabrication fail;
6. a referenced identity cannot be deleted, disablement preserves historical FK evidence, and no cascade is present;
7. exactly the four authorized columns exist; no staff key/subject, username, email, display name, provider subject, public-user FK, authentication/profile/credential/password/passkey/MFA/recovery/role/capability/scope/grant/session column exists;
8. no outgoing FK or auth-link table exists, and the migration creates zero rows;
9. all fixtures are synthetic, transaction-scoped, and rolled back; a rollback-only temporary consumer may prove inactive-actor rejection without creating a permanent table, otherwise every future consumer gate, including KE-2, must prove active-actor enforcement before its own implementation can pass;
10. prior migrations are byte-unchanged; table enumeration reports 17 of 30 after this unit and remains truthful if later migrations execute;
11. `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:db`, targeted Prettier check, production build, and `git diff --check` pass;
12. runtime scans prove zero identity/admin wiring, and the staged set equals the exact four-file boundary above; the journal diff is exactly one registration append for this migration and changes no existing entry.

**Explicit exclusions.** `editorial_role_grants`, `review_records`, `publication_events`, `audit_events`, any auth-link table, public `users`/`user_identities`, credentials/passwords/passkeys/MFA/recovery/sessions, roles/capabilities/scopes/grants, staff seeds/bootstrap accounts, Admin API/routes/pages/components/UI, editorial queues/workflows, topic-management UI, content review/publication workflows, KE-2 tables/repository implementation, M6/`devotional_items`, Duas, Quran/provider work, M5 Gate 4/5, Phase 7 completion, and later Knowledge Engine phases remain NOT AUTHORIZED.

**Status and dependency truth.** KE-1 remains COMPLETE. KE-2 governance remains COMPLETE and KE-2 implementation remains NOT STARTED. This prerequisite, once implemented, removes only the `editorial_users` blocker; `devotional_items` remains a hard independent blocker and no KE-2 migration may begin. M5 Gate 3 remains PARTIAL; M5 Provider Import Dry Run Verified and M5 Quran Import Activated remain NOT PASS; M6 remains BLOCKED; Duas governance is unchanged.

**Phase 7 reconciliation.** Editorial Identity Foundation governance is approved and its implementation remains NOT STARTED. `editorial_role_grants`, `review_records`, authentication/provider linking, MFA/passkeys/sessions/recovery, Admin API/UI, editorial workflows, and Phase 7 overall remain NOT STARTED / NOT COMPLETE. Future Phase 7 must reuse immutable `editorial_users.id` and may not replace it with a provider or public-account identity.

### Knowledge Engine governance track (M7.0-track)

This section formally opens the governance track already forward-referenced twice in this document (Phase 6's excluded-scope line: _"`ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` and any Knowledge Engine implementation are M7.0-track and are explicitly not authorized by this contract"_; and the M5 acceptance record's exclusion of _"M7 / Knowledge Engine work"_) and in `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md`'s own header (_"Milestone: M7.0 — Knowledge Engine Architecture"_). It records gate structure only. It authorizes no implementation, no migration, no commit, and no code.

**Relationship to Phase 7.** `M7 — Editorial administration workflows` (Phase 7 below) and the Knowledge Engine's `M7.0-track` are two distinct, non-overlapping tracks that happen to share the leading digit "7" for unrelated historical reasons — Phase 7 is simply the next sequential Roadmap phase after Phase 6, while `M7.0` is `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md`'s own self-assigned milestone number, chosen before this Roadmap formally opened this track. To avoid ambiguity, every Knowledge Engine gate is named with the explicit `M7.0-track` qualifier and is never abbreviated to a bare `M7.x`, which is reserved for Editorial administration workflow gates under Phase 7.

**M7.0 — Knowledge Engine Architecture.** Already exists and is already complete as a documentation artifact: `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md`, proposing a relationship/discovery layer over existing content modules (nodes referencing existing canonical identities, typed/weighted relationship edges, a layered topic/entity taxonomy, search as a read-only consumer, and mechanically enforced Authentic/Editorial separation). Per that document's own header, it remains **documentation only; not approved for implementation**. This Roadmap entry does not change that status.

**Prototype/evidence, not authority.** Uncommitted working-tree files under `src/lib/knowledge/` and `tests/knowledge-*.test.mjs` exist as prototype implementation exercising the M7.0 architecture's earlier phased-adoption concepts (that document's own §16 phased adoption path). Their existence, their informal internal self-labeling, and their passing test suite are **evidence only** — they carry no governance authority and do not themselves authorize commit, merge, or any further implementation. No inference of authorization may be drawn from their existence, quality, or test-pass status.

**Implementation requires Governance Unit 2.** No Knowledge Engine implementation — including committing any existing prototype file under `src/lib/knowledge/` or `tests/knowledge-*.test.mjs` as-is — is authorized until a separate, later Decision Registry entry (`M7.0-track` Governance Unit 2) explicitly records: (a) which phase of the architecture document's §16 phased adoption path is being authorized; (b) the exact scope and file boundary of that implementation unit; and (c) confirmation of whether that scope stays Registry-only or crosses `ALSAMAD_DECISION_REGISTRY.md` §7's ADR threshold (for example, by introducing a physical table). This entry does not itself constitute that authorization.

**Independence from Quran/M5 and Duas/M6.** The `M7.0-track` is governance-independent of Phase 5's Quran provider-credential/legal gates and Phase 6's Duas/devotional gates. `M5 Gate 3` being `PARTIAL`, `M5 Quran Import Activated` being `NOT PASS`, and `M6` being `BLOCKED` neither block nor are affected by this documentation-only track. This entry changes no M5, M6, Quran, Duas, or provider status recorded elsewhere in this document.

**Status.** `M7.0-track` gate structure is recorded. `REG-0014` authorized exactly KE-1, which is now COMPLETE at `e073879`; it remains runtime-inert. `REG-0015`/`ADR-0007` governance-approve exactly KE-2's later additive two-table contract, while KE-2 implementation remains NOT STARTED. Phase 3 onward, Duas, collections/references, generic persisted knowledge edges, runtime UI/search wiring, and AI remain NOT AUTHORIZED. No prototype outside an explicit gate boundary carries authority merely by existing. `M5 Gate 3` remains `PARTIAL`, `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`, `M6` remains `BLOCKED`, and Duas' independently governed status is unchanged.

#### M7.0-track / KE-2 — Controlled Topic Vocabulary and Content Assignment Foundation

**Governance status.** `REG-0015` and `ADR-0007` approve the architecture and physical contract for KE-2. KE-1 remains COMPLETE at `e073879`. KE-2 implementation is **NOT STARTED** and requires a separate execution task against this exact gate; this documentation does not authorize migration execution, schema/code implementation, staging, commit, push, seed data, or runtime wiring.

**Objective.** Add exactly the later additive, non-Release-1 `topics` and `content_topics` tables defined by `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1. The package owns a controlled localized topic vocabulary and reviewed assignments to either `quran_ayahs.id` or authenticated Adhkar-only `devotional_items.id`. It owns no canonical religious content.

**Dependencies.** Governance does not require `M5 Gate 3` PASS and may be completed now. Later schema execution requires the referenced `locales`, `quran_ayahs`, `devotional_items`, `content_items`, and `editorial_users` tables to exist and their governing migrations/gates to remain green. Draft assignments require canonical endpoints but may precede their publication eligibility. Approval and every future read require current canonical-owner eligibility: published Quran structure plus the matching active Arabic release's full §5.3.12 live chain and referenced-ayah text, or an Adhkar `dhikr` with a published `source_verified` revision. The KE-2 migration itself remains empty and may not create canonical content. KE-1 runtime wiring is not a dependency. This gate does not change `M5 Gate 3 = PARTIAL`, does not authorize M5 Gate 4/5, does not unblock M6, and does not resolve Duas governance.

**Exact future implementation boundary.** A future KE-2 execution may touch only:

```
src/db/schema.ts
drizzle/<next-authorized-forward-number>_ke2_topics.sql
src/lib/knowledge/topics.ts
src/lib/knowledge/topic-repository.ts
tests/knowledge-topic-layer.test.mjs
scripts/db-verify.mjs
```

The migration number is assigned mechanically at execution from the then-authoritative forward-only sequence; it is not an architectural choice and may not reuse or displace `0010_devotional_content_foundation.sql`. The existing uncommitted `src/lib/knowledge/topics.ts` is prototype evidence only and must conform to §10.1 before inclusion. No other prototype file is authorized.

**Implementation constraints.** The migration is one atomic empty-schema unit for exactly two tables, their authorized constraints, triggers, and indexes. It is forward-only; every prior migration remains byte-unchanged. The repository layer is the only code permitted to access the two tables and must have no network/provider side effect. No application route, component, runtime script composition root, search implementation, related-content surface, editorial/admin UI, AI consumer, or feature flag is introduced.

**Acceptance contract.** A KE-2 implementation commit may be made only when all of the following pass:

1. exactly `topics` and `content_topics` are added and classified outside the historical Release-1 30-table catalog;
2. prior migrations are byte-unchanged and the new migration is forward-only, atomic, and empty;
3. real PostgreSQL verifies UUIDv7 IDs, immutable unique lowercase topic keys, locale-key/name JSON integrity, status/review checks, timestamps, all FKs, exactly-one endpoint enforcement, and deletion restrictions;
4. exact partial unique indexes `WHERE quran_ayah_id IS NOT NULL AND review_state <> 'rejected'` and `WHERE devotional_item_id IS NOT NULL AND review_state <> 'rejected'` enforce at most one current assignment per pair; rejected rows are terminal immutable history, and a new-identity replacement for the same pair is accepted only when no other current row exists;
5. invalid/missing topics, Quran ayahs, Devotional items, non-dhikr Devotional content, both endpoints, and neither endpoint are rejected; draft may precede publication eligibility, but approval fails unless the Quran ayah/surah are published and the full current Arabic release eligibility chain passes, or the Adhkar item has a published `source_verified` revision;
6. advisory weight accepts only `0.000` through `1.000` and cannot affect authenticity, verification, or publication;
7. curator/reviewer integrity, reviewer separation for approval, and approved/rejected evidence pairing are enforced; a `BEFORE UPDATE` guard rejects every update to an already-rejected row, including state, weight, topic/endpoints, curator/reviewer, notes/evidence, timestamps, and all other columns;
8. synthetic fixtures are non-religious, transaction-scoped, and rolled back; zero topic rows and zero religious-content assignment rows are seeded;
9. all committed KE-2 files contain zero Duas dependency/reference and no collection/reference/generic-edge implementation;
10. `src/app/**`, `src/components/**`, and runtime scripts contain zero KE-2 import; absence remains an honest empty/fail-closed state;
11. targeted KE-2 tests and all KE-1 tests pass;
12. `npm run typecheck`, `npm run lint`, `npm test`, targeted Prettier check, production build, and `git diff --check` pass;
13. real PostgreSQL concurrency tests prove both mutation paths acquire the one fixed transaction-scoped lock `pg_advisory_xact_lock(hashtextextended('alsamad:ke2:locale-integrity', 0))` at required `READ COMMITTED`: concurrent multi-row topic writes using locale sets `{a,b}` and `{b,a}` do not deadlock from KE-2 locale-integrity locking; topic insert/update versus deletion cannot both commit a dangling reference in either transaction ordering; referenced deletion fails; lawful unreferenced deletion succeeds; unsupported isolation levels fail closed; the lock is automatically released at commit/rollback; and normal read-only topic queries acquire no advisory lock;
14. a future read-model test proves topic/assignment approval alone is insufficient: the same canonical-owner eligibility predicate is re-derived at read time, and Quran withdrawal/unpublication/release or rights ineligibility and Adhkar withdrawal/supersession/verification loss fail closed without mutating the assignment or blocking the owner transition;
15. rejected-assignment PostgreSQL tests prove rejected-to-draft, rejected-to-approved, weight changes, reviewer/evidence/notes changes, timestamp changes, and every other update fail; insertion of a new replacement for the same pair succeeds, while the partial indexes prevent two non-rejected rows for that pair;
16. the staged set equals the exact boundary above with the mechanically assigned migration filename, and the complete staged diff contains no runtime, seed, provider, credential, M5 Gate 4/5, Duas, or later-phase work.

**Explicit exclusions.** `src/lib/knowledge/collections.ts`, `src/lib/knowledge/references.ts`, `src/lib/knowledge/adapters/duas.ts`, generic persisted `knowledge_edges`, Articles/Guides, Hadith, Talibeen, Duas, entities, topic-to-topic edges, AI suggestions, semantic search, the AI Search Assistant, runtime search expansion, related-content UI, editorial/admin UI, topic/assignment seeds, provider/network/credential work, M5 Gate 4/5, canonical ownership changes, and Phase 3 onward remain NOT AUTHORIZED.

**Completion evidence.** Only a later implementation commit satisfying every acceptance item may mark `M7.0-track / KE-2` COMPLETE. Governance approval alone must continue to report `KE-2 implementation = NOT STARTED`.

## Phase 7: Editorial administration workflows

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 8: Deterministic search

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 9: Prayer and Hijri configuration

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 10: Public Release 1 experience

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 11: Accessibility, SEO, performance and localization

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 12: Security hardening

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 13: Observability and analytics

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 14: Release verification

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 15: Production launch

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 16: Post-launch stabilization

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 17: Prepared foundations

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 18: Approved Later Modules

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Phase 19: Future / Research

- Objective
- Included scope
- Explicitly excluded scope
- Dependencies
- Artifacts
- Database changes allowed
- Application capabilities
- Admin capabilities
- Security requirements
- QA requirements
- Observability requirements
- Analytics requirements
- Acceptance criteria
- Completion evidence
- Rollback/recovery
- Release status

## Release 1 Scope

Arabic/English public experience, Quran, translations, duas, adhkar, prayer, Hijri, tasbeeh, deterministic search, provenance, editorial workflows, accessibility, SEO, performance, security, monitoring, minimal analytics.
Excluded: Talibeen, subscriptions, payments, Hadith corpus, runtime generative AI, semantic search, advanced notifications, community, GPU, multi-region.

## Database Sequence

Implement only the approved Release 1 schema and activate the 30 Release 1 tables according to owning modules. Future tables remain prohibited until their release phase.

## Content Import Gates

Quran.Foundation is the approved primary Quran provider through `QuranContentProvider`. Before import or activation, complete exact edition selection, licensing and attribution, default seven-day retention enforcement or written durable-storage rights, checksums, manifests, ayah/surah validation, translation/footnote/tafsir approval, provider fallback, quotas, environment credentials, and deletion/exit procedures.

## Implementation Gates

- Architecture Gate
- Data Source Gate
- Database Gate
- Content Integrity Gate
- UI Approval Gate
- Security Gate
- Accessibility Gate
- SEO Gate
- Performance Gate
- Production Readiness Gate
- Launch Approval Gate

## Quality Evidence

- Formatting
- Lint
- Strict TypeScript
- Architecture boundary checks
- Real PostgreSQL tests
- Migration verification
- Constraint verification
- Seed idempotency
- API contract tests
- Authorization tests
- Accessibility
- RTL/LTR
- Religious integrity
- Performance
- Security scans
- Backup restore
- Observability verification

## Milestones

- M0 Architecture Baseline Locked
- M0.5 Quran.Foundation Architecture Alignment
- M1 Release 1 Scope Frozen
- M2 Database Foundation Verified
- M3 Global Locales and Regional Configuration Verified
- M4 Content Integrity Foundation Operational
- M5 Schema Foundation Verified / Provider Import Dry Run Verified / Quran Import Activated
- M6 Devotional Content and Editorial General Dua Operational
- M7 Editorial Operations Ready
- M8 Deterministic Search Ready
- M9 Prayer and Hijri Ready
- M10 Public Release 1 Experience Complete
- M11 Release 1 Verified
- M12 Production Launch and Stabilization Complete

## Dependency Map

```mermaid
flowchart LR
M0-->M05["M0.5"]-->M1-->M2-->M3-->M4-->M5-->M6-->M7-->M8-->M9-->M10-->M11-->M12
```

## Delivery Matrices

- Phase ownership
- Milestones
- Dependencies
- Release gates
- Database activation
- Architecture ownership
- Acceptance evidence
- Deferred capabilities
- Risk classification

## Open Decisions

- Quran.Foundation production Content access, exact editions, quotas, attribution, retention rights, and independently licensed fallback
- Translation licenses
- Devotional datasets
- Staff authentication provider and operational configuration; staff authentication itself is mandatory, while public authentication remains Prepared
- PostgreSQL provider
- Hosting
- Object storage
- Prayer provider
- Hijri provider
- Design tokens
- Quran font
- Analytics provider
- Observability provider
- Security providers
- Launch date

## Validation

- Phases follow approved architecture.
- Release 1 remains minimal.

## M0.5 — Quran.Foundation Architecture Alignment

M0.5 depends on the completed Quran.Foundation capability discovery and integration assessment and changes no product scope. It locks Quran.Foundation as the primary upstream Quran provider while preserving provider-independent ALSAMAD contracts, identifiers, editorial ownership, and fallback.

M1 may begin only after all twelve architecture documents, this roadmap, Release 1, and M0 are consistent. M1 must sequence the `QuranContentProvider` contract and Quran.Foundation adapter before provider use. Content activation depends on approved production credentials, exact resources, commercial/attribution terms, quota limits, retention rights or an independently licensed fallback, validation/checksums, and deletion/exit handling.

Release 1 includes approved text, translations, tafsir, footnotes, structural navigation, and chapter information. Audio is conditionally included only after its written rights and production gate passes; otherwise it is disabled. QF Search remains internal evaluation until its production/search gate passes, while public search stays deterministic and local. Public authentication and `QuranUserInteropProvider` remain Prepared. Streaks and Quran.Foundation social/community capabilities remain excluded.

The milestone dependency chain is `M0 → M0.5 → M1`. No implementation begins until M0.5 verification passes.

- Future modules not authorized.
- Security and accessibility are release gates.
- QA evidence required.
- Restore verification before launch.
- No code, UI, migrations, tests, commits, pushes or deployments.
- Roadmap guidance 479.
- Roadmap guidance 480.
- Roadmap guidance 481.
- Roadmap guidance 482.
- Roadmap guidance 483.
- Roadmap guidance 484.
- Roadmap guidance 485.
- Roadmap guidance 486.
- Roadmap guidance 487.
- Roadmap guidance 488.
- Roadmap guidance 489.
- Roadmap guidance 490.
- Roadmap guidance 491.
- Roadmap guidance 492.
- Roadmap guidance 493.
- Roadmap guidance 494.
- Roadmap guidance 495.
- Roadmap guidance 496.
- Roadmap guidance 497.
- Roadmap guidance 498.
- Roadmap guidance 499.
- Roadmap guidance 500.
- Roadmap guidance 501.
- Roadmap guidance 502.
- Roadmap guidance 503.
- Roadmap guidance 504.
- Roadmap guidance 505.
- Roadmap guidance 506.
- Roadmap guidance 507.
- Roadmap guidance 508.
- Roadmap guidance 509.
- Roadmap guidance 510.
- Roadmap guidance 511.
- Roadmap guidance 512.
- Roadmap guidance 513.
- Roadmap guidance 514.
- Roadmap guidance 515.
- Roadmap guidance 516.
- Roadmap guidance 517.
- Roadmap guidance 518.
- Roadmap guidance 519.
- Roadmap guidance 520.
- Roadmap guidance 521.
- Roadmap guidance 522.
- Roadmap guidance 523.
- Roadmap guidance 524.
- Roadmap guidance 525.
- Roadmap guidance 526.
- Roadmap guidance 527.
- Roadmap guidance 528.
- Roadmap guidance 529.
- Roadmap guidance 530.
- Roadmap guidance 531.
- Roadmap guidance 532.
- Roadmap guidance 533.
- Roadmap guidance 534.
- Roadmap guidance 535.
- Roadmap guidance 536.
- Roadmap guidance 537.
- Roadmap guidance 538.
- Roadmap guidance 539.
- Roadmap guidance 540.
- Roadmap guidance 541.
- Roadmap guidance 542.
- Roadmap guidance 543.
- Roadmap guidance 544.
- Roadmap guidance 545.
- Roadmap guidance 546.
- Roadmap guidance 547.
- Roadmap guidance 548.
- Roadmap guidance 549.
- Roadmap guidance 550.
- Roadmap guidance 551.
- Roadmap guidance 552.
- Roadmap guidance 553.
- Roadmap guidance 554.
- Roadmap guidance 555.
- Roadmap guidance 556.
- Roadmap guidance 557.
- Roadmap guidance 558.
- Roadmap guidance 559.
- Roadmap guidance 560.
- Roadmap guidance 561.
- Roadmap guidance 562.
- Roadmap guidance 563.
- Roadmap guidance 564.
- Roadmap guidance 565.
- Roadmap guidance 566.
- Roadmap guidance 567.
- Roadmap guidance 568.
- Roadmap guidance 569.
- Roadmap guidance 570.
- Roadmap guidance 571.
- Roadmap guidance 572.
- Roadmap guidance 573.
- Roadmap guidance 574.
- Roadmap guidance 575.
- Roadmap guidance 576.
- Roadmap guidance 577.
- Roadmap guidance 578.
- Roadmap guidance 579.
- Roadmap guidance 580.
- Roadmap guidance 581.
- Roadmap guidance 582.
- Roadmap guidance 583.
- Roadmap guidance 584.
- Roadmap guidance 585.
- Roadmap guidance 586.
- Roadmap guidance 587.
- Roadmap guidance 588.
- Roadmap guidance 589.
- Roadmap guidance 590.
- Roadmap guidance 591.
- Roadmap guidance 592.
- Roadmap guidance 593.
- Roadmap guidance 594.
- Roadmap guidance 595.
- Roadmap guidance 596.
- Roadmap guidance 597.
- Roadmap guidance 598.
- Roadmap guidance 599.
- Roadmap guidance 600.
- Roadmap guidance 601.
- Roadmap guidance 602.
- Roadmap guidance 603.
- Roadmap guidance 604.
- Roadmap guidance 605.
- Roadmap guidance 606.
- Roadmap guidance 607.
- Roadmap guidance 608.
- Roadmap guidance 609.
- Roadmap guidance 610.
- Roadmap guidance 611.
- Roadmap guidance 612.
- Roadmap guidance 613.
- Roadmap guidance 614.
- Roadmap guidance 615.
- Roadmap guidance 616.
- Roadmap guidance 617.
- Roadmap guidance 618.
- Roadmap guidance 619.
- Roadmap guidance 620.
- Roadmap guidance 621.
- Roadmap guidance 622.
- Roadmap guidance 623.
- Roadmap guidance 624.
- Roadmap guidance 625.
- Roadmap guidance 626.
- Roadmap guidance 627.
- Roadmap guidance 628.
- Roadmap guidance 629.
- Roadmap guidance 630.
- Roadmap guidance 631.
- Roadmap guidance 632.
- Roadmap guidance 633.
- Roadmap guidance 634.
- Roadmap guidance 635.
- Roadmap guidance 636.
- Roadmap guidance 637.
- Roadmap guidance 638.
- Roadmap guidance 639.
- Roadmap guidance 640.
- Roadmap guidance 641.
- Roadmap guidance 642.
- Roadmap guidance 643.
- Roadmap guidance 644.
- Roadmap guidance 645.
- Roadmap guidance 646.
- Roadmap guidance 647.
- Roadmap guidance 648.
- Roadmap guidance 649.
- Roadmap guidance 650.
- Roadmap guidance 651.
- Roadmap guidance 652.
- Roadmap guidance 653.
- Roadmap guidance 654.
- Roadmap guidance 655.
- Roadmap guidance 656.
- Roadmap guidance 657.
- Roadmap guidance 658.
- Roadmap guidance 659.
- Roadmap guidance 660.
- Roadmap guidance 661.
- Roadmap guidance 662.
- Roadmap guidance 663.
- Roadmap guidance 664.
- Roadmap guidance 665.
- Roadmap guidance 666.
- Roadmap guidance 667.
- Roadmap guidance 668.
- Roadmap guidance 669.
- Roadmap guidance 670.
- Roadmap guidance 671.
- Roadmap guidance 672.
- Roadmap guidance 673.
- Roadmap guidance 674.
- Roadmap guidance 675.
- Roadmap guidance 676.
- Roadmap guidance 677.
- Roadmap guidance 678.
- Roadmap guidance 679.
- Roadmap guidance 680.
- Roadmap guidance 681.
- Roadmap guidance 682.
- Roadmap guidance 683.
- Roadmap guidance 684.
- Roadmap guidance 685.
- Roadmap guidance 686.
- Roadmap guidance 687.
- Roadmap guidance 688.
- Roadmap guidance 689.
- Roadmap guidance 690.
- Roadmap guidance 691.
- Roadmap guidance 692.
- Roadmap guidance 693.
- Roadmap guidance 694.
- Roadmap guidance 695.
- Roadmap guidance 696.
- Roadmap guidance 697.
- Roadmap guidance 698.
- Roadmap guidance 699.
- Roadmap guidance 700.
- Roadmap guidance 701.
- Roadmap guidance 702.
- Roadmap guidance 703.
- Roadmap guidance 704.
- Roadmap guidance 705.
- Roadmap guidance 706.
- Roadmap guidance 707.
- Roadmap guidance 708.
- Roadmap guidance 709.
- Roadmap guidance 710.
- Roadmap guidance 711.
- Roadmap guidance 712.
- Roadmap guidance 713.
- Roadmap guidance 714.
- Roadmap guidance 715.
- Roadmap guidance 716.
- Roadmap guidance 717.
- Roadmap guidance 718.
- Roadmap guidance 719.
- Roadmap guidance 720.
- Roadmap guidance 721.
- Roadmap guidance 722.
- Roadmap guidance 723.
- Roadmap guidance 724.
- Roadmap guidance 725.
- Roadmap guidance 726.
- Roadmap guidance 727.
- Roadmap guidance 728.
- Roadmap guidance 729.
- Roadmap guidance 730.
- Roadmap guidance 731.
- Roadmap guidance 732.
- Roadmap guidance 733.
- Roadmap guidance 734.
- Roadmap guidance 735.
- Roadmap guidance 736.
- Roadmap guidance 737.
- Roadmap guidance 738.
- Roadmap guidance 739.
- Roadmap guidance 740.
- Roadmap guidance 741.
- Roadmap guidance 742.
- Roadmap guidance 743.
- Roadmap guidance 744.
- Roadmap guidance 745.
- Roadmap guidance 746.
- Roadmap guidance 747.
- Roadmap guidance 748.
- Roadmap guidance 749.
- Roadmap guidance 750.
- Roadmap guidance 751.
- Roadmap guidance 752.
- Roadmap guidance 753.
- Roadmap guidance 754.
- Roadmap guidance 755.
- Roadmap guidance 756.
- Roadmap guidance 757.
- Roadmap guidance 758.
- Roadmap guidance 759.
- Roadmap guidance 760.
- Roadmap guidance 761.
- Roadmap guidance 762.
- Roadmap guidance 763.
- Roadmap guidance 764.
- Roadmap guidance 765.
- Roadmap guidance 766.
- Roadmap guidance 767.
- Roadmap guidance 768.
- Roadmap guidance 769.
- Roadmap guidance 770.
- Roadmap guidance 771.
- Roadmap guidance 772.
- Roadmap guidance 773.
- Roadmap guidance 774.
- Roadmap guidance 775.
- Roadmap guidance 776.
- Roadmap guidance 777.
- Roadmap guidance 778.
- Roadmap guidance 779.
- Roadmap guidance 780.
- Roadmap guidance 781.
- Roadmap guidance 782.
- Roadmap guidance 783.
- Roadmap guidance 784.
- Roadmap guidance 785.
- Roadmap guidance 786.
- Roadmap guidance 787.
- Roadmap guidance 788.
- Roadmap guidance 789.
- Roadmap guidance 790.
- Roadmap guidance 791.
- Roadmap guidance 792.
- Roadmap guidance 793.
- Roadmap guidance 794.
- Roadmap guidance 795.
- Roadmap guidance 796.
- Roadmap guidance 797.
- Roadmap guidance 798.
- Roadmap guidance 799.
- Roadmap guidance 800.
- Roadmap guidance 801.
- Roadmap guidance 802.
- Roadmap guidance 803.
- Roadmap guidance 804.
- Roadmap guidance 805.
- Roadmap guidance 806.
- Roadmap guidance 807.
- Roadmap guidance 808.
- Roadmap guidance 809.
- Roadmap guidance 810.
- Roadmap guidance 811.
- Roadmap guidance 812.
- Roadmap guidance 813.
- Roadmap guidance 814.
- Roadmap guidance 815.
- Roadmap guidance 816.
- Roadmap guidance 817.
- Roadmap guidance 818.
- Roadmap guidance 819.
- Roadmap guidance 820.
- Roadmap guidance 821.
- Roadmap guidance 822.
- Roadmap guidance 823.
- Roadmap guidance 824.
- Roadmap guidance 825.
- Roadmap guidance 826.
- Roadmap guidance 827.
- Roadmap guidance 828.
- Roadmap guidance 829.
- Roadmap guidance 830.
- Roadmap guidance 831.
- Roadmap guidance 832.
- Roadmap guidance 833.
- Roadmap guidance 834.
- Roadmap guidance 835.
- Roadmap guidance 836.
- Roadmap guidance 837.
- Roadmap guidance 838.
- Roadmap guidance 839.
- Roadmap guidance 840.
- Roadmap guidance 841.
- Roadmap guidance 842.
- Roadmap guidance 843.
- Roadmap guidance 844.
- Roadmap guidance 845.
- Roadmap guidance 846.
- Roadmap guidance 847.
- Roadmap guidance 848.
- Roadmap guidance 849.
