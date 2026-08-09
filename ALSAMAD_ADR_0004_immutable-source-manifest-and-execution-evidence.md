# ADR-0004: Immutable Source Manifest and Execution Evidence

**Registry entry:** `REG-0011` (`ALSAMAD_DECISION_REGISTRY.md` §12)

## Status

Accepted — 2026-08-09.

This ADR records an architectural decision and authorizes only the later credential-free ARC-002 implementation unit defined by the Roadmap. It does not authorize credentials, provider access, content fetch, a real-resource manifest, a provider dry run, publication, an M5 gate PASS, ARC-003/004/005/006, M6, or M7.

## Context

The M5.2 contract calls its import manifest immutable but includes mutable execution facts: request/fetch timestamps, actual counts, state-machine status, failure reason, retry/checkpoint metadata, withdrawal state, and generated evidence references. The v2 implementation hashes every manifest field while also emitting checkpoints, state history, reconciliation, rollback, and audit evidence separately.

This makes a source-authorization checksum change when only execution evidence changes. It also conflicts with the Phase 5 dependency that an approved source decision and manifest exist before fetch. Retry and reconciliation must not create a new source authorization merely because a run progressed, failed, resumed, or observed different operational facts.

## Decision

### SourceImportManifest v3

`SourceImportManifest` is the immutable owner of source/import-authorization facts independently known and approved before the governed execution begins. V3 contains:

- manifest schema version and immutable manifest ID;
- provider namespace, controlled environment, exact resource type, provider resource ID, and provider resource/snapshot version;
- intended operation and import mode, including the M5.2 `dryRun = true` restriction;
- approved canonical target candidate/reference;
- expected counts, bytes, and checksums known and approved before execution;
- license, retention, attribution, in-application-display, commercial-use, and standalone-redistribution decisions;
- approved source, provenance, review, fallback, and exit references when applicable to source authorization;
- authorized adapter/import-contract and normalization-contract versions;
- retention, withdrawal, deletion, and other policy obligations that govern the intended operation; and
- non-secret endpoint/source identity required to authorize the source.

An observed source or normalized checksum belongs to execution evidence unless the same value was independently known and approved beforehand as an expected assertion. Mutable execution facts never enter v3.

### Manifest identity and checksum boundary

The immutable identity is the pair `manifestId` and `manifestChecksum`. `manifestChecksum` is deterministic SHA-256 over the canonical serialization of every immutable v3 field and no execution-evidence field. The immutable object is frozen after construction.

A change to source/provider/resource/version, intended operation, legal or policy decision, approved target, expected count/byte/checksum assertion, or authorized adapter/normalization contract requires a new manifest ID and checksum. A retry, resume, timing difference, observed result, reconciliation result, rollback, or operational failure does not.

### ImportRunEvidence

`ImportRunEvidence` owns mutable and append-only execution facts and binds to both `manifestId` and `manifestChecksum`. It contains or references:

- `runId`, `attemptId`, deterministic `runKey`, and executing process identity;
- request, start, fetch, checkpoint, completion, purge, and evidence-generation timestamps;
- retry/backoff/timeout/429 outcomes and bounded failure categories;
- checkpoints, fetched/processed byte and row counts, and observed transport/normalized/rolling checksums;
- safe HTTP observations;
- state transitions, current and terminal status, cancellation, staleness, and supersession evidence;
- reconciliation inputs/results, mismatch categories, final dry-run disposition, and review disposition;
- rollback, quarantine, staging, withdrawal, deletion, expiry, and purge outcomes;
- payload-free audit events and generated evidence references.

Execution evidence is append-only or safely superseded by an explicitly linked later record; it cannot mutate the source manifest or its checksum.

### Run, attempt, and replay semantics

One source manifest may link to multiple execution runs and attempts. `runKey` retains the existing deterministic source/resource/adapter identity semantics and must be bound to the exact manifest ID and checksum. `runId` identifies one logical execution record. `attemptId` identifies a concrete attempt or checksum-verified resume context within that run.

