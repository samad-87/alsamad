import { pathToFileURL } from "node:url";

import { QuranFoundationAdapter } from "../src/lib/providers/quran-foundation/adapter.ts";
import { readQuranFoundationCredentials } from "../src/lib/providers/quran-foundation/env.ts";
import { QuranFoundationPreProductionTokenTransport } from "../src/lib/providers/quran-foundation/token-transport.ts";

const HOST = "prelive-oauth2.quran.foundation";

function value(value) {
  if (value === null) return "not_evaluated";
  return value ? "yes" : "no";
}

function initialEvidence(now) {
  return {
    executed_at: now(),
    environment: "preproduction",
    internal_environment: "sandbox",
    credential_config: "invalid",
    token_endpoint_attempted: "no",
    token_endpoint_host: HOST,
    http_status_class: "not_attempted",
    authentication: "not_attempted",
    token_returned: "no",
    token_type_valid: "not_evaluated",
    scope_valid: "not_evaluated",
    expiry_metadata_valid: "not_evaluated",
    redaction: "pass",
    content_api_calls: 0,
    metadata_discovery_calls: 0,
    resource_calls: 0,
    database_mutations: 0,
    provider_validation: "fail",
  };
}

function emitEvidence(evidence, write) {
  for (const [key, fieldValue] of Object.entries(evidence)) {
    write(`${key}=${fieldValue}`);
  }
}

export async function runTokenCheck(options = {}) {
  const source = options.env ?? process.env;
  const write = options.write ?? ((line) => console.log(line));
  const now = options.now ?? (() => new Date().toISOString());
  const evidence = initialEvidence(now);
  const selector = source.QURAN_FOUNDATION_ENVIRONMENT;

  if (selector !== "sandbox") {
    emitEvidence(evidence, write);
    return 1;
  }

  let adapter;
  let transport;
  try {
    // Snapshot only the already-authorized sandbox selector and keys once.
    // The authoritative reader validates this stable snapshot, so a mutable
    // environment cannot switch selectors or cause Production-key access.
    const credentialSnapshot = {
      QURAN_FOUNDATION_ENVIRONMENT: selector,
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID:
        source.QURAN_FOUNDATION_SANDBOX_CLIENT_ID,
      QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET:
        source.QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET,
    };
    const credentials = readQuranFoundationCredentials(credentialSnapshot);
    evidence.credential_config = "valid";
    transport = options.transportFactory
      ? options.transportFactory({ fetch: options.fetch })
      : new QuranFoundationPreProductionTokenTransport({
          fetch: options.fetch,
        });
    adapter = options.adapterFactory
      ? options.adapterFactory(credentials)
      : new QuranFoundationAdapter({
          processIdentity: "quran-token-check",
          softwareVersion: "M5.2D",
          credentials,
        });
    await adapter.acquireAccessToken(transport);
    const attempt = transport.getLastAttemptEvidence();
    evidence.token_endpoint_attempted = value(attempt.tokenEndpointAttempted);
    evidence.http_status_class = attempt.httpStatusClass;
    evidence.authentication = attempt.authentication;
    evidence.token_returned = value(attempt.tokenReturned);
    evidence.token_type_valid = value(attempt.tokenTypeValid);
    evidence.scope_valid = value(attempt.scopeValid);
    evidence.expiry_metadata_valid = value(attempt.expiryMetadataValid);
    evidence.provider_validation = "pass";
    emitEvidence(evidence, write);
    return 0;
  } catch {
    if (transport) {
      const attempt = transport.getLastAttemptEvidence();
      evidence.token_endpoint_attempted = value(attempt.tokenEndpointAttempted);
      evidence.http_status_class = attempt.httpStatusClass;
      evidence.authentication = attempt.authentication;
      evidence.token_returned = value(attempt.tokenReturned);
      evidence.token_type_valid = value(attempt.tokenTypeValid);
      evidence.scope_valid = value(attempt.scopeValid);
      evidence.expiry_metadata_valid = value(attempt.expiryMetadataValid);
    }
    emitEvidence(evidence, write);
    return 1;
  } finally {
    if (adapter) await adapter.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  process.exitCode = await runTokenCheck();
}
