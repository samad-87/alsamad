# ADR-0002: Devotional Content Translation Storage / Lifecycle Boundary

**Registry entries:** `REG-0006`, `REG-0007` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-08.

This ADR records an architectural decision only. It does not authorize implementation of `content_translations`, the M6.1 migration, or any code. It does not freeze exact column names, types, or lengths — see "Decision" below.

## Context

`ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4's summary row for `content_translations` states: "FKs to revision and locale; checked rendering kind; unique revision/locale/kind/version; review outcome; published text immutable." M6 is committed as authorizing exactly four new physical tables (`ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6, "Database changes allowed," committed `d327ef6`): "cumulative Release 1 domain count becomes exactly **20 of 30**." Two open physical questions blocked authoring §5.4.4: (1) whether `content_translations` stores its own rendering text and checksum, or instead references a shared/second text-specialization table (mirroring how `quran_translation_texts`, §5.3.7, stores no text of its own and instead holds a unique FK to `passage_texts`); and (2) whether "review outcome" and "published text immutable" require one lifecycle column or two independent ones.

## Existing repository constraints

- Exactly four new M6 tables are authorized; no fifth (`ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6, committed).
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.1 states the reason `content_items`/`content_revisions` exist as a table family separate from `works`/`editions`/`passages`/`passage_texts`: "A `content_item` is the stable non-Quran publishable identity and owns an append-only chain of immutable `content_revisions`" — precisely so ordinary devotional content does not need the structural work/edition/passage model that Quran requires.
- §5.3.6 `quran_translation_editions` precedent: this table carries `review_status` (`pending`/`approved`/`rejected`/`withdrawn`) and `reviewed_at` as its **only** lifecycle columns; it carries no separate `publication_state`. Its own text: "Publication requires `review_status = 'approved'`, active license and attribution, approved source decision, complete verse reconciliation, and the generic edition to be published" — publication eligibility is derived from the review outcome plus the referenced row's state, not stored twice.
- §5.2.8 `content_revisions` precedent (a different, not-automatically-applicable pattern): two independent columns, `verification_state` and `publication_state`, because verification and publication are independently tracked processes for that table.
- §5.2.10 supplies a reusable checksum/normalization contract (SHA-256, versioned normalization) applicable to any text-bearing table.
- §2.4 rule 10: published content is append-only; corrections create new rows, never destructive rewrites.

## Decision

`content_translations` directly owns its rendering text and an integrity checksum. No fifth M6 table is introduced, and `passage_texts` is not reused. The table specializes exactly one `content_revisions` row, one `locales` row, and a rendering kind closed to `translation` and `transliteration` — both terms already named in §5.4's own purpose text for this table, so no new vocabulary is invented. A version component keeps the tuple `(content_revision, locale, rendering_kind, version)` unique, permitting a corrected re-rendering without editing a published row.

The table carries the **minimum review lifecycle necessary**: a single closed-vocabulary review-state column, matching the `quran_translation_editions` precedent (§5.3.6) rather than the `content_revisions` two-column precedent (§5.2.8). There is **no** independent, second publication-state column. Rendering/public eligibility is a **derived** fact — an approved review outcome, together with the referenced `content_revisions` row's own published state and the referenced `locales` row's enabled state — never stored redundantly on this table. Published rendering text and its checksum become immutable once first eligible, consistent with the immutable-once-published pattern already normative for `editions`/`passage_texts`/`quran_surahs`; a correction is a new version row, never an edit to the published one.

**Exact physical column names, types, and lengths are explicitly not decided or frozen by this ADR.** Terms used in this document and in the prior decision analysis (for example a "text" column, a "checksum" column, a "review-state" column, a "version" component) describe the required *concepts* only. When `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.4 is authored, its exact column names, types, and lengths must be independently justified against `ALSAMAD_DATABASE_ARCHITECTURE.md` §2.5's naming conventions and existing committed precedent at that time — not carried over automatically from any prior draft or report.

## Alternatives considered

**(a) Own-column text storage, single lifecycle column — chosen.**

**(b) Shared text-specialization table**, either as a new fifth physical table or by reusing the existing `passage_texts` table.

**(c) Dual lifecycle columns**, mirroring `content_revisions`' `verification_state` + `publication_state` split.

## Why alternatives were rejected

**(b) rejected.** A new fifth table directly contradicts the already-committed, already-approved "exactly four tables / 20 of 30" M6 boundary. Reusing `passage_texts` would require every dua/dhikr translation to also acquire `works`/`editions`/`passages` rows, directly contradicting §5.2.1's own stated reason `content_items`/`content_revisions` exist — to let ordinary devotional content avoid that structural model entirely. Both variants of (b) are foreclosed by already-binding, already-committed constraints, not merely disfavored.

**(c) rejected.** Nothing in the committed §5.4 summary or elsewhere proves content_translations needs independently trackable review and publication states; the `content_revisions` two-column split exists because that table's verification and publication genuinely diverge in ways not evidenced here. Reusing the simpler, single-column `quran_translation_editions` pattern is sufficient, avoids inventing parallel lifecycle state, and keeps the schema at its minimum necessary size.

## Consequences

`content_translations` becomes a four-FK-plus-payload table with one lifecycle column, structurally closer to `quran_translation_editions` than to `content_revisions`. No read path needs to reconcile two independent state columns on this table; eligibility is always a join-time derivation against the referenced revision and locale. Authoring §5.4.4 becomes a matter of naming and typing the already-decided concepts (text, checksum, version, single review-state column), not deciding their shape.

## Reversibility/migration impact

Low risk today: zero `content_translations` rows exist and migration `0005` has not been written. Reversing the storage-shape decision (own-column → shared-table) after real rows exist would require a data migration and a type/relationship change on a text-bearing table — materially more expensive than deciding it now, before any implementation. This is exactly why this decision meets the ADR threshold ("fundamental frozen-data-model changes").

## Relationship to existing architecture

- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 (summary; §5.4.4 to be authored), §5.2.1, §5.2.8, §5.2.10, §5.3.6, §5.3.7.
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6 "Database changes allowed" (committed `d327ef6`).

## Relationship to M6 Roadmap gates

This ADR resolves the storage-shape and lifecycle-column prerequisites for authoring `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.4. It does not itself authorize `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 implementation by itself, migration `0005`, or `M6.1` implementation. `M6.1 Devotional Schema Foundation Verified` remains blocked on the remaining §5.4 column-level documentation prerequisite and on the independent, unrelated `M5 Quran Import Activated` production-activation dependency. Neither is resolved by this ADR.

This ADR is scoped entirely to Release 1 M6 devotional content translation storage. It does not authorize M7 implementation, does not authorize any Editorial Administration implementation, and does not authorize any Knowledge Engine / M7.0 work. Those remain separate, later authorizations under their own Roadmap contracts and are not implied, referenced, or advanced by this decision.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11: this ADR is never edited in place. A materially different outcome requires a new ADR that explicitly supersedes `ADR-0002`; this document then becomes `Superseded by <new ADR>` and is retained for history.
