/**
 * M5.2 provider-independent import contracts.
 *
 * Pure types and error classes only. No I/O, no network access, no database
 * dependency, and no provider credentials. Provider IDs must never become
 * ALSAMAD canonical IDs anywhere in this module tree.
 */

export type ProviderCode = string;

export type ProviderEnvironment = "sandbox" | "staging" | "production";

export type QuranResourceType =
  | "surah"
  | "ayah"
  | "ayah_text"
  | "structural_marker"
  | "translation_edition"
  | "translation_text";

export type ImportMode = "full" | "incremental" | "correction";

export type RetentionPolicy = "permanent" | "time_limited" | "no_storage";

export type WithdrawalDeletionStatus = "none" | "withdrawn" | "deleted";

/** Every legal/rights decision is tri-state; unknown always fails closed. */
export type LegalDecisionStatus = "approved" | "denied" | "unknown";

export const isDecisionApproved = (status: LegalDecisionStatus): boolean =>
  status === "approved";

export interface ProviderIdentity {
  readonly providerCode: ProviderCode;
  readonly providerEnvironment: ProviderEnvironment;
}

export interface ProviderResourceIdentity {
  readonly providerCode: ProviderCode;
  readonly resourceType: QuranResourceType;
  readonly providerResourceId: string;
  readonly providerResourceVersion: string;
}

export interface ProviderVersionToken {
  readonly providerCode: ProviderCode;
  readonly resourceType: QuranResourceType;
  readonly token: string;
  readonly observedAt: string;
}

export interface RetentionDecision {
  readonly policy: RetentionPolicy;
  readonly retentionDays: number | null;
  readonly status: LegalDecisionStatus;
}

export interface LicenseDecision {
  readonly licenseReference: string;
  readonly status: LegalDecisionStatus;
}

export interface AttributionDecision {
  readonly attributionReference: string;
  readonly status: LegalDecisionStatus;
}

export interface IntendedCapabilityDecision {
  readonly status: LegalDecisionStatus;
  /** Whether the manifest's intended operation exercises this capability. */
  readonly intendedUse: boolean;
}

export type ApplicationDisplayDecision = IntendedCapabilityDecision;

export type CommercialUseDecision = IntendedCapabilityDecision;

export type StandaloneRedistributionDecision = IntendedCapabilityDecision;

export interface ManifestDecisionsInput {
  readonly license: LicenseDecision;
  readonly retention: RetentionDecision;
  readonly attribution: AttributionDecision;
  readonly applicationDisplay: ApplicationDisplayDecision;
  readonly commercialUse: CommercialUseDecision;
  readonly standaloneRedistribution: StandaloneRedistributionDecision;
}

export type CountMap = Readonly<Record<string, number>>;

export interface CheckpointMetadata {
  readonly attemptCount: number;
  readonly lastCheckpointToken: string | null;
  readonly lastCheckpointAt: string | null;
}

export interface SelectedCanonicalTarget {
  readonly kind: "edition" | "translation_edition";
  readonly reference: string;
}

/**
 * The 17 exact M5.2 import states. No production activation state
 * ("activated", "published", or similar) is authorized here.
 */
export type ImportState =
  | "created"
  | "awaiting_source_approval"
  | "awaiting_license_approval"
  | "ready"
  | "fetching"
  | "quarantined"
  | "validating"
  | "normalized"
  | "staged"
  | "reconciling"
  | "dry_run_passed"
  | "dry_run_failed"
  | "awaiting_scholarly_approval"
  | "blocked"
  | "withdrawn"
  | "deleted"
  | "expired"
  | "superseded";

/**
 * Exact immutable import manifest fields per
 * ALSAMAD_DATABASE_ARCHITECTURE.md section 5.3.10.
 */
export interface ImportManifest {
  readonly manifestId: string;
  readonly providerCode: ProviderCode;
  readonly providerEnvironment: ProviderEnvironment;
  readonly resourceType: QuranResourceType;
  readonly providerResourceId: string;
  readonly providerResourceVersion: string;
  readonly requestedAt: string;
  readonly fetchedAt: string | null;
  readonly sourceEndpointIdentity: string;
  readonly sourceChecksum: string;
  readonly normalizedChecksum: string | null;
  readonly licenseDecisionReference: string;
  readonly retentionDecision: RetentionDecision;
  readonly attributionDecision: AttributionDecision;
  readonly applicationDisplayDecision: ApplicationDisplayDecision;
  readonly commercialUseDecision: CommercialUseDecision;
  readonly standaloneRedistributionDecision: StandaloneRedistributionDecision;
  readonly selectedCanonicalTarget: SelectedCanonicalTarget | null;
  readonly expectedCounts: CountMap;
  readonly actualCounts: CountMap;
  readonly importMode: ImportMode;
  readonly dryRun: boolean;
  readonly status: ImportState;
  readonly failureReason: string | null;
  readonly processIdentity: string;
  readonly softwareVersion: string;
  readonly schemaVersion: number;
  readonly checkpointMetadata: CheckpointMetadata;
  readonly withdrawalStatus: WithdrawalDeletionStatus;
  readonly evidenceReferences: readonly string[];
  /** Deterministic SHA-256 of the canonical serialization of every field above. */
  readonly manifestChecksum: string;
}

