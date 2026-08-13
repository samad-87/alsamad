import assert from "node:assert/strict";
import test from "node:test";

import {
  QuranFoundationPreProductionTokenTransport,
  QuranFoundationTokenTransportError,
} from "../../src/lib/providers/quran-foundation/token-transport.ts";

const credentials = {
  environment: "sandbox",
  clientId: "synthetic-client-id",
  clientSecret: "synthetic-client-secret",
};
const token = "synthetic-access-token";
const rawBody = "synthetic-provider-error-body";

function jsonResponse(payload, overrides = {}) {
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  return {
    ok: overrides.ok ?? true,
    status: overrides.status ?? 200,
    redirected: overrides.redirected ?? false,
    url:
      overrides.url ?? "https://prelive-oauth2.quran.foundation/oauth2/token",
    headers: new Headers(overrides.headers),
    body:
      overrides.body ??
      new ReadableStream({
        start(controller) {
          controller.enqueue(encoded);
          controller.close();
        },
      }),
  };
}

const validPayload = {
  access_token: token,
  token_type: "Bearer",
  expires_in: 3600,
  scope: "content",
};

async function expectCode(promise, code) {
  await assert.rejects(promise, (error) => {
    assert.ok(error instanceof QuranFoundationTokenTransportError);
    assert.equal(error.code, code);
    const text = `${error.name} ${error.message} ${error.stack}`;
    for (const forbidden of [
      credentials.clientId,
      credentials.clientSecret,
      token,
      rawBody,
      "not a valid URL",
      "oauth2.quran.foundation.example",
    ]) {
      assert.equal(text.includes(forbidden), false);
    }
    return true;
  });
}

test("uses the fixed prelive request contract exactly once and narrows success", async () => {
  let calls = 0;
  const fetch = async (url, init) => {
    calls += 1;
    assert.equal(url, "https://prelive-oauth2.quran.foundation/oauth2/token");
    assert.equal(init.method, "POST");
    assert.equal(init.redirect, "error");
    assert.equal(
      init.headers["Content-Type"],
      "application/x-www-form-urlencoded",
    );
    assert.equal(
      init.headers.Authorization,
      `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString("base64")}`,
    );
    assert.equal(init.body, "grant_type=client_credentials&scope=content");
    return jsonResponse(validPayload);
  };
  const transport = new QuranFoundationPreProductionTokenTransport({ fetch });
  const result = await transport.requestAccessToken(credentials);
  assert.equal(calls, 1);
  assert.deepEqual(result, { accessToken: token, expiresInSeconds: 3600 });
  assert.deepEqual(Object.keys(result).sort(), [
    "accessToken",
    "expiresInSeconds",
  ]);
  assert.deepEqual(transport.getLastAttemptEvidence(), {
    tokenEndpointAttempted: true,
    httpStatusClass: "2xx",
    authentication: "pass",
    tokenReturned: true,
    tokenTypeValid: true,
    scopeValid: true,
    expiryMetadataValid: true,
  });
});

test("rejects production and malformed credentials before network", async () => {
  let calls = 0;
  const fetch = async () => {
    calls += 1;
    return jsonResponse(validPayload);
  };
  for (const input of [
    { ...credentials, environment: "production" },
    { ...credentials, clientId: " " },
    { ...credentials, clientSecret: "" },
  ]) {
    const transport = new QuranFoundationPreProductionTokenTransport({ fetch });
    await expectCode(
      transport.requestAccessToken(input),
      input.environment === "production"
        ? "production_not_authorized"
        : "invalid_credentials_shape",
    );
  }
  assert.equal(calls, 0);
});

test("validates bounded timeout configuration and aborts once without retry", async () => {
  for (const timeoutMs of [0, -1, 1.5, Infinity, 30_001]) {
    assert.throws(
      () => new QuranFoundationPreProductionTokenTransport({ timeoutMs }),
      /timeoutMs/u,
    );
  }
  let calls = 0;
  const fetch = async (_url, init) => {
    calls += 1;
    return await new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () =>
        reject(new DOMException("aborted", "AbortError")),
      );
    });
  };
  const transport = new QuranFoundationPreProductionTokenTransport({
    fetch,
    timeoutMs: 5,
  });
  await expectCode(transport.requestAccessToken(credentials), "timeout");
  assert.equal(calls, 1);
  assert.equal(transport.getLastAttemptEvidence().httpStatusClass, "timeout");
});

