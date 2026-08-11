import assert from "node:assert/strict";
import test from "node:test";

// Isolated in its own file so this is the process's first and only import of
// env.ts: the browser-context guard runs at module top-level, and ES module
// evaluation is cached per resolved specifier, so any earlier import in the
// same process would make this assertion meaningless.
test("the credential env module refuses to evaluate in a browser context", async () => {
  globalThis.window = {};
  try {
    await assert.rejects(
      () => import("../../src/lib/providers/quran-foundation/env.ts"),
      /must never be evaluated in a browser context/,
    );
  } finally {
    delete globalThis.window;
  }
});
