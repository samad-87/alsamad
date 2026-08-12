import test from "node:test";
import assert from "node:assert/strict";

import { searchKnowledge } from "../src/lib/knowledge/search/search.ts";
import {
  createInMemoryKnowledgeSearchIndex,
  toSearchDocument,
} from "../src/lib/knowledge/search/index.ts";
import { KnowledgeEntityError } from "../src/lib/knowledge/errors.ts";

import {
  surahToKnowledgeItem,
  ayahToKnowledgeItem,
} from "../src/lib/knowledge/adapters/quran.ts";
import { adhkarCategoryToKnowledgeItem } from "../src/lib/knowledge/adapters/adhkar.ts";

import { verseSlotsFor } from "../src/lib/quran/content/reader-data.ts";

// ---------------------------------------------------------------------------
// Fixtures — a small M7.0-track / KE-1 index using only the approved Quran
// and Adhkar adapters.
// ---------------------------------------------------------------------------

const SURAH_1 = surahToKnowledgeItem({
  number: 1,
  slug: "1",
  status: "available",
  ayahCount: 7,
});
const [AYAH_1_1] = verseSlotsFor({
  number: 1,
  slug: "1",
  status: "available",
  ayahCount: 7,
});
const AYAH_ITEM = ayahToKnowledgeItem(AYAH_1_1);

const MORNING_ADHKAR = adhkarCategoryToKnowledgeItem(
  { id: "morning", routeSlug: "morning", status: "available", itemCount: 5 },
  { ar: "أذكار الصباح", en: "Morning adhkar" },
);

const PATIENCE_ADHKAR = adhkarCategoryToKnowledgeItem(
  { id: "patience", routeSlug: "patience", status: "available", itemCount: 1 },
  { ar: "Patience in Hardship", en: "Patience in Hardship" },
);

const COMMUNICATION_ADHKAR = adhkarCategoryToKnowledgeItem(
  {
    id: "communication",
    routeSlug: "communication",
    status: "empty",
    itemCount: null,
  },
  { ar: "Communication remembrance", en: "Communication remembrance" },
);

function buildMixedIndex() {
  return createInMemoryKnowledgeSearchIndex([
    toSearchDocument(SURAH_1),
    toSearchDocument(AYAH_ITEM),
    toSearchDocument(MORNING_ADHKAR),
    toSearchDocument(PATIENCE_ADHKAR),
    toSearchDocument(COMMUNICATION_ADHKAR),
  ]);
}

// ---------------------------------------------------------------------------
// Exact search
// ---------------------------------------------------------------------------

test("exact search: an exact, case-insensitive title match wins with matchType 'exact'", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "Morning adhkar");
  assert.ok(results.length > 0);
  assert.equal(results[0].matchType, "exact");
  assert.equal(results[0].matchedField, "title");
  assert.equal(results[0].item.id.canonicalKey, MORNING_ADHKAR.id.canonicalKey);
  assert.equal(results[0].score, 1);
});

test("exact search: matching is case-insensitive", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "MORNING ADHKAR");
  assert.equal(results.length, 1);
  assert.equal(results[0].matchType, "exact");
});

// ---------------------------------------------------------------------------
// Prefix search
// ---------------------------------------------------------------------------

test("prefix search: a leading-substring query matches with matchType 'prefix'", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "Patience in");
  assert.equal(results.length, 1);
  assert.equal(results[0].matchType, "prefix");
  assert.equal(results[0].item.id.canonicalKey, "category:patience");
});

// ---------------------------------------------------------------------------
// Contains search
// ---------------------------------------------------------------------------

test("contains search: a mid-string substring query matches a title with matchType 'contains'", () => {
  const index = buildMixedIndex();
  const titleHit = searchKnowledge(index, "Hardship");
  assert.equal(titleHit.length, 1);
  assert.equal(titleHit[0].matchType, "contains");
  assert.equal(titleHit[0].matchedField, "title");
});

// ---------------------------------------------------------------------------
// Slug search
// ---------------------------------------------------------------------------

test("slug search: a query equal to canonicalKey matches with matchType 'slug'", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "category:patience");
  assert.equal(results.length, 1);
  assert.equal(results[0].matchType, "slug");
  assert.equal(results[0].matchedField, "canonicalKey");
});

// ---------------------------------------------------------------------------
// Alias search
// ---------------------------------------------------------------------------

