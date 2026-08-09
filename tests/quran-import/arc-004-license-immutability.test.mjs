import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  LegalDecisionBlockedError,
  ManifestValidationError,
} from "../../src/lib/quran/import/contracts.ts";
import {
  buildSourceImportManifest,
  verifySourceManifestChecksum,
} from "../../src/lib/quran/import/manifest.ts";

const sha = (value) => createHash("sha256").update(value).digest("hex");

function decisions(overrides = {}) {
  return {
    license: { licenseReference: "synthetic-license-v1", status: "approved" },
    retention: { policy: "time_limited", retentionDays: 7, status: "approved" },
    attribution: {
      attributionReference: "synthetic-attribution-v1",
      status: "approved",
    },
    applicationDisplay: { status: "approved", intendedUse: true },
    commercialUse: { status: "denied", intendedUse: false },
    standaloneRedistribution: { status: "denied", intendedUse: false },
    ...overrides,
  };
}

function sourceInput(overrides = {}) {
  return {
    manifestId: "018f2f2a-0000-7000-8000-000000000401",
    schemaVersion: 3,
    providerCode: "synthetic-provider",
    providerEnvironment: "sandbox",
    resourceType: "ayah",
    providerResourceId: "SYNTHETIC-RESOURCE",
    providerResourceVersion: "synthetic-v1",
    sourceEndpointIdentity: "internal://synthetic-only/source",
    intendedOperation: "non-commercial-in-application-dry-run",
    importMode: "full",
    decisions: decisions(),
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

test("blank licenseDecisionReference fails closed", () => {
  assert.throws(
    () =>
      buildSourceImportManifest(
        sourceInput({
          decisions: decisions({
            license: { licenseReference: "", status: "approved" },
          }),
        }),
      ),
    ManifestValidationError,
  );
});

test("whitespace-only licenseDecisionReference fails closed", () => {
  assert.throws(
    () =>
      buildSourceImportManifest(
        sourceInput({
          decisions: decisions({
            license: { licenseReference: "   ", status: "approved" },
          }),
        }),
      ),
    ManifestValidationError,
  );
});

test("blank attributionReference fails closed where attribution is required", () => {
  assert.throws(
    () =>
      buildSourceImportManifest(
        sourceInput({
          decisions: decisions({
            attribution: { attributionReference: "", status: "approved" },
          }),
        }),
      ),
    ManifestValidationError,
  );
  assert.throws(
    () =>
      buildSourceImportManifest(
        sourceInput({
          decisions: decisions({
            attribution: { attributionReference: "  ", status: "approved" },
          }),
        }),
      ),
    ManifestValidationError,
  );
});

test("valid exact license and attribution references succeed", () => {
  const manifest = buildSourceImportManifest(sourceInput());
  assert.equal(manifest.licenseDecisionReference, "synthetic-license-v1");
  assert.equal(
    manifest.attributionDecision.attributionReference,
    "synthetic-attribution-v1",
  );
  assert.equal(verifySourceManifestChecksum(manifest), true);
});

test("a later license/attribution reference changes the v3 manifest checksum as a governed authorization change", () => {
  const base = buildSourceImportManifest(sourceInput());
  const laterLicense = buildSourceImportManifest(
    sourceInput({
      manifestId: "018f2f2a-0000-7000-8000-000000000402",
      decisions: decisions({
        license: {
          licenseReference: "synthetic-license-v2",
          status: "approved",
        },
      }),
    }),
  );
  const laterAttribution = buildSourceImportManifest(
    sourceInput({
      manifestId: "018f2f2a-0000-7000-8000-000000000403",
      decisions: decisions({
        attribution: {
          attributionReference: "synthetic-attribution-v2",
          status: "approved",
        },
      }),
    }),
  );
  assert.notEqual(laterLicense.manifestChecksum, base.manifestChecksum);
  assert.notEqual(laterAttribution.manifestChecksum, base.manifestChecksum);
});

test("ARC-001 optional-capability rights semantics compose unchanged with the ARC-004 reference requirement", () => {
  // A denied capability the intended operation does not exercise remains
  // compatible, exactly as ARC-001 established, once references are present.
  const manifest = buildSourceImportManifest(
    sourceInput({
      decisions: decisions({
        commercialUse: { status: "denied", intendedUse: false },
        standaloneRedistribution: { status: "denied", intendedUse: false },
      }),
    }),
  );
  assert.equal(verifySourceManifestChecksum(manifest), true);

  // An unknown required application-display capability still fails closed.
  assert.throws(
    () =>
      buildSourceImportManifest(
        sourceInput({
          decisions: decisions({
            applicationDisplay: { status: "unknown", intendedUse: true },
          }),
        }),
      ),
    LegalDecisionBlockedError,
  );
});
