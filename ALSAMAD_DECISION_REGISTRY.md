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
| REG-0015 | Knowledge Engine Phase 2 (KE-2): durable topic vocabulary and assignments                  | Database, Roadmap           | SUPERSEDED  | Registry + ADR (`ADR-0007`, Accepted)                                     |
| REG-0016 | Editorial Identity Foundation prerequisite                                                 | Database, Security, Roadmap | DECIDED     | Registry + ADR (`ADR-0008`, Accepted)                                     |
| REG-0017 | Typography Phase 1: Arabic UI and devotional-reading font roles                            | Product, Roadmap            | IMPLEMENTED | Registry only                                                             |
| REG-0018 | Sakīnah Phase-1 visual foundation: palette, surfaces, elevation, radii, and state roles    | Product, Roadmap            | DECIDED     | Registry only                                                             |
| REG-0019 | M6.0 Duas Mobile-First Foundation: narrow independence from the M5 production-activation dependency | Roadmap                     | DECIDED     | Registry only                                                             |
| REG-0020 | Quran.Foundation Arabic Quran text retention permission (M5 Gate 3 storage/retention sub-item)       | Roadmap, Security            | DECIDED     | Registry only                                                             |
| REG-0021 | Knowledge Engine Phase 2 (KE-2): implementation-authorization crossing ("Governance Unit 2")          | Roadmap                      | SUPERSEDED  | Registry only                                                             |
| REG-0022 | Knowledge Engine Phase 2 (KE-2) architecture split: Topics Foundation (KE-2A) and Content Topic Assignments (KE-2B) | Database, Roadmap            | DECIDED     | Registry + ADR (`ADR-0009`, Accepted)                                     |
| REG-0023 | Knowledge Engine Phase 2A (KE-2A): Topics Foundation implementation-authorization crossing           | Roadmap                      | SUPERSEDED  | Registry only                                                             |
| REG-0024 | KE-2A corrected implementation authorization: journal boundary and topic lifecycle/repository contract | Database, Roadmap            | IMPLEMENTED | Registry + ADR (`ADR-0010`, Accepted)                                     |
| REG-0025 | Talibeen Al-Halal promotion to Expanded V1 separately feature-gated governance-design track           | Product, Security, Roadmap   | DECIDED     | Registry only; later persistent contracts require separate ADR review     |
| REG-0026 | Talibeen Foundation narrow runtime-inert domain-contract boundary                                    | Roadmap                      | DECIDED     | Registry only; implementation remains blocked pending a later Roadmap crossing |
| REG-0027 | Talibeen Foundation owner-reviewed exact-unit implementation authorization                          | Roadmap                      | IMPLEMENTED | Registry only; implemented by the corresponding Roadmap PASS              |
| REG-0028 | Public ALSAMAD Identity/Account Expanded V1 prerequisite architecture boundary                     | Product, Database, API, Security, Roadmap | DECIDED | Registry + ADR (`ADR-0011`, Accepted); implementation blocked |
| REG-0029 | Public ALSAMAD durable account-root minimal physical contract                                      | Database, Security, API, Roadmap | DECIDED | Registry + ADR (`ADR-0012`, Accepted); physical contract only |
| REG-0030 | Public ALSAMAD runtime-inert durable account-root persistence implementation authorization          | Database, Security, API, Roadmap | IMPLEMENTED | Registry only; exact inert unit complete; no broader authority |
| REG-0031 | Public ALSAMAD provider-neutral authentication identity linkage governance boundary                | Database, Security, API, Roadmap | DECIDED | Registry + ADR (`ADR-0013`, Accepted); architecture only, implementation blocked |

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

**Implementation evidence:** Implemented at commit `3f24396`, which touched exactly `src/app/globals.css` and `tests/visual-foundation.test.mjs` within the authorized implementation boundary above. Governance is DECIDED; Sakīnah Visual Foundation Implementation is implemented. This does not authorize or imply completion of any excluded/future visual work — page/shell/header/navigation/Quran-chrome redesign, brand/icon/logo finalization, motion tooling, component-library decisions, breakpoints, Latin font selection, exact high-contrast/Quran-night mappings, or Quran typography binding all remain separately unresolved.

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

**Status:** `SUPERSEDED` (2026-08-22). **ADR reference:** `ADR-0007` (Accepted).

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

**Supersedes / Superseded by:** Superseded by `REG-0022`.

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

**No implementation/runtime authorization:** This governance entry and ADR do not themselves implement the table. Implementation is now `IMPLEMENTED` at commit `a2604ca`, which satisfied the Roadmap gate. No production row, bootstrap identity, authentication, authorization, runtime import, API, route, component, UI, or workflow is authorized.

**Explicit exclusions:** `editorial_role_grants`, `review_records`, `publication_events`, `audit_events`, any auth-link table, public `users`/`user_identities`, credentials/passwords/passkeys/MFA/recovery/sessions, roles/capabilities/scopes/grants, staff seeds/bootstrap accounts, Admin API/routes/pages/components/UI, editorial queues/workflows, topic-management UI, content review/publication workflows, KE-2 implementation, M6/`devotional_items`, Duas, Quran/provider work, M5 Gate 4/5, Phase 7 completion, and later Knowledge Engine phases.

**Dependency truth:** This prerequisite is independent of M5 and M6 and changes no provider, Quran, Duas, or runtime status. It removes only the future `editorial_users` physical blocker once implemented. `devotional_items` remains an independent hard KE-2 blocker; KE-2 implementation remains NOT STARTED. KE-1 remains COMPLETE; KE-2 governance remains COMPLETE; M5 Gate 3 remains PARTIAL; M5 Provider Import Dry Run Verified and M5 Quran Import Activated remain NOT PASS; M6 remains BLOCKED.

**Implementation evidence:** Implemented at commit `a2604ca`, which added exactly the `editorial_users` table via `drizzle/0011_editorial_identity_foundation.sql` within the authorized implementation boundary above. Governance is decided; Editorial Identity Foundation is implemented.

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

### REG-0021 — Knowledge Engine Phase 2 (KE-2): implementation-authorization crossing ("Governance Unit 2")

**Category:** `Roadmap`.

**Summary:** Whether the M7.0-track's own precondition — that implementation requires a separate, later Decision Registry entry ("Governance Unit 2") explicitly recording (a) which phase is being authorized, (b) the exact scope and file boundary, and (c) confirmation of whether that scope stays Registry-only or crosses the ADR threshold — is now satisfied for KE-2, given that `REG-0015` and `ADR-0007` already answer (a), (b), and (c) in substance but, per `ALSAMAD_DECISION_REGISTRY.md` §2 item 5, cannot themselves constitute the implementation-authorization act.

