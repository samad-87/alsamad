import test from "node:test";
import assert from "node:assert";

import { establishGoogleVerifiedSession } from "../src/lib/auth/google-session-transaction.ts";

function createFakeDependencies(verifyGoogleOidc, establishVerifiedSession) {
  return {
    verifyGoogleOidc,
    establishVerifiedSession,
  };
}

test("establishGoogleVerifiedSession - success case", async () => {
  const fakeIdentity = { sub: "123", email: "test@example.com" };
  const fakeExpiresAt = new Date();
  const fakeSessionId = "session-123";

  const verifyGoogleOidc = async (input) => {
    assert.strictEqual(input, "fake-input");
    return fakeIdentity;
  };

  const establishVerifiedSession = async (identity, expiresAt) => {
    assert.strictEqual(identity, fakeIdentity);
    assert.strictEqual(expiresAt, fakeExpiresAt);
    return fakeSessionId;
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  const result = await establishGoogleVerifiedSession(
    "fake-input",
    fakeExpiresAt,
    dependencies,
  );

  assert.strictEqual(result, fakeSessionId);
});

test("establishGoogleVerifiedSession - null identity skips session establishment", async () => {
  const verifyGoogleOidc = async () => {
    return null;
  };

  let establishVerifiedSessionCalled = false;
  const establishVerifiedSession = async () => {
    establishVerifiedSessionCalled = true;
    return "session-123";
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  const result = await establishGoogleVerifiedSession(
    "fake-input",
    new Date(),
    dependencies,
  );

  assert.strictEqual(result, null);
  assert.strictEqual(establishVerifiedSessionCalled, false);
});

test("establishGoogleVerifiedSession - null session result propagates", async () => {
  const fakeIdentity = { sub: "123", email: "test@example.com" };

  const verifyGoogleOidc = async () => {
    return fakeIdentity;
  };

  const establishVerifiedSession = async () => {
    return null;
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  const result = await establishGoogleVerifiedSession(
    "fake-input",
    new Date(),
    dependencies,
  );

  assert.strictEqual(result, null);
});

test("establishGoogleVerifiedSession - exact identity pass-through", async () => {
  const fakeIdentity = { sub: "123", email: "test@example.com" };

  const verifyGoogleOidc = async (input) => {
    assert.strictEqual(input, "fake-input");
    return fakeIdentity;
  };

  const establishVerifiedSession = async (identity) => {
    assert.strictEqual(identity, fakeIdentity);
    return "session-123";
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  await establishGoogleVerifiedSession("fake-input", new Date(), dependencies);
});

test("establishGoogleVerifiedSession - exact expiresAt pass-through", async () => {
  const fakeExpiresAt = new Date("2023-01-01T00:00:00Z");

  const verifyGoogleOidc = async () => {
    return { sub: "123", email: "test@example.com" };
  };

  const establishVerifiedSession = async (...args) => {
    assert.strictEqual(args[1], fakeExpiresAt);
    return "session-123";
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  await establishGoogleVerifiedSession(
    "fake-input",
    fakeExpiresAt,
    dependencies,
  );
});

test("establishGoogleVerifiedSession - verification error propagates unchanged", async () => {
  const error = new Error("Verification failed");

  const verifyGoogleOidc = async () => {
    throw error;
  };

  const establishVerifiedSession = async () => {
    return "session-123";
  };

  const dependencies = createFakeDependencies(
    verifyGoogleOidc,
    establishVerifiedSession,
  );

  await assert.rejects(
    () =>
      establishGoogleVerifiedSession("fake-input", new Date(), dependencies),
    error,
  );
});
