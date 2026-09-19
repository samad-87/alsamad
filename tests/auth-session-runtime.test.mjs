import test from "node:test";
import assert from "node:assert/strict";
import { validate as validateUuid, version as uuidVersion } from "uuid";

import {
  createSession,
  validateSession,
  revokeSession,
  revokeAllSessions,
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

      async revokeSessionById(sessionId, revokedAt) {
        const session = sessions.get(sessionId);

        if (!session || session.revokedAt !== null) {
          return;
        }

        sessions.set(sessionId, {
          ...session,
          revokedAt,
        });
      },

      async revokeAllSessionsByUserId(userId, revokedAt) {
        for (const [sessionId, session] of sessions) {
          if (session.userId !== userId || session.revokedAt !== null) {
            continue;
          }

          sessions.set(sessionId, {
            ...session,
            revokedAt,
          });
        }
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

test("revokeSession revokes an active session", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000005",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const { dependencies, sessions } = createFakeRuntime([session]);

  await revokeSession(session.id, dependencies);

  const updatedSession = sessions.get(session.id);
  assert.equal(updatedSession.revokedAt.getTime(), NOW.getTime());
});

test("revokeSession does not create or mutate a missing session", async () => {
  const { dependencies, inserted } = createFakeRuntime();

  await revokeSession("018f2f2a-0000-7000-8000-000000000099", dependencies);

  assert.equal(inserted.length, 0);
});

test("revokeSession does not change an already-revoked session", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000006",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: new Date("2026-09-19T15:30:00.000Z"),
  };

  const { dependencies, sessions } = createFakeRuntime([session]);

  await revokeSession(session.id, dependencies);

  const updatedSession = sessions.get(session.id);
  assert.equal(updatedSession.revokedAt.getTime(), session.revokedAt.getTime());
});

test("revokeAllSessions revokes all active sessions for one user", async () => {
  const session1 = {
    id: "018f2f2a-0000-7000-8000-000000000007",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const session2 = {
    id: "018f2f2a-0000-7000-8000-000000000008",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const { dependencies, sessions } = createFakeRuntime([session1, session2]);

  await revokeAllSessions(USER_ID, dependencies);

  assert.equal(sessions.get(session1.id).revokedAt.getTime(), NOW.getTime());
  assert.equal(sessions.get(session2.id).revokedAt.getTime(), NOW.getTime());
});

test("revokeAllSessions does not affect another user's sessions", async () => {
  const session1 = {
    id: "018f2f2a-0000-7000-8000-000000000009",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const session2 = {
    id: "018f2f2a-0000-7000-8000-000000000010",
    userId: "018f2f2a-0000-7000-8000-000000000002",
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: null,
  };

  const { dependencies, sessions } = createFakeRuntime([session1, session2]);

  await revokeAllSessions(USER_ID, dependencies);

  assert.equal(sessions.get(session1.id).revokedAt.getTime(), NOW.getTime());
  assert.equal(sessions.get(session2.id).revokedAt, null);
});

test("revokeAllSessions preserves existing revokedAt timestamps", async () => {
  const session = {
    id: "018f2f2a-0000-7000-8000-000000000011",
    userId: USER_ID,
    createdAt: new Date("2026-09-19T15:00:00.000Z"),
    expiresAt: new Date("2026-09-19T17:00:00.000Z"),
    revokedAt: new Date("2026-09-19T15:30:00.000Z"),
  };

  const { dependencies, sessions } = createFakeRuntime([session]);

  await revokeAllSessions(USER_ID, dependencies);

  assert.equal(
    sessions.get(session.id).revokedAt.getTime(),
    session.revokedAt.getTime(),
  );
});
