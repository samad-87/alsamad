/**
 * M5.2 provider-independent reconciliation engine.
 *
 * Pure functions over synthetic expected/actual record sets. No network, no
 * database, no filesystem. See ALSAMAD_DATABASE_ARCHITECTURE.md section
 * 5.3.11 for the authoritative reconciliation-evidence contract.
 */
import {
  type AttributionDecision,
  type ChecksumDriftEntry,
  type LicenseDecision,
  type NormalizedAyahRecord,
  type NormalizedSurahRecord,
  type NormalizedTranslationRecord,
  type ProviderResourceIdentity,
  type ReconciliationMetrics,
  type ReconciliationResult,
  type RetentionDecision,
  type WithdrawalOrDeletionSignal,
  type OpaqueResourceMetadata,
  type ReconciliationMismatchCategory,
  isDecisionApproved,
} from "./contracts";

export interface ExpectedSurah {
  readonly surahNumber: number;
  readonly ayahCount: number;
  readonly checksum: string;
}

export interface ExpectedAyah {
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly globalSequenceNumber: number;
  readonly checksum: string;
}

export interface ExpectedTranslationCoverage {
  readonly expectedLocaleCodes: readonly string[];
  readonly actualLocaleCodes: readonly string[];
}

export interface RetentionComplianceCheck {
  readonly fetchedAt: string;
  readonly asOf: string;
}

export interface ReconciliationInput {
  readonly expectedSurahs: readonly ExpectedSurah[];
  readonly actualSurahs: readonly NormalizedSurahRecord[];
  readonly expectedAyahs: readonly ExpectedAyah[];
  readonly actualAyahs: readonly NormalizedAyahRecord[];
  readonly actualTranslations?: readonly NormalizedTranslationRecord[];
  readonly translationCoverage?: ExpectedTranslationCoverage;
  readonly withdrawnOrDeleted?: readonly WithdrawalOrDeletionSignal[];
  readonly license: LicenseDecision;
  readonly attribution: AttributionDecision;
  readonly retention: RetentionDecision;
  readonly retentionCompliance?: RetentionComplianceCheck;
  readonly expectedMetadata?: OpaqueResourceMetadata;
  readonly actualMetadata?: OpaqueResourceMetadata;
}

/** In-memory disposable staging: commit is intentionally impossible in M5.2A. */
export class DisposableImportStaging<T> {
  private records: T[] = [];
  private version: string | null = null;

  stage(version: string, records: readonly T[]): void {
    if (this.version !== null && this.version !== version) {
      throw new Error("mixed-version staging is prohibited");
    }
    this.version = version;
    this.records.push(...structuredClone(records));
  }

  snapshot(): readonly T[] {
    return structuredClone(this.records);
  }

  rollback(): { readonly discardedCount: number; readonly canonicalWrites: 0 } {
    const discardedCount = this.records.length;
    this.records = [];
    this.version = null;
    return { discardedCount, canonicalWrites: 0 };
  }
}

function providerAliasKey(alias: ProviderResourceIdentity): string {
  return `${alias.providerCode}:${alias.resourceType}:${alias.providerResourceId}:${alias.providerResourceVersion}`;
}

