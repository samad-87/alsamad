# ADR-0003: In-Application Display and Standalone Redistribution Rights

**Registry entry:** `REG-0010` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-09.

This ADR records an architectural decision only. It does not authorize a migration, provider access, content fetch, dry run, publication, an M5 gate PASS, M6, or M7.

## Context

The frozen Release 1 `licenses` model defines `redistribution_allowed` as explicit redistribution permission, while the committed edition-publication trigger requires that field to be true. This collapses permission to serve or display content as an integrated part of ALSAMAD into permission to redistribute content independently as a dataset, raw dump, download catalog, bulk product, or equivalent.

REG-0009 permits controlled M5 work on a non-commercial basis and prohibits standalone redistribution. Under the current physical contract, that truthful rights decision blocks publication; setting redistribution to allowed would instead overstate the approved rights. The manifest legal gate has the same problem because it treats a known denied commercial-use or redistribution capability as indistinguishable from an unresolved right, even when the intended operation exercises neither capability.

## Decision

ALSAMAD records two independent rights:

- `in_application_display_allowed` — permission to serve or display content as an integrated part of ALSAMAD;
- `standalone_redistribution_allowed` — permission to redistribute content independently as a dataset, raw dump, download catalog, bulk product, or equivalent.

Both are required, fail-closed booleans with default `false`. The existing redistribution value preserves its original standalone-redistribution meaning; it is renamed, not reinterpreted. No application-display permission may be inferred automatically from a historical redistribution value.

Edition publication requires `in_application_display_allowed = true`. It does not require `standalone_redistribution_allowed = true`. Standalone export, dataset, dump, catalog, download, or bulk-product behavior requires its own affirmative standalone-redistribution permission.

Existing independent rights dimensions—including retention and derivative permission—remain independent and unchanged. Publication inside ALSAMAD does not imply commercial use, sublicensing, derivative rights, standalone redistribution, permanent storage, or any other separate capability.

Manifest and legal evaluation distinguish:

1. a required capability exercised by the intended operation, which must be approved;
2. an optional capability explicitly known to be denied, which is compatible only when the operation does not exercise it; and
3. an unresolved or unknown capability, which remains fail-closed.

No operation may exercise a capability whose decision is denied. For the REG-0009 intended use, in-application display, required storage/retention, license, and attribution must be approved; commercial use and standalone redistribution must be explicitly resolved and may be denied.

## Consequences

- One rights dimension is added; no table is added.
- The 30-table Release 1 freeze is unchanged.
- Existing redistribution meaning and values are preserved as standalone-redistribution evidence.
- New application-display values default to `false` and require explicit review.
- A future forward-only migration must rename the existing redistribution field, add the application-display field, and update publication enforcement.
- Corrected manifests require a new manifest schema version. Historical manifests and their checksums retain their original meaning and are never silently reinterpreted.
- The historical `M5 Schema Foundation Verified` PASS remains valid.
- M5.2A's historical implementation remains recorded, but its affected legal-gate behavior must be corrected and reverified before real provider work relies on it.

## Alternatives considered

### Rename `redistribution_allowed` and change its meaning

Rejected. It would erase the separately required standalone-redistribution decision and silently reinterpret existing evidence.

### Silently infer application-display permission from existing redistribution values

Rejected. Standalone redistribution does not prove the narrower or differently conditioned application-display entitlement, and automated inference would not be auditable.

### Keep the schema unchanged and only change trigger interpretation

Rejected. A trigger cannot truthfully treat a field documented as redistribution permission as a different legal capability. This would preserve the ambiguity that caused the defect.

### Introduce a general entitlement framework

Rejected. Retention, derivatives, attribution, effective windows, commercial-use decisions, and withdrawal obligations already have dedicated contracts. A general framework would expand Release 1 without evidence that it is required.

## Migration and historical evidence

The correction is forward-only and non-destructive. No committed migration is rewritten. Existing redistribution values retain their standalone meaning. The new application-display column is not backfilled from those values and remains `false` until explicitly reviewed. Historical manifest versions remain verifiable under their original schema and checksums; new semantics require a new manifest schema version.

## Relationship to M5 and later phases

This decision corrects the rights model needed by the existing M5 legal/license and publication gates. It does not select a source, approve credentials, authorize provider access, create a real manifest, permit a fetch or dry run, approve publication, or mark `M5 Provider Import Dry Run Verified` or `M5 Quran Import Activated` PASS.

REG-0009 remains unchanged and continues to prohibit commercial launch and standalone redistribution under its narrow intended-use decision. M6 remains blocked on `M5 Quran Import Activated`. M7 remains unauthorized.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11, this ADR is never rewritten to adopt a materially different outcome. A later change requires a new Registry entry and ADR that explicitly supersede this decision while retaining its history.