export interface ImportRunKeyInput {
  readonly manifestId: string;
  readonly manifestSchemaVersion: number;
  readonly providerCode: ProviderCode;
  readonly providerSnapshotVersion: string;
  readonly resourceId: string;
  readonly resourceVersion: string;
  readonly adapterVersion: string;
}

export interface ImportCheckpoint {
  readonly runKey: string;
  readonly attemptId: string;
  readonly manifestChecksum: string;
  readonly resourceType: QuranResourceType;
  readonly cursor: string | null;
  readonly byteCount: number;
  readonly rowCount: number;
  readonly rollingChecksum: string;
  readonly status: ImportState;
  readonly recordedAt: string;
  readonly sequence: number;
}

export interface ProviderRecordEnvelope<TPayload = unknown> {
  readonly providerCode: ProviderCode;
  readonly resourceType: QuranResourceType;
  readonly providerResourceId: string;
  readonly providerResourceVersion: string;
  readonly fetchedAt: string;
  readonly payload: TPayload;
}

export interface NormalizedSurahRecord {
  readonly kind: "surah";
  readonly canonicalLocator: string;
  readonly surahNumber: number;
  readonly ayahCount: number;
  readonly checksum: string;
  readonly providerAlias: ProviderResourceIdentity;
}

export interface NormalizedAyahRecord {
  readonly kind: "ayah";
  readonly canonicalLocator: string;
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly globalSequenceNumber: number;
  readonly checksum: string;
  readonly providerAlias: ProviderResourceIdentity;
}

export interface NormalizedTranslationRecord {
  readonly kind: "translation";
  readonly canonicalLocator: string;
  readonly localeCode: string;
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly checksum: string;
  readonly providerAlias: ProviderResourceIdentity;
}

export type NormalizedQuranRecord =
  NormalizedSurahRecord | NormalizedAyahRecord | NormalizedTranslationRecord;

export interface ValidationResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}

export interface ReconciliationMetrics {
  readonly expectedSurahCount: number;
  readonly actualSurahCount: number;
  readonly expectedAyahCount: number;
  readonly actualAyahCount: number;
  readonly perSurahAyahCounts: Readonly<
    Record<string, { readonly expected: number; readonly actual: number }>
  >;
}

export interface ChecksumDriftEntry {
  readonly locator: string;
  readonly expected: string;
  readonly actual: string;
}

export interface ReconciliationResult {
  readonly blockingErrors: readonly string[];
  readonly warnings: readonly string[];
  readonly metrics: ReconciliationMetrics;
  readonly unmatchedRecords: readonly string[];
  readonly duplicateRecords: readonly string[];
  readonly checksumDrift: readonly ChecksumDriftEntry[];
  readonly mismatchCategories: readonly ReconciliationMismatchCategory[];
  readonly publicationEligible: false;
}

export type ReconciliationMismatchCategory =
  | "missing"
  | "extra"
  | "duplicate"
  | "orphaned"
  | "withdrawn"
  | "count"
  | "locator"
  | "checksum"
  | "attribution"
  | "provenance"
  | "retention"
  | "license";

export interface OpaqueResourceMetadata {
  readonly attribution: unknown;
  readonly provenance: unknown;
}

export interface ImportAuditEvent {
  readonly runId: string;
  readonly manifestChecksum: string;
  readonly eventCategory: string;
  readonly outcome: "succeeded" | "blocked" | "failed";
  readonly counts: Readonly<Record<string, number>>;
  readonly durationMs: number;
  readonly errorCategory: string | null;
}

export interface WithdrawalOrDeletionSignal {
  readonly providerResource: ProviderResourceIdentity;
  readonly signalType: "withdrawn" | "deleted";
  readonly observedAt: string;
  readonly reason: string | null;
}

export interface DryRunReportManifestSummary {
  readonly manifestId: string;
  readonly providerCode: ProviderCode;
  readonly resourceType: QuranResourceType;
  readonly providerResourceVersion: string;
  readonly dryRun: true;
}

export type ScholarlyReviewStatus =
  "not_started" | "pending" | "approved" | "rejected";

export interface RollbackEvidence {
  readonly discarded: readonly string[];
  readonly purgedAt: string | null;
}

export interface DryRunReport {
  readonly manifestSummary: DryRunReportManifestSummary;
  readonly providerResourceIdentity: ProviderResourceIdentity;
  readonly expectedCounts: CountMap;
  readonly actualCounts: CountMap;
  readonly sourceChecksum: string;
  readonly normalizedChecksum: string | null;
  readonly warnings: readonly string[];
  readonly blockingErrors: readonly string[];
  readonly reconciliation: ReconciliationResult;
  readonly unmappedRecords: readonly string[];
  readonly duplicateRecords: readonly string[];
  readonly retentionDeadline: string | null;
  readonly licenseDecisionStatus: LegalDecisionStatus;
  readonly scholarlyReviewStatus: ScholarlyReviewStatus;
  readonly publicationEligible: false;
  readonly rollbackEvidence: RollbackEvidence;
}

