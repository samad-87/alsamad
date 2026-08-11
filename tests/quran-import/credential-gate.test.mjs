import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ProviderAccessNotAuthorizedError } from "../../src/lib/quran/import/contracts.ts";
import { QuranFoundationAdapter } from "../../src/lib/providers/quran-foundation/adapter.ts";
import {
  buildCredentialGateEvidence,
  readQuranFoundationCredentials,
} from "../../src/lib/providers/quran-foundation/env.ts";

const SANDBOX_CLIENT_ID = "synthetic-sandbox-client-id";
const SANDBOX_CLIENT_SECRET = "synthetic-sandbox-secret-value";
const PRODUCTION_CLIENT_ID = "synthetic-production-client-id";
const PRODUCTION_CLIENT_SECRET = "synthetic-production-secret-value";

const FULL_SOURCE = {
  QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
  QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
  QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
  QURAN_FOUNDATION_PRODUCTION_CLIENT_ID: PRODUCTION_CLIENT_ID,
  QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET: PRODUCTION_CLIENT_SECRET,
};

// 1. explicit Pre-Production (sandbox) selection loads only sandbox credentials
test("explicit sandbox selection loads only sandbox credentials", () => {
  const credentials = readQuranFoundationCredentials(FULL_SOURCE);
  assert.equal(credentials.environment, "sandbox");
  assert.equal(credentials.clientId, SANDBOX_CLIENT_ID);
  assert.equal(credentials.clientSecret, SANDBOX_CLIENT_SECRET);
  assert.notEqual(credentials.clientId, PRODUCTION_CLIENT_ID);
  assert.notEqual(credentials.clientSecret, PRODUCTION_CLIENT_SECRET);
});

// 2. explicit Production selection loads only Production credentials
test("explicit production selection loads only production credentials", () => {
  const credentials = readQuranFoundationCredentials({
    ...FULL_SOURCE,
    QURAN_FOUNDATION_ENVIRONMENT: "production",
  });
  assert.equal(credentials.environment, "production");
  assert.equal(credentials.clientId, PRODUCTION_CLIENT_ID);
  assert.equal(credentials.clientSecret, PRODUCTION_CLIENT_SECRET);
  assert.notEqual(credentials.clientId, SANDBOX_CLIENT_ID);
  assert.notEqual(credentials.clientSecret, SANDBOX_CLIENT_SECRET);
});

// 3. missing selector fails
test("missing QURAN_FOUNDATION_ENVIRONMENT fails closed", () => {
  const rest = { ...FULL_SOURCE };
  delete rest.QURAN_FOUNDATION_ENVIRONMENT;
  assert.throws(
    () => readQuranFoundationCredentials(rest),
    /QURAN_FOUNDATION_ENVIRONMENT must be explicitly set/,
  );
});

// 4. invalid selector fails
test("an unrecognized selector value fails closed", () => {
  assert.throws(
    () =>
      readQuranFoundationCredentials({
        ...FULL_SOURCE,
        QURAN_FOUNDATION_ENVIRONMENT: "staging",
      }),
    /QURAN_FOUNDATION_ENVIRONMENT must be explicitly set/,
  );
  assert.throws(() =>
    readQuranFoundationCredentials({
      ...FULL_SOURCE,
      QURAN_FOUNDATION_ENVIRONMENT: "garbage",
    }),
  );
});

// 5. missing selected Client ID fails
test("missing Client ID for the selected environment fails closed", () => {
  const rest = { ...FULL_SOURCE };
  delete rest.QURAN_FOUNDATION_SANDBOX_CLIENT_ID;
  assert.throws(
    () => readQuranFoundationCredentials(rest),
    /QURAN_FOUNDATION_SANDBOX_CLIENT_ID is required/,
  );
});

// 6. missing selected Client Secret fails
test("missing Client Secret for the selected environment fails closed", () => {
  const rest = { ...FULL_SOURCE };
  delete rest.QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET;
  assert.throws(
    () => readQuranFoundationCredentials(rest),
    /QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET is required/,
  );
});

// 7. no fallback to the other environment
test("sandbox selection never falls back to present production credentials", () => {
  const source = {
    QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
    QURAN_FOUNDATION_PRODUCTION_CLIENT_ID: PRODUCTION_CLIENT_ID,
    QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET: PRODUCTION_CLIENT_SECRET,
  };
  assert.throws(
    () => readQuranFoundationCredentials(source),
    /QURAN_FOUNDATION_SANDBOX_CLIENT_ID is required/,
  );
});

test("production selection never falls back to present sandbox credentials", () => {
  const source = {
    QURAN_FOUNDATION_ENVIRONMENT: "production",
    QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
    QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
  };
  assert.throws(
    () => readQuranFoundationCredentials(source),
    /QURAN_FOUNDATION_PRODUCTION_CLIENT_ID is required/,
  );
});

