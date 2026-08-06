import test from "node:test";
import assert from "node:assert/strict";

import {
  QURAN_SURAH_COUNT,
  adjacentSurahStructures,
  findSurahStructure,
  surahStructures,
} from "../src/lib/quran/content/structure.ts";
import {
  createStaticQuranContentSource,
  emptyQuranContentSource,
} from "../src/lib/quran/content/static-source.ts";
import { getQuranContentSource } from "../src/lib/quran/content/source.ts";
import {
  getQuranOverallStatus,
  getSurahReaderData,
  listSurahReaderData,
  verseSlotsFor,
} from "../src/lib/quran/content/reader-data.ts";
import { searchSurahIndex } from "../src/lib/quran/content/search.ts";
import { PLACEHOLDER_NOTICE } from "../src/lib/quran/content/types.ts";

// ---------------------------------------------------------------------------
// Structure: pure, real facts only (114 chapters), never content.
// ---------------------------------------------------------------------------

test("structure declares exactly 114 surahs numbered 1..114 with matching slugs", () => {
  assert.equal(QURAN_SURAH_COUNT, 114);
  assert.equal(surahStructures.length, 114);
  surahStructures.forEach((surah, index) => {
    assert.equal(surah.number, index + 1);
    assert.equal(surah.slug, String(index + 1));
  });
});

test("findSurahStructure resolves valid slugs and rejects invalid ones", () => {
  assert.deepEqual(findSurahStructure("1"), { number: 1, slug: "1" });
  assert.deepEqual(findSurahStructure("114"), { number: 114, slug: "114" });
  assert.equal(findSurahStructure("0"), undefined);
  assert.equal(findSurahStructure("115"), undefined);
  assert.equal(findSurahStructure("abc"), undefined);
});

test("adjacentSurahStructures has no previous before 1 and no next after 114", () => {
  assert.equal(adjacentSurahStructures(1).previous, undefined);
  assert.equal(adjacentSurahStructures(1).next?.number, 2);
  assert.equal(adjacentSurahStructures(114).next, undefined);
  assert.equal(adjacentSurahStructures(114).previous?.number, 113);
});

// ---------------------------------------------------------------------------
// State 1: no content imported (the honest default today).
// ---------------------------------------------------------------------------

test("the default source is the static, credential-free source", () => {
  assert.equal(getQuranContentSource().kind, "static");
});

test("empty state: default source reports every surah empty with no ayah count", async () => {
  const availability = await emptyQuranContentSource.getSurahAvailability(42);
  assert.equal(availability.status, "empty");
  assert.equal(availability.ayahCount, null);

  const list = await emptyQuranContentSource.listSurahAvailability();
  assert.equal(list.length, 114);
  assert.ok(list.every((s) => s.status === "empty" && s.ayahCount === null));

  const snapshot = await emptyQuranContentSource.getSnapshot();
  assert.equal(snapshot.status, "empty");
  assert.equal(snapshot.availableSurahCount, 0);
  assert.equal(snapshot.totalSurahCount, 114);
});

// ---------------------------------------------------------------------------
// State 2: import pending.
// ---------------------------------------------------------------------------

test("pending state: an override reports pending with no fabricated ayah count", async () => {
  const source = createStaticQuranContentSource({
    2: { status: "pending" },
  });
  const availability = await source.getSurahAvailability(2);
  assert.equal(availability.status, "pending");
  assert.equal(availability.ayahCount, null);

  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "pending");
  assert.equal(snapshot.availableSurahCount, 0);
});

// ---------------------------------------------------------------------------
// State 3: content available.
// ---------------------------------------------------------------------------

test("available state: an override reports a real, sourced ayah count", async () => {
  const source = createStaticQuranContentSource({
    3: { status: "available", ayahCount: 7 },
  });
  const availability = await source.getSurahAvailability(3);
  assert.equal(availability.status, "available");
  assert.equal(availability.ayahCount, 7);

  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "pending"); // 1 of 114 available is still overall "in progress"
  assert.equal(snapshot.availableSurahCount, 1);
});

test("overall snapshot reports available only once every surah is available", async () => {
  const overrides = {};
  for (const surah of surahStructures) {
    overrides[surah.number] = { status: "available", ayahCount: 3 };
  }
  const source = createStaticQuranContentSource(overrides);
  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "available");
  assert.equal(snapshot.availableSurahCount, 114);
});

test("an available override ignores an ayah count unless status is available", async () => {
  const source = createStaticQuranContentSource({
    5: { status: "empty", ayahCount: 999 },
  });
  const availability = await source.getSurahAvailability(5);
  assert.equal(availability.status, "empty");
  assert.equal(availability.ayahCount, null);
});

