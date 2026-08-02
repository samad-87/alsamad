# Alsamad — Product, Information Architecture & Design System

**Version:** 1.0 — Planning baseline  
**Domain:** al-samad.com  
**Status:** Proposed for approval; no implementation authorized  
**Phase 1 languages:** Arabic (RTL), English (LTR)

## 1. Executive decision

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

## 3. Assumptions to challenge

### 3.1 “Important Duas” is too subjective

Replace it in navigation with **Duas**, then organize by verified context: daily life, worship, protection, hardship, travel, family, forgiveness, and Quranic duas. “Essential” may be a curated collection with documented editorial criteria.

### 3.2 Prayer times are not one universal value

Results depend on location, calculation authority/method, high-latitude rule, Asr convention, elevation, and adjustments. The product must always show the active method and allow changes. In Norway and other high-latitude regions this is a trust-critical feature.

### 3.3 The Hijri date is not globally identical

The calendar must distinguish calculated dates from local or authority-announced dates and offer a user-visible adjustment without claiming universal certainty.

### 3.4 AI search should not launch merely because search exists

Phase 1 should ship deterministic lexical/full-text search with filters and source cards. AI answers become a separately reviewed capability after evaluation against a benchmark of Islamic questions and adversarial prompts.

### 3.5 Accounts are useful, but not first-page value

Authentication should initially support synced preferences, bookmarks, reading position, and private routines. Do not require signup to use Quran, duas, prayer times, calendar, search, or tasbeeh.

### 3.6 Monetization must never influence religious answers

Sponsored material, commerce, donations, and editorial content require hard visual and data boundaries. No ranking based on payment. No ads inside Quran verses, duas, adhkar, or prayer flows.

## 4. Scope and release boundaries

### Release 1 — Trustworthy daily foundation

- Home / Today
- Quran: surah index, reading view, verse detail, translation, audio-ready UI
- Adhkar: morning and evening
- Duas: browse, collection and detail
- Prayer times with method disclosure and settings
- Islamic calendar with date qualification
- Digital tasbeeh stored locally
- Daily dua/content card
- Unified deterministic search
- Arabic and English
- Theme, text-size and reading preferences
- Installable PWA foundation and offline shell
- Editorial/admin foundation for verified content

### Prepared but not necessarily exposed in Release 1

- Authentication and private sync
- Bookmarks and reading progress
- Notification preferences
- Audio manifests and reciter catalog
- Additional locales
- Content correction submissions

### Explicitly deferred

- Generative AI answers
- Social feed, comments, likes, public profiles
- Fatwa generation or personalized religious rulings
- User-submitted religious content without moderation
- Commerce and advertising
- Full hadith library and Islamic courses until licensing/review pipelines are ready

## 5. Information architecture

### 5.1 Primary navigation

| Destination | Arabic  | Purpose                                                                |
| ----------- | ------- | ---------------------------------------------------------------------- |
| Today       | اليوم   | Daily dashboard: prayer, daily dua, continue reading, adhkar shortcuts |
| Quran       | القرآن  | Browse, read, listen-ready, translations and verse sources             |
| Adhkar      | الأذكار | Morning, evening and later contextual collections                      |
| Duas        | الأدعية | Verified supplications by need and source                              |
| Prayer      | الصلاة  | Prayer times, next prayer, method and location controls                |
| More        | المزيد  | Calendar, tasbeeh, learning, settings and about/trust                  |

On desktop, Calendar and Search may be promoted to the primary header. On mobile, use a restrained bottom navigation with no more than five destinations; Search opens as a global command/search surface.

### 5.2 Route model

Use explicit locale prefixes for every public page: `/ar/...` and `/en/...`. The root `/` performs locale negotiation once, with a visible language switcher and a persistent preference. Arabic and English routes have localized slugs only if redirects and canonical mapping are guaranteed; stable English technical slugs are safer for launch.

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

The home page should adapt modestly to time and preferences, not become an algorithmic feed.

#### Quran

- Surah index with Arabic name, translated name, verse count and revelation classification
- Reading layout optimized for one-column focus
- Verse actions: translation, tafsir-ready reference, audio, copy, share canonical link, bookmark
- Mushaf-style and reading-style presentation can be separate modes later
- Never insert promotional content between verses

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

#### Search

- One query across Quran, duas, adhkar, and later hadith/learning
- Arabic normalization for search only; preserve canonical display text
- Filters by corpus, language, source and category
- Exact source excerpts and direct results before any future synthesized answer

## 6. Content and trust architecture

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

### 6.4 Editorial workflow

`draft → source-verified → language-reviewed → scholarly-reviewed (when required) → published → corrected/superseded`

No religious content moves directly from import to public. Publishing is role-gated, audited, previewable in both directions, and reversible. Emergency unpublish is supported.

### 6.5 AI safety contract (future)

- Retrieval only from approved, versioned corpora
- Citations at claim level linking to readable source pages
- No invented citation identifiers
- Quote/translation attribution preserved
- Uncertainty and scholarly differences stated
- Refuse personalized fatwa, takfir, medical/legal danger, or unsupported claims; route users to qualified scholars when appropriate
- Generated answers visually distinct from source text
- Full evaluation suite, red-team set and sampled human review before launch
- Retrieval/source versions and answer telemetry retained without unnecessarily storing sensitive user queries

## 7. Technical architecture

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

### 7.4 Internationalization

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

