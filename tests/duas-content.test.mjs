import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";

import { SourceTrustPanel } from "../src/components/duas/source-trust-panel.tsx";
import {
  DUA_CATEGORIES,
  DUA_CATEGORY_COUNT,
  findCategoryById,
  findCategoryByRouteSlug,
  implementedCategories,
} from "../src/lib/duas/content/structure.ts";
import {
  createStaticDuaContentSource,
  emptyDuaContentSource,
} from "../src/lib/duas/content/static-source.ts";
import { getDuaContentSource } from "../src/lib/duas/content/source.ts";
import {
  getCategoryItemsReaderData,
  getCategoryReaderData,
  getDuaOverallStatus,
  listCategoryReaderData,
} from "../src/lib/duas/content/reader-data.ts";
import { searchDuaIndex } from "../src/lib/duas/content/search.ts";
import {
  EMPTY_DUA_SOURCE_METADATA,
  PLACEHOLDER_NOTICE,
} from "../src/lib/duas/content/types.ts";
import { generalDuas } from "../src/lib/general-duas.ts";

// ---------------------------------------------------------------------------
// Structure: real category taxonomy, never content.
// ---------------------------------------------------------------------------

test("structure declares eight categories, exactly one implemented today", () => {
  assert.equal(DUA_CATEGORY_COUNT, 8);
  assert.equal(DUA_CATEGORIES.length, 8);
  const implemented = implementedCategories();
  assert.equal(implemented.length, 1);
  assert.equal(implemented[0].id, "general");
});

test("unimplemented categories have no route slug", () => {
  for (const id of [
    "family",
    "health",
    "provision",
    "travel",
    "forgiveness",
    "gratitude",
    "protection",
  ]) {
    const category = findCategoryById(id);
    assert.ok(category, `expected category "${id}" to exist structurally`);
    assert.equal(category.routeSlug, null);
  }
});

test("findCategoryByRouteSlug resolves the real route and rejects others", () => {
  assert.equal(findCategoryByRouteSlug("general")?.id, "general");
  assert.equal(findCategoryByRouteSlug("family"), undefined);
  assert.equal(findCategoryByRouteSlug("not-a-category"), undefined);
});

// ---------------------------------------------------------------------------
// Honest states via the pure static source (empty by default).
// ---------------------------------------------------------------------------

test("empty state: the pure static source reports every category empty with no items", async () => {
  const availability =
    await emptyDuaContentSource.getCategoryAvailability("family");
  assert.equal(availability.status, "empty");
  assert.equal(availability.itemCount, null);
  assert.deepEqual(await emptyDuaContentSource.getCategoryItems("family"), []);

  const snapshot = await emptyDuaContentSource.getSnapshot();
  assert.equal(snapshot.status, "empty");
  assert.equal(snapshot.availableCategoryCount, 0);
  assert.equal(snapshot.totalCategoryCount, 8);
});

test("pending state: an override reports pending with no items exposed", async () => {
  const source = createStaticDuaContentSource({
    family: { status: "pending" },
  });
  const availability = await source.getCategoryAvailability("family");
  assert.equal(availability.status, "pending");
  assert.equal(availability.itemCount, null);
  assert.deepEqual(await source.getCategoryItems("family"), []);
});

const SYNTHETIC_AUTHENTIC_ITEM = {
  id: "synthetic-authentic-1",
  order: 1,
  kind: "authentic",
  title: "Synthetic test fixture",
  arabicText: "نص تجريبي محايد للاختبار فقط",
  translation: "A neutral synthetic fixture, for tests only.",
  transliteration: null,
  source: {
    ...EMPTY_DUA_SOURCE_METADATA,
    sourceType: "quran",
    sourceTitle: "Synthetic test fixture",
  },
};

const SYNTHETIC_EDITORIAL_ITEM = {
  id: "synthetic-editorial-1",
  order: 2,
  kind: "editorial",
  title: "Synthetic editorial fixture",
  arabicText: "نص تحريري تجريبي محايد للاختبار فقط",
  translation: null,
  transliteration: null,
  source: EMPTY_DUA_SOURCE_METADATA,
};

test("available state: an override exposes real, sourced items and a count", async () => {
  const source = createStaticDuaContentSource({
    health: {
      status: "available",
      items: [SYNTHETIC_AUTHENTIC_ITEM, SYNTHETIC_EDITORIAL_ITEM],
    },
  });
  const availability = await source.getCategoryAvailability("health");
  assert.equal(availability.status, "available");
  assert.equal(availability.itemCount, 2);

  const items = await source.getCategoryItems("health");
  assert.equal(items.length, 2);
  assert.equal(items[0].kind, "authentic");
  assert.equal(items[1].kind, "editorial");
});

