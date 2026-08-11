/**
 * Server-only Quran.Foundation credential boundary (M5.2B,
 * ALSAMAD_IMPLEMENTATION_ROADMAP.md). Reads exactly the normative
 * environment-variable names that unit committed:
 *
 *   QURAN_FOUNDATION_ENVIRONMENT
 *   QURAN_FOUNDATION_SANDBOX_CLIENT_ID
 *   QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET
 *   QURAN_FOUNDATION_PRODUCTION_CLIENT_ID
 *   QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET
 *
 * No alias, legacy name, or publicly-exposed variant is read. The selector
 * has no default; a missing or unrecognized value fails closed. Only the two
 * variables for the explicitly selected environment are ever read — the
 * other environment's pair is never touched, so cross-environment fallback
 * is structurally impossible, not merely policy. This module must never be
 * imported from client/browser code; it throws immediately if evaluated in
 * a browser context.
 */
import type {
  QuranFoundationCredentials,
  QuranFoundationProviderEnvironment,
} from "./types";

if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/providers/quran-foundation/env.ts must never be evaluated in a browser context.",
  );
}

const ENVIRONMENT_SELECTOR_KEY = "QURAN_FOUNDATION_ENVIRONMENT";

const ALLOWED_ENVIRONMENT_VALUES: ReadonlySet<QuranFoundationProviderEnvironment> =
  new Set(["sandbox", "production"]);

const CREDENTIAL_ENV_KEYS: Readonly<
  Record<
    QuranFoundationProviderEnvironment,
    { readonly clientId: string; readonly clientSecret: string }
  >
> = {
  sandbox: {
    clientId: "QURAN_FOUNDATION_SANDBOX_CLIENT_ID",
    clientSecret: "QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET",
  },
  production: {
    clientId: "QURAN_FOUNDATION_PRODUCTION_CLIENT_ID",
    clientSecret: "QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET",
  },
};

function isNonBlank(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAllowedEnvironment(
  value: string,
): value is QuranFoundationProviderEnvironment {
  return ALLOWED_ENVIRONMENT_VALUES.has(
    value as QuranFoundationProviderEnvironment,
  );
}

/**
 * Reads and structurally validates the credential pair for exactly the
 * environment named by `QURAN_FOUNDATION_ENVIRONMENT`. Throws (fails
 * closed) on a missing/unrecognized selector or on a missing/blank
 * credential value for that selected environment. Every thrown message
 * names only environment-variable names, never a value.
 */
export function readQuranFoundationCredentials(
  source: NodeJS.ProcessEnv = process.env,
): QuranFoundationCredentials {
  const selector = source[ENVIRONMENT_SELECTOR_KEY];
  if (!isNonBlank(selector) || !isAllowedEnvironment(selector)) {
    throw new Error(
      `${ENVIRONMENT_SELECTOR_KEY} must be explicitly set to exactly "sandbox" or "production"; it must never be left unset or defaulted.`,
    );
  }
  const environment = selector;
  const keys = CREDENTIAL_ENV_KEYS[environment];
  const clientId = source[keys.clientId];
  const clientSecret = source[keys.clientSecret];
  if (!isNonBlank(clientId)) {
    throw new Error(
      `${keys.clientId} is required for the selected Quran.Foundation environment (${environment}) and is missing or blank.`,
    );
  }
  if (!isNonBlank(clientSecret)) {
    throw new Error(
      `${keys.clientSecret} is required for the selected Quran.Foundation environment (${environment}) and is missing or blank.`,
    );
  }
  return { environment, clientId, clientSecret };
}

export interface CredentialGateEvidence {
  readonly environment: QuranFoundationProviderEnvironment;
  readonly clientIdPresent: true;
  readonly clientSecretPresent: true;
  readonly structurallyValid: true;
  readonly serverOnly: true;
  readonly networkValidation: "pending";
  readonly evaluatedAt: string;
}

/**
 * M5.2B Gate-2 evidence: proves the local credential boundary is correctly
 * configured (environment known, both values present, structurally valid,
 * server-only) without ever performing or claiming provider-side network
 * validation. Every field is a safe literal constructed by this function —
 * never a spread of the credential object — so a secret value cannot reach
 * this object even by future accident. Throws (fails closed) under the
 * same conditions as `readQuranFoundationCredentials`.
 */
export function buildCredentialGateEvidence(
  source: NodeJS.ProcessEnv = process.env,
): CredentialGateEvidence {
  const credentials = readQuranFoundationCredentials(source);
  return {
    environment: credentials.environment,
    clientIdPresent: true,
    clientSecretPresent: true,
    structurallyValid: true,
    serverOnly: true,
    networkValidation: "pending",
    evaluatedAt: new Date().toISOString(),
  };
}
