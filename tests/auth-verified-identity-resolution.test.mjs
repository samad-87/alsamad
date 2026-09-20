import { test } from "node:test";
import * as assert from "node:assert";
import { resolveVerifiedAuthenticationIdentity } from "../src/lib/auth/verified-identity-resolution.ts";

const FAKE_NAMESPACE = "fake-namespace";
const FAKE_SUBJECT = "fake-subject";
const FAKE_USER_ID = "fake-user-id";

function createFakeResolveAuthenticationIdentity(result) {
  return async (authenticatorNamespace, subject) => {
    assert.strictEqual(authenticatorNamespace, FAKE_NAMESPACE);
    assert.strictEqual(subject, FAKE_SUBJECT);
    return result;
  };
}

test("resolveVerifiedAuthenticationIdentity passes through namespace and subject, returns userId", async () => {
  const identity = {
    authenticatorNamespace: FAKE_NAMESPACE,
    subject: FAKE_SUBJECT,
  };

  const result = await resolveVerifiedAuthenticationIdentity(identity, {
    resolveAuthenticationIdentity:
      createFakeResolveAuthenticationIdentity(FAKE_USER_ID),
  });

  assert.strictEqual(result, FAKE_USER_ID);
});

test("resolveVerifiedAuthenticationIdentity passes through namespace and subject, returns null", async () => {
  const identity = {
    authenticatorNamespace: FAKE_NAMESPACE,
    subject: FAKE_SUBJECT,
  };

  const result = await resolveVerifiedAuthenticationIdentity(identity, {
    resolveAuthenticationIdentity:
      createFakeResolveAuthenticationIdentity(null),
  });

  assert.strictEqual(result, null);
});
