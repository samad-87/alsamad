import assert from "node:assert/strict";
import test from "node:test";

import { runTokenCheck } from "../../scripts/quran-token-check.mjs";

const sandboxEnv = {
  QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
  QURAN_FOUNDATION_SANDBOX_CLIENT_ID: "cli-synthetic-id",
  QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: "cli-synthetic-secret",
};
const token = "cli-synthetic-token";

function response(payload, status = 200) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "https://prelive-oauth2.quran.foundation/oauth2/token",
    headers: new Headers(),
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    }),
  };
}

function parse(lines) {
  return Object.fromEntries(
    lines.map((line) => line.split(/=(.*)/su).slice(0, 2)),
  );
}

test("missing, invalid, and production selectors fail before fetch", async () => {
  for (const env of [
    {},
    { QURAN_FOUNDATION_ENVIRONMENT: "staging" },
    new Proxy(
      { QURAN_FOUNDATION_ENVIRONMENT: "production" },
      {
        get(target, property) {
          if (String(property).includes("PRODUCTION_CLIENT")) {
            throw new Error("production credential read");
          }
          return target[property];
        },
      },
    ),
  ]) {
    let calls = 0;
    const lines = [];
    const code = await runTokenCheck({
      env,
      fetch: async () => {
        calls += 1;
        return response({});
      },
      write: (line) => lines.push(line),
      now: () => "2026-08-14T00:00:00.000Z",
    });
    assert.equal(code, 1);
    assert.equal(calls, 0);
    assert.equal(parse(lines).token_endpoint_attempted, "no");
  }
});

test("invalid sandbox credentials fail before fetch with safe evidence", async () => {
  let calls = 0;
  const lines = [];
  const code = await runTokenCheck({
    env: { ...sandboxEnv, QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: " " },
    fetch: async () => {
      calls += 1;
      return response({});
    },
    write: (line) => lines.push(line),
    now: () => "2026-08-14T00:00:00.000Z",
  });
  assert.equal(code, 1);
  assert.equal(calls, 0);
  assert.equal(parse(lines).credential_config, "invalid");
});

test("selector and sandbox credentials are resolved once without Production access", async () => {
  const reads = new Map();
  const productionKeys = [
    "QURAN_FOUNDATION_PRODUCTION_CLIENT_ID",
    "QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET",
  ];
  const env = new Proxy(
    {},
    {
      get(_target, property) {
        const key = String(property);
        reads.set(key, (reads.get(key) ?? 0) + 1);
        if (productionKeys.includes(key)) {
          throw new Error("Production credential getter was accessed");
        }
        if (key === "QURAN_FOUNDATION_ENVIRONMENT") {
          return reads.get(key) === 1 ? "sandbox" : "production";
        }
        if (key === "QURAN_FOUNDATION_SANDBOX_CLIENT_ID") {
          return sandboxEnv.QURAN_FOUNDATION_SANDBOX_CLIENT_ID;
        }
        if (key === "QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET") {
          return sandboxEnv.QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET;
        }
        return undefined;
      },
    },
  );
  let calls = 0;
  const code = await runTokenCheck({
    env,
    fetch: async () => {
      calls += 1;
      return response({
        access_token: token,
        token_type: "Bearer",
        expires_in: 60,
        scope: "content",
      });
    },
    write: () => undefined,
    now: () => "2026-08-14T00:00:00.000Z",
  });
  assert.equal(code, 0);
  assert.equal(calls, 1);
  assert.equal(reads.get("QURAN_FOUNDATION_ENVIRONMENT"), 1);
  assert.equal(reads.get("QURAN_FOUNDATION_SANDBOX_CLIENT_ID"), 1);
  assert.equal(reads.get("QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET"), 1);
  for (const key of productionKeys) assert.equal(reads.get(key), undefined);
});

test("a rejected Production selector never accesses any credential getter", async () => {
  const accessed = [];
  const env = new Proxy(
    {},
    {
      get(_target, property) {
        const key = String(property);
        accessed.push(key);
        if (key === "QURAN_FOUNDATION_ENVIRONMENT") return "production";
        throw new Error(`credential getter accessed: ${key}`);
      },
    },
  );
  let calls = 0;
  const code = await runTokenCheck({
    env,
    fetch: async () => {
      calls += 1;
      return response({});
    },
    write: () => undefined,
    now: () => "2026-08-14T00:00:00.000Z",
  });
  assert.equal(code, 1);
  assert.equal(calls, 0);
  assert.deepEqual(accessed, ["QURAN_FOUNDATION_ENVIRONMENT"]);
});

