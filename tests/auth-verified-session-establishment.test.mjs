import { test } from "node:test";
import { strict as assert } from "node:assert";

import { establishVerifiedSession } from "../src/lib/auth/verified-session-establishment.js";

const mockIdentity = Symbol("identity");
const mockExpiresAt = new Date();

function createFakes() {
  const fakes = {};

  fakes.resolveVerifiedAccountContext = (identity) => {
    if (identity !== mockIdentity) throw new Error("unexpected identity");
    return fakes.context;
  };

  fakes.hasAccountSessionAuthority = (status) => {
    if (status !== fakes.context?.status) throw new Error("unexpected status");
    return fakes.authority;
  };

  fakes.establishSession = (userId, expiresAt) => {
    if (userId !== fakes.context?.userId) throw new Error("unexpected userId");
    if (expiresAt !== mockExpiresAt) throw new Error("unexpected expiresAt");
    return fakes.sessionId;
  };

  return fakes;
}

test("establishVerifiedSession - active account", async () => {
  const fakes = createFakes();
  fakes.context = { userId: "user123", status: "active" };
  fakes.authority = true;
  fakes.sessionId = "session456";

  const result = await establishVerifiedSession(
    mockIdentity,
    mockExpiresAt,
    fakes,
  );
  assert.equal(result, "session456");
});

test("establishVerifiedSession - disabled account", async () => {
  const fakes = createFakes();
  fakes.context = { userId: "user123", status: "disabled" };
  fakes.authority = false;

  const result = await establishVerifiedSession(
    mockIdentity,
    mockExpiresAt,
    fakes,
  );
  assert.equal(result, null);
});

test("establishVerifiedSession - deletion_pending account", async () => {
  const fakes = createFakes();
  fakes.context = { userId: "user123", status: "deletion_pending" };
  fakes.authority = false;

  const result = await establishVerifiedSession(
    mockIdentity,
    mockExpiresAt,
    fakes,
  );
  assert.equal(result, null);
});

test("establishVerifiedSession - deleted account", async () => {
  const fakes = createFakes();
  fakes.context = { userId: "user123", status: "deleted" };
  fakes.authority = false;

  const result = await establishVerifiedSession(
    mockIdentity,
    mockExpiresAt,
    fakes,
  );
  assert.equal(result, null);
});

test("establishVerifiedSession - missing context", async () => {
  const fakes = createFakes();
  fakes.context = null;

  const result = await establishVerifiedSession(
    mockIdentity,
    mockExpiresAt,
    fakes,
  );
  assert.equal(result, null);
});