// ---------------------------------------------------------------------------
// Authentic vs Editorial separation.
// ---------------------------------------------------------------------------

test("authentic and editorial items are never merged into one kind", () => {
  assert.notEqual(SYNTHETIC_AUTHENTIC_ITEM.kind, SYNTHETIC_EDITORIAL_ITEM.kind);
  assert.ok(["authentic", "editorial"].includes(SYNTHETIC_AUTHENTIC_ITEM.kind));
  assert.ok(["authentic", "editorial"].includes(SYNTHETIC_EDITORIAL_ITEM.kind));
});

test("P2-1 regression: an available item whose source is not actually authenticated never shows a Verified badge", () => {
  const unverifiedSource = {
    ...EMPTY_DUA_SOURCE_METADATA,
    sourceType: "collection",
    authenticity: "unverified",
  };
  const markup = renderToStaticMarkup(
    SourceTrustPanel({
      locale: "en",
      status: "available",
      source: unverifiedSource,
    }),
  );
  assert.doesNotMatch(markup, /Verified\b/);
  assert.match(markup, /Not yet verified/);
  // The badge and the detail table must never disagree: both are read from
  // the same source.authenticity value, so an unverified item's own field
  // list must say the same thing as its badge, never "Verified".
  assert.match(markup, /Authenticity/);
  assert.match(markup, /unverified/);
});

test("P2-1 regression: authenticity, not category status, decides the Verified badge — a truly verified item still shows Verified", () => {
  const verifiedSource = {
    ...EMPTY_DUA_SOURCE_METADATA,
    sourceType: "quran",
    authenticity: "verified",
  };
  const markup = renderToStaticMarkup(
    SourceTrustPanel({
      locale: "en",
      status: "available",
      source: verifiedSource,
    }),
  );
  assert.match(markup, /Verified\b/);
});

test("the production source honestly reports the real, existing editorial duas as available", async () => {
  const availability =
    await getDuaContentSource().getCategoryAvailability("general");
  assert.equal(availability.status, "available");
  // Never fabricated: the count is read from the real, existing
  // general-duas.ts list, not hardcoded.
  assert.equal(availability.itemCount, generalDuas.length);
  assert.ok(generalDuas.length > 0);
});

test("the production source still reports every other category honestly empty", async () => {
  for (const id of ["family", "health", "provision", "travel"]) {
    const availability =
      await getDuaContentSource().getCategoryAvailability(id);
    assert.equal(availability.status, "empty");
  }
});

test("P1 regression: general availability, listed availability, and returned items never disagree on count", async () => {
  const source = getDuaContentSource();
  const availability = await source.getCategoryAvailability("general");
  const list = await source.listCategoryAvailability();
  const listedGeneral = list.find((entry) => entry.categoryId === "general");
  const items = await source.getCategoryItems("general");

  assert.equal(availability.itemCount, generalDuas.length);
  assert.equal(listedGeneral.itemCount, generalDuas.length);
  assert.equal(items.length, generalDuas.length);
  assert.equal(items.length, availability.itemCount);
  assert.ok(items.length > 0);
});

test("P1 regression: returned general items correspond to the real generalDuas entries, not invented copies", async () => {
  const items = await getDuaContentSource().getCategoryItems("general");

  const itemsBySlug = new Map(items.map((item) => [item.id, item]));
  for (const dua of generalDuas) {
    const item = itemsBySlug.get(dua.slug);
    assert.ok(item, `expected a projected DuaItem for slug "${dua.slug}"`);
    assert.equal(item.title, dua.title.ar);
    assert.equal(item.arabicText, dua.arabic);
    assert.equal(item.translation, dua.translation);
    assert.equal(item.transliteration, dua.transliteration ?? null);
    assert.equal(item.kind, "editorial");
    assert.deepEqual(item.source, EMPTY_DUA_SOURCE_METADATA);
  }

  // Deterministic, stable ordering — matches generalDuas' own array order.
  assert.deepEqual(
    items.map((item) => item.order),
    items.map((_, index) => index + 1),
  );
});

// ---------------------------------------------------------------------------
// reader-data: dependency-injected source, used by the pages.
// ---------------------------------------------------------------------------

