import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { reconcile } from "../../src/lib/quran/import/reconciliation.ts";

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const approvedLicense = {
  licenseReference: "synthetic-license",
  status: "approved",
};
const approvedAttribution = {
  attributionReference: "synthetic-attribution",
  status: "approved",
};
const approvedRetention = {
  policy: "time_limited",
  retentionDays: 7,
  status: "approved",
};

function alias(providerResourceId) {
  return {
    providerCode: "quran-foundation",
    resourceType: "ayah",
    providerResourceId,
    providerResourceVersion: "synthetic-v1",
  };
}

function surahAlias(providerResourceId) {
  return { ...alias(providerResourceId), resourceType: "surah" };
}

function expectedSurah(surahNumber, ayahCount) {
  return {
    surahNumber,
    ayahCount,
    checksum: sha256Hex(`surah:${surahNumber}`),
  };
}

function actualSurah(surahNumber, ayahCount, overrides = {}) {
  return {
    kind: "surah",
    canonicalLocator: `synthetic-surah:${surahNumber}`,
    surahNumber,
    ayahCount,
    checksum: sha256Hex(`surah:${surahNumber}`),
    providerAlias: surahAlias(`SYN-SURAH-${surahNumber}`),
    ...overrides,
  };
}

function expectedAyah(surahNumber, ayahNumber, globalSequenceNumber) {
  return {
    surahNumber,
    ayahNumber,
    globalSequenceNumber,
    checksum: sha256Hex(`ayah:${surahNumber}:${ayahNumber}`),
  };
}

function actualAyah(
  surahNumber,
  ayahNumber,
  globalSequenceNumber,
  overrides = {},
) {
  return {
    kind: "ayah",
    canonicalLocator: `synthetic-ayah:${surahNumber}:${ayahNumber}`,
    surahNumber,
    ayahNumber,
    globalSequenceNumber,
    checksum: sha256Hex(`ayah:${surahNumber}:${ayahNumber}`),
    providerAlias: alias(`SYN-AYAH-${surahNumber}-${ayahNumber}`),
    ...overrides,
  };
}

function cleanFixture() {
  return {
    expectedSurahs: [expectedSurah(1, 2)],
    actualSurahs: [actualSurah(1, 2)],
    expectedAyahs: [expectedAyah(1, 1, 1), expectedAyah(1, 2, 2)],
    actualAyahs: [actualAyah(1, 1, 1), actualAyah(1, 2, 2)],
    license: approvedLicense,
    attribution: approvedAttribution,
    retention: approvedRetention,
  };
}

test("reconciliation succeeds on a fully matched synthetic fixture", () => {
  const result = reconcile(cleanFixture());
  assert.deepEqual(result.blockingErrors, []);
  assert.equal(result.metrics.expectedSurahCount, 1);
  assert.equal(result.metrics.actualSurahCount, 1);
  assert.equal(result.metrics.expectedAyahCount, 2);
  assert.equal(result.metrics.actualAyahCount, 2);
  assert.equal(result.publicationEligible, false);
});

test("reconciliation flags a missing canonical locator", () => {
  const fixture = cleanFixture();
  fixture.actualAyahs = [actualAyah(1, 1, 1)];
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("missing canonical locator"),
    ),
  );
});

test("reconciliation flags a duplicate canonical locator", () => {
  const fixture = cleanFixture();
  fixture.actualAyahs = [
    actualAyah(1, 1, 1),
    actualAyah(1, 1, 1),
    actualAyah(1, 2, 2),
  ];
  const result = reconcile(fixture);
  assert.ok(result.duplicateRecords.includes("synthetic-ayah:1:1"));
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("duplicate canonical locator"),
    ),
  );
});

test("reconciliation flags a global sequence gap", () => {
  const fixture = cleanFixture();
  fixture.actualAyahs = [actualAyah(1, 1, 1), actualAyah(1, 2, 3)];
  fixture.expectedAyahs = [expectedAyah(1, 1, 1), expectedAyah(1, 2, 3)];
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("global sequence gap"),
    ),
  );
});

test("reconciliation flags a checksum mismatch as drift", () => {
  const fixture = cleanFixture();
  fixture.actualAyahs = [
    actualAyah(1, 1, 1, { checksum: sha256Hex("corrupted") }),
    actualAyah(1, 2, 2),
  ];
  const result = reconcile(fixture);
  assert.equal(result.checksumDrift.length, 1);
  assert.equal(result.checksumDrift[0].locator, "synthetic-ayah:1:1");
  assert.ok(
    result.blockingErrors.some((error) => error.includes("checksum mismatch")),
  );
});

test("reconciliation flags an unresolved retention decision", () => {
  const fixture = cleanFixture();
  fixture.retention = {
    policy: "time_limited",
    retentionDays: 7,
    status: "unknown",
  };
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("retention decision incomplete"),
    ),
  );
});

test("reconciliation flags a retention window exceeded", () => {
  const fixture = cleanFixture();
  fixture.retentionCompliance = {
    fetchedAt: "2026-01-01T00:00:00.000Z",
    asOf: "2026-01-20T00:00:00.000Z",
  };
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("retention window exceeded"),
    ),
  );
});

test("reconciliation flags incomplete license and attribution decisions", () => {
  const fixture = cleanFixture();
  fixture.license = { licenseReference: "synthetic-license", status: "denied" };
  fixture.attribution = {
    attributionReference: "synthetic-attribution",
    status: "unknown",
  };
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("license decision incomplete"),
    ),
  );
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("attribution decision incomplete"),
    ),
  );
});

test("reconciliation blocks a withdrawn provider record still present", () => {
  const fixture = cleanFixture();
  fixture.withdrawnOrDeleted = [
    {
      providerResource: alias("SYN-AYAH-1-1"),
      signalType: "withdrawn",
      observedAt: "2026-01-01T00:00:00.000Z",
      reason: "synthetic withdrawal",
    },
  ];
  const result = reconcile(fixture);
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("withdrawn/deleted provider record still present"),
    ),
  );
});

test("reconciliation flags an orphan provider record with no expected match", () => {
  const fixture = cleanFixture();
  fixture.actualSurahs = [actualSurah(1, 2), actualSurah(2, 1)];
  const result = reconcile(fixture);
  assert.ok(
    result.unmatchedRecords.some((entry) => entry.includes("SYN-SURAH-2")),
  );
  assert.ok(
    result.blockingErrors.some((error) =>
      error.includes("orphan provider surah record"),
    ),
  );
});

test("reconciliation warns on incomplete translation coverage without blocking", () => {
  const fixture = cleanFixture();
  fixture.translationCoverage = {
    expectedLocaleCodes: ["en-synthetic", "fr-synthetic"],
    actualLocaleCodes: ["en-synthetic"],
  };
  const result = reconcile(fixture);
  assert.ok(
    result.warnings.some((warning) => warning.includes("fr-synthetic")),
  );
  assert.equal(result.blockingErrors.length, 0);
});

test("publicationEligible is always false regardless of outcome", () => {
  const passing = reconcile(cleanFixture());
  const failing = reconcile({
    ...cleanFixture(),
    license: { licenseReference: "synthetic-license", status: "denied" },
  });
  assert.equal(passing.publicationEligible, false);
  assert.equal(failing.publicationEligible, false);
});