export interface StateTransitionRecord {
  readonly from: ImportState;
  readonly to: ImportState;
  readonly at: string;
  readonly reason: string | null;
}

export interface EvidenceBundle {
  readonly runKey: string;
  readonly manifestChecksum: string;
  readonly dryRunReport: DryRunReport;
  readonly checkpoints: readonly ImportCheckpoint[];
  readonly stateHistory: readonly StateTransitionRecord[];
  readonly generatedAt: string;
}

/**
 * Provider-independent adapter contract implemented by every provider
 * (Quran.Foundation first). Method-level prohibitions are enforced by
 * concrete adapters, not by this interface alone.
 */
export interface QuranContentProviderAdapter {
  discoverResources(): Promise<readonly ProviderResourceIdentity[]>;
  fetchResourceMetadata(
    resourceRef: ProviderResourceIdentity,
  ): Promise<Record<string, unknown>>;
  fetchBatch(
    resourceRef: ProviderResourceIdentity,
    cursor: string | null,
  ): Promise<{
    readonly records: readonly ProviderRecordEnvelope[];
    readonly nextCursor: string | null;
  }>;
  normalizeProviderRecord(
    envelope: ProviderRecordEnvelope,
  ): NormalizedQuranRecord;
  mapProviderIdentity(record: NormalizedQuranRecord): {
    readonly alias: ProviderResourceIdentity;
    readonly proposedCanonicalLocator: string | null;
  };
  validateProviderRecord(record: NormalizedQuranRecord): ValidationResult;
  getVersionToken(
    resourceRef: ProviderResourceIdentity,
  ): Promise<ProviderVersionToken>;
  getDeletionOrWithdrawalSignals(
    since: string,
  ): Promise<readonly WithdrawalOrDeletionSignal[]>;
  verifyCompleteness(
    resourceType: QuranResourceType,
    expectedCounts: CountMap,
    actualCounts: CountMap,
  ): ValidationResult;
  produceAttribution(
    resourceRef: ProviderResourceIdentity,
  ): Promise<AttributionDecision>;
  close(): Promise<void>;
}

/** Base class for every M5.2 domain error; never carries secret values. */
export class ImportHarnessError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ManifestValidationError extends ImportHarnessError {
  constructor(message: string) {
    super(message, "manifest_validation_error");
  }
}

export class ManifestSecretFieldRejectedError extends ImportHarnessError {
  constructor(field: string) {
    super(
      `manifest field "${field}" was rejected because it matches a secret-like pattern`,
      "manifest_secret_field_rejected",
    );
  }
}

export class LegalDecisionBlockedError extends ImportHarnessError {
  constructor(readonly reasons: readonly string[]) {
    super(
      `manifest blocked by unresolved legal decisions: ${reasons.join(", ")}`,
      "legal_decision_blocked",
    );
  }
}

export class InvalidStateTransitionError extends ImportHarnessError {
  constructor(from: ImportState, to: ImportState) {
    super(
      `invalid import state transition from "${from}" to "${to}"`,
      "invalid_state_transition",
    );
  }
}

export class ProviderAccessNotAuthorizedError extends ImportHarnessError {
  constructor(method: string) {
    super(
      `"${method}" requires live provider network access, which is not authorized in M5.2`,
      "provider_access_not_authorized",
    );
  }
}

export class StaleRunError extends ImportHarnessError {
  constructor(runKey: string) {
    super(
      `import run "${runKey}" is stale and must be cancelled before resuming`,
      "stale_run",
    );
  }
}

export class CheckpointRegressionError extends ImportHarnessError {
  constructor(runKey: string) {
    super(
      `checkpoint for run "${runKey}" cannot move backward`,
      "checkpoint_regression",
    );
  }
}

export class UnknownImportRunError extends ImportHarnessError {
  constructor(runKey: string) {
    super(
      `import run "${runKey}" has no recorded checkpoint`,
      "unknown_import_run",
    );
  }
}

export class CanonicalIdentityViolationError extends ImportHarnessError {
  constructor() {
    super(
      "a provider identity must never be converted directly into an ALSAMAD canonical UUID",
      "canonical_identity_violation",
    );
  }
}

export class ChecksumVerificationError extends ImportHarnessError {
  constructor(category: "malformed" | "mismatch") {
    super(
      `checksum verification failed: ${category}`,
      "checksum_verification_error",
    );
  }
}

export class ImportRunTerminalError extends ImportHarnessError {
  constructor(
    runKey: string,
    category: "cancelled" | "completed" | "superseded",
  ) {
    super(
      `import run "${runKey}" is terminal: ${category}`,
      "import_run_terminal",
    );
  }
}

export class RetryExhaustedError extends ImportHarnessError {
  constructor(
    category: "timeout" | "rate_limited" | "transient" | "sustained_failure",
  ) {
    super(
      `synthetic operation blocked after bounded retries: ${category}`,
      "retry_exhausted",
    );
  }
}
