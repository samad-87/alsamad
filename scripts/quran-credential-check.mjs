/**
 * M5.2C — Local Pre-Production Credential Validation Script
 * (ALSAMAD_IMPLEMENTATION_ROADMAP.md).
 *
 * A thin, server-only CLI wrapper around the already-implemented M5.2B
 * credential functions in src/lib/providers/quran-foundation/env.ts. It
 * performs zero network access: no HTTP client, no fetch, no OAuth call,
 * no DNS requirement, no Quran.Foundation endpoint of any kind. It never
 * marks provider-side credential validation PASS; `provider_network_validation`
 * is always exactly the literal `not_performed`.
 *
 * Refuses to operate on `QURAN_FOUNDATION_ENVIRONMENT=production` before
 * ever calling the shared credential functions, so it never reads or
 * reports on the Production Client ID/Client Secret pair.
 *
 * Prints only the Roadmap's safe key=value output contract: environment,
 * credential_config, an optional reason code from a closed set,
 * client_id_present, client_secret_present, server_only, and
 * provider_network_validation. Never a Client ID value, Client Secret
 * value, token, length, prefix, suffix, hash, fingerprint, or masked
 * fragment of either.
 */
import { buildCredentialGateEvidence } from "../src/lib/providers/quran-foundation/env.ts";

const ENVIRONMENT_SELECTOR_KEY = "QURAN_FOUNDATION_ENVIRONMENT";
const SANDBOX_CLIENT_ID_KEY = "QURAN_FOUNDATION_SANDBOX_CLIENT_ID";
const SANDBOX_CLIENT_SECRET_KEY = "QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET";

function isNonBlank(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Classifies an error already thrown by the shared M5.2B function into one
 * of the Roadmap's closed reason codes, by matching against the fixed,
 * already-committed error-message text those functions throw (which itself
 * names only environment-variable names, never a value). This performs no
 * credential validation of its own -- the accept/reject decision already
 * happened inside the shared function; this only chooses which safe label
 * to print for a failure that already occurred.
 */
function classifyFailureReason(error, selectorRaw) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes(SANDBOX_CLIENT_SECRET_KEY)) {
    return "missing_client_secret";
  }
  if (message.includes(SANDBOX_CLIENT_ID_KEY)) {
    return "missing_client_id";
  }
  return isNonBlank(selectorRaw) ? "invalid_selector" : "missing_selector";
}

function printResult(fields) {
  for (const [key, value] of Object.entries(fields)) {
    console.log(`${key}=${value}`);
  }
}

function main() {
  const selectorRaw = process.env[ENVIRONMENT_SELECTOR_KEY];

  // Pre-Production-only guard: intercepted before the shared function ever
  // runs, so the Production Client ID/Client Secret pair is never read.
  if (selectorRaw === "production") {
    printResult({
      environment: "production",
      credential_config: "refused",
      reason: "production_not_authorized_by_this_script",
      client_id_present: false,
      client_secret_present: false,
      server_only: true,
      provider_network_validation: "not_performed",
    });
    process.exitCode = 1;
    return;
  }

  // Presence booleans are derived independently of the shared function's
  // accept/reject outcome, from the same trivial non-blank check the shared
  // function itself performs internally -- used here only for accurate
  // reporting, never to make the validation decision.
  const selectorIsSandbox = selectorRaw === "sandbox";
  const clientIdPresent =
    selectorIsSandbox && isNonBlank(process.env[SANDBOX_CLIENT_ID_KEY]);
  const clientSecretPresent =
    selectorIsSandbox && isNonBlank(process.env[SANDBOX_CLIENT_SECRET_KEY]);

  try {
    buildCredentialGateEvidence(process.env);
    printResult({
      environment: "sandbox",
      credential_config: "valid",
      client_id_present: true,
      client_secret_present: true,
      server_only: true,
      provider_network_validation: "not_performed",
    });
  } catch (error) {
    const reason = classifyFailureReason(error, selectorRaw);
    printResult({
      environment: selectorIsSandbox ? "sandbox" : "unknown",
      credential_config: "invalid",
      reason,
      client_id_present: clientIdPresent,
      client_secret_present: clientSecretPresent,
      server_only: true,
      provider_network_validation: "not_performed",
    });
    process.exitCode = 1;
  }
}

main();
