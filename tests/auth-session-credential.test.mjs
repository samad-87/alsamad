import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  issueSessionCredential,
  resolveSessionCredential,
} from "../src/lib/auth/session-credential.ts";

const SESSION_ID = "018f2f2a-0000-7000-8000-000000000201";
const USER_ID = "018f2f2a-0000-7000-8000-000000000001";
const NOW = new Date("2026-09-19T20:00:00.000Z");

function createFakeCredentialPersistence() {
  const rows = [];

  return {
    rows,
    persistence: {
      async insertCredential(sessionId, credentialHash) {
        rows.push({
          sessionId,
          credentialHash,
        });
      },

      async findSessionIdByCredentialHash(credentialHash) {
        return (
          rows.find((row) => row.credentialHash === credentialHash)
            ?.sessionId ?? null
        );
      },
    },
  };
}

function createSessionRuntimeDependencies(session) {
  return {
    now: () => new Date(NOW),

    persistence: {
      async insertSession() {
        throw new Error("insertSession not expected");
      },

      async findSessionById(sessionId) {
        if (!session || session.id !== sessionId) {
          return null;
        }

        return session;
      },

      async revokeSessionById() {
        throw new Error("revokeSessionById not expected");
      },

      async revokeAllSessionsByUserId() {
        throw new Error("revokeAllSessionsByUserId not expected");
      },
    },
  };
}

test("issueSessionCredential emits 32 random bytes and persists only SHA-256 hash", async () => {
  const { rows, persistence } = createFakeCredentialPersistence();

  const rawCredential = await issueSessionCredential(SESSION_ID, {
    persistence,
  });

  assert.equal(Buffer.from(rawCredential, "base64url").length, 32);

  assert.equal(rows.length, 1);

  const row = rows[0];

  assert.deepEqual(Object.keys(row).sort(), ["credentialHash", "sessionId"]);

  assert.equal(row.sessionId, SESSION_ID);
  assert.notEqual(row.credentialHash, rawCredential);

  assert.match(row.credentialHash, /^[0-9a-f]{64}$/);

  const expectedHash = createHash("sha256")
    .update(rawCredential, "utf8")
    .digest("hex");

  assert.equal(row.credentialHash, expectedHash);

  assert.equal(JSON.stringify(row).includes(rawCredential), false);
});

test("resolveSessionCredential rejects unknown credential", async () => {
  const { persistence } = createFakeCredentialPersistence();

  const result = await resolveSessionCredential("unknown-credential", {
    persistence,
    sessionRuntimeDependencies: createSessionRuntimeDependencies(null),
  });

  assert.equal(result, null);
});

test("resolveSessionCredential resolves an active session", async () => {
  const { persistence } = createFakeCredentialPersistence();

  const rawCredential = await issueSessionCredential(SESSION_ID, {
    persistence,
  });

  const session = {
    id: SESSION_ID,
    userId: USER_ID,
    createdAt: new Date("2026-09-19T19:00:00.000Z"),
    expiresAt: new Date("2026-09-19T21:00:00.000Z"),
    revokedAt: null,
  };

  const result = await resolveSessionCredential(rawCredential, {
    persistence,
    sessionRuntimeDependencies: createSessionRuntimeDependencies(session),
  });

  assert.equal(result, SESSION_ID);
});

test("resolveSessionCredential rejects an expired session", async () => {
  const { persistence } = createFakeCredentialPersistence();

  const rawCredential = await issueSessionCredential(SESSION_ID, {
    persistence,
  });

  const session = {
    id: SESSION_ID,
    userId: USER_ID,
    createdAt: new Date("2026-09-19T18:00:00.000Z"),
    expiresAt: new Date("2026-09-19T19:59:59.000Z"),
    revokedAt: null,
  };

  const result = await resolveSessionCredential(rawCredential, {
    persistence,
    sessionRuntimeDependencies: createSessionRuntimeDependencies(session),
  });

  assert.equal(result, null);
});

test("resolveSessionCredential rejects a revoked session", async () => {
  const { persistence } = createFakeCredentialPersistence();

  const rawCredential = await issueSessionCredential(SESSION_ID, {
    persistence,
  });

  const session = {
    id: SESSION_ID,
    userId: USER_ID,
    createdAt: new Date("2026-09-19T18:00:00.000Z"),
    expiresAt: new Date("2026-09-19T21:00:00.000Z"),
    revokedAt: new Date("2026-09-19T19:30:00.000Z"),
  };

  const result = await resolveSessionCredential(rawCredential, {
    persistence,
    sessionRuntimeDependencies: createSessionRuntimeDependencies(session),
  });

  assert.equal(result, null);
});
