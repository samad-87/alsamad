import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";

import {
  CheckpointRegressionError,
  ChecksumVerificationError,
  ImportRunTerminalError,
  ManifestSecretFieldRejectedError,
  RetryExhaustedError,
} from "../../src/lib/quran/import/contracts.ts";
import {
  InMemoryCheckpointStore,
  computeImportRunKey,
} from "../../src/lib/quran/import/checkpoints.ts";
import {
  buildImportManifest,
  buildAuditEvent,
  redactEvidence,
  sha256Bytes,
  verifyExactBytes,
  verifyManifestChecksum,
} from "../../src/lib/quran/import/manifest.ts";
import {
  DisposableImportStaging,
  reconcile,
} from "../../src/lib/quran/import/reconciliation.ts";
import {
  QuranFoundationAdapter,
  executeInjectedWithRetry,
} from "../../src/lib/providers/quran-foundation/adapter.ts";

const encoder = new TextEncoder();
const fixedAt = "2026-01-01T00:00:00.000Z";
const sha = (value) => createHash("sha256").update(value).digest("hex");
const decisions = {
  license: { licenseReference: "synthetic-license", status: "approved" },
  retention: { policy: "time_limited", retentionDays: 7, status: "approved" },
  attribution: { attributionReference: "synthetic-credit", status: "approved" },
  applicationDisplay: { status: "approved", intendedUse: true },
  commercialUse: { status: "denied", intendedUse: false },
  standaloneRedistribution: { status: "denied", intendedUse: false },
};

function manifestInput(overrides = {}) {
  return {
    manifestId: "018f2f2a-0000-7000-8000-000000000099",
    providerCode: "synthetic-provider",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYNTHETIC-RESOURCE",
    providerResourceVersion: "synthetic-version",
    requestedAt: fixedAt,
    fetchedAt: fixedAt,
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
    ...overrides,
  };
}

test("manifest validation is immutable, deterministic, and detects changed inputs", () => {
  const first = buildImportManifest(manifestInput());
  const second = buildImportManifest(manifestInput());
  assert.equal(first.manifestChecksum, second.manifestChecksum);
  assert.equal(verifyManifestChecksum(first), true);
  assert.throws(() => {
    first.actualCounts.records = 2;
  }, TypeError);
  const changed = buildImportManifest(
    manifestInput({ processIdentity: "synthetic-other" }),
  );
  assert.notEqual(changed.manifestChecksum, first.manifestChecksum);
});

test("missing, malformed, inconsistent, production, and secret-shaped manifest values fail closed", () => {
  assert.throws(() =>
    buildImportManifest(manifestInput({ providerResourceId: "" })),
  );
  assert.throws(() =>
    buildImportManifest(manifestInput({ requestedAt: "invalid" })),
  );
  assert.throws(() =>
    buildImportManifest(manifestInput({ expectedCounts: { records: -1 } })),
  );
  assert.throws(() =>
    buildImportManifest(manifestInput({ providerEnvironment: "production" })),
  );
  assert.throws(
    () =>
      buildImportManifest({ ...manifestInput(), clientSecret: "never-retain" }),
    ManifestSecretFieldRejectedError,
  );
});

test("evidence redaction removes secret-shaped keys and values", () => {
  const redacted = redactEvidence({
    authorization: "Bearer forbidden",
    note: "token=forbidden",
    safe: "count-only",
  });
  assert.deepEqual(redacted, {
    authorization: "[REDACTED]",
    note: "[REDACTED]",
    safe: "count-only",
  });
  assert.doesNotMatch(JSON.stringify(redacted), /forbidden|Bearer/i);
});

test("audit evidence is payload-free, immutable, and rejects secret-shaped categories", () => {
  const event = buildAuditEvent({
    runId: "synthetic-run",
    manifestChecksum: sha("manifest"),
    eventCategory: "checkpoint",
    outcome: "succeeded",
    counts: { records: 1 },
    durationMs: 4,
    errorCategory: null,
  });
  assert.deepEqual(Object.keys(event).sort(), [
    "counts",
    "durationMs",
    "errorCategory",
    "eventCategory",
    "manifestChecksum",
    "outcome",
    "runId",
  ]);
  assert.equal("payload" in event, false);
  assert.throws(() => {
    event.counts.records = 2;
  }, TypeError);
  assert.throws(() =>
    buildAuditEvent({ ...event, errorCategory: "authorization token" }),
  );
});

