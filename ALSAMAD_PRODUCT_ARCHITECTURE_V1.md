# Alsamad — Product, Information Architecture & Design System

**Version:** 1.0 — Approved architecture baseline (originated as the Release 1 planning baseline)
**Domain:** al-samad.com  
**Status:** Approved architecture baseline. Core Release 1 is the initial delivery scope; later ecosystem modules are approved architecture with separately scheduled implementation. Deferred means not yet scheduled, not rejected. Only items explicitly marked **Pending Decision** remain unresolved.
**Release 1 rollout languages:** Arabic (RTL), English (LTR). The permanent architecture supports unlimited languages as first-class experiences.

## Capability status vocabulary

- **Release 1:** Included in the initial trustworthy daily-companion delivery.
- **Prepared:** Architectural or technical foundation exists, but public exposure is optional for Release 1.
- **Approved Later Module:** Approved product architecture on a separate release track.
- **Future / Research:** Gated capability requiring evidence, evaluation, licensing, safety, or further design.
- **Deferred:** Not scheduled in the current release; the capability is not rejected.
- **Pending Decision:** A genuine unresolved choice that must be approved before the affected implementation.

Implementation timing never changes whether an architectural decision is approved.

## Terminology registry

| Canonical term                                 | Meaning                                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Sakīnah Design System**                      | Alsamad's calm visual, interaction, accessibility, and content-design system. “Sakīnah Points” is not the canonical reward term. |
| **Alsamad Balance**                            | The ecosystem participation and redemption balance. It never assigns worldly point value to worship itself.                      |
| **Talibeen Al-Halal / طالبين الحلال**          | The privacy-first Islamic marriage product and separate approved release track.                                                  |
| **Alsamad Knowledge Engine**                   | The authoritative internal knowledge discovery, deterministic search, semantic retrieval, and AI-search architecture.            |
| **Alsamad Content Integrity Framework**        | The authoritative taxonomy, provenance, review, publishing, correction, versioning, and lifecycle policy.                        |
| **Alsamad Global Architecture**                | The authoritative global, country, locale, language, time-zone, prayer, calendar, and regional configuration model.              |
| **Alsamad SEO & Discoverability Architecture** | The authoritative external discoverability architecture.                                                                         |
| **Alsamad Governance Architecture**            | The ecosystem constitution for trust, religious integrity, privacy, quality, and stewardship.                                    |

Canonical religious-content categories are **Quran**, **Authentic Sunnah**, **Quranic Dua**, **Prophetic Dua**, **Authenticated Dhikr**, **Editorial General Dua**, **Editorial Article**, **Educational Guide**, **AI-Assisted Draft**, and **Archived Content**. Verification and display states are separate: **Verified Quran**, **Verified Sunnah**, **Editorial**, **General Dua**, **AI Assisted**, **Under Review**, **Archived**, and **Withdrawn**. A content category must never be confused with its verification status.

## Table of contents

