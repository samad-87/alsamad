import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { QuranFoundationAdapter } from "../src/lib/providers/quran-foundation/adapter.ts";
import {
  computeImportRunKey,
  InMemoryCheckpointStore,
} from "../src/lib/quran/import/checkpoints.ts";
import {
  ManifestSecretFieldRejectedError,
  LegalDecisionBlockedError,
  ProviderAccessNotAuthorizedError,
} from "../src/lib/quran/import/contracts.ts";
import { buildImportManifest } from "../src/lib/quran/import/manifest.ts";
import { reconcile } from "../src/lib/quran/import/reconciliation.ts";
import {
  IMPORT_STATES,
  ImportStateMachine,
} from "../src/lib/quran/import/state-machine.ts";

// Static self-check of the M5.2 import harness wiring. No network access,
// no credentials, and no real Quran content anywhere below.

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const FIXED_CLOCK = () => new Date("2026-01-01T00:00:00.000Z");

const approvedDecisions = {
  license: { licenseReference: "synthetic-license-verify", status: "approved" },
  retention: { policy: "time_limited", retentionDays: 7, status: "approved" },
  attribution: {
    attributionReference: "synthetic-attribution-verify",
    status: "approved",
  },
  applicationDisplay: { status: "approved", intendedUse: true },
  commercialUse: { status: "denied", intendedUse: false },
  standaloneRedistribution: { status: "denied", intendedUse: false },
};

function baseManifestInput(overrides = {}) {
  return {
    manifestId: "018f2f2a-0000-7000-8000-000000000001",
    providerCode: "quran-foundation",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYN-VERIFY-001",
    providerResourceVersion: "synthetic-v1",
    requestedAt: FIXED_CLOCK().toISOString(),
    fetchedAt: FIXED_CLOCK().toISOString(),
    sourceEndpointIdentity: "internal://synthetic-fixture/verify",
    sourceChecksum: sha256Hex("synthetic-verify-source"),
    decisions: approvedDecisions,
    importMode: "full",
    status: "created",
    processIdentity: "quran-import-verify",
    softwareVersion: "0.1.0-m5.2",
    schemaVersion: 2,
    ...overrides,
  };
}

// 1. Deterministic manifest checksum for identical input.
const manifestA = buildImportManifest(baseManifestInput());
const manifestB = buildImportManifest(baseManifestInput());
assert.equal(manifestA.manifestChecksum, manifestB.manifestChecksum);
assert.equal(manifestA.dryRun, true);
console.log(
  "PASS M5.2: manifest checksum is deterministic and dryRun is always true",
);

// 2. Secret-field rejection.
assert.throws(
  () =>
    buildImportManifest(
      baseManifestInput({
        sourceEndpointIdentity:
          "internal://synthetic?api_key=should-not-be-here",
      }),
    ),
  ManifestSecretFieldRejectedError,
);
console.log("PASS M5.2: manifest builder rejects secret-like field values");

// 3. Unknown legal decision blocks progression past the license gate.
assert.throws(
  () =>
    buildImportManifest(
      baseManifestInput({
        status: "ready",
        decisions: {
          ...approvedDecisions,
          retention: {
            policy: "time_limited",
            retentionDays: 7,
            status: "unknown",
          },
        },
      }),
    ),
  LegalDecisionBlockedError,
);
console.log(
  "PASS M5.2: unknown legal decisions block progression past the license gate",
);

// 4. State machine: no production activation state exists.
for (const state of IMPORT_STATES) {
  assert.doesNotMatch(state, /activat|publish|live/i);
}
console.log("PASS M5.2: state machine defines no production activation state");

// 5. State machine: invalid transition rejected, valid transition accepted.
const machine = new ImportStateMachine("created", { now: FIXED_CLOCK });
assert.throws(() => machine.transition("staged"));
machine.transition("awaiting_source_approval");
assert.equal(machine.current(), "awaiting_source_approval");
console.log(
  "PASS M5.2: state machine guards invalid transitions and records history",
);

