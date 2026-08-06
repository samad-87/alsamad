import test from "node:test";
import assert from "node:assert/strict";

import { createDatabaseQuranContentSource } from "../src/lib/quran/content/db-source.ts";
import { getQuranContentSource } from "../src/lib/quran/content/source.ts";

// These tests prove the M5.2-style guarantee for M5.4's read seam: the
// database-backed source is real, future-ready code, but it never requires
// credentials to exist, never throws, and never fetches from a provider —
// it degrades to the same honest "empty" result whenever it cannot prove
// otherwise. It is deliberately not the source wired into any page yet.

test("the database source is not the active default (no live DB required to run the app)", () => {
  assert.equal(getQuranContentSource().kind, "static");
});

test("database source: with no DATABASE_URL, every call resolves to empty without throwing", async () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const source = createDatabaseQuranContentSource();
    assert.equal(source.kind, "database");

    const availability = await source.getSurahAvailability(1);
    assert.deepEqual(availability, {
      surahNumber: 1,
      status: "empty",
      ayahCount: null,
    });

    const list = await source.listSurahAvailability();
    assert.equal(list.length, 114);
    assert.ok(list.every((s) => s.status === "empty" && s.ayahCount === null));

    const snapshot = await source.getSnapshot();
    assert.deepEqual(snapshot.status, "empty");
    assert.equal(snapshot.availableSurahCount, 0);
    assert.equal(snapshot.totalSurahCount, 114);
  } finally {
    if (original === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = original;
    }
  }
});

test("database source: an invalid DATABASE_URL still resolves to empty instead of throwing", async () => {
  const original = process.env.DATABASE_URL;
  process.env.DATABASE_URL = "not-a-valid-postgres-url";
  try {
    const source = createDatabaseQuranContentSource();
    const availability = await source.getSurahAvailability(1);
    assert.equal(availability.status, "empty");
    assert.equal(availability.ayahCount, null);
  } finally {
    if (original === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = original;
    }
  }
});
