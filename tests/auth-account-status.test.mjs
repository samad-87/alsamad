import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveAccountStatus,
  resolveCurrentAccountStatus,
} from "../src/lib/auth/account-status.ts";

const USER_ID = "018f2f2a-0000-7000-8000-000000000001";

function accountDependencies(status) {
  return {
    persistence: {
      async findStatusByUserId(userId) {
        assert.equal(userId, USER_ID);
        return status;
      },
    },
  };
}

test("resolveAccountStatus returns active unchanged", async () => {
  assert.equal(
    await resolveAccountStatus(USER_ID, accountDependencies("active")),
    "active",
  );
});

test("resolveAccountStatus returns disabled unchanged", async () => {
  assert.equal(
    await resolveAccountStatus(USER_ID, accountDependencies("disabled")),
    "disabled",
  );
});

test("resolveAccountStatus returns deletion_pending unchanged", async () => {
  assert.equal(
    await resolveAccountStatus(
      USER_ID,
      accountDependencies("deletion_pending"),
    ),
    "deletion_pending",
  );
});

test("resolveAccountStatus returns deleted unchanged", async () => {
  assert.equal(
    await resolveAccountStatus(USER_ID, accountDependencies("deleted")),
    "deleted",
  );
});

test("resolveAccountStatus returns null for missing user", async () => {
  assert.equal(
    await resolveAccountStatus(USER_ID, accountDependencies(null)),
    null,
  );
});

test("resolveCurrentAccountStatus returns null without current user and skips account lookup", async () => {
  let accountLookupCalls = 0;

  const result = await resolveCurrentAccountStatus({
    async resolveCurrentUserId() {
      return null;
    },

    async resolveAccountStatus() {
      accountLookupCalls += 1;
      return "active";
    },
  });

  assert.equal(result, null);
  assert.equal(accountLookupCalls, 0);
});

test("resolveCurrentAccountStatus passes current userId unchanged", async () => {
  let capturedUserId = null;

  const result = await resolveCurrentAccountStatus({
    async resolveCurrentUserId() {
      return USER_ID;
    },

    async resolveAccountStatus(userId) {
      capturedUserId = userId;
      return "disabled";
    },
  });

  assert.equal(capturedUserId, USER_ID);
  assert.equal(result, "disabled");
});

test("resolveCurrentAccountStatus propagates null from account lookup", async () => {
  const result = await resolveCurrentAccountStatus({
    async resolveCurrentUserId() {
      return USER_ID;
    },

    async resolveAccountStatus() {
      return null;
    },
  });

  assert.equal(result, null);
});
