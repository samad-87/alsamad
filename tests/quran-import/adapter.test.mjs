import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { ProviderAccessNotAuthorizedError } from "../../src/lib/quran/import/contracts.ts";
import { QuranFoundationAdapter } from "../../src/lib/providers/quran-foundation/adapter.ts";

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function buildAdapter() {
  return new QuranFoundationAdapter({
    processIdentity: "quran-import-tests",
    softwareVersion: "0.1.0-m5.2",
  });
}

const resourceRef = {
  providerCode: "quran-foundation",
  resourceType: "ayah",
  providerResourceId: "SYN-TEST-001",
  providerResourceVersion: "synthetic-v1",
};

test("discoverResources requires unauthorized network access", async () => {
  await assert.rejects(
    () => buildAdapter().discoverResources(),
    ProviderAccessNotAuthorizedError,
  );
});

test("fetchResourceMetadata requires unauthorized network access", async () => {
  await assert.rejects(
    () => buildAdapter().fetchResourceMetadata(resourceRef),
    ProviderAccessNotAuthorizedError,
  );
});

test("fetchBatch requires unauthorized network access", async () => {
  await assert.rejects(
    () => buildAdapter().fetchBatch(resourceRef, null),
    ProviderAccessNotAuthorizedError,
  );
});

test("getVersionToken requires unauthorized network access", async () => {
  await assert.rejects(
    () => buildAdapter().getVersionToken(resourceRef),
    ProviderAccessNotAuthorizedError,
  );
});

test("getDeletionOrWithdrawalSignals requires unauthorized network access", async () => {
  await assert.rejects(
    () =>
      buildAdapter().getDeletionOrWithdrawalSignals("2026-01-01T00:00:00.000Z"),
    ProviderAccessNotAuthorizedError,
  );
});

test("produceAttribution requires unauthorized network access", async () => {
  await assert.rejects(
    () => buildAdapter().produceAttribution(resourceRef),
    ProviderAccessNotAuthorizedError,
  );
});

test("normalizeProviderRecord and validateProviderRecord operate purely on supplied data", () => {
  const adapter = buildAdapter();
  const normalized = adapter.normalizeProviderRecord({
    providerCode: "quran-foundation",
    resourceType: "surah",
    providerResourceId: "SYN-SURAH-1",
    providerResourceVersion: "synthetic-v1",
    fetchedAt: "2026-01-01T00:00:00.000Z",
    payload: {
      canonicalLocator: "synthetic-surah:1",
      surahNumber: 1,
      ayahCount: 3,
      checksum: sha256Hex("synthetic-surah-1"),
    },
  });
  assert.equal(normalized.kind, "surah");
  const validation = adapter.validateProviderRecord(normalized);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.violations, []);
});

test("validateProviderRecord reports violations for an out-of-range synthetic surah number", () => {
  const adapter = buildAdapter();
  const normalized = adapter.normalizeProviderRecord({
    providerCode: "quran-foundation",
    resourceType: "surah",
    providerResourceId: "SYN-SURAH-BAD",
    providerResourceVersion: "synthetic-v1",
    fetchedAt: "2026-01-01T00:00:00.000Z",
    payload: {
      canonicalLocator: "synthetic-surah:999",
      surahNumber: 999,
      ayahCount: 1,
      checksum: sha256Hex("synthetic-surah-bad"),
    },
  });
  const validation = adapter.validateProviderRecord(normalized);
  assert.equal(validation.valid, false);
  assert.ok(validation.violations.some((v) => v.includes("surahNumber")));
});

test("mapProviderIdentity never produces a canonical UUID from a provider ID", () => {
  const adapter = buildAdapter();
  const normalized = adapter.normalizeProviderRecord({
    providerCode: "quran-foundation",
    resourceType: "surah",
    providerResourceId: "SYN-SURAH-2",
    providerResourceVersion: "synthetic-v1",
    fetchedAt: "2026-01-01T00:00:00.000Z",
    payload: {
      canonicalLocator: "synthetic-surah:2",
      surahNumber: 2,
      ayahCount: 1,
      checksum: sha256Hex("synthetic-surah-2"),
    },
  });
  const mapped = adapter.mapProviderIdentity(normalized);
  assert.equal(mapped.proposedCanonicalLocator, "synthetic-surah:2");
  assert.equal(mapped.alias.providerResourceId, "SYN-SURAH-2");
  const keys = Object.keys(mapped);
  assert.deepEqual(keys.sort(), ["alias", "proposedCanonicalLocator"]);
  for (const value of Object.values(mapped)) {
    if (typeof value === "string") {
      assert.doesNotMatch(
        value,
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    }
  }
});

test("close is idempotent and never throws", async () => {
  const adapter = buildAdapter();
  await adapter.close();
  await adapter.close();
});

test("methods reject use after close", async () => {
  const adapter = buildAdapter();
  await adapter.close();
  assert.throws(() =>
    adapter.validateProviderRecord({
      kind: "surah",
      canonicalLocator: "synthetic-surah:1",
      surahNumber: 1,
      ayahCount: 1,
      checksum: sha256Hex("x"),
      providerAlias: resourceRef,
    }),
  );
});