- Mobile-first, low-end Android and weak network included in testing
- Initial route JavaScript target under 170 KB gzip for content pages, reviewed per route
- LCP under 2.5 s at p75 field data; INP under 200 ms; CLS under 0.1
- Self-host/subset fonts responsibly; preload only essential faces
- No hydration for static content that does not require interaction
- Audio is never preloaded without intent

### 7.7 SEO architecture

- Locale-specific canonical URLs and reciprocal `hreflang`
- Server-rendered crawlable content; stable passage anchors and canonical verse URLs
- Structured data only where schema meaning is accurate; do not invent religious schema types
- XML sitemap index partitioned by corpus/locale; last-modified from published revisions
- Noindex internal search results, private pages, low-value filter combinations and AI query URLs
- Open Graph images generated from reviewed content templates, never from unverified text
- Source and methodology pages linked globally to strengthen trust

### 7.8 Accessibility acceptance criteria

- WCAG 2.2 AA target
- Full keyboard use and visible focus
- Screen-reader labels for Arabic controls and verse actions
- Arabic text zoom to 200% without clipping
- Logical reading/focus order in RTL and LTR
- Color is never the sole signal
- Reduced-motion mode; nonessential animation disabled
- Prayer countdowns do not cause noisy screen-reader announcements
- Automated axe tests plus manual NVDA/VoiceOver and RTL QA

## 8. Design system: “Sakīnah”

The visual system should evoke calm, clarity and reverence through proportion and typography, not ornamental overload. Islamic geometric motifs may appear sparingly in empty states, covers or editorial art—not behind long reading text.

### 8.1 Color tokens

Names are semantic; raw values remain replaceable tokens after visual testing.

| Token            | Light proposal | Dark proposal | Use                                  |
| ---------------- | -------------: | ------------: | ------------------------------------ |
| `background`     |      `#FAFCFA` |     `#07130F` | Page canvas                          |
| `surface`        |      `#FFFFFF` |     `#0D1D17` | Cards and elevated reading surfaces  |
| `foreground`     |      `#10231B` |     `#F3F7F4` | Primary text                         |
| `muted`          |      `#607168` |     `#9BAAA2` | Secondary text                       |
| `primary`        |      `#0F5B43` |     `#45A77E` | Primary action and selected state    |
| `primary-strong` |      `#083D2D` |     `#74C9A5` | Emphasis/hover where contrast passes |
| `accent-gold`    |      `#A67C2E` |     `#D3AE62` | Rare accent, not body links          |
| `border`         |      `#DDE7E1` |     `#243A31` | Dividers and fields                  |
| `danger`         |      `#B42318` |     `#FF8A80` | Errors only                          |

Gold must be scarce. Green should signal action/identity, not decorate every surface. Final values require contrast testing in real components.

### 8.2 Typography

- Arabic reading candidate: **Noto Naskh Arabic** or a properly licensed, Quran-appropriate typeface after glyph and waqf-mark testing
- Arabic UI candidate: **IBM Plex Sans Arabic** or Noto Sans Arabic
- English UI: **Inter** or Geist
- Quranic script must be selected based on authenticated text edition and full glyph/diacritic support, not visual taste alone
- Arabic body line height: approximately 1.9–2.1 depending on face; Quran reading adjustable
- English body line height: approximately 1.55–1.7
- User controls: Arabic/Quran size, translation size, translation visibility and transliteration visibility

Never simulate Arabic bold if the face lacks a real weight. Never use letter spacing on joined Arabic text.

### 8.3 Spacing, shape and elevation

- 4 px base scale; common spacing: 4, 8, 12, 16, 24, 32, 48, 64
- Reading column: approximately 680–760 px depending on script and mode
- General content container: 1200–1280 px
- Radius: 10 px controls, 16 px cards, 24 px feature surfaces; pills only for true compact filters/status
- Borders and tonal separation before shadows
- Shadows soft and rare; dark mode uses borders and surfaces, not glowing effects

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

## 9. UI foundation plan (implementation proposal only)

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

## 10. Quality gates and testing strategy

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

## 11. Key risks and mitigations

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

## 12. Governance required before content implementation

Define these roles even if one person initially holds several:

- Product/technical owner
- Arabic language editor
- English translator/editor
- Islamic content reviewer or qualified advisory group
- Data/source licensing owner
- Security/privacy owner
- Release publisher with audited privileges

Publish a correction policy, source methodology, translation policy, prayer calculation methodology, AI policy, privacy policy and conflict-of-interest policy before claiming the platform is “verified.”

## 13. Decisions requested for approval

1. Approve positioning: trusted Islamic knowledge + daily companion, with no social feed in Release 1.
2. Approve Drizzle/PostgreSQL and modular-monolith architecture.
3. Approve explicit `/ar` and `/en` locale routing.
4. Approve deterministic sourced search first; AI-assisted answers deferred behind a safety gate.
5. Approve local-first tasbeeh/progress and guest-first access.
6. Approve “Sakīnah” design direction and proposed palette/typography candidates.
7. Decide the Quran Arabic text edition/provider and redistribution license before importing data.
8. Decide the initial English Quran translation edition(s) and license.
9. Choose a scholarly/editorial review structure before publishing verified duas/adhkar.
10. Decide whether Release 1 authentication/bookmarks ship publicly or remain prepared but hidden.

## 14. Definition of planning approval

Planning is approved when the product scope, primary navigation, route model, trust model, source policy, prayer/calendar disclosures, architecture, design direction, typography candidates and Release 1 boundaries are accepted. The next action is then the UI foundation checkpoints—not database ingestion, AI, or production launch.
