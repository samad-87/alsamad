import test from "node:test";
import assert from "node:assert/strict";

import { resolveCurrentAuthorizedAccount } from "../src/lib/auth/current-authorized-account.ts";

test("missing current account returns null and skips authority gate", async () => {
  let authorityCalls = 0;
  const result = await resolveCurrentAuthorizedAccount({
    async resolveCurrentAccount() {
      return null;
    },
    hasAccountSessionAuthority() {
      authorityCalls += 1;
      return true;
    },
  });
  assert.equal(result, null);
  assert.equal(authorityCalls, 0);
});

test("active account is returned unchanged", async () => {
  const account = { userId: "user123", status: "active" };
  let receivedStatus = null;
  const result = await resolveCurrentAuthorizedAccount({
    async resolveCurrentAccount() {
      return account;
    },
    hasAccountSessionAuthority(status) {
      receivedStatus = status;
      return true;
    },
  });
  assert.equal(receivedStatus, "active");
  assert.strictEqual(result, account);
});

for (const status of ["disabled", "deletion_pending", "deleted"]) {
  test(`${status} fails closed`, async () => {
    const account = { userId: "user123", status };
    const result = await resolveCurrentAuthorizedAccount({
      async resolveCurrentAccount() {
        return account;
      },
      hasAccountSessionAuthority(receivedStatus) {
        assert.equal(receivedStatus, status);
        return false;
      },
    });
    assert.equal(result, null);
  });
}
