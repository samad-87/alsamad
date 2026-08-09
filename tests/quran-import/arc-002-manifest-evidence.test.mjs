import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  ImportRunTerminalError,
  ManifestSecretFieldRejectedError,
  ManifestValidationError,
} from "../../src/lib/quran/import/contracts.ts";
import {
  InMemoryCheckpointStore,
  computeImportRunKey,
} from "../../src/lib/quran/import/checkpoints.ts";
import {
  ARC001_MANIFEST_SCHEMA_VERSION,
  ARC002_MANIFEST_SCHEMA_VERSION,
  HISTORICAL_MANIFEST_SCHEMA_VERSION,
  buildImportManifest,
  buildImportRunEvidence,
  buildSourceImportManifest,
  verifyManifestChecksum,
  verifySourceManifestChecksum,
} from "../../src/lib/quran/import/manifest.ts";

const at = "2026-01-01T00:00:00.000Z";
const sha = (value) => createHash("sha256").update(value).digest("hex");

const decisions = {
  license: { licenseReference: "synthetic-license", status: "approved" },
  retention: { policy: "time_limited", retentionDays: 7, status: "approved" },
  attribution: { attributionReference: "synthetic-credit", status: "approved" },
  applicationDisplay: { status: "approved", intendedUse: true },
  commercialUse: { status: "denied", intendedUse: false },
  standaloneRedistribution: { status: "denied", intendedUse: false },
};

function sourceInput(overrides = {}) {
  return {
    manifestId: "018f2f2a-0000-7000-8000-000000000101",
    schemaVersion: 3,
    providerCode: "synthetic-provider",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYNTHETIC-RESOURCE",
    providerResourceVersion: "synthetic-v1",
    sourceEndpointIdentity: "internal://synthetic-only/source",
    intendedOperation: "non-commercial-in-application-dry-run",
    importMode: "full",
    decisions,
    selectedCanonicalTarget: {
      kind: "edition",
      reference: "synthetic-target-candidate",
    },
    expectedCounts: { records: 2 },
    expectedBytes: { source: 256 },
    expectedChecksums: { source: sha("independently-approved-synthetic") },
    sourceProvenanceReferences: ["synthetic-provenance"],
    approvalReferences: ["synthetic-owner-approval"],
    fallbackExitReferences: ["synthetic-exit-policy"],
    adapterContractVersion: "synthetic-adapter-v1",
    normalizationContractVersion: "synthetic-normalization-v1",
    policyObligations: { synchronize: false, retentionDays: 7 },
    ...overrides,
  };
}

const reconciliation = {
  blockingErrors: [],
  warnings: [],
  metrics: {
    expectedSurahCount: 0,
    actualSurahCount: 0,
    expectedAyahCount: 0,
    actualAyahCount: 0,
    perSurahAyahCounts: {},
  },
  unmatchedRecords: [],
  duplicateRecords: [],
  checksumDrift: [],
  mismatchCategories: [],
  publicationEligible: false,
};

function runKeyFor(manifest) {
  return computeImportRunKey({
    manifestId: manifest.manifestId,
    manifestChecksum: manifest.manifestChecksum,
    manifestSchemaVersion: manifest.schemaVersion,
    providerCode: manifest.providerCode,
    providerSnapshotVersion: manifest.providerResourceVersion,
    resourceId: manifest.providerResourceId,
    resourceVersion: manifest.providerResourceVersion,
    adapterVersion: manifest.adapterContractVersion,
  });
}

function runInput(manifest, overrides = {}) {
  return {
    manifestId: manifest.manifestId,
    manifestChecksum: manifest.manifestChecksum,
    runId: "018f2f2a-0000-7000-8000-000000000201",
    attemptId: "018f2f2a-0000-7000-8000-000000000202",
    runKey: runKeyFor(manifest),
    processIdentity: "synthetic-process",
    timestamps: {
      requestedAt: at,
      startedAt: at,
      fetchedAt: at,
      completedAt: at,
    },
    retryEvidence: {
      attempts: 1,
      delaysMs: [],
      outcome: "not_required",
      failureCategory: null,
    },
    checkpoints: [],
    actualCounts: { records: 2 },
    observedChecksums: { source: sha("observed-synthetic") },
    httpObservations: [],
    stateHistory: [],
    status: "dry_run_passed",
    failureCategory: null,
    reconciliation,
    rollbackEvidence: { discarded: ["synthetic-staging"], purgedAt: at },
    auditEvents: [],
    evidenceReferences: ["synthetic-evidence"],
    finalDisposition: "passed",
    reviewDisposition: "pending",
    ...overrides,
  };
}

