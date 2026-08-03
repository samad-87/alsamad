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

## Phase 5: Quran data model and verified import

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

## Phase 6: Devotional content and Editorial General Dua

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
- M5 Devotional Content Operational
- M6 Editorial Operations Ready
- M7 Deterministic Search Ready
- M8 Prayer and Hijri Ready
- M9 Public Experience Complete
- M10 Release 1 Verified
- M11 Production Launch
- M12 Stabilization Complete

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
