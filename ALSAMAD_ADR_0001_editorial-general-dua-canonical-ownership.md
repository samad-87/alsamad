# ADR-0001: Editorial General Dua Canonical Ownership / Devotional Specialization Boundary

**Registry entry:** `REG-0001` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-08.

This ADR records an architectural decision only. It does not authorize implementation of `devotional_items`, the M6.1 migration, or any code. Implementation remains gated exclusively by `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s M6 milestone contract and its acceptance gates.

## Context

`ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4's summary row for `devotional_items` states: "One-to-one FK to content item; unique canonical key; checked type; type-specific source/review checks." The accompanying §5.4 narrative states: "Editorial General Dua is separated by a checked devotional type, required editorial and religious-appropriateness reviews, source-claim constraints, and mandatory public labeling. A one-to-one detail table would add symmetry but no additional durable state." §8 ("Minimum Schema by Journey") lists `devotional_items` as required for the "Dua or dhikr detail" journey row, but its "Editorial General Dua separation" row names no table at all — only "Checked devotional type, required review records, source-claim constraints, and public labeling."

Separately, `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.1 lists "Editorial General Dua" as one of four "devotional classes" (alongside Quranic Dua, Prophetic Dua, Authenticated Dhikr) under "Devotional Content Administration," while §9 gives Editorial General Dua its own, separate administrative section, and §9.1 states it "must retain its dedicated structural distinction defined by the database architecture" — a direct pointer into this document.

Whether an Editorial General Dua content item receives a row in the `devotional_items` specialization table was left genuinely ambiguous by the text alone, and this ambiguity blocked authoring `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.1.

## Existing repository constraints

- `drizzle/0002_content_integrity_foundation.sql` (commit `a83c605`, M4, already migrated) contains, verbatim: `constraint ck_content_items__editorial_general_dua check((content_type='editorial_general_dua')=(origin_kind='editorial' and owning_module='editorial'))`. An `editorial_general_dua` content item can never have `owning_module` other than `editorial`.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §11 explicitly rejects, as Release 1 fragmentation, "separate devotional source, translation, transliteration, repetition, and Editorial General Dua detail tables."
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6 Security requirements (committed `d327ef6`) state: "Editorial General Dua remains distinguishable at the data layer purely through the already-approved `content_items.content_type = 'editorial_general_dua'` / `owning_module = 'editorial'` combination... M6 adds no new classification column."
- §2.4 rule 10 (no destructive rewrite; append-only correction model) and the general schema-minimalism principle (§2.1) govern how any specialization table may relate to `content_items`.

## Decision

Editorial General Dua remains canonically owned by the `editorial` module at the `content_items`/`content_revisions` layer. It **never** receives a row in `devotional_items`. `devotional_items` is restricted, by a cross-table trigger, to referencing only `content_items` rows where `content_type IN ('dua', 'dhikr')` and `owning_module = 'devotional'`. Because the existing, already-migrated `ck_content_items__editorial_general_dua` constraint makes `owning_module='editorial'` mandatory whenever `content_type='editorial_general_dua'`, this trigger condition mechanically excludes Editorial General Dua from `devotional_items` — it is not a new judgment call layered on top of an ambiguous text, but the direct consequence of an already-shipped constraint once `devotional_items`' own referential scope is fixed to `owning_module='devotional'`.

Public co-presentation of Editorial General Dua within the guest-facing Duas experience (same page, same journeys J5/J6) is a presentation-layer concern only and does not alter this canonical ownership. `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.1's "devotional classes" list is read as an administrative/editorial-workflow grouping (where staff manage this content type), not as an assertion of physical database co-location; §9's separate administrative section for Editorial General Dua is treated as the stronger, more specific signal, consistent with this decision.

Future editorial review workflow (`editorial_users`, `editorial_role_grants`, `review_records`) remains Phase 7 (M7) scope and is not implemented, referenced, or implied here.

## Alternatives considered

**(a) Exclude entirely — chosen.** Editorial General Dua is classified and separated purely through `content_items`/`content_revisions`; `devotional_items` never references it.

**(b) Include, with `devotional_items`' trigger accepting either `owning_module` value for `content_type='editorial_general_dua'`.** Editorial General Dua would receive a `devotional_items` row alongside authenticated dua/dhikr.

**(c) Give Editorial General Dua its own dedicated one-to-one detail table**, symmetric with `devotional_items` but scoped to `owning_module='editorial'` content items.

## Why alternatives were rejected

**(b) rejected** because it would require `devotional_items`' referential scope to admit two different `owning_module` values for one content type, a materially more complex validation shape than any other specialization table in the repository, and because the M6 Security requirements text explicitly states "M6 adds no new classification column" — folding Editorial General Dua into `devotional_items` blurs, rather than sharpens, the "authenticated vs. editorial" boundary priority 4 of this task exists to protect.

**(c) rejected** because §5.4's own narrative already considered and dismissed it ("A one-to-one detail table would add symmetry but no additional durable state"), and §11 explicitly lists "Editorial General Dua detail tables" among rejected Release 1 fragmentation.

## Consequences

`devotional_items` gains a simple, single-purpose referential scope (`dua`/`dhikr`, `owning_module='devotional'` only), with no special-casing for Editorial General Dua. The trigger required to enforce this scope (§5.4.1, once authored) is a direct, minimal consequence of this decision, not a separate open question. Editorial General Dua's structural distinction, as promised by `ALSAMAD_ADMIN_ARCHITECTURE.md` §9.1, is satisfied entirely by existing M4 mechanisms (`content_items.content_type`/`owning_module`, the existing check constraint) plus this decision — no new physical structure is required to satisfy that promise.

## Reversibility/migration impact

Low risk today: zero `devotional_items` rows exist, migration `0005` has not been written, and M6 authorizes zero seed rows. Reversing this decision **after** `devotional_items` rows exist would require either a schema change admitting a second `owning_module` value or a data migration reclassifying existing rows — moderately expensive and requiring careful trigger/constraint rework. This is precisely why the decision is being frozen now, before any implementation, rather than left to be improvised during M6.1.

## Relationship to existing architecture

- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4 (summary; §5.4.1 to be authored), §5.2.7 (`content_items`, including the referenced check constraint), §11.
- `ALSAMAD_ADMIN_ARCHITECTURE.md` §8.1, §9, §9.1 — no change to this document is required by this ADR; a future, separate, optional clarifying cross-reference in §8.1 could remove the apparent tension for future readers but is not a precondition of this decision.
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 6 Dependencies and Security requirements (committed `d327ef6`).

## Relationship to M6 Roadmap gates

This ADR resolves one prerequisite for authoring `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.4.1. It does not itself authorize `M6.1` implementation. `M6.1 Devotional Schema Foundation Verified` remains blocked on (a) the remaining §5.4 column-level documentation prerequisite and (b) the independent, unrelated `M5 Quran Import Activated` production-activation dependency recorded in the Phase 6 contract. Neither is resolved by this ADR.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11: this ADR is never edited in place. A materially different outcome requires a new ADR that explicitly supersedes `ADR-0001`; this document then becomes `Superseded by <new ADR>` and is retained for history.
