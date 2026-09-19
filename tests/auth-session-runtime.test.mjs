import test from "node:test";
import assert from "node:assert/strict";
import { validate as validateUuid, version as uuidVersion } from "uuid";

import {
  createSession,
  validateSession,
} from "../src/lib/auth/session-runtime.ts";

const NOW = new Date("2026-09-19T16:00:00.000Z");
const USER_ID = "018f2f2a-0000-7000-8000-000000000001";

function createFakeRuntime(initialSessions = []) {
  const sessions = new Map(
    initialSessions.map((session) => [session.id, session]),
  );
  const inserted = [];

  const dependencies = {
    now: () => new Date(NOW),
    persistence: {
      async insertSession(session) {
        inserted.push(session);
        sessions.set(session.id, session);
      },

      async findSessionById(sessionId) {
        return sessions.get(sessionId) ?? null;
      },
    },
  };

  return { dependencies, sessions, inserted };
}

test("createSession uses the real UUIDv7 createId helper", async () => {
  const { dependencies } = createFakeRuntime();

  const id = await createSession(
    USER_ID,
    new Date("2026-09-19T17:00:00.000Z"),
    dependencies,
  );

  assert.equal(validateUuid(id), true);
  assert.equal(uuidVersion(id), 7);
});

test("createSession creates an unrevoked session", async () => {
  const { dependencies, inserted } = createFakeRuntime();

  await createSession(
    USER_ID,
    new Date("2026-09-19T17:00:00.000Z"),
    dependencies,
  );

  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].revokedAt, null);
  assert.equal(inserted[0].createdAt.getTime(), NOW.getTime());
});

test("createSession rejects expiresAt at or before createdAt", async () => {
  const { dependencies, inserted } = createFakeRuntime();

  await assert.rejects(
    () => createSession(USER_ID, new Date(NOW), dependencies),
    /expiresAt must be after createdAt/,
  );

  assert.equal(inserted.length, 0);
});

test("validateSession accepts an active non-expired session", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000002",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const { dependencies } = createFakeRuntime([session]);

  assert.equal(await validateSession(session.id, dependencies), true);
});

test("validateSession rejects an expired session", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000003",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T14:00:00.000Z"),
    expiresAt: new Date("2026-09-19T15:59:59.000Z"),
    revokedAt: null,
  };

  const { dependencies } = createFakeRuntime([session]);

  assert.equal(await validateSession(session.id, dependencies), false);
});

test("validateSession rejects a revoked session", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000004",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: new Date("2026-09-19T15:30:00.000Z"),
  };

  const { dependencies } = createFakeRuntime([session]);

  assert.equal(await validateSession(session.id, dependencies), false);
});

test("validateSession rejects a missing session", async () => {
  const { dependencies } = createFakeRuntime();

  assert.equal(
    await validateSession("018f2f2a-0000-7000-8000-000000000099", dependencies),
    false,
  );
});