test("getCategoryReaderData resolves each honest state via an injected source", async () => {
  const source = createStaticDuaContentSource({
    family: { status: "pending" },
    health: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
  });

  const travel = await getCategoryReaderData("travel", source);
  assert.equal(travel.status, "empty");
  assert.equal(travel.routeSlug, null);

  const family = await getCategoryReaderData("family", source);
  assert.equal(family.status, "pending");

  const health = await getCategoryReaderData("health", source);
  assert.equal(health.status, "available");
  assert.equal(health.itemCount, 1);
});

test("routing: getCategoryReaderData returns null for an unknown category id", async () => {
  assert.equal(await getCategoryReaderData("not-a-category"), null);
});

test("listCategoryReaderData merges structure with availability for all eight categories", async () => {
  const source = createStaticDuaContentSource({
    health: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
  });
  const list = await listCategoryReaderData(source);
  assert.equal(list.length, 8);
  const health = list.find((c) => c.id === "health");
  assert.equal(health.status, "available");
  assert.equal(health.itemCount, 1);
});

test("getCategoryItemsReaderData returns the synthetic fixture unchanged", async () => {
  const source = createStaticDuaContentSource({
    health: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
  });
  const items = await getCategoryItemsReaderData("health", source);
  assert.deepEqual(items, [SYNTHETIC_AUTHENTIC_ITEM]);
});

test("getDuaOverallStatus mirrors the injected source's snapshot", async () => {
  const source = createStaticDuaContentSource({
    health: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
  });
  const snapshot = await getDuaOverallStatus(source);
  assert.equal(snapshot.availableCategoryCount, 1);
});

test("P2 regression: aggregate status precedence — all categories empty reports empty", async () => {
  const snapshot = await emptyDuaContentSource.getSnapshot();
  assert.equal(snapshot.status, "empty");
});

test("P2 regression: aggregate status precedence — pending-only (no available) reports pending", async () => {
  const source = createStaticDuaContentSource({
    family: { status: "pending" },
  });
  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "pending");
});

test("P2 regression: aggregate status precedence — available + empty reports available, never pending", async () => {
  const source = createStaticDuaContentSource({
    general: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
  });
  const snapshot = await source.getSnapshot();
  // This is the exact real-production shape (one available category, the
  // rest empty) that previously and incorrectly reported "pending".
  assert.equal(snapshot.status, "available");
});

test("P2 regression: aggregate status precedence — available + pending still reports available, since real published content must never be hidden behind a review-pending label", async () => {
  const source = createStaticDuaContentSource({
    general: { status: "available", items: [SYNTHETIC_AUTHENTIC_ITEM] },
    family: { status: "pending" },
  });
  const snapshot = await source.getSnapshot();
  assert.equal(snapshot.status, "available");
});

test("P2 regression: the real production Duas snapshot honestly reports available, not pending, given General Duas exist and every other category is empty", async () => {
  const snapshot = await getDuaContentSource().getSnapshot();
  assert.equal(snapshot.status, "available");
  assert.equal(snapshot.availableCategoryCount, 1);
  assert.equal(snapshot.totalCategoryCount, DUA_CATEGORY_COUNT);
});

test("PLACEHOLDER_NOTICE is the fixed, greppable honesty marker", () => {
  assert.equal(PLACEHOLDER_NOTICE, "Placeholder — awaiting licensed content");
});

// ---------------------------------------------------------------------------
// Search: category labels only, honest empty state, never fake content.
// ---------------------------------------------------------------------------

const SEARCH_FIXTURE = [
  {
    categoryId: "general",
    label: "General duas",
    routeSlug: "general",
    status: "available",
  },
  {
    categoryId: "family",
    label: "Family duas",
    routeSlug: null,
    status: "empty",
  },
];

test("search: empty query returns no hits", () => {
  assert.deepEqual(searchDuaIndex(SEARCH_FIXTURE, ""), []);
  assert.deepEqual(searchDuaIndex(SEARCH_FIXTURE, "   "), []);
});

test("search: matches by label, case-insensitively", () => {
  const hits = searchDuaIndex(SEARCH_FIXTURE, "family");
  assert.equal(hits.length, 1);
  assert.equal(hits[0].categoryId, "family");

  const upper = searchDuaIndex(SEARCH_FIXTURE, "FAMILY");
  assert.equal(upper.length, 1);
});

test("search: an unmatched query returns an honest empty result", () => {
  assert.deepEqual(searchDuaIndex(SEARCH_FIXTURE, "xyz-nonexistent"), []);
});

test("search: unimplemented categories still surface with a null routeSlug", () => {
  const hits = searchDuaIndex(SEARCH_FIXTURE, "family");
  assert.equal(hits[0].routeSlug, null);
});
