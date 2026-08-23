# ADR-0009: KE-2 Topics and Content-Topics Migration Sequencing Split

**Registry entry:** `REG-0022` (`ALSAMAD_DECISION_REGISTRY.md`)

## Status

Accepted — 2026-08-22. Implementation not started.

This ADR supersedes `ADR-0007` in whole, per `ALSAMAD_DECISION_REGISTRY.md` §11's append-only, never-rewritten-in-place rule. `ADR-0007`'s §§1–3 physical data-model text is unmodified. `ADR-0007` is itself superseded and retained only for history; this ADR (`ADR-0009`) is the current governing document for `topics` and `content_topics`, and it incorporates `ADR-0007` §§1–3 by reference as unchanged, binding normative specification. Only `ADR-0007` §4's single-migration/joint-rollback rule is replaced. This ADR authorizes no migration, schema mapping, code, seed data, runtime wiring, search expansion, editorial UI, provider access, or later Knowledge Engine phase. `REG-0024`/supplemental `ADR-0010` supersede historical `REG-0023` and satisfy KE-2A's corrected separate Registry crossing without changing this ADR's split/sequencing decision; KE-2B remains gated by its own future, separate crossing.

## Context

`ADR-0007` §4 and `ALSAMAD_DATABASE_ARCHITECTURE.md` §10.1.3 required `topics` and `content_topics` to ship as one atomic migration whose failure rolls back both tables together. Independent feasibility review found `content_topics.devotional_item_id → devotional_items.id` has no live physical target: `devotional_items` does not exist in `src/db/schema.ts` and remains blocked behind `M6.1`, itself blocked behind `M5 Quran Import Activated` (`NOT PASS`). `topics` has no such dependency — it depends only on `locales` and `editorial_users`, both already physically present. Under the joint-migration rule, `topics` was indefinitely delayed by a dependency it does not itself have. The owner selected a governed sequencing split over waiting indefinitely for `M6.1`.

## Decision

### 1. Relationship to `ADR-0007`

`ADR-0007` §§1–3 — the `topics` and `content_topics` classification, ownership, column, type, default, check, trigger, index, and foreign-key specification, and its "Why alternatives were rejected" and "Explicit exclusions" sections — remain unmodified and are incorporated into this decision by reference, not by reproduction. `ADR-0007` §4 ("Runtime, data, and migration rules") is the only portion this ADR replaces: specifically, its requirement of one atomic migration for both tables with joint rollback. `ADR-0007` itself is superseded and retained only for history; it is not an independently current governing document. No topic or content_topics column, type, default, check, trigger, index, foreign key, lifecycle rule, review-state rule, canonical-owner-eligibility rule, UUIDv7 rule, localization rule, or weight rule is redesigned, narrowed, or loosened by this ADR.

### 2. `KE-2A` — Topics Foundation

`KE-2A` delivers exactly the `topics` table (specification incorporated from `ADR-0007` §2, unchanged) as one atomic, empty, forward-only migration. Its dependencies are `locales` and `editorial_users`, both already physically present; it depends on nothing else. Migration failure rolls back only the `topics` table, its triggers, constraints, and indexes. `KE-2A` remains runtime-inert and seed-free, identically to the original KE-2 rule.

### 3. `KE-2B` — Content Topic Assignments

`KE-2B` delivers exactly the `content_topics` table (specification incorporated from `ADR-0007` §3, unchanged) as a later, separate atomic, empty, forward-only migration. Its dependencies are `KE-2A` complete; `quran_ayahs` physically present (already exists); `devotional_items` physically present (does not yet exist); `content_items` physically present; and `editorial_users`. Migration failure rolls back only the `content_topics` table, its triggers, constraints, and indexes — it does not reopen or roll back `topics`. `KE-2B` may not begin execution before `devotional_items` physically exists.

### 4. Migration numbering

Each unit's migration number is assigned mechanically at that unit's own execution, from the then-authoritative forward-only sequence — exactly as `ADR-0007` §4 and `REG-0015` already required for the single migration they governed. This ADR does not assign, freeze, or pre-claim a number for either unit. `0010` remains reserved for `M6.1`'s `devotional_content_foundation` migration and may not be taken by either `KE-2A` or `KE-2B`. Prior migrations `0000`–`0009` and `0011` remain byte-unchanged.

## Why alternatives were rejected

- **Leaving the joint-migration rule in place and waiting for `M6.1`:** rejected because it indefinitely delays `topics`, which has no dependency on `devotional_items`, for a dependency it does not have.
- **Redesigning the `topics`/`content_topics` physical model to remove the split's need:** rejected — feasibility review found no defect in the existing model; the blocker is sequencing, not schema design.
- **A partial or "superseded-in-part" ADR status for `ADR-0007`:** rejected — no such status exists anywhere in this repository's ADR precedent (`ADR-0001` through `ADR-0006` uniformly describe only whole-document supersession). Inventing one was explicitly rejected during governance-design review.

## Reversibility and ADR threshold

This ADR changes an already-`Accepted` physical/procedural commitment (the migration atomicity and rollback boundary), independently meeting `ALSAMAD_DECISION_REGISTRY.md` §7's materiality prong. Before either migration executes, reversal remains limited to abandoning an unexecuted migration plan, identical to `ADR-0007`'s own original reversibility statement.

## Explicit exclusions

Any redesign of `topics` or `content_topics` columns, triggers, indexes, foreign keys, review-state, canonical-owner-eligibility, UUIDv7, localization, or weight rules beyond supplemental `ADR-0010`'s exact KE-2A lifecycle/timestamp clarification; `KE-2B` implementation authorization; assignment of either unit's migration number; reassignment of `0010`; `KE-3` or any later Knowledge Engine phase; collections, references, Duas adapters, generic `knowledge_edges`; and every exclusion already listed in `ADR-0007`'s own "Explicit exclusions" section remain unauthorized. KE-2A's corrected implementation authorization is recorded separately by `REG-0024`/`ADR-0010` and does not arise from or modify this ADR's split/sequencing decision.