export function reconcile(input: ReconciliationInput): ReconciliationResult {
  const blockingErrors: string[] = [];
  const warnings: string[] = [];
  const unmatchedRecords: string[] = [];
  const duplicateRecords: string[] = [];
  const checksumDrift: ChecksumDriftEntry[] = [];
  const mismatchCategories = new Set<ReconciliationMismatchCategory>();
  const block = (
    category: ReconciliationMismatchCategory,
    message: string,
  ): void => {
    mismatchCategories.add(category);
    blockingErrors.push(message);
  };
  if (
    input.actualSurahs.length !== input.expectedSurahs.length ||
    input.actualAyahs.length !== input.expectedAyahs.length
  ) {
    mismatchCategories.add("count");
  }

  const expectedSurahByNumber = new Map(
    input.expectedSurahs.map((surah) => [surah.surahNumber, surah]),
  );
  const actualSurahLocatorCounts = new Map<string, number>();
  for (const surah of input.actualSurahs) {
    actualSurahLocatorCounts.set(
      surah.canonicalLocator,
      (actualSurahLocatorCounts.get(surah.canonicalLocator) ?? 0) + 1,
    );
  }
  for (const [locator, count] of actualSurahLocatorCounts) {
    if (count > 1) {
      duplicateRecords.push(locator);
      block("duplicate", `duplicate canonical locator: ${locator}`);
    }
  }

  const seenSurahNumbers = new Set<number>();
  for (const surah of input.actualSurahs) {
    seenSurahNumbers.add(surah.surahNumber);
    const expected = expectedSurahByNumber.get(surah.surahNumber);
    if (!expected) {
      unmatchedRecords.push(providerAliasKey(surah.providerAlias));
      block(
        "orphaned",
        `orphan provider surah record: ${surah.canonicalLocator}`,
      );
      continue;
    }
    if (expected.checksum !== surah.checksum) {
      checksumDrift.push({
        locator: surah.canonicalLocator,
        expected: expected.checksum,
        actual: surah.checksum,
      });
      block("checksum", `checksum mismatch for ${surah.canonicalLocator}`);
    }
  }
  for (const expected of input.expectedSurahs) {
    if (!seenSurahNumbers.has(expected.surahNumber)) {
      block(
        "missing",
        `missing canonical locator: surah:${expected.surahNumber}`,
      );
    }
  }

  const expectedAyahByKey = new Map(
    input.expectedAyahs.map((ayah) => [
      `${ayah.surahNumber}:${ayah.ayahNumber}`,
      ayah,
    ]),
  );
  const actualAyahLocatorCounts = new Map<string, number>();
  for (const ayah of input.actualAyahs) {
    actualAyahLocatorCounts.set(
      ayah.canonicalLocator,
      (actualAyahLocatorCounts.get(ayah.canonicalLocator) ?? 0) + 1,
    );
  }
  for (const [locator, count] of actualAyahLocatorCounts) {
    if (count > 1) {
      duplicateRecords.push(locator);
      block("duplicate", `duplicate canonical locator: ${locator}`);
    }
  }

  const perSurahCounts = new Map<
    number,
    { expected: number; actual: number }
  >();
  for (const expected of input.expectedSurahs) {
    perSurahCounts.set(expected.surahNumber, {
      expected: expected.ayahCount,
      actual: 0,
    });
  }

  const seenAyahKeys = new Set<string>();
  for (const ayah of input.actualAyahs) {
    const key = `${ayah.surahNumber}:${ayah.ayahNumber}`;
    seenAyahKeys.add(key);
    const bucket = perSurahCounts.get(ayah.surahNumber);
    if (bucket) {
      bucket.actual += 1;
    }
    const expected = expectedAyahByKey.get(key);
    if (!expected) {
      unmatchedRecords.push(providerAliasKey(ayah.providerAlias));
      block(
        "orphaned",
        `orphan provider ayah record: ${ayah.canonicalLocator}`,
      );
      continue;
    }
    if (expected.checksum !== ayah.checksum) {
      checksumDrift.push({
        locator: ayah.canonicalLocator,
        expected: expected.checksum,
        actual: ayah.checksum,
      });
      block("checksum", `checksum mismatch for ${ayah.canonicalLocator}`);
    }
  }
  for (const expected of input.expectedAyahs) {
    const key = `${expected.surahNumber}:${expected.ayahNumber}`;
    if (!seenAyahKeys.has(key)) {
      block(
        "missing",
        `missing canonical locator: ayah:${expected.surahNumber}:${expected.ayahNumber}`,
      );
    }
  }
  for (const [surahNumber, bucket] of perSurahCounts) {
    if (bucket.expected !== bucket.actual) {
      block(
        "count",
        `per-surah ayah count mismatch for surah ${surahNumber}: expected ${bucket.expected}, actual ${bucket.actual}`,
      );
    }
  }

  const sortedSequences = input.actualAyahs
    .map((ayah) => ayah.globalSequenceNumber)
    .sort((a, b) => a - b);
  for (let index = 0; index < sortedSequences.length; index += 1) {
    const expectedSequence = index + 1;
    if (sortedSequences[index] !== expectedSequence) {
      block(
        "locator",
        `global sequence gap detected at position ${expectedSequence}`,
      );
      break;
    }
  }

  if (input.translationCoverage) {
    const actualLocales = new Set(input.translationCoverage.actualLocaleCodes);
    for (const locale of input.translationCoverage.expectedLocaleCodes) {
      if (!actualLocales.has(locale)) {
        warnings.push(`translation coverage missing for locale: ${locale}`);
      }
    }
  }

  if (input.withdrawnOrDeleted && input.withdrawnOrDeleted.length > 0) {
    const withdrawnKeys = new Set(
      input.withdrawnOrDeleted.map((signal) =>
        providerAliasKey(signal.providerResource),
      ),
    );
    for (const surah of input.actualSurahs) {
      if (withdrawnKeys.has(providerAliasKey(surah.providerAlias))) {
        block(
          "withdrawn",
          `withdrawn/deleted provider record still present: ${surah.canonicalLocator}`,
        );
      }
    }
    for (const ayah of input.actualAyahs) {
      if (withdrawnKeys.has(providerAliasKey(ayah.providerAlias))) {
        block(
          "withdrawn",
          `withdrawn/deleted provider record still present: ${ayah.canonicalLocator}`,
        );
      }
    }
  }

  if (!isDecisionApproved(input.license.status)) {
    block("license", `license decision incomplete: ${input.license.status}`);
  }
  if (!isDecisionApproved(input.attribution.status)) {
    block(
      "attribution",
      `attribution decision incomplete: ${input.attribution.status}`,
    );
  }

  if (!isDecisionApproved(input.retention.status)) {
    block(
      "retention",
      `retention decision incomplete: ${input.retention.status}`,
    );
  } else if (
    input.retention.policy === "time_limited" &&
    input.retention.retentionDays != null &&
    input.retentionCompliance
  ) {
    const elapsedDays =
      (Date.parse(input.retentionCompliance.asOf) -
        Date.parse(input.retentionCompliance.fetchedAt)) /
      (1000 * 60 * 60 * 24);
    if (elapsedDays > input.retention.retentionDays) {
      block(
        "retention",
        `retention window exceeded: ${elapsedDays.toFixed(2)} days elapsed against a ${input.retention.retentionDays}-day limit`,
      );
    }
  }

  if (input.expectedMetadata && input.actualMetadata) {
    if (
      JSON.stringify(input.expectedMetadata.attribution) !==
      JSON.stringify(input.actualMetadata.attribution)
    ) {
      block("attribution", "opaque attribution metadata mismatch");
    }
    if (
      JSON.stringify(input.expectedMetadata.provenance) !==
      JSON.stringify(input.actualMetadata.provenance)
    ) {
      block("provenance", "opaque provenance metadata mismatch");
    }
  }

  if (
    input.actualSurahs.length > input.expectedSurahs.length ||
    input.actualAyahs.length > input.expectedAyahs.length
  ) {
    mismatchCategories.add("extra");
  }

  const metrics: ReconciliationMetrics = {
    expectedSurahCount: input.expectedSurahs.length,
    actualSurahCount: seenSurahNumbers.size,
    expectedAyahCount: input.expectedAyahs.length,
    actualAyahCount: seenAyahKeys.size,
    perSurahAyahCounts: Object.fromEntries(
      Array.from(perSurahCounts.entries(), ([surahNumber, bucket]) => [
        String(surahNumber),
        bucket,
      ]),
    ),
  };

  return {
    blockingErrors,
    warnings,
    metrics,
    unmatchedRecords,
    duplicateRecords,
    checksumDrift,
    mismatchCategories: [...mismatchCategories].sort(),
    publicationEligible: false,
  };
}
