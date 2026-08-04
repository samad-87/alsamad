/**
 * M5.2 immutable import manifest builder and validator.
 *
 * Manifests are plain frozen data, never persisted to a database and never
 * containing credentials. See ALSAMAD_DATABASE_ARCHITECTURE.md section 5.3.10
 * for the authoritative field contract.
 */
import { createHash } from "node:crypto";

import {
  type AttributionDecision,
  type CheckpointMetadata,
  type CommercialUseDecision,
  type CountMap,
  type ImportManifest,
  type ImportMode,
  type ImportState,
  type LicenseDecision,
  LegalDecisionBlockedError,
  type ManifestDecisionsInput,
  ManifestSecretFieldRejectedError,
  ManifestValidationError,
  type ProviderCode,
  type ProviderEnvironment,
  type QuranResourceType,
  type RedistributionDecision,
  type RetentionDecision,
  type SelectedCanonicalTarget,
  type WithdrawalDeletionStatus,
  isDecisionApproved,
} from "./contracts";

const SHA256_HEX_PATTERN = /^[0-9a-f]{64}$/;

const SECRET_MARKERS: readonly string[] = [
  "password",
  "secret",
  "apikey",
  "api_key",
  "api-key",
  "token",
  "authorization",
  "bearer ",
  "client_secret",
  "private_key",
];

/**
 * Manifests may only request states at or before the license gate while any
 * legal decision remains unresolved. Every later state requires every
 * decision to be explicitly "approved".
 */
const PRE_LEGAL_GATE_STATES: ReadonlySet<ImportState> = new Set([
  "created",
  "awaiting_source_approval",
  "awaiting_license_approval",
  "blocked",
]);

export interface LegalGateEvaluation {
  readonly blocked: boolean;
  readonly reasons: readonly string[];
}

/** Unknown or denied decisions block; only "approved" clears the gate. */
export function evaluateLegalGate(
  decisions: ManifestDecisionsInput,
): LegalGateEvaluation {
  const reasons: string[] = [];
  if (!isDecisionApproved(decisions.license.status)) {
    reasons.push(`license:${decisions.license.status}`);
  }
  if (!isDecisionApproved(decisions.retention.status)) {
    reasons.push(`retention:${decisions.retention.status}`);
  }
  if (!isDecisionApproved(decisions.attribution.status)) {
    reasons.push(`attribution:${decisions.attribution.status}`);
  }
  if (!isDecisionApproved(decisions.commercialUse.status)) {
    reasons.push(`commercial_use:${decisions.commercialUse.status}`);
  }
  if (!isDecisionApproved(decisions.redistribution.status)) {
    reasons.push(`redistribution:${decisions.redistribution.status}`);
  }
  return { blocked: reasons.length > 0, reasons };
}

function sortForCanonicalization(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortForCanonicalization);
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortForCanonicalization(source[key]);
    }
    return sorted;
  }
  return value;
}

/** Deterministic canonical JSON: sorted object keys at every depth. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortForCanonicalization(value));
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function findSecretField(value: unknown, path = ""): string | null {
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    for (const marker of SECRET_MARKERS) {
      if (lower.includes(marker)) {
        return path || "(root)";
      }
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const found = findSecretField(value[index], `${path}[${index}]`);
      if (found) return found;
    }
    return null;
  }
  if (value !== null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      const found = findSecretField(nested, path ? `${path}.${key}` : key);
      if (found) return found;
    }
    return null;
  }
  return null;
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.keys(value as Record<string, unknown>)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

type ManifestFieldsWithoutChecksum = Omit<ImportManifest, "manifestChecksum">;

function computeManifestChecksum(
  fields: ManifestFieldsWithoutChecksum,
): string {
  return sha256Hex(canonicalJson(fields));
}

export interface BuildImportManifestInput {
  readonly manifestId: string;
  readonly providerCode: ProviderCode;
  readonly providerEnvironment: ProviderEnvironment;
  readonly resourceType: QuranResourceType;
  readonly providerResourceId: string;
  readonly providerResourceVersion: string;
  readonly requestedAt: string;
  readonly fetchedAt?: string | null;
  readonly sourceEndpointIdentity: string;
  readonly sourceChecksum: string;
  readonly normalizedChecksum?: string | null;
  readonly decisions: ManifestDecisionsInput;
  readonly selectedCanonicalTarget?: SelectedCanonicalTarget | null;
  readonly expectedCounts?: CountMap;
  readonly actualCounts?: CountMap;
  readonly importMode: ImportMode;
  readonly status: ImportState;
  readonly failureReason?: string | null;
  readonly processIdentity: string;
  readonly softwareVersion: string;
  readonly schemaVersion: number;
  readonly checkpointMetadata?: CheckpointMetadata;
  readonly withdrawalStatus?: WithdrawalDeletionStatus;
  readonly evidenceReferences?: readonly string[];
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireNonBlank(value: string, field: string): void {
  if (value.trim().length === 0) {
    throw new ManifestValidationError(`${field} must not be blank`);
  }
}

/**
 * Builds an immutable, checksummed M5.2 import manifest. Always produces
 * dryRun = true; M5.2 never authorizes a live-activation manifest.
 */
