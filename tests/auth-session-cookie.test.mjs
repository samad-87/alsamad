import test from "node:test";
import assert from "node:assert/strict";

import {
  clearSessionCookie,
  readSessionCookie,
  resolveCurrentSession,
  setSessionCookie,
} from "../src/lib/auth/session-cookie.ts";

function createFakeRuntime({
  credential = null,
  production = false,
  resolvedSessionId = null,
} = {}) {
  const cookies = new Map();
  const setCalls = [];
  const deleteCalls = [];
  const resolveCalls = [];

  if (credential !== null) {
    cookies.set("alsamad_session", credential);
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

  const dependencies = {
    async getCookieStore() {
      return cookieStore;
    },

    async resolveCredential(rawCredential) {
      resolveCalls.push(rawCredential);
      return resolvedSessionId;
    },

    isProduction() {
      return production;
    },
  };

  return {
    dependencies,
    cookies,
    setCalls,
    deleteCalls,
    resolveCalls,
  };
}

test("setSessionCookie writes exact auth cookie and security options", async () => {
  const runtime = createFakeRuntime();

  await setSessionCookie("opaque-credential", runtime.dependencies);

  assert.equal(runtime.setCalls.length, 1);
  assert.deepEqual(runtime.setCalls[0], {
    name: "alsamad_session",
    value: "opaque-credential",
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: false,
    },
  });
});

test("setSessionCookie enables secure in production", async () => {
  const runtime = createFakeRuntime({ production: true });

  await setSessionCookie("opaque-credential", runtime.dependencies);

  assert.equal(runtime.setCalls[0].options.secure, true);
});

test("readSessionCookie returns credential when present", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
  });

  assert.equal(
    await readSessionCookie(runtime.dependencies),
    "opaque-credential",
  );
});

test("readSessionCookie returns null when missing", async () => {
  const runtime = createFakeRuntime();

  assert.equal(await readSessionCookie(runtime.dependencies), null);
});

test("clearSessionCookie deletes only alsamad_session", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
  });

  runtime.cookies.set("other_cookie", "keep-me");

  await clearSessionCookie(runtime.dependencies);

  assert.deepEqual(runtime.deleteCalls, ["alsamad_session"]);
  assert.equal(runtime.cookies.has("alsamad_session"), false);
  assert.equal(runtime.cookies.get("other_cookie"), "keep-me");
});

test("resolveCurrentSession returns null when cookie is missing", async () => {
  const runtime = createFakeRuntime({
    resolvedSessionId: "should-not-be-used",
  });

  assert.equal(await resolveCurrentSession(runtime.dependencies), null);

  assert.deepEqual(runtime.resolveCalls, []);
});

test("resolveCurrentSession passes raw credential to resolver", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
    resolvedSessionId: "session-123",
  });

  await resolveCurrentSession(runtime.dependencies);

  assert.deepEqual(runtime.resolveCalls, ["opaque-credential"]);
});

test("resolveCurrentSession returns resolved session id", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
    resolvedSessionId: "session-123",
  });

  assert.equal(
    await resolveCurrentSession(runtime.dependencies),
    "session-123",
  );
});

test("resolveCurrentSession returns null on resolution failure", async () => {
  const runtime = createFakeRuntime({
    credential: "opaque-credential",
    resolvedSessionId: null,
  });

  assert.equal(await resolveCurrentSession(runtime.dependencies), null);
});
