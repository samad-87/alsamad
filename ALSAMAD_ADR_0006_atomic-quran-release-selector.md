# ADR-0006: Atomic Quran Release Selector and Publication Consistency

**Registry entry:** `REG-0013` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-10.

This ADR records an architectural decision only. It does not authorize migration `0008`, a database change, provider access, credentials, content fetch, a real-resource manifest, a provider dry run, publication, an M5 gate PASS, ARC-006, M6, or M7.

## Context

`ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.9 already states the requirement this ADR resolves, without specifying its physical shape: "M5 activation must use a stable release/version selector outside the canonical table count so readers cannot observe a mixed provider version." No column, index, or trigger implementing that selector exists anywhere in the committed schema (`drizzle/0001`–`0007`). `editions` (§5.2.4) and `quran_translation_editions` (§5.3.6) each carry only `publication_state`/`review_status`; nothing distinguishes, among potentially several simultaneously `published`/`approved` rows for the same work or locale, which one is the currently served default. The Release 1 capability checklist (`ALSAMAD_IMPLEMENTATION_ROADMAP.md`, Phase 1) explicitly authorizes plural "Approved Quran text and script editions" and "Selected approved translations," so more than one published edition or approved translation edition can legitimately coexist — this decision closes the resulting gap: which one is "the" release a guest-first reader receives by default.

AUD-001 (`drizzle/0007_m5_publication_trigger_table_branching.sql`, committed at HEAD `5a901ec`) corrected the publication trigger's cross-table field-resolution defect, so `quran_surahs`, `quran_ayahs`, and `quran_structural_markers` can now transition to `published` without crashing. `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s AUD-001 section states this correction "must be completed before ARC-005 implementation begins, since a release-activation selector has no value if the content it would select can never be published." That precondition is now satisfied by repository evidence; this ADR proceeds on that basis while authorizing no implementation itself.

## Existing repository constraints

- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.4 (`editions`): publication is release/edition-scoped and immutable after first `published`, but carries no default/active designation.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.1–§5.3.7: the single approved Quran `work_id` is fixed (§5.3.2: "FK to the single approved Quran `works.id`"); `quran_ayahs`/`quran_surahs` canonical identity is edition-independent — one canonical structure per work, referenced by every `quran_ayah_texts` and `quran_translation_texts` row through `ayah_id`, not through the Arabic edition's own identity.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.6 (`quran_translation_editions`): `edition_id` is a unique FK to a _separate_ M4 `editions` row from the Arabic Mushaf edition; a trigger requires only that this generic edition belong to the approved Quran work and use the locale's language — it does not reference or depend on which Arabic edition, if any, is currently the default.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.9: "Publication is a release-level atomic transition, not row-by-row best effort... M5 activation must use a stable release/version selector outside the canonical table count."
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 1 module ownership matrix: the Quran module owns "Canonical surah/ayah identity, approved Quran renderings, translations, structure, conditional audio, provider adapters and Quran-only upstream search" across its six physical tables; "Exactly one owner for every capability and physical table."
- `ALSAMAD_ADMIN_ARCHITECTURE.md` §30.1: the **Publisher** role "Execute[s] guarded publication after all required approvals," distinct from Source & Licensing Steward, Religious Reviewer, and Editorial Coordinator, none of whom may independently publish.
- `ALSAMAD_ADMIN_ARCHITECTURE.md` §29.2: the general configuration/activation lifecycle is `draft → review → approve → activate → supersede/rollback` — activation and rollback are already treated as a single governed transition elsewhere in this repository's admin model, not as two independent operations.
- Release 1 catalog is frozen at exactly 30 tables (`ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 1, Authoritative M1 decision 1); `ALSAMAD_DATABASE_ARCHITECTURE.md` §11 rejects "separate devotional source, translation, transliteration, repetition, and Editorial General Dua detail tables" as Release 1 fragmentation — the same minimalism principle governs this decision.
- `ADR-0003`/`REG-0010`, `ADR-0004`/`REG-0011`, and `ADR-0005`/`REG-0012` established, respectively, the display/redistribution rights split, the manifest/evidence separation, and license-version immutability. None of them defines which published edition or translation edition is the default release; this decision is architecturally independent of all three and adds no new table.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 (`licenses`): `status` and `updated_at` remain mutable indefinitely even after `ADR-0005` froze rights-bearing content — a license can still move `active → expired → revoked` after an edition or translation edition has already relied on it, and `effective_until` elapsing requires no write at all. §5.3.4/§5.3.7 already treat a row's public eligibility as a live, re-derived condition ("publicly eligible only while..."), not a value cached once and trusted thereafter.

## Decision

### Canonical release identity

The canonical Quran release identity remains exactly what §5.3.1/§5.3.2 already fix: the single approved Quran `work_id`, together with its edition-independent `quran_surahs`/`quran_ayahs` canonical structure. A "release" is not a new identity — it is the answer to a narrower question: **which already-published `editions` row (for the Arabic/script rendering) and which already-`approved`-and-published `quran_translation_editions` row (per locale) are currently served as the default.**

### Two independent selector domains

Arabic Quran edition activation and translation edition activation are **independent selector domains**. This is not a policy choice but a direct consequence of the already-committed schema: `quran_ayah_texts` and `quran_translation_texts` both key off `quran_ayahs.id` — an identity that is edition-independent and shared by every Arabic edition and every translation edition of the one approved work (§5.3.3, §5.3.4, §5.3.7). No translation row's eligibility test (§5.3.7: "publicly eligible only while its translation edition is approved and published, its passage text is published, its locale is enabled") references a specific _Arabic_ edition ID. A translation therefore never needs to "match" whichever Arabic edition happens to be active; it only needs to belong to the one approved canonical work, which §5.3.6's existing trigger already enforces. Consequently:

- `editions` gains one additive, non-identity column: `is_active_release boolean NOT NULL DEFAULT false`, scoped per `work_id`.
- `quran_translation_editions` gains the same additive column, `is_active_release boolean NOT NULL DEFAULT false`, scoped per `locale_id`.
- At most one `editions` row per `work_id` may have `is_active_release = true` while `publication_state = 'published'`; at most one `quran_translation_editions` row per `locale_id` may have `is_active_release = true` while `review_status = 'approved'` (and, by the existing §5.3.6 trigger, its generic edition already `published`).
- These two constraints are enforced independently. Withdrawing or rotating the active Arabic edition never requires, blocks, or implicitly changes any translation edition's active flag, and vice versa.

### Compatibility without coupling

Because canonical structure is edition-independent and singular per work (one `work_id`, one `quran_surahs`/`quran_ayahs` set), every published Arabic edition and every approved-and-published translation edition are, by construction, already structurally compatible with each other — there is no second numbering scheme they could drift out of sync with. "Compatibility" is therefore already guaranteed by §5.3.3's existing gap-free `global_sequence_number` and per-surah `ayah_count` reconciliation triggers, not by anything this ADR adds. This ADR's selector governs only _default presentation choice_ among already-mutually-compatible published rows; it introduces no new cross-edition compatibility check because none is needed.

### Zero-active state fails closed

A reader-facing query for "the active Arabic release" or "the active translation for locale L" that finds zero matching rows must return an honest unavailable/empty state, exactly as `src/lib/quran/content/db-source.ts`'s already-established honest-empty/pending/available pattern requires elsewhere in this repository. No fallback query may select "the most recently published edition," "the first published edition by ID," or any other implicit default; an unset selector is a data-availability fact, not an implementation gap to silently paper over. This applies independently to each selector domain: zero active Arabic release must not block a locale's translation from separately reporting its own state, and vice versa, consistent with the two domains' independence above.

### Selector signal versus live eligibility

`is_active_release = true` is an authoritative **default-selection signal** — it identifies which already-eligible row governed activation most recently chose. It is **not, by itself, proof that the row is currently servable.** Eligibility depends on facts outside the flagged row (§"Existing repository constraints" above: `licenses.status`, `licenses.effective_until`, a translation's backing generic `editions` row, `locales.enabled`), some of which can change without ever writing to the selected row, and `effective_until` elapsing requires no write at all. A `CHECK` constraint or partial unique index, being single-table by construction, cannot observe any of this.

Consequently, every public Quran read must **re-derive the full current eligibility chain at read time**, in the same query or transactionally consistent read that resolves the active candidate — not trust `is_active_release` as a cached proof. If the active candidate fails that live check, serving fails closed exactly as the zero-active case does above: no silent fallback to a different published edition or a different approved translation. The selector answers "which row is the intended default"; live eligibility answers "may it actually be served right now." Both must hold before content is returned, and only the second can ever change without a selector write.

### Upstream eligibility loss

License revocation, license time-expiry, generic-edition withdrawal, and locale disablement are existing, already-approved safety/withdrawal operations (§5.2.2, §5.2.4, §5.3.6) and must remain unblocked regardless of whether a currently active candidate depends on them — blocking them would contradict the already-committed one-way withdrawal semantics those sections establish, and license time-expiry cannot be "blocked" at all because it involves no write. This decision therefore introduces **no cross-layer automatic deactivation trigger** reaching from `licenses`/`editions` into the M5 selector state, and **no trigger that rejects an upstream change** merely because an active candidate depends on it. Two rejected alternatives for handling this are recorded below ((f), (g)).

Instead: (1) the upstream safety/withdrawal operation proceeds under its existing contract, unchanged; (2) read-time eligibility re-derivation (above) immediately stops the now-ineligible candidate from being served, with no automatic substitution; (3) the Publisher/governed-activation workflow (§30.1, §29.2) is responsible for explicitly deactivating, withdrawing, rolling back, or selecting a replacement candidate for the affected selector domain once the loss is noticed — the same governed procedure that already owns every other activation decision in this ADR. This preserves fail-closed serving without adding M4→M5 trigger coupling that no existing ADR in this repository has precedent for.

### Atomic activation, rollback, and withdrawal

Activation, rollback, and withdrawal are the same primitive applied to different target rows, not three separate mechanisms:

- **Activation** of edition `E` for work `W`: within one transaction, `UPDATE editions SET is_active_release = false WHERE work_id = W AND is_active_release; UPDATE editions SET is_active_release = true WHERE id = E;` — first statement clears the prior active row (a "zero active" intermediate state, which the partial unique index permits), second statement sets the new one. Because both statements execute inside one transaction, concurrent readers under standard `READ COMMITTED` observe only the pre-transaction state or the fully post-transaction state — never an intermediate zero- or two-active state. A failed switch (either statement erroring, or the transaction rolling back) leaves the prior selector state completely unchanged. Governed activation must validate the candidate's full live eligibility chain at the moment of activation, using the same eligibility facts the read path re-derives — but activation-time validation is a point-in-time check, not a standing guarantee; it does not by itself keep the candidate eligible afterward, which is exactly why read-time revalidation (above) is mandatory independent of it.
- **Rollback** to a previously active, still-published edition is exactly the same activation primitive invoked with the prior edition's ID. No separate rollback table, history column, or snapshot mechanism is introduced; the append-only `editions`/`quran_translation_editions` version history (already required by §5.2.4/§5.3.6) is sufficient to identify what "previous" means.
- **Withdrawal**: a row whose `publication_state`/`review_status` transitions away from `published`/`approved` must have `is_active_release` cleared in the same transaction. This is enforced by a `CHECK` constraint (`NOT is_active_release OR publication_state = 'published'`, respectively `NOT is_active_release OR review_status = 'approved'`) that makes it physically impossible to withdraw an edition while it is still marked active — the withdrawing transaction must clear the flag first or the `CHECK` fails closed. This covers only the row's own `publication_state`/`review_status`; withdrawal or deactivation triggered by an _upstream_ dependency losing eligibility is the governed procedure described in "Upstream eligibility loss" above, not this `CHECK`.

### Future read-path contract

`src/lib/quran/content/db-source.ts` is not modified by this documentation-only decision, but its future implementation is bound by this contract: (1) resolve the active candidate for the requested selector domain (`editions` per `work_id`, or `quran_translation_editions` per `locale_id`); (2) in the same authoritative bounded query or a transactionally consistent read, join/re-derive every current serving-eligibility dependency (license status/effective window/display permission, backing edition state for translations, locale enabled); (3) return content only if the selected candidate remains fully eligible; (4) otherwise fail closed with an honest unavailable state; (5) never independently select a different "latest published" row as a fallback; (6) never join Arabic and translation content across inconsistent selector states — each domain's active candidate is resolved and revalidated on its own. The query must remain bounded and use the indexes this decision defines (the partial unique indexes double as the lookup path for "the active candidate").

### Concurrency enforced using PostgreSQL

A `UNIQUE` partial index — `CREATE UNIQUE INDEX ... ON editions (work_id) WHERE is_active_release AND publication_state = 'published'` and the equivalent `CREATE UNIQUE INDEX ... ON quran_translation_editions (locale_id) WHERE is_active_release AND review_status = 'approved'` — is the sole concurrency primitive. It requires no advisory lock, no application-level mutex, and no new table. Two concurrent transactions each attempting to activate a different edition for the same `work_id` will not both succeed: whichever commits second violates the partial unique index and aborts, exactly as PostgreSQL already arbitrates every other Release 1 identity constraint in this schema (`UNIQUE (work_id, edition_key, version)`, `UNIQUE (provider_code, license_key, version)`, and so on). The database, not application logic, is the final arbiter of "at most one active release per selector domain."

### Immutability exemption

`is_active_release` is added to the list of columns exempt from the post-publication immutability freeze already established for `editions` (§5.2.4: "every column except `publication_state`, `updated_at`, and a transition from `published` to `withdrawn`") and `quran_translation_editions` (§5.3.6: "Published identity and attribution freeze"), alongside the existing exemptions. It is the one column on each table that is expected to keep changing after publication — that is its entire purpose — and it carries no identity, legal, or canonical-text meaning; it selects among already-immutable, already-published rows.

### Ownership

Per `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s module ownership matrix, the Quran module owns the selector's physical state (`editions.is_active_release`, `quran_translation_editions.is_active_release`) as part of its existing ownership of "approved Quran renderings, translations, structure." No new owning module, table, or capability is introduced. The operational authority to _mutate_ the selector is the existing **Publisher** role (`ALSAMAD_ADMIN_ARCHITECTURE.md` §30.1), exercising the same "guarded publication after all required approvals" authority it already holds over `publication_state` transitions — activation is a publication-adjacent act, not a new privileged capability requiring a new role. This decision creates no new role and reassigns no existing one.

## Alternatives considered

**(a) Two additive `is_active_release` boolean columns plus per-scope partial unique indexes — chosen.**

**(b) A new `quran_active_releases` table mapping work/locale to the currently active edition.**

**(c) Application-level "most recent published" resolution with no database-enforced selector.**

**(d) A single global "release version" pointer shared by both Arabic editions and translations.**

**(e) `licenses`-style single-column status enum (`draft`/`active`/...) reused directly on `editions`/`quran_translation_editions` in place of `publication_state`, folding activation into the existing lifecycle column.**

**(f) A cross-layer trigger on `licenses`/`editions` that blocks revocation, expiry, or withdrawal while a dependent active candidate exists.**

**(g) A cross-layer trigger on `licenses`/`editions` that automatically clears `is_active_release` when an upstream dependency loses eligibility.**

## Why alternatives were rejected

**(b) rejected** because it requires a 31st Release 1 table, which `ALSAMAD_IMPLEMENTATION_ROADMAP.md`'s frozen 30-table catalog does not permit without proven necessity, and no necessity exists here: a boolean column plus a partial unique index on the two already-existing tables enforces the identical "at most one active per scope" invariant PostgreSQL would otherwise enforce through a table-level unique constraint. This is the same reasoning `ADR-0005` already applied to reject a dedicated license-history table (§"Why alternatives were rejected" (e) in `ADR-0005`).

**(c) rejected** because it is the defect this ADR exists to prevent: an implicit "most recently published" or "lowest ID" fallback is exactly the kind of silent, unreviewed default `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.9 already prohibits ("readers cannot observe a mixed provider version"), and it provides no atomicity or concurrency guarantee — two concurrent publications could each believe themselves to be "the most recent" with no database arbitration.

**(d) rejected** because it would wrongly couple the two independent selector domains established above. A single global pointer cannot represent "Arabic edition A is active while, independently, the French translation is rolled back to a prior version" — a legitimate, expected operational state given that translations and the Arabic rendering already publish independently (§5.3.6, §5.3.7). Coupling them would force an unnecessary joint activation whenever only one domain actually changed.

**(e) rejected** because `publication_state`/`review_status` already carry a distinct, narrower meaning — eligibility to be served at all — that is orthogonal to _which_ eligible row is the default. Multiple rows are already expected to be simultaneously `published`/`approved` (the Release 1 capability checklist's plural "Approved Quran text and script editions," "Selected approved translations"); collapsing "eligible" and "default" into one enum would make it impossible to keep an alternate edition published-and-selectable while a different one is the default, which the product architecture already requires.

**(f) rejected** because it contradicts already-committed withdrawal semantics: §5.2.2 and §5.2.4 treat license revocation and edition withdrawal as always-available, one-way safety operations, never conditionally blockable by what currently references them. It also cannot handle license time-expiry at all, since expiry involves no write for any trigger to fire on.

**(g) rejected** because no existing ADR in this repository (`ADR-0003`, `ADR-0004`, `ADR-0005`) establishes a precedent for an M4 table (`licenses`, `editions`) carrying a trigger aware of M5-specific selector state — it would invert this repository's layering, is materially more complex than the chosen model, and still cannot handle time-expiry, which has no write event to trigger from. Read-time re-derivation (chosen, "Selector signal versus live eligibility" above) already closes the correctness gap for every case (f)/(g) would address, including the time-expiry case neither can reach, without adding any new database object.

## Consequences

- A forward migration (`0008`) is reserved for this decision's future implementation; no existing migration is modified. Migration `0007` (AUD-001) is immutable and is not edited.
- No new table; the Release 1 catalog remains frozen at 30 tables. Cumulative M5 table count is unaffected (still 6 of 30 within Quran; 16 of 30 cumulative through M5).
- Two additive, nullable-free boolean columns with `DEFAULT false`, two partial unique indexes, and two `CHECK` constraints are the entire physical footprint. The selector-versus-live-eligibility clarification above adds no column, index, or trigger to this footprint; it is a documentation refinement of what `is_active_release` guarantees and what the future read path must independently re-verify.
- `M5.1` historical PASS remains valid; `ARC-001`, `ARC-002`, `ARC-003`, `ARC-004`, and `AUD-001` remain complete or decided, unaffected.
- `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`; this decision does not select a source, approve credentials, authorize provider access, create a real manifest, permit a fetch or dry run, or approve publication of any real content.
- `M6` remains blocked, independent of this decision.
- M6's future devotional migration placeholder moves from `0008_devotional_content_foundation.sql` to `0009_devotional_content_foundation.sql` as a numbering consequence only; this does not authorize M6.

## Reversibility/migration impact

Low risk today: no `editions` or `quran_translation_editions` row currently exists in the committed database (M5 authorizes zero seed rows; no real content has been imported). Adding two `DEFAULT false` columns, two partial unique indexes, and two `CHECK` constraints to empty tables is a trivial forward migration with no backfill and no existing-row impact. Reversing this decision _after_ real published editions and translations exist and readers depend on a stable default would require either a data migration to re-derive "which row was implicitly default" (impossible if it was never recorded) or an unreviewed change in what readers see — exactly why this is being decided now, before any real provider work begins, rather than discovered after real publication.

## Relationship to existing architecture

- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 (`licenses`), §5.2.4 (`editions`), §5.3.4/§5.3.7 (existing live-eligibility language this decision's read-time rule extends to the selector), §5.3.6 (`quran_translation_editions`), §5.3.9 (publication/withdrawal/retention — the "stable release/version selector" requirement this ADR resolves).
- `ADR-0003` (rights separation), `ADR-0004` (manifest/evidence separation), `ADR-0005` (license-version immutability) — this decision is architecturally independent of all three and conflicts with none.
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5, new ARC-005 authorization; Phase 1 module ownership matrix; `ALSAMAD_ADMIN_ARCHITECTURE.md` §29.2, §30.1.

## Relationship to M5 and later phases

This decision specifies the physical shape of the release selector `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.9 already required, ahead of any real provider work relying on it. It does not select a source, approve credentials, authorize provider access, create a real manifest, permit a fetch or dry run, approve publication, or mark `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated` PASS. `M5.1 PASS` remains valid. `ARC-001` through `ARC-004` and `AUD-001` remain complete or decided as previously recorded. `M6` remains blocked on `M5 Quran Import Activated`, unaffected by this decision. `ARC-006` is architecturally independent of this decision and is neither solved nor authorized here.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11, this ADR is never rewritten to adopt a materially different outcome. A later change requires a new Registry entry and ADR that explicitly supersede this decision while retaining its history.
