# Alsamad — Administration Architecture

**Status:** Architecture baseline; documentation only  
**Authoritative references:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`, `ALSAMAD_DATABASE_ARCHITECTURE.md`  
**Purpose:** Define the long-term operational control architecture for Alsamad without authorizing application code, UI implementation, database migrations, deployment, or later-module activation.

---

## 1. Mission and Scope

Alsamad administration is the operational control center of the platform. It is not a generic back-office dashboard and not a collection of CRUD pages. It coordinates content integrity, religious review, translation, publication, corrections, regional configuration, search stewardship, moderation, observability, AI governance, permissions, emergency response, and later approved modules.

The administration architecture exists to keep Alsamad trustworthy as it grows across decades, languages, regions, content corpora, operational teams, and future product modules.

The architecture must always preserve the product baseline:

- canonical religious truth is normalized rather than duplicated by language;
- Quran and authentic Sunnah remain the primary religious foundations;
- transmitted religious content is structurally and visually distinct from editorial content;
- Editorial General Dua remains distinct from Quranic Dua, Prophetic Dua, and Authenticated Dhikr;
- no religious content is published directly from import, machine output, or draft;
- Arabic remains first-class while every language and region is configuration-driven;
- AI never becomes an independent religious authority;
- commerce, popularity, engagement, or payment never influence religious ranking, review, or publication;
- later modules remain separately authorized and are not activated merely because their administration is documented.

### 1.1 What this document defines

This document defines:

- operational domains and ownership;
- administrative capabilities and boundaries;
- role and permission architecture;
- workflow state machines;
- review and publication controls;
- audit, rollback, withdrawal, and emergency procedures;
- release-status boundaries;
- how administrative actions map to the approved product and database architectures.

### 1.2 What this document does not authorize

This document does not authorize:

- application code;
- admin UI implementation;
- database schema or migration creation;
- external provider onboarding;
- content import;
- AI runtime launch;
- Talibeen, subscriptions, notifications, Hadith, or any later module;
- production deployment.

---

## 2. Administrative Constitutional Principles

### 2.1 Admin Minimalism Principle

Every administrative capability must exist because it supports a named operational workflow. A page, queue, configuration surface, report, or permission must not exist merely because it is conventional in admin software.

Administrative complexity is justified only when it protects content integrity, enables a real release journey, supports global operation, reduces operational risk, or fulfills an approved later-module requirement.

### 2.2 Editorial First Principle

Administrative workflows optimize for correctness, traceability, religious appropriateness, translation quality, and safe publication before speed or volume.

Operational metrics must not pressure editors or reviewers to publish faster at the expense of quality. Throughput may be measured for staffing and bottleneck analysis, but it must never become a religious-content quality target.

### 2.3 Least Privilege Principle

Every actor receives only the minimum capabilities required for an assigned workflow, content scope, locale, region, and duration.

No role receives unrestricted platform authority by default. Elevated access is scoped, time-bound where practical, reviewed periodically, and auditable.

### 2.4 Operational Transparency Principle

Privileged administrative actions must be attributable, reviewable, and auditable. Publication, review decisions, corrections, withdrawals, role grants, configuration changes, overrides, emergency actions, moderation decisions, AI policy changes, and sensitive-data access require an append-oriented audit trail.

### 2.5 Human Review Principle

Religious publication always follows the approved human review workflow. Imports, translations, editorial drafts, machine-assisted drafts, and AI-assisted content cannot bypass required source, language, religious, and publication reviews.

Runtime AI, if separately approved later, is not represented as pre-approved religious content. It must remain constrained by approved retrieval, citations, refusal rules, evaluation, monitoring, and visible labeling.

### 2.6 Global Operations Principle

Administrative concepts must support unlimited languages, locales, scripts, countries, regions, time zones, and regional configurations without cloning canonical religious truth.

Assignments, queues, permissions, previews, review policies, SEO decisions, prayer defaults, Hijri adjustments, and publication visibility must all be scopeable by locale and region.

### 2.7 Content Integrity Supremacy Principle

The Content Integrity architecture owns religious content taxonomy, provenance, review requirements, publication lifecycle, correction history, withdrawal behavior, and AI-assisted-content transparency.

Administrative convenience may never weaken these rules.

### 2.8 Database Ownership Principle

Administrative workflows must respect the database architecture’s single-owner rule. Every durable record belongs to exactly one module. Administrative cross-module reads use owning services or stable approved read models; cross-module writes use explicit services and transaction boundaries.

### 2.9 Schema Minimalism Principle

Administration must operate against the smallest durable schema approved for each release. It must not create new persistence merely to mirror screens, queues, filters, counters, or derived states.

A durable administrative record is justified only when the approved table-creation gate is satisfied: a named journey requires it, one module owns it, the state is durable and non-derivable, integrity or retention requires persistence, and the release track is authorized.

### 2.10 Database Evolution Principle

Administrative capabilities expand through additive migrations after separate approval. Release 1 must not contain physical tables for future modules merely to “prepare” their admin screens.

### 2.11 Separation of Duties Principle

Drafting, reviewing, religious approval, language approval, publishing, permission administration, and emergency override are distinct capabilities. A single human may temporarily hold several scoped roles in a small team, but the architecture must preserve the distinction and enforce reviewer separation when policy requires it.

### 2.12 Reversibility Principle

Every high-impact operational action must have a defined rollback, supersession, withdrawal, correction, or compensating procedure. Immutable histories are not erased to simulate rollback.

### 2.13 No Shadow Administration Principle

Operational decisions must not be hidden in source code, ad hoc spreadsheets, direct database edits, undocumented provider consoles, or private messaging. Approved configuration and decisions belong in governed operational workflows with ownership and audit.

---

## 3. Release-Status Model

All capabilities use one of four statuses.

| Status | Administrative meaning |
| --- | --- |
| **Release 1** | Required to operate the trustworthy daily foundation and its verified content. |
| **Prepared** | Architecture and controlled foundations may be prepared, but public exposure or account dependence is optional. |
| **Approved Later Module** | Product capability is approved in principle but requires its own implementation, privacy, security, and operational authorization. |
| **Future / Research** | Requires evidence, safety evaluation, licensing, experimentation, or a later product decision. |

A capability’s presence in this document does not authorize implementation.

---

## 4. Administrative Domain Map

The administration architecture is a modular operational system. Each domain owns its workflows and durable decisions.

### 4.1 Release 1 administrative domains

- Operational Dashboard
- Editorial CMS
- Content Integrity Operations
- Quran Management
- Devotional Content Management
- Editorial General Dua Management
- Translation Management
- Review and Publication Operations
- Corrections, Supersessions, and Withdrawals
- Prayer and Islamic Calendar Configuration
- Global Locales and Geographic Configuration
- Deterministic Search Operations
- Basic SEO and Canonical Publishing Controls
- Media Metadata Operations only when an approved Release 1 asset requires them
- Audit and Operational Incident Records
- Roles, Scoped Grants, and Staff Administration
- Platform Health and Release Readiness

### 4.2 Prepared administrative domains

- Authentication-dependent staff identity linking
- Private correction submissions
- Additional locale rollout
- Audio/reciter administration
- Notification preference and template preparation
- Extended SEO controls
- Topic hubs and entity-page curation
- Media library expansion
- Search analytics beyond essential operational diagnostics

### 4.3 Approved Later Module administrative domains

- Hadith administration
- Talibeen administration
- Subscriptions and payment operations
- Alsamad Balance administration
- Platform moderation and appeals
- Qibla administration where separately approved
- Later notification delivery operations

### 4.4 Future / Research administrative domains

- AI runtime governance
- Prompt and model configuration
- Evaluation datasets and red-team suites
- Citation validation automation
- AI runtime monitoring and incident response
- Semantic search and embedding governance
- Knowledge graph curation and projection controls
- Advanced experimentation and model-assisted editorial tooling

---

## 5. Operational Dashboard Architecture

The dashboard is an operational summary, not an engagement dashboard.

### 5.1 Dashboard purpose

The dashboard answers:

- What requires attention now?
- What is blocked and why?
- What is awaiting religious or language review?
- What is scheduled or ready to publish?
- What content or configuration has integrity, freshness, or operational risk?
- What incidents, failed jobs, search anomalies, or regional configuration issues require action?

### 5.2 Release 1 dashboard capabilities

- review queue counts by workflow, locale, and content class;
- drafts awaiting source verification;
- translations awaiting language review;
- religious reviews awaiting qualified reviewers;
- approved revisions awaiting publication;
- scheduled publications and failed publication attempts;
- correction and withdrawal cases;
- recently published and superseded revisions;
- prayer/Hijri configuration changes awaiting approval;
- integrity incidents and failed migrations/backups where surfaced operationally;
- staff assignments and expiring permission grants;
- search-index rebuild or freshness warnings if applicable;
- concise platform health indicators.

### 5.3 Dashboard rules

- No vanity metrics.
- No individual productivity leaderboard.
- No gamification of editorial or religious review.
- No public-user engagement metric may rank religious content.
- Every count links to an authorized workflow, not a generic table view.
- Sensitive data is summarized and disclosed only to authorized scopes.

---

## 6. Editorial CMS Architecture

The Editorial CMS is a workflow coordinator over Content Integrity, not a generic free-form page builder.

### 6.1 Core editorial objects

- canonical content item;
- immutable content revision;
- source and license references;
- classification;
- verification state;
- review state;
- publication state;
- translation edition and localized revision;
- correction/supersession relationship;
- publication event;
- audit event.

Category, verification, review, and publication remain independent concepts.

### 6.2 Supported Release 1 editorial journeys

- create a draft from an approved source or editorial brief;
- attach source evidence and license information;
- assign language and religious reviews;
- compare revisions;
- preview Arabic and English presentation;
- approve for publication;
- publish atomically;
- correct or supersede a published revision;
- withdraw content in an emergency;
- restore delivery through a separately reviewed revision, never by erasing history.

### 6.3 CMS boundaries

- Canonical Quran text is not edited as generic rich text.
- Quran translations are edition-bound and separate from canonical Arabic.
- Devotional content uses its own structured domain.
- Editorial General Dua cannot be reclassified as authenticated content.
- Prayer and Hijri settings are configuration workflows, not articles.
- Search projections and SEO metadata are derived or separately governed; they do not become alternate content truth.

---

## 7. Quran Administration

Quran administration protects edition identity, canonical Arabic text, structure, translations, provenance, and publication integrity.

### 7.1 Release 1 capabilities

- manage Quran work and edition metadata;
- inspect surah and ayah structure;
- import canonical Arabic into quarantined review state;
- verify source artifact, license, edition version, parser version, and checksums;
- compare imported text with the approved edition;
- review structural markers;
- manage translation editions and translation texts;
- preview exact ayah rendering in Arabic and target locale;
- record correction and supersession without destructive overwrite;
- review public source and attribution display;
- manage publication eligibility and active edition/version pointers.

### 7.2 Required controls

- no direct public publication from import;
- checksum mismatch quarantines the import/revision;
- one canonical ayah identity independent of language;
- one reviewed text per edition and ayah;
- translation never overwrites or duplicates canonical Arabic truth;
- bulk operations require dry-run, counts, exception report, and rollback plan;
- verse-level comparison must preserve whitespace, diacritics, marks, and normalized-byte evidence;
- emergency withdrawal must be possible without deleting history.

### 7.3 Quran workflow

`imported/quarantined → source-verified → Arabic-text reviewed → structural review → publisher approval → published`

Translations follow a separate language workflow and reference the exact canonical revision/edition.

---

## 8. Devotional Content Administration

Devotional administration covers Duas and Adhkar while preserving source category and review requirements.

### 8.1 Devotional classes

- Quranic Dua
- Prophetic Dua
- Authenticated Dhikr
- Editorial General Dua

These classes are not interchangeable.

### 8.2 Release 1 capabilities

- create and revise devotional items;
- attach exact Quran/Sunnah/source evidence;
- manage morning, evening, and contextual collections;
- control ordered collection membership;
- manage sourced repetition guidance;
- manage translation and transliteration presentation through the approved translation structure;
- preview source labels, authenticity/review labels, and count guidance;
- publish, correct, supersede, or withdraw content.

### 8.3 Authenticated devotional safeguards

- source verification is mandatory;
- no fabricated virtues, rewards, counts, or authenticity claims;
- repetition guidance must be sourced and cannot become a reward system;
- editorial commentary is separated from transmitted text;
- conflicting source or grading information remains visible rather than collapsed into hidden certainty.

---

## 9. Editorial General Dua Administration

Editorial General Dua requires a dedicated operational workflow because it is permissible editorial supplication, not transmitted Quran or Sunnah content.

### 9.1 Mandatory distinctions

- It must carry the `editorial_general_dua` classification.
- It must retain its dedicated structural distinction defined by the database architecture.
- It cannot carry authenticated-Quran or authenticated-Sunnah presentation.
- Background citations do not convert the dua into transmitted content.
- Public presentation must clearly identify it as general/editorial dua.

### 9.2 Required workflow

1. Editorial author drafts the dua and intended context.
2. Language review checks Arabic clarity, grammar, tone, and avoidance of misleading religious claims.
3. Religious appropriateness review confirms that wording does not assert unsupported doctrine, promise reward, invent virtue, or contradict approved principles.
4. Publisher confirms classification, labels, source presentation, and required reviews.
5. Publication event records the approved revision.

### 9.3 Prohibited actions

- reclassifying editorial wording as Prophetic Dua without evidence;
- displaying an authenticity badge intended for transmitted texts;
- inventing repetition counts or virtues;
- using AI output as final text without the complete human workflow;
- silently replacing a published editorial dua with a materially changed version.

---

## 10. Translation Management

Translation management supports unlimited languages while preserving one canonical religious truth.

### 10.1 Separate pipelines

- Religious-content translation pipeline
- Editorial-content translation pipeline
- UI localization pipeline
- SEO metadata localization pipeline

These pipelines may share locale configuration but not approval assumptions.

### 10.2 Translation capabilities

- define translation edition, methodology, translator/organization, license, and version;
- assign target locale and optional regional applicability;
- translate an exact canonical revision;
- mark human-authored, machine-assisted draft, or human-reviewed origin;
- compare source and translation revisions;
- route to language review and, where required, religious review;
- record attribution and public review status;
- publish or supersede a translation independently of canonical content;
- manage explicit fallback policy without silent indexable substitution.

### 10.3 Translation rules

- no silent English fallback presented as Arabic;
- machine output remains draft until human review;
- canonical Quran/Sunnah identity is never duplicated per language;
- locale, script direction, region, and language are explicit;
- translation changes do not mutate canonical source content;
- reviewers must be qualified for the relevant language and content class.

---

## 11. Review Queue Architecture

Queues are operational projections over assignments and workflow states. They are not alternate sources of truth.

### 11.1 Core queues

- source-verification queue;
- Arabic language queue;
- target-language review queue;
- religious review queue;
- publisher approval queue;
- translation queue;
- correction queue;
- withdrawal/emergency queue;
- prayer/Hijri configuration review queue;
- SEO review queue where non-derivable decisions exist;
- moderation and appeal queues for later modules;
- AI escalation queues for Future / Research.

### 11.2 Queue behavior

Every queue item must expose:

- target and exact revision;
- content class;
- locale and region scope;
- required reviewer capability;
- blocking reasons;
- source/license completeness;
- assignment and due context;
- prior decisions and unresolved conflicts;
- sensitivity classification;
- allowed next actions.

Queue order may consider safety, publication deadlines, incident severity, and dependency blocking. It must not use popularity or payment to prioritize religious content.

---

## 12. Religious Review Architecture

Religious review validates source claims, classification, transmitted-text handling, religious appropriateness, and prohibited assertions.

### 12.1 Religious reviewer capability scopes

Capabilities are scoped by:

- corpus or content class;
- language where comprehension is required;
- review type;
- jurisdiction or methodology only where explicitly approved;
- time period;
- conflict-of-interest restrictions.

### 12.2 Required review outcomes

- approve;
- approve with non-blocking editorial note;
- request changes;
- reject;
- escalate to advisory group;
- mark disputed/uncertain with required public disclosure;
- require withdrawal or correction.

### 12.3 Review rules

- decisions are immutable records;
- revised content requires a new decision;
- reviewer and publisher authority are distinct;
- author cannot self-approve where separation is required;
- a review may not silently alter content;
- disagreement is represented explicitly;
- conflicts of interest require recusal and reassignment.

---

## 13. Language Review Architecture

Language review checks fidelity, clarity, script correctness, terminology, attribution, accessibility, and locale suitability.

### 13.1 Arabic review

Arabic review includes:

- grammar and syntax;
- diacritics policy;
- Unicode shaping and punctuation;
- Quranic text non-modification safeguards;
- distinction between canonical text, translation, transliteration, and commentary;
- long-text and RTL presentation preview;
- terminology consistency.

### 13.2 Other-language review

Each language review includes:

- fidelity to the exact source revision;
- translator attribution and edition methodology;
- religious terminology consistency;
- locale-appropriate grammar and style;
- no silent doctrinal reinterpretation;
- fallback and availability behavior;
- SEO metadata consistency without keyword distortion.

---

## 14. Publication Workflow

Publication is a guarded transaction, not a status toggle.

### 14.1 Canonical lifecycle

The administration architecture reconciles operational stages into one conditional workflow:

`draft → source verification → language review → religious review when required → editorial approval → publisher approval → published → corrected/superseded/withdrawn`

Not every content class requires every review, but requirements are policy-driven and explicit.

### 14.2 Publication transaction

A publication operation must:

1. lock the exact revision;
2. validate classification and source/license requirements;
3. validate all required review decisions;
4. validate translation and locale eligibility;
5. validate publication and SEO constraints;
6. record publisher approval;
7. create immutable publication event;
8. supersede the prior active revision where applicable;
9. create audit event;
10. enqueue cache/search/sitemap side effects through the approved mechanism;
11. commit atomically.

### 14.3 Visibility states

- internal draft;
- assigned review;
- approved but unpublished;
- scheduled where separately supported;
- public published;
- withdrawn from active delivery;
- superseded historical;
- archived internal.

Preview access is temporary, hashed, scoped, and never indexable.

---

## 15. Corrections, Supersessions, and Withdrawals

### 15.1 Correction workflow

- receive or identify a correction need;
- classify severity and affected locales/regions;
- freeze unsafe publication if necessary;
- create a new revision;
- preserve original source and publication history;
- rerun required reviews;
- publish the corrected revision atomically;
- mark the previous revision superseded;
- update public correction disclosure where appropriate;
- invalidate search/cache projections;
- audit the complete chain.

### 15.2 Withdrawal workflow

Withdrawal is used when content must leave active delivery without deleting history.

Required fields include:

- reason class;
- actor and authority;
- affected revision and locales;
- effective time;
- public visibility decision;
- related incident/correction case;
- follow-up owner;
- restoration requirements.

### 15.3 Emergency withdrawal

A narrowly scoped emergency capability may immediately remove active delivery when there is credible religious, legal, privacy, or safety risk. It cannot rewrite content or approve a replacement. A follow-up review case is mandatory.

---

## 16. Version History and Content Comparison

### 16.1 Version history

Administrators must be able to inspect:

- revision number and lineage;
- author and source changes;
- exact review decisions;
- translation relationships;
- publication and withdrawal events;
- correction reasons;
- affected locales and regions;
- active versus historical status.

### 16.2 Comparison modes

- structured field comparison;
- canonical text byte/checksum comparison;
- Arabic diacritic-aware visual comparison;
- source-reference comparison;
- translation source-revision comparison;
- collection membership/order comparison;
- prayer/Hijri parameter comparison;
- SEO metadata comparison;
- AI prompt/config comparison in Future / Research.

Comparison is read-only. Accepting changes creates a new revision or configuration version.

---

## 17. Media Management

Media administration is Release 1 only where a separately approved licensed asset is required; otherwise it is Prepared.

### 17.1 Capabilities

- register object metadata, checksum, license, owner, MIME type, dimensions/duration, and lifecycle;
- generate and inspect derived variants;
- manage locale-specific alt text and transcripts;
- attach media to approved content without transferring content ownership;
- review moderation and accessibility status;
- archive or revoke an asset while preserving publication history.

### 17.2 Boundaries

- binary bytes remain outside PostgreSQL;
- object keys are not public URLs;
- signed URLs are derived, not persisted;
- license and source verification precede publication;
- media never becomes a hidden carrier of unreviewed religious claims.

---

## 18. Search Management

Release 1 search is deterministic PostgreSQL full-text/trigram search across approved published content.

### 18.1 Release 1 capabilities

- inspect corpus coverage by locale and content type;
- rebuild derived search projections;
- validate Arabic normalization behavior while preserving canonical display text;
- manage approved synonyms/aliases only where supported by explicit content decisions;
- inspect zero-result and query-error aggregates without retaining unnecessary sensitive queries;
- run relevance benchmarks;
- block unpublished, withdrawn, private, or unsupported content from indexing;
- verify exact-source results precede any future synthesis.

### 18.2 Search administration rules

- search documents are rebuildable projections;
- direct manipulation of canonical content through search admin is prohibited;
- popularity and payment cannot rank religious answers;
- sensitive raw queries are minimized;
- runtime AI search remains Future / Research.

---

## 19. Topic Management and Entity Pages

Topic hubs and curated entity pages are Prepared unless the approved Release 1 implementation requires a minimal configuration-only form.

### 19.1 Topic operations

- define canonical topic identity;
- manage localized names and aliases;
- attach approved canonical content through explicit relationships;
- manage human-curated ordering;
- record editorial rationale;
- detect duplicate or conflicting topics;
- publish or archive a hub;
- maintain stable canonical routing.

### 19.2 Entity-page rules

- no generic SEO content blob;
- page decisions are editorial and non-derivable;
- religious ranking follows content integrity, not traffic or revenue;
- entity pages link to canonical content and do not duplicate it.

---

## 20. Knowledge Graph Administration — Future / Research

Knowledge graph administration remains isolated and rebuildable.

Potential capabilities:

- inspect graph nodes and edges derived from canonical entities;
- curate or reject proposed relationships;
- record source evidence, confidence, model/version, and reviewer;
- detect contradictory relations;
- rebuild projections;
- prevent graph data from modifying canonical religious truth;
- authorize public exposure separately from internal discovery use.

No graph database is required by this architecture. PostgreSQL or another separately approved projection may be used later based on evidence.

---

## 21. Prayer and Calendar Configuration

Prayer and Hijri administration is configuration governance, not generic content editing.

### 21.1 Prayer configuration

- manage calculation method identity, authority, parameters, and version;
- manage regional defaults by geographic scope and effective period;
- manage Asr convention and high-latitude policy disclosures;
- validate manual adjustments and permitted ranges;
- compare method changes before activation;
- approve regional rollout;
- preserve prior versions;
- publish public methodology and active method disclosure.

### 21.2 Hijri configuration

- manage Hijri calculation or observation method;
- manage sourced regional adjustments;
- record predicted, provisional, observed, confirmed, or withdrawn status where applicable;
- manage Muslim event recurrence and regional visibility;
- avoid universalizing a region-specific observation;
- preserve source, authority, uncertainty, and effective dates.

### 21.3 Approval rules

Prayer/Hijri changes require:

- configuration owner;
- regional reviewer where needed;
- methodology review;
- publisher/configuration approver;
- audit event;
- rollback to prior effective version;
- public disclosure update.

---

## 22. Global Settings, Localization, Countries, and Locales

### 22.1 Global settings philosophy

Global settings are explicit, versioned operational configuration. They are not an unrestricted key-value dumping ground.

Configuration must have:

- owning module;
- typed purpose;
- scope;
- default and override rules;
- effective period;
- approver requirements;
- rollback;
- audit classification.

### 22.2 Locale administration

- add and activate locales through configuration;
- manage language, script direction, fallback, and availability;
- define rollout state by module;
- inspect translation coverage;
- prohibit cyclic fallback;
- preview RTL/LTR and long-text states;
- manage locale-specific canonical/SEO eligibility.

### 22.3 Geographic administration

The simplified database architecture uses `geographic_areas` rather than separate country/region/city tables.

Administrative capabilities include:

- create or revise geographic hierarchy records;
- classify country, administrative area, city, or supported scope;
- store IANA time-zone identifiers directly where required;
- manage regional prayer and Hijri defaults;
- activate/deactivate areas without deleting historical references;
- prevent overlapping effective defaults.

### 22.4 Prayer defaults and Hijri adjustments

These remain owned by prayer and calendar modules. Global operations may coordinate rollout, but cannot write directly into their data without the owning workflow.

---

## 23. SEO and Redirect Management

Release 1 SEO should remain configuration-first and minimal. Dedicated SEO persistence is added only when a durable non-derivable workflow requires it.

### 23.1 Release 1 capabilities

- verify locale-specific canonical URLs;
- inspect `hreflang` reciprocity;
- validate stable Quran and content routes;
- review sitemap inclusion based on published revisions;
- noindex internal search, private, draft, preview, and AI-query surfaces;
- manage redirects in reviewed configuration initially;
- review Open Graph generation from approved content templates;
- validate structured data accuracy;
- detect duplicate canonical paths.

### 23.2 Prepared capabilities

- durable redirect history;
- SEO metadata revisions;
- exceptional indexation/sitemap overrides;
- curated topic hubs and entity pages;
- exceptional hreflang mappings;
- structured-data review records.

### 23.3 Redirect workflow

Every redirect decision defines:

- source locale/path;
- target canonical route;
- reason;
- permanence;
- collision check;
- chain/loop validation;
- approval;
- audit;
- rollback/removal date where temporary.

---

## 24. Search Analytics and Operational Analytics

Analytics must serve product correctness and operational stewardship, not addictive optimization.

### 24.1 Permitted analytics

- aggregate search success and zero-result rates;
- corpus/locale coverage;
- publication throughput and bottleneck age;
- correction and withdrawal frequency;
- prayer configuration error/dispute rates;
- translation coverage and review latency;
- platform health and failed jobs;
- content freshness and review-due counts;
- accessibility/performance quality indicators.

### 24.2 Prohibited or restricted analytics

- worship scoring;
- individual prayer, Quran, adhkar, or tasbeeh productivity ranking;
- popularity-driven religious ranking;
- staff leaderboard for review speed;
- unnecessary retention of sensitive search or location data;
- combining Talibeen sensitive data with general product analytics.

### 24.3 Release status

Essential aggregated operational diagnostics are Release 1. Large durable analytics stores, partitioned event systems, experimentation platforms, and AI telemetry are Future / Research unless separately justified.

---

## 25. Audit Logs

Audit is append-only and minimal.

### 25.1 Audited actions

- role and permission changes;
- content create/revise/review/publish/withdraw/correct;
- translation review and publication;
- Quran import and checksum decisions;
- source/license decisions;
- prayer/Hijri configuration changes;
- SEO/redirect overrides;
- media lifecycle changes;
- moderation decisions;
- subscription/balance actions in later modules;
- AI policy/configuration changes in Future / Research;
- emergency actions and break-glass access;
- sensitive administrative reads where policy requires them.

### 25.2 Audit event content

- actor class and identifier;
- capability used;
- action code;
- target type and identifier;
- timestamp;
- correlation/request identifier;
- purpose and scope;
- minimal before/after references or hashes;
- sensitivity classification;
- related approval or incident.

Secrets, tokens, precise location, full sensitive prompts, private notes, and unnecessary content bodies are excluded.

---

## 26. Moderation, Reports, and Appeals — Approved Later Module

Moderation becomes active only when approved workflows such as Talibeen, user correction intake, or user-generated submissions require it.

### 26.1 Moderation capabilities

- privacy-first report intake;
- evidence access controls;
- triage and assignment;
- case timeline;
- decision and action records;
- suspension/restriction controls;
- notification and safety escalation;
- appeal intake and independent review;
- retention and deletion policy;
- audit and conflict-of-interest controls.

### 26.2 Appeals

Appeal reviewers should be distinct from the original decision maker where practical. Appeals never destructively overwrite the original decision; they affirm, modify, reverse, or remand through a new recorded decision.

### 26.3 Religious correction versus moderation

Religious-content corrections remain owned by Content Integrity. Moderation may route a report to the correction workflow but cannot independently rewrite or publish religious content.

---

## 27. Platform Health and Monitoring

### 27.1 Release 1 operational health

- application errors and critical route availability;
- publication transaction failures;
- migration failures and schema drift;
- backup status and restore-test status;
- database connection saturation, slow queries, and lock waits;
- integrity constraint violations;
- search indexing/rebuild failures;
- cache invalidation failures;
- storage/media processing failures where applicable;
- prayer/calendar provider or calculation anomalies;
- suspicious privileged access;
- PWA/offline behavior that could present stale prayer times misleadingly.

### 27.2 Health severity

- informational;
- degraded;
- high impact;
- critical;
- integrity emergency.

Every alert has owner, runbook, escalation path, user-impact statement, and resolution record.

### 27.3 Operational monitoring principles

- no secret values in logs;
- regional and locale dimensions without unnecessary user identification;
- religious-content correctness incidents receive integrity priority;
- monitoring cannot silently change content or configuration;
- long-term metrics are aggregated or minimized.

---

## 28. AI Governance — Future / Research

AI governance is documented but isolated from Release 1.

### 28.1 AI administrative domains

- approved corpus registry and immutable corpus versions;
- model configuration and provider record;
- prompt management and versioning;
- evaluation datasets;
- benchmark and red-team cases;
- refusal-policy cases;
- citation validation;
- AI-assisted draft review;
- runtime trace policy;
- safety incidents and human escalation;
- model/corpus rollback;
- feature flags and kill switch.

### 28.2 Prompt management

Prompts are versioned operational artifacts with:

- purpose;
- model/corpus compatibility;
- owner;
- reviewer;
- prohibited behavior;
- citation contract;
- refusal contract;
- evaluation requirement;
- rollout state;
- rollback target;
- audit history.

Prompt changes never directly authorize religious publication.

### 28.3 Evaluation datasets

Datasets distinguish:

- factual retrieval tests;
- Arabic and multilingual tests;
- citation correctness;
- refusal behavior;
- scholarly-difference handling;
- adversarial prompts;
- sensitive/private query handling;
- hallucination and invented-source detection.

Datasets must not contain fabricated Quran/Hadith as expected truth. Sensitive prompts are minimized and access-controlled.

### 28.4 Citation validation

Citation governance validates:

- cited source exists in approved corpus version;
- identifier resolves to readable canonical source;
- claim scope is supported;
- quote and translation attribution are preserved;
- citation is not invented or stale;
- output distinguishes source text from generated explanation.

### 28.5 Runtime monitoring

Runtime monitoring, if approved later, records minimized metadata needed for:

- refusal rate;
- citation failures;
- unsupported-claim detection;
- model/corpus version;
- safety incident correlation;
- redaction and retention state.

Full sensitive queries are not retained by default.

---

## 29. Operational Analytics, Feature Flags, and Configuration

### 29.1 Feature flags

Feature flags control operational exposure, not content truth.

Every flag has:

- owning module;
- release status;
- environment and region scope;
- default state;
- dependency and safety prerequisites;
- expiry/review date;
- rollback behavior;
- approver;
- audit trail.

A flag cannot bypass religious review, source requirements, authorization, or database integrity.

### 29.2 Configuration changes

Configuration changes follow:

`draft → review → approve → activate → supersede/rollback`

High-risk configuration, including prayer defaults, Hijri adjustments, authentication, billing, AI, or safety controls, requires stronger approval and staged rollout.

### 29.3 Emergency flags

Emergency flags may disable a module, provider, AI runtime, publication channel, notification channel, or unsafe regional configuration. They cannot publish replacement content or erase evidence.

---

## 30. Role Model

The architecture avoids one shared unrestricted administrator role. Operational authority is decomposed into explicit roles and capability scopes.

### 30.1 Core operational roles

| Role | Primary responsibility | Explicit exclusions |
| --- | --- | --- |
| **Editorial Author** | Draft and revise assigned editorial content | Cannot approve religious review or publish own work |
| **Arabic Language Editor** | Arabic language, terminology, typography, and script review | Cannot assert source authenticity without religious/source capability |
| **Language Reviewer** | Review translations/localized editorial content for assigned locales | Cannot publish or change canonical source text |
| **Source & Licensing Steward** | Verify provider, edition, source, license, checksum, and redistribution rights | Cannot independently publish religious content |
| **Religious Reviewer** | Review source claims, classification, authenticity handling, and religious appropriateness | Cannot silently edit content or publish unless separately granted publisher capability |
| **Editorial Coordinator** | Assign work, manage queues, resolve operational blockers | Assignment does not grant approval authority |
| **Publisher** | Execute guarded publication after all required approvals | Cannot waive missing religious/source reviews |
| **Correction Steward** | Triage corrections, coordinate revisions and public disclosures | Cannot rewrite canonical history |
| **Prayer Configuration Steward** | Maintain prayer method and regional defaults | Cannot activate without required configuration approval |
| **Calendar Configuration Steward** | Maintain Hijri methods, adjustments, and events | Cannot claim universal certainty for regional observations |
| **SEO Steward** | Manage canonical, sitemap, redirect, and reviewed metadata decisions | Cannot alter canonical religious truth or rank by payment |
| **Media Steward** | Manage licensed assets, variants, accessibility text, and lifecycle | Cannot approve religious claims contained in media |
| **Search Steward** | Manage deterministic search projections and benchmarks | Cannot mutate canonical content through search tooling |
| **Moderation Reviewer** | Review reports and cases in approved later workflows | Cannot alter religious content outside correction workflow |
| **Appeals Reviewer** | Independently review moderation appeals | Cannot erase original decisions |
| **Security & Privacy Administrator** | Access control, incident response, privacy/deletion operations | Cannot publish religious content |
| **Platform Operator** | Deployments, jobs, backups, monitoring, operational health | Cannot directly modify editorial truth |
| **Role Administrator** | Manage scoped grants under dual control | Cannot grant oneself unrestricted authority |
| **Emergency Commander** | Coordinate declared incidents and break-glass actions | Temporary, audited, and cannot bypass content replacement reviews |
| **Auditor** | Read-only inspection of audit, workflow, and control evidence | No mutation authority |

### 30.2 Religious advisory group

A qualified advisory group is not modeled as one super-role. Members receive scoped reviewer capabilities. Group decisions record participants, quorum or required policy, dissent, evidence, and outcome.

### 30.3 Small-team operation

One person may initially hold several roles, but:

- each action is attributed to the capability used;
- self-review restrictions remain where required;
- high-impact role grants and emergency overrides require another authorized actor or documented exceptional procedure;
- role consolidation is reviewed as staffing grows.

---

## 31. Capability-Based Permission Philosophy

Permissions group around operations, not pages.

### 31.1 Permission dimensions

Every grant may be scoped by:

- capability;
- module;
- content class;
- corpus/edition;
- locale/language;
- region;
- workflow state;
- sensitivity level;
- environment;
- time period;
- assigned target;
- emergency declaration.

### 31.2 Example capabilities

- `content.draft.create`
- `content.revision.update_assigned`
- `source.verify`
- `license.approve`
- `quran.import.review`
- `quran.canonical_text.approve`
- `devotional.authenticated.review`
- `devotional.editorial_general_dua.review`
- `translation.review.locale`
- `religious_review.decide`
- `publication.execute`
- `publication.emergency_withdraw`
- `correction.case.manage`
- `prayer.method.manage`
- `prayer.region_default.approve`
- `hijri.adjustment.approve`
- `seo.redirect.manage`
- `search.projection.rebuild`
- `audit.read.scoped`
- `roles.grant.scoped`
- `moderation.case.decide`
- `ai.prompt.approve`
- `ai.runtime.kill`

### 31.3 Permission rules

- Page access alone never grants action authority.
- Backend/application service authorization is authoritative.
- Permissions are deny-by-default.
- Grants are auditable and revocable.
- Temporary elevated access expires automatically.
- Sensitive reads may require purpose recording.
- No shared credentials or role accounts.
- Break-glass access is separate from ordinary administration.

---

## 32. Workflow Action Contract

Every important administrative action must define the following.

| Dimension | Required definition |
| --- | --- |
| **Who may perform it** | Capability, role, content/locale/region scope, assignment, and separation-of-duty conditions. |
| **Required reviews** | Source, license, language, religious, editorial, security, privacy, or configuration review as applicable. |
| **Approval path** | Exact transitions, approvers, quorum or dual-control rule, and blocked conditions. |
| **Audit trail** | Actor, capability, purpose, target revision/configuration, decision, evidence references, and correlation ID. |
| **Rollback** | Supersession, correction, withdrawal, prior version restoration, feature disablement, or compensating action. |
| **Visibility** | Internal, reviewer-only, preview, scheduled, public, withdrawn, archived, restricted, or sensitive. |

No important action is complete if one of these dimensions is undefined.

---

## 33. Emergency Operations

### 33.1 Emergency classes

- religious-content integrity incident;
- canonical Quran/text corruption;
- unsafe or misleading prayer/Hijri configuration;
- privacy or security breach;
- compromised administrator account;
- broken publication/search/cache delivery;
- provider/license revocation;
- moderation/safety crisis in a later module;
- AI safety incident in Future / Research;
- infrastructure or disaster event.

### 33.2 Break-glass rules

- break-glass is disabled by default;
- activation requires incident identifier and reason;
- access is time-limited and narrowly scoped;
- all actions receive enhanced audit;
- credentials are individual, never shared;
- emergency authority can disable or withdraw but not create unreviewed replacement religious content;
- post-incident review is mandatory.

### 33.3 Emergency content withdrawal

Emergency withdrawal may remove active delivery, invalidate cache/search, and display a controlled unavailable state. It must create a follow-up correction/review case.

### 33.4 Emergency prayer/calendar action

A configuration may be disabled or reverted to a previously approved version. Operators must not improvise new religious/calendar parameters during an incident.

---

## 34. Disaster Procedures

### 34.1 Required preparedness

- encrypted backups;
- point-in-time recovery;
- documented recovery objectives, to be approved separately;
- regular restore drills;
- content revision recovery;
- migration rollback through corrective migrations;
- object-storage recovery procedures;
- secret and key rotation;
- regional/hosting failover decisions where approved;
- communication plan;
- integrity verification after restore.

### 34.2 Recovery order

1. Secure identities and administrative access.
2. Protect canonical Quran and reviewed religious content integrity.
3. Restore database and audit continuity.
4. Validate migrations and constraints.
5. Restore published-content delivery.
6. Validate prayer/Hijri configuration.
7. Rebuild derived search/cache/sitemap projections.
8. Restore optional media and later modules.
9. Complete reconciliation and incident report.

### 34.3 Restore acceptance

A restore is not accepted until:

- checksums and canonical counts pass;
- publication pointers match audited events;
- required reviews remain attached;
- withdrawn content is not accidentally republished;
- permissions and sessions are reconciled;
- audit continuity is explained;
- derived projections are rebuilt from canonical truth.

---

## 35. Future Talibeen Administration — Approved Later Module

Talibeen is a separately authorized privacy-first bounded context.

Potential administration includes:

- verification operations;
- private profile review with purpose-bound access;
- discovery-safe projection review;
- introduction and mutual-acceptance case support;
- family/wali invitation support;
- conversation safety and moderation;
- Exit With Dignity operations;
- sensitive-data deletion and legal/safety exceptions;
- subscription entitlement support;
- explainable recommendation quality review;
- appeals and incident response.

Permanent prohibitions:

- no likes;
- no followers;
- no swipe data;
- no popularity score;
- no public social profiles/comments/feed;
- no leaderboard;
- no addictive engagement administration.

Talibeen staff do not receive general access to Quran/editorial administration merely because they are platform staff.

---

## 36. Future Subscriptions Administration — Approved Later Module

Subscription administration supports approved plan terms, entitlements, provider events, reconciliation, refunds, cancellations, and customer support without storing raw card data.

### 36.1 Approved Talibeen launch terms to preserve

- 14-day free trial;
- payment card required;
- no charge before trial expiry;
- USD 7 covering the first two months after the trial;
- standard monthly price remains TBD.

### 36.2 Administrative controls

- versioned product/plan/price terms;
- provider webhook reconciliation;
- idempotent subscription state transitions;
- entitlement inspection;
- approved manual grant with reason and audit;
- refund/cancellation support;
- launch-term and trial validation;
- financial access segregation;
- no raw card number, CVV, track data, or full payment instrument storage.

Commerce authority cannot influence religious review, search ranking, or publication.

---

## 37. Future Notifications Administration

Notifications are Prepared / Approved Later depending on the workflow.

Capabilities may include:

- notification type registry;
- consent-aware channel policy;
- localized template versions;
- quiet hours and regional timing;
- test preview;
- delivery/failure diagnostics;
- provider configuration;
- emergency disablement;
- audit and retention controls.

Worship notifications must remain calm, optional where required, and free from guilt, streak pressure, scoring, or manipulative urgency.

---

## 38. Release 1 Administrative Capability Set

Release 1 includes only capabilities needed to operate the trustworthy daily foundation.

### 38.1 Content and editorial

- staff identities and scoped editorial grants;
- content draft/revision management;
- source and license verification;
- Quran edition/text/translation stewardship;
- devotional content and collection management;
- Editorial General Dua workflow;
- language and religious review queues;
- guarded publication;
- correction, supersession, and emergency withdrawal;
- version history and comparison;
- minimal audit timeline.

### 38.2 Global and configuration

- locale and geographic-area configuration;
- Arabic/English rollout control while preserving unlimited-language architecture;
- prayer calculation methods and regional defaults;
- Hijri methods, adjustments, and Muslim events;
- public methodology and disclosure checks.

### 38.3 Search, SEO, and operations

- deterministic search projection/relevance operations;
- canonical route, sitemap, `hreflang`, and configuration-based redirects;
- platform health, integrity incidents, backup/migration status;
- release readiness and emergency runbooks.

### 38.4 Explicit Release 1 exclusions

- no Talibeen administration;
- no subscription/payment administration;
- no Alsamad Balance administration;
- no Hadith corpus administration beyond references required by approved devotional evidence;
- no AI runtime administration;
- no semantic embeddings or knowledge graph operations;
- no broad user moderation system;
- no notification delivery operations unless separately approved;
- no generic analytics warehouse.

---

## 39. Prepared Capability Set

Prepared capabilities may be built additively when their corresponding workflows are approved.

- authentication-linked staff/account operations;
- private sync and saved-item support administration;
- content correction submission intake;
- additional locale rollout and translation capacity planning;
- audio/reciter and expanded media administration;
- notification preference/template preparation;
- durable redirects and advanced SEO metadata decisions;
- topic hubs and entity pages;
- expanded search analytics with privacy controls;
- preview scheduling and enhanced workflow coordination where durable persistence is justified.

Prepared status does not imply public exposure.

---

## 40. Approved Later-Module Capability Set

- Hadith corpus import, grades, authorities, translations, review, and publication;
- Talibeen privacy, verification, discovery, introduction, conversation safety, family participation, Exit With Dignity, and moderation;
- subscriptions, payments, entitlements, refunds, and reconciliation;
- Alsamad Balance rules, immutable ledger, adjustments, redemptions, and reconciliation;
- platform-scale moderation, reports, restrictions, and appeals;
- Qibla configuration and support if separately implemented;
- notification delivery operations.

Every later module requires separate implementation approval and must remain isolated from Release 1 administration until authorized.

---

## 41. Future / Research Capability Set

- AI prompt/model/corpus governance;
- evaluation datasets and red-team management;
- runtime citation validation and monitoring;
- AI safety incidents and escalations;
- semantic search and embedding lifecycle;
- knowledge graph curation;
- advanced experimentation;
- large-scale observability/analytics persistence;
- automated source checking or model-assisted editorial suggestions;
- runtime AI feedback processing.

These capabilities cannot publish religious claims autonomously.

---

## 42. Administrative Quality Gates

### 42.1 Release gate

Before Release 1 administration is accepted:

- all religious content workflows enforce required reviews;
- reviewer scopes and separation of duties are tested;
- canonical Quran and translation boundaries are verified;
- Editorial General Dua classification safeguards are verified;
- correction, supersession, withdrawal, and rollback are rehearsed;
- Arabic/English preview and accessibility review are complete;
- prayer/Hijri configuration approval and rollback are tested;
- audit events cover privileged actions;
- backup and restore drills pass;
- deterministic search excludes drafts/withdrawn content;
- no future module is exposed;
- no shared unrestricted administrator role exists.

### 42.2 Ongoing quality review

- periodic role/grant review;
- stale source/license review;
- translation coverage and quality review;
- correction trend analysis;
- prayer/Hijri regional configuration review;
- emergency and disaster drill;
- backup restore test;
- audit sampling;
- search benchmark review;
- dependency/security review;
- AI governance review only if Future / Research work is authorized.

---

## 43. Open Decisions

This architecture intentionally leaves unresolved decisions unresolved.

- exact staff authentication provider;
- exact scholarly/advisory review structure and quorum policy;
- Quran edition/provider and redistribution license;
- initial English translation edition(s) and license;
- whether content evidence requires the optional 31st Release 1 table or can be represented through existing source references;
- exact durable redirect/SEO persistence timing;
- whether licensed audio is included in Release 1;
- exact retention periods;
- PostgreSQL RLS use for sensitive later modules;
- production hosting and recovery objectives;
- moderation staffing and appeal SLAs;
- AI provider/model/search architecture if research is authorized;
- standard Talibeen monthly price after the approved launch terms.

No administrative workflow should guess these decisions.

---

## 44. Final Validation

### 44.1 Product Architecture alignment

- The architecture treats Alsamad as a trusted Islamic knowledge and daily-companion platform.
- Release 1 remains deliberately narrow and guest-first.
- Arabic and English are rollout languages, not a permanent global limit.
- AI remains deferred and non-authoritative.
- No engagement trap, worship gamification, or payment-influenced religious ranking is introduced.

### 44.2 Database Architecture alignment

- Administrative workflows respect PostgreSQL as source of truth and Drizzle as mapping only.
- Single-module ownership and explicit cross-module transactions are preserved.
- The Release 1 schema remains minimal; derived admin queues and dashboards do not require mirror tables.
- Later capabilities expand additively.
- Canonical Quran/Sunnah truth is never duplicated by language.
- Category, verification, review, and publication remain separate.
- Audit, publication, review, financial, and moderation histories remain append-oriented where required.

### 44.3 Content Integrity validation

- Religious publication requires approved human review.
- Quran imports cannot publish directly.
- Authenticated devotional content requires evidence.
- Editorial General Dua remains structurally and operationally distinct.
- Corrections create revisions/supersessions rather than destructive rewrites.
- Emergency withdrawal is reversible and audited.

### 44.4 Governance validation

- Roles have non-overlapping primary responsibilities.
- No shared unrestricted administrator role exists.
- Capability-based, scoped, deny-by-default permissions are documented.
- Every important action defines actor, review, approval, audit, rollback, and visibility.
- Emergency and disaster procedures preserve content integrity.

### 44.5 Global and multilingual validation

- Unlimited locale and region support is configuration-driven.
- Translation pipelines do not duplicate canonical content.
- Language and religious review remain distinct.
- Prayer and Hijri configuration are region-aware and effective-dated.
- SEO, previews, and publication support locale scope.

### 44.6 Complexity validation

- Administrative capabilities correspond to real workflows.
- Release 1 excludes future-module admin surfaces.
- Queues and dashboards are derived where possible.
- No generic settings, generic CMS blob, generic super-admin, or speculative persistence is authorized.

### 44.7 Implementation boundary validation

This document contains architecture only. It creates no application code, UI, migration, database, commit, push, pull request, or deployment.

---

## 45. Approval Effect

Approval of this document authorizes it to serve as the administration-architecture baseline only. It does not authorize implementation.

Any implementation phase must separately identify:

- the approved release status;
- exact workflows in scope;
- modules and database records involved;
- permission and review requirements;
- test and rollback plan;
- privacy and retention impact;
- operational owner;
- explicit exclusions.
