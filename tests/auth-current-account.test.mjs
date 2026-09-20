import test from "node:test";
import assert from "node:assert/strict";

import { resolveCurrentAccount } from "../src/lib/auth/current-account.ts";

const USER_ID = "018f2f2a-0000-7000-8000-000000000001";

test("returns null when there is no current user", async () => {
  const result = await resolveCurrentAccount({
    async resolveCurrentUserId() {
      return null;
    },

    async resolveAccountStatus() {
      throw new Error("account lookup must not run");
    },
  });

  assert.equal(result, null);
});

test("skips account lookup when there is no current user", async () => {
  let accountLookupCalls = 0;

  await resolveCurrentAccount({
    async resolveCurrentUserId() {
      return null;
    },

    async resolveAccountStatus() {
      accountLookupCalls += 1;
      return "active";
    },
  });

  assert.equal(accountLookupCalls, 0);
});

test("passes current userId unchanged to account lookup", async () => {
  let receivedUserId = null;

  const result = await resolveCurrentAccount({
    async resolveCurrentUserId() {
      return USER_ID;
    },

    async resolveAccountStatus(userId) {
      receivedUserId = userId;
      return "active";
    },
  });

  assert.equal(receivedUserId, USER_ID);
  assert.deepEqual(result, {
    userId: USER_ID,
    status: "active",
  });
});

test("returns null when account status lookup returns null", async () => {
  const result = await resolveCurrentAccount({
    async resolveCurrentUserId() {
      return USER_ID;
    },

    async resolveAccountStatus() {
      return null;
    },
  });

  assert.equal(result, null);
});

for (const status of ["active", "disabled", "deletion_pending", "deleted"]) {
  test(`returns ${status} unchanged in current account context`, async () => {
    const result = await resolveCurrentAccount({
      async resolveCurrentUserId() {
        return USER_ID;
      },

      async resolveAccountStatus() {
        return status;
      },
    });

    assert.deepEqual(result, {
      userId: USER_ID,
      status,
    });

    assert.deepEqual(Object.keys(result).sort(), ["status", "userId"]);
  });
}
