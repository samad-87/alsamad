import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { createId } from "../src/db/ids.ts";
import { QuranFoundationAdapter } from "../src/lib/providers/quran-foundation/adapter.ts";
import {
  InMemoryCheckpointStore,
  computeImportRunKey,
} from "../src/lib/quran/import/checkpoints.ts";
import { buildImportManifest } from "../src/lib/quran/import/manifest.ts";
import { reconcile } from "../src/lib/quran/import/reconciliation.ts";
import { ImportStateMachine } from "../src/lib/quran/import/state-machine.ts";

// M5.2 controlled dry run. No credentials are loaded, no network call is
// made, and no real Quran content is used anywhere below: every identifier
// and checksum input is a clearly synthetic literal.

function sha256Hex(value) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function parseArgs(argv) {
  const args = { scenario: "clean", out: null };
  for (const arg of argv) {
    if (arg.startsWith("--scenario=")) {
      args.scenario = arg.slice("--scenario=".length);
    }
    if (arg.startsWith("--out=")) {
      args.out = arg.slice("--out=".length);
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
if (args.scenario !== "clean" && args.scenario !== "blocking") {
  throw new Error(`unknown --scenario value: ${args.scenario}`);
}

const clock = () => new Date();

function syntheticChecksum(label) {
  return sha256Hex(`synthetic-fixture:${label}`);
}

function buildSyntheticEnvelope(resourceType, providerResourceId, payload) {
  return {
    providerCode: "quran-foundation",
    resourceType,
    providerResourceId,
    providerResourceVersion: "synthetic-v1",
    fetchedAt: clock().toISOString(),
    payload,
  };
}

// A small, deliberately non-religious structural fixture: two synthetic
// "surahs" with a handful of synthetic "ayahs" each.
const SYNTHETIC_SURAHS = [
  { surahNumber: 1, ayahCount: 3 },
  { surahNumber: 2, ayahCount: 2 },
];

const expectedSurahs = SYNTHETIC_SURAHS.map((surah) => ({
  surahNumber: surah.surahNumber,
  ayahCount: surah.ayahCount,
  checksum: syntheticChecksum(`surah:${surah.surahNumber}`),
}));

const expectedAyahs = [];
let globalSequence = 0;
for (const surah of SYNTHETIC_SURAHS) {
  for (let ayahNumber = 1; ayahNumber <= surah.ayahCount; ayahNumber += 1) {
    globalSequence += 1;
    expectedAyahs.push({
      surahNumber: surah.surahNumber,
      ayahNumber,
      globalSequenceNumber: globalSequence,
      checksum: syntheticChecksum(`ayah:${surah.surahNumber}:${ayahNumber}`),
    });
  }
}

const adapter = new QuranFoundationAdapter({
  processIdentity: "quran-import-cli",
  softwareVersion: "0.1.0-m5.2",
});

const surahEnvelopes = SYNTHETIC_SURAHS.map((surah) =>
  buildSyntheticEnvelope("surah", `SYN-SURAH-${surah.surahNumber}`, {
    canonicalLocator: `synthetic-surah:${surah.surahNumber}`,
    surahNumber: surah.surahNumber,
    ayahCount: surah.ayahCount,
    checksum: syntheticChecksum(`surah:${surah.surahNumber}`),
  }),
);

let ayahEnvelopes = expectedAyahs.map((ayah) =>
  buildSyntheticEnvelope(
    "ayah",
    `SYN-AYAH-${ayah.surahNumber}-${ayah.ayahNumber}`,
    {
      canonicalLocator: `synthetic-ayah:${ayah.surahNumber}:${ayah.ayahNumber}`,
      surahNumber: ayah.surahNumber,
      ayahNumber: ayah.ayahNumber,
      globalSequenceNumber: ayah.globalSequenceNumber,
      checksum: syntheticChecksum(
        `ayah:${ayah.surahNumber}:${ayah.ayahNumber}`,
      ),
    },
  ),
);

if (args.scenario === "blocking") {
  // Drop one synthetic ayah and corrupt another's checksum so reconciliation
  // is proven to fail closed, never silently waived.
  ayahEnvelopes = ayahEnvelopes.slice(1);
  ayahEnvelopes[0] = {
    ...ayahEnvelopes[0],
    payload: {
      ...ayahEnvelopes[0].payload,
      checksum: sha256Hex("synthetic-corrupted-checksum"),
    },
  };
}

const normalizedSurahs = surahEnvelopes.map((envelope) =>
  adapter.normalizeProviderRecord(envelope),
);
const normalizedAyahs = ayahEnvelopes.map((envelope) =>
  adapter.normalizeProviderRecord(envelope),
);

for (const record of [...normalizedSurahs, ...normalizedAyahs]) {
  const validation = adapter.validateProviderRecord(record);
  if (!validation.valid) {
    throw new Error(
      `synthetic fixture failed adapter validation: ${validation.violations.join(", ")}`,
    );
  }
}

const licenseDecision = {
  licenseReference: "synthetic-license-001",
  status: "approved",
};
const retentionDecision = {
  policy: "time_limited",
  retentionDays: 7,
  status: "approved",
};
const attributionDecision = {
  attributionReference: "synthetic-attribution-001",
  status: "approved",
};

const expectedCountsMap = {
  surahs: expectedSurahs.length,
  ayahs: expectedAyahs.length,
};
const actualCountsMap = {
  surahs: normalizedSurahs.length,
  ayahs: normalizedAyahs.length,
};

const requestedAt = clock().toISOString();
const fetchedAt = clock().toISOString();

const manifest = buildImportManifest({
  manifestId: createId(),
  providerCode: "quran-foundation",
  providerEnvironment: "sandbox",
  resourceType: "ayah",
  providerResourceId: "SYN-RESOURCE-001",
  providerResourceVersion: "synthetic-v1",
  requestedAt,
  fetchedAt,
  sourceEndpointIdentity: "internal://synthetic-fixture/quran-foundation/ayahs",
  sourceChecksum: syntheticChecksum("source-envelope"),
  decisions: {
    license: licenseDecision,
    retention: retentionDecision,
    attribution: attributionDecision,
    commercialUse: { status: "approved" },
    redistribution: { status: "approved" },
  },
  expectedCounts: expectedCountsMap,
  actualCounts: actualCountsMap,
  importMode: "full",
  status: "created",
  processIdentity: "quran-import-cli",
  softwareVersion: "0.1.0-m5.2",
  schemaVersion: 1,
  evidenceReferences: [],
});

const machine = new ImportStateMachine("created", { now: clock });
for (const to of [
  "awaiting_source_approval",
  "awaiting_license_approval",
  "ready",
  "fetching",
  "quarantined",
  "validating",
  "normalized",
  "staged",
  "reconciling",
]) {
  machine.transition(to);
}

const checkpointStore = new InMemoryCheckpointStore();
const runKey = computeImportRunKey({
  manifestId: manifest.manifestId,
  manifestSchemaVersion: manifest.schemaVersion,
  providerCode: manifest.providerCode,
  providerSnapshotVersion: manifest.providerResourceVersion,
  resourceId: manifest.providerResourceId,
  resourceVersion: manifest.providerResourceVersion,
  adapterVersion: manifest.softwareVersion,
});
const attemptId = createId();
const checkpoints = [];
let sequence = 0;
for (const record of [...normalizedSurahs, ...normalizedAyahs]) {
  sequence += 1;
  checkpoints.push(
    checkpointStore.advance({
      runKey,
      attemptId,
      manifestChecksum: manifest.manifestChecksum,
      resourceType: record.kind === "surah" ? "surah" : "ayah",
      cursor: record.canonicalLocator,
      byteCount: sequence * 128,
      rowCount: sequence,
      rollingChecksum: sha256Hex(`${runKey}:${sequence}`),
      status: machine.current(),
      recordedAt: clock().toISOString(),
      sequence,
    }),
  );
}

const reconciliation = reconcile({
  expectedSurahs,
  actualSurahs: normalizedSurahs,
  expectedAyahs,
  actualAyahs: normalizedAyahs,
  license: licenseDecision,
  attribution: attributionDecision,
  retention: retentionDecision,
  retentionCompliance: { fetchedAt, asOf: clock().toISOString() },
});

const dryRunPassed = reconciliation.blockingErrors.length === 0;
machine.transition(dryRunPassed ? "dry_run_passed" : "dry_run_failed");
if (dryRunPassed) {
  machine.transition("awaiting_scholarly_approval");
}

const dryRunReport = {
  manifestSummary: {
    manifestId: manifest.manifestId,
    providerCode: manifest.providerCode,
    resourceType: manifest.resourceType,
    providerResourceVersion: manifest.providerResourceVersion,
    dryRun: true,
  },
  providerResourceIdentity: {
    providerCode: manifest.providerCode,
    resourceType: manifest.resourceType,
    providerResourceId: manifest.providerResourceId,
    providerResourceVersion: manifest.providerResourceVersion,
  },
  expectedCounts: expectedCountsMap,
  actualCounts: actualCountsMap,
  sourceChecksum: manifest.sourceChecksum,
  normalizedChecksum: manifest.normalizedChecksum,
  warnings: reconciliation.warnings,
  blockingErrors: reconciliation.blockingErrors,
  reconciliation,
  unmappedRecords: reconciliation.unmatchedRecords,
  duplicateRecords: reconciliation.duplicateRecords,
  retentionDeadline: null,
  licenseDecisionStatus: licenseDecision.status,
  scholarlyReviewStatus: dryRunPassed ? "pending" : "not_started",
  publicationEligible: false,
  rollbackEvidence: {
    discarded: ["quarantine payload", "staging rows"],
    purgedAt: clock().toISOString(),
  },
};

const evidenceBundle = {
  runKey,
  manifestChecksum: manifest.manifestChecksum,
  dryRunReport,
  checkpoints,
  stateHistory: machine.history(),
  generatedAt: clock().toISOString(),
};

console.log("=== ALSAMAD M5.2 Quran Import - Controlled Dry Run ===");
console.log(`scenario: ${args.scenario}`);
console.log(`manifestId: ${manifest.manifestId}`);
console.log(`manifestChecksum: ${manifest.manifestChecksum}`);
console.log(
  `providerCode: ${manifest.providerCode} (${manifest.providerEnvironment})`,
);
console.log(`resourceType: ${manifest.resourceType}`);
console.log(`dryRun: ${manifest.dryRun}`);
console.log(`final state: ${machine.current()}`);
console.log(
  `expected surahs/ayahs: ${expectedSurahs.length}/${expectedAyahs.length}`,
);
console.log(
  `actual surahs/ayahs: ${normalizedSurahs.length}/${normalizedAyahs.length}`,
);
console.log(`blocking errors: ${reconciliation.blockingErrors.length}`);
for (const error of reconciliation.blockingErrors) {
  console.log(`  - ${error}`);
}
console.log(`warnings: ${reconciliation.warnings.length}`);
for (const warning of reconciliation.warnings) {
  console.log(`  - ${warning}`);
}
console.log(`publicationEligible: ${reconciliation.publicationEligible}`);
console.log("production activation: BLOCKED (not authorized in M5.2)");

if (args.out) {
  // Always resolved under the OS temp directory so no evidence file can
  // ever land inside the repository, regardless of the value passed in.
  const outPath = path.join(tmpdir(), path.basename(args.out));
  writeFileSync(outPath, JSON.stringify(evidenceBundle, null, 2), "utf8");
  console.log(`evidence written to: ${outPath}`);
} else {
  console.log("--- EVIDENCE JSON ---");
  console.log(JSON.stringify(evidenceBundle, null, 2));
}

process.exitCode = dryRunPassed ? 0 : 1;