An operational retry with unchanged source authorization reuses the same manifest. A failed run may resume only from a checkpoint bound to the same manifest ID/checksum, run key, resource/version, and compatible attempt context. Checkpoint sequence, byte/row counts, and rolling checksums remain monotonic; identical replay is a no-op; conflicting, regressive, stale, cancelled, completed, or superseded progress fails closed. A completed run key remains replay-suppressed and produces no duplicate canonical rows.

### Reconciliation, rollback, and audit linkage

Reconciliation is run evidence, not manifest content. Every reconciliation record binds to the manifest ID/checksum and run/attempt identity. Reconciliation may be repeated or appended without altering source authorization; no mismatch is silently waived. One dry-run attempt may be designated authoritative by later review evidence without deleting failed or superseded attempts.

Rollback, purge, state history, and audit events use the same linkage. They remain bounded, payload-free, secret-free, provider-token-free, user-data-free, and religious-text-free. Existing redaction and evidence-shape protections are unchanged.

## Historical compatibility

Manifest v1 retains its exact historical fields, canonical bytes, reader, and checksum meaning. Manifest v2 retains the ARC-001 field and checksum semantics, including its historical combined manifest/run representation. Neither version is recomputed, migrated, or reinterpreted under v3 rules. V2 remains historically verifiable but is not the corrected contract for a real-provider manifest or dry run.

V3 is the first manifest version with a normative source-manifest/run-evidence separation. Historical evidence links continue to use the version and checksum that originally produced them.

## Data and storage consequences

No database table and no migration are required. The Release 1 catalog remains frozen at 30 tables. Source manifests, runs, checkpoints, reconciliation, rollback, and evidence remain versioned non-table JSON/object-storage artifacts under the existing M5 boundaries. Later audit infrastructure may retain approved evidence through its own separately authorized phase; ARC-002 neither depends on nor authorizes it.

## Consequences

- Source authorization has one stable, reproducible checksum across operational retries and attempts.
- Execution history can grow append-only without changing source identity.
- Existing replay, checkpoint, reconciliation, rollback, provider-independence, and redaction controls remain enforceable.
- M5.2A's non-manifest conformance evidence remains valid; affected v2 manifest/run tests require correction and reverification under v3.
- `M5 Schema Foundation Verified` remains PASS and ARC-001 remains complete.
- Real-provider manifest generation and dry-run evidence remain blocked until the credential-free ARC-002 correction passes.

## Alternatives considered

### Exclude mutable fields from the checksum but keep one combined manifest

Rejected. The object would still misleadingly claim one immutable lifecycle while allowing unhashed execution fields to change.

### Keep mutable and immutable sections in one object

Rejected. Separate hashes do not solve ownership and retention ambiguity if the mutable section may be replaced under the manifest's lifecycle rather than appended as run evidence.

### Rewrite v1 or v2

Rejected. Recomputing or reinterpreting historical manifests would destroy their original checksum and audit meaning.

### Add manifest, run, checkpoint, or reconciliation tables

Rejected. M5 explicitly assigns these artifacts outside the frozen domain-table catalog; versioned non-table evidence satisfies the current requirement without schema expansion.

## Dependency boundaries

ARC-002 is decided before any ARC-003 conformance correction so later conformance targets v3 rather than stale v2 assumptions. ARC-004 is architecturally independent. ARC-005 is an independent release concern but remains downstream for activation. ARC-006 is independent governance/documentation work. This ADR does not solve or authorize any of them.

## Relationship to M5 and later phases

M5.1 PASS remains valid. ARC-001 remains complete. M5.2A remains historical implementation and verification evidence; only affected manifest/run-separation conformance requires later correction and reverification. `M5 Provider Import Dry Run Verified` and `M5 Quran Import Activated` remain NOT PASS. M6 remains blocked, and M7 remains unauthorized.

## Supersession rule

Per `ALSAMAD_DECISION_REGISTRY.md` §11, this ADR is never rewritten to adopt a materially different outcome. A later change requires a new Registry entry and ADR that explicitly supersede this decision while retaining its history.