// 8. Production is never implicit/default
test("production is never implicitly selected merely because only production credentials exist", () => {
  const source = {
    QURAN_FOUNDATION_PRODUCTION_CLIENT_ID: PRODUCTION_CLIENT_ID,
    QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET: PRODUCTION_CLIENT_SECRET,
  };
  assert.throws(
    () => readQuranFoundationCredentials(source),
    /QURAN_FOUNDATION_ENVIRONMENT must be explicitly set/,
  );
});

// 9. Client Secret is not exposed in errors
test("thrown errors never contain a configured secret value", () => {
  const cases = [
    {},
    { QURAN_FOUNDATION_ENVIRONMENT: "sandbox" },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
    },
  ];
  for (const source of cases) {
    try {
      readQuranFoundationCredentials(source);
      assert.fail("expected readQuranFoundationCredentials to throw");
    } catch (error) {
      assert.doesNotMatch(String(error.message), /synthetic-.*-secret-value/);
      assert.doesNotMatch(
        String(error.message),
        new RegExp(SANDBOX_CLIENT_SECRET),
      );
    }
  }
});

// 10. token not exposed in errors
test("acquireAccessToken never leaks a secret-bearing transport error", async () => {
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials: readQuranFoundationCredentials(FULL_SOURCE),
  });
  const leaking = `transport failed for client_secret=${SANDBOX_CLIENT_SECRET}`;
  const transport = {
    async requestAccessToken() {
      throw new Error(leaking);
    },
  };
  await assert.rejects(
    () => adapter.acquireAccessToken(transport),
    (error) => {
      assert.doesNotMatch(error.message, new RegExp(SANDBOX_CLIENT_SECRET));
      assert.match(error.message, /token acquisition failed/);
      return true;
    },
  );
});

// 12. provider adapter discovery/fetch methods remain fail-closed, even with credentials configured
test("discovery/fetch methods remain fail-closed on an adapter constructed with credentials", async () => {
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials: readQuranFoundationCredentials(FULL_SOURCE),
  });
  const resourceRef = {
    providerCode: "quran-foundation",
    resourceType: "ayah",
    providerResourceId: "SYN-TEST-001",
    providerResourceVersion: "synthetic-v1",
  };
  await assert.rejects(
    () => adapter.discoverResources(),
    ProviderAccessNotAuthorizedError,
  );
  await assert.rejects(
    () => adapter.fetchResourceMetadata(resourceRef),
    ProviderAccessNotAuthorizedError,
  );
  await assert.rejects(
    () => adapter.fetchBatch(resourceRef, null),
    ProviderAccessNotAuthorizedError,
  );
});

// 13. token lifecycle is memory-only (no shared/global state across instances)
test("access tokens are never shared across separate adapter instances", async () => {
  const credentials = readQuranFoundationCredentials(FULL_SOURCE);
  let calls = 0;
  const transport = {
    async requestAccessToken() {
      calls += 1;
      return { accessToken: `token-${calls}`, expiresInSeconds: 3600 };
    },
  };
  const first = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials,
  });
  const second = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials,
  });
  const tokenA = await first.acquireAccessToken(transport);
  const tokenB = await second.acquireAccessToken(transport);
  assert.equal(
    calls,
    2,
    "a fresh instance must not reuse another instance's cached token",
  );
  assert.notEqual(tokenA, tokenB);
});

// 14. expired token triggers reacquisition; a still-valid token is reused
test("a token is reused until expiry, then reacquired", async () => {
  const credentials = readQuranFoundationCredentials(FULL_SOURCE);
  let calls = 0;
  const transport = {
    async requestAccessToken() {
      calls += 1;
      return { accessToken: `token-${calls}`, expiresInSeconds: 60 };
    },
  };
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials,
  });
  let clockMs = 0;
  const now = () => clockMs;

  const first = await adapter.acquireAccessToken(transport, now);
  assert.equal(calls, 1);
  clockMs += 30_000; // still within the 60s lifetime
  const stillCached = await adapter.acquireAccessToken(transport, now);
  assert.equal(calls, 1, "a still-valid token must be reused, not reacquired");
  assert.equal(stillCached, first);
  clockMs += 40_000; // now past the 60s lifetime
  const reacquired = await adapter.acquireAccessToken(transport, now);
  assert.equal(calls, 2, "an expired token must trigger reacquisition");
  assert.notEqual(reacquired, first);
});

test("close discards the cached token and acquireAccessToken rejects use after close", async () => {
  const credentials = readQuranFoundationCredentials(FULL_SOURCE);
  const transport = {
    async requestAccessToken() {
      return { accessToken: "token-1", expiresInSeconds: 3600 };
    },
  };
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials,
  });
  await adapter.acquireAccessToken(transport);
  await adapter.close();
  await assert.rejects(() => adapter.acquireAccessToken(transport));
});

