import assert from "node:assert/strict";
import test from "node:test";

import { validate as validateUuid, version as uuidVersion } from "uuid";

import { createId } from "../src/db/ids.ts";
import { assertSafeDatabaseTarget } from "../src/db/env.ts";

const safeEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://alsamad:secret@127.0.0.1:55432/alsamad_test",
  DATABASE_SSL: "false",
};

test("creates UUIDv7 identifiers", () => {
  const id = createId();
  assert.equal(validateUuid(id), true);
  assert.equal(uuidVersion(id), 7);
});

test("accepts only explicit local database targets", () => {
  assert.doesNotThrow(() => assertSafeDatabaseTarget(safeEnv));
  assert.throws(() =>
    assertSafeDatabaseTarget({ ...safeEnv, NODE_ENV: "production" }),
  );
  assert.throws(() =>
    assertSafeDatabaseTarget({
      ...safeEnv,
      DATABASE_URL: "postgresql://alsamad:secret@db.example.com/alsamad_test",
    }),
  );
  assert.throws(() =>
    assertSafeDatabaseTarget({
      ...safeEnv,
      DATABASE_URL: "postgresql://alsamad:secret@127.0.0.1/postgres",
    }),
  );
});
