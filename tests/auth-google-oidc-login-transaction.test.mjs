import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  consumeGoogleOidcLoginTransaction,
  issueGoogleOidcLoginTransaction,
} from "../src/lib/auth/google-oidc-login-transaction.ts";

const NOW = new Date("2026-09-20T17:00:00.000Z");
const EXPIRES_AT = new Date("2026-09-20T17:10:00.000Z");
const STATE = "state-123";
const NONCE = "nonce-123";
const PKCE = "a".repeat(64);

function createPersistence() {
  const rows = [];

  return {
    rows,
    persistence: {
      async insertTransaction(transaction) {
        rows.push(transaction);
      },

      async consumeTransactionByCredentialHash(credentialHash, consumedAt) {
        const row = rows.find(
          (candidate) =>
            candidate.credentialHash === credentialHash &&
            candidate.consumedAt === null &&
            candidate.expiresAt.getTime() > consumedAt.getTime(),
        );

        if (!row) return null;

        row.consumedAt = consumedAt;

        return {
          state: row.state,
          nonce: row.nonce,
          pkceCodeVerifier: row.pkceCodeVerifier,
        };
      },
    },
  };
}

test("issue persists only credential hash and transaction data", async () => {
  const { rows, persistence } = createPersistence();

  const raw = await issueGoogleOidcLoginTransaction(
    STATE,
    NONCE,
    PKCE,
    EXPIRES_AT,
    { persistence, now: () => new Date(NOW) },
  );

  assert.equal(Buffer.from(raw, "base64url").length, 32);
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].credentialHash, raw);
  assert.equal(
    rows[0].credentialHash,
    createHash("sha256").update(raw, "utf8").digest("hex"),
  );
  assert.equal(rows[0].state, STATE);
  assert.equal(rows[0].nonce, NONCE);
  assert.equal(rows[0].pkceCodeVerifier, PKCE);
  assert.equal(rows[0].consumedAt, null);
});

test("issue rejects expiry that is not after creation", async () => {
  const { persistence } = createPersistence();

  await assert.rejects(
    issueGoogleOidcLoginTransaction(STATE, NONCE, PKCE, NOW, {
      persistence,
      now: () => new Date(NOW),
    }),
    /expiresAt must be after createdAt/,
  );
});

test("consume returns payload once and then returns null", async () => {
  const { persistence } = createPersistence();
  const dependencies = {
    persistence,
    now: () => new Date(NOW),
  };

  const raw = await issueGoogleOidcLoginTransaction(
    STATE,
    NONCE,
    PKCE,
    EXPIRES_AT,
    dependencies,
  );

  assert.deepEqual(await consumeGoogleOidcLoginTransaction(raw, dependencies), {
    state: STATE,
    nonce: NONCE,
    pkceCodeVerifier: PKCE,
  });

  assert.equal(
    await consumeGoogleOidcLoginTransaction(raw, dependencies),
    null,
  );
});

test("consume rejects an expired transaction", async () => {
  const { persistence } = createPersistence();

  const raw = await issueGoogleOidcLoginTransaction(
    STATE,
    NONCE,
    PKCE,
    EXPIRES_AT,
    { persistence, now: () => new Date(NOW) },
  );

  const result = await consumeGoogleOidcLoginTransaction(raw, {
    persistence,
    now: () => new Date(EXPIRES_AT),
  });

  assert.equal(result, null);
});