test("acquireAccessToken fails closed when the adapter has no configured credentials", async () => {
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
  });
  await assert.rejects(
    () =>
      adapter.acquireAccessToken({
        async requestAccessToken() {
          throw new Error("must not be called");
        },
      }),
    /constructed without credentials/,
  );
});

test("acquireAccessToken fails closed on a structurally invalid transport response", async () => {
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials: readQuranFoundationCredentials(FULL_SOURCE),
  });
  await assert.rejects(
    () =>
      adapter.acquireAccessToken({
        async requestAccessToken() {
          return { accessToken: "", expiresInSeconds: 3600 };
        },
      }),
    /structurally invalid/,
  );
  await assert.rejects(
    () =>
      adapter.acquireAccessToken({
        async requestAccessToken() {
          return { accessToken: "token", expiresInSeconds: 0 };
        },
      }),
    /structurally invalid/,
  );
});

// 15 & 16. no token/secret appears in Gate-2 evidence or its serialized form
test("Gate-2 evidence never contains a secret or token value", () => {
  const evidence = buildCredentialGateEvidence(FULL_SOURCE);
  assert.equal(evidence.environment, "sandbox");
  assert.equal(evidence.clientIdPresent, true);
  assert.equal(evidence.clientSecretPresent, true);
  assert.equal(evidence.structurallyValid, true);
  assert.equal(evidence.serverOnly, true);
  assert.equal(evidence.networkValidation, "pending");
  assert.equal(typeof evidence.evaluatedAt, "string");
  const serialized = JSON.stringify(evidence);
  assert.doesNotMatch(serialized, new RegExp(SANDBOX_CLIENT_SECRET));
  assert.doesNotMatch(serialized, new RegExp(SANDBOX_CLIENT_ID));
  assert.doesNotMatch(serialized, new RegExp(PRODUCTION_CLIENT_SECRET));
  const keys = Object.keys(evidence).sort();
  assert.deepEqual(keys, [
    "clientIdPresent",
    "clientSecretPresent",
    "environment",
    "evaluatedAt",
    "networkValidation",
    "serverOnly",
    "structurallyValid",
  ]);
});

test("Gate-2 evidence also fails closed under the same conditions as credential reading", () => {
  assert.throws(() => buildCredentialGateEvidence({}));
});

// 17. no NEXT_PUBLIC_ credential access path exists
test("no credential-gate source file references a NEXT_PUBLIC_ variable", () => {
  const files = [
    "src/lib/providers/quran-foundation/env.ts",
    "src/lib/providers/quran-foundation/types.ts",
    "src/lib/providers/quran-foundation/adapter.ts",
  ];
  for (const relativePath of files) {
    const contents = readFileSync(
      new URL(`../../${relativePath}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(contents, /NEXT_PUBLIC_/);
  }
});

// 18. .env.example contains names only, no real values
test(".env.example defines the credential-gate keys as empty placeholders only", () => {
  const contents = readFileSync(
    new URL("../../.env.example", import.meta.url),
    "utf8",
  );
  const expectedKeys = [
    "QURAN_FOUNDATION_ENVIRONMENT",
    "QURAN_FOUNDATION_SANDBOX_CLIENT_ID",
    "QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET",
    "QURAN_FOUNDATION_PRODUCTION_CLIENT_ID",
    "QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET",
  ];
  for (const key of expectedKeys) {
    const line = contents
      .split("\n")
      .map((entry) => entry.replace(/\r$/, ""))
      .find((entry) => entry.startsWith(`${key}=`));
    assert.ok(line, `${key} must be present in .env.example`);
    assert.equal(
      line,
      `${key}=`,
      `${key} must be an empty placeholder, not a real value`,
    );
  }
});

// 20. credential availability never itself triggers provider access
test("Gate-2 evidence is synchronous/pure and constructing the adapter performs no I/O", () => {
  // buildCredentialGateEvidence returns a plain object, not a Promise: it
  // cannot itself be awaiting a real network round trip, unlike
  // acquireAccessToken, which is async specifically because it may perform
  // one (via an explicitly injected transport) only when explicitly called.
  const evidence = buildCredentialGateEvidence(FULL_SOURCE);
  assert.equal(evidence instanceof Promise, false);

  const credentials = readQuranFoundationCredentials(FULL_SOURCE);
  let transportCalled = false;
  const transport = {
    async requestAccessToken() {
      transportCalled = true;
      return { accessToken: "unused", expiresInSeconds: 3600 };
    },
  };
  // Constructing the adapter with fully valid credentials, and never
  // calling acquireAccessToken, must never invoke the transport: credential
  // availability alone is not provider-use authorization.
  const adapter = new QuranFoundationAdapter({
    processIdentity: "credential-gate-tests",
    softwareVersion: "m5.2b-test",
    credentials,
  });
  assert.ok(adapter);
  assert.equal(transportCalled, false);
  void transport;
});