test("alias search: a query exactly matching a document alias matches with matchType 'alias', without changing the underlying KnowledgeItem", () => {
  const index = createInMemoryKnowledgeSearchIndex([
    {
      item: PATIENCE_ADHKAR,
      aliases: ["sabr-remembrance", "hardship-remembrance"],
    },
  ]);
  const results = searchKnowledge(index, "sabr-remembrance");
  assert.equal(results.length, 1);
  assert.equal(results[0].matchType, "alias");
  assert.equal(results[0].matchedField, "alias");
  assert.equal(results[0].matchedText, "sabr-remembrance");
  assert.deepEqual(results[0].item, PATIENCE_ADHKAR);
});

// ---------------------------------------------------------------------------
// Keyword search
// ---------------------------------------------------------------------------

test("keyword search: a query found inside a document keyword matches with matchType 'keyword'", () => {
  const index = createInMemoryKnowledgeSearchIndex([
    {
      item: COMMUNICATION_ADHKAR,
      keywords: ["daily remembrance", "healthy routine"],
    },
  ]);
  const results = searchKnowledge(index, "remembrance");
  assert.equal(results.length, 1);
  assert.equal(results[0].matchType, "keyword");
  assert.equal(results[0].matchedField, "keyword");
});

// ---------------------------------------------------------------------------
// No semantic/embedding/vector search exists
// ---------------------------------------------------------------------------

test("an unrelated query with no substring overlap returns no results (proves there is no semantic fallback)", () => {
  const index = buildMixedIndex();
  assert.deepEqual(searchKnowledge(index, "unrelated nonsense query xyz"), []);
});

// ---------------------------------------------------------------------------
// Filter combinations
// ---------------------------------------------------------------------------

test("filters: owningModules narrows results to a single module", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "a", {
    filters: { owningModules: ["quran"] },
  });
  assert.ok(results.length > 0);
  assert.ok(results.every((r) => r.item.id.owningModule === "quran"));
});

test("filters: kinds and editorialClasses combine (AND, not OR)", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "a", {
    filters: { kinds: ["adhkar"], editorialClasses: ["authentic"] },
  });
  assert.ok(results.length > 0);
  assert.ok(results.every((result) => result.item.id.kind === "adhkar"));
});

test("filters: verificationStates excludes non-matching items", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "a", {
    filters: { verificationStates: ["not_reviewed"] },
  });
  assert.ok(results.every((r) => r.verificationState === "not_reviewed"));
  assert.ok(
    results.some((r) => r.item.id.canonicalKey === "category:communication"),
  );
});

test("filters: locales restricts to items with a presentation in that locale", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "Patience", {
    filters: { locales: ["en"] },
  });
  assert.ok(results.length > 0);
});

// ---------------------------------------------------------------------------
// Cross-module search
// ---------------------------------------------------------------------------

test("cross-module: a single query can surface Quran and Adhkar items with zero module-specific code in the search layer", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "a");
  const modules = new Set(results.map((r) => r.item.id.owningModule));
  assert.ok(modules.has("quran"));
  assert.ok(modules.has("devotional"));
});

// ---------------------------------------------------------------------------
// Duplicate elimination
// ---------------------------------------------------------------------------

test("duplicate elimination: indexing the same item twice keeps only one copy, so a query returns it once", () => {
  const index = createInMemoryKnowledgeSearchIndex([
    toSearchDocument(PATIENCE_ADHKAR),
    toSearchDocument(PATIENCE_ADHKAR),
  ]);
  const results = searchKnowledge(index, "Patience");
  assert.equal(results.length, 1);
});

test("duplicate elimination: an item matching via more than one rule still appears only once per query", () => {
  const index = createInMemoryKnowledgeSearchIndex([
    { item: PATIENCE_ADHKAR, aliases: ["category:patience"] },
  ]);
  const results = searchKnowledge(index, "category:patience");
  assert.equal(results.length, 1);
  // slug outranks alias in priority, so slug should win.
  assert.equal(results[0].matchType, "slug");
});

// ---------------------------------------------------------------------------
// Stable ordering
// ---------------------------------------------------------------------------

