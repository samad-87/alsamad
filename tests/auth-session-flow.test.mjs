import test from "node:test";
import assert from "node:assert/strict";

import { establishSession } from "../src/lib/auth/session-flow.ts";

const USER_ID = "018f2f2a-0000-7000-8000-000000000001";
const SESSION_ID = "018f2f2a-0000-7000-8000-000000000501";
const EXPIRES_AT = new Date("2026-09-21T00:00:00.000Z");

function createFakeFlow({
  createError = null,
  credentialError = null,
  cookieError = null,
  revokeError = null,
} = {}) {
  const calls = [];

  const dependencies = {
    async createSession(userId, expiresAt) {
      calls.push({
        operation: "createSession",
        userId,
        expiresAt,
      });

      if (createError) {
        throw createError;
      }

      return SESSION_ID;
    },

    async issueSessionCredential(sessionId) {
      calls.push({
        operation: "issueSessionCredential",
        sessionId,
      });

      if (credentialError) {
        throw credentialError;
      }

      return "opaque-credential";
    },

    async setSessionCookie(rawCredential) {
      calls.push({
        operation: "setSessionCookie",
        rawCredential,
      });

      if (cookieError) {
        throw cookieError;
      }
    },

    async revokeSession(sessionId) {
      calls.push({
        operation: "revokeSession",
        sessionId,
      });

      if (revokeError) {
        throw revokeError;
      }
    },
  };

  return {
    calls,
    dependencies,
  };
}

test("establishSession runs the successful flow in exact order", async () => {
  const runtime = createFakeFlow();

  const result = await establishSession(
    USER_ID,
    EXPIRES_AT,
    runtime.dependencies,
  );

  assert.equal(result, SESSION_ID);

  assert.deepEqual(
    runtime.calls.map((call) => call.operation),
    ["createSession", "issueSessionCredential", "setSessionCookie"],
  );
});

test("establishSession passes userId and expiresAt unchanged", async () => {
  const runtime = createFakeFlow();

  await establishSession(USER_ID, EXPIRES_AT, runtime.dependencies);

  assert.equal(runtime.calls[0].userId, USER_ID);
  assert.equal(runtime.calls[0].expiresAt, EXPIRES_AT);
});

test("successful establishment never revokes the session", async () => {
  const runtime = createFakeFlow();

  await establishSession(USER_ID, EXPIRES_AT, runtime.dependencies);

  assert.equal(
    runtime.calls.some((call) => call.operation === "revokeSession"),
    false,
  );
});

test("createSession failure stops the flow without compensation", async () => {
  const createError = new Error("create failed");
  const runtime = createFakeFlow({ createError });

  await assert.rejects(
    () => establishSession(USER_ID, EXPIRES_AT, runtime.dependencies),
    (error) => error === createError,
  );

  assert.deepEqual(
    runtime.calls.map((call) => call.operation),
    ["createSession"],
  );
});

test("credential failure revokes once and does not write cookie", async () => {
  const credentialError = new Error("credential failed");
  const runtime = createFakeFlow({ credentialError });

  await assert.rejects(
    () => establishSession(USER_ID, EXPIRES_AT, runtime.dependencies),
    (error) => error === credentialError,
  );

  assert.deepEqual(
    runtime.calls.map((call) => call.operation),
    ["createSession", "issueSessionCredential", "revokeSession"],
  );

  assert.equal(
    runtime.calls.filter((call) => call.operation === "revokeSession").length,
    1,
  );
});

test("cookie failure revokes exactly once", async () => {
  const cookieError = new Error("cookie failed");
  const runtime = createFakeFlow({ cookieError });

  await assert.rejects(
    () => establishSession(USER_ID, EXPIRES_AT, runtime.dependencies),
    (error) => error === cookieError,
  );

  assert.deepEqual(
    runtime.calls.map((call) => call.operation),
    [
      "createSession",
      "issueSessionCredential",
      "setSessionCookie",
      "revokeSession",
    ],
  );

  assert.equal(
    runtime.calls.filter((call) => call.operation === "revokeSession").length,
    1,
  );
});

test("compensation failure preserves both failures", async () => {
  const cookieError = new Error("cookie failed");
  const revokeError = new Error("revoke failed");

  const runtime = createFakeFlow({
    cookieError,
    revokeError,
  });

  await assert.rejects(
    () => establishSession(USER_ID, EXPIRES_AT, runtime.dependencies),
    (error) => {
      assert.equal(error instanceof AggregateError, true);
      assert.equal(error.errors.length, 2);
      assert.equal(error.errors[0], cookieError);
      assert.equal(error.errors[1], revokeError);
      return true;
    },
  );
});
