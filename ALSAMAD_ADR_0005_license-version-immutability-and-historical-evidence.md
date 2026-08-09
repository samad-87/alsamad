# ADR-0005: License-Version Immutability and Historical License Evidence

**Registry entry:** `REG-0012` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-09.

This ADR records an architectural decision only. It does not authorize migration `0006`, a database change, provider access, credentials, content fetch, a real-resource manifest, a provider dry run, publication, an M5 gate PASS, ARC-005/006, M6, or M7.

## Context

`ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 and the committed `tr_licenses__identity` trigger (`drizzle/0002_content_integrity_foundation.sql`) freeze exactly five columns on `licenses` after insert: `id`, `provider_code`, `license_key`, `version`, `effective_from`. Every other column — `rights_scope`, `attribution_text`, `terms_url`, `retention_policy`, `retention_days`, `in_application_display_allowed`, `standalone_redistribution_allowed`, `derivatives_allowed`, `effective_until`, `status` — remains updatable in place indefinitely, including after the license reaches `status = 'active'` and after a published `edition` or an `ImportRunEvidence`-bound `SourceImportManifest` (ARC-002) has already relied on it.

`SourceImportManifest` v3 (`ADR-0004`) already freezes the _decision outcomes_ it embeds (`retentionDecision`, `attributionDecision`, `applicationDisplayDecision`, `commercialUseDecision`, `standaloneRedistributionDecision`) as checksummed values independent of the live `licenses` row. It does not, however, require `licenseDecisionReference` or `attributionReference` to be non-blank or to identify a specific immutable license revision, and it does nothing to prevent the `licenses` row itself from being silently rewritten after the fact. `provider_code` + `license_key` + `version` already function as the enforced identity of one legal revision (`uq_licenses__provider_key_version`), but nothing requires a genuinely new legal/provider revision to use a new `version` rather than editing an existing row's rights-bearing content in place.

## Existing repository constraints

- `drizzle/0002_content_integrity_foundation.sql` `tr_licenses__identity`: freezes only `(provider_code, license_key, version, effective_from)`.
- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2: documents the same narrow scope; "Revocation or expiry prevents new publication but preserves historical rows" — proven true for row _existence_, not for row _content_.
- `drizzle/0002` `enforce_publication_rows()`: checks license eligibility once, at the moment an edition's `publication_state` first becomes `published`, against the then-current `licenses` row; the edition itself becomes immutable afterward, but the referenced license row does not.
- `ADR-0003`/`REG-0010`: established `in_application_display_allowed`/`standalone_redistribution_allowed` as the two independent rights columns this decision must also protect once relied upon.
- `ADR-0004`/`REG-0011`: established that `SourceImportManifest` v3 freezes decision _values_; this decision extends immutability to the _source of those values_ and to the reference that ties a manifest back to it.
- Release 1 catalog is frozen at exactly 30 tables (`ALSAMAD_DATABASE_ARCHITECTURE.md` §4); no table may be added.

## Decision

A `licenses` row represents exactly one immutable provider/legal revision once it is first relied upon. `provider_code` + `license_key` + `version` continues to identify that revision under the existing unique-constraint identity model.

Once a license row's `status` first reaches `active`, its rights-bearing legal content becomes immutable in addition to the already-frozen identity tuple: `rights_scope`, `attribution_text`, `terms_url`, `retention_policy`, `retention_days`, `in_application_display_allowed`, `standalone_redistribution_allowed`, `derivatives_allowed`, and `effective_until`. Only `status` and `updated_at` may continue to change after that point — `status` retains exactly its existing checked-vocabulary behavior (`draft`, `active`, `expired`, `revoked`), so expiry, revocation, and withdrawal remain fully representable without rewriting the historical legal content a prior import or publication relied upon. No new lifecycle transition is introduced or removed; the existing status vocabulary and its existing publication-gate behavior (`enforce_publication_rows()`) are preserved unchanged.

A later legal or provider revision is recorded as a **new license row under a new `version`**, never as an edit to an existing active row.

`SourceImportManifest` v3's `licenseDecisionReference` and `AttributionDecision.attributionReference` must be non-blank and must identify the exact immutable license evidence relied upon for that manifest. This is a validation tightening only; it changes no field, no schema version, and no checksum computation. `retentionDecision`, `attributionDecision`, `applicationDisplayDecision`, `commercialUseDecision`, and `standaloneRedistributionDecision` continue to be frozen, checksummed values exactly as ARC-002 already established, and remain unaffected by any later license row's status changing.

## Alternatives considered

**(a) Freeze rights-bearing fields once first active — chosen.**

**(b) Allow rights mutation in place indefinitely (status quo).**

**(c) Rely only on the manifest's decision snapshot while leaving the underlying license row mutable.**

**(d) Rewrite historical migrations to add immutability retroactively.**

**(e) Create a dedicated license-history table.**

## Why alternatives were rejected

**(b) rejected** because it is the defect this ADR exists to correct: a license row's legal content can silently drift after being relied upon, with no record of what it said before.

**(c) rejected** because it only protects manifests built _after_ ARC-002; it does nothing for `editions` (which hold a bare mutable FK with no snapshot) and leaves the license row itself — the actual source of truth the manifest's decisions were computed from — unprotected. Protecting only the copy while leaving the original mutable does not make the original auditable.

**(d) rejected** because migration `0002` and `0005` are committed and must never be edited; correction is additive and forward-only, exactly as ARC-001 and ARC-002 were.

**(e) rejected** because `provider_code` + `license_key` + `version` already models history as a sequence of distinct immutable rows once (a) is adopted; a separate history table would duplicate that identity model without adding auditability, and would require a new table, which Release 1's frozen 30-table catalog does not permit without proven necessity that does not exist here.

## Consequences

- A forward migration (`0006`) is required; no existing migration is modified.
- No new table; the Release 1 catalog remains frozen at 30 tables.
- No destructive change and no historical rewrite: existing rows already in `active`/`expired`/`revoked` status retain their current field values, which simply become frozen going forward from the migration.
- `M5.1` historical PASS remains valid; `ARC-001`, `ARC-002`, and `ARC-003` remain complete and unaffected.
- `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain `NOT PASS`.
- `M6` remains blocked, independent of this decision.
- M6's future devotional migration placeholder moves from `0006_devotional_content_foundation.sql` to `0007_devotional_content_foundation.sql` as a numbering consequence only; this does not authorize M6.

