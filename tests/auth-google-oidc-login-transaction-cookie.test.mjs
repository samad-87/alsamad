import test from "node:test";
import assert from "node:assert/strict";

import {
  clearGoogleOidcLoginTransactionCookie,
  readGoogleOidcLoginTransactionCookie,
  setGoogleOidcLoginTransactionCookie,
} from "../src/lib/auth/google-oidc-login-transaction-cookie.ts";

const NOW = new Date("2026-09-20T18:00:00.000Z");
const EXPIRES_AT = new Date("2026-09-20T18:10:00.000Z");

function createFakeRuntime({
  credential = null,
  production = false,
  now = NOW,
} = {}) {
  const cookies = new Map();
  const setCalls = [];
  const deleteCalls = [];

  if (credential !== null) {
    cookies.set("alsamad_google_oidc_tx", credential);
  }

  const cookieStore = {
    get(name) {
      const value = cookies.get(name);
      return value === undefined ? undefined : { value };
    },

    set(name, value, options) {
      setCalls.push({ name, value, options });
      cookies.set(name, value);
    },

    delete(name) {
      deleteCalls.push(name);
      cookies.delete(name);
    },
  };

  return {
    cookies,
    setCalls,
    deleteCalls,
    dependencies: {
      async getCookieStore() {
        return cookieStore;
      },
      isProduction() {
        return production;
      },
      now() {
        return new Date(now);
      },
    },
  };
}

test("set writes exact opaque transaction cookie and security options", async () => {
  const runtime = createFakeRuntime();

  await setGoogleOidcLoginTransactionCookie(
    "opaque-credential",
    EXPIRES_AT,
    runtime.dependencies,
  );

  assert.deepEqual(runtime.setCalls, [
    {
      name: "alsamad_google_oidc_tx",
      value: "opaque-credential",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
        expires: EXPIRES_AT,
      },
    },
  ]);
});

test("set enables secure in production", async () => {
  const runtime = createFakeRuntime({ production: true });

  await setGoogleOidcLoginTransactionCookie(
    "opaque-credential",
    EXPIRES_AT,
    runtime.dependencies,
  );

  assert.equal(runtime.setCalls[0].options.secure, true);
});

test("set rejects expiry that is not in the future", async () => {
  const runtime = createFakeRuntime();

  await assert.rejects(
    setGoogleOidcLoginTransactionCookie(
      "opaque-credential",
      NOW,
      runtime.dependencies,
    ),
    /expiresAt must be in the future/,
  );

  assert.equal(runtime.setCalls.length, 0);
});

test("read returns credential when present", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
  });

  assert.equal(
    await readGoogleOidcLoginTransactionCookie(runtime.dependencies),
    "opaque-credential",
  );
});

test("read returns null when missing", async () => {
  const runtime = createFakeRuntime();

  assert.equal(
    await readGoogleOidcLoginTransactionCookie(runtime.dependencies),
    null,
  );
});

test("clear deletes only Google OIDC transaction cookie", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
  });

  runtime.cookies.set("other_cookie", "keep-me");

  await clearGoogleOidcLoginTransactionCookie(runtime.dependencies);

  assert.deepEqual(runtime.deleteCalls, ["alsamad_google_oidc_tx"]);
  assert.equal(runtime.cookies.has("alsamad_google_oidc_tx"), false);
  assert.equal(runtime.cookies.get("other_cookie"), "keep-me");
});