test("valid synthetic credentials make one request and emit only safe PASS evidence", async () => {
  let calls = 0;
  const lines = [];
  const code = await runTokenCheck({
    env: sandboxEnv,
    fetch: async () => {
      calls += 1;
      return response({
        access_token: token,
        token_type: "Bearer",
        expires_in: 60,
        scope: "content",
      });
    },
    write: (line) => lines.push(line),
    now: () => "2026-08-14T00:00:00.000Z",
  });
  assert.equal(code, 0);
  assert.equal(calls, 1);
  assert.deepEqual(parse(lines), {
    executed_at: "2026-08-14T00:00:00.000Z",
    environment: "preproduction",
    internal_environment: "sandbox",
    credential_config: "valid",
    token_endpoint_attempted: "yes",
    token_endpoint_host: "prelive-oauth2.quran.foundation",
    http_status_class: "2xx",
    authentication: "pass",
    token_returned: "yes",
    token_type_valid: "yes",
    scope_valid: "yes",
    expiry_metadata_valid: "yes",
    redaction: "pass",
    content_api_calls: "0",
    metadata_discovery_calls: "0",
    resource_calls: "0",
    database_mutations: "0",
    provider_validation: "pass",
  });
  const output = lines.join("\n");
  for (const forbidden of [
    sandboxEnv.QURAN_FOUNDATION_SANDBOX_CLIENT_ID,
    sandboxEnv.QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET,
    token,
  ]) {
    assert.doesNotMatch(output, new RegExp(forbidden, "u"));
  }
});

test("safe failure evidence is nonzero and contains no provider body", async () => {
  const lines = [];
  const providerBody = "cli-sensitive-provider-body";
  const code = await runTokenCheck({
    env: sandboxEnv,
    fetch: async () => response({ error: providerBody }, 401),
    write: (line) => lines.push(line),
    now: () => "2026-08-14T00:00:00.000Z",
  });
  assert.equal(code, 1);
  const evidence = parse(lines);
  assert.equal(evidence.http_status_class, "4xx");
  assert.equal(evidence.authentication, "fail");
  assert.equal(evidence.provider_validation, "fail");
  const output = lines.join("\n");
  assert.doesNotMatch(output, new RegExp(providerBody, "u"));
  assert.doesNotMatch(output, /Authorization|Basic|access_token/iu);
});

test("adapter closes on success and failure and no excluded method is reached", async () => {
  for (const shouldFail of [false, true]) {
    let closed = 0;
    let acquisitions = 0;
    const adapterFactory = () => ({
      async acquireAccessToken() {
        acquisitions += 1;
        if (shouldFail) throw new Error("safe synthetic failure");
        return token;
      },
      async close() {
        closed += 1;
      },
      async discoverResources() {
        throw new Error("unreachable discovery");
      },
      async fetchResourceMetadata() {
        throw new Error("unreachable metadata");
      },
      async fetchBatch() {
        throw new Error("unreachable resource");
      },
    });
    const transportFactory = () => ({
      async requestAccessToken() {
        throw new Error("adapter fixture owns acquisition result");
      },
      getLastAttemptEvidence() {
        return {
          tokenEndpointAttempted: true,
          httpStatusClass: shouldFail ? "network_error" : "2xx",
          authentication: shouldFail ? "fail" : "pass",
          tokenReturned: !shouldFail,
          tokenTypeValid: shouldFail ? null : true,
          scopeValid: shouldFail ? null : true,
          expiryMetadataValid: shouldFail ? null : true,
        };
      },
    });
    const code = await runTokenCheck({
      env: sandboxEnv,
      adapterFactory,
      transportFactory,
      write: () => undefined,
      now: () => "2026-08-14T00:00:00.000Z",
    });
    assert.equal(code, shouldFail ? 1 : 0);
    assert.equal(acquisitions, 1);
    assert.equal(closed, 1);
  }
});
