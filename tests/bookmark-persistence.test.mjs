import test from "node:test";
import assert from "node:assert/strict";

import { parseStoredBookmarks as parseAdhkarBookmarks } from "../src/lib/adhkar/client.ts";
import { parseStoredBookmarks as parseQuranBookmarks } from "../src/lib/quran-reader-client.ts";

const readers = [
  ["Quran", parseQuranBookmarks],
  ["Adhkar", parseAdhkarBookmarks],
];

for (const [name, parseBookmarks] of readers) {
  test(`${name} bookmarks fail closed for missing, malformed, or invalid stored state`, () => {
    for (const raw of [
      null,
      "{",
      "null",
      "{}",
      "1",
      '"text"',
      "[1,2]",
      '["valid",1]',
      '{"0":"value"}',
    ]) {
      assert.deepEqual(parseBookmarks(raw), [], raw ?? "missing storage");
    }
  });

  test(`${name} bookmarks preserve valid string arrays exactly`, () => {
    assert.deepEqual(parseBookmarks("[]"), []);
    assert.deepEqual(parseBookmarks('[""]'), [""]);
    assert.deepEqual(parseBookmarks('["a"]'), ["a"]);
    assert.deepEqual(parseBookmarks('["a","b"]'), ["a", "b"]);
  });
}