test("defaults to 30000ms and timeout covers body streaming", async () => {
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let defaultDelay;
  try {
    globalThis.setTimeout = (callback, delay) => {
      defaultDelay = delay;
      return originalSetTimeout(callback, 1);
    };
    globalThis.clearTimeout = (handle) => originalClearTimeout(handle);
    const hangingBody = new ReadableStream({ pull() {} });
    const transport = new QuranFoundationPreProductionTokenTransport({
      fetch: async () => jsonResponse(validPayload, { body: hangingBody }),
    });
    await expectCode(transport.requestAccessToken(credentials), "timeout");
    assert.equal(defaultDelay, 30_000);
  } finally {
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  }
});

test("timeout is not blocked by never-settling or rejecting stream cancellation", async () => {
  for (const cancelResult of [
    () => new Promise(() => undefined),
    () => Promise.reject(new Error(`${rawBody} ${token}`)),
  ]) {
    let calls = 0;
    let cancellations = 0;
    const hangingBody = new ReadableStream({
      pull() {},
      cancel() {
        cancellations += 1;
        return cancelResult();
      },
    });
    const transport = new QuranFoundationPreProductionTokenTransport({
      timeoutMs: 5,
      fetch: async () => {
        calls += 1;
        return jsonResponse(validPayload, { body: hangingBody });
      },
    });
    await Promise.race([
      expectCode(transport.requestAccessToken(credentials), "timeout"),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("timeout propagation was blocked")),
          100,
        ),
      ),
    ]);
    assert.equal(calls, 1);
    assert.equal(cancellations, 1);
    assert.deepEqual(transport.getLastAttemptEvidence(), {
      tokenEndpointAttempted: true,
      httpStatusClass: "timeout",
      authentication: "fail",
      tokenReturned: false,
      tokenTypeValid: null,
      scopeValid: null,
      expiryMetadataValid: null,
    });
  }
});

test("an already-aborted signal rejects before a never-settling body read", async () => {
  let calls = 0;
  const hangingBody = new ReadableStream({
    pull() {},
    cancel() {
      return new Promise(() => undefined);
    },
  });
  const transport = new QuranFoundationPreProductionTokenTransport({
    timeoutMs: 5,
    fetch: async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return jsonResponse(validPayload, { body: hangingBody });
    },
  });
  await Promise.race([
    expectCode(transport.requestAccessToken(credentials), "timeout"),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("already-aborted read hung")), 100),
    ),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(transport.getLastAttemptEvidence(), {
    tokenEndpointAttempted: true,
    httpStatusClass: "timeout",
    authentication: "fail",
    tokenReturned: false,
    tokenTypeValid: null,
    scopeValid: null,
    expiryMetadataValid: null,
  });
});

test("timeout dominates every response validation when fetch resolves late", async () => {
  const lateResponses = [
    jsonResponse(validPayload, { url: "" }),
    jsonResponse(validPayload, { url: "not a valid URL" }),
    jsonResponse(validPayload, { url: "https://example.invalid/token" }),
    jsonResponse({ error: rawBody }, { ok: false, status: 401 }),
    jsonResponse({ error: rawBody }, { ok: false, status: 503 }),
    jsonResponse(validPayload, {
      headers: { "content-length": String(16 * 1024 + 1) },
    }),
    undefined,
    new Proxy(
      {},
      {
        get() {
          throw new Error(`${rawBody} ${token}`);
        },
      },
    ),
  ];

  for (const lateResponse of lateResponses) {
    let calls = 0;
    const transport = new QuranFoundationPreProductionTokenTransport({
      timeoutMs: 5,
      fetch: async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 15));
        return lateResponse;
      },
    });
    await expectCode(transport.requestAccessToken(credentials), "timeout");
    assert.equal(calls, 1);
    assert.deepEqual(transport.getLastAttemptEvidence(), {
      tokenEndpointAttempted: true,
      httpStatusClass: "timeout",
      authentication: "fail",
      tokenReturned: false,
      tokenTypeValid: null,
      scopeValid: null,
      expiryMetadataValid: null,
    });
  }
});