## Reversibility/migration impact

Low risk today: no license row currently exists in the committed database (Release 1 authorizes zero religious/legal seed rows), so no existing data is affected by tightening the trigger. Reversing this decision _after_ real licensed content exists would be legally unsafe and content-integrity sensitive — exactly why it is being frozen now, before any real provider work begins, rather than left to be discovered after real licenses are relied upon.

## Relationship to existing architecture

- `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.2.2 (`licenses`), §5.2.4 (`editions`, unaffected — its own immutability is already correct), §5.3.10–5.3.11 (manifest field contract).
- `ADR-0003` (rights separation) and `ADR-0004` (manifest/evidence separation) — this decision extends, and does not conflict with, either.
- `ALSAMAD_IMPLEMENTATION_ROADMAP.md` Phase 5, ARC-004 authorization.

## Relationship to M5 and later phases

This decision corrects the `licenses` table's historical-evidence integrity ahead of any real provider work relying on it. It does not select a source, approve credentials, authorize provider access, create a real manifest, permit a fetch or dry run, approve publication, or mark `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated` PASS. `M5.1 PASS` remains valid. `ARC-001`, `ARC-002`, and `ARC-003` remain complete. `M6` remains blocked on `M5 Quran Import Activated`, unaffected by this decision. `ARC-005` and `ARC-006` are architecturally independent of this decision and are neither solved nor authorized here.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11, this ADR is never rewritten to adopt a materially different outcome. A later change requires a new Registry entry and ADR that explicitly supersede this decision while retaining its history.