**Committed evidence:** `REG-0015` (`DECIDED`, `ADR-0007` Accepted) governance-approves in principle exactly the two-table KE-2 package and its exact implementation boundary. `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §16 already labels Phase 2 "Governance approved; implementation NOT STARTED (`REG-0015`, `ADR-0007`)." `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s M7.0-track / KE-2 subsection already carries a complete Objective, Dependencies, exact future implementation boundary, implementation constraints, a 16-item acceptance contract, explicit exclusions, and completion-evidence contract. `REG-0015` itself states that its entry "does not authorize or claim a migration, schema/code/test change... Implementation is NOT STARTED until a separate execution satisfies every Roadmap acceptance condition." `ALSAMAD_DECISION_REGISTRY.md` §2 item 5 ("Neither a Registry entry nor an ADR independently authorizes implementation") and §10 (the Roadmap's gate mechanism is the exclusive authority for *when*) establish why a distinct crossing act is structurally required regardless of how complete `REG-0015`'s substance already is. `editorial_users` — a direct KE-2 foreign-key dependency for `created_by`, `approved_by`, `curated_by`, and `reviewed_by` — is implemented at commit `a2604ca`. KE-1 is complete and runtime-inert at commit `e073879`.

**Affected architecture:** None. This entry redesigns nothing already frozen by `REG-0015` or `ADR-0007`; it performs only the authorization-crossing act those entries explicitly reserved for a later, separate decision.

**Affected roadmap gate:** `M7.0-track / KE-2 — Controlled Topic Vocabulary and Content Assignment Foundation`. Independent of `M5 Gate 3`, `M5 Gate 4`, `M5 Gate 5`, `M5 Provider Import Dry Run Verified`, `M5 Quran Import Activated`, `M6`, `M6.1`, `M6.2`, `REG-0019`, `REG-0020`, and Phase 7.

**Opened:** 2026-08-22.

**Tier rationale:** Registry only. This entry introduces no new physical or architectural decision beyond what `ADR-0007` already covers; it fails §7's ADR threshold on its first prong, since nothing about it is newly material. Reversal is neither expensive nor dangerous — this entry can simply be superseded without touching any persisted state. **ADR reference:** None. The existing `ADR-0007` (Accepted) remains sufficient and unmodified; no new ADR is created.

**Status:** `SUPERSEDED` (2026-08-22).

**Decision outcome:** This entry constitutes the `M7.0-track` Governance Unit 2 act named in the Roadmap's opening M7.0-track section. It records, without alteration:

1. the authorized phase is exactly `M7.0-track / KE-2` — `ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md` §16 Phase 2, no other phase and no KE-3 or any later phase;
2. the exact scope and file boundary is exactly `REG-0015`'s own "Implementation boundary" field, restated verbatim: `src/db/schema.ts`; one mechanically numbered `drizzle/*_ke2_topics.sql`; `src/lib/knowledge/topics.ts`; `src/lib/knowledge/topic-repository.ts`; `tests/knowledge-topic-layer.test.mjs`; and the KE-2 additions within `scripts/db-verify.mjs`;
3. the scope remains `Registry + ADR` tier, already satisfied by the existing, unmodified `ADR-0007` (Accepted) — no new ADR is created or required by this entry.

`M5 Gate 3` PASS is confirmed not required for this entry or for KE-2 implementation, exactly as `REG-0015` and the Roadmap's KE-2 Dependencies already state.

This entry authorizes a future execution to begin work against the Roadmap's already-existing, unmodified 16-item KE-2 acceptance contract. It authorizes no migration, schema/code/test change, seed row, topic, religious-content assignment, runtime import, search integration, admin or editorial workflow, ingestion, embeddings, RAG, AI generation, public Knowledge UI, or deployment beyond what that existing contract already permits. It does not authorize KE-3 or any later Knowledge Engine phase. It does not authorize `M6.1`, `M6.2`, or any M5 gate.

**Quarantine treatment:** `src/lib/knowledge/topics.ts` is currently an untracked, quarantined prototype file occupying the same path this entry authorizes for future implementation. Per `REG-0015`'s own unmodified rule, restated here for clarity: authorization attaches to the path and the future reviewed work, never to the file's current bytes. The existing prototype content carries no independent authority and does not become authorized merely because its path is authorized; a fully reviewed, conforming implementation must exist before any commit. Independent inspection at the time of this entry found the current `src/lib/knowledge/topics.ts` to be a pure, in-memory, non-persisted constructor (`createKnowledgeTopic`) carrying only `id` and `presentations` — structurally unrelated to the persisted, UUIDv7/lifecycle/foreign-key-bearing `topics` table `ADR-0007` actually specifies. This confirms the existing prototype requires substantial rework, not merely review, before any conformance determination could even be made. `src/lib/knowledge/collections.ts`, `src/lib/knowledge/references.ts`, and `src/lib/knowledge/adapters/duas.ts` remain outside any authorized path under this or any KE-2 entry, regardless of content.

**Explicit exclusions:** Identical to `REG-0015`'s own list, restated verbatim, unmodified: collections, source references, generic `knowledge_edges`, Articles/Guides, Hadith, Talibeen, Duas, topic-to-topic edges, AI suggestions, semantic search, the AI Search Assistant, runtime search expansion, related-content UI, editorial/admin UI, seed data, provider/network/credential work, `M5 Gate 4/5`, canonical ownership changes, and every Knowledge Engine phase after Phase 2.

**Roadmap operationalization.** Per `ALSAMAD_DECISION_REGISTRY.md` §2 item 5 and §10, this Registry entry alone does not authorize implementation — the Roadmap's own gate mechanism remains the exclusive authority for *when*. This decision is operationalized by exactly two Roadmap edits: (1) the M7.0-track opening section's "Implementation requires Governance Unit 2" paragraph, updated to record that this requirement is now satisfied by this entry; (2) the KE-2 subsection's "Governance status" line, updated to record that implementation is now authorized to begin — not that it is complete, since KE-2 implementation itself remains `NOT STARTED` until a future execution separately satisfies the full 16-item acceptance contract.

**Independence from M5, M6, Duas, Editorial Identity, REG-0019, and REG-0020.** This entry changes no M5, M6, Duas, or Editorial Identity status. `M5 Gate 3` remains `PARTIAL`; `M5 Gates 4` and `5` remain `NOT PASS`; `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`; `M6`, `M6.1`, and `M6.2` remain unaffected; `REG-0019` and `REG-0020` semantics are unchanged.

**Implementation evidence:** None. This entry authorizes a future KE-2 implementation execution to begin; it does not itself constitute, stage, or commit any implementation. KE-2 implementation remains `NOT STARTED` until a separate execution satisfies every item of the Roadmap's existing 16-item acceptance contract. No `src/lib/knowledge/**` or `tests/knowledge-*.test.mjs` file is touched, staged, or committed by this entry.

**Supersedes / Superseded by:** Superseded by `REG-0022`.

### REG-0022 — Knowledge Engine Phase 2 (KE-2) architecture split: Topics Foundation (KE-2A) and Content Topic Assignments (KE-2B)

**Category:** `Database`, `Roadmap`.

**Summary:** Whether the KE-2 governance package, previously governed by `REG-0015`/`ADR-0007` and implementation-authorized as one atomic two-table unit by `REG-0021`, may instead be delivered as two separately atomic, sequential implementation units — `KE-2A` (`topics`) and `KE-2B` (`content_topics`) — without altering the substantive physical data model those entries already approved.

**Committed evidence:** `REG-0015` and `REG-0021` are `SUPERSEDED` by this entry; `ADR-0007` is `Superseded by ADR-0009`. `REG-0015`/`ADR-0007` governance-approved the `topics`/`content_topics` two-table package as one atomic migration, and `REG-0021` supplied the later Governance Unit 2 crossing for that now-obsolete combined execution unit. Independent feasibility review found `content_topics.devotional_item_id` has no live physical target — `devotional_items` does not exist in `src/db/schema.ts` and remains blocked on `M6.1`, itself blocked on `M5 Quran Import Activated` (`NOT PASS`) — while `topics` depends only on `locales` and `editorial_users`, both already physically present (`editorial_users` at commit `a2604ca`). Under the prior atomic package, this indefinitely delayed `topics` for a dependency `topics` itself does not have. `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.3 and `ADR-0007` §4 previously required one joint migration with joint rollback; `ADR-0009` now records the sequencing decision that resolves this.

**Affected architecture:** `ADR-0009`; `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.3.

**Affected roadmap gate:** `M7.0-track / KE-2A — Topics Foundation`; `M7.0-track / KE-2B — Content Topic Assignments`.

**Opened:** 2026-08-22.

**Tier rationale:** Registry + ADR. This entry changes an already-`Accepted` physical/procedural decision — the migration atomicity and rollback boundary — which independently meets §7's materiality prong regardless of the underlying table design being unchanged. Before either migration executes, reversal remains cheap (unexecuted-migration abandonment); the physical commitment being replaced is nonetheless the kind of frozen architectural decision §7 covers. **ADR reference:** `ADR-0009` (Accepted), superseding `ADR-0007`.

**Status:** `DECIDED` (2026-08-22).

**Decision outcome:**

1. The KE-2 package and `REG-0021`'s implementation authorization for its former atomic two-table execution unit are replaced by two separately atomic, sequential implementation units: `KE-2A — Topics Foundation` and `KE-2B — Content Topic Assignments`. Neither split unit inherits the obsolete combined authorization.
2. Each unit is a distinct atomic forward-only migration. A unit's migration failure rolls back only that unit's own tables, triggers, constraints, and indexes — never the other unit's.
3. `KE-2A` dependencies: `locales`, `editorial_users` — both already physically exist. `KE-2A` does not depend on `quran_ayahs`, `devotional_items`, `content_topics`, `M5 Quran Import Activated`, or `M6.1`.
4. `KE-2B` dependencies: `KE-2A` `COMPLETE`; `quran_ayahs` physically present (already exists); `devotional_items` physically present (does not yet exist); `content_items` physically present; `editorial_users`. `M5 Quran Import Activated` is not named as a direct `KE-2B` dependency; it enters only transitively, because `devotional_items` itself remains gated behind `M6.1`, which the Roadmap already requires `M5 Quran Import Activated` to satisfy before `M6.1` may implement.
5. The substantive `topics`/`content_topics` physical data model — every column, type, default, check, trigger, index, and foreign key originally specified at `ADR-0007` §§2–3 and now binding through `ADR-0009`'s incorporation by reference — remains entirely unchanged. This entry redesigns none of it.
6. `REG-0015`'s substantive architectural description (its Decision-outcome items 1–2 and descriptive paragraph covering the two tables' shape, lifecycle, concurrency, and canonical-owner rules) remains valid and is carried forward unchanged by this reference. Only `REG-0015`'s single-migration "Implementation boundary" and "Release-1 classification" fields — which assumed one atomic package — are replaced by the two-unit structure recorded here.