test("stable ordering: results are sorted by score descending, then by formatted item id, independent of index insertion order", () => {
  const forward = createInMemoryKnowledgeSearchIndex([
    toSearchDocument(SURAH_1),
    toSearchDocument(PATIENCE_ADHKAR),
    toSearchDocument(COMMUNICATION_ADHKAR),
  ]);
  const reversed = createInMemoryKnowledgeSearchIndex([
    toSearchDocument(COMMUNICATION_ADHKAR),
    toSearchDocument(PATIENCE_ADHKAR),
    toSearchDocument(SURAH_1),
  ]);

  const resultsA = searchKnowledge(forward, "a");
  const resultsB = searchKnowledge(reversed, "a");
  assert.deepEqual(
    resultsA.map((r) => r.item.id.canonicalKey),
    resultsB.map((r) => r.item.id.canonicalKey),
  );

  for (let i = 1; i < resultsA.length; i += 1) {
    assert.ok(resultsA[i - 1].score >= resultsA[i].score);
  }
});

// ---------------------------------------------------------------------------
// Invalid filters / unknown modules / unknown kinds
// ---------------------------------------------------------------------------

test("invalid filters: an unknown owningModule filter value throws", () => {
  const index = buildMixedIndex();
  assert.throws(
    () =>
      searchKnowledge(index, "a", {
        filters: { owningModules: ["not-a-real-module"] },
      }),
    KnowledgeEntityError,
  );
});

test("invalid filters: an unknown kind filter value throws", () => {
  const index = buildMixedIndex();
  assert.throws(
    () =>
      searchKnowledge(index, "a", { filters: { kinds: ["not-a-real-kind"] } }),
    KnowledgeEntityError,
  );
});

test("invalid filters: an unknown editorialClass or verificationState filter value throws", () => {
  const index = buildMixedIndex();
  assert.throws(() =>
    searchKnowledge(index, "a", {
      filters: { editorialClasses: ["not-a-real-class"] },
    }),
  );
  assert.throws(() =>
    searchKnowledge(index, "a", {
      filters: { verificationStates: ["not-a-real-state"] },
    }),
  );
});

test("invalid filters: a blank extensionKinds value throws", () => {
  const index = buildMixedIndex();
  assert.throws(() =>
    searchKnowledge(index, "a", { filters: { extensionKinds: ["  "] } }),
  );
});

// ---------------------------------------------------------------------------
// Broken adapters
// ---------------------------------------------------------------------------

test("broken adapters: constructing an index from a document with no presentations throws instead of indexing silently", () => {
  assert.throws(
    () =>
      createInMemoryKnowledgeSearchIndex([
        { item: { ...PATIENCE_ADHKAR, presentations: [] } },
      ]),
    KnowledgeEntityError,
  );
});

test("broken adapters: constructing an index from a document with no item id throws", () => {
  assert.throws(
    () =>
      createInMemoryKnowledgeSearchIndex([
        { item: { ...PATIENCE_ADHKAR, id: undefined } },
      ]),
    KnowledgeEntityError,
  );
});

// ---------------------------------------------------------------------------
// Score determinism and relationship count placeholder
// ---------------------------------------------------------------------------

test("score: is a fixed function of matchType only, not of item content", () => {
  const index = buildMixedIndex();
  const exactScores = searchKnowledge(index, "Morning adhkar")
    .filter((r) => r.matchType === "exact")
    .map((r) => r.score);
  assert.deepEqual(exactScores, [1]);
});

test("relationship count: null by default (this layer never traverses relationships itself)", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "Morning adhkar");
  assert.equal(results[0].relationshipCount, null);
});

test("relationship count: populated only via an explicitly injected pure lookup function", () => {
  const index = buildMixedIndex();
  const results = searchKnowledge(index, "Morning adhkar", {
    relationshipCountLookup: () => 3,
  });
  assert.equal(results[0].relationshipCount, 3);
});

// ---------------------------------------------------------------------------
// Result surface: every field the mission requires is present
// ---------------------------------------------------------------------------

test("result surface: every required result field is present and pass-through fields match the source KnowledgeItem", () => {
  const index = buildMixedIndex();
  const [result] = searchKnowledge(index, "Morning adhkar");
  assert.equal(result.source, MORNING_ADHKAR.source);
  assert.equal(result.verificationState, MORNING_ADHKAR.verificationState);
  assert.equal(result.editorialClass, MORNING_ADHKAR.editorialClass);
  assert.ok(Array.isArray(result.highlightedFragments));
  assert.ok(result.highlightedFragments.some((f) => f.matched));
});
