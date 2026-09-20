import test from "node:test";
import assert from "node:assert/strict";

import { resolveCurrentUserId } from "../src/lib/auth/current-user.ts";

const SESSION_ID = "018f2f2a-0000-7000-8000-000000000031";
const USER_ID = "018f2f2a-0000-7000-8000-000000000001";

function createFakeCurrentUser({
  sessionId = SESSION_ID,
  userId = USER_ID,
} = {}) {
  const calls = [];

  return {
    calls,
    dependencies: {
      async resolveCurrentSession() {
        calls.push({
          operation: "resolveCurrentSession",
        });

        return sessionId;
      },

      async resolveSessionUserId(resolvedSessionId) {
        calls.push({
          operation: "resolveSessionUserId",
          sessionId: resolvedSessionId,
        });

        return userId;
      },
    },
  };
}

test("resolveCurrentUserId returns null when current session is missing", async () => {
  const runtime = createFakeCurrentUser({
    sessionId: null,
  });

  assert.equal(await resolveCurrentUserId(runtime.dependencies), null);
});

test("missing current session does not invoke user resolver", async () => {
  const runtime = createFakeCurrentUser({
    sessionId: null,
  });

  await resolveCurrentUserId(runtime.dependencies);

  assert.deepEqual(
    runtime.calls.map((call) => call.operation),
    ["resolveCurrentSession"],
  );
});

test("resolveCurrentUserId passes sessionId unchanged", async () => {
  const runtime = createFakeCurrentUser();

  await resolveCurrentUserId(runtime.dependencies);

  assert.deepEqual(runtime.calls, [
    {
      operation: "resolveCurrentSession",
    },
    {
      operation: "resolveSessionUserId",
      sessionId: SESSION_ID,
    },
  ]);
});

test("resolveCurrentUserId returns exact userId", async () => {
  const runtime = createFakeCurrentUser();

  assert.equal(await resolveCurrentUserId(runtime.dependencies), USER_ID);
});

test("resolveCurrentUserId propagates null from invalid session resolution", async () => {
  const runtime = createFakeCurrentUser({
    userId: null,
  });

  assert.equal(await resolveCurrentUserId(runtime.dependencies), null);
});