export function buildImportManifest(
  input: BuildImportManifestInput,
): ImportManifest {
  requireNonBlank(input.manifestId, "manifestId");
  if (!UUID_PATTERN.test(input.manifestId)) {
    throw new ManifestValidationError(
      "manifestId must be a UUID-shaped identifier",
    );
  }
  requireNonBlank(input.providerCode, "providerCode");
  if (input.providerCode !== input.providerCode.toLowerCase()) {
    throw new ManifestValidationError("providerCode must be lowercase");
  }
  if (input.providerEnvironment === "production") {
    throw new ManifestValidationError(
      "M5.2 authorizes only sandbox or staging manifests, never production",
    );
  }
  if (!SHA256_HEX_PATTERN.test(input.sourceChecksum)) {
    throw new ManifestValidationError(
      "sourceChecksum must be a lowercase 64-character SHA-256 hex value",
    );
  }
  if (
    input.normalizedChecksum != null &&
    !SHA256_HEX_PATTERN.test(input.normalizedChecksum)
  ) {
    throw new ManifestValidationError(
      "normalizedChecksum must be a lowercase 64-character SHA-256 hex value when present",
    );
  }
  if (!Number.isInteger(input.schemaVersion) || input.schemaVersion < 1) {
    throw new ManifestValidationError(
      "schemaVersion must be a positive integer",
    );
  }
  requireNonBlank(input.processIdentity, "processIdentity");
  requireNonBlank(input.softwareVersion, "softwareVersion");
  requireNonBlank(input.sourceEndpointIdentity, "sourceEndpointIdentity");

  const legalGate = evaluateLegalGate(input.decisions);
  if (legalGate.blocked && !PRE_LEGAL_GATE_STATES.has(input.status)) {
    throw new LegalDecisionBlockedError(legalGate.reasons);
  }

  const fieldsWithoutChecksum: ManifestFieldsWithoutChecksum = {
    manifestId: input.manifestId,
    providerCode: input.providerCode,
    providerEnvironment: input.providerEnvironment,
    resourceType: input.resourceType,
    providerResourceId: input.providerResourceId,
    providerResourceVersion: input.providerResourceVersion,
    requestedAt: input.requestedAt,
    fetchedAt: input.fetchedAt ?? null,
    sourceEndpointIdentity: input.sourceEndpointIdentity,
    sourceChecksum: input.sourceChecksum,
    normalizedChecksum: input.normalizedChecksum ?? null,
    licenseDecisionReference: input.decisions.license.licenseReference,
    retentionDecision: input.decisions.retention,
    attributionDecision: input.decisions.attribution,
    commercialUseDecision: input.decisions.commercialUse,
    redistributionDecision: input.decisions.redistribution,
    selectedCanonicalTarget: input.selectedCanonicalTarget ?? null,
    expectedCounts: input.expectedCounts ?? {},
    actualCounts: input.actualCounts ?? {},
    importMode: input.importMode,
    dryRun: true,
    status: input.status,
    failureReason: input.failureReason ?? null,
    processIdentity: input.processIdentity,
    softwareVersion: input.softwareVersion,
    schemaVersion: input.schemaVersion,
    checkpointMetadata: input.checkpointMetadata ?? {
      attemptCount: 0,
      lastCheckpointToken: null,
      lastCheckpointAt: null,
    },
    withdrawalStatus: input.withdrawalStatus ?? "none",
    evidenceReferences: input.evidenceReferences ?? [],
  };

  const secretField = findSecretField(fieldsWithoutChecksum);
  if (secretField) {
    throw new ManifestSecretFieldRejectedError(secretField);
  }

  const manifestChecksum = computeManifestChecksum(fieldsWithoutChecksum);
  const manifest: ImportManifest = {
    ...fieldsWithoutChecksum,
    manifestChecksum,
  };
  return deepFreeze(manifest);
}

/** Recomputes the manifest checksum and compares it to the stored value. */
export function verifyManifestChecksum(manifest: ImportManifest): boolean {
  const { manifestChecksum: storedChecksum, ...rest } = manifest;
  return computeManifestChecksum(rest) === storedChecksum;
}

export type {
  AttributionDecision,
  CommercialUseDecision,
  LicenseDecision,
  RedistributionDecision,
  RetentionDecision,
};