test("v3 contains only immutable source-authorization fields", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  assert.equal(manifest.schemaVersion, ARC002_MANIFEST_SCHEMA_VERSION);
  assert.equal(verifySourceManifestChecksum(manifest), true);
  for (const field of [
    "requestedAt",
    "startedAt",
    "fetchedAt",
    "completedAt",
    "runId",
    "attemptId",
    "processIdentity",
    "actualCounts",
    "observedChecksums",
    "checkpointMetadata",
    "status",
    "failureReason",
    "reconciliation",
    "rollbackEvidence",
    "evidenceReferences",
  ]) {
    assert.equal(field in manifest, false, field);
  }
});

test("v3 rejects every execution field instead of retaining compatibility aliases", () => {
  for (const field of [
    "requestedAt",
    "runId",
    "attemptId",
    "actualCounts",
    "observedChecksums",
    "checkpointMetadata",
    "status",
    "reconciliation",
    "rollbackEvidence",
  ]) {
    assert.throws(
      () => buildSourceImportManifest(sourceInput({ [field]: "synthetic" })),
      ManifestValidationError,
      field,
    );
  }
});

test("execution evidence differences never change the v3 checksum", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  const checksum = manifest.manifestChecksum;
  const variants = [
    { runId: "018f2f2a-0000-7000-8000-000000000211" },
    { attemptId: "018f2f2a-0000-7000-8000-000000000212" },
    {
      timestamps: {
        requestedAt: at,
        startedAt: null,
        fetchedAt: null,
        completedAt: null,
      },
    },
    { actualCounts: { records: 99 } },
    { observedChecksums: { source: sha("different-observation") } },
    {
      retryEvidence: {
        attempts: 2,
        delaysMs: [10],
        outcome: "succeeded",
        failureCategory: null,
      },
    },
    { status: "dry_run_failed", finalDisposition: "failed" },
    {
      reconciliation: {
        ...reconciliation,
        blockingErrors: ["synthetic-mismatch"],
      },
    },
    { rollbackEvidence: { discarded: [], purgedAt: null } },
  ];
  for (const variant of variants) {
    buildImportRunEvidence(manifest, runInput(manifest, variant));
    assert.equal(manifest.manifestChecksum, checksum);
  }
});

test("every governed immutable input class changes manifest identity checksum", () => {
  const base = buildSourceImportManifest(sourceInput());
  const variants = [
    { providerResourceId: "SYNTHETIC-OTHER" },
    { providerResourceVersion: "synthetic-v2" },
    { intendedOperation: "synthetic-other-operation" },
    {
      decisions: {
        ...decisions,
        commercialUse: { status: "approved", intendedUse: false },
      },
    },
    {
      selectedCanonicalTarget: {
        kind: "edition",
        reference: "synthetic-other-target",
      },
    },
    { expectedCounts: { records: 3 } },
    { expectedChecksums: { source: sha("different-expected") } },
    { adapterContractVersion: "synthetic-adapter-v2" },
    { normalizationContractVersion: "synthetic-normalization-v2" },
  ];
  for (let index = 0; index < variants.length; index += 1) {
    const changed = buildSourceImportManifest(
      sourceInput({
        ...variants[index],
        manifestId: `018f2f2a-0000-7000-8000-${String(301 + index).padStart(12, "0")}`,
      }),
    );
    assert.notEqual(changed.manifestChecksum, base.manifestChecksum);
  }
});

test("run evidence binds to the exact manifest ID and checksum", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  const evidence = buildImportRunEvidence(manifest, runInput(manifest));
  assert.equal(evidence.manifestId, manifest.manifestId);
  assert.equal(evidence.manifestChecksum, manifest.manifestChecksum);
  assert.throws(
    () =>
      buildImportRunEvidence(
        manifest,
        runInput(manifest, { manifestChecksum: sha("wrong") }),
      ),
    ManifestValidationError,
  );
});

