import test from "node:test";
import assert from "node:assert/strict";

import {
  ADHKAR_CATEGORIES,
  ADHKAR_CATEGORY_COUNT,
  findCategoryById,
  findCategoryByRouteSlug,
  implementedCategories,
} from "../src/lib/adhkar/content/structure.ts";
import {
  createStaticAdhkarContentSource,
  emptyAdhkarContentSource,
} from "../src/lib/adhkar/content/static-source.ts";
import { getAdhkarContentSource } from "../src/lib/adhkar/content/source.ts";
import {
  getAdhkarOverallStatus,
  getCategoryItemsReaderData,
  getCategoryReaderData,
  listCategoryReaderData,
} from "../src/lib/adhkar/content/reader-data.ts";
import { searchAdhkarIndex } from "../src/lib/adhkar/content/search.ts";
import {
  EMPTY_SOURCE_METADATA,
  PLACEHOLDER_NOTICE,
} from "../src/lib/adhkar/content/types.ts";
import {
  createRepetitionState,
  incrementRepetition,
  isRepetitionComplete,
  repetitionPercent,
  resetRepetition,
} from "../src/lib/adhkar/repetition-logic.ts";

// ---------------------------------------------------------------------------
// Structure: real category taxonomy, never content.
// ---------------------------------------------------------------------------

test("structure declares six categories, exactly two implemented today", () => {
  assert.equal(ADHKAR_CATEGORY_COUNT, 6);
  assert.equal(ADHKAR_CATEGORIES.length, 6);
  const implemented = implementedCategories();
  assert.equal(implemented.length, 2);
  assert.deepEqual(implemented.map((c) => c.id).sort(), ["evening", "morning"]);
});

test("unimplemented categories have no route slug", () => {
  for (const id of ["sleep", "travel", "prayer", "general"]) {
    const category = findCategoryById(id);
    assert.ok(category, `expected category "${id}" to exist structurally`);
    assert.equal(category.routeSlug, null);
  }
});

test("findCategoryByRouteSlug resolves real routes and rejects others", () => {
  assert.equal(findCategoryByRouteSlug("morning")?.id, "morning");
  assert.equal(findCategoryByRouteSlug("evening")?.id, "evening");
  assert.equal(findCategoryByRouteSlug("sleep"), undefined);
  assert.equal(findCategoryByRouteSlug("not-a-category"), undefined);
});

// ---------------------------------------------------------------------------
// State 1: no verified content available (the honest default today).
// ---------------------------------------------------------------------------

test("the default source is the static, credential-free source", () => {
  assert.equal(getAdhkarContentSource().kind, "static");
});

test("empty state: default source reports every category empty with no items", async () => {
  const availability =
    await emptyAdhkarContentSource.getCategoryAvailability("morning");
  assert.equal(availability.status, "empty");
  assert.equal(availability.itemCount, null);

  const items = await emptyAdhkarContentSource.getCategoryItems("morning");
  assert.deepEqual(items, []);

  const list = await emptyAdhkarContentSource.listCategoryAvailability();
  assert.equal(list.length, 6);
  assert.ok(list.every((c) => c.status === "empty" && c.itemCount === null));

  const snapshot = await emptyAdhkarContentSource.getSnapshot();
  assert.equal(snapshot.status, "empty");
  assert.equal(snapshot.availableCategoryCount, 0);
  assert.equal(snapshot.totalCategoryCount, 6);
});

// ---------------------------------------------------------------------------
// State 2: verified content pending review.
// ---------------------------------------------------------------------------

test("pending state: an override reports pending with no items exposed", async () => {
  const source = createStaticAdhkarContentSource({
    morning: { status: "pending" },
  });
  const availability = await source.getCategoryAvailability("morning");
  assert.equal(availability.status, "pending");
  assert.equal(availability.itemCount, null);
  assert.deepEqual(await source.getCategoryItems("morning"), []);

  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "pending");
  assert.equal(snapshot.availableCategoryCount, 0);
});

// ---------------------------------------------------------------------------
// State 3: verified content available.
// ---------------------------------------------------------------------------

const SYNTHETIC_ITEM = {
  id: "synthetic-1",
  order: 1,
  arabicText: "نص تجريبي محايد للاختبار فقط",
  translation: "A neutral synthetic fixture, for tests only.",
  transliteration: null,
  repeatCount: 3,
  source: {
    ...EMPTY_SOURCE_METADATA,
    sourceType: "other",
    sourceTitle: "Synthetic test fixture",
  },
};

test("available state: an override exposes real, sourced items and a count", async () => {
  const source = createStaticAdhkarContentSource({
    evening: { status: "available", items: [SYNTHETIC_ITEM] },
  });
  const availability = await source.getCategoryAvailability("evening");
  assert.equal(availability.status, "available");
  assert.equal(availability.itemCount, 1);

  const items = await source.getCategoryItems("evening");
  assert.equal(items.length, 1);
  assert.equal(items[0].id, "synthetic-1");

  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "pending"); // 1 of 6 available is still overall "in progress"
  assert.equal(snapshot.availableCategoryCount, 1);
});

test("overall snapshot reports available only once every category is available", async () => {
  const overrides = {};
  for (const category of ADHKAR_CATEGORIES) {
    overrides[category.id] = { status: "available", items: [SYNTHETIC_ITEM] };
  }
  const source = createStaticAdhkarContentSource(overrides);
  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "available");
  assert.equal(snapshot.availableCategoryCount, 6);
});

