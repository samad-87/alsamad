/**
 * M5.2 Quran.Foundation adapter shell.
 *
 * Every method that would require live provider access throws
 * ProviderAccessNotAuthorizedError. The remaining methods are pure and
 * operate only on data the caller already holds (synthetic fixtures during
 * a dry run). This adapter never publishes, persists, or activates content,
 * and never converts a provider identity directly into a canonical UUID.
 */
import {
  ProviderAccessNotAuthorizedError,
  type AttributionDecision,
  type CountMap,
  type NormalizedQuranRecord,
  type ProviderRecordEnvelope,
  type ProviderResourceIdentity,
  type ProviderVersionToken,
  type QuranContentProviderAdapter,
  type QuranResourceType,
  type ValidationResult,
  type WithdrawalOrDeletionSignal,
  RetryExhaustedError,
} from "../../quran/import/contracts";
import type { QuranFoundationAdapterConfig } from "./types";

const PROVIDER_CODE = "quran-foundation";

export type SyntheticFailureCategory =
  "timeout" | "rate_limited" | "transient" | "sustained_failure";

export interface RetryPolicy {
  readonly maxAttempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
}

export interface RetryEvidence<T> {
  readonly value: T;
  readonly attempts: number;
  readonly delaysMs: readonly number[];
}

/** Executes only an injected operation. This helper owns no URL or network client. */
export async function executeInjectedWithRetry<T>(
  operation: (attempt: number) => Promise<T>,
  classify: (error: unknown) => SyntheticFailureCategory,
  policy: RetryPolicy,
  wait: (delayMs: number) => Promise<void> = async () => undefined,
): Promise<RetryEvidence<T>> {
  if (
    !Number.isSafeInteger(policy.maxAttempts) ||
    policy.maxAttempts < 1 ||
    policy.maxAttempts > 10 ||
    !Number.isFinite(policy.baseDelayMs) ||
    policy.baseDelayMs < 0 ||
    !Number.isFinite(policy.maxDelayMs) ||
    policy.maxDelayMs < policy.baseDelayMs
  ) {
    throw new Error("retry policy must be finite, non-negative, and bounded");
  }
  const delaysMs: number[] = [];
  let lastCategory: SyntheticFailureCategory = "sustained_failure";
  for (let attempt = 1; attempt <= policy.maxAttempts; attempt += 1) {
    try {
      return { value: await operation(attempt), attempts: attempt, delaysMs };
    } catch (error) {
      lastCategory = classify(error);
      if (
        attempt === policy.maxAttempts ||
        lastCategory === "sustained_failure"
      )
        break;
      const delay = Math.min(
        policy.baseDelayMs * 2 ** (attempt - 1),
        policy.maxDelayMs,
      );
      delaysMs.push(delay);
      await wait(delay);
    }
  }
  throw new RetryExhaustedError(lastCategory);
}

function isNonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export class QuranFoundationAdapter implements QuranContentProviderAdapter {
  private closed = false;

  constructor(config: QuranFoundationAdapterConfig) {
    if (
      !isNonBlank(config.processIdentity) ||
      !isNonBlank(config.softwareVersion)
    ) {
      throw new Error(
        "QuranFoundationAdapter requires a non-blank processIdentity and softwareVersion",
      );
    }
  }

  async discoverResources(): Promise<readonly ProviderResourceIdentity[]> {
    throw new ProviderAccessNotAuthorizedError("discoverResources");
  }

  async fetchResourceMetadata(): Promise<Record<string, unknown>> {
    throw new ProviderAccessNotAuthorizedError("fetchResourceMetadata");
  }

  async fetchBatch(): Promise<{
    readonly records: readonly ProviderRecordEnvelope[];
    readonly nextCursor: string | null;
  }> {
    throw new ProviderAccessNotAuthorizedError("fetchBatch");
  }

  normalizeProviderRecord(
    envelope: ProviderRecordEnvelope,
  ): NormalizedQuranRecord {
    this.assertNotClosed();
    if (envelope.providerCode !== PROVIDER_CODE) {
      throw new Error(
        `unexpected provider code for this adapter: ${envelope.providerCode}`,
      );
    }
    const payload = envelope.payload as Record<string, unknown>;
    const alias: ProviderResourceIdentity = {
      providerCode: envelope.providerCode,
      resourceType: envelope.resourceType,
      providerResourceId: envelope.providerResourceId,
      providerResourceVersion: envelope.providerResourceVersion,
    };

    switch (envelope.resourceType) {
      case "surah":
        return {
          kind: "surah",
          canonicalLocator: String(payload.canonicalLocator),
          surahNumber: Number(payload.surahNumber),
          ayahCount: Number(payload.ayahCount),
          checksum: String(payload.checksum),
          providerAlias: alias,
        };
      case "ayah":
        return {
          kind: "ayah",
          canonicalLocator: String(payload.canonicalLocator),
          surahNumber: Number(payload.surahNumber),
          ayahNumber: Number(payload.ayahNumber),
          globalSequenceNumber: Number(payload.globalSequenceNumber),
          checksum: String(payload.checksum),
          providerAlias: alias,
        };
      case "translation_text":
        return {
          kind: "translation",
          canonicalLocator: String(payload.canonicalLocator),
          localeCode: String(payload.localeCode),
          surahNumber: Number(payload.surahNumber),
          ayahNumber: Number(payload.ayahNumber),
          checksum: String(payload.checksum),
          providerAlias: alias,
        };
      default:
        throw new Error(
          `normalizeProviderRecord does not support resourceType "${envelope.resourceType}" in M5.2`,
        );
    }
  }

  mapProviderIdentity(record: NormalizedQuranRecord): {
    readonly alias: ProviderResourceIdentity;
    readonly proposedCanonicalLocator: string | null;
  } {
    this.assertNotClosed();
    // Only a canonical locator string is ever proposed here. No UUID is
    // generated or assigned; canonical identity allocation happens only in
    // a separately authorized, database-backed import stage beyond M5.2.
    return {
      alias: record.providerAlias,
      proposedCanonicalLocator: record.canonicalLocator,
    };
  }

  validateProviderRecord(record: NormalizedQuranRecord): ValidationResult {
    this.assertNotClosed();
    const violations: string[] = [];
    if (!isNonBlank(record.canonicalLocator)) {
      violations.push("canonicalLocator must not be blank");
    }
    if (!isNonBlank(record.checksum)) {
      violations.push("checksum must not be blank");
    }
    if (record.kind === "surah") {
      if (
        !Number.isInteger(record.surahNumber) ||
        record.surahNumber < 1 ||
        record.surahNumber > 114
      ) {
        violations.push("surahNumber must be between 1 and 114");
      }
      if (!Number.isInteger(record.ayahCount) || record.ayahCount < 1) {
        violations.push("ayahCount must be a positive integer");
      }
    }
    if (record.kind === "ayah") {
      if (!Number.isInteger(record.ayahNumber) || record.ayahNumber < 1) {
        violations.push("ayahNumber must be a positive integer");
      }
      if (
        !Number.isInteger(record.globalSequenceNumber) ||
        record.globalSequenceNumber < 1
      ) {
        violations.push("globalSequenceNumber must be a positive integer");
      }
    }
    if (record.kind === "translation" && !isNonBlank(record.localeCode)) {
      violations.push("localeCode must not be blank");
    }
    return { valid: violations.length === 0, violations };
  }

  async getVersionToken(): Promise<ProviderVersionToken> {
    throw new ProviderAccessNotAuthorizedError("getVersionToken");
  }

  async getDeletionOrWithdrawalSignals(): Promise<
    readonly WithdrawalOrDeletionSignal[]
  > {
    throw new ProviderAccessNotAuthorizedError(
      "getDeletionOrWithdrawalSignals",
    );
  }

  verifyCompleteness(
    resourceType: QuranResourceType,
    expectedCounts: CountMap,
    actualCounts: CountMap,
  ): ValidationResult {
    this.assertNotClosed();
    const violations: string[] = [];
    for (const [key, expected] of Object.entries(expectedCounts)) {
      const actual = actualCounts[key] ?? 0;
      if (actual !== expected) {
        violations.push(
          `count mismatch for "${resourceType}:${key}": expected ${expected}, actual ${actual}`,
        );
      }
    }
    return { valid: violations.length === 0, violations };
  }

  async produceAttribution(): Promise<AttributionDecision> {
    throw new ProviderAccessNotAuthorizedError("produceAttribution");
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  private assertNotClosed(): void {
    if (this.closed) {
      throw new Error("QuranFoundationAdapter has been closed");
    }
  }
}
