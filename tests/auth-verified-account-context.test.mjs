import test from "node:test";
import assert from "node:assert/strict";

import { resolveVerifiedAccountContext } from "../src/lib/auth/verified-account-context.ts";

const identity = {
  authenticatorNamespace: "google",
  subject: "Subject-123",
};

test("missing resolved user returns null and skips account lookup", async () => {
  let accountCalls = 0;

  const result = await resolveVerifiedAccountContext(identity, {
    async resolveVerifiedAuthenticationIdentity(received) {
      assert.strictEqual(received, identity);
      return null;
    },
    async resolveAccountStatus() {
      accountCalls += 1;
      return "active";
    },
  });

  assert.equal(result, null);
  assert.equal(accountCalls, 0);
});

test("missing account status returns null and receives exact userId", async () => {
  let receivedUserId = null;

  const result = await resolveVerifiedAccountContext(identity, {
    async resolveVerifiedAuthenticationIdentity() {
      return "user123";
    },
    async resolveAccountStatus(userId) {
      receivedUserId = userId;
      return null;
    },
  });

  assert.equal(receivedUserId, "user123");
  assert.equal(result, null);
});

for (const status of ["active", "disabled", "deletion_pending", "deleted"]) {
  test(`preserves ${status} unchanged`, async () => {
    const result = await resolveVerifiedAccountContext(identity, {
      async resolveVerifiedAuthenticationIdentity() {
        return "user123";
      },
      async resolveAccountStatus() {
        return status;
      },
    });

    assert.deepEqual(result, {
      userId: "user123",
      status,
    });
  });
}
