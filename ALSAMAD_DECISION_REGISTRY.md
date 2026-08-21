# Alsamad — Decision Registry

**Status:** Approved Release 1 decision-governance mechanism; documentation only

**Authoritative product source:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md`

**Governance model:** Hybrid Decision Governance — this Registry, plus selective Architecture Decision Records (ADRs) for major, difficult-to-reverse decisions, plus the existing architecture documents and `ALSAMAD_IMPLEMENTATION_ROADMAP.md` milestone gates. This document does not introduce a new governance layer; it materializes the decision-tracking mechanism already implied by the repository's own approval discipline and by the previously ungoverned `UNRESOLVED_DESIGN_DECISIONS.md` list.

This document authorizes no implementation, no migration, no code, and no Release scope. It does not modify or weaken any existing architecture document or Roadmap gate.

# 1. Purpose

Domain architecture documents (Product, Database, API, Admin, Security, QA, Observability, Analytics) define what Alsamad is and how it behaves. They deliberately leave some physical, structural, or cross-cutting questions open until evidence or approval settles them. Without a place to record that a question is open, who resolved it, and what was rejected, such questions get answered silently and inconsistently wherever they are next encountered — for example while attempting to expand `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 into executable per-table subsections.

The Decision Registry exists to record exactly one thing: **the status and outcome of an architecturally relevant decision that is not yet, or was not already, settled by an existing architecture document.** It is an index and audit trail, not a new source of product truth.

# 2. Authority boundaries

The Registry preserves, and never displaces, these existing authorities:

1. Product and domain architecture documents define **what** Alsamad is.
2. The Decision Registry records architectural decisions and their status.
3. ADRs explain only exceptional, major, difficult-or-unsafe-to-reverse decisions.
4. `ALSAMAD_IMPLEMENTATION_ROADMAP.md` and its milestone/gate mechanism remain the **exclusive** authority for **when** implementation is authorized.
5. Neither a Registry entry nor an ADR independently authorizes implementation.

The Decision Governance mechanism (this Registry plus ADRs) must never:

- expand Product scope;
- create a new Release milestone;
- bypass an existing architecture document;
- bypass a Roadmap implementation authorization;
- bypass an acceptance gate;
- silently change frozen Release 1 architecture;
- allow an ADR to become an implementation authorization.

If resolving a decision requires changing already-approved architecture, the affected authoritative architecture document must be changed through its own normal reviewed documentation process. The Registry records that such a change is needed and, once made, references it; the Registry entry itself never substitutes for that change.

# 3. Decision treatment rules

| Decision kind                                                                                | Treatment                               |
| -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Local, reversible implementation detail                                                      | No decision record.                     |
| Architecturally relevant but reversible decision                                             | Decision Registry entry only.           |
| Major architectural decision that is expensive, unsafe, or structurally difficult to reverse | Decision Registry entry **and** an ADR. |

Whether a decision needs a record at all is judged against §7 (ADR threshold) for the ADR tier, and against ordinary architectural relevance — does the decision affect a physical representation, a cross-module boundary, or a closed vocabulary another document depends on — for the Registry-only tier. An index choice, a library selection with no architectural coupling, or an ordinary reversible query optimization needs neither.

# 4. Lifecycle

```
OPEN → DECIDED → IMPLEMENTED

REJECTED     (terminal, from OPEN)
SUPERSEDED   (terminal, from DECIDED or IMPLEMENTED)
```

- **OPEN** — the decision exists but is unresolved. No architecture document yet reflects an answer.
- **DECIDED** — the architectural outcome is approved and recorded. **This does not authorize implementation.** A `DECIDED` entry only means the physical/structural question now has a settled answer that an architecture document may adopt through that document's own normal reviewed process.
- **IMPLEMENTED** — implementation evidence exists **and** the applicable existing Roadmap/milestone acceptance requirements have passed. The Registry entry must reference that evidence (a Roadmap gate label, a PASS statement already recorded in `ALSAMAD_IMPLEMENTATION_ROADMAP.md`) rather than recreate or restate it.
- **REJECTED** — considered and deliberately not adopted. Kept for history; never deleted.
- **SUPERSEDED** — replaced by a newer decision. History remains preserved; the superseding entry references the superseded one and vice versa.

A `DECIDED` entry must never silently change. If circumstances require a materially different outcome, a **new** Registry entry is opened, decided, and marked as superseding the old one; the old entry's status becomes `SUPERSEDED`. Its text is never edited to reflect the new outcome.

# 5. Categories

Every entry is tagged with the domain architecture document(s) it primarily affects, so the Registry can be filtered without duplicating architecture content:

`Product` · `Database` · `API` · `Admin` · `Security` · `QA` · `Observability` · `Analytics` · `Roadmap` (cross-cutting sequencing/gating questions that don't belong to a single domain document).

# 6. Approval semantics

`OPEN → DECIDED` and `DECIDED → IMPLEMENTED` transitions require the same reviewing authority that already approves changes to the affected domain architecture document(s) — this Registry introduces no separate approval role. A transition to `DECIDED` requires:

- a recorded outcome and rationale on the entry;
- identification of the architecture document/section that will carry the outcome once that document is updated through its own review process;
- an ADR reference if the entry's tier requires one (§7).

A transition to `IMPLEMENTED` requires the referenced Roadmap gate to have actually passed, cited by its exact label (for example `M6.1 Devotional Schema Foundation Verified`), not merely asserted.

# 7. ADR threshold

An ADR is required only when **both** are true:

1. the decision is architecturally material; **and**
2. reversal would be expensive, dangerous, data-shaping, security/content-integrity sensitive, or would require significant cross-module reconstruction.

**Examples that meet the threshold:**

- canonical ownership/source-of-truth changes;
- fundamental frozen-data-model changes;
- difficult-to-reverse security/privacy boundaries;
- canonical religious-content integrity/provenance decisions;
- provider coupling that materially affects persisted canonical state;
- incompatible replacement of an established architecture decision.

**Examples that do not meet the threshold:**

- ordinary indexes;
- reversible implementation approaches;
- library selections that create no architectural coupling;
- local code structure;
- testing technique;
- a provider choice behind an already-approved provider-independent boundary, unless that choice creates irreversible persisted or licensing consequences.

An ADR, when required, is a separate document referenced by its Registry entry. It never stands alone: every ADR must have a corresponding Registry entry, but not every Registry entry requires an ADR.

**ADR location and naming (convention only — no ADR exists yet):** `ALSAMAD_ADR_NNNN_<kebab-case-title>.md` at repository root, matching this repository's existing flat, all-caps documentation convention. `NNNN` is a four-digit, monotonically increasing number, assigned once, never reused, and never renumbered even if the ADR is later rejected or superseded. No ADR file is created merely to reserve a number or demonstrate the convention; a file is created only when an entry actually reaches the point of requiring one.

# 8. Registry schema/fields

Each entry in §12 uses these fields:

| Field                      | Meaning                                                                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ID                         | `REG-NNNN`, sequential, never reused.                                                                                                            |
| Title                      | Short name of the open question.                                                                                                                 |
| Category                   | One or more tags from §5.                                                                                                                        |
| Status                     | `OPEN` / `DECIDED` / `IMPLEMENTED` / `REJECTED` / `SUPERSEDED`.                                                                                  |
| Tier                       | `Registry only` or `Registry + ADR` (per §7); may be marked "ADR likely" while still `OPEN` if the threshold is expected to be met once decided. |
| Opened                     | Date the question was recorded.                                                                                                                  |
| Summary                    | The precise unresolved question, stated neutrally.                                                                                               |
| Committed evidence         | Exact document/section citations establishing the behavioral requirement and the gap — never a restatement of unrelated architecture.            |
| Affected architecture      | The document/section that will carry the eventual outcome.                                                                                       |
| Affected roadmap gate      | The Roadmap phase/unit blocked on this decision, if any.                                                                                         |
| ADR reference              | `ADR-NNNN` once one exists, or "None".                                                                                                           |
| Decision outcome           | Blank until `DECIDED`; then the settled answer and the date/authority that approved it.                                                          |
| Implementation evidence    | Blank until `IMPLEMENTED`; then a citation to the passed Roadmap gate only.                                                                      |
| Supersedes / Superseded by | Blank, or the related `REG-NNNN`.                                                                                                                |

# 9. Relationship to architecture documents

The Registry never redefines what a domain architecture document already states. An `OPEN` entry records that a document's existing text leaves a question unanswered. A `DECIDED` entry records the settled answer, but that answer becomes normative only once the affected architecture document is itself updated through its own existing reviewed process — the same process that already produced every "Approved" architecture document in this repository. The Registry entry is then updated to point at the resulting section; it does not carry the schema, API contract, or policy text itself.

# 10. Relationship to Roadmap gates

The Registry never replaces or relaxes a Roadmap acceptance gate. `IMPLEMENTED` status is strictly derivative of a gate that has already passed under `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s own rules (for example the M3–M6 "acceptance and separated gates" pattern). A Roadmap phase contract may cite an `OPEN` or `DECIDED` Registry entry as a Dependency — exactly as the committed M6 contract already cites the §5.4 column-level documentation prerequisite — without the Registry entry itself granting any implementation permission.

# 11. Supersession rules

A `DECIDED` or `IMPLEMENTED` entry is never edited to change its recorded outcome, mirroring the append-only, no-destructive-rewrite principle already normative for published content in `ALSAMAD_DATABASE_ARCHITECTURE.md` §2.4 rule 10. A materially different outcome requires a new Registry entry that supersedes the old one; the old entry's status becomes `SUPERSEDED` and both entries remain in the Registry permanently.

# 12. Initial decision register

Seeded only with decisions that are currently necessary and supported by committed repository evidence. No historical decision is invented or backfilled.

As of 2026-08-08, the M6 architecture decision analysis covering REG-0001–REG-0008 has been reviewed and approved by the reviewing authority. REG-0001 and REG-0006 required an ADR under the §7 threshold; both `ADR-0001` and `ADR-0002` now exist with **Status: Accepted**, satisfying the §6 precondition for those two entries to move to `DECIDED`. The remaining six entries required no ADR and move to `DECIDED` directly on the same approval. **`DECIDED` here, as throughout this Registry, authorizes no implementation.** No entry is marked `IMPLEMENTED`: no schema exists yet, `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.1–§5.4.4 have not been authored, and the independent M5 production-activation dependency blocking M6 implementation remains unresolved regardless of this Registry's status.

| ID       | Title                                                                                      | Category                    | Status      | Tier                                                                      |
| -------- | ------------------------------------------------------------------------------------------ | --------------------------- | ----------- | ------------------------------------------------------------------------- |
| REG-0001 | Editorial General Dua placement in the devotional physical model                           | Database, Admin             | DECIDED     | Registry + ADR (`ADR-0001`, Accepted)                                     |
| REG-0002 | `devotional_items` specialization depth and independent lifecycle                          | Database                    | DECIDED     | Registry only                                                             |
| REG-0003 | `devotional_collections` ↔ content-item relationship cardinality and independent lifecycle | Database                    | DECIDED     | Registry only                                                             |
| REG-0004 | `devotional_collections.collection_kind` closed-vocabulary source of truth                 | Database, Admin             | DECIDED     | Registry only                                                             |
| REG-0005 | Repetition-guidance storage locus and its source-evidence representation                   | Database                    | DECIDED     | Registry only                                                             |
| REG-0006 | `content_translations` text-storage representation                                         | Database                    | DECIDED     | Registry + ADR (`ADR-0002`, Accepted)                                     |
| REG-0007 | `content_translations` review/publication lifecycle column count                           | Database                    | DECIDED     | Registry only (decided alongside `ADR-0002`, which covers the same table) |
| REG-0008 | `devotional_collection_items` membership deletion semantics                                | Database                    | DECIDED     | Registry only                                                             |
| REG-0010 | In-application display and standalone redistribution rights separation                     | Database                    | DECIDED     | Registry + ADR (`ADR-0003`, Accepted)                                     |
| REG-0011 | Immutable source import manifest and execution evidence separation                         | Database                    | DECIDED     | Registry + ADR (`ADR-0004`, Accepted)                                     |
| REG-0012 | License-version immutability and historical license evidence                               | Database                    | DECIDED     | Registry + ADR (`ADR-0005`, Accepted)                                     |
| REG-0013 | Atomic Quran release selector and publication consistency                                  | Database                    | DECIDED     | Registry + ADR (`ADR-0006`, Accepted)                                     |
| REG-0014 | Knowledge Engine Phase 1 (KE-1): entity/relationship/search unification                    | Roadmap                     | DECIDED     | Registry only                                                             |
| REG-0015 | Knowledge Engine Phase 2 (KE-2): durable topic vocabulary and assignments                  | Database, Roadmap           | DECIDED     | Registry + ADR (`ADR-0007`, Accepted)                                     |
| REG-0016 | Editorial Identity Foundation prerequisite                                                 | Database, Security, Roadmap | DECIDED     | Registry + ADR (`ADR-0008`, Accepted)                                     |
| REG-0017 | Typography Phase 1: Arabic UI and devotional-reading font roles                            | Product, Roadmap            | IMPLEMENTED | Registry only                                                             |
| REG-0018 | Sakīnah Phase-1 visual foundation: palette, surfaces, elevation, radii, and state roles    | Product, Roadmap            | DECIDED     | Registry only                                                             |
| REG-0019 | M6.0 Duas Mobile-First Foundation: narrow independence from the M5 production-activation dependency | Roadmap                     | DECIDED     | Registry only                                                             |
| REG-0020 | Quran.Foundation Arabic Quran text retention permission (M5 Gate 3 storage/retention sub-item)       | Roadmap, Security            | DECIDED     | Registry only                                                             |

### REG-0001 — Editorial General Dua placement in the devotional physical model

**Summary:** Whether Editorial General Dua content items receive a row in the `devotional_items` specialization table, or are structurally excluded from it and separated purely at `content_items`/`content_revisions` level.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 narrative ("Editorial General Dua is separated by a checked devotional type... A one-to-one detail table would add symmetry but no additional durable state") and §8's "Editorial General Dua separation" row (names no `devotional_items` requirement, unlike the "Dua or dhikr detail" row directly above it); `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.1 (lists Editorial General Dua as one of four "devotional classes") and §9.1 ("must retain its dedicated structural distinction defined by the database architecture").

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.1 (not yet authored); possible clarifying cross-reference in `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.1.

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked; this decision does not itself lift that block — see `ADR-0001` §"Relationship to M6 Roadmap gates").

**Tier rationale:** Touches canonical religious-content integrity/provenance separation — a named ADR-threshold example.

**Status:** `DECIDED` (2026-08-08). **ADR reference:** `ADR-0001` (Accepted).

**Decision outcome:** Editorial General Dua remains canonically owned by the `editorial` module at the `content_items`/`content_revisions` layer and never receives a `devotional_items` row; `devotional_items` is restricted, by trigger, to `content_items` rows with `content_type IN ('dua','dhikr')` and `owning_module='devotional'`. Full rationale, alternatives, and rejected alternatives are recorded in `ADR-0001`. This outcome becomes normative for `ALSAMAD_DATABASE_ARCHITECTURE.md` only once §5.4.1 is authored through that document's own reviewed process.

### REG-0002 — `devotional_items` specialization depth and independent lifecycle

**Summary:** Whether `devotional_items` stores its own checked type/lifecycle columns or relies entirely on trigger-validated reference to `content_items`/`content_revisions`, and whether it carries any independent publication state.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 summary row ("checked type; type-specific source/review checks") and §2.4 rule 10 (no duplicate durable state for published content).

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.1 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** None (Registry-only tier).

**Decision outcome:** `devotional_items` remains a lean specialization: `id`, a unique `content_item_id` FK, and a unique `canonical_key` only, plus the standard `created_at`/`updated_at`. It stores no `content_type`, `owning_module`, verification, publication, or repetition state of its own — classification is validated by trigger against the referenced `content_items` row (see REG-0001's trigger condition) rather than persisted twice. This outcome becomes normative only once §5.4.1 is authored; exact column types/lengths are not frozen by this entry and remain subject to `ALSAMAD_DATABASE_ARCHITECTURE.md` §2.5 naming-convention precedent at authoring time.

### REG-0003 — `devotional_collections` ↔ content-item relationship cardinality and independent lifecycle

**Summary:** Whether `devotional_collections.content_item_id` is a one-to-one (unique) FK, unlike the explicitly one-to-one FK stated for `devotional_items`, and whether `devotional_collections` carries its own publication lifecycle.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 summary row ("FK to a versioned content item for title/description; unique canonical key; checked collection kind" — no "one-to-one" qualifier, unlike the `devotional_items` row).

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.2 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** None (Registry-only tier).

**Decision outcome:** `devotional_collections.content_item_id` is a **unique (one-to-one)** FK, matching `devotional_items`' cardinality — one canonical collection identity, one authoritative content-item/revision source for title and description, avoiding any second physical representation of the same collection. `devotional_collections` carries no independent publication lifecycle of its own, for the same reason as REG-0002. This outcome becomes normative only once §5.4.2 is authored.

### REG-0004 — `devotional_collections.collection_kind` closed-vocabulary source of truth

**Summary:** The exact closed set of `collection_kind` values, and whether `ALSAMAD_DATABASE_ARCHITECTURE.md` or `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.2 is authoritative for that set.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 summary row ("checked collection kind"); `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.2 ("manage morning, evening, and contextual collections").

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.2 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** None (Registry-only tier).

**Decision outcome:** `collection_kind` remains closed to exactly `morning`, `evening`, and `contextual` for Release 1, quoting `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.2 verbatim as the source vocabulary; `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.2, once authored, becomes the authoritative physical statement of this closed set. No contextual sub-taxonomy is introduced. Additional collection kinds may be added later only through a new Registry entry and, if additive, an ordinary reviewed change to §5.4.2 — never invented at authoring time.

### REG-0005 — Repetition-guidance storage locus and its source-evidence representation

**Summary:** Whether sourced repetition guidance is structured only at collection-membership grain or also needed at standalone item grain, and whether its optional source evidence is a foreign key to `source_references` or another representation.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 narrative ("Repetition guidance belongs to collection membership or the reviewed item revision; it is never a worship ledger") and §5.4 summary row ("positive optional count; optional source reference; no reward field"); §11 (rejects "separate ... repetition ... detail tables" as fragmentation, narrowing but not fully resolving the representation).

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.3 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** None (Registry-only tier).

**Decision outcome:** Structured, positive-when-present repetition guidance is stored only on `devotional_collection_items` (collection-context grain); `devotional_items` carries no repetition column. Standalone, non-collection repetition guidance that belongs to the authenticated source remains part of the reviewed `content_revisions` text, not a structured field, unless a later concrete need proves otherwise. No worship ledger, streak, or persisted user-completion count is introduced anywhere in M6. Repetition-guidance provenance, when structured, is an optional FK to the existing `source_references` table; no free-text evidence field and no second citation system is created. This outcome becomes normative only once §5.4.1 and §5.4.3 are authored.

### REG-0006 — `content_translations` text-storage representation

**Summary:** Whether `content_translations` stores its own translated-text/checksum payload directly, or instead follows the `quran_translation_texts` precedent (§5.3.7) of holding only identity/version metadata and referencing a shared text-specialization row.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 summary row ("published text immutable"); §5.3.7 (`quran_translation_texts` stores no text of its own, only a unique FK to `passage_texts`); no equivalent shared text table currently exists for `content_revisions`.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.4 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked; this decision does not itself lift that block — see `ADR-0002` §"Relationship to M6 Roadmap gates").

**Tier rationale:** A fundamental frozen-data-model shape choice — expensive to reverse once rows exist — a named ADR-threshold example.

**Status:** `DECIDED` (2026-08-08). **ADR reference:** `ADR-0002` (Accepted).

**Decision outcome:** `content_translations` owns its rendering text and an integrity checksum directly; no fifth M6 table is introduced and `passage_texts` is not reused. Full rationale, alternatives, and rejected alternatives are recorded in `ADR-0002`. Exact column names/types (e.g. what the text and checksum columns are literally called) are **not** frozen by this entry or by `ADR-0002` — they must be justified by `ALSAMAD_DATABASE_ARCHITECTURE.md` §2.5 naming-convention precedent when §5.4.4 is authored, not copied from any prior draft.

### REG-0007 — `content_translations` review/publication lifecycle column count

**Summary:** Whether "review outcome" and "published text immutable" (§5.4 summary row) require one lifecycle column or two independent ones (review status and publication state).

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 summary row; §5.2.8 (`content_revisions` uses two independent columns, `verification_state` and `publication_state`, for the analogous non-Quran case) as a precedent, not a stated rule for this table.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.4 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** `ADR-0002` (decided alongside `ADR-0002`; this entry alone did not independently meet the §7 ADR threshold).

**Decision outcome:** The lifecycle is the minimum necessary: a single closed-vocabulary review-state column, with no separate, independent publication-state column. Public/rendering eligibility for a translation is derived — approved review outcome, plus the referenced `content_revisions` row's own published state, plus the referenced `locales` row's enabled state — never stored redundantly, mirroring the already-established `quran_translation_editions` pattern (§5.3.6) rather than duplicating `content_revisions`' two-column pattern (§5.2.8). No additional lifecycle column is introduced. This outcome becomes normative only once §5.4.4 is authored.

### REG-0008 — `devotional_collection_items` membership deletion semantics

**Summary:** Whether collection-membership rows support physical deletion or require the soft-delete (`is_active`-style) pattern already used elsewhere in this document for "operational removal."

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.1.2 ("Operational removal uses `is_active = false`" for `geographic_areas`, the only explicit removal-semantics precedent in the document); `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.2 ("control ordered collection membership" — behavioral, not physical).

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.3 (not yet authored).

**Affected roadmap gate:** `M6.1 Devotional Schema Foundation Verified` (blocked).

**Status:** `DECIDED` (2026-08-08). **ADR reference:** None (Registry-only tier).

**Decision outcome:** `devotional_collection_items` supports ordinary physical `DELETE` for membership changes; no soft-delete column and no membership-history table is introduced. This differs deliberately from the `geographic_areas.is_active` precedent (§5.1.2), because that pattern exists to protect a widely-referenced parent from orphaning dependents, and nothing in the committed schema references `devotional_collection_items` rows by foreign key — it is a leaf table, so physical deletion carries no integrity risk. No committed text requires a durable deletion-history semantic for membership, so none is invented. This outcome becomes normative only once §5.4.3 is authored.

### REG-0009 — M5 Quran.Foundation non-commercial intended-use classification

**Category:** `Roadmap`.

**Summary:** Whether controlled M5 work may proceed under Quran.Foundation's expressly permitted non-commercial terms while broader-platform monetization remains unresolved.

**Committed evidence:** `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5 requires intended-use, commercial-use, attribution, redistribution, retention, caching, deletion, exit, fallback, source-selection, and approval decisions to pass before provider content may be fetched or imported. `ALSAMAD_SECURITY_ARCHITECTURE.md` sections 9, 20, 28, and 28.1 require religious imports to preserve source, license, edition, checksum, review, publication, correction, withdrawal, secret-handling, retention, and provider-exit controls. The owner decision is based on external Quran.Foundation written guidance retained outside the repository; no private correspondence or credential is reproduced here.

**Affected architecture:** No architecture change. This decision is evidence for the existing non-commercial intended-use boundary under `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5 and must be referenced by the future exact M5 source decision and import manifest.

**Affected roadmap gates:** `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` (both remain blocked; this decision does not independently pass either gate).

**Opened:** 2026-08-09.

**Status:** `DECIDED` (2026-08-09). **ADR reference:** None (Registry-only tier).

**Decision outcome:** On 2026-08-09, the ALSAMAD project owner approved controlled M5 work strictly on a non-commercial basis. The Quran reader remains free. Quran.Foundation content will not be sold, sublicensed, redistributed as a standalone dataset, exposed as a raw API dump, exposed as a separate download catalog, or exposed as a bulk content product. Provider requirements remain binding, including unmodified-content requirements, attribution, metadata preservation, Content Sync obligations where applicable, updates, and deletion/withdrawal obligations.

This decision explicitly does **not** approve ALSAMAD's future broader-platform monetization model, commercial launch using Quran.Foundation content, credentials, exact source/resource selection, manifest creation, provider fetch, dry run, publication, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, M6, or M7 / Knowledge Engine work. The broader-platform monetization question remains `PENDING` explicit written Quran.Foundation approval.

**Implementation evidence:** None.

**Supersedes / Superseded by:** None.

### REG-0010 — In-application display and standalone redistribution rights separation

**Category:** `Database`.

**Summary:** Whether permission to serve or display licensed content as an integrated part of ALSAMAD is the same right as permission to redistribute that content independently as a dataset, raw dump, download catalog, bulk product, or equivalent.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 defines `redistribution_allowed` as explicit redistribution permission, while the committed `drizzle/0002_content_integrity_foundation.sql` publication trigger requires that field to be true before an edition may be published. REG-0009 permits controlled non-commercial in-application use while prohibiting standalone redistribution. `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5 requires intended-use, commercial-use, redistribution, retention, and attribution rights to be separately known and machine-enforceable.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §§5.2.2, 5.2.4, 5.3.8–5.3.10; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5.

**Affected roadmap gates:** The ARC-001 implementation authorization and the later `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` gates. Neither M5 gate passes through this decision.

**Opened:** 2026-08-09.

**Tier rationale:** This changes a frozen Release 1 rights representation and a database-enforced religious-content publication boundary. Reversal after licensed content exists would be data-shaping, legally unsafe, and content-integrity sensitive, meeting the §7 ADR threshold.

**Status:** `DECIDED` (2026-08-09). **ADR reference:** `ADR-0003` (Accepted).

**Decision outcome:** Permission to serve or display content as an integrated part of ALSAMAD and permission to redistribute content independently are separate rights. The license contract records `in_application_display_allowed` and `standalone_redistribution_allowed`. Publication inside ALSAMAD requires affirmative in-application-display permission and does not require standalone-redistribution permission. Commercial-use and standalone-redistribution decisions must be explicitly resolved, but a known `DENIED` decision is compatible with an intended operation that does not exercise that capability. `UNKNOWN` remains fail-closed, and no denied capability may be exercised.

The existing redistribution right retains its original standalone-redistribution meaning and is never reinterpreted as application-display permission. Application-display permission defaults fail-closed and is never inferred from a historical redistribution value. Historical manifest schema/checksum semantics remain unchanged; corrected manifests require a new schema version. REG-0009 remains the controlling non-commercial/no-standalone-redistribution intended-use decision and is not superseded or modified by this entry.

**Implementation evidence:** None. The decision and ADR authorize no migration, provider access, fetch, dry run, publication, M5 gate PASS, M6, or M7 work.

**Supersedes / Superseded by:** None.

### REG-0018 — Sakīnah Phase-1 visual foundation: palette, surfaces, elevation, radii, and state roles

**Category:** `Product`, `Roadmap`.

**Summary:** Which exact semantic palette, surface hierarchy, border/elevation preference, radius scale, spacing foundation, and compact state-role distinctions govern the first visual-foundation implementation, reconciling the long-form document's previously open exact palette and radius descriptions with the concrete concise contract and committed frontend evidence.

**Committed evidence:** `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §§2–8, §§11–13, §§23–27, §42, and §50 define Sakīnah, semantic token ownership, restrained color, flat religious reading, rare elevation, and distinct component meanings while previously leaving exact palette values open; `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §8.1 and §8.3 carry concrete but partly conflicting palette/radius proposals; `DESIGN_SYSTEM.md` and committed `src/app/globals.css` already establish the deployed `12 / 20 / 32px` radius scale and the current green-neutral, emerald, gold, border, text, and danger values. Dirty/uncommitted CSS and prototype work are excluded from this evidence.

**Affected architecture:** `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §§1.3, 8, 11, 13, 27, 42, and 50; `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §§8.1 and 8.3; concise mirror `DESIGN_SYSTEM.md`.

**Affected roadmap gate:** `Sakīnah Visual Foundation Implementation`.

**Opened:** 2026-08-15.

**Tier rationale:** Registry only. This is an architecturally relevant cross-surface presentation contract, but its semantic token values and visual role bindings are reversible. It changes no persisted representation, canonical ownership, database, security, provider, religious-content integrity, or difficult-to-reconstruct module boundary. The ADR threshold in §7 is not met. **ADR reference:** None.

**Status:** `DECIDED` (2026-08-15).

**Decision outcome:** The Phase-1 visual direction is **Quiet Editorial Sanctuary**: calm, contemporary, premium, spiritually respectful, editorial, highly readable, and restrained. Islamic identity comes primarily from typography, proportion, reading dignity, source transparency, restrained geometry, and content hierarchy. The system reduces visible containers instead of restyling every object as a card. Ornamental overload, generic mosque or crescent decoration, gold-on-black luxury clichés, repeated background patterns, ordinary-section gradients, and shadows on every card are outside this foundation.

The frozen semantic palette is the existing committed family: light canvas `#F8FBF9`, principal surface `#FFFFFF`, grouped tonal surface `#EEF5F1`, primary text `#10231B`, secondary text `#617168`, primary emerald `#0F5B43`, strong emerald `#083D2D`, soft emerald `#DCECE5`, muted gold `#9B742B`, structural border `#DBE6E0`, and danger `#B42318`; dark canvas `#07130F`, principal surface `#0D1D17`, grouped tonal surface `#14271F`, primary text `#F3F7F4`, secondary text `#A2B0A8`, primary emerald `#68BC98`, strong emerald `#91D3B4`, soft emerald `#173D2E`, muted gold `#D3AE62`, structural border `#263C33`, and danger `#FF8A80`. Emerald is for primary action, selected navigation, progress, and restrained identity; gold is rare and reserved for trust/source/ceremonial emphasis and the governed focus treatment, not generic links; danger is only destructive or actual error state. Most sections remain unframed on the canvas, decorative gradients are exceptional, and status never depends on color alone.

The semantic surface hierarchy is: canvas/unframed content; principal content or reading surface; grouped tonal surface; interactive card; floating overlay; feature surface; and status/source surface where required. Canvas sections receive no default border or shadow. Reading surfaces are flat or minimally outlined. Grouped information uses tone first. Interactive cards use a subtle border and tone/state change. Floating overlays alone may use controlled elevation for layer separation. Feature size or radius does not automatically grant a strong shadow. Bordered-card-inside-bordered-card composition is avoided.

The required separation order is **tonal separation → border → shadow**. Shadows are rare, soft, and purposeful; dark mode relies primarily on tonal surfaces and borders rather than stronger shadow or glow. Informational and reading content receives no default hover lift. Interactive desktop cards prefer border/tone state changes before translation or elevation.

The authoritative semantic radius scale is exactly `12px` for controls, `20px` for standard cards/surfaces, and `32px` for feature or modal surfaces only when their scale and hierarchy warrant it. Square/technical treatment remains available where semantically necessary. Fully rounded pills are limited to genuinely compact pill-shaped filters, selections, statuses, or similar controls; ordinary cards, links, metadata, and navigation items do not become pills by default. The foundation retains a 4px spacing base with the existing common steps `8, 12, 16, 24, 32, 48, 64`; later page units choose semantic rhythm aliases and may not turn maximum section spacing into a universal default.

Status, category, badge, filter, navigation state, compact action, and source/trust metadata remain different semantic roles. Status communicates state with text plus another non-color channel; category classifies content; badge identifies compact provenance or identity; filter is an interactive selection with selected state; navigation state communicates current location; compact action remains visibly actionable; source/trust metadata carries provenance and may use scarce gold. A shared geometry token does not erase these differences.

Dark mode preserves the same hierarchy and meanings, uses the frozen low-glare values above, favors tonal separation and borders, prohibits glow as elevation, and preserves focus, source, status, Arabic readability, and diacritic clarity. Exact high-contrast and Quran-night mappings remain separately unresolved.

REG-0017 remains unchanged: Arabic UI is Noto Sans Arabic `v2.013`, devotional reading is Noto Naskh Arabic `v2.021`, Latin selection remains unresolved, and `--font-quran` remains intentionally unbound. This decision selects no Quran font, canonical verse typography, Mushaf layout, line height, verse marker, or Quran presentation treatment. It also does not finalize the logo, symbol, brand lockup, icon library, illustration style, motion tooling, component library, CSS technology, or exact breakpoints.

**Implementation boundary:** Only the Roadmap's later `Sakīnah Visual Foundation Implementation` unit may implement the governed semantic palette, surface, border/elevation, radius, spacing/rhythm alias, and state-role primitives. It may touch only the exact reviewed foundation-token hunk in `src/app/globals.css` and a focused `tests/visual-foundation.test.mjs`; if a reusable committed token source is proven necessary, governance must be revisited before adding it. Because `src/app/globals.css` contains unrelated dirty prototype work at decision time, implementation requires exact-hunk review and staging.

**No implementation authorization:** This Registry decision does not modify CSS or source, redesign any page, shell, header, navigation, Quran chrome, utility surface, or dark-mode page, finalize brand/icon work, bind Quran typography, or adopt Duas/Knowledge prototypes.

**Implementation evidence:** None. Governance is DECIDED; Sakīnah Visual Foundation Implementation is NOT STARTED.

**Supersedes / Superseded by:** None.

### REG-0011 — Immutable source import manifest and execution evidence separation

**Category:** `Database`.

**Summary:** Whether the immutable M5 source/import-authorization manifest may contain mutable or append-only execution state, checkpoints, observed results, reconciliation, rollback, or generated evidence references.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §§5.3.10–5.3.11 call the manifest immutable while assigning it execution-time fields including fetch timestamps, actual counts, status, failure, retry/checkpoint metadata, withdrawal state, and generated evidence references. `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5 requires a source decision and manifest before fetch while separately defining run state, checkpoints, reconciliation, rollback, and dry-run evidence. The committed M5.2 implementation hashes every v2 manifest field and also emits separate execution evidence.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §§5.3.10–5.3.11; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5 M5.2/M5.2A.

**Affected roadmap gates:** The ARC-002 credential-free implementation authorization and later `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` gates. Neither M5 gate passes through this decision.

**Opened:** 2026-08-09.

**Tier rationale:** This changes the immutable source-evidence identity, checksum boundary, retry linkage, and historical-reader contract used to authorize religious-content imports. Reversal after real provider runs exist would make source authorization and execution evidence ambiguous, meeting the §7 ADR threshold.

**Status:** `DECIDED` (2026-08-09). **ADR reference:** `ADR-0004` (Accepted).

**Decision outcome:** Manifest schema v3 defines an immutable `SourceImportManifest` containing only source/import-authorization facts independently known and approved for the intended operation. Its identity is `manifestId` plus `manifestChecksum`; the checksum covers only canonical immutable v3 source-manifest fields. Mutable or append-only execution evidence is owned by `ImportRunEvidence`, which binds to both values. One source manifest may have multiple runs and attempts without changing manifest identity.

Checkpoints, state transitions, retry/backoff state, observed counts and checksums, HTTP observations, timestamps, process/run/attempt identity, mutable status and errors, reconciliation, rollback/purge outcomes, audit events, generated evidence references, and final run/review disposition remain outside v3. Operational retry with unchanged authorization reuses the manifest. A source, resource, version, intended operation, legal decision, approved target, expected assertion, or authorized adapter/normalization-contract change requires a new manifest identity and checksum. Completed-run replay suppression and checkpoint monotonicity, conflict, staleness, and supersession protections remain fail-closed.

Historical v1 and v2 manifests retain their original schemas, canonical bytes, and checksum meanings and are never recomputed or reinterpreted under v3. V2 remains historically verifiable but is not the corrected real-provider manifest contract. No table or migration is added; the Release 1 catalog remains frozen at 30 tables.

**Implementation evidence:** None. This decision authorizes only a later credential-free ARC-002 contract-conformance implementation under the Roadmap. It authorizes no credential use, provider access, fetch, real-resource manifest, provider dry run, publication, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, ARC-003/004/005/006, M6, or M7.

**Supersedes / Superseded by:** None.

### REG-0012 — License-version immutability and historical license evidence

**Category:** `Database`.

**Summary:** Whether a `licenses` row's rights-bearing legal content (rights scope, attribution, retention, application-display/standalone-redistribution/derivative permissions, effective window) can be silently rewritten in place after the license has first been relied upon, and whether `SourceImportManifest` v3 sufficiently traces back to the exact immutable license evidence used at authorization time.

**Committed evidence:** `drizzle/0002_content_integrity_foundation.sql` `tr_licenses__identity` freezes only `provider_code`, `license_key`, `version`, and `effective_from`; every other `licenses` column remains updatable in place indefinitely. `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 documents this same narrow scope. `enforce_publication_rows()` checks license eligibility only once, at the moment an edition first publishes, against the then-current row. `SourceImportManifest` v3 (`ADR-0004`) freezes its embedded decision values but does not require `licenseDecisionReference`/`attributionReference` to be non-blank or to identify a specific license revision.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5, new ARC-004 authorization.

**Affected roadmap gates:** The ARC-004 credential-free implementation authorization and later `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` gates. Neither M5 gate passes through this decision.

**Opened:** 2026-08-09.

**Tier rationale:** This changes a frozen Release 1 database-enforced content-integrity boundary governing the legal terms behind published/imported religious content. Reversal after real licensed content exists would be legally unsafe and content-integrity sensitive, meeting the §7 ADR threshold — the same reasoning already applied to `ADR-0003` and `ADR-0004` for comparable `licenses`/manifest corrections.

**Status:** `DECIDED` (2026-08-09). **ADR reference:** `ADR-0005` (Accepted).

**Decision outcome:** A `licenses` row represents exactly one immutable provider/legal revision once first relied upon; `provider_code` + `license_key` + `version` continues to identify that revision under the existing unique-constraint identity model. Once a license row's `status` first reaches `active`, its rights-bearing fields — `rights_scope`, `attribution_text`, `terms_url`, `retention_policy`, `retention_days`, `in_application_display_allowed`, `standalone_redistribution_allowed`, `derivatives_allowed`, `effective_until` — become immutable alongside the already-frozen identity tuple. Only `status` and `updated_at` may still change, preserving existing expiry/revocation/withdrawal behavior without rewriting historical legal content. A later legal/provider revision requires a new license row under a new `version`, never an edit to an existing active row. `SourceImportManifest` v3's `licenseDecisionReference` and attribution reference must be non-blank and must identify the exact immutable license evidence relied upon; this is a validation tightening only and changes no manifest schema, checksum, or decision-snapshot behavior already established by `ADR-0004`.

No new table is required; the Release 1 catalog remains frozen at 30 tables. Migration `0006` is reserved for this correction's implementation; M6's future devotional migration placeholder correspondingly moves from `0006` to `0007`. This decision does not authorize migration `0006` itself, provider access, credentials, content fetch, a real-resource manifest, a provider dry run, publication, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, ARC-005/006, M6, or M7.

**Implementation evidence:** None. Implementation is not marked complete by this entry.

**Supersedes / Superseded by:** None.

### REG-0013 — Atomic Quran release selector and publication consistency

**Category:** `Database`.

**Summary:** Which already-published `editions` row (Arabic/script rendering) and which already-approved-and-published `quran_translation_editions` row (per locale) are served by default when more than one legitimately exists; whether Arabic edition activation and translation edition activation are one selector domain or two independent ones; and how the selector is added without a new Release 1 table.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.9 ("M5 activation must use a stable release/version selector outside the canonical table count so readers cannot observe a mixed provider version") states the requirement without specifying its physical shape; §5.2.4 and §5.3.6 carry `publication_state`/`review_status` but no default/active designation; §5.3.3–§5.3.7 establish that canonical `quran_ayahs`/`quran_surahs` identity is edition-independent and singular per the one approved Quran `work_id`, with both `quran_ayah_texts` and `quran_translation_texts` keying off `ayah_id` rather than a specific Arabic edition; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 1 capability checklist authorizes plural "Approved Quran text and script editions" and "Selected approved translations." `drizzle/0007_m5_publication_trigger_table_branching.sql` (AUD-001, committed at HEAD `5a901ec`) satisfies the AUD-001 precondition recorded in the Roadmap ("must be completed before ARC-005 implementation begins").

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.4, §5.3.6, and new §5.3.12 (release selector and activation).

**Affected roadmap gate:** New `ARC-005` authorization under Phase 5; does not itself pass `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated`.

**Opened:** 2026-08-10.

**Tier rationale:** A fundamental frozen-data-model addition governing which canonical religious content a guest-first reader is served by default; reversal after real published editions/translations exist and readers depend on a recorded default would be data-shaping and content-integrity sensitive — an ADR-threshold example matching the reasoning already applied in `ADR-0003`, `ADR-0004`, and `ADR-0005`.

**Status:** `DECIDED` (2026-08-10). **ADR reference:** `ADR-0006` (Accepted).

**Decision outcome:** `editions` and `quran_translation_editions` each gain one additive, non-identity `is_active_release boolean NOT NULL DEFAULT false` column. At most one `editions` row per `work_id` may be active while `published`, and at most one `quran_translation_editions` row per `locale_id` may be active while `approved`, each enforced by its own `PostgreSQL` partial unique index — two independent selector domains, never coupled, because canonical Quran structure is edition-independent and translations never need to match a specific Arabic edition. A `CHECK` constraint on each table ties `is_active_release` to the corresponding published/approved state, so withdrawal cannot leave a withdrawn row marked active. Activation and rollback are the same two-statement, single-transaction primitive (clear the prior active row, then set the new one); a failed switch leaves the prior state unchanged. Zero-active is a valid, honestly-reported unavailable state, never silently resolved by an implicit "most recent" fallback.

`is_active_release` is a **default-selection signal, not independent proof of current servability**: it cannot see the backing license's `status`/`effective_until`, a translation's backing generic edition state, or `locales.enabled`, and license time-expiry involves no write at all. Every public read must therefore re-derive the full live eligibility chain at read time, in the same bounded query that resolves the active candidate; an active-but-now-ineligible candidate fails closed exactly like a zero-active selector, with no silent fallback. Governed activation still validates full eligibility at the moment of activation, but that is a point-in-time gate, not a standing guarantee. Upstream safety operations (license revocation/expiry, generic-edition withdrawal, locale disablement) remain unblocked and unchanged; no cross-layer trigger is added to `licenses`/`editions` to block them or to auto-clear `is_active_release` when they occur — read-time revalidation carries that guarantee instead, and the Publisher/governed-activation workflow is responsible for explicit deactivation, rollback, or replacement once a loss is noticed.

`is_active_release` is added to the existing post-publication immutability exemption list alongside `publication_state`/`review_status` and `updated_at`. The Quran module owns the selector's physical state per the existing Roadmap module ownership matrix; the existing Publisher role (`ALSAMAD_ADMIN_ARCHITECTURE.md` §30.1) exercises the existing guarded-publication authority to mutate it — no new table, role, or owning module is introduced. Full rationale, alternatives, and rejected alternatives are recorded in `ADR-0006`.

No new table is required; the Release 1 catalog remains frozen at 30 tables. Migration `0008` is reserved for this decision's future implementation; M6's future devotional migration placeholder correspondingly moves from `0008` to `0009`. This decision does not authorize migration `0008` itself, provider access, credentials, content fetch, a real-resource manifest, a provider dry run, publication, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, ARC-006, M6, or M7.

**Implementation evidence:** None. Implementation is not marked complete by this entry.

**Supersedes / Superseded by:** None.

### REG-0014 — Knowledge Engine Phase 1 (KE-1): Quran/Adhkar entity, relationship-shape, and in-memory search unification

**Category:** `Roadmap`.

**Summary:** Whether the schema-free, in-memory TypeScript unification of the Quran/Adhkar entity, relationship-shape, and deterministic search-matching concepts already proposed in `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §16 Phase 1 may be implemented now, scoped to Quran and Adhkar only.

**Committed evidence:** `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §16's phased adoption path names Phase 1 as "Application-layer unification of the Adhkar/Duas/Quran source-metadata shape into one shared contract... 0 — TypeScript/application refactor only," requiring zero new physical tables. `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s "Knowledge Engine governance track (M7.0-track)" section (Governance Unit 1, committed `ca9358a`) already establishes that Knowledge Engine gates are named `M7.0-track` and reserves the structure this entry fills. `ALSAMAD_DATABASE_ARCHITECTURE.md` §2.1/§12 (anti-speculative-infrastructure) and §10 ("Add nodes and edges as projections over stable canonical identifiers; promote only independently curated relations to durable state") support keeping this unit schema-free until a real editorial need is proven.

**Affected architecture:** `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` (KE-1 scope only, per its own §16 Phase 1).

**Affected roadmap gate:** New `M7.0-track` / `KE-1` sub-gate under the Governance Unit 1 structure; does not affect, and is independent of, `M5 Gate 3`, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, or `M6`.

**Opened:** 2026-08-12.

**Tier rationale:** Registry only — reversible TypeScript/application-layer change; no persisted physical representation; no database, schema, or migration of any kind; no data-shaping or irreversible content-integrity decision; no cross-module persisted ownership change. Fails `ALSAMAD_DECISION_REGISTRY.md` §7's ADR threshold on its second prong (reversal is neither expensive nor dangerous — the affected files can simply be deleted).

**Status:** `DECIDED` (2026-08-12). **ADR reference:** None (Registry-only tier).

**Decision outcome:** Approves implementation of exactly **KE-1** — the entity/identity layer, relationship-edge constructor/validator, and in-memory deterministic search-matching layer, together with Quran and Adhkar adapters only — bounded to exactly this file list:

```
src/lib/knowledge/types.ts
src/lib/knowledge/identity.ts
src/lib/knowledge/item.ts
src/lib/knowledge/relationships.ts
src/lib/knowledge/errors.ts
src/lib/knowledge/adapters/shared.ts
src/lib/knowledge/adapters/quran.ts
src/lib/knowledge/adapters/adhkar.ts
src/lib/knowledge/search/matching.ts
src/lib/knowledge/search/filters.ts
src/lib/knowledge/search/search.ts
src/lib/knowledge/search/types.ts
src/lib/knowledge/search/index.ts
tests/knowledge-entity-layer.test.mjs
tests/knowledge-relationship-layer.test.mjs
tests/knowledge-search-layer.test.mjs
```

This entry explicitly does **not** approve: `src/lib/knowledge/adapters/duas.ts` (depends on uncommitted `src/lib/duas/content/*`, itself governed by a separate, unresolved Duas/M6.0 decision); `src/lib/knowledge/topics.ts`, `src/lib/knowledge/collections.ts`, or `src/lib/knowledge/references.ts` (Phase 2/4 territory per `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §16); any database, schema, or migration file; any route, page, or component; any AI implementation; any later Knowledge Engine phase (2 through 7+); Hadith participation; semantic search; or the AI Search Assistant.

**Duas boundary:** committed KE-1 files must carry zero reference to `src/lib/duas/**`. This is a binding acceptance condition, not merely a recommendation — it exists specifically so KE-1 authorization cannot be used to indirectly smuggle in the still-blocked Duas adapter.

**Premature labeling correction required:** the existing prototype's comments and test descriptions self-label portions of this code "M7.1," "M7.2," and "M7.3" — labels that predate Governance Unit 1's `M7.0-track` naming and were never themselves authorized. Before any KE-1 commit, these must be corrected to reference `M7.0-track` / `KE-1` terminology instead.

**Runtime-inert requirement:** KE-1 may be committed before Quran production activation only if it remains completely unwired from runtime. Acceptance condition: no file under `src/app/**`, `src/components/**` (excluding the unrelated, independently-governed `src/components/duas/**` work), or `scripts/**` may import anything from `src/lib/knowledge/**`. No feature flag is introduced for this purpose — none exists anywhere in this codebase today, and this narrow, currently-uncalled library does not warrant introducing one.

**Later KE-1 implementation acceptance contract:** before a KE-1 implementation commit may be made, all of the following must hold: exactly the file boundary above (no more, no less); zero reference to `src/lib/duas/**`; zero database/schema/migration file touched; zero route/component/script importing `src/lib/knowledge/**`; the M7.1/M7.2/M7.3 labels corrected to `M7.0-track`/`KE-1`; `tests/knowledge-entity-layer.test.mjs`, `tests/knowledge-relationship-layer.test.mjs`, and `tests/knowledge-search-layer.test.mjs` passing; `npm run typecheck` and `npm run lint` (zero warnings) passing; the full existing repository test suite (`npm test`) remaining green; and no unauthorized feature or runtime wiring introduced anywhere else in the same change.

**Independence from Quran/M5, Duas/M6.** This entry changes no M5 or M6 status: `M5 Gate 3` remains `PARTIAL`; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`; `M6` remains `BLOCKED`; Duas' independently-governed status is unchanged. KE-1 code authorization does not require `M5 Quran Import Activated` to PASS — but any later runtime surface built on KE-1 must still resolve Quran content honestly (`empty`/`pending`/`available`), never fabricating content when upstream Quran data is unavailable, exactly as every other Quran-adjacent surface in this codebase already does.

**Implementation evidence:** None. This entry authorizes implementation; it does not itself constitute or claim implementation. No `src/lib/knowledge/**` or `tests/knowledge-*.test.mjs` file is staged or committed by this entry.

**Supersedes / Superseded by:** None.

### REG-0015 — Knowledge Engine Phase 2 (KE-2): durable topic vocabulary and content assignments

**Category:** `Database`, `Roadmap`.

**Summary:** Whether Phase 2 may adopt a durable, curated topic vocabulary and FK-enforced Quran/Adhkar-to-topic assignments, and how that package remains truthful to the frozen 30-table Release-1 catalog.

**Committed evidence:** `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §6.2 layers 1–2 and §16 Phase 2 specify a controlled topic vocabulary plus content-to-topic edges for Quran and Devotional content; `ALSAMAD_DATABASE_ARCHITECTURE.md` §§1, 2.1, 2.3, and 10 classify the Knowledge Graph as zero Release-1 tables while permitting separately approved additive future packages; KE-1 implementation `e073879` proves stable owning-module identity without authorizing persistence. Prototype `src/lib/knowledge/topics.ts` is evidence only and is not authority.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1 and `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §§6.3/16 Phase 2.

**Affected roadmap gate:** `M7.0-track / KE-2 — Controlled Topic Vocabulary and Content Assignment Foundation`.

**Opened:** 2026-08-13.

**Tier rationale:** Registry + ADR. The decision is architecturally material because it introduces persistent cross-module classification state, two physical tables, and a new `knowledge` ownership boundary. Reversal after stable topic IDs and curated religious-content assignments exist would be data-shaping, content-integrity sensitive, and require cross-module migration/reconstruction. Both prongs of §7 are met. `ADR-0007` records the physical rationale and rejected alternatives.

**Status:** `DECIDED` (2026-08-13). **ADR reference:** `ADR-0007` (Accepted).

**Decision outcome:** Governance-approves in principle exactly KE-2's later additive, non-Release-1 two-table package:

1. `topics`, owned by `knowledge`, with UUIDv7 identity, immutable unique lowercase canonical key, locale-key-validated localized names, draft/approved/retired lifecycle, and accountable human creation/approval metadata;
2. `content_topics`, owned by `knowledge`, with one topic FK and exactly one canonical endpoint FK — `quran_ayahs.id` or Adhkar-only `devotional_items.id` — plus advisory weight, draft/approved/rejected review state, curator/reviewer evidence, one non-rejected current assignment per canonical pair, immutable rejected history with new-identity replacement, and restrictive deletion.

The Devotional endpoint is constraint-trigger validated through `content_items` as `owning_module = 'devotional'` and `content_type = 'dhikr'`; Duas cannot participate. Draft assignments may precede publication eligibility, but approval fails closed unless Quran owner state is published and currently release-eligible under Database Architecture §5.3.12, or the Adhkar owner has a published `source_verified` revision. Future reads must revalidate the same canonical-owner predicate, so later withdrawal, unpublication, revocation, expiry, deactivation, supersession, or verification loss stops use without copying owner state or blocking canonical safety transitions. Locale-key validation and locale deletion use one identical global transaction-scoped locale-integrity advisory lock under required `READ COMMITTED`, eliminating row-order deadlocks and preventing concurrent JSONB reference creation and deletion from both committing while preserving lawful deletion of an unreferenced locale. A `BEFORE UPDATE` guard freezes every column of a rejected assignment; replacement requires a new row. The two real nullable FKs plus an exactly-one check replace any unvalidated polymorphic text endpoint. No canonical Quran or Devotional content is copied or re-owned.

**Release-1 classification:** Neither table belongs to the frozen Release-1 30. They are a separately approved later additive package under Database Architecture §10.1. The historical 30-table count remains exact and unchanged. Migration execution must wait until its referenced Release-1 dependencies exist, use a new forward-only number assigned from the then-authoritative sequence, and leave every prior migration byte-unchanged. It may not take M6's reserved `0010`.

**Implementation boundary:** A later execution is limited to the exact Roadmap boundary: `src/db/schema.ts`; one mechanically numbered `drizzle/*_ke2_topics.sql`; `src/lib/knowledge/topics.ts`; `src/lib/knowledge/topic-repository.ts`; `tests/knowledge-topic-layer.test.mjs`; and the KE-2 additions within `scripts/db-verify.mjs`. Existing prototype content must conform before inclusion and has no independent authority.

**No implementation/runtime/data authorization:** This entry does not authorize or claim a migration, schema/code/test change, seed row, topic, religious-content assignment, runtime import, search expansion, related-content UI, editorial/admin UI, provider/network/credential work, or deployment. Implementation is `NOT STARTED` until a separate execution satisfies every Roadmap acceptance condition. Empty/unavailable state must remain honest and fail closed.

**Explicit exclusions:** `src/lib/knowledge/collections.ts`, `src/lib/knowledge/references.ts`, `src/lib/knowledge/adapters/duas.ts`, generic persisted `knowledge_edges`, collections/references, Duas, Articles/Guides, Hadith, Talibeen, entities, topic-to-topic edges, AI suggestions, semantic search, the AI Search Assistant, runtime search expansion, related-content UI, editorial/admin UI, seed data, provider/network/credentials, M5 Gate 4/5, canonical ownership changes, and Phase 3 onward.

**Dependency truth:** Governance does not require `M5 Gate 3` PASS. This decision changes no M5 or M6 state, does not authorize M5 Gate 4/5, does not unblock M6, does not resolve Duas governance, and does not require KE-1 runtime wiring. KE-1 remains COMPLETE. Physical implementation requires this governance package to be committed and the referenced physical dependency tables to exist.

**Implementation evidence:** None. Governance is decided; KE-2 implementation remains NOT STARTED.

**Supersedes / Superseded by:** None.

### REG-0016 — Editorial Identity Foundation prerequisite

**Category:** `Database`, `Security`, `Roadmap`.

**Summary:** Whether the already-counted Release-1 `editorial_users` table may be implemented before the rest of Phase 7 as a provider-independent durable human-accountability FK root, without authorizing authentication, authorization, administration, or editorial workflows.

**Committed evidence:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.5 defines `editorial_users` as staff identity independent of optional public accounts, with a unique staff subject and active/disabled lifecycle; `ALSAMAD_SECURITY_ARCHITECTURE.md` §§6 and 8 require stable dedicated staff identity separate from public accounts; `ALSAMAD_ADMIN_ARCHITECTURE.md` §§2.4, 4.1–4.2, 30–32 require attributable individual actions while keeping authentication-dependent linking separate; `REG-0015`/`ADR-0007` require accountable staff FKs before KE-2 may be implemented.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.5.1.

**Affected roadmap gate:** `M7-prerequisite / Editorial Identity Foundation`.

**Opened:** 2026-08-13.

**Tier rationale:** Registry + ADR. This fixes a durable Release-1 actor identity used by future cross-module content-integrity FKs and establishes a security-sensitive boundary between internal staff identity and authentication-provider identity. Reversal after accountable records reference these UUIDs would require data-shaping cross-module reconstruction and could damage historical attribution. Both §7 conditions are met; `ADR-0008` records the rationale and rejected alternatives.

**Status:** `DECIDED` (2026-08-13). **ADR reference:** `ADR-0008` (Accepted).

**Decision outcome:** Governance-approves in principle the early, independent implementation of exactly the existing Release-1 `editorial_users` table as an Editorial-owned, provider-independent, runtime-inert, seed-free identity root. Its four columns are exactly `id`, `status`, `created_at`, and `updated_at`. `id` is the sole durable internal staff subject: an application-generated immutable UUIDv7 primary key with no database default. No second staff key or authentication/profile attribute is introduced. `status` is `active` or `disabled`, defaults to `disabled`, permits disablement and reactivation, and is independent of authentication. Disabled identities remain valid historical FK targets but are ineligible for new accountable actions at each future consumer boundary.

Future authentication identity linking may map a provider/authentication identity to `editorial_users.id` without changing that durable FK identity, but no such relation or provider subject is authorized here. Referenced identities are deletion-restricted; no cascade may erase accountable evidence. The table has no outgoing FK and contains no email, username, display name, public-user link, provider subject, credential, password, passkey, MFA, recovery, role, capability, scope, grant, session, or profile data.

**Release-1/count truth:** `editorial_users` is already one of the frozen 30 Release-1 tables. Before implementation, 16 of 30 are physical; after this prerequisite, 17 of 30 are physical; if M6 later adds its four already-counted tables, 21 of 30 are physical. The historical catalog remains exactly 30.

**Implementation boundary:** A later execution is limited to `src/db/schema.ts`, one mechanically numbered `drizzle/*_editorial_identity_foundation.sql`, the single corresponding mechanical registration append in `drizzle/meta/_journal.json`, and the Editorial Identity additions within `scripts/db-verify.mjs`. The journal authorization permits only the entry required to register this one migration; every existing journal entry and migration remains unchanged. Migration `0010_devotional_content_foundation.sql` remains reserved for M6 and cannot be used, renamed, or displaced. The migration number is assigned from the authoritative repository state at execution; baseline observation that `0011` is currently lawful is context only, not a permanent preclaim.

**No implementation/runtime authorization:** This governance entry and ADR do not themselves implement the table. Implementation remains `NOT STARTED` until a later execution satisfies the Roadmap gate. No production row, bootstrap identity, authentication, authorization, runtime import, API, route, component, UI, or workflow is authorized.

**Explicit exclusions:** `editorial_role_grants`, `review_records`, `publication_events`, `audit_events`, any auth-link table, public `users`/`user_identities`, credentials/passwords/passkeys/MFA/recovery/sessions, roles/capabilities/scopes/grants, staff seeds/bootstrap accounts, Admin API/routes/pages/components/UI, editorial queues/workflows, topic-management UI, content review/publication workflows, KE-2 implementation, M6/`devotional_items`, Duas, Quran/provider work, M5 Gate 4/5, Phase 7 completion, and later Knowledge Engine phases.

**Dependency truth:** This prerequisite is independent of M5 and M6 and changes no provider, Quran, Duas, or runtime status. It removes only the future `editorial_users` physical blocker once implemented. `devotional_items` remains an independent hard KE-2 blocker; KE-2 implementation remains NOT STARTED. KE-1 remains COMPLETE; KE-2 governance remains COMPLETE; M5 Gate 3 remains PARTIAL; M5 Provider Import Dry Run Verified and M5 Quran Import Activated remain NOT PASS; M6 remains BLOCKED.

**Implementation evidence:** None. Governance is decided; Editorial Identity Foundation implementation remains NOT STARTED.

**Supersedes / Superseded by:** None.

### REG-0017 — Typography Phase 1: Arabic UI and devotional-reading font roles

**Category:** `Product`, `Roadmap`.

**Summary:** Which exact, locally delivered Arabic fonts may back the general user-interface and devotional-reading roles before canonical Quran typography can be selected, and how that separation prevents a devotional font from becoming an implicit Quran-font decision.

**Committed evidence:** `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §§9.1–9.7, §10, and §50 distinguish general Arabic UI, devotional reading, and Quranic Arabic; `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §8.2 names the Phase-1 candidates and requires edition-specific Quran glyph validation; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` keeps Quran font rights and selection behind the Presentation gate. Official upstream evidence is the `notofonts/arabic` releases `NotoSansArabic-v2.013` and `NotoNaskhArabic-v2.021`, each licensed under SIL Open Font License 1.1.

**Affected architecture:** `ALSAMAD_SAKINAH_DESIGN_SYSTEM.md` §§9–10 and §50; `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §8.2; concise mirror `DESIGN_SYSTEM.md`.

**Affected roadmap gate:** `Typography Phase 1 — Deterministic Arabic UI and Devotional Reading Fonts`.

**Opened:** 2026-08-14.

**Tier rationale:** Registry only. The role binding and locally delivered presentation assets are reversible and change no persisted content representation, canonical ownership, database, security, provider, or religious-content source boundary. Reversal does not require dangerous or cross-module data reconstruction, so the ADR threshold in §7 is not met. **ADR reference:** None.

**Status:** `IMPLEMENTED` (2026-08-15; decision recorded 2026-08-14).

**Decision outcome:** Phase 1 selects Noto Sans Arabic release `NotoSansArabic-v2.013` for Arabic user-interface typography and Noto Naskh Arabic release `NotoNaskhArabic-v2.021` for long-form/general devotional Arabic reading. Both come from the official `notofonts/arabic` project under SIL Open Font License 1.1 and must be self-hosted from version-pinned local assets with the applicable copyright and complete OFL notice; no runtime third-party font request is permitted.

The official tagged releases contain no upstream-native WOFF2 binaries. Their authoritative Phase-1 source assets are `NotoSansArabic/full/variable-ttf/NotoSansArabic[wdth,wght].ttf` inside `NotoSansArabic-v2.013.zip` (SHA-256 `1301aceaea84c501cf2e6dcfb3182e2328c8eae5725817fcb239672bda7154f1`) and `NotoNaskhArabic/full/variable-ttf/NotoNaskhArabic[wght].ttf` inside `NotoNaskhArabic-v2.021.zip` (SHA-256 `6c050ab9bd087d69b733c505a7576e60c528c2f33cd7b91005a5bd7da4514032`). The approved repository webfont identities `NotoSansArabic[wdth,wght]-v2.013.woff2` and `NotoNaskhArabic[wght]-v2.021.woff2` are deterministic, unsubsetted derived assets, not upstream-native WOFF2 files.

Derivation is authorized only in an isolated temporary environment using Python 3.12.x with its exact patch version recorded, FontTools `4.63.0`, Brotli `1.2.0`, and exactly `fonttools ttLib.woff2 compress <input.ttf> -o <output.woff2>` with default WOFF2 transforms. Subsetting, glyph removal, intentional glyph reordering by application tooling, axis instancing/removal, family renaming, metadata editing, table pruning, hint removal, custom optimization, Quran binding, and application runtime dependency on Python, FontTools, or Brotli are prohibited.

Implementation must first verify the archive SHA-256, extract the exact governed TTF, and record its SHA-256, Python patch version, FontTools/Brotli versions, and exact command. Each asset must be converted twice in separate clean temporary directories; outputs must have identical SHA-256 values or implementation fails closed. The final WOFF2 SHA-256 is implementation evidence and must be reviewed before repository adoption. Source versus derived/decompressed verification must preserve `fvar`, `avar` where present, `gvar` where present, `GDEF`, `GSUB`, `GPOS`, `cmap`, `name`, `OS/2`, relevant hint/layout tables, Arabic shaping, and mark positioning. Expected WOFF2 container effects—table ordering, `head` flag changes, and `DSIG` removal where applicable—are permitted and are not by themselves corruption.

The Noto Sans Arabic variable asset is the smallest current-UI set because one binary supplies the committed normal/default 400 weight and the existing emphasized weights 500, 600, 650, 700, 750, and 800 at normal width; Phase 1 authorizes only the 400–800 weight range and default width, with no decorative or future-only face. Noto Naskh Arabic authorizes only its regular 400 reading instance; no bold devotional-reading requirement is approved. Safe fallbacks remain `Tahoma, Arial, sans-serif` for Arabic UI and `serif` for devotional reading.

Canonical Quran typography is a separate role represented by `--font-quran` and remains intentionally **UNBOUND**. Noto Naskh Arabic's devotional selection is not Quran-font approval, no Quran binary or fallback binding is authorized, and no canonical Quran surface may silently inherit this decision. Quran typography remains blocked pending the approved canonical source/resource and exact script/edition; a representative corpus covering Uthmani marks, waqf symbols, annotation characters, combining marks, and superscript alif; line-breaking and cross-browser/OS shaping QA; the exact Quran font/version; licensing/distribution evidence; and presentation approval. Latin typography also remains unresolved.

**Implementation boundary:** Only the later Roadmap unit may authorize implementation. Its boundary is `src/app/fonts.ts`, `src/components/shell.tsx`, the exact typography hunk in `src/app/globals.css`, the two approved WOFF2 assets above, applicable OFL notice file(s), and `tests/font-loading.test.mjs`. No Quran font binary is included.

**No implementation authorization:** This Registry decision selects roles and assets but does not download fonts, modify source or CSS, implement loading, activate Quran typography, restyle routes, adopt prototype work, or authorize provider/import activity.

**License-format reconciliation:** SIL OFL 1.1 permits redistribution and self-hosting of the original TTFs and the converted WOFF2 derivatives. Derived files remain under OFL 1.1 and must ship with the applicable copyright and complete license notice. Format conversion alone requires no family rename under the applicable Noto notice; ALSAMAD must preserve family metadata and must not imply upstream endorsement of its derived binaries.

**Implementation evidence:** Typography Phase 1 implementation is **COMPLETE** at commit `ee0bed65e6999a6546ead663c027072dc427e831`; the applicable Roadmap gate is `TYPOGRAPHY PHASE-1 REAL-BROWSER ACCEPTANCE = PASS`. This citation records the later execution and passed acceptance of the original Roadmap authorization; it does not change the REG-0017 decision outcome or imply that the Registry decision itself performed implementation.

**Supersedes / Superseded by:** None.

### REG-0019 — M6.0 Duas Mobile-First Foundation: narrow independence from the M5 production-activation dependency

**Category:** `Roadmap`.

**Summary:** Whether `M6.0 Duas Mobile-First Foundation` — the schema-free, static-content-source Duas UI gate — may proceed independently of the phase-level `M5 Quran Import Activated` production-activation dependency that otherwise blocks all of Phase 6, given that M6.0 itself requires no database schema, no Quran provider access, and no new devotional content.

**Committed evidence:** `ALSAMAD_IMPLEMENTATION_ROADMAP.md` line 1444 states the M6.0 gate "requires no database schema"; line 1470 confirms its content-source abstraction is "a static/honest-empty source"; the Phase 6 "Explicitly excluded scope" and M6.0's own "Prohibited work" clauses (lines 1357–1365, 1477) already forbid any database migration, Quran provider/import work, new devotional content, or Knowledge Engine work inside M6.0 — none of which this entry changes or adds. Line 1372 already records, without resolving, that commit `7cd72ee` (Adhkar mobile-first foundation) implemented equivalent devotional-domain UI scope before the M5 dependency was satisfied "without a recorded exception," and explicitly states that gap "only prevents repeating it for the remaining M6 units" — this entry is the first such recorded exception, deliberately scoped to prevent repeating the *unrecorded* version of that gap for M6.0, not to relax the underlying M5 requirement itself. `REG-0014` (Knowledge Engine Phase 1 / KE-1) is the repository's existing precedent for exactly this governance shape: a Registry-only decision that grants one named `M7.0-track` sub-unit independence from the same phase-level M5 dependency while leaving `M5`, `M6`, and every other unit's status unchanged.

**Affected architecture:** None. This is a Roadmap-sequencing/gating decision only; it amends no Product, Database, Security, or other domain architecture document, and it does not alter M6.0's already-approved Included scope, Prohibited work, Acceptance gates, or PASS criteria (`ALSAMAD_IMPLEMENTATION_ROADMAP.md` lines 1462–1483), which remain exactly as previously approved.

**Affected roadmap gate:** `M6.0 Duas Mobile-First Foundation Verified` only. Does not affect, and is independent of, `M6.1 Devotional Schema Foundation Verified`, `M6.2 Devotional Content Integration Verified`, `M5 Provider Import Dry Run Verified`, or `M5 Quran Import Activated`.

**Opened:** 2026-08-20.

**Tier rationale:** Registry only — a reversible Roadmap-sequencing/gating decision; no persisted physical representation, schema, migration, canonical-ownership change, or content-integrity decision of any kind. Reversal requires only reverting this entry's status and the full set of corresponding Roadmap updates listed in §"Roadmap operationalization" below — neither expensive nor dangerous. Fails `ALSAMAD_DECISION_REGISTRY.md` §7's ADR threshold on its second prong, exactly as `REG-0014` did for the analogous KE-1 exception. **ADR reference:** None (Registry-only tier).

**Status:** `DECIDED` (2026-08-20).

**Decision outcome:** Approves exactly one narrow exception: **`M6.0 Duas Mobile-First Foundation` does not require `M5 Quran Import Activated` to PASS before its own implementation may proceed**, provided M6.0 remains strictly within its already-committed Roadmap boundary — the Included scope, Prohibited work, Acceptance gates, and PASS criteria at `ALSAMAD_IMPLEMENTATION_ROADMAP.md` lines 1462–1483, unchanged by this entry. This decision authorizes nothing beyond removing that one dependency as it specifically applies to M6.0.

**Roadmap operationalization.** Per `ALSAMAD_DECISION_REGISTRY.md` §2 item 4 and §10, this Registry entry alone does not authorize implementation — `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s own gate mechanism remains the exclusive authority for *when* implementation is authorized. This decision is operationalized by the following corresponding Roadmap updates, identified by stable section/paragraph reference rather than line number:

*Operative amendments (change the M5-dependency semantics for gate 1 only):*

1. Phase 6 "Dependencies" — the `M5, complete through its production activation gate (M5 Quran Import Activated)` bullet, amended to record this exception.
2. Phase 6 "M6 acceptance and separated gates" — the sentence "no gate relaxes the M5 production-activation dependency above," amended to name gate 1 (`M6.0`) as the sole exception.
3. `### M6.0 — Duas Mobile-First Foundation`'s own "Dependency position" sentence (originally "Still subject to the phase-level M5 production-activation dependency above"), amended to state the exemption directly. This is the core operative change; the other four locations only record or cross-reference it.

*Consistency-only cross-references (no change to those sections' own substantive content or status claims — corrected only because this entry's existence made their prior unqualified "Duas governance is unchanged" wording stale):*

4. `### M7-prerequisite / Editorial Identity Foundation`'s "Status and dependency truth" paragraph.
5. `### Knowledge Engine governance track (M7.0-track)`'s "Status" paragraph.

All five amendments carve out this one exception for gate 1 (`M6.0`) only, or note that this entry is unrelated to the section they appear in; gates 2 and 3 (`M6.1`, `M6.2`) and every other M5/M6 status statement anywhere in that document remain unchanged. A future reversal of this entry must reconsider all five locations above, not only the three operative amendments.

**This entry explicitly does NOT mean, and does not approve:**

- That `M6` as a whole is unblocked. `M6.1 Devotional Schema Foundation Verified` and `M6.2 Devotional Content Integration Verified` remain fully subject to the phase-level M5 production-activation dependency, exactly as before this entry.
- That `M5 Quran Import Activated` is satisfied, waived, advanced, or reinterpreted in any way. `M5 Gate 3` remains `PARTIAL`; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`.
- Any Quran provider credential use, network call, dry run, license/source approval, scholarly approval, or production activation.
- Any database migration, schema change, or physical table — M6.0 already requires none, and this entry grants none.
- Any Knowledge Engine (`M7.0-track`) implementation, runtime wiring, or adoption of `src/lib/knowledge/adapters/duas.ts` or any sibling Knowledge prototype file; that track's status and its own separate, unresolved governance are entirely unchanged by this entry.
- Any new Editorial General Dua entry, devotional seed row, or content beyond what M6.0's own contract already authorizes (already zero, per line 1364).
- That the existing working-tree Duas prototype (`src/lib/duas/**`, `src/components/duas/**`, `src/app/[locale]/duas/**` uncommitted changes, `tests/duas-*.test.mjs`) is thereby reviewed, accepted, adopted, correct, or authoritative. That prototype remains exactly as non-authoritative after this entry as before it. Every defect identified in the prior prototype reconciliation — including the `getCategoryItems("general")` availability/items mismatch and the collection-reader array-index/`order` inconsistency — remains an open finding to be resolved during the separately-reviewed M6.0 implementation unit, not settled or excused by this entry.
- That this entry itself constitutes, stages, commits, or performs implementation. A separate implementation authorization/review against the unchanged M6.0 Roadmap contract remains required before any file may be staged or committed.

**Independence from M5, M6.1, and M6.2.** This entry changes no other M5 or M6 status: `M5 Gate 3` remains `PARTIAL`; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`; `M6.1` and `M6.2` remain `BLOCKED`, each still fully subject to the unmet M5 production-activation dependency exactly as before this entry; the overall `M6` milestone (requiring all three gates) remains not fully passable until `M6.1` and `M6.2` separately clear that dependency. Only `M6.0`, and only `M6.0`, is exempted — precisely mirroring how `REG-0014` exempted only `KE-1` from the same phase-level dependency while leaving every other unit's M5/M6 status unchanged.

**Implementation evidence:** None. This entry authorizes `M6.0` implementation to proceed independently of the M5 gate; it does not itself constitute, stage, or commit any implementation. No `src/lib/duas/**`, `src/components/duas/**`, Duas route, or `tests/duas-*.test.mjs` file is touched, staged, or committed by this entry.

**Supersedes / Superseded by:** None.

### REG-0020 — Quran.Foundation Arabic Quran text retention permission (M5 Gate 3 storage/retention sub-item)

**Category:** `Roadmap`, `Security`.

**Summary:** Whether new written Quran Foundation Developer Support guidance grants Alsamad-specific, unmodified-text-only, long-term database retention permission for QF-provided Arabic Quran text, narrowing — without closing — the `M5` Gate 3 legal/license gate's outstanding storage/caching/retention sub-item, and whether Content Sync is currently required for that text.

**Committed evidence:** `ALSAMAD_IMPLEMENTATION_ROADMAP.md` line 124 ("Quran.Foundation content retention follows the seven-day default unless written permission or independent licensing permits longer storage") and the M1 excluded-scope table ("Permanent Quran.Foundation storage without written permission | Prohibited; seven-day default applies") already define the exception mechanism this entry exercises. `ALSAMAD_SECURITY_ARCHITECTURE.md`'s "default seven-day legal retention ceiling" carries the same conditional framing. Phase 5's Gate 3 (legal/license gate) lists "storage, caching, and retention rights" among its named blocking sub-items, alongside in-application display rights, license/terms identity, attribution obligations, commercial-use classification, standalone redistribution classification, derivative/transformation limits, update/withdrawal/deletion/revocation obligations, and provider-exit/content-purge obligations. `REG-0009` already anticipated "Content Sync obligations where applicable" as a standing provider requirement. The new evidence is written correspondence from Quran Foundation Developer Support, retained outside the repository per the same non-reproduction convention `REG-0009` already established; no private correspondence or credential is reproduced here.

**Affected architecture:** No architecture change. This is a Roadmap-gate evidence entry only, narrowing one named Gate 3 sub-item; it amends no Product, Database, or Security architecture document.

**Affected roadmap gate:** `M5` Gate 3 (legal/license gate) only — its storage/caching/retention sub-item, for Arabic Quran text specifically. Does not affect, and is independent of, Gates 1, 2, 4, 5, 6, or 7, `M5 Provider Import Dry Run Verified`, or `M5 Quran Import Activated`.

**Opened:** 2026-08-21.

**Tier rationale:** Registry only. This is evidence toward an already-established gate mechanism (the M1/Security "written permission" exception), not a new architectural decision; it changes no persisted representation, canonical ownership, database, or difficult-to-reverse structure. Reversal, if the permission were later withdrawn, requires only reverting to the existing default seven-day rule already enforced as the baseline. Fails the §7 ADR threshold on its second prong. **ADR reference:** None (Registry-only tier).

**Status:** `DECIDED` (2026-08-21).

**Decision outcome:** Quran Foundation Developer Support has expressly confirmed, in writing and specific to Alsamad, that under Developer Terms §3.1(3)(a) Alsamad may retain a verified, unmodified copy of QF-provided Arabic Quran text in its database beyond the general one-week limit, for use within the Alsamad application. The general seven-day retention default accordingly does not apply to that specific Arabic Quran text under this express permission; it continues to apply, unchanged, to every other Quran.Foundation resource class (translations, tafsir, audio, or any other resource) absent a separate written permission of its own.

Quran Foundation Developer Support has also confirmed that Arabic Quran text is not currently among the resource groups supported by Content Sync. Content Sync is therefore not currently required for Arabic Quran text. Once Quran Foundation adds Quran-text support to Content Sync, Alsamad must transition to using Content Sync for that data and follow its documented synchronization requirements; no timeline for that support is currently confirmed, and none is assumed or invented by this entry.

This permission does **not** authorize: any modification, derivative, or transformation of the retained Arabic Quran text; sale, sublicensing, raw-data export, or redistribution as a separate content product (all remain expressly prohibited, consistent with `REG-0009`'s and `REG-0010`'s standing non-commercial/no-standalone-redistribution position); retention or use of any other Quran.Foundation resource class beyond Arabic Quran text; production import; `M5 Quran Import Activated`; scholarly approval; provider dry run; or source selection.

This evidence resolves only the Gate 3 storage/caching/retention sub-item, and only for Arabic Quran text. `M5` Gate 3 remains `PARTIAL`: license/terms identity as a formally recorded decision, attribution obligations, derivative/transformation limits, update/withdrawal/deletion/revocation obligations, provider-exit/content-purge obligations, and storage/retention for every non-Quran-text resource class all remain unresolved. Gates 4 (source selection), 5 (scholarly approval), 6 (`M5 Provider Import Dry Run Verified`), and 7 (`M5 Quran Import Activated`) are unaffected and remain exactly as before this entry: Gate 4 NOT STARTED/incomplete, Gate 5 not done, Gate 6 NOT PASS, Gate 7 NOT PASS. `M6` remains `BLOCKED`.

**Implementation evidence:** None. This entry records external licensing evidence only. It authorizes no Quran import, no database or schema change, no production activation, no provider dry run, no source-manifest change, no scholarly approval, and no M6/M7 work. A separate, later execution against the still-unmet Gate 3/4/5/6/7 requirements remains required before any of that work may proceed.

**Supersedes / Superseded by:** None.