test("one manifest supports multiple runs and attempts without mutation", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  const first = buildImportRunEvidence(manifest, runInput(manifest));
  const second = buildImportRunEvidence(
    manifest,
    runInput(manifest, {
      runId: "018f2f2a-0000-7000-8000-000000000221",
      attemptId: "018f2f2a-0000-7000-8000-000000000222",
    }),
  );
  assert.equal(first.manifestChecksum, second.manifestChecksum);
  assert.notEqual(first.runId, second.runId);
  assert.equal(Object.isFrozen(manifest), true);
});

test("operational retry reuses run key while authorization change creates a new one", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  const retry = buildImportRunEvidence(
    manifest,
    runInput(manifest, {
      attemptId: "018f2f2a-0000-7000-8000-000000000232",
      retryEvidence: {
        attempts: 2,
        delaysMs: [5],
        outcome: "succeeded",
        failureCategory: null,
      },
    }),
  );
  assert.equal(retry.runKey, runKeyFor(manifest));
  const changed = buildSourceImportManifest(
    sourceInput({
      manifestId: "018f2f2a-0000-7000-8000-000000000233",
      providerResourceVersion: "synthetic-v2",
    }),
  );
  assert.notEqual(runKeyFor(changed), runKeyFor(manifest));
});

test("checkpoint linkage is manifest-bound and completed replay stays fail-closed", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  const input = runInput(manifest);
  const checkpoint = {
    runKey: input.runKey,
    manifestId: manifest.manifestId,
    attemptId: input.attemptId,
    manifestChecksum: manifest.manifestChecksum,
    resourceType: manifest.resourceType,
    cursor: "synthetic-cursor",
    byteCount: 1,
    rowCount: 1,
    rollingChecksum: sha("rolling"),
    status: "dry_run_passed",
    recordedAt: at,
    sequence: 1,
  };
  buildImportRunEvidence(
    manifest,
    runInput(manifest, { checkpoints: [checkpoint] }),
  );
  assert.throws(
    () =>
      buildImportRunEvidence(
        manifest,
        runInput(manifest, {
          checkpoints: [{ ...checkpoint, manifestId: "wrong" }],
        }),
      ),
    ManifestValidationError,
  );
  const store = new InMemoryCheckpointStore();
  store.advance(checkpoint);
  assert.throws(
    () => store.advance({ ...checkpoint, sequence: 2, status: "fetching" }),
    ImportRunTerminalError,
  );
});

test("run evidence rejects secret-shaped data and remains payload-free", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  assert.throws(
    () =>
      buildImportRunEvidence(
        manifest,
        runInput(manifest, { evidenceReferences: ["authorization=forbidden"] }),
      ),
    ManifestSecretFieldRejectedError,
  );
  assert.throws(
    () =>
      buildImportRunEvidence(manifest, {
        ...runInput(manifest),
        payload: "synthetic-forbidden-payload",
      }),
    ManifestValidationError,
  );
  const evidence = buildImportRunEvidence(manifest, runInput(manifest));
  assert.equal("payload" in evidence, false);
  assert.doesNotMatch(JSON.stringify(evidence), /authorization|bearer|cookie/i);
});

test("historical v1/v2 selectors and v2 checksum behavior remain unchanged", () => {
  assert.equal(HISTORICAL_MANIFEST_SCHEMA_VERSION, 1);
  assert.equal(ARC001_MANIFEST_SCHEMA_VERSION, 2);
  const v2 = buildImportManifest({
    manifestId: "018f2f2a-0000-7000-8000-000000000099",
    providerCode: "synthetic-provider",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYNTHETIC-RESOURCE",
    providerResourceVersion: "synthetic-version",
    requestedAt: at,
    fetchedAt: at,
    sourceEndpointIdentity: "internal://synthetic-only",
    sourceChecksum: sha("synthetic bytes"),
    decisions,
    expectedCounts: { records: 1 },
    actualCounts: { records: 1 },
    importMode: "full",
    status: "created",
    processIdentity: "synthetic-test",
    softwareVersion: "m5.2a-test",
    schemaVersion: 2,
  });
  assert.equal(v2.schemaVersion, 2);
  assert.equal(verifyManifestChecksum(v2), true);
  assert.throws(
    () => buildImportManifest({ ...v2, schemaVersion: 1 }),
    /version 1 retains its historical reader and checksum semantics/,
  );
});
