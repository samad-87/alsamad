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

| ID       | Title                                                                                      | Category        | Status  | Tier                                                                      |
| -------- | ------------------------------------------------------------------------------------------ | --------------- | ------- | ------------------------------------------------------------------------- |
| REG-0001 | Editorial General Dua placement in the devotional physical model                           | Database, Admin | DECIDED | Registry + ADR (`ADR-0001`, Accepted)                                     |
| REG-0002 | `devotional_items` specialization depth and independent lifecycle                          | Database        | DECIDED | Registry only                                                             |
| REG-0003 | `devotional_collections` ↔ content-item relationship cardinality and independent lifecycle | Database        | DECIDED | Registry only                                                             |
| REG-0004 | `devotional_collections.collection_kind` closed-vocabulary source of truth                 | Database, Admin | DECIDED | Registry only                                                             |
| REG-0005 | Repetition-guidance storage locus and its source-evidence representation                   | Database        | DECIDED | Registry only                                                             |
| REG-0006 | `content_translations` text-storage representation                                         | Database        | DECIDED | Registry + ADR (`ADR-0002`, Accepted)                                     |
| REG-0007 | `content_translations` review/publication lifecycle column count                           | Database        | DECIDED | Registry only (decided alongside `ADR-0002`, which covers the same table) |
| REG-0008 | `devotional_collection_items` membership deletion semantics                                | Database        | DECIDED | Registry only                                                             |
| REG-0010 | In-application display and standalone redistribution rights separation                     | Database        | DECIDED | Registry + ADR (`ADR-0003`, Accepted)                                     |
| REG-0011 | Immutable source import manifest and execution evidence separation                         | Database        | DECIDED | Registry + ADR (`ADR-0004`, Accepted)                                     |

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