test("pre-deadline responses retain normal validation classifications", async () => {
  const cases = [
    [jsonResponse(validPayload, { url: "" }), "invalid_http_response"],
    [jsonResponse({ error: rawBody }, { ok: false, status: 401 }), "http_4xx"],
    [
      jsonResponse(validPayload, {
        headers: { "content-length": String(16 * 1024 + 1) },
      }),
      "response_too_large",
    ],
  ];
  for (const [response, code] of cases) {
    let calls = 0;
    const transport = new QuranFoundationPreProductionTokenTransport({
      timeoutMs: 30_000,
      fetch: async () => {
        calls += 1;
        return response;
      },
    });
    await expectCode(transport.requestAccessToken(credentials), code);
    assert.equal(calls, 1);
  }
});

test("rejects redirects, cross-origin responses, and HTTP failures safely", async () => {
  const cases = [
    [jsonResponse(validPayload, { redirected: true }), "redirect_rejected"],
    [jsonResponse(validPayload, { url: "" }), "invalid_http_response"],
    [
      jsonResponse(validPayload, { url: "not a valid URL" }),
      "invalid_http_response",
    ],
    [
      jsonResponse(validPayload, {
        url: "https://oauth2.quran.foundation/oauth2/token",
      }),
      "redirect_rejected",
    ],
    [
      jsonResponse(validPayload, {
        url: "https://oauth2.quran.foundation.example/oauth2/token",
      }),
      "redirect_rejected",
    ],
    [jsonResponse({ error: rawBody }, { ok: false, status: 401 }), "http_4xx"],
    [jsonResponse({ error: rawBody }, { ok: false, status: 503 }), "http_5xx"],
  ];
  for (const [response, code] of cases) {
    const transport = new QuranFoundationPreProductionTokenTransport({
      fetch: async () => response,
    });
    await expectCode(transport.requestAccessToken(credentials), code);
  }
});

test("rejects malformed and declared or streamed oversized responses", async () => {
  const malformed = jsonResponse(validPayload, {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("not-json"));
        controller.close();
      },
    }),
  });
  await expectCode(
    new QuranFoundationPreProductionTokenTransport({
      fetch: async () => malformed,
    }).requestAccessToken(credentials),
    "malformed_json",
  );

  const declared = jsonResponse(validPayload, {
    headers: { "content-length": String(16 * 1024 + 1) },
  });
  await expectCode(
    new QuranFoundationPreProductionTokenTransport({
      fetch: async () => declared,
    }).requestAccessToken(credentials),
    "response_too_large",
  );

  const streamed = jsonResponse(validPayload, {
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(16 * 1024));
        controller.enqueue(new Uint8Array(1));
      },
    }),
  });
  await expectCode(
    new QuranFoundationPreProductionTokenTransport({
      fetch: async () => streamed,
    }).requestAccessToken(credentials),
    "response_too_large",
  );
});

test("validates every token response field and exact scope membership", async () => {
  const cases = [
    [{ ...validPayload, access_token: " " }, "missing_access_token"],
    [{ ...validPayload, expires_in: 0 }, "invalid_expires_in"],
    [{ ...validPayload, expires_in: -1 }, "invalid_expires_in"],
    [{ ...validPayload, expires_in: 1.5 }, "invalid_expires_in"],
    [{ ...validPayload, expires_in: 1e309 }, "invalid_expires_in"],
    [{ ...validPayload, token_type: "mac" }, "invalid_token_type"],
    [{ ...validPayload, scope: "content.read" }, "invalid_scope"],
    [{ ...validPayload, scope: "profile" }, "invalid_scope"],
  ];
  for (const [payload, code] of cases) {
    const transport = new QuranFoundationPreProductionTokenTransport({
      fetch: async () => jsonResponse(payload),
    });
    await expectCode(transport.requestAccessToken(credentials), code);
  }

  for (const payload of [
    { ...validPayload, token_type: "bEaReR" },
    { ...validPayload, scope: "profile\tcontent other" },
  ]) {
    const result = await new QuranFoundationPreProductionTokenTransport({
      fetch: async () => jsonResponse(payload),
    }).requestAccessToken(credentials);
    assert.equal(result.accessToken, token);
  }
});

test("network failures expose only safe classification", async () => {
  const transport = new QuranFoundationPreProductionTokenTransport({
    fetch: async () => {
      throw new Error(`${credentials.clientSecret} ${rawBody}`);
    },
  });
  await expectCode(
    transport.requestAccessToken(credentials),
    "network_failure",
  );
  assert.equal(
    transport.getLastAttemptEvidence().httpStatusClass,
    "network_error",
  );
});