// ---------------------------------------------------------------------------
// reader-data: dependency-injected source, used by the pages.
// ---------------------------------------------------------------------------

test("getSurahReaderData resolves each honest state via an injected source", async () => {
  const source = createStaticQuranContentSource({
    2: { status: "pending" },
    3: { status: "available", ayahCount: 7 },
  });

  const empty = await getSurahReaderData("1", source);
  assert.equal(empty.status, "empty");
  assert.equal(empty.ayahCount, null);

  const pending = await getSurahReaderData("2", source);
  assert.equal(pending.status, "pending");
  assert.equal(pending.ayahCount, null);

  const available = await getSurahReaderData("3", source);
  assert.equal(available.status, "available");
  assert.equal(available.ayahCount, 7);
});

test("routing: getSurahReaderData returns null for a structurally invalid slug", async () => {
  assert.equal(await getSurahReaderData("0"), null);
  assert.equal(await getSurahReaderData("115"), null);
  assert.equal(await getSurahReaderData("not-a-surah"), null);
});

test("listSurahReaderData merges structure with availability for all 114 surahs", async () => {
  const source = createStaticQuranContentSource({
    3: { status: "available", ayahCount: 7 },
  });
  const list = await listSurahReaderData(source);
  assert.equal(list.length, 114);
  assert.equal(list[0].status, "empty");
  const third = list.find((s) => s.number === 3);
  assert.equal(third.status, "available");
  assert.equal(third.ayahCount, 7);
});

test("getQuranOverallStatus mirrors the injected source's snapshot", async () => {
  const source = createStaticQuranContentSource({
    3: { status: "available", ayahCount: 7 },
  });
  const snapshot = await getQuranOverallStatus(source);
  assert.equal(snapshot.availableSurahCount, 1);
});

// ---------------------------------------------------------------------------
// Honest placeholder behaviour: never fabricate verses.
// ---------------------------------------------------------------------------

test("verseSlotsFor never fabricates verses for empty or pending surahs", () => {
  assert.deepEqual(
    verseSlotsFor({ number: 1, slug: "1", status: "empty", ayahCount: null }),
    [],
  );
  assert.deepEqual(
    verseSlotsFor({ number: 1, slug: "1", status: "pending", ayahCount: null }),
    [],
  );
});

test("verseSlotsFor produces exactly the real, sourced ayah count for available surahs", () => {
  const slots = verseSlotsFor({
    number: 3,
    slug: "3",
    status: "available",
    ayahCount: 3,
  });
  assert.equal(slots.length, 3);
  assert.deepEqual(
    slots.map((slot) => slot.reference),
    ["3:1", "3:2", "3:3"],
  );
  assert.equal(slots[0].elementId, "ayah-3-1");
});

test("PLACEHOLDER_NOTICE is the fixed, greppable honesty marker", () => {
  assert.equal(PLACEHOLDER_NOTICE, "Placeholder — awaiting licensed content");
});

// ---------------------------------------------------------------------------
// Search: structural facts always resolve; unverified ayah ranges never do.
// ---------------------------------------------------------------------------

const searchFixture = [
  { number: 2, slug: "2", status: "empty", ayahCount: null },
  { number: 3, slug: "3", status: "available", ayahCount: 7 },
];

test("search: empty query returns no hits", () => {
  assert.deepEqual(searchSurahIndex(searchFixture, ""), []);
  assert.deepEqual(searchSurahIndex(searchFixture, "   "), []);
});

test("search: a bare surah number resolves regardless of content status", () => {
  const hits = searchSurahIndex(searchFixture, "2");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kind, "surah");
  assert.equal(hits[0].surahNumber, 2);
});

test("search: an ayah reference on an empty surah cannot be verified and returns no hits", () => {
  assert.deepEqual(searchSurahIndex(searchFixture, "2:1"), []);
});

test("search: an ayah reference within a real, available range resolves", () => {
  const hits = searchSurahIndex(searchFixture, "3:5");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].kind, "reference");
  assert.equal(hits[0].reference, "3:5");
  assert.equal(hits[0].hrefSuffix, "/3#ayah-3-5");
});

test("search: an ayah reference outside the real range returns no hits", () => {
  assert.deepEqual(searchSurahIndex(searchFixture, "3:8"), []);
  assert.deepEqual(searchSurahIndex(searchFixture, "3:0"), []);
});

test("search: an unknown surah number returns no hits", () => {
  assert.deepEqual(searchSurahIndex(searchFixture, "999"), []);
});