- [Part I — Product Foundation and Release 1](#part-i--product-foundation-and-release-1)
  - [Executive direction](#1-executive-direction)
  - [Product principles](#2-product-principles)
  - [Assumptions and clarifications](#3-assumptions-and-clarifications)
  - [Release 1 scope and capability boundaries](#4-release-1-scope-and-capability-boundaries)
  - [Release 1 information architecture](#5-release-1-information-architecture)
  - [Content Integrity supporting domain and data model](#6-content-integrity-supporting-domain-and-data-model)
  - [Technical foundation](#7-technical-foundation)
  - [Sakīnah Design System](#8-sakīnah-design-system)
  - [Release 1 implementation plan](#9-release-1-implementation-plan)
  - [Release 1 quality gates](#10-release-1-quality-gates)
  - [Release 1 risks and mitigations](#11-release-1-risks-and-mitigations)
- [Part II — Product Modules](#part-ii--product-modules)
  - [Talibeen Al-Halal / طالبين الحلال](#talibeen-al-halal--طالبين-الحلال)
  - [Alsamad Knowledge Engine](#alsamad-knowledge-engine)
- [Part III — Cross-Cutting Platform Architecture](#part-iii--cross-cutting-platform-architecture)
  - [Alsamad Content Integrity Framework](#alsamad-content-integrity-framework)
  - [Alsamad Global Architecture](#alsamad-global-architecture)
  - [Alsamad SEO & Discoverability Architecture](#alsamad-seo--discoverability-architecture)
  - [Shared Accessibility Requirements](#shared-accessibility-requirements)
  - [Shared AI Safety and Transparency Requirements](#shared-ai-safety-and-transparency-requirements)
- [Part IV — Governance, Quality and Stewardship](#part-iv--governance-quality-and-stewardship)
  - [Alsamad Governance Architecture](#alsamad-governance-architecture)
  - [Governance Roles and Readiness](#governance-roles-and-readiness)
- [Appendix — Original Release 1 Approval Record](#appendix--original-release-1-approval-record)

# Part I — Product Foundation and Release 1

## 1. Executive direction

Alsamad should be built as a trusted Islamic knowledge and daily-companion platform, not as a collection of disconnected pages. Its moat is the combination of verified source lineage, exceptional Arabic-first reading, calm daily utility, transparent search, and a content architecture that can be translated without duplicating religious truth.

The first release should be deliberately narrow: Quran reading, authenticated duas and adhkar, prayer times, Hijri calendar, tasbeeh, daily content, and unified search. Authentication is architecturally prepared but should not block the core reading experience. AI-assisted answers should not ship in the first public release until the source corpus, scholarly review workflow, retrieval quality, citation guarantees, and refusal behavior are validated.

## 2. Product principles

1. **Source before interface:** Every religious item has canonical text, source evidence, grading/review state, edition/version, and correction history.
2. **Arabic is canonical, not decorative:** Arabic text receives first-class typography, shaping, accessibility, and QA. Translation never silently replaces the original.
3. **Trust is visible:** Users can inspect sources, translators, hadith grading where applicable, calculation method, and last review date.
4. **Utility without noise:** No engagement traps, vanity counters, intrusive ads, or gamification of worship.
5. **Global by construction:** Locale, script direction, time zone, madhhab-sensitive options, prayer calculation methods, units, and content availability are explicit domain concepts.
6. **Progressive complexity:** Guests can read immediately; preferences and accounts add value but never gate worship content.
7. **Accessible devotion:** Keyboard navigation, screen readers, reduced motion, scalable Arabic text, high contrast, and low-bandwidth behavior are release requirements.
8. **AI never becomes an authority:** Generated language is clearly labeled and constrained to verified retrieved evidence with citations.
9. **Mobile First, Desktop Excellent:** ALSAMAD is a Mobile First product. The phone experience is the permanent reference implementation for every screen, component, interaction, navigation flow, and reading experience; desktop expands that experience with more space, never with additional complexity or a competing design reference. This reflects the expected audience of approximately 85–95% mobile and 5–15% desktop, arriving predominantly from Android and iPhone. See `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §2.12 and §43 for the authoritative design contract.

## 3. Assumptions and clarifications

### 3.1 “Important Duas” is too subjective

Replace it in navigation with **Duas**, then organize by verified context: daily life, worship, protection, hardship, travel, family, forgiveness, and Quranic duas. “Essential” may be a curated collection with documented editorial criteria.

### 3.2 Prayer times are not one universal value

Results depend on location, calculation authority/method, high-latitude rule, Asr convention, elevation, and adjustments. The product must always show the active method and allow changes. In Norway and other high-latitude regions this is a trust-critical feature.

### 3.3 The Hijri date is not globally identical

The calendar must distinguish calculated dates from local or authority-announced dates and offer a user-visible adjustment without claiming universal certainty.

### 3.4 AI search should not launch merely because search exists

Release 1 ships deterministic lexical/full-text search with filters and source cards. Runtime generative religious answers are **Future / Research** and gated until they pass retrieval, citation, refusal, evaluation, monitoring, and disclosure requirements.

### 3.5 Accounts are useful, but not first-page value

Authentication should initially support synced preferences, bookmarks, reading position, and private routines. Do not require signup to use Quran, duas, prayer times, calendar, search, or tasbeeh.

### 3.6 Monetization must never influence religious answers

Sponsored material, commerce, donations, and editorial content require hard visual and data boundaries. No ranking based on payment. No ads inside Quran verses, duas, adhkar, or prayer flows.

## 4. Release 1 scope and capability boundaries

This section is authoritative for the Core Release 1 daily companion. Approved Later Modules remain part of the permanent architecture but follow separate release tracks. Deferral here is an implementation-timing decision, never an architectural rejection.

### Release 1 — Trustworthy daily foundation

- Home / Today
- Quran: surah index, reading view, verse detail, approved text and translations, tafsir, translation footnotes, structural navigation, chapter information, and conditionally activated audio
- Adhkar: morning and evening
- Duas: browse, collection and detail
- Prayer times with method disclosure and settings
- Islamic calendar with date qualification
- Digital tasbeeh stored locally
- Daily dua/content card
- Unified deterministic search
- Arabic and English as Release 1 rollout languages; the architecture supports unlimited first-class languages
- Theme, text-size and reading preferences
- Installable PWA foundation and offline shell
- Editorial/admin foundation for verified content

### Prepared

- Authentication and private sync
- Bookmarks and reading progress
- Notification preferences
- Audio manifests and reciter catalog
- Additional locales
- Content correction submissions

### Deferred or approved later

- Generative AI answers
- Social feed, comments, likes, and public social profiles. Talibeen's controlled private marriage profiles are not public social profiles.
- Fatwa generation or personalized religious rulings
- User-submitted religious content without moderation
- Commerce and advertising in the Core Release 1 daily companion. This does not alter Talibeen Al-Halal's separately approved subscription model.
- Full hadith corpus and Islamic courses are **Approved Later Module** capabilities until licensing and review pipelines are ready.
- Talibeen Al-Halal is an **Approved Later Module** on a separate release track.
- The Qibla Engine is an **Approved Later Module** unless separately scheduled.

## 5. Release 1 information architecture

### 5.1 Primary navigation

| Destination | Arabic  | Purpose                                                                |
| ----------- | ------- | ---------------------------------------------------------------------- |
| Today       | اليوم   | Daily dashboard: prayer, daily dua, continue reading, adhkar shortcuts |
| Quran       | القرآن  | Browse, read, listen-ready, translations and verse sources             |
| Adhkar      | الأذكار | Morning, evening and later contextual collections                      |
| Duas        | الأدعية | Verified supplications by need and source                              |
| Prayer      | الصلاة  | Prayer times, next prayer, method and location controls                |
| More        | المزيد  | Calendar, tasbeeh, learning, settings and about/trust                  |

Navigation is designed Mobile First: the phone information architecture is authored first, and desktop expands it rather than redefining it. On mobile, use a restrained bottom navigation with no more than five destinations, each reachable one-handed within comfortable thumb reach; Search opens as a global command/search surface. On desktop, Calendar and Search may be promoted to the primary header, and keyboard shortcuts are added, but the underlying information architecture and destination set remain identical to mobile.

A future ecosystem-wide bottom navigation shape of Home, Quran, Search, Journey (Talibeen Al-Halal), and Profile is under evaluation once device testing and the Talibeen release track justify it; see `UNRESOLVED_DESIGN_DECISIONS.md` item 7. Any such change must preserve the Release 1 destination table above and follow the Sakīnah Design System's navigation-component contract in `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §25.

### 5.2 Release 1 route examples

For the Release 1 Arabic and English rollout, use explicit locale prefixes such as `/ar/...` and `/en/...`. These are rollout examples, not permanent global limitations: every configured language is a first-class locale under the Alsamad Global Architecture. The root `/` performs locale negotiation once, with a visible language switcher and a persistent preference. Localized slugs require redirects and canonical mapping; stable technical slugs are safer for launch.

```text
/{locale}
├── /quran
│   ├── /[surah]
│   └── /[surah]/[ayah]
├── /adhkar
│   ├── /morning
│   └── /evening
├── /duas
│   ├── /collections/[slug]
│   └── /[dua]
├── /prayer-times
├── /islamic-calendar
├── /tasbeeh
├── /search
├── /learn                         (future)
├── /hadith                        (future)
├── /bookmarks                     (account/optional)
├── /settings
├── /sources
├── /methodology
├── /corrections
├── /about
├── /privacy
└── /terms
```

### 5.3 Page blueprints

#### Home / Today

1. Contextual greeting without pretending religious significance
2. Next prayer with location and method disclosure
3. Morning/evening adhkar action based on local time
4. Daily dua with Arabic, translation, audio-ready action, source
5. Continue Quran reading (only if state exists)
6. Fast actions: Quran, duas, calendar, tasbeeh
7. Trust statement and source methodology, low on page

The home page should adapt modestly to time and preferences, not become an algorithmic feed. The Home/Today composition is designed Mobile First: it is authored once for the phone viewport and desktop inherits and expands that same composition. There is exactly one Homepage design, not a separate desktop concept.

#### Quran

- Surah index with Arabic name, translated name, verse count and revelation classification
- Reading layout optimized for one-column focus
- Verse actions: translation, tafsir-ready reference, audio, copy, share canonical link, bookmark
- Mushaf-style and reading-style presentation can be separate modes later
- Never insert promotional content between verses

The Quran Reader is primarily a mobile reading experience: one-handed reading, comfortable typography, large touch targets, minimal distractions, reading controls kept within thumb reach, and an uninterrupted reading flow are Release 1 requirements, not later refinements. Desktop may add a surah/navigation sidebar, a wider reading column, and keyboard shortcuts, but it must preserve the same reading experience rather than replace it. See `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §31–32 for the component-level contract.

#### Adhkar

- Collection introduction and source methodology
- Progress is private and local by default
- Each item: Arabic, diacritics policy, transliteration optional, translation, count, source, authenticity/review status
- Completion language is calm; avoid worship “scores” or competitive streaks

#### Duas

- Search and browse by context
- Detail pages with canonical Arabic, translation, transliteration preference, source evidence, notes, copy/share, optional audio
- Clearly separate Quranic duas, Prophetic duas, and general permissible supplications

#### Prayer Times

- Current location label, date, next prayer and day schedule
- Method/authority always accessible next to the times
- Manual city search must work without geolocation
- Qibla is a later feature unless sensor and accuracy UX are properly handled

#### Islamic Calendar

- Gregorian/Hijri paired view
- Clear label for calculation/authority and local adjustment
- Events are editorial content with source and regional qualification

#### Tasbeeh

- Immediate, distraction-free counter
- Haptic/sound optional and off or subtle by default
- Reset confirmation, target optional, local persistence
- No public leaderboard or worship claims

The Release 1 Search page blueprint is consolidated under **Alsamad Knowledge Engine → Release 1 deterministic search experience**.

## 6. Content Integrity supporting domain and data model

This section implements the domain and data requirements of the authoritative **Alsamad Content Integrity Framework**. It does not define a second publishing or governance policy.

### 6.1 Canonical truth versus presentation

Store canonical religious works and references independently from translations and UI content. A Quran verse is one canonical entity; its translations are attached editions, not duplicate verses. A dua or dhikr may cite one or more source references and carry an editorial review record.

### 6.2 Core content entities

| Entity                           | Responsibility                                                           |
| -------------------------------- | ------------------------------------------------------------------------ |
| `work`                           | Canonical corpus/edition: Quran, hadith collection, editorial collection |
| `passage`                        | Stable canonical unit such as ayah or hadith record                      |
| `passage_text`                   | Script/edition-specific canonical text with checksum and provenance      |
| `translation_edition`            | Translator, publisher, language, license and version                     |
| `translation_text`               | Translation attached to a stable passage and edition                     |
| `source_reference`               | Structured citation to Quran, hadith or scholarly/editorial source       |
| `devotional_item`                | Dua/dhikr content independent of its placement in collections            |
| `collection` / `collection_item` | Ordered morning, evening or thematic grouping                            |
| `review_record`                  | Reviewer role, decision, notes, date and superseded version              |
| `content_revision`               | Immutable audit trail and rollback target                                |
| `localized_content`              | Non-canonical editorial UI/description translations                      |
| `prayer_method`                  | Authority, parameters, region, version and disclosures                   |

### 6.3 Required provenance fields

- Source owner/provider and import date
- License and redistribution rights
- Edition/version identifier
- Canonical checksum
- Reviewer and review state
- Effective and superseded dates
- Correction/audit history
- Translation attribution
- Hadith grading authority where relevant; never collapse differing grades into one hidden value

### 6.4 Content workflow enforcement

The single authoritative lifecycle is **Content Integrity Editorial Workflow**. This technical layer enforces its conditional stages, role gates, immutable audit history, previews, reversibility, and emergency withdrawal. No religious content moves directly from import to public.

### 6.5 Runtime AI technical safety contract

- Retrieval only from approved, versioned corpora
- Citations at claim level linking to readable source pages
- No invented citation identifiers
- Quote/translation attribution preserved
- Uncertainty and scholarly differences stated
- Refuse personalized fatwa, takfir, medical/legal danger, or unsupported claims; route users to qualified scholars when appropriate
- Generated answers visually distinct from source text
- Full evaluation suite, red-team set and sampled human review before launch
- Retrieval/source versions and answer telemetry retained without unnecessarily storing sensitive user queries

## 7. Technical foundation

### 7.1 Recommended stack

| Layer         | Decision                                                | Reason                                                                  |
| ------------- | ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Web           | Next.js App Router + TypeScript                         | SSR/SSG, metadata, streaming, mature deployment ecosystem               |
| UI            | Tailwind CSS + shadcn/ui primitives                     | Accessible primitives with full visual ownership                        |
| Database      | PostgreSQL                                              | Relational integrity, multilingual search, extensions, scale path       |
| Data access   | **Drizzle ORM + SQL migrations**                        | Thin, explicit SQL control; strong fit for complex content/query models |
| Validation    | Zod at system boundaries                                | Shared runtime contracts without trusting TypeScript alone              |
| Auth          | Provider-agnostic adapter; Auth.js-compatible           | Avoid locking domain logic to an identity vendor                        |
| Search R1     | PostgreSQL FTS + `pg_trgm`; Arabic normalization column | Reliable launch scope; avoid premature search infrastructure            |
| Search later  | OpenSearch/Typesense/Meilisearch after evidence         | Add only when corpus/traffic/faceting requires it                       |
| Cache         | CDN/Next cache; Redis only when proven                  | Static religious content should be edge-cacheable                       |
| Storage       | S3-compatible object storage                            | Audio, images, exports; keep binaries out of PostgreSQL                 |
| Observability | Structured logs, traces, web vitals, error monitoring   | Diagnose correctness and regional performance                           |
| Testing       | Vitest + Testing Library + Playwright + axe             | Logic, UI, journeys and accessibility                                   |

### 7.2 System boundaries

Start with a modular monolith. It is operationally simpler but enforces domain boundaries that can later be extracted.

```text
apps/web
packages/
  ui
  config
  i18n
  database
  observability
modules/
  quran
  devotional-content
  prayer
  calendar
  search
  identity
  preferences
  editorial
  provenance
  notifications          (later)
  ai-retrieval           (future, isolated)
```

Each module owns its schema mappings, services, policies, queries, events and tests. UI may compose public application services but must not query another module's tables ad hoc. Cross-module writes use explicit services and transaction boundaries.

### 7.3 Rendering and caching

- Quran, dua, adhkar and source pages: static or incrementally regenerated, tagged invalidation after editorial publish
- Prayer times: server-rendered from explicit location/method input, with client enhancement; never cache across mismatched location/method keys
- Tasbeeh: client-local interaction, no server dependency
- Search: server endpoint with rate limits and query timeouts
- Settings/bookmarks: authenticated and private; no shared caching

### 7.4 Global Architecture technical internationalization requirements

The Alsamad Global Architecture is authoritative. These requirements implement it for every configured language and locale, not only the Release 1 rollout examples.

- Locale is a route-level concern, not only client state
- Direction applied at the document boundary (`dir=rtl/ltr`)
- ICU message formatting; no string concatenation
- Locale-aware number/date formatting, while Quran verse identifiers remain semantically stable
- CSS logical properties (`inline-start`, `margin-inline`) everywhere
- Translation fallback is explicit and visibly labeled; never silently show English as Arabic
- UI messages and religious-content translations use separate pipelines

### 7.5 Security and privacy baseline

- Least-privilege roles for editorial, reviewer and admin access
- Passkeys/social/email options can be added without storing passwords if the chosen provider supports them
- CSRF, origin checks, secure cookies, CSP, rate limiting and bot protection at public mutation/search surfaces
- Row-level authorization enforced in services and tested; database roles separated where practical
- Location stays on-device or is stored only with explicit consent; prayer calculation should accept coarse city coordinates
- Tasbeeh and devotional progress local by default
- Audit privileged changes; never log tokens, precise location, private notes or full sensitive queries
- Dependency scanning, secret scanning, backups, point-in-time recovery and restore drills

### 7.6 Performance budgets

- Performance targets are measured on phones first: low-end Android and weak network conditions are the primary test profile for Home/Today, Quran, Search, the reader, Daily Ayah, prayer times, and accessibility, across every route. Desktop optimization never compensates for slow mobile performance.
- Initial route JavaScript target under 170 KB gzip for content pages, reviewed per route
- LCP under 2.5 s at p75 field data; INP under 200 ms; CLS under 0.1
- Self-host/subset fonts responsibly; preload only essential faces
- No hydration for static content that does not require interaction
- Audio is never preloaded without intent

### 7.7 SEO technical requirements

The **Alsamad SEO & Discoverability Architecture** is authoritative for external discoverability. Its technical requirements include server-rendered crawlable content, stable passage anchors and canonical verse URLs, accurate structured data, locale-aware canonicals and reciprocal `hreflang`, corpus/locale sitemap indexes, revision-derived modification dates, and noindex protection for private or low-value surfaces.

### 7.8 Shared accessibility acceptance criteria

- WCAG 2.2 AA target
- Full keyboard use and visible focus
- Screen-reader labels for Arabic controls and verse actions
- Arabic text zoom to 200% without clipping
- Logical reading/focus order in RTL and LTR
- Color is never the sole signal
- Reduced-motion mode; nonessential animation disabled
- Prayer countdowns do not cause noisy screen-reader announcements
- Automated axe tests plus manual NVDA/VoiceOver and RTL QA

## 8. Sakīnah Design System

The visual system should evoke calm, clarity and reverence through proportion and typography, not ornamental overload. Islamic geometric motifs may appear sparingly in empty states, covers or editorial art—not behind long reading text.

### 8.1 Color tokens

REG-0018 freezes these semantic Phase-1 values after reconciliation with the committed frontend. Later replacement requires an explicit reviewed decision; components consume semantic roles rather than raw values.

| Token            |     Light |      Dark | Use                                  |
| ---------------- | --------: | --------: | ------------------------------------ |
| `background`     | `#F8FBF9` | `#07130F` | Page canvas                          |
| `surface`        | `#FFFFFF` | `#0D1D17` | Principal content/reading surfaces   |
| `surface-soft`   | `#EEF5F1` | `#14271F` | Grouped tonal surface                |
| `foreground`     | `#10231B` | `#F3F7F4` | Primary text                         |
| `muted`          | `#617168` | `#A2B0A8` | Secondary text                       |
| `primary`        | `#0F5B43` | `#68BC98` | Primary action and selected state    |
| `primary-strong` | `#083D2D` | `#91D3B4` | Emphasis/hover where contrast passes |
| `primary-soft`   | `#DCECE5` | `#173D2E` | Selected and grouped states          |
| `accent-gold`    | `#9B742B` | `#D3AE62` | Rare trust/source/ceremonial accent  |
| `border`         | `#DBE6E0` | `#263C33` | Dividers and fields                  |
| `danger`         | `#B42318` | `#FF8A80` | Errors only                          |

Gold must be scarce and is not the generic link color. Green signals action, selection, progress, and restrained identity rather than decorating every surface. Most sections remain unframed on the canvas; status never depends on color alone; decorative gradients are exceptional.

### 8.2 Typography

- Phase-1 general/devotional Arabic reading: **Noto Naskh Arabic `NotoNaskhArabic-v2.021`**, regular 400 reading instance, delivered locally under SIL OFL 1.1
- Phase-1 Arabic UI: **Noto Sans Arabic `NotoSansArabic-v2.013`**, using the version-pinned variable asset only at weights 400–800 and default width for current normal and emphasized UI values, delivered locally under SIL OFL 1.1
- English UI: **Inter** or Geist
- Canonical Quran typography remains separate and unbound as `--font-quran`; Noto Naskh Arabic's devotional role is not Quran approval. Quran font/script must be selected from the authenticated edition with full glyph, diacritic, waqf, annotation, shaping, line-breaking, licensing, and cross-platform evidence, not visual taste alone
- Arabic body line height: approximately 1.9–2.1 depending on face; Quran reading adjustable
- English body line height: approximately 1.55–1.7
- User controls: Arabic/Quran size, translation size, translation visibility and transliteration visibility

Never simulate Arabic bold if the face lacks a real weight. Never use letter spacing on joined Arabic text.

### 8.3 Spacing, shape and elevation

- 4 px base scale; common spacing: 4, 8, 12, 16, 24, 32, 48, 64
- Reading column: approximately 680–760 px depending on script and mode
- General content container: 1200–1280 px
- Radius: 12 px controls, 20 px standard cards/surfaces, 32 px feature/modal surfaces only when scale warrants it; pills only for genuinely compact filters, selections, or status roles
- Surface order: canvas/unframed, principal content/reading, grouped tonal, interactive card, floating overlay, feature, then status/source where required
- Separation preference: tonal separation, then border, then shadow
- Shadows are soft, rare, and reserved for real elevation; dark mode uses tonal surfaces and borders, not stronger shadow or glow
- Informational/reading content has no default hover lift; interactive desktop cards prefer border/tone state changes
- Status, category, badge, filter, navigation state, compact action, and source/trust metadata remain semantically distinct rather than sharing one generic pill treatment

### 8.4 Core components

- App header and mobile navigation
- Locale and direction switcher
- Global search command surface
- Reading toolbar
- Verse block and verse-action menu
- Source citation card and authenticity/review badge
- Dua/dhikr card with count and progress
- Prayer time strip and daily schedule
- Method disclosure sheet
- Hijri/Gregorian date pair
- Tasbeeh counter surface
- Daily content card
- Audio player shell
- Text preference sheet
- Empty/error/offline states
- Consent-aware location picker
- Editorial preview frame

Every component needs LTR, RTL, light, dark, mobile, keyboard, loading, empty, error, offline and long-text states where applicable.

### 8.5 Motion and interaction

- Motion duration 120–220 ms for UI feedback; avoid ceremonial animation
- Tasbeeh feedback may use restrained scale/haptic response
- Preserve scroll/reading position across translation and theme changes
- Do not animate verse text during load
- Skeletons should match content geometry and not pulse aggressively

### 8.6 Voice and content design

- Calm, direct, respectful and non-judgmental
- Never claim acceptance, reward, sin, divine intent or a ruling unless quoting a qualified, cited source
- Distinguish translation, transliteration, commentary and generated explanation
- Errors explain what is unavailable and preserve access to cached/known content
- Avoid manipulative reminders such as guilt-based notification copy

## 9. Release 1 implementation plan

No code should be written until this document is approved. After approval, implement in these checkpoints:

### Checkpoint A — Repository and quality foundation

- Next.js/TypeScript strict setup
- Tailwind and shadcn primitives with Alsamad tokens
- ESLint, formatting, type checking, unit and Playwright harness
- Environment validation; CI gates; architecture decision records

### Checkpoint B — App shell and design-system proof

- Locale routing and document direction
- Theme, fonts, responsive header/mobile nav
- Button, field, card, dialog/sheet, tabs, toast, skeleton and focus styles
- Story/demo route covering Arabic/English, light/dark and stress states

### Checkpoint C — Static page prototypes with representative reviewed sample data

- Home, Quran index/reader, adhkar, duas, prayer, calendar, tasbeeh and search
- No complex database logic
- Mobile/desktop visual review and accessibility audit

### Approval gate

Approve navigation, page hierarchy, reading experience, Arabic typography, design tokens, source presentation and mobile behavior before building data ingestion, authentication or advanced logic.

## 10. Release 1 quality gates

- Domain unit tests: prayer input handling, locale normalization, content/version rules
- Database integration tests against real PostgreSQL, including constraints and migrations
- Contract tests for external prayer/audio/content providers
- Visual regression matrix: Arabic/English × light/dark × mobile/desktop
- Accessibility automation plus manual keyboard/screen-reader QA
- Search relevance benchmark including Arabic spelling/diacritic variants
- Editorial publish/rollback/audit tests
- PWA offline tests with no misleading stale prayer times
- Load tests for Quran pages and search before major campaigns
- Backup restore and migration rollback rehearsal before production content import

## 11. Release 1 risks and mitigations

| Risk                                          | Mitigation                                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Incorrect or weakly sourced religious content | Licensed corpora, structured provenance, dual review where needed, public methodology and corrections |
| Disputed prayer/Hijri results                 | Display method/authority, regional defaults, user control and documented uncertainty                  |
| Arabic typography corruption                  | Edition-specific font validation, glyph fixtures, screenshot regression and checksum-protected text   |
| AI hallucination interpreted as religion      | Delay launch, retrieval allowlist, claim citations, refusal policy, evaluation and visible labeling   |
| Translation inconsistency                     | Translation editions with attribution/version; separate UI localization workflow                      |
| Premature infrastructure complexity           | Modular monolith, PostgreSQL search and CDN first; extract only from measured need                    |
| Privacy concerns around worship/location      | Local-first progress, coarse/manual location, consent and minimal retention                           |
| SEO duplication across languages              | Explicit locale URLs, canonicals, hreflang, stable entity mapping                                     |
| Commercial pressure weakening trust           | Governance boundary between revenue, ranking and religious/editorial decisions                        |

# Part II — Product Modules

# Talibeen Al-Halal / طالبين الحلال

**Capability status:** **Approved Later Module** on a separate release track from the Core Release 1 daily companion.

Talibeen Al-Halal is a premium Islamic marriage service within the Alsamad ecosystem. It is not a dating platform. It is designed for serious intentions, privacy, dignity, and marriage—not entertainment.

Its profiles are controlled private marriage profiles, not public social profiles.

The service must remain:

- Calm
- Respectful
- Privacy-first
- Limited to serious marriage intentions
- Free from swipe culture
- Free from likes, followers, popularity rankings, public comments, and social feeds

## Mission and Positioning

### Talibeen Journey First Philosophy

Talibeen Al-Halal must never begin with pricing. The first experience should invite the user to begin a respectful marriage journey.

The primary call to action is:

> Start Your Journey

Pricing is presented only after the user understands the service and reaches the final onboarding step. The platform must sell trust before subscriptions.

### Why Talibeen Al-Halal

Before registration, users should clearly understand what makes Talibeen Al-Halal different:

- No swipe culture
- No likes
- No followers
- No popularity ranking
- No addictive scrolling
- No entertainment-first design
- Privacy before visibility
- Serious marriage intentions only
- Built to help Muslims build families

### Talibeen Vision

Talibeen Al-Halal exists to help Muslims build families, not merely start conversations. Every product decision should support a clear, respectful path toward marriage while protecting the dignity, privacy, and time of everyone involved.

The experience must feel peaceful and premium and remain fully consistent with Alsamad’s Sakīnah design language. Growth or engagement must never be pursued at the expense of seriousness, calmness, trust, or user safety.

### Talibeen Product Mission

**Mission statement:** Talibeen Al-Halal exists to help Muslims build righteous families through trust, privacy, dignity, and thoughtful technology.

Technology serves people. People never serve algorithms.

## Journey and Onboarding

### Talibeen Registration Philosophy

Registration must not feel like completing a long, impersonal marriage application. The experience should use:

- One simple question per screen
- Calm onboarding
- Beautiful, restrained illustrations
- A clear progress indicator
- Friendly, respectful language
- An approximately 2–3 minute initial completion time

The profile is built gradually. Initial onboarding should collect only what is needed to create a meaningful and safe starting profile; additional detail can be added later without overwhelming the user.

## Subscription and Alsamad Balance

### Talibeen Subscription Model

Talibeen Al-Halal offers a **14-day free trial**.

- A payment card is required to begin the trial.
- No charge is made before the trial ends.
- Trial terms, renewal timing, cancellation, and the future recurring price must be disclosed clearly before confirmation.

**Launch Offer:** **USD 7**, covering the first **two months** after the trial.

After the launch period, the service moves to standard monthly pricing, which remains **TBD**.

### Alsamad Balance

Every registered account owns an **Alsamad Balance**. Its purpose is to reward healthy participation in the platform—not worship itself.

Every newly registered account immediately receives an initial Alsamad Balance welcome reward. The balance is visible from the first day.

The platform transparently explains that balance may later unlock premium ecosystem benefits, including Talibeen Al-Halal subscriptions. Users must always be able to see their current balance and understand future redemption goals.

**The platform never assigns worldly value to acts of worship. Worship itself is never assigned worldly point value.** Alsamad Balance may be earned through eligible, non-worship platform participation such as:

- Creating an account
- Completing a profile
- Non-compulsive platform participation that is not based on time spent, streak pressure, popularity, or repetition
- Saving content
- Completing educational journeys
- Using platform tools
- Other eligible platform activities

Alsamad Balance must never be awarded based on:

- Number of Quran verses read
- Number of adhkar recited
- Number of tasbeeh repetitions
- Prayer count

These acts belong to Allah alone and must never be measured, priced, ranked, or converted into platform value.

### Alsamad Balance Redemption

Alsamad Balance may unlock:

- Talibeen Al-Halal subscription access
- Seasonal promotions
- Premium cosmetic profile features
- Supporter badges
- Future ecosystem benefits

Collecting balance is always optional. Subscribing is always optional. Users may choose either path, and neither path should be designed to pressure them into the other.

## Trust, Identity, Privacy, Safety and Family Participation

### Talibeen Privacy Philosophy

Privacy is a fundamental product principle.

- Photos may remain hidden until the user chooses otherwise.
- Profile visibility is configurable.
- Users control what information is displayed.
- Sensitive profile fields remain private by default.

The platform must always collect the minimum amount of information necessary.

### Talibeen Trust Before Matching

Talibeen Al-Halal must prioritise trust before compatibility. Matching quality depends on:

- Verified identity
- Completed profile
- Honesty
- Respectful behaviour
- Meaningful compatibility

Popularity, appearance, and activity metrics must never dominate the recommendation system.

### Talibeen Trust Badges

Permitted trust badge examples include:

- Verified Identity
- Verified Email
- Profile Complete
- Trusted Member
- Community Supporter

Badges communicate platform verification or participation only. They must never imply piety, stronger faith, moral superiority, religious authority, or greater worth before Allah.

### Talibeen Family Participation

Talibeen Al-Halal recognises that marriage is often a family journey, not only an individual one.

Participation by family members is always optional and controlled by the user. Possible trusted participants may include:

- Wali
- Father
- Mother
- Brother
- Sister
- Trusted family representative

Family members must never gain automatic access. The user explicitly chooses whether family participation exists, which person participates, and what information is shared. Private conversations remain private unless both users explicitly decide otherwise.

### Talibeen Safety First

User safety has priority over engagement metrics. Core principles include identity verification, fake-account detection, scam prevention, rapid abuse reporting, respectful communication, moderation by trained reviewers, privacy-first reporting, and permanent removal of abusive accounts when necessary.

The system should actively discourage harassment, deception, and manipulation. Safety is a core product feature rather than an administrative function.

## Personal AI Advisor

### AI Personal Marriage Assistant Policy

The AI Personal Marriage Assistant is optional and opt-in only. It may learn from or use a user’s profile only after the user gives explicit permission. Permission must be understandable, revocable, and limited to the stated purpose.

The assistant may:

- Improve profile writing
- Suggest respectful introductions
- Identify compatibility topics
- Recommend discussion points
- Explain Islamic etiquette using verified Sunni references
- Personalise recommendations

The assistant must never:

- Issue fatwas
- Promise marriage success
- Choose a spouse for the user
- Manipulate compatibility or pressure a decision

AI output must remain advisory, transparent, and subordinate to user judgment. Religious explanations require visible, verified references and must follow Alsamad’s wider AI safety contract.

### Personal AI Advisor Experience

The assistant should not primarily appear as an open chat window. It should feel like a premium personal advisor integrated throughout the user’s journey.

Contextual actions may include:

- Improve my profile
- Suggest respectful introductions
- Explain compatibility
- Suggest discussion topics
- Review my profile

The assistant may proactively help only after the user has given permission. Its presence should resemble a premium personal coach rather than a chatbot, while remaining subject to all limits in the AI Personal Marriage Assistant policy.

## Compatibility and Guided Communication

### Talibeen Compatibility Philosophy

Talibeen Al-Halal must never reduce people to a score such as **“95% Match.”** Compatibility should instead be explained through clear categories:

- Strengths
- Topics to Discuss
- Lifestyle
- Family Goals
- Religious Practice
- Location
- Language
- Future Plans

Where the assistant provides a recommendation, it must explain **why** in plain, respectful language. Categories should help people have thoughtful conversations; they must not imply certainty, divine approval, or guaranteed compatibility.

### Talibeen Mobile-First Principle

Talibeen Al-Halal is designed Mobile First, consistent with the ecosystem-wide product principle. Profile creation, matching, chat, family participation, verification, and notifications must all prioritize phone usability as the reference implementation; desktop expands the same journey with more space and never becomes a separate or primary design target.

### Talibeen Premium Design Principles

Talibeen Al-Halal must not resemble traditional marriage websites. It should feel like a modern premium product while remaining part of the Sakīnah system:

- Minimal
- Elegant
- Calm
- Generous white space
- Large, readable typography
- Rounded cards
- Soft gradients
- Sakīnah colours
- No flashy animations
- No gamification

The interface should create focus and emotional safety, not urgency, competition, or addictive browsing.

### Guided First Conversation

The first conversation should not begin with an empty chat. Instead, the platform provides optional conversation guidance. Suggested topics may include:

- Family goals
- Future plans
- Religious practice
- Lifestyle
- Work-life balance
- Children
- Communication style
- Expectations from marriage

The platform never forces questions. Users may ignore or customise suggestions. The objective is to help respectful and meaningful conversations rather than increase message volume.

### Talibeen Conversation Principles

Communication inside Talibeen Al-Halal should always encourage:

- Honesty
- Kindness
- Respect
- Clarity
- Seriousness

The interface should discourage:

- Meaningless greetings
- Copy-paste introductions
- Spam
- Manipulation
- Emotionally addictive behaviour

Quality of conversation is more important than quantity.

## Success, Exit With Dignity and Family Journey

### Talibeen Success Philosophy

Talibeen Al-Halal is successful when users no longer need it. The objective is marriage, not long-term subscriptions.

The platform should celebrate successful marriages rather than maximize subscription duration.

### Talibeen Success Metrics

The platform should measure success using metrics such as:

- Successful marriages
- User trust
- Profile completion quality
- Verified identities
- Healthy conversations
- Safety reports resolved
- Long-term user satisfaction

The platform must not optimise for:

- Endless scrolling
- Time spent
- Message count
- Addictive engagement
- Popularity metrics

### Exit With Dignity

When a user gets married, they may permanently close their Talibeen Al-Halal profile. The profile disappears from discovery and marriage recommendations stop.

The user’s account remains part of the wider Alsamad ecosystem. The farewell experience should be respectful and may display:

> We ask Allah to bless your marriage and unite you upon goodness.

Future optional family tools may become available without forcing continued participation in Talibeen Al-Halal.

### Talibeen Product North Star

Talibeen Al-Halal should become the most trusted Islamic marriage platform by maximizing:

- Trust
- Privacy
- Dignity
- Compatibility quality
- Successful marriages

It must not maximize:

- Time spent
- Endless browsing
- Engagement metrics
- Addictive behaviours

Every future feature should be evaluated against this philosophy.

### Talibeen Long-Term Family Vision

Talibeen Al-Halal should become the beginning of a family journey. After marriage, Alsamad may introduce optional tools that support the next stages of family life.

Any future family tools must preserve the original marriage-focused philosophy of Talibeen Al-Halal. They must not transform it into a dating network, social feed, popularity system, or entertainment product.

# Alsamad Knowledge Engine

The Alsamad Knowledge Engine is not a traditional search engine. It is the central intelligence layer responsible for discovering, connecting, and navigating trusted Islamic knowledge across the entire Alsamad ecosystem.

Its objective is not simply to find words. Its objective is to help users discover authentic knowledge.

It is the authoritative parent for deterministic search, Quran, Hadith, adhkar, dua and article search, semantic retrieval, the knowledge graph, topic and entity discovery, saved searches, search history, multilingual discovery, and the AI Search Assistant.

## Knowledge Engine Product Vision

Alsamad should become the world’s most trusted Islamic knowledge platform. Searching should feel like exploring knowledge rather than searching documents.

Every search should guide users toward the authentic Quran, authentic Sunnah, and verified educational content.

## Unified Search

One search engine should power the entire platform. Users may search globally or restrict a search to an individual collection.

Supported content types include:

- Quran
- Hadith
- Adhkar
- Quranic Dua
- Prophetic Dua
- Editorial General Dua
- Articles
- Guides
- Family content
- Future educational modules

## Release 1 deterministic search experience

**Capability status:** **Release 1**.

- One sourced query experience across Quran, duas, and adhkar, with Hadith and learning added when their approved corpora are ready
- Arabic normalization for search only; canonical display text is preserved
- Filters by corpus, language, source, and category
- Exact source excerpts and direct results before any synthesized answer
- PostgreSQL full-text search and trigram matching at launch

Deterministic, sourced search launches before generative AI answers. Runtime generative religious answers remain **Future / Research** and gated by the shared AI safety requirements.

## Quran Search

Quran search should support multiple modes:

- Text Search
- Exact Match
- Phrase Search
- Starts With
- Ends With
- Contains
- Nearby Words
- Root-Based Search (future)
- Morphological Search (future)
- Semantic Search (future)

Each result should include:

- Surah name
- Verse number
- Juz
- Hizb
- Page
- Makki or Madani classification
- Highlighted matching text
- Quick actions
- Copy
- Bookmark
- Share
- Open full Surah

## Quran Filters

Quran results should support filtering by:

- Surah
- Juz
- Hizb
- Page
- Makki
- Madani
- Sajdah
- Verse number
- Keyword
- Exact phrase
- Topics (future)

## Hadith Search

**Capability status:** **Approved Later Module** until the full corpus, licensing, authenticity metadata, and review pipeline are ready.

Hadith search should support:

- Book
- Chapter
- Narrator
- Scholar
- Authenticity grade
- Topic
- Keywords
- Collections
- Semantic search (future)

Every result must clearly display its authenticity information.

## Adhkar Search

Adhkar may be searched by time, category, situation, keyword, and source. Supported contexts may include morning, evening, travel, food, sleep, prayer, mosque, and other verified categories.

## Dua Search

Dua search must maintain separate discovery paths for:

- Quranic Dua
- Prophetic Dua
- Editorial General Dua

Editorial General Dua content must always remain visually separated from authenticated religious texts.

## Article Search

Articles should be searchable by:

- Category
- Tags
- Author
- Topic
- Language
- Reading time

## Cross Knowledge Results

Knowledge should be interconnected rather than presented as isolated documents. A search for **Patience**, for example, may produce:

- Relevant Quran
- Relevant Hadith
- Relevant Duas
- Relevant Adhkar
- Relevant Articles
- Related topics

The result experience should help users discover the relationships among trusted knowledge across the platform.

## Knowledge Graph

Alsamad should maintain an internal knowledge graph. Entities may include:

- People
- Prophets
- Places
- Concepts
- Acts of worship
- Topics
- Islamic events

Every entity should link naturally to related knowledge across the platform. For example, **Patience** may link to Quran, Hadith, Duas, Articles, Family, Hope, Trials, and Trust in Allah.

## Semantic Search

**Capability status:** **Future / Research**.

Future AI-powered semantic search should understand meaning rather than rely only on keywords. It should support natural-language intentions such as:

- Verses about patience
- How to deal with sadness
- Duas for anxiety
- Mercy of Allah
- Parents’ rights

The engine should retrieve relevant verified content even when the exact words differ. Semantic search results must always be clearly distinguished from exact text matches.

## AI Search Assistant

**Capability status:** **Future / Research** and gated runtime AI assistance.

The AI Search Assistant must never invent religious evidence. It may only explain content retrieved from the approved corpus with claim-level citations where applicable.

If evidence is unavailable, it must explicitly state that no verified source was found. The assistant should reference the Quran and authentic Sunnah whenever possible, never issue independent fatwas, and never present runtime output as pre-approved religious content.

## Search Experience

The experience should resemble premium modern search products while preserving the calm Sakīnah design language. It should be:

- Fast
- Minimal
- Clean
- Mobile-first
- Supported by instant suggestions
- Accessible through keyboard shortcuts
- Accessible through a command palette
- Presented with beautiful typography
- Enhanced by calm animations
- Built around large, readable result cards

## Search Suggestions

While typing, users may receive intelligent suggestions drawn from:

- Surahs
- Hadith books
- Topics
- Duas
- Adhkar
- Popular searches
- Private search history, when enabled
- Bookmarks

## Search History

Users may optionally enable:

- Recent searches
- Saved searches
- Pinned searches

Search history is private.

## Knowledge Collections

Users may save search results into personal collections. Example collections include:

- Ramadan
- Marriage
- Children
- Patience
- Travel
- Hajj
- Learning

## Multi-language Search

The architecture supports unlimited first-class languages through configuration. Arabic and English are Release 1 rollout languages, and Norwegian is a later rollout example—not an architectural limit. A query in any configured language should discover Arabic Islamic content where reviewed translations or cross-language mappings exist.

## Knowledge Engine Accessibility

Knowledge discovery must remain accessible for everyone through:

- Keyboard navigation
- Screen-reader support
- Large-text support
- High contrast
- RTL and LTR support

## Knowledge Engine Product Philosophy

Google helps users search the web. Alsamad helps users discover authentic Islamic knowledge.

Knowledge comes before algorithms. Authenticity comes before popularity. Trust comes before engagement.

## Knowledge Engine Product North Star

The Alsamad Knowledge Engine should become the world’s most trusted Islamic knowledge discovery platform.

Every future search feature must strengthen:

- Trust
- Authenticity
- Speed
- Understanding
- Discovery
- Accessibility

The Knowledge Engine must never optimize for engagement addiction or endless scrolling.

# Part III — Cross-Cutting Platform Architecture

# Alsamad Content Integrity Framework

The Alsamad Content Integrity Framework ensures that every piece of knowledge published within Alsamad remains transparent, reviewable, traceable, and trustworthy.

Trust is a core product feature.

This framework is the authoritative owner of content taxonomy, source provenance, religious-content classification, canonical text handling, publication and review workflows, version and correction history, editorial separation, AI-assisted content transparency, and the complete content lifecycle. The earlier supporting domain and data model implements this framework and does not compete with it.

## Content Categories

Every item belongs to one canonical architectural category:

- Quran
- Authentic Sunnah
- Quranic Dua
- Prophetic Dua
- Authenticated Dhikr
- Editorial General Dua
- Editorial Article
- Educational Guide
- AI-Assisted Draft
- Archived Content

Every category follows its own publishing rules.

## Content Labels

Category and verification status are separate fields. Every page must clearly display the applicable state through a label such as:

- Verified Quran
- Verified Sunnah
- Editorial
- General Dua
- Educational
- AI Assisted
- Under Review
- Archived
- Withdrawn

The label must always remain visible. Users should never have to guess the origin of content.

## Source Transparency

Every religious source must expose its origin and all applicable reference information, including:

- Surah
- Verse
- Hadith collection
- Book
- Chapter
- Hadith number
- Authenticity grade
- Scholar

Editorial content must clearly state that it is not transmitted religious text.

## Content Integrity Editorial Workflow

This is the only authoritative publishing lifecycle:

`Draft → Source Verification → Language Review → Religious / Scholarly Review when required → Editorial Approval → Published → Correction Required → Corrected / Superseded → Archived or Withdrawn when necessary`

Not every content category requires every stage. Publishing permissions are role-gated, audited, reversible, and conditional:

- Quran text requires edition identity, checksum, provenance, and publishing approval.
- Hadith requires a structured source reference and authenticity metadata.
- Religious explanations may require qualified religious or scholarly review and must use verified Sunni references.
- Editorial General Dua requires editorial review and religious-appropriateness review; it remains visibly separate from transmitted text.
- Non-religious UI copy does not require scholarly review.

No religious content moves directly from import to public. Emergency withdrawal is supported, and previous versions remain recoverable.

## Version History

Every published item maintains a complete version history that records events such as:

- Created
- Updated
- Reviewed
- Published
- Archived

Previous versions remain recoverable.

## Review History

Every content item stores a review history containing:

- Reviewer
- Review date
- Review notes
- Reason for update

## Content Corrections

Users may report:

- Incorrect references
- Language mistakes
- Translation mistakes
- Broken links
- Formatting issues
- Potential religious inaccuracies

Every report enters a review workflow.

## Editorial Notes

Editorial notes must be visually separated from religious content. Editorial explanations must never appear as revealed text.

## AI Transparency

Whenever AI contributes to content generation or editing, that contribution must remain transparent.

AI may assist. Humans approve AI-assisted published content before publication. AI never becomes the final authority. Runtime AI assistance is governed separately and is never represented as pre-approved religious content.

## Authenticity Policy

Alsamad never invents:

- Hadith
- Quranic verses
- Religious rewards
- Virtues
- Islamic rulings
- Unsupported religious claims

If authenticity cannot be verified, the platform explicitly says so.

## Trust Principles

- Trust comes before speed.
- Accuracy comes before quantity.
- Verification comes before publication.
- Transparency comes before convenience.

## Future Community Contributions

Future community contributions may exist. Community content never becomes verified religious knowledge automatically, and editorial review remains mandatory.

## Content Integrity Lifecycle

Every piece of content moves through a complete lifecycle:

1. Creation
2. Review
3. Publication
4. Maintenance
5. Revision
6. Archiving
7. Withdrawal when necessary
8. Deletion only when legally, ethically, and operationally appropriate

## Content Integrity Product Philosophy

Knowledge is an amanah. Technology exists to protect that amanah.

Every architectural decision should increase:

- Trust
- Transparency
- Traceability
- Authenticity
- Long-term maintainability

# Alsamad Global Architecture

Alsamad is designed as a global Islamic platform from day one.

No country is treated as the primary market. Every supported country receives the same quality standards.

This module is authoritative for unlimited first-class languages, countries, cities, locales, RTL/LTR direction, time zones, prayer defaults, Hijri preferences, Qibla regional behavior, date/time/number formatting, and future regional configuration. Rollout varies by release, but the architecture is global from day one.

## Global First Philosophy

The platform should adapt to the user. The user should never need to adapt to the platform.

Localization should happen automatically whenever possible while always allowing manual control.

## Countries

Support all countries worldwide. Each country may define:

- Default language
- Prayer calculation method
- Time zone
- Hijri calendar preferences
- Regional settings
- Currency (future)

## Cities

Cities should be searchable worldwide. Users may manually choose any city regardless of their current location.

Location changes should update relevant services automatically.

## Languages

The architecture supports unlimited first-class languages. No supported language is treated as secondary.

Future languages should require configuration rather than architectural changes.

## Regional Configuration

Every region may define:

- Default language
- Fallback language
- Prayer calculation defaults
- Date formatting
- Time formatting
- Number formatting
- RTL or LTR layout

## Islamic Calendar Engine

The platform includes a dedicated Islamic Calendar Engine. Its responsibilities include:

- Hijri calendar
- Gregorian calendar
- Date conversion
- Islamic events
- Islamic months
- Future moon-sighting configuration
- Countdowns

## Muslim Events

The calendar should support events such as:

- Ramadan
- Eid al-Fitr
- Dhul Hijjah
- Day of Arafah
- Eid al-Adha
- Muharram
- Ashura
- The White Days
- Sacred Months
- Important Islamic seasons

The architecture should support regional visibility where applicable.

## Prayer Engine

The Prayer Engine is responsible for:

- Prayer times
- Sunrise
- Sunset
- Middle of the Night
- Last Third of the Night
- Prayer calculation methods
- Asr calculation method
- Manual offsets
- Offline calculations

Norway is a useful high-latitude prayer-calculation example, not a primary market. No country is treated as the primary country.

## Qibla Engine

**Capability status:** **Approved Later Module** unless separately scheduled.

The Qibla Engine is responsible for:

- Qibla direction
- Compass support
- GPS support
- Manual city selection
- Future augmented reality support

## Time Zones

Automatically detect time zones and allow manual override.

Travel should automatically update local services.

## Localization

Localization affects:

- Language
- Formatting
- Prayer times
- Calendar
- Regional preferences
- Search
- Content recommendations

## Future Expansion

Future global expansion should not require architectural redesign. New countries, languages and regions should integrate through configuration.

## Global Architecture Product Philosophy

Islam is global. Alsamad should feel local everywhere.

Technology should remove geographical barriers rather than create them.

## Global Architecture Product North Star

Every Muslim, anywhere in the world, should feel that Alsamad was built for them.

# Alsamad SEO & Discoverability Architecture

This module defines how Alsamad becomes globally discoverable without compromising trust, quality, or user experience.

## Core SEO Principle

“Search engines are important, but they are not the primary audience. Every page must first provide genuine value to people. Strong SEO should emerge naturally from high-quality information architecture, trusted content, semantic relationships, accessibility, and excellent user experience—not from manipulative optimization techniques.”

This principle governs all SEO decisions across Alsamad.

The human-first SEO principle is permanent and may not be weakened by traffic or ranking goals.

## Human-First Discoverability

SEO must never reduce religious content to keyword-targeted pages with little value.

Every indexable page must:

- Serve a clear user need
- Provide original or meaningfully structured value
- Expose trustworthy sources
- Be readable and accessible
- Avoid duplication
- Avoid clickbait
- Avoid search-engine-only wording
- Avoid manipulative keyword repetition

## SEO Information Architecture

Design stable, crawlable content routes for:

- Quran
- Quran Surahs
- Quran Ayahs
- Hadith
- Hadith Collections
- Hadith Books
- Hadith Chapters
- Duas
- Adhkar
- Articles
- Guides
- Topics
- People and Prophets
- Places
- Islamic Events
- Family content
- Marriage guidance
- Source and methodology pages

Routes must remain stable over time.

## Topic Hubs

Create a future Topic Hub architecture for subjects such as patience, mercy, repentance, trust in Allah, marriage, family, anxiety, hope, parents and children.

Each topic page may connect:

- Quran verses
- Authentic hadith
- Authenticated duas
- Adhkar
- Editorial articles
- Guides
- Related topics
- Verified source references

Topic hubs must be curated and meaningful, not automatically generated thin pages.

## Entity Pages

Support structured pages for important Islamic entities such as:

- Prophets
- People
- Places
- Concepts
- Acts of worship
- Islamic months
- Islamic events

Entity pages should connect related trusted content through the Alsamad Knowledge Graph.

## Internal Linking

Internal linking should be contextual and useful. Examples include Quran verses linking to related tafsir or topics; hadith linking to their collection, chapter and topic; duas linking to their source and related situation; articles linking to Quran, Sunnah and related topics; and Islamic events linking to the calendar, guides and relevant worship content.

Avoid excessive or artificial linking.

## Multilingual SEO

Every supported language is a first-class SEO experience.

Requirements:

- Locale-specific URLs
- Correct hreflang relationships
- Self-referencing canonicals
- No automatic indexing of low-quality machine translations
- Clear translation availability status
- Translated metadata
- Locale-aware titles and descriptions
- No silent language fallback on indexable pages

Arabic remains the canonical source language for original religious text where applicable.

## Canonical Strategy

Every public page must define a canonical URL.

Canonical rules must prevent duplication caused by locale fallbacks, query parameters, filters, pagination, alternate reading modes, tracking parameters, print views and translated variants.

## Indexation Policy

Index:

- Trusted content pages
- Reviewed topic hubs
- Source pages
- High-value guides and articles
- Stable entity pages

Noindex:

- Internal search result pages
- Private account pages
- User dashboards
- Bookmarks
- Settings
- Incomplete translations
- Unreviewed AI output
- Thin filter combinations
- Temporary previews
- Duplicate utility pages

## Sitemap Architecture

Use separate sitemap indexes by content type and locale where scale requires it, including Quran, hadith, duas, adhkar, articles, guides, topics, entities, images and locales.

Last-modified values must reflect meaningful published content revisions, not every deployment.

## Structured Data

Use structured data only when the schema meaning is accurate. Potential types include WebSite, Organization, BreadcrumbList, Article, FAQPage, HowTo, SearchAction, CollectionPage, ProfilePage where appropriate, and Event only for accurately represented events.

Never invent religious schema types or use misleading structured data. Structured data must reflect visible page content.

## Quran and Hadith SEO

Quran and Hadith pages require special care.

Requirements:

- Stable canonical identifiers
- Crawlable server-rendered text
- Precise titles
- Source and edition attribution
- No promotional content inside scripture
- No duplicate ayah or hadith pages caused by translations
- Translation editions treated as attached versions, not separate canonical truth
- Stable anchors and references

## Content Freshness

Display meaningful review and revision information such as Published, Last reviewed, Last corrected, Current edition and Source version.

Do not manipulate dates merely to appear fresh.

## E-E-A-T and Trust

Alsamad should build authority through:

- Transparent methodology
- Source provenance
- Correction history
- Editorial workflow
- Qualified review
- Clear AI disclosure
- Accurate legal and privacy information
- Visible contact and correction channels

The platform does not need to promote individual founders publicly, but it must clearly establish institutional responsibility and trustworthy governance.

## Image SEO

Images should use meaningful filenames where practical, accurate alt text, captions where useful, responsive formats, optimized sizes, proper dimensions and image sitemaps when justified.

Decorative images should not receive misleading alt text.

## Performance and Core Web Vitals

SEO quality depends on performance.

Requirements include:

- Mobile-first rendering
- Low JavaScript on content pages
- Strong LCP, INP and CLS targets
- Server-rendered primary content
- Optimized fonts
- Responsive images
- No layout-shifting ads
- No unnecessary hydration
- Stable reading experience on low-end devices and weak networks

## Accessibility and SEO

Accessibility is part of discoverability.

Requirements:

- Semantic HTML
- Correct heading hierarchy
- Keyboard access
- Visible focus
- Descriptive links
- RTL/LTR correctness
- Screen-reader support
- Scalable Arabic text
- Sufficient contrast
- Reduced-motion support

## Search Engine Boundaries

Alsamad must never use:

- Cloaking
- Doorway pages
- Hidden text
- Keyword stuffing
- Mass-produced thin pages
- Fake reviews
- Misleading structured data
- Duplicated AI content
- Spam backlinks
- Manipulative redirects

## AI Content and SEO

AI may assist with drafting, translation suggestions, metadata suggestions, internal link suggestions and content gap analysis.

AI-generated or AI-assisted content must not be indexed unless it has passed the required editorial and religious review. AI must never mass-produce pages only to capture search traffic.

## Search and Discover Integration

The internal Knowledge Engine and public SEO architecture should reinforce one another.

The Knowledge Graph, topic hubs, entity pages, internal linking and source structure should help both users and search engines understand relationships.

Internal search results themselves remain noindex unless a separately curated topic page exists.

## SEO Governance

SEO changes require review when they affect:

- Religious content
- Canonical URLs
- Indexation
- Structured data
- Multilingual routing
- Redirects
- Source attribution
- Topic relationships

Maintain an audit trail for major SEO architecture changes.

## SEO Technical Requirements

- Locale-specific canonical URLs and reciprocal `hreflang`
- Server-rendered crawlable content with stable passage anchors and canonical verse URLs
- Structured data only where schema meaning is accurate; never invent religious schema types
- XML sitemap indexes partitioned by corpus and locale where scale requires it
- Last-modified dates derived from meaningful published revisions
- Noindex for internal search results, private pages, low-value filters, previews, and AI query URLs
- Reviewed Open Graph templates that never publish unverified text
- Global links to source and methodology pages

## SEO Product North Star

Alsamad should earn discoverability through:

- Trusted content
- Excellent information architecture
- Meaningful semantic relationships
- Accessibility
- Performance
- Genuine user value

The goal is not maximum traffic.

The goal is helping the right user find the right trusted knowledge at the right time.

# Shared Accessibility Requirements

The Release 1 accessibility acceptance criteria are the ecosystem baseline: WCAG 2.2 AA, complete keyboard use, visible focus, screen-reader support, 200% text zoom, logical RTL/LTR order, non-color status cues, reduced motion, quiet live regions, automated axe tests, and manual assistive-technology QA. Every module may add stricter context-specific requirements but may not weaken this baseline.

# Shared AI Safety and Transparency Requirements

AI operates in two explicitly separate contexts.

## AI-Assisted Published Content

- Human approval is mandatory before publication.
- Religious claims require the appropriate religious or scholarly review.
- AI contribution is disclosed where relevant.
- AI may never publish autonomously or independently publish religious claims.
- AI-Assisted Draft does not become trusted religious content automatically.

## Runtime AI Assistance

Runtime assistance includes the AI Search Assistant, Personal Marriage Advisor, contextual help, and retrieved explanations. Each individual response does not require manual pre-approval. Instead, runtime systems require:

- An approved, versioned retrieval corpus
- Claim-level citations where applicable
- Strict refusal policies and no independent fatwas
- No invented Quran, Hadith, evidence, rewards, virtues, or rulings
- Visible AI disclosure and uncertainty handling
- Evaluation benchmarks, adversarial testing, monitoring, and incident review
- Escalation to qualified human guidance where appropriate

Runtime output must never be represented as pre-approved religious content. AI never acts as an independent religious authority.

# Part IV — Governance, Quality and Stewardship

# Alsamad Governance Architecture

Governance ensures that Alsamad remains trustworthy, consistent and mission-driven regardless of future growth, contributors or technology changes.

Governance applies to every product, feature, service and future expansion within the Alsamad ecosystem.

## Governance Philosophy

Every decision inside Alsamad should strengthen one or more of the following:

- Trust
- Authenticity
- Privacy
- Security
- Accessibility
- Knowledge
- Long-term maintainability
- Global usability

If a feature weakens these principles, it should be reconsidered.

## Decision Framework

Major product decisions should always answer:

- Does this improve user trust?
- Does this respect authentic Islamic sources?
- Does this improve user experience?
- Does this protect user privacy?
- Does this scale globally?
- Can this still be maintained five years from now?
- Would we still be proud of this decision in ten years?

## Religious Governance

Religious content requires additional governance.

Principles include:

- No fabricated Quran.
- No fabricated Hadith.
- No fabricated religious rewards.
- No fabricated virtues.
- No unsupported Islamic rulings.

Clear distinction between:

- Quran
- Authentic Sunnah
- Editorial explanations
- General editorial duas
- AI-assisted content

Religious evidence must remain traceable.

## Editorial Governance

Editorial content should always remain clearly distinguished from transmitted religious texts.

Editorial opinions must never appear as revelation.

Every editorial update follows the documented review workflow.

## AI Governance

Artificial Intelligence assists people.

Artificial Intelligence never replaces religious authority.

AI may:

- Assist writing
- Assist translation
- Assist summarisation
- Assist search
- Assist recommendations

AI may never independently publish religious claims. Human approval is mandatory for AI-assisted published content. Runtime AI assistance follows the separate shared runtime controls and does not require manual pre-approval of every response.

## Privacy Governance

Privacy is treated as a permanent architectural principle.

- Collect only necessary information.
- Provide meaningful user controls.
- Protect sensitive information.
- Respect user deletion requests.
- Never design features that depend on excessive personal data collection.

## Product Neutrality

Alsamad is not designed around any particular country.

Alsamad is not designed around political movements.

Alsamad is not designed around commercial engagement metrics.

The platform exists to serve Muslims worldwide with trustworthy digital experiences.

## Platform Evolution

Every future feature should contribute to one or more of:

- Better learning
- Better worship support
- Better trust
- Better accessibility
- Better family support
- Better safety
- Better knowledge discovery

Avoid adding features that exist only because competitors have them.

## Quality Governance

Quality is measured through:

- Accuracy
- Clarity
- Review quality
- Performance
- Accessibility
- Security
- Maintainability
- Consistency

Quality should always be preferred over release speed.

## Community Governance

Future community participation is welcomed.

However:

Community content does not automatically become trusted content.

Editorial review remains mandatory before religious material receives trusted status.

## Product Success

Alsamad should not define success only by:

- Page views
- Session duration
- Daily active users
- Advertising metrics

Instead success should also include:

- User trust
- Content quality
- Successful knowledge discovery
- User satisfaction
- Privacy protection
- Search quality
- Content corrections
- Platform stability

## Long-Term Stewardship

Alsamad should remain maintainable for decades.

Architectural decisions should favour simplicity, stability and long-term sustainability over short-term trends.

## Product Constitution

The following principles should never change without exceptional justification:

- Trust before growth.
- Authenticity before popularity.
- People before algorithms.
- Knowledge before engagement.
- Privacy before data collection.
- Quality before quantity.
- Long-term stewardship before short-term optimisation.

## Governance Final Product Philosophy

Alsamad is not merely a website.

It is a long-term digital trust platform serving Muslims around the world.

Every architectural decision should strengthen that responsibility.

# Governance Roles and Readiness

Define these roles even if one person initially holds several:

- Product and technical owner
- Arabic language editor
- Translation and locale editors as rollout requires
- Islamic content reviewer or qualified advisory group
- Data and source licensing owner
- Security and privacy owner
- Release publisher with audited privileges

Correction governance follows the Content Integrity correction workflow. Before any content is presented as verified, publish a correction policy, source methodology, translation policy, prayer-calculation methodology, AI policy, privacy policy, and conflict-of-interest policy.

# Appendix — Original Release 1 Approval Record

This appendix preserves the document's original planning history. It is historical and non-authoritative for current ecosystem scope; the approved baseline, capability statuses, and four-part architecture above govern current decisions.

## Original decisions requested for approval

1. Approve positioning: trusted Islamic knowledge and daily companion, with no social feed in Release 1.
2. Approve Drizzle/PostgreSQL and modular-monolith architecture.
3. Approve explicit `/ar` and `/en` routing as the original Release 1 locale examples, not permanent language limits.
4. Approve deterministic sourced search first; AI-assisted answers deferred behind a safety gate.
5. Approve local-first tasbeeh/progress and guest-first access.
6. Approve the Sakīnah design direction and proposed palette/typography candidates.
7. **Approved Decision:** Quran.Foundation is the primary Quran provider through a provider-independent internal adapter. ALSAMAD identifiers, editorial authority, edition approval, license evidence, checksums, publication, correction, and withdrawal remain locally owned. Exact editions and durable-storage rights remain activation gates before import.
8. **Approved Decision:** Quran.Foundation supplies candidate translation resources through the same adapter. ALSAMAD must approve the exact English edition(s), license, attribution, and footnote handling before activation.
9. **Pending Decision:** Named scholarly/editorial review structure before verified duas/adhkar publication.
10. **Approved Decision:** Public authentication and bookmarks remain Prepared and hidden in Release 1. Quran.Foundation OAuth/User APIs are optional Quran-specific interoperability only and must never become canonical ALSAMAD identity.

## M0.5 — Quran.Foundation architecture alignment

Release 1 uses Quran.Foundation as the primary upstream provider for chapters, ayat, approved Quran text, translations, tafsir, translation footnotes, structural navigation, chapter information, and conditionally approved audio. Provider identifiers are external aliases. Public routes and domain services depend only on ALSAMAD-owned contracts and identifiers.

Audio is included in Release 1 only when written reciter, commercial playback, attribution, cache, bandwidth, CORS/Range, withdrawal, and deletion approvals pass. Otherwise the reader ships text-first with playback disabled. Quran.Foundation Search remains internal evaluation until its production, quota, privacy, edition-mapping, relevance, and fallback gate passes; public Release 1 search remains deterministic and local. OAuth/User APIs remain Prepared; streaks, public profiles, QuranReflect publishing, rooms, groups, posts, comments, likes, follows, feeds, and community notifications are excluded.

Quran.Foundation content retention is limited to seven days by default unless written permission or independent direct licensing permits longer storage. Quran reading must retain a legally valid independently licensed or otherwise approved fallback and must not depend exclusively on live provider availability.

## Original definition of planning approval

The original Release 1 plan considered planning approved when product scope, primary navigation, route examples, trust model, source policy, prayer/calendar disclosures, architecture, design direction, typography candidates, and Release 1 boundaries were accepted.

## Original UI approval gate and implementation wording

The original next step was the UI foundation checkpoints—not database ingestion, AI, or production launch. Its historical instruction that no code should be written until planning approval is preserved here as an original approval gate; it does not redefine the current approved ecosystem scope.