test("exact synthetic Arabic UTF-8 bytes preserve tashkeel and detect every mutation class", () => {
  const originalText = "أَهْلًا، عَالَمٌ!";
  const original = encoder.encode(originalText);
  const expected = sha256Bytes(original);
  verifyExactBytes(original, expected);
  const mutations = [
    "أَهْلًا،  عَالَمٌ!",
    "أَهْلًا عَالَمٌ!",
    "أَهْلًا، عَالَم!",
    "أَهْلًا، غَالَمٌ!",
    originalText.normalize("NFD"),
  ];
  for (const mutation of mutations) {
    assert.throws(
      () => verifyExactBytes(encoder.encode(mutation), expected),
      ChecksumVerificationError,
    );
  }
  assert.throws(
    () => verifyExactBytes(original, "bad"),
    ChecksumVerificationError,
  );
});

function checkpoint(sequence, overrides = {}) {
  const runInput = {
    manifestId: randomUUID(),
    manifestChecksum: sha("manifest"),
    manifestSchemaVersion: 1,
    providerCode: "synthetic-provider",
    providerSnapshotVersion: "synthetic-version",
    resourceId: "synthetic-resource",
    resourceVersion: "synthetic-version",
    adapterVersion: "m5.2a-test",
  };
  return {
    runKey: computeImportRunKey(runInput),
    manifestId: runInput.manifestId,
    attemptId: randomUUID(),
    manifestChecksum: sha("manifest"),
    resourceType: "ayah",
    cursor: `cursor-${sequence}`,
    byteCount: sequence * 10,
    rowCount: sequence,
    rollingChecksum: sha(`rolling-${sequence}`),
    status: "fetching",
    recordedAt: fixedAt,
    sequence,
    ...overrides,
  };
}

test("checkpoint advancement rejects conflicting identity, regressive counts, cancellation, completion, and supersession", () => {
  const first = checkpoint(1);
  const store = new InMemoryCheckpointStore();
  store.advance(first);
  assert.equal(store.advance(first), first);
  assert.throws(
    () => store.advance({ ...first, attemptId: randomUUID() }),
    CheckpointRegressionError,
  );
  assert.throws(
    () => store.advance({ ...first, sequence: 2, rowCount: 0 }),
    CheckpointRegressionError,
  );
  store.markCancelled(first.runKey, fixedAt);
  assert.throws(
    () => store.advance({ ...first, sequence: 2 }),
    ImportRunTerminalError,
  );

  const completed = checkpoint(1, { status: "dry_run_passed" });
  const completedStore = new InMemoryCheckpointStore();
  completedStore.advance(completed);
  assert.throws(
    () => completedStore.advance({ ...completed, sequence: 2 }),
    ImportRunTerminalError,
  );

  const superseded = checkpoint(1);
  const supersededStore = new InMemoryCheckpointStore();
  supersededStore.advance(superseded);
  supersededStore.markSuperseded(superseded.runKey, sha("replacement"));
  assert.throws(
    () => supersededStore.advance({ ...superseded, sequence: 2 }),
    ImportRunTerminalError,
  );
});

test("disposable staging preserves opaque values, prohibits mixed versions, and rolls back without canonical writes", () => {
  const opaque = {
    attribution: { exact: ["opaque", 1] },
    provenance: { nested: { source: "synthetic" } },
  };
  const staging = new DisposableImportStaging();
  staging.stage("synthetic-v1", [opaque]);
  assert.deepEqual(staging.snapshot(), [opaque]);
  assert.throws(() => staging.stage("synthetic-v2", [opaque]));
  assert.deepEqual(staging.rollback(), {
    discardedCount: 1,
    canonicalWrites: 0,
  });
  assert.deepEqual(staging.snapshot(), []);
});

