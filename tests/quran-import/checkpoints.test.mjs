import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  CheckpointRegressionError,
  UnknownImportRunError,
} from "../../src/lib/quran/import/contracts.ts";
import {
  InMemoryCheckpointStore,
  computeImportRunKey,
} from "../../src/lib/quran/import/checkpoints.ts";

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const runKeyInput = {
  manifestId: "018f2f2a-0000-7000-8000-000000000020",
  manifestSchemaVersion: 1,
  providerCode: "quran-foundation",
  providerSnapshotVersion: "synthetic-v1",
  resourceId: "SYN-TEST-001",
  resourceVersion: "synthetic-v1",
  adapterVersion: "0.1.0-m5.2",
};

function checkpointAt(sequence, overrides = {}) {
  return {
    runKey: computeImportRunKey(runKeyInput),
    attemptId: "018f2f2a-0000-7000-8000-000000000021",
    manifestChecksum: sha256Hex("synthetic-manifest"),
    resourceType: "ayah",
    cursor: `cursor-${sequence}`,
    byteCount: sequence * 100,
    rowCount: sequence,
    rollingChecksum: sha256Hex(`rolling-${sequence}`),
    status: "fetching",
    recordedAt: "2026-01-01T00:00:00.000Z",
    sequence,
    ...overrides,
  };
}

test("import run key is deterministic for identical input", () => {
  assert.equal(
    computeImportRunKey(runKeyInput),
    computeImportRunKey(runKeyInput),
  );
});

test("import run key changes when the resource version changes", () => {
  const changed = computeImportRunKey({
    ...runKeyInput,
    resourceVersion: "synthetic-v2",
  });
  assert.notEqual(changed, computeImportRunKey(runKeyInput));
});

test("checkpoint sequence advances monotonically", () => {
  const store = new InMemoryCheckpointStore();
  store.advance(checkpointAt(1));
  store.advance(checkpointAt(2));
  const latest = store.latest(computeImportRunKey(runKeyInput));
  assert.equal(latest.sequence, 2);
});

test("retry and resume: identical resubmission is a no-op and higher sequence resumes forward", () => {
  const store = new InMemoryCheckpointStore();
  const runKey = computeImportRunKey(runKeyInput);
  store.advance(checkpointAt(1));
  const resumed = store.advance(checkpointAt(1));
  assert.equal(resumed.sequence, 1);
  const resumePoint = store.latest(runKey);
  assert.equal(resumePoint.cursor, "cursor-1");
  store.advance(checkpointAt(2));
  assert.equal(store.latest(runKey).sequence, 2);
});

test("duplicate suppression: identical checkpoint returns the stored instance", () => {
  const store = new InMemoryCheckpointStore();
  const first = store.advance(checkpointAt(1));
  const duplicate = store.advance(checkpointAt(1));
  assert.equal(duplicate, first);
});

test("a checksum-conflicting same-sequence resubmission is a regression", () => {
  const store = new InMemoryCheckpointStore();
  store.advance(checkpointAt(1));
  assert.throws(
    () =>
      store.advance(
        checkpointAt(1, { rollingChecksum: sha256Hex("different") }),
      ),
    CheckpointRegressionError,
  );
});

test("a lower sequence is rejected as a regression", () => {
  const store = new InMemoryCheckpointStore();
  store.advance(checkpointAt(2));
  assert.throws(
    () => store.advance(checkpointAt(1)),
    CheckpointRegressionError,
  );
});

test("stale-run detection compares elapsed time against a timeout", () => {
  const store = new InMemoryCheckpointStore();
  const runKey = computeImportRunKey(runKeyInput);
  store.advance(checkpointAt(1, { recordedAt: "2026-01-01T00:00:00.000Z" }));
  assert.equal(
    store.isStale(runKey, "2026-01-01T00:10:00.000Z", 5 * 60 * 1000),
    true,
  );
  assert.equal(
    store.isStale(runKey, "2026-01-01T00:02:00.000Z", 5 * 60 * 1000),
    false,
  );
});

test("operator cancellation marks a run without mutating its checkpoint", () => {
  const store = new InMemoryCheckpointStore();
  const runKey = computeImportRunKey(runKeyInput);
  store.advance(checkpointAt(1));
  store.markCancelled(runKey, "2026-01-01T00:05:00.000Z");
  assert.equal(store.isCancelled(runKey), true);
  assert.equal(store.latest(runKey).sequence, 1);
});

test("cancelling an unknown run throws", () => {
  const store = new InMemoryCheckpointStore();
  assert.throws(
    () => store.markCancelled("unknown-run-key", "2026-01-01T00:00:00.000Z"),
    UnknownImportRunError,
  );
});

test("superseded run handling links an old run key to its replacement", () => {
  const store = new InMemoryCheckpointStore();
  const oldRunKey = computeImportRunKey(runKeyInput);
  const newRunKey = computeImportRunKey({
    ...runKeyInput,
    resourceVersion: "synthetic-v2",
  });
  store.advance(checkpointAt(1, { runKey: oldRunKey }));
  store.markSuperseded(oldRunKey, newRunKey);
  assert.equal(store.isSuperseded(oldRunKey), true);
  assert.equal(store.isSuperseded(newRunKey), false);
});
