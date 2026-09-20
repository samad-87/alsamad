import test from "node:test";
import assert from "node:assert/strict";

import { hasAccountSessionAuthority } from "../src/lib/auth/account-session-authority.ts";

test("active has session authority", () => {
  assert.equal(hasAccountSessionAuthority("active"), true);
});

for (const status of ["disabled", "deletion_pending", "deleted"]) {
  test(`${status} has no session authority`, () => {
    assert.equal(hasAccountSessionAuthority(status), false);
  });
}