test("reconciliation emits every authorized mismatch category and never permits publication", () => {
  const alias = {
    providerCode: "synthetic-provider",
    resourceType: "ayah",
    providerResourceId: "SYN-X",
    providerResourceVersion: "synthetic-v1",
  };
  const result = reconcile({
    expectedSurahs: [
      { surahNumber: 1, ayahCount: 1, checksum: sha("expected-surah") },
    ],
    actualSurahs: [
      {
        kind: "surah",
        canonicalLocator: "synthetic:surah:2",
        surahNumber: 2,
        ayahCount: 1,
        checksum: sha("extra"),
        providerAlias: { ...alias, resourceType: "surah" },
      },
      {
        kind: "surah",
        canonicalLocator: "synthetic:surah:2",
        surahNumber: 2,
        ayahCount: 1,
        checksum: sha("extra"),
        providerAlias: { ...alias, resourceType: "surah" },
      },
    ],
    expectedAyahs: [
      {
        surahNumber: 1,
        ayahNumber: 1,
        globalSequenceNumber: 1,
        checksum: sha("expected"),
      },
    ],
    actualAyahs: [
      {
        kind: "ayah",
        canonicalLocator: "synthetic:ayah:1:1",
        surahNumber: 1,
        ayahNumber: 1,
        globalSequenceNumber: 2,
        checksum: sha("changed"),
        providerAlias: alias,
      },
    ],
    withdrawnOrDeleted: [
      {
        providerResource: alias,
        signalType: "withdrawn",
        observedAt: fixedAt,
        reason: null,
      },
    ],
    license: { licenseReference: "synthetic", status: "denied" },
    attribution: { attributionReference: "synthetic", status: "unknown" },
    retention: { policy: "time_limited", retentionDays: 1, status: "approved" },
    retentionCompliance: {
      fetchedAt: fixedAt,
      asOf: "2026-01-03T00:00:00.000Z",
    },
    expectedMetadata: {
      attribution: { exact: "A" },
      provenance: { exact: "P" },
    },
    actualMetadata: {
      attribution: { exact: "changed" },
      provenance: { exact: "changed" },
    },
  });
  for (const category of [
    "missing",
    "extra",
    "duplicate",
    "orphaned",
    "withdrawn",
    "count",
    "locator",
    "checksum",
    "attribution",
    "provenance",
    "retention",
    "license",
  ]) {
    assert.ok(result.mismatchCategories.includes(category), category);
  }
  assert.equal(result.publicationEligible, false);
});

test("injected retry is bounded for transient, timeout, 429, and sustained failures without network access", async () => {
  const delays = [];
  let attempts = 0;
  const evidence = await executeInjectedWithRetry(
    async () => {
      attempts += 1;
      if (attempts < 3) throw new Error("synthetic 429");
      return "ok";
    },
    () => "rate_limited",
    { maxAttempts: 3, baseDelayMs: 10, maxDelayMs: 15 },
    async (delay) => {
      delays.push(delay);
    },
  );
  assert.deepEqual(evidence, { value: "ok", attempts: 3, delaysMs: [10, 15] });
  assert.deepEqual(delays, [10, 15]);
  for (const category of ["transient", "timeout", "sustained_failure"]) {
    await assert.rejects(
      () =>
        executeInjectedWithRetry(
          async () => {
            throw new Error("synthetic failure");
          },
          () => category,
          { maxAttempts: 2, baseDelayMs: 1, maxDelayMs: 1 },
        ),
      RetryExhaustedError,
    );
  }
});

test("adapter identity stays provider-owned and every network-capable method remains fail-closed", async () => {
  const adapter = new QuranFoundationAdapter({
    processIdentity: "synthetic-test",
    softwareVersion: "m5.2a-test",
  });
  const networkCalls = [
    () => adapter.discoverResources(),
    () => adapter.fetchResourceMetadata({}),
    () => adapter.fetchBatch({}, null),
    () => adapter.getVersionToken({}),
    () => adapter.getDeletionOrWithdrawalSignals(fixedAt),
    () => adapter.produceAttribution({}),
  ];
  for (const call of networkCalls) await assert.rejects(call);
  assert.equal(networkCalls.length, 6);
});
