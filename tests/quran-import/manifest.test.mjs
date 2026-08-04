import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  LegalDecisionBlockedError,
  ManifestSecretFieldRejectedError,
  ManifestValidationError,
} from "../../src/lib/quran/import/contracts.ts";
import { buildImportManifest } from "../../src/lib/quran/import/manifest.ts";

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

const FIXED_TIMESTAMP = "2026-01-01T00:00:00.000Z";

const approvedDecisions = {
  license: { licenseReference: "synthetic-license", status: "approved" },
  retention: { policy: "time_limited", retentionDays: 7, status: "approved" },
  attribution: {
    attributionReference: "synthetic-attribution",
    status: "approved",
  },
  commercialUse: { status: "approved" },
  redistribution: { status: "approved" },
};

function baseInput(overrides = {}) {
  return {
    manifestId: "018f2f2a-0000-7000-8000-000000000010",
    providerCode: "quran-foundation",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYN-TEST-001",
    providerResourceVersion: "synthetic-v1",
    requestedAt: FIXED_TIMESTAMP,
    fetchedAt: FIXED_TIMESTAMP,
    sourceEndpointIdentity: "internal://synthetic-fixture/tests",
    sourceChecksum: sha256Hex("synthetic-test-source"),
    decisions: approvedDecisions,
    importMode: "full",
    status: "created",
    processIdentity: "quran-import-tests",
    softwareVersion: "0.1.0-m5.2",
    schemaVersion: 1,
    ...overrides,
  };
}

test("manifest is immutable after construction", () => {
  const manifest = buildImportManifest(baseInput());
  assert.throws(() => {
    manifest.providerCode = "other-provider";
  }, TypeError);
  assert.throws(() => {
    manifest.retentionDecision.status = "denied";
  }, TypeError);
  assert.throws(() => {
    manifest.evidenceReferences.push("new-ref");
  }, TypeError);
});

test("manifest checksum is deterministic for identical input", () => {
  const first = buildImportManifest(baseInput());
  const second = buildImportManifest(baseInput());
  assert.equal(first.manifestChecksum, second.manifestChecksum);
  assert.match(first.manifestChecksum, /^[0-9a-f]{64}$/);
});

test("manifest checksum changes when a field changes", () => {
  const first = buildImportManifest(baseInput());
  const second = buildImportManifest(
    baseInput({ providerResourceVersion: "synthetic-v2" }),
  );
  assert.notEqual(first.manifestChecksum, second.manifestChecksum);
});

test("manifest builder rejects secret-like field values", () => {
  assert.throws(
    () =>
      buildImportManifest(
        baseInput({
          sourceEndpointIdentity:
            "internal://synthetic-fixture/tests?password=hunter2",
        }),
      ),
    ManifestSecretFieldRejectedError,
  );
});

test("manifest builder blocks progression past the license gate on unknown decisions", () => {
  assert.throws(
    () =>
      buildImportManifest(
        baseInput({
          status: "ready",
          decisions: {
            ...approvedDecisions,
            commercialUse: { status: "unknown" },
          },
        }),
      ),
    LegalDecisionBlockedError,
  );
});

test("manifest builder allows pre-gate states even with unresolved decisions", () => {
  const manifest = buildImportManifest(
    baseInput({
      status: "awaiting_license_approval",
      decisions: {
        ...approvedDecisions,
        redistribution: { status: "denied" },
      },
    }),
  );
  assert.equal(manifest.status, "awaiting_license_approval");
  assert.equal(manifest.redistributionDecision.status, "denied");
});

test("manifest builder always sets dryRun to true", () => {
  const manifest = buildImportManifest(baseInput());
  assert.equal(manifest.dryRun, true);
});

test("manifest builder rejects a production environment", () => {
  assert.throws(
    () => buildImportManifest(baseInput({ providerEnvironment: "production" })),
    ManifestValidationError,
  );
});

test("manifest builder rejects a malformed source checksum", () => {
  assert.throws(
    () => buildImportManifest(baseInput({ sourceChecksum: "not-a-checksum" })),
    ManifestValidationError,
  );
});