// 6. Deterministic import run key.
const runKeyInput = {
  manifestId: manifestA.manifestId,
  manifestSchemaVersion: manifestA.schemaVersion,
  providerCode: manifestA.providerCode,
  providerSnapshotVersion: manifestA.providerResourceVersion,
  resourceId: manifestA.providerResourceId,
  resourceVersion: manifestA.providerResourceVersion,
  adapterVersion: manifestA.softwareVersion,
};
assert.equal(
  computeImportRunKey(runKeyInput),
  computeImportRunKey(runKeyInput),
);
console.log("PASS M5.2: import run key is deterministic");

// 7. Checkpoint duplicate suppression.
const store = new InMemoryCheckpointStore();
const checkpoint = {
  runKey: computeImportRunKey(runKeyInput),
  attemptId: "018f2f2a-0000-7000-8000-000000000002",
  manifestChecksum: manifestA.manifestChecksum,
  resourceType: "ayah",
  cursor: "synthetic-ayah:1:1",
  byteCount: 128,
  rowCount: 1,
  rollingChecksum: sha256Hex("checkpoint-1"),
  status: "fetching",
  recordedAt: FIXED_CLOCK().toISOString(),
  sequence: 1,
};
store.advance(checkpoint);
const resubmitted = store.advance(checkpoint);
assert.equal(resubmitted, store.latest(checkpoint.runKey));
console.log(
  "PASS M5.2: checkpoint store suppresses identical duplicate advances",
);

// 8. Adapter network methods are blocked; pure methods are not.
const adapter = new QuranFoundationAdapter({
  processIdentity: "quran-import-verify",
  softwareVersion: "0.1.0-m5.2",
});
await assert.rejects(
  () => adapter.discoverResources(),
  ProviderAccessNotAuthorizedError,
);
await assert.rejects(
  () =>
    adapter.fetchResourceMetadata({
      providerCode: "quran-foundation",
      resourceType: "ayah",
      providerResourceId: "SYN-1",
      providerResourceVersion: "synthetic-v1",
    }),
  ProviderAccessNotAuthorizedError,
);
const normalized = adapter.normalizeProviderRecord({
  providerCode: "quran-foundation",
  resourceType: "surah",
  providerResourceId: "SYN-SURAH-1",
  providerResourceVersion: "synthetic-v1",
  fetchedAt: FIXED_CLOCK().toISOString(),
  payload: {
    canonicalLocator: "synthetic-surah:1",
    surahNumber: 1,
    ayahCount: 1,
    checksum: sha256Hex("synthetic-surah-1"),
  },
});
assert.equal(normalized.kind, "surah");
const normalizedAyah = adapter.normalizeProviderRecord({
  providerCode: "quran-foundation",
  resourceType: "ayah",
  providerResourceId: "SYN-AYAH-1-1",
  providerResourceVersion: "synthetic-v1",
  fetchedAt: FIXED_CLOCK().toISOString(),
  payload: {
    canonicalLocator: "synthetic-ayah:1:1",
    surahNumber: 1,
    ayahNumber: 1,
    globalSequenceNumber: 1,
    checksum: sha256Hex("synthetic-ayah-1-1"),
  },
});
const mapped = adapter.mapProviderIdentity(normalized);
assert.equal(mapped.proposedCanonicalLocator, "synthetic-surah:1");
assert.equal("canonicalId" in mapped, false);
console.log(
  "PASS M5.2: adapter network methods are blocked and pure methods operate correctly",
);

// 9. Reconciliation always reports publicationEligible = false.
const cleanReconciliation = reconcile({
  expectedSurahs: [
    { surahNumber: 1, ayahCount: 1, checksum: sha256Hex("synthetic-surah-1") },
  ],
  actualSurahs: [normalized],
  expectedAyahs: [
    {
      surahNumber: 1,
      ayahNumber: 1,
      globalSequenceNumber: 1,
      checksum: sha256Hex("synthetic-ayah-1-1"),
    },
  ],
  actualAyahs: [normalizedAyah],
  license: approvedDecisions.license,
  attribution: approvedDecisions.attribution,
  retention: approvedDecisions.retention,
});
assert.equal(cleanReconciliation.publicationEligible, false);
assert.equal(cleanReconciliation.blockingErrors.length, 0);
console.log(
  "PASS M5.2: reconciliation never marks publication eligible in M5.2",
);

console.log("PASS M5.2: import harness static verification passed.");