// ---------------------------------------------------------------------------
// reader-data: dependency-injected source, used by the pages.
// ---------------------------------------------------------------------------

test("getCategoryReaderData resolves each honest state via an injected source", async () => {
  const source = createStaticAdhkarContentSource({
    morning: { status: "pending" },
    evening: { status: "available", items: [SYNTHETIC_ITEM] },
  });

  const sleep = await getCategoryReaderData("sleep", source);
  assert.equal(sleep.status, "empty");
  assert.equal(sleep.routeSlug, null);

  const morning = await getCategoryReaderData("morning", source);
  assert.equal(morning.status, "pending");
  assert.equal(morning.routeSlug, "morning");

  const evening = await getCategoryReaderData("evening", source);
  assert.equal(evening.status, "available");
  assert.equal(evening.itemCount, 1);
});

test("routing: getCategoryReaderData returns null for an unknown category id", async () => {
  assert.equal(await getCategoryReaderData("not-a-category"), null);
});

test("listCategoryReaderData merges structure with availability for all six categories", async () => {
  const source = createStaticAdhkarContentSource({
    evening: { status: "available", items: [SYNTHETIC_ITEM] },
  });
  const list = await listCategoryReaderData(source);
  assert.equal(list.length, 6);
  const evening = list.find((c) => c.id === "evening");
  assert.equal(evening.status, "available");
  assert.equal(evening.itemCount, 1);
});

test("getCategoryItemsReaderData returns the synthetic fixture unchanged", async () => {
  const source = createStaticAdhkarContentSource({
    evening: { status: "available", items: [SYNTHETIC_ITEM] },
  });
  const items = await getCategoryItemsReaderData("evening", source);
  assert.deepEqual(items, [SYNTHETIC_ITEM]);
});

test("getAdhkarOverallStatus mirrors the injected source's snapshot", async () => {
  const source = createStaticAdhkarContentSource({
    evening: { status: "available", items: [SYNTHETIC_ITEM] },
  });
  const snapshot = await getAdhkarOverallStatus(source);
  assert.equal(snapshot.availableCategoryCount, 1);
});

test("PLACEHOLDER_NOTICE is the fixed, greppable honesty marker", () => {
  assert.equal(PLACEHOLDER_NOTICE, "Placeholder — awaiting licensed content");
});

// ---------------------------------------------------------------------------
// Search: category labels only, honest empty state, never fake content.
// ---------------------------------------------------------------------------

const SEARCH_FIXTURE = [
  {
    categoryId: "morning",
    label: "Morning adhkar",
    routeSlug: "morning",
    status: "empty",
  },
  {
    categoryId: "sleep",
    label: "Sleep adhkar",
    routeSlug: null,
    status: "empty",
  },
];

test("search: empty query returns no hits", () => {
  assert.deepEqual(searchAdhkarIndex(SEARCH_FIXTURE, ""), []);
  assert.deepEqual(searchAdhkarIndex(SEARCH_FIXTURE, "   "), []);
});

test("search: matches by label, case-insensitively", () => {
  const hits = searchAdhkarIndex(SEARCH_FIXTURE, "morning");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].categoryId, "morning");

  const upper = searchAdhkarIndex(SEARCH_FIXTURE, "MORNING");
  assert.equal(upper.length, 1);
});

test("search: an unmatched query returns an honest empty result", () => {
  assert.deepEqual(searchAdhkarIndex(SEARCH_FIXTURE, "xyz-nonexistent"), []);
});

test("search: unimplemented categories still surface with a null routeSlug", () => {
  const hits = searchAdhkarIndex(SEARCH_FIXTURE, "sleep");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].routeSlug, null);
});

// ---------------------------------------------------------------------------
// Repetition interaction: pure logic, synthetic fixtures only.
// ---------------------------------------------------------------------------

test("createRepetitionState starts at zero and clamps a non-positive target", () => {
  assert.deepEqual(createRepetitionState(33), { current: 0, target: 33 });
  assert.deepEqual(createRepetitionState(0), { current: 0, target: 1 });
  assert.deepEqual(createRepetitionState(-5), { current: 0, target: 1 });
});

test("incrementRepetition advances by one and never exceeds the target", () => {
  let state = createRepetitionState(3);
  state = incrementRepetition(state);
  assert.equal(state.current, 1);
  state = incrementRepetition(state);
  state = incrementRepetition(state);
  assert.equal(state.current, 3);
  state = incrementRepetition(state); // one past target
  assert.equal(state.current, 3);
});

test("resetRepetition returns current to zero without changing the target", () => {
  let state = createRepetitionState(10);
  state = incrementRepetition(incrementRepetition(state));
  assert.equal(state.current, 2);
  state = resetRepetition(state);
  assert.deepEqual(state, { current: 0, target: 10 });
});

test("isRepetitionComplete is true only once current reaches target", () => {
  let state = createRepetitionState(2);
  assert.equal(isRepetitionComplete(state), false);
  state = incrementRepetition(state);
  assert.equal(isRepetitionComplete(state), false);
  state = incrementRepetition(state);
  assert.equal(isRepetitionComplete(state), true);
});

test("repetitionPercent reflects current progress toward target", () => {
  let state = createRepetitionState(4);
  assert.equal(repetitionPercent(state), 0);
  state = incrementRepetition(state);
  assert.equal(repetitionPercent(state), 25);
  state = incrementRepetition(incrementRepetition(incrementRepetition(state)));
  assert.equal(repetitionPercent(state), 100);
});