**This entry does not authorize `KE-2A` implementation.** Per `ALSAMAD_DECISION_REGISTRY.md` §2 item 5 and §10, a separate, later Registry entry (`KE-2A`'s own Governance Unit 2 crossing) remains required before any migration execution, schema/code implementation, staging, commit, push, seed data, or runtime wiring is authorized. `KE-2A` implementation remains `NOT STARTED`. `KE-2B` implementation remains `NOT STARTED` and additionally `BLOCKED` pending `devotional_items`'s physical existence and its own later crossing.

**Explicit exclusions:** Identical to `REG-0015`'s own list, restated verbatim, unmodified: collections, source references, generic `knowledge_edges`, Articles/Guides, Hadith, Talibeen, Duas, topic-to-topic edges, AI suggestions, semantic search, the AI Search Assistant, runtime search expansion, related-content UI, editorial/admin UI, seed data, provider/network/credential work, `M5 Gate 4/5`, canonical ownership changes, and every Knowledge Engine phase after Phase 2.

**Independence from M5, M6, Duas, Editorial Identity, Sakīnah, `REG-0019`, and `REG-0020`.** This entry changes no M5, M6, Duas, Editorial Identity, or Sakīnah status. `M5 Gate 3` remains `PARTIAL`; `M5 Gates 4–7` remain `NOT PASS`; `M5 Quran Import Activated` remains `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; `REG-0019` and `REG-0020` semantics are unchanged; Sakīnah Phase-1 and Editorial Identity Foundation status are unchanged. `KE-1` remains `COMPLETE` and runtime-inert. No `KE-3` or any later Knowledge Engine phase is authorized by this entry.

**Quarantine treatment.** Unchanged from `REG-0021`'s finding: `src/lib/knowledge/topics.ts`, `collections.ts`, `references.ts`, and `adapters/duas.ts` remain untracked, non-authoritative prototype evidence. No prototype byte becomes authorized by this entry. `topics.ts` still requires a full conformance rewrite against the `topics` specification (originally recorded at `ADR-0007` §2, now binding through `ADR-0009`'s incorporation by reference) before any future `KE-2A` execution may include it.

**Implementation evidence:** None. This entry authorizes no migration, schema/code/test change, seed row, topic, religious-content assignment, runtime import, search integration, admin or editorial workflow, or deployment.

**Supersedes / Superseded by:** Supersedes `REG-0015` and `REG-0021`.

### REG-0023 — Knowledge Engine Phase 2A (KE-2A): Topics Foundation implementation-authorization crossing

**Category:** `Roadmap`.

**Summary:** Whether `KE-2A — Topics Foundation` may now satisfy its separate Governance Unit 2 crossing and become authorized to begin in a future implementation execution against its existing contract, without implementing KE-2A in this governance task, altering the architecture settled by `REG-0022`/`ADR-0009`, or authorizing `KE-2B` or any later Knowledge Engine work.

**Committed evidence:** `REG-0022` (`DECIDED`) and `ADR-0009` (Accepted) are the current governing architecture and sequencing authority. They preserve the complete `topics` physical specification incorporated from historical/Superseded `ADR-0007` §2, split KE-2 into separately atomic `KE-2A` and `KE-2B` units, and explicitly reserve a separate Governance Unit 2 crossing for each. `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s `M7.0-track / KE-2A — Topics Foundation` subsection already records KE-2A's exact objective, dependencies, future file boundary, implementation constraints, and independently satisfiable share of the split 16-item acceptance contract. Its only physical dependencies, `locales` and `editorial_users`, exist. `KE-2B` remains separately blocked pending KE-2A COMPLETE, physical `devotional_items`, and its own later crossing.

**Affected architecture:** None. This entry executes the Roadmap authorization crossing already required by `REG-0022`/`ADR-0009`; it changes no physical representation, data model, migration sequencing, canonical owner, cross-module boundary, or closed vocabulary.

**Affected roadmap gate:** `M7.0-track / KE-2A — Topics Foundation` only.

**Opened:** 2026-08-23.

**Tier rationale:** Registry only. This entry introduces no new architectural decision and therefore fails §7's ADR threshold on its first prong. It authorizes execution only against the already-decided KE-2A contract; `REG-0022` remains `DECIDED`, `ADR-0009` remains Accepted and current, and no new ADR is required. **ADR reference:** None.

**Status:** `SUPERSEDED` (2026-08-23).

**Decision outcome:** This entry satisfies the separate Governance Unit 2 crossing required for exactly `M7.0-track / KE-2A — Topics Foundation`. Together with the corresponding Roadmap status update, it authorizes a separate future implementation execution to begin only within KE-2A's existing boundary and only to satisfy every KE-2A requirement already governed by `REG-0022`, `ADR-0009`, `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.1/§10.1.3, and the Roadmap's unchanged split acceptance contract.

The authorized unit adds exactly the later-additive, non-Release-1 `topics` table and its governed repository/test/verification support. Its dependencies remain exactly `locales` and `editorial_users`. No architecture is redesigned: no `topics` column, type, default, check, index, trigger, foreign key, lifecycle, localization, active-actor, concurrency, or UUIDv7 rule changes. The existing KE-2A exact future implementation boundary and every `[A]`, `[A/B split]`, and `[A+B independent]` obligation assigned to KE-2A remain unchanged. KE-2A implementation is authorized to begin only in a later execution and remains `NOT STARTED`; this entry implements, stages, commits, or pushes no schema, migration, code, test, seed, or runtime work.

No migration number is assigned, reserved, predicted, or pre-claimed for KE-2A. Migration `0010_devotional_content_foundation.sql` remains reserved for M6.1. A KE-2A number may be assigned only mechanically by the later implementation execution from the then-authoritative forward-only sequence.

**Quarantine treatment:** `src/lib/knowledge/topics.ts` currently exists only as untracked, non-authoritative prototype evidence. This authorization attaches to the governed KE-2A path and boundary, not to the current prototype bytes; those bytes are not reviewed, adopted, or authorized by this entry. A later implementation may replace or rewrite that path only as required to conform to the authoritative KE-2A contract. `src/lib/knowledge/collections.ts`, `src/lib/knowledge/references.ts`, and `src/lib/knowledge/adapters/duas.ts` remain wholly outside KE-2A and outside this authorization.

**This entry explicitly does NOT authorize:**

- `KE-2B`, `content_topics`, content-to-topic assignments, assignment seeds, or any KE-2B migration; KE-2B remains `NOT STARTED / BLOCKED` and requires its own later Governance Unit 2 crossing;
- `KE-3` or any later Knowledge Engine phase, collections, references, Duas adapters, generic `knowledge_edges`, entities, topic-to-topic edges, Articles/Guides, Hadith, or Talibeen;
- runtime wiring, runtime imports, search expansion, related-content UI, editorial/Admin UI, provider/network/credential access, AI, embeddings, RAG, semantic search, or the AI Search Assistant;
- topic seed data or any other seed authority; the governing KE-2A contract remains seed-free;
- any M5 or M6 status change, M6.1 or M6.2 authorization, Quran import or activation, or any implication that an M5 gate has passed;
- any migration-number assignment, reservation, prediction, pre-claim, or reuse/displacement of M6.1's reserved `0010`;
- implementation by this governance write itself or adoption of any current quarantined prototype byte.

**Roadmap operationalization:** Per §2 items 4–5 and §10, this Registry entry is operationalized by the corresponding minimal Roadmap updates that record KE-2A's crossing as satisfied and implementation as authorized to begin in a separate future execution while remaining `NOT STARTED`. The existing KE-2A boundary, dependencies, constraints, acceptance contract, exclusions, migration-number rule, and completion-evidence requirement remain unchanged. KE-2B's status and separate-crossing requirement remain unchanged.

**Independence from protected status truths:** `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7, `M5 Provider Import Dry Run Verified`, and `M5 Quran Import Activated` remain `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; `REG-0019` and `REG-0020` semantics are unchanged; Sakīnah and Editorial Identity Foundation status are unchanged; and KE-1 remains `COMPLETE` and runtime-inert. No KE-3 authorization exists.

**Implementation evidence:** None. KE-2A implementation is `NOT STARTED`. A later implementation execution must satisfy every KE-2A acceptance requirement before implementation evidence or `IMPLEMENTED` status may be recorded.

**Supersedes / Superseded by:** Superseded by `REG-0024`.

### REG-0024 — KE-2A corrected implementation authorization: journal boundary and topic lifecycle/repository contract

**Category:** `Database`, `Roadmap`.

**Summary:** Whether `KE-2A — Topics Foundation` may retain implementation authorization under a corrected exact boundary that includes its mechanical Drizzle journal registration, and under an exact minimal lifecycle, timestamp, active-editor, repository-operation, collision, and error contract that removes the implementation ambiguities left by superseded `REG-0023` without changing the `topics` columns/types or the `KE-2A`/`KE-2B` split.

**Committed evidence:** `REG-0022` (`DECIDED`) and `ADR-0009` (Accepted) remain the current A/B-split and migration-sequencing authority. `REG-0023` authorized KE-2A against a six-file boundary but omitted `drizzle/meta/_journal.json`, although every committed Drizzle migration is registered there, `scripts/db-verify.mjs` verifies that journal, and the Editorial Identity precedent expressly authorized its single mechanical append. The incorporated `topics` contract fixed the three status values and approval-evidence pairing but did not completely settle the allowed transition graph, strict timestamp behavior, minimum repository operations, or stable error categories. Those omissions prevent implementation without boundary expansion and behavior inference.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.1; supplemental `ADR-0010`. `ADR-0009` remains current and unchanged in its substantive split/sequencing decision.

**Affected roadmap gate:** `M7.0-track / KE-2A — Topics Foundation` only.

**Opened:** 2026-08-23.

**Tier rationale:** Registry + ADR. The journal correction is implementation bookkeeping and boundary metadata only, but the exact terminal topic lifecycle, evidence preservation, and timestamp enforcement shape persistent historical state. They are architecturally material and data-shaping/content-integrity sensitive under §7. **ADR reference:** `ADR-0010` (Accepted), supplementing rather than superseding `ADR-0009`.

**Status:** `IMPLEMENTED` (2026-08-23; decision recorded 2026-08-23).

**Decision outcome:** This entry supersedes `REG-0023` and constitutes the corrected Governance Unit 2 crossing for exactly `M7.0-track / KE-2A — Topics Foundation`. It authorizes a separate future KE-2A implementation execution against `REG-0022`, `ADR-0009`, supplemental `ADR-0010`, `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.1/§10.1.3, and the synchronized Roadmap contract. KE-2A implementation remains `NOT STARTED`; this governance decision implements, stages, commits, or pushes no schema, migration, journal entry, code, test, seed, or runtime work.

**Corrected exact implementation boundary:**

1. `src/db/schema.ts`;
2. one `drizzle/<mechanically-assigned-forward-number>_ke2a_topics.sql` assigned only during implementation;
3. `drizzle/meta/_journal.json`, limited to exactly one mechanical registration append for that migration;
4. `src/lib/knowledge/topics.ts`;
5. `src/lib/knowledge/topic-repository.ts`;
6. `tests/knowledge-topic-layer.test.mjs`;
7. KE-2A additions only within `scripts/db-verify.mjs`.

Every pre-existing migration and journal entry remains byte-unchanged. The appended journal entry may contain only the next journal index, the established version/breakpoint fields, a mechanically monotonic timestamp, and the tag derived exactly from the implementation-time migration filename. Governance assigns, reserves, predicts, or pre-claims no KE-2A migration number. `0010_devotional_content_foundation.sql` remains reserved for M6.1. At the 2026-08-23 baseline, `0011` exists and `0012` is only the observed mechanically lawful result if execution began from that unchanged baseline; implementation must recompute from its then-authoritative state.

**Lifecycle and evidence contract:** Allowed transitions are only `draft → approved`, `draft → retired`, and `approved → retired`. `approved → draft`, `retired → draft`, `retired → approved`, `retired → retired`, and every retired-topic reactivation are forbidden. Retirement is terminal. Retiring an approved topic preserves `approved_by` and `approved_at` unchanged; retiring a draft topic leaves both null; retirement never fabricates approval evidence. Canonical-key correction never mutates `canonical_key`: one atomic repository operation retires the old draft/approved topic and creates a replacement with a new application-generated UUIDv7, its own `created_by`, `status = 'draft'`, and null approval evidence.

**Timestamp contract:** `created_at` and initial `updated_at` are database-generated by the existing `current_timestamp` defaults; `created_at` is immutable. `approved_at` is database-generated during approval. Each actual localized-name update, approval, or retirement uses one database-owned lifecycle-event timestamp and strictly advances `updated_at`; approval assigns that same event timestamp to `approved_at` and `updated_at`. No-op mutations are rejected and advance nothing. Retirement advances only `updated_at` and preserves approval evidence. The database-owned event timestamp is exactly `GREATEST(clock_timestamp(), OLD.updated_at + interval '1 microsecond')`, the smallest PostgreSQL-native increment at the repository's `timestamptz` precision that guarantees `NEW.updated_at > OLD.updated_at` when the clock has not advanced. Application-supplied lifecycle timestamps are not accepted.

**Active-editor and transaction contract:** Every create, localized-name update, approval, retirement, and canonical-key replacement verifies the required `editorial_users` actor has `status = 'active'` inside the same repository-owned `READ COMMITTED` transaction as the mutation. Lifecycle mutations lock the target topic row before state validation. Ordinary read-by-ID requires no actor and acquires no advisory lock. This applies the existing Editorial Identity consumer rule and redesigns no identity state.

**Minimum repository contract:** The persisted model is named `TopicRecord`, never a second persisted `KnowledgeTopic`. Required operations are: create a draft from application UUIDv7/canonical key/complete localized-name map/`createdBy`; read any-state topic by ID returning `TopicRecord` or absence; replace the complete localized-name map for draft/approved only and only on actual change; approve draft only; retire draft/approved only; and atomically correct canonical identity by retiring the old topic and creating a new draft replacement. Generic unrestricted CRUD, arbitrary patch/update, canonical-key/identity/creator/`created_at` mutation, ordinary hard delete, a generic status setter, retired-row resurrection, list/search/runtime APIs, and every application/runtime import are forbidden.

**Minimum error contract:** One KE-2A-specific typed error contract uses stable categories `validation`, `not_found`, `invalid_transition`, `canonical_key_conflict`, `inactive_editorial_actor`, and `database_invariant`. Pure input failure maps to `validation`; a missing mutation target to `not_found`; a forbidden transition or lifecycle no-op to `invalid_transition`; canonical-key uniqueness collision to `canonical_key_conflict`; a missing/disabled required actor to `inactive_editorial_actor`; and deferred-locale, unsupported-isolation, locking/concurrency, or unexpected governed-constraint failure to `database_invariant`. Read-by-ID absence returns absence rather than `not_found`. Deterministically mappable raw database errors do not leak; an unexpected underlying cause may be retained internally by `database_invariant`. No global error framework is authorized.

**KE-1 and quarantine treatment:** `src/lib/knowledge/types.ts` remains untouched and its existing KE-1 `KnowledgeTopic` remains presentation-only. The KE-2A persisted shape is `TopicRecord`. The current untracked `src/lib/knowledge/topics.ts` and its `createKnowledgeTopic` function remain non-authoritative prototype evidence and are not adopted; that path may be fully rewritten only during the later KE-2A implementation. `collections.ts`, `references.ts`, and `adapters/duas.ts` remain outside KE-2A. KE-1 remains COMPLETE and runtime-inert.

**This entry explicitly does NOT authorize:** `KE-2B`, `content_topics`, KE-3 or later Knowledge work, collections, references, Duas adapters, generic `knowledge_edges`, runtime/search/UI/provider/network/credential/AI work, seed data, M5/M6 work, or any current prototype byte. `KE-2B` remains `NOT STARTED / BLOCKED` and requires its own later crossing.

**Independence from protected status truths:** `REG-0022` and ADR-0009 remain current for the split/sequencing decision. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7, `M5 Provider Import Dry Run Verified`, and `M5 Quran Import Activated` remain `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; `REG-0019`, `REG-0020`, Sakīnah, and Editorial Identity semantics/statuses remain unchanged. No KE-3 authorization exists.

**Implementation evidence:** `KE-2A Topics Foundation Verified = PASS` in `ALSAMAD_IMPLEMENTATION_ROADMAP.md`, implemented by commit `c1757790f579fd34838d9136c9420aa8168e9a2a` (`feat(knowledge): implement KE-2A topics foundation`). This records the later implementation and passed Roadmap acceptance of the existing authorization; it does not alter the historical decision outcome or authorize KE-2B, runtime integration, or later Knowledge Engine work.

**Supersedes / Superseded by:** Supersedes `REG-0023`.

### REG-0025 — Talibeen Al-Halal promotion to Expanded V1 separately feature-gated governance-design track

**Category:** `Product`, `Security`, `Roadmap`.

**Summary:** Whether Talibeen Al-Halal / طالبين الحلال is promoted from Approved Later Module into an **ALSAMAD Expanded V1 separately feature-gated product track**, without changing the frozen Core Release 1 daily companion, and which high-level product, isolation, safety, commercial, release, and future-client decisions are settled by that promotion before later identity, privacy, legal, persistent-data, API, administration, consumer, and implementation contracts.

**Committed evidence:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` already approved Talibeen as a privacy-first Islamic marriage product within the ALSAMAD ecosystem, separate from dating/social mechanics and on a separate release track. `ALSAMAD_DATABASE_ARCHITECTURE.md` §10 assigns it a later isolated privacy-first schema after public identity approval, referencing users while retaining profiles, discovery projections, introductions, conversations, blocks, and retention inside the Talibeen module. `ALSAMAD_SECURITY_ARCHITECTURE.md` §12 classifies its identity, discovery, safety, block, conversation, and retention data as Highly Restricted and requires isolation, anti-enumeration, minimized discovery projections, purpose-bound access, separate retention, and separate Privacy/Safety/Legal/Security/launch approval. The Roadmap excluded Talibeen from frozen Core Release 1 and contained no populated implementation gate. Owner approval dated 2026-08-29 now promotes governance design only; no implementation evidence exists.

**Affected architecture:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` Talibeen section and capability vocabulary; `ALSAMAD_SECURITY_ARCHITECTURE.md` §12 and release classification; a new Talibeen Expanded V1 governance-design track in `ALSAMAD_IMPLEMENTATION_ROADMAP.md`. `ALSAMAD_DATABASE_ARCHITECTURE.md`, API, Admin, Notification, Analytics, SEO, and later ADR contracts remain unchanged and must be reconciled before their respective implementations.

**Affected roadmap gate:** Talibeen Expanded V1 governance-design track only. No implementation gate is opened.

**Opened:** 2026-08-29.

**Tier rationale:** Registry only for the product/release promotion itself. This entry changes capability classification and freezes high-level product invariants, but assigns no physical representation, persistent lifecycle, schema, API, provider, or implementation boundary. Later decisions for public identity, candidate eligibility representation, private-profile/discovery/contact/conversation state, consent, evidence, retention/deletion/legal hold, and cross-client domain contracts are persistent, privacy-sensitive, and difficult to reverse; each must be evaluated against §7 and recorded in one or more later ADRs before implementation.

**Status:** `DECIDED` (2026-08-29). Governance design only; implementation remains `BLOCKED / NOT AUTHORIZED`.

**Decision outcome:** Talibeen is promoted to **ALSAMAD Expanded V1 — separately feature-gated product track**, while remaining outside the frozen Core Release 1 daily companion. The promotion changes no Core Release 1 scope, table count, acceptance, completion, or status. Talibeen is one logical, global-by-design product/domain. Its initial intended client is an ALSAMAD Web Talibeen section; a standalone website and iOS/Android applications are V2/deferred, Owner-directed future local-AI training/build candidates that must reuse the same authoritative Talibeen domain and ALSAMAD-account relationship. This decision requires client-independent boundaries but no speculative microservice, second database, second authentication system, future client, or runtime work.

**Settled product invariants:**

1. Talibeen Expanded V1 is adults-only (`18+`); minors are ineligible for marriage discovery/contact. Date of birth is not public profile data by implication. Assurance method/provider and suspected-minor handling remain later contracts.
2. Talibeen is Islamic marriage, not dating or generic social discovery. A man may receive women and a woman may receive men as marriage candidates; neither receives same-sex marriage candidates, and no generic “seeking anyone” mode exists. Later backend/data/domain enforcement is mandatory; representation is not decided here.
3. One ALSAMAD account represents the person. Talibeen creates no duplicate account; its private marriage profile remains an isolated bounded context and is not a public/social profile, religious/devotional content, Knowledge Engine data, or editorial identity. Public ALSAMAD identity activation is a hard dependency before real-identity Talibeen foundation work. Editorial Identity Foundation grants no public Talibeen identity authority.
4. A user-controlled Talibeen display identity may differ from base-account presentation. Identity verification is independent of display name, membership/payment, compatibility, religious status, or moral worth and does not imply public legal-name disclosure.
5. Authenticated users may understand/explore Talibeen before full profile completion; exact discoverability, introduction, acceptance, and messaging gates remain later decisions.
6. Profiles do not expose external contact details as ordinary discovery content. Acceptance does not reveal contact automatically. Later sharing is explicit, per person and contact method, independent of payment; revocation cannot promise recovery of already viewed/copied information.
7. The high-level interaction is profile → introduction request → recipient decision → mutual accepted state → private Talibeen conversation → optional controlled contact sharing → optional later family/wali step → closure/success. Arbitrary mass messaging is forbidden. Blocking/reporting is mandatory. Last Seen, Online, and read receipts are not public/default assumptions.
8. Photos are privacy-first; Talibeen use does not grant public, social-media, Social Reach, or unrelated-AI consent. Wali/family participation is optional, user-controlled, and grants no automatic private-conversation access.
9. Safety/moderation is mandatory before public discovery/contact/messaging and never a Premium feature. Blocking protects immediately; report-and-block is required; paid users have no moderation immunity. Money references alone do not prove fraud. Automation/AI cannot become unreviewed final authority for serious sanctions.
10. Private marriage profiles remain non-public and `noindex` by default. A separate quality-controlled public SEO layer may later be gated only if it exposes no private identity/profile, resists enumeration and low-count re-identification, prevents uncontrolled thin/doorway pages, and has explicit ownership/canonical/locale/future-domain rules.
11. Exit With Dignity closes the Talibeen profile and rapidly removes discovery without requiring deletion of the wider ALSAMAD account. “Found/progressed” is distinct from “marriage confirmed”; a confirmed-by-both metric requires mutual participant confirmation and does not require marriage certificates in ordinary Expanded V1.
12. Talibeen is global-by-design, localization/time-zone/currency-ready, jurisdiction-policy capable, and based on coarse user-selected ordinary-discovery location. This is no claim of compliance or launch approval in every country.

**Commercial supersession:** This decision supersedes the historical Product/Admin Talibeen direction prescribing a 14-day card-backed trial and USD 7 first-two-month launch offer. No earlier Registry entry recorded those terms, so no prior `REG-*` identifier is superseded. The historical prose remains preserved and labeled superseded. Expanded V1 now supports Free and Plus entitlement architecture; higher Premium is V2. Free remains genuinely usable. Payment never purchases ranking, compatibility, verification, safety, moderation immunity, religious/moral status, or preferential marriage opportunity. A Plus indicator cannot imply trust, piety, compatibility, or superiority. Regional/localized pricing is approved direction, with approximately USD 10-equivalent in some high-purchasing-power markets only provisional context; no country price, provider, billing, tax, trial, renewal, refund, cancellation, or payment activation is decided or authorized.

**Release decomposition:** Expanded V1’s intended outcome covers the shared account relationship; 18+ eligibility; private profile and fields; backend/domain candidate invariant; verification-state architecture; privacy-first photos; purposeful discovery and saved profiles; introductions; conversation after mutual acceptance; controlled contact sharing; blocking/reporting/moderation and evidence/appeal foundations; core separable notification preferences and email capability; Exit With Dignity; minimal success lifecycle; Free/Plus entitlement architecture; private-profile noindex; a separately gated public SEO capability; and necessary administration/safety tooling. This is an overall release outcome, not one implementation unit. Detailed Profile Visits, `وقفة طيبة` / Intentional Discovery Breaks, richer notification/email, advanced wali/family, public success stories, and deeper chat/Plus/discovery refinements default to V1.1. Higher Premium, Social Reach Cards, standalone website, mobile apps, optional AI, advanced family tools, and any formal-document marriage verification are V2/deferred. Charitable campaigns / `حملة الخير والبر` remain independent and deferred to V2/V3.

**Required later crossings:** Public ALSAMAD identity/account activation; exact Product/Privacy/Safety/Legal/Security contracts; persistent identity-relationship and eligibility/discovery/privacy ADR review; exact Database, API, and Admin/moderation contracts; evidence/retention/deletion/legal-hold and staff-access/audit contracts; default-off feature and staged-release contracts; and one later exact Roadmap implementation authorization. Messaging, notifications/email, photos/media, payments, SEO, analytics, and AI each require their applicable consumer contracts before inclusion. External research/approval remains required for jurisdictional marriage-service rules, age assurance, identity verification, lawful bases, sensitive data, transfers/subprocessors, retention/deletion/legal hold, user rights, moderation/evidence and safety incidents, notification consent, consumer subscriptions, localized pricing/tax/payment, and SEO aggregation/re-identification risk.

**Future blocked candidate:** A later Roadmap crossing may consider `TALIBEEN FOUNDATION` as a runtime-inert, schema-free, default-off, no-real-data unit for domain vocabulary, identity relationship, fail-closed adults-only eligibility, candidate direction, private/public profile separation, membership/verification independence, and feature state. No file list or implementation is authorized here.

**This entry explicitly does NOT authorize:** application code, routes, UI/components, schema/migrations, APIs, authentication or real accounts/data, discovery, introductions, messaging, photos/media, contact sharing, moderation runtime, notifications/email, payments, SEO pages, analytics, AI, standalone clients, Social Reach, charitable campaigns, providers, external network access, deployment, staging, commit, or push. The Roadmap remains the exclusive implementation authority.

**Independence from protected status truths:** `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7, `M5 Provider Import Dry Run Verified`, and `M5 Quran Import Activated` remain `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains `NOT STARTED / BLOCKED`; combined KE-2 remains incomplete; and no KE-3 implementation authority exists. Talibeen governance independence advances or reinterprets none of them.

**Implementation evidence:** None. `TALIBEEN IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

**Supersedes / Superseded by:** Supersedes no prior Registry entry. Supersedes only the historical Talibeen Approved-Later release classification and historical Talibeen trial/launch-offer direction now preserved and labeled in affected architecture.

### REG-0026 — Talibeen Foundation narrow runtime-inert domain-contract boundary

**Category:** `Roadmap`.

**Summary:** Define the maximum reversible boundary of a possible future `TALIBEEN FOUNDATION` implementation unit without authorizing that unit, activating Talibeen, or deciding any persistent, real-identity, user-facing, provider, or operational contract.

**Committed evidence:** `REG-0025` remains the controlling Talibeen product-classification and high-level invariant authority. `ALSAMAD_IMPLEMENTATION_ROADMAP.md` records `TALIBEEN FOUNDATION` only as a future blocked candidate and requires a later exact-unit crossing. Public ALSAMAD identity/account architecture remains Prepared and inactive; no Talibeen schema, API, Admin runtime, route, UI, real-data path, or consumer contract exists.

**Affected architecture:** `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Talibeen Expanded V1 governance-design track only. No Product, Security, Database, API, Admin, notification, payment, SEO, media, analytics, AI, or ADR contract is changed or supplied by this decision.

**Affected roadmap gate:** Future `TALIBEEN FOUNDATION` exact-unit authorization. This decision defines its maximum boundary but does not open or pass that gate.

**Opened:** 2026-08-29.

**Tier rationale:** Registry only. The contemplated unit is schema-free, synthetic-only, runtime-inert, default-off, local, and reversible. It creates no physical representation, persistent lifecycle, real identity relationship, external contract, runtime surface, or difficult-to-reverse privacy/security boundary, so the §7 ADR threshold is not met. ADR review becomes mandatory before persistent identity linkage or a persistent private Talibeen domain is designed; a possible later coherent subject is `Talibeen Persistent Identity and Private Domain Boundary`, whose outcome and physical representation are not decided here.

**Status:** `DECIDED` (2026-08-29). Governance boundary only. `TALIBEEN FOUNDATION = NOT STARTED / BLOCKED / NOT YET AUTHORIZED`.

**Decision outcome:** A future `TALIBEEN FOUNDATION` unit may be considered only as isolated domain code and tests for: stable Talibeen vocabulary; an opaque conceptual ALSAMAD identity reference using synthetic/test values only; adults-only (`18+`) and missing/invalid-data fail-closed eligibility semantics; the man-to-woman and woman-to-man marriage-candidate direction invariant with same-sex, generic, and unknown directions rejected; private Talibeen profile versus public/base ALSAMAD profile separation; verification-state independence from Free/Plus membership; Free/Plus semantic distinction, with Premium named only as V2/deferred if required for completeness; default-off/no-production-composition semantics; and neutral multi-client-ready vocabulary that binds to no standalone-client runtime.

The conceptual identity reference binds to no `users` table, account row, provider subject, OAuth/Google/email/magic-link/passkey identity, session, cookie, middleware, production user ID, Editorial Identity, or real verification evidence. One ALSAMAD account remains the conceptual person root and a duplicate Talibeen account remains prohibited. Persistent linkage requires later public-account activation, architecture contracts, ADR review, and Roadmap authority.

**Absolute exclusions:** No database/schema/migration/ORM/repository/filesystem persistence; real user data or production identity/auth/session/account activation; route/page/UI/component; API endpoint or contract; discovery/candidate retrieval/location filtering; introduction/request/messaging/conversation/contact sharing; media/photo; moderation/Admin runtime; notification/email/push; payment/billing/pricing implementation; analytics/telemetry/Profile Visits; public SEO/metadata/sitemap/structured data; Intentional Discovery Breaks; success-story publication; AI; Social Reach; standalone web/mobile runtime; charitable campaigns; devotional, Quran, or Knowledge Engine integration; network/provider call; secret; production side effect; or production composition-root import.

**Privacy/security boundary:** Talibeen remains a Highly Restricted private bounded context. This possible unit uses synthetic values only and has no telemetry, persistence, user-like sensitive logging, staff/Admin access path, AI access, network call, or secret. It does not solve persistent privacy architecture. Exact inventory, purposes, minimization, visibility, coarse location, consent, deletion, retention, backups, legal hold, access/export, staff access, audit, and AI restrictions remain later contracts.

**Deferred crossings:** Public identity/account activation; persistent linkage; profile fields/completion; age and identity assurance providers; Database/migrations; API; discovery; introductions; messaging/contact grants; media; moderation operations; retention/deletion/legal hold; notifications/email; payments/pricing; analytics/Profile Visits; public SEO; Intentional Discovery Breaks; public success stories; standalone clients; AI; and Social Reach all remain blocked beyond Foundation. External legal/operational research is not required for the synthetic runtime-inert unit but remains required before the applicable real-data, identity, discovery/contact/messaging, moderation, jurisdiction-launch, monetization, SEO, notification, or sensitive-processing phase.

**Implementation authority:** None. The Roadmap remains exclusive implementation authority. A separate Owner-reviewed Roadmap crossing must later authorize the exact unit before any Foundation file is created or changed.

**Independence from protected status truths:** Core Release 1 scope and table count are unchanged. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7, `M5 Provider Import Dry Run Verified`, and `M5 Quran Import Activated` remain `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains `NOT STARTED / BLOCKED`; combined KE-2 remains incomplete; and no KE-3 implementation authority exists.

**Implementation evidence:** None. `TALIBEEN FOUNDATION = NOT STARTED / BLOCKED / NOT YET AUTHORIZED`.

**Supersedes / Superseded by:** Supersedes no Registry decision. Narrows only the future blocked Foundation candidate already contemplated by `REG-0025`.

### REG-0027 — Talibeen Foundation owner-reviewed exact-unit implementation authorization

**Category:** `Roadmap`.

**Summary:** Whether the exact schema-free, runtime-inert, synthetic-only `TALIBEEN FOUNDATION` unit governed by `REG-0025` and `REG-0026` is authorized to begin implementation in a separate execution, without authorizing any broader Talibeen capability or implying that implementation has started or completed.

**Committed evidence:** `REG-0025` remains the controlling Talibeen product-classification and high-level invariant authority. `REG-0026` remains the controlling narrow Foundation semantic, privacy, identity, exclusion, ADR-threshold, acceptance, and rollback boundary. The Roadmap already defines exactly three prospective files and records no implementation evidence. Owner review dated 2026-08-29 authorizes only that bounded unit.

**Affected architecture:** `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Talibeen Foundation unit status only. No Product, Security, Database, API, Admin, notification, payment, SEO, media, analytics, AI, Sakīnah, or ADR contract is changed or supplied.

**Affected roadmap gate:** `TALIBEEN FOUNDATION` exact-unit implementation authorization. Completion and acceptance remain separate later review gates.

**Opened:** 2026-08-29.

**Tier rationale:** Registry only. This crossing authorizes implementation of the already-settled, local, reversible, schema-free, synthetic-only, runtime-inert boundary and creates no new physical representation or difficult-to-reverse decision. No ADR is required for this unit. ADR review remains mandatory before persistent identity linkage or persistent private-domain design.

**Status:** `IMPLEMENTED` (2026-08-30; decision recorded 2026-08-29). The exact authorized Foundation unit is COMPLETE under the corresponding Roadmap PASS. This lifecycle transition records accepted implementation evidence only and changes none of the original decision semantics or broader Talibeen authority.

**Decision outcome:** The corresponding Roadmap crossing authorizes creation or modification of exactly:

```text
src/lib/talibeen/contracts.ts
src/lib/talibeen/eligibility.ts
tests/talibeen-foundation.test.mjs
```

Authority is limited to the `REG-0026` semantics: stable Talibeen vocabulary; an opaque synthetic ALSAMAD identity reference; adults-only (`18+`) and missing/invalid-data fail-closed eligibility; man-to-woman and woman-to-man marriage-candidate direction with man-to-man, woman-to-woman, generic, unknown, and invalid directions rejected; private Talibeen versus public/base profile separation; verification independence from Free/Plus membership; Free/Plus semantic distinction; Premium only as V2/deferred vocabulary if required; default-off/no-production-runtime-composition semantics; and client-neutral vocabulary.

**Absolute boundary:** No other file is authorized. No barrel/index, package/config, fixture, route/page/UI/component, schema/migration/ORM/repository/filesystem persistence, API contract/endpoint, runtime wiring or feature-flag implementation, real account/identity/data/auth/session/OAuth/magic-link/passkey/`users` integration, discovery/introduction/messaging/contact sharing, media/photo, moderation/Admin runtime, notification/email/push, payment/billing/pricing implementation, analytics/telemetry/Profile Visits, SEO/metadata/sitemap/structured data, Intentional Discovery Breaks, public success story, standalone client runtime, AI, Social Reach, charitable campaign, devotional/Quran/Knowledge Engine integration, network/provider call, secret, production import, or production side effect is authorized.

**Identity and persistence boundary:** The authorized reference is conceptual, opaque, and synthetic only. It binds to no persistent user, provider subject, email, Google identity, session, account row, Editorial Identity, verification provider, or production identity. Persistent identity linkage remains blocked pending later public-identity, Database, Privacy/Security, ADR, and Roadmap authority.

**Roadmap operationalization:** Per §2 items 4–5 and §10, this Registry entry did not independently authorize implementation. The corresponding Roadmap now records `TALIBEEN FOUNDATION = COMPLETE` and `Talibeen Foundation Verified = PASS` after the exact implementation commit, acceptance evidence, and separate completion review passed. Any expansion still requires a new Roadmap crossing; no next Talibeen unit is authorized.

**External research and ADR status:** No external/legal/operational research or new ADR is required for this synthetic runtime-inert implementation. Applicable research and ADR review remain required before later persistent, real-user, public, identity, moderation, monetization, SEO, notification, or sensitive-data phases.

**Independence from protected status truths:** Core Release 1 scope and table count are unchanged. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7, `M5 Provider Import Dry Run Verified`, and `M5 Quran Import Activated` remain `NOT PASS`; `M6.0` remains `COMPLETE`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains `NOT STARTED / BLOCKED`; combined KE-2 remains incomplete; and no KE-3 implementation authority exists.

**Implementation evidence:** `Talibeen Foundation Verified = PASS` in `ALSAMAD_IMPLEMENTATION_ROADMAP.md`, implemented by commit `c7ba024d0d19c31c4c46ff027531d504e17bc01f` (`feat: implement Talibeen Foundation contracts`) in exactly `src/lib/talibeen/contracts.ts`, `src/lib/talibeen/eligibility.ts`, and `tests/talibeen-foundation.test.mjs`. Acceptance evidence: dedicated Foundation tests 11/11 PASS; repository tests 497/497 PASS; TypeScript typecheck PASS; scoped lint PASS; scoped Prettier check PASS; whitespace/diff check PASS; and import/dependency, runtime-isolation, persistence-isolation, external-isolation, and exact-scope reviews PASS. This marks only the schema-free, synthetic-only, runtime-inert Foundation unit COMPLETE. Broader Talibeen remains `BLOCKED / NOT AUTHORIZED` and persistent identity/private-domain work still requires separate ADR/materiality and Roadmap review.

**Supersedes / Superseded by:** Supersedes no decision. Satisfies only the separate implementation-authorization requirement recorded by `REG-0026` and the Roadmap.

### REG-0028 — Public ALSAMAD Identity/Account Expanded V1 prerequisite architecture boundary

**Category:** `Product`, `Database`, `API`, `Security`, `Roadmap`.

**Summary:** Whether Public ALSAMAD Identity/Account is promoted from Prepared/inactive into an Expanded V1 prerequisite architecture track as one durable shared platform identity, while implementation remains blocked and preferences, saved items, personalization, and dependent private-module capabilities remain outside the first boundary.

**Committed evidence:** Product Architecture keeps Core Release 1 guest-first while distinguishing the shared account root from optional synchronized capabilities. Database Architecture §9 preserves the historical five-table package as Prepared evidence but separates the identity/authentication/session candidates from deferred preferences and saved items without approving a physical contract. API and Security Architecture define provider-neutral account, authentication, session, recovery, lifecycle, Editorial-separation, and multi-client boundaries. Owner approval dated 2026-08-30 settles the product direction. `ADR-0011` records the material rationale and rejected alternatives.

**Affected architecture:** `ALSAMAD_PRODUCT_ARCHITECTURE_V1.md` §§3.5 and 4; `ALSAMAD_DATABASE_ARCHITECTURE.md` §9; `ALSAMAD_API_ARCHITECTURE.md` §§5 and 9; `ALSAMAD_SECURITY_ARCHITECTURE.md` §§6, 26, and 28; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Public ALSAMAD Identity architecture track; `ADR-0011`.

**Affected roadmap gate:** Public ALSAMAD Identity architecture track only. `PUBLIC ALSAMAD IDENTITY ARCHITECTURE = OPEN / APPROVED`; `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

**Opened:** 2026-08-30.

**Tier rationale:** Registry + ADR. The decision fixes the durable shared account identity that future clients and modules may reference and separates it from replaceable credentials/provider subjects, sessions, recovery methods, Editorial Identity, and private-module data. Reversal after persistent consumers exist would require cross-module data reconstruction and could cause account duplication, takeover, orphaning, or unsafe deletion. It therefore meets both §7 ADR conditions. **ADR reference:** `ADR-0011` (Accepted).

**Status:** `DECIDED` (2026-08-30). Architecture is approved; no implementation evidence exists and no implementation is authorized.

**Decision outcome:** One provider-neutral, ALSAMAD-owned durable account subject is the shared platform identity for separately authorized clients and modules. Authentication establishes control of a credential or provider identity and may later resolve it to the durable account; it does not define or replace that account. Sessions represent revocable authorized access in an authenticated account context. Recovery restores access to the same durable account rather than silently creating another. Public ALSAMAD Account is not Talibeen-only, no client or module creates a duplicate account system, and Editorial Identity remains a separate bounded context.

The first architecture boundary contains only the durable account root, authentication, session, recovery, essential account-lifecycle semantics, Editorial Identity separation, future private-module linkage suitability, and multi-client reuse. Preferences, saved items, favorites, synchronization, personalization, private routines, notifications, payments, and unrelated account capabilities remain Prepared/deferred.

**Dependent-module and deletion boundary:** A future private module may reference the durable account only after its own governance. Base-account deletion must not blindly cascade into, orphan, or silently retain sensitive dependent-module data. Each module must define ownership, deletion, retention, legal/safety constraints, and cleanup before production linkage. This decision creates no Talibeen-specific persistence, retention, legal basis, or deletion policy.

**Absolute non-authorization:** **THIS DECISION DOES NOT AUTHORIZE IMPLEMENTATION.** It authorizes no `users`/account/auth-identity/session/preferences/saved-item table, column, schema, ORM, migration, provider or mechanism selection/integration, credential, session persistence, recovery implementation, API contract/endpoint, route, UI, real account, personal data, Talibeen linkage/profile/persistence, or production activation. Neither this Registry entry nor `ADR-0011` supplies an implementation boundary.

**Roadmap operationalization:** The Roadmap opens only the architecture track. Any implementation requires exact Database/API/Security and privacy acceptance contracts, applicable provider/mechanism review, and a later Owner-reviewed Roadmap crossing naming one exact unit and file/migration boundary, followed by separate acceptance and completion evidence.

**Independence from protected status truths:** Core Release 1 remains guest-first and its table count is unchanged. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7 and `M5 Quran Import Activated` remain `NOT PASS`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains `NOT STARTED / BLOCKED`; combined KE-2 remains incomplete; and no KE-3 implementation authority exists. `TALIBEEN FOUNDATION = COMPLETE` and `Talibeen Foundation Verified = PASS`; broader Talibeen remains `BLOCKED / NOT AUTHORIZED` with no next unit authorized.

**Implementation evidence:** None.

**Supersedes / Superseded by:** Supersedes no Registry decision. Promotes and narrows previously Prepared architecture material without rewriting its historical status or authorizing its physical candidates.

### REG-0029 — Public ALSAMAD durable account-root minimal physical contract

**Category:** `Database`, `Security`, `API`, `Roadmap`.

**Summary:** Whether to approve the smallest provider-neutral physical persistence contract for the shared Public ALSAMAD durable account root while keeping every implementation, authentication, provider, runtime, API, real-data, and dependent-module capability blocked.

**Committed evidence:** `REG-0028` and accepted `ADR-0011` establish the shared durable account boundary, provider neutrality, authentication/session/recovery separation, Editorial Identity separation, multi-client reuse, and safe dependent-module deletion boundary. The Public Identity implementation-crossing audit determined that exact Database and Security/privacy contracts must precede authorization and recommended a runtime-inert durable root only. Database conventions establish plural `snake_case`, application-generated UUIDv7 business identifiers, UTC `timestamptz`, and checked text for small closed vocabularies. `ADR-0012` records the material physical decision.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §9.1; `ALSAMAD_SECURITY_ARCHITECTURE.md` §6; `ALSAMAD_API_ARCHITECTURE.md` §9; `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Public ALSAMAD Identity architecture-track dependency status; `ADR-0012`.

**Affected roadmap gate:** Physical-contract prerequisite only. `DURABLE ACCOUNT ROOT PHYSICAL CONTRACT = APPROVED`; `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`. No implementation unit or acceptance PASS exists.

**Opened:** 2026-08-30.

**Tier rationale:** Registry + ADR. The physical identifier, lifecycle representation, constraints, and deletion boundary become data-shaping and difficult to reverse after authentication identities, clients, or modules reference the root. The decision therefore meets both §7 ADR conditions. **ADR references:** `ADR-0011` (Accepted architectural dependency) and `ADR-0012` (Accepted physical contract).

**Status:** `DECIDED` (2026-08-30). Physical contract approved; not implemented and no implementation is authorized.

**Decision outcome:** The future root is exactly `users` with exactly four columns: application-generated UUIDv7 `id` (`uuid PRIMARY KEY NOT NULL`, no database default); `status` (`varchar(24) NOT NULL DEFAULT 'active'`) checked to `active`, `disabled`, `deletion_pending`, or `deleted`; immutable `created_at` (`timestamptz NOT NULL DEFAULT current_timestamp`); and lifecycle-only `updated_at` (`timestamptz NOT NULL DEFAULT current_timestamp`). The primary key is the only index. `ck_users__status` closes the vocabulary. Future trigger `trg_users__lifecycle_integrity` rejects identity/creation mutation, timestamp-only/no-op updates, non-increasing lifecycle timestamps, entry to `deleted` except from `deletion_pending`, and transition out of `deleted`.

The root's sole purpose is stable shared ALSAMAD account identity. It is opaque, provider/client/module independent, never derived from contact or provider identity, immutable, and never reused. It contains no credentials, secrets, provider identity, session, recovery, contact, presentation/profile, preference, saved-item, Editorial, Talibeen, marketing, analytics, engagement, or other module data. Exact reactivation, grace, appeal, retention, legal hold, hard-delete, and anonymization policy remains later authority; the physical representation preserves the lifecycle distinctions without selecting terminal disposition.

**Runtime, API, and data boundary:** A possible future implementation must be runtime-inert and create zero seed, backfill, real, or production rows; zero runtime readers or writers; no repository/service/provider/import/route/UI/server-action/background-job/composition-root consumer; and no dependent FK or cascade. The root is internal and absent from APIs, public identifiers, request/response contracts, serialization, REST, GraphQL, RPC, routes, and clients. It is personal-data-capable architecture, but real-user activation requires separate privacy/legal/security/provider/operational governance.

**Migration and rollback boundary:** A later Owner-reviewed Roadmap crossing may name one isolated additive migration for `users` only and the minimum schema/journal/verification files. No filename or file boundary is assigned here. Before any consumer or row exists, the isolated unused unit must be removable without data migration, provider cleanup, session revocation, API compatibility, route cleanup, module cleanup, or user-data recovery.

**Deferred boundaries:** Authentication linkage and `user_identities`; provider/mechanism selection; credentials; sessions and `user_sessions`; recovery persistence/workflows; preferences and saved items; repositories/services; API/UI; real-user activation; privacy notice/lawful basis/retention/deletion completion/access/export/backups/audit/provider metadata/subprocessors/transfers/support/jurisdictions; and all Talibeen linkage/persistence remain deferred and require their own crossings.

**Absolute non-authorization:** **THIS DECISION DOES NOT AUTHORIZE IMPLEMENTATION.** It authorizes no table creation, ORM schema, migration, journal edit, test, seed, row, provider integration, credential, auth link, session, recovery record, repository/service, API/route/UI, signup/login, real account/personal data, Talibeen linkage, deployment, staging, commit, or push. The Roadmap remains exclusive implementation authority.

**Independence from protected status truths:** Core Release 1 remains guest-first and exactly 30 tables. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7 and `M5 Quran Import Activated` remain `NOT PASS`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains `NOT STARTED / BLOCKED`; combined KE-2 remains incomplete; and no KE-3 authority exists. `TALIBEEN FOUNDATION = COMPLETE` and `Talibeen Foundation Verified = PASS`; broader Talibeen remains `BLOCKED / NOT AUTHORIZED` with no next unit authorized.

**Implementation evidence:** None.

**Supersedes / Superseded by:** Does not supersede `REG-0028`; it operationalizes only the previously unresolved minimal physical-root contract under `REG-0028`/`ADR-0011`.

### REG-0030 — Public ALSAMAD runtime-inert durable account-root persistence implementation authorization

**Category:** `Database`, `Security`, `API`, `Roadmap`.

**Summary:** Whether to authorize one future, separate implementation of the already-approved provider-neutral, zero-row, runtime-inert Public ALSAMAD durable account root under an exact four-file boundary, without authorizing any broader account, authentication, provider, API, real-data, or Talibeen capability.

**Committed evidence:** `REG-0028` and accepted `ADR-0011` approve the shared Public ALSAMAD Identity architecture boundary. `REG-0029` and accepted `ADR-0012` approve the exact minimal `users` physical contract, Security/privacy acceptance boundary, API no-surface rule, and inert rollback premise while explicitly withholding implementation authority. The first implementation-authorization audit confirmed the repository precedent of one shared Drizzle schema edit, one handwritten forward-only SQL migration, one mechanical journal append, and PostgreSQL verification. It also confirmed that `uuid` v14 and unchanged `src/db/ids.ts` already provide `createId()` through UUIDv7, no snapshot is currently required, and no provider or external research is needed for an empty inert root.

**Affected architecture:** Existing `ALSAMAD_DATABASE_ARCHITECTURE.md` §9.1, `ALSAMAD_SECURITY_ARCHITECTURE.md` §6, `ALSAMAD_API_ARCHITECTURE.md` §9, accepted `ADR-0011`, and accepted `ADR-0012` remain unchanged and controlling.

**Affected roadmap gate:** `PUBLIC ALSAMAD RUNTIME-INERT DURABLE ACCOUNT ROOT PERSISTENCE = COMPLETE` only. Broader `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED` except for this completed explicit unit.

**Opened:** 2026-08-30.

**Tier rationale:** Registry-only implementation-authorization crossing. The material identity and physical decisions are already frozen by `REG-0028`/`ADR-0011` and `REG-0029`/`ADR-0012`; this entry changes no architecture and only authorizes bounded, reversible execution against those decisions. **ADR references:** `ADR-0011` and `ADR-0012` (Accepted dependencies; unchanged).

**Status:** `IMPLEMENTED` (2026-08-31; decision recorded 2026-08-30). The exact authorized runtime-inert durable account-root persistence unit is COMPLETE under the corresponding Roadmap PASS. This lifecycle transition records accepted implementation evidence only and changes none of the original decision semantics or broader Public Identity authority.

**Decision outcome:** Authorize a future, separate unit named **PUBLIC ALSAMAD RUNTIME-INERT DURABLE ACCOUNT ROOT PERSISTENCE**. The unit may add only the Drizzle representation of the approved `users` root; one isolated additive forward-only migration; required database constraints and lifecycle-integrity function/trigger; one mechanical migration-journal append; and PostgreSQL verification additions required to prove the contract. It must create zero seed, backfill, real, or retained fixture rows and zero runtime consumers.

**Exact future implementation boundary:**

1. modify `src/db/schema.ts`;
2. create `drizzle/<mechanically-assigned-next-number>_public_identity_account_root.sql`;
3. modify `drizzle/meta/_journal.json` only for one mechanical registration append;
4. modify `scripts/db-verify.mjs` only for this unit's verification.

No standalone test file, dependency file, snapshot, runtime file, API file, UI file, provider/auth file, or Talibeen file is authorized. The migration number is recomputed from authoritative repository state at implementation time. The current audit observed `0013` only as the next likely number from the unchanged baseline; this decision does not reserve or permanently pre-claim it. The semantic suffix is exactly `public_identity_account_root`. If tooling requires an additional file, snapshot, dependency, or unrelated generated change, implementation must stop and return to governance.

**Adopted physical contract:** `users` has exactly four columns and no fifth field: application-generated UUIDv7 `id` (`uuid PRIMARY KEY NOT NULL`, no database default, opaque, immutable, ALSAMAD-owned, provider/client/module independent, not derived from contact/provider data, never reused); `status` (`varchar(24) NOT NULL DEFAULT 'active'`); immutable `created_at` (`timestamptz NOT NULL DEFAULT current_timestamp`); and lifecycle-only `updated_at` (`timestamptz NOT NULL DEFAULT current_timestamp`). The closed status values are exactly `active`, `disabled`, `deletion_pending`, and `deleted`. The primary-key index on `users.id` is the only index.

**UUID and lifecycle integrity:** No new UUID dependency and no change to `src/db/ids.ts` are authorized. The migration must retain no database UUID default and may implement the established PostgreSQL UUIDv7/RFC-variant check as `ck_users__id_uuidv7`. `ck_users__status` enforces the four values. The exact governed trigger is `trg_users__lifecycle_integrity`; its supporting function name is a local engineering detail following repository convention. The trigger rejects `id` or `created_at` mutation, timestamp-only and no-op updates, status changes without a strictly increasing explicitly supplied `updated_at`, entry to `deleted` except from `deletion_pending`, and every transition out of `deleted`. `DEFAULT current_timestamp` is insertion-only; no general automatic update-on-write mechanism is authorized.

**Data, runtime, and API boundary:** The root contains no email, phone, username, display/avatar, provider subject, credential, password/passkey, session, recovery, preference, saved-item, profile, marketing, analytics, Editorial, Talibeen, or module-specific data. It has no FK, cascade, dependent table, seed, backfill, real account, or real personal data. It has no reader, writer, repository, service, route/handler, UI, server action, background consumer, auth/provider integration, account-creation flow, composition-root consumer, or Talibeen linkage. It remains absent from REST, GraphQL, RPC, request/response schemas, public identifiers, serialization, account services, and every public/runtime surface.

**Migration and journal contract:** Exactly one isolated additive forward-only migration may contain only `users`, its four approved columns/defaults, the UUIDv7/RFC check, status check, lifecycle function, lifecycle trigger, and mechanically necessary SQL. `drizzle/meta/_journal.json` may receive exactly one append with the next journal index, version `7`, a monotonic `when`, matching migration tag, and `breakpoints: true`; every prior entry and migration remains unchanged. No snapshot is authorized unless implementation-time tooling proves one mechanically required, in which case implementation stops for governance review.

**Verification and acceptance:** `scripts/db-verify.mjs` may add only real-PostgreSQL and repository evidence for the exact table/columns/types/defaults; UUIDv7/variant acceptance and invalid version/variant rejection; absent database UUID default; duplicate-ID rejection; default and invalid status behavior; `ck_users__status`; immutable `id`/`created_at`; timestamp-only/no-op/non-increasing lifecycle rejection; valid explicitly later lifecycle change; `deletion_pending → deleted`; invalid direct entry to and every transition out of `deleted`; primary-key-only indexing; absent prohibited fields/FKs/cascades; zero seed/backfill/retained rows; exact migration/journal boundary; and zero runtime/API/Talibeen integration. Synthetic fixtures must be transaction-scoped and rolled back. Runtime scans must distinguish legitimate schema/verifier references from prohibited consumption across relevant `src/app`, `src/components`, `src/lib`, server-action, non-verifier-script, and composition-root locations.

The implementation must pass `npm run db:check`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm test`, `npm run build`, and `git diff --check`, plus exact implementation/staged-file review, prior-migration byte-integrity review, exactly-one-journal-append review, zero-row proof, zero-runtime proof, API no-surface proof, Talibeen non-expansion proof, and rollback evidence. Compilation alone is insufficient.

**Rollback:** Migration execution failure must roll back atomically through the existing transaction. Before database application, rollback is reversion of the exact implementation commit. After application, and only while `users` is verified empty and unconsumed, removal requires a separately reviewed forward cleanup migration. Committed migration or journal history must never be rewritten, and production user data must never be silently dropped. The inert unit requires no provider, session, API, route, Talibeen, module, or user-data cleanup because none is authorized.

**Scoped threat/data-flow assessment:** Data flow is limited to reviewed migration tooling applying structure to PostgreSQL and transaction-scoped synthetic verification that leaves zero rows. There are no credentials, contacts, provider identities, sessions, recovery data, module/Talibeen data, runtime consumers, or public/API surfaces. The controlling risks are schema drift from `ADR-0012`, incorrect UUID semantics, lifecycle-integrity bypass, accidental runtime exposure, migration/journal corruption, and accidental sensitive fields or relationships. The acceptance contract above addresses each risk. This is not approval for real-user processing.

**Research boundary:** No external research is required for this inert implementation. Provider/runtime integration later requires separate authentication-security, provider, session, recovery, and operational-support research/governance. Real-user activation later requires privacy/legal, retention/deletion, backup, access/export, audit, transfers/subprocessors, Security, and jurisdiction research/governance. Talibeen production linkage additionally requires identity/age-assurance, privacy, legal, safety, moderation, retention, and jurisdiction research/governance.

**Explicit exclusions:** This decision authorizes no provider selection/integration; `user_identities`; `user_sessions`; authentication, signup/login, session, or recovery runtime/persistence; account repository/service/API/UI; real account or personal-data processing; preferences/saved items; Editorial linkage; Talibeen linkage/profile/persistence/discovery/introductions/messaging/moderation/API/UI; notifications; payments; SEO; analytics; AI; background jobs; deployment; or broader Public Identity implementation.

**Independence from protected status truths:** `REG-0029` remains `DECIDED`; `ADR-0012` remains Accepted and unchanged. Core Release 1 remains guest-first and exactly 30 tables. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7 and Quran Import Activated remain `NOT PASS`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains BLOCKED; combined KE-2 remains incomplete; and no KE-3 authority exists. `TALIBEEN FOUNDATION = COMPLETE` and `Talibeen Foundation Verified = PASS`; broader Talibeen remains `BLOCKED / NOT AUTHORIZED`, with no next Talibeen unit.

**Implementation evidence:** `Public ALSAMAD Durable Account Root Persistence Verified = PASS` in `ALSAMAD_IMPLEMENTATION_ROADMAP.md`, implemented by commit `62e6df28c2f66f93b6a2633a9d23de026c4d4085` (`feat: implement inert durable account root persistence`) with parent `64eb686974f310c8fed01bf2c9c9cbce99964eeb` in exactly `drizzle/0013_public_identity_account_root.sql`, `drizzle/meta/_journal.json`, `scripts/db-verify.mjs`, and `src/db/schema.ts`. Migration `0013_public_identity_account_root.sql` completes the exact four-column `users` physical contract, UUIDv7/RFC-variant checks, lifecycle-integrity function and trigger, primary-key-only/zero-FK boundary, zero retained rows, and isolated additive migration with exactly one journal append. Acceptance evidence: `db:check` PASS; typecheck PASS; lint PASS; targeted implementation formatting PASS; repository tests 497/497 PASS; production build PASS with 265 static pages; Git diff checks PASS; migration/journal integrity PASS; zero runtime consumers; API no-surface PASS; and Talibeen isolation PASS. Repository-wide `format:check` remains pre-existing unrelated debt at 41 failures; none of the Prettier-supported implementation files is implicated. Remote proof: `HEAD == origin/main == live remote main == 62e6df28c2f66f93b6a2633a9d23de026c4d4085` with divergence `0 / 0`. This completes only the exact inert persistence unit and grants no authority for a next Public Identity unit, provider or identity linking, sessions, recovery, preferences/saved items, APIs, runtime readers/writers, real-user activation, deletion/retention implementation, profile linkage, or Talibeen linkage. Broader `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

**Supersedes / Superseded by:** Supersedes no decision. It operationalizes the exact physical contract in `REG-0029`/`ADR-0012` without changing or repurposing either.

### REG-0031 — Public ALSAMAD provider-neutral authentication identity linkage governance boundary

**Category:** `Database`, `Security`, `API`, `Roadmap`.

**Summary:** Whether to approve the next architecture-only boundary for how future replaceable authentication identities may resolve to the completed durable ALSAMAD account root without selecting a provider, freezing physical persistence, authorizing implementation, or beginning real-user processing.

**Committed evidence:** `REG-0028` and accepted `ADR-0011` separate the durable account from credentials, provider subjects, sessions, recovery, Editorial Identity, and module profiles. `REG-0029`/`ADR-0012` freeze only the minimal `users` root, and implemented `REG-0030` records that root as COMPLETE/PASS while explicitly withholding every authentication-linkage, provider, runtime, API, and real-data capability. Owner approval dated 2026-08-31 settles only the provider-neutral linkage invariants below. `ADR-0013` records the material rationale, threats, data-flow boundary, and rejected alternatives.

**Affected architecture:** `ALSAMAD_DATABASE_ARCHITECTURE.md` §9, `ALSAMAD_SECURITY_ARCHITECTURE.md` §6, `ALSAMAD_API_ARCHITECTURE.md` §9, and accepted `ADR-0011`/`ADR-0012` remain controlling and are extended only by accepted `ADR-0013`. Product Architecture is unchanged.

**Affected roadmap gate:** `PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE ARCHITECTURE = OPEN / APPROVED` only. `PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE PHYSICAL CONTRACT = BLOCKED / NOT AUTHORIZED`; `PUBLIC ALSAMAD AUTHENTICATION IDENTITY LINKAGE IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`; and broader `PUBLIC ALSAMAD IDENTITY IMPLEMENTATION = BLOCKED / NOT AUTHORIZED`.

**Opened:** 2026-08-31.

**Tier rationale:** Registry + ADR. A future authentication linkage would be security-sensitive, personal-data-capable, persistent, and difficult to reverse after account access depends on it. Incorrect cardinality, uniqueness, merge, transfer, or unlink semantics could cause account duplication or takeover. This architecture decision therefore meets the Registry §7 ADR threshold. **ADR reference:** `ADR-0013` (Accepted).

**Status:** `DECIDED` (2026-08-31). Architecture/threat/data-flow governance only; no physical contract, implementation, provider, API, runtime, real identity, or personal-data processing is authorized.

**Decision outcome:** Approve the architecture boundary named **PUBLIC ALSAMAD PROVIDER-NEUTRAL AUTHENTICATION IDENTITY LINKAGE GOVERNANCE BOUNDARY**. One durable ALSAMAD account may eventually link to multiple authentication identities. One authentication identity may resolve to at most one durable account. Conflict, ambiguity, collision, stale ownership evidence, or an identity already linked elsewhere must fail closed. No automatic merge, transfer, takeover, duplicate-account creation, or contact-based equivalence is permitted.

Future additional linkage requires proof of control of the existing durable ALSAMAD account and proof of control of the new authentication identity. Matching email, phone, or another mutable contact attribute is never sufficient and must not redefine durable ownership. A provider subject or authenticator identity is conceptually distinct from mutable contact data; provider-side contact changes do not create a new ALSAMAD account. Unlinking must not silently strand an account without another separately governed secure access or recovery path. Replacement or relinking must not automatically erase necessary security/audit lineage; exact audit data, retention, deletion, access, and privacy treatment remain deferred.

**Assurance boundary:** Authentication assurance proves only the governed control relationship needed for account access. It implies no trust, reputation, piety, compatibility, Editorial authority, Talibeen authority, membership tier, payment status, or social standing.

**Threat/data-flow boundary:** Conceptual actors are the durable ALSAMAD account, a replaceable authentication identity, a future authenticator/provider, a future client, and a future account-resolution boundary. Conceptual flow is proof of control presented through a separately governed future authentication mechanism to resolve an authentication identity to one durable account. Threats requiring later concrete controls include account duplication, account takeover, mutable-contact collision, provider-subject collision, ambiguous mapping, stale linkage, unsafe unlink, accidental cross-account transfer, privilege/trust conflation, enumeration, and provider-subject or durable-identifier leakage. This decision defines invariants only and no operational mechanism.

**Privacy/data-minimization boundary:** No real personal-data processing begins. Before any physical or runtime authorization, separate governance and applicable research must resolve purpose limitation, data minimization, lawful basis, notice, provider metadata, retention, deletion completion, access/export, audit/log access, support access, subprocessors, transfers, and jurisdiction obligations. No external research is required for this provider-neutral conceptual boundary; it becomes mandatory before provider selection/integration, real authentication identities, runtime linkage, session or recovery mechanisms, real-user activation, or production legal/privacy processing.

**Governance sequencing:** The next conceptual order is linkage governance → session governance → recovery governance. This is governance dependency sequencing only, not implementation authorization. Session and recovery mechanisms remain separate future decisions.

**Absolute non-authorization:** This decision authorizes no `user_identities` table or physical name; schema, columns, keys, indexes, FKs, constraints, migration, journal change, test, seed, row, provider selection/integration, Google/Apple/passkey integration, credential, email/phone storage, signup/login, session, recovery, repository/service, runtime reader/writer, account creation, API or UI, real account or personal data, preference, saved item, public profile, deletion/retention implementation, Editorial linkage, Talibeen linkage, notification, payment, SEO, analytics, AI, background job, deployment, implementation file boundary, or next runtime unit. A separate physical-contract crossing and a later separate Owner-reviewed implementation crossing remain mandatory.

**Independence from protected status truths:** `REG-0030` remains `IMPLEMENTED`; the Durable Account Root remains COMPLETE/PASS. Core Release 1 remains guest-first and exactly 30 tables. `M5 Gate 3` remains `PARTIAL`; M5 Gates 4–7 and Quran Import Activated remain `NOT PASS`; `M6.1`/`M6.2` remain `BLOCKED`; KE-1 remains COMPLETE/runtime-inert; KE-2A remains COMPLETE; KE-2B remains BLOCKED; combined KE-2 remains incomplete; and no KE-3 authority exists. `TALIBEEN FOUNDATION = COMPLETE` and `Talibeen Foundation Verified = PASS`; broader Talibeen remains `BLOCKED / NOT AUTHORIZED`.

**Implementation evidence:** None. Architecture is OPEN / APPROVED; physical contract and implementation are `BLOCKED / NOT AUTHORIZED`.

**Supersedes / Superseded by:** Supersedes no decision. It extends `REG-0028`/`ADR-0011` without changing `REG-0029`/`ADR-0012` or implemented `REG-0030`.
