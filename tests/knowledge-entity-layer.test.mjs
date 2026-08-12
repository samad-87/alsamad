import test from "node:test";
import assert from "node:assert/strict";

import { EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION } from "../src/lib/knowledge/types.ts";
import {
  formatKnowledgeItemId,
  parseKnowledgeItemId,
  isSameKnowledgeItem,
} from "../src/lib/knowledge/identity.ts";
import { createKnowledgeItem } from "../src/lib/knowledge/item.ts";
import { KnowledgeEntityError } from "../src/lib/knowledge/errors.ts";

import {
  surahToKnowledgeItem,
  ayahToKnowledgeItem,
} from "../src/lib/knowledge/adapters/quran.ts";
import {
  adhkarCategoryToKnowledgeItem,
  adhkarItemToKnowledgeItem,
} from "../src/lib/knowledge/adapters/adhkar.ts";
import { verseSlotsFor } from "../src/lib/quran/content/reader-data.ts";
import { ADHKAR_CATEGORIES } from "../src/lib/adhkar/content/structure.ts";
import { EMPTY_SOURCE_METADATA } from "../src/lib/adhkar/content/types.ts";

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

test("identity: formatKnowledgeItemId and parseKnowledgeItemId round-trip, including a canonicalKey containing colons", () => {
  const id = { owningModule: "quran", kind: "ayah", canonicalKey: "2:255" };
  const formatted = formatKnowledgeItemId(id);
  assert.equal(formatted, "quran:ayah:2:255");
  assert.deepEqual(parseKnowledgeItemId(formatted), id);
});

test("identity: parseKnowledgeItemId rejects an unknown owning module or kind", () => {
  assert.equal(parseKnowledgeItemId("not-a-module:ayah:2:255"), null);
  assert.equal(parseKnowledgeItemId("quran:not-a-kind:2:255"), null);
});

test("identity: parseKnowledgeItemId rejects malformed input", () => {
  assert.equal(parseKnowledgeItemId(""), null);
  assert.equal(parseKnowledgeItemId("quran:ayah"), null);
  assert.equal(parseKnowledgeItemId("quran:ayah:"), null);
});

test("identity: isSameKnowledgeItem compares the full triple", () => {
  const a = { owningModule: "quran", kind: "surah", canonicalKey: "1" };
  const b = { owningModule: "quran", kind: "surah", canonicalKey: "1" };
  const c = { owningModule: "quran", kind: "surah", canonicalKey: "2" };
  assert.ok(isSameKnowledgeItem(a, b));
  assert.ok(!isSameKnowledgeItem(a, c));
});

test("typing: createKnowledgeItem rejects a blank canonical key and an empty presentation list", () => {
  const base = {
    availability: "empty",
    editorialClass: "authentic",
    verificationState: "not_reviewed",
  };
  assert.throws(() =>
    createKnowledgeItem({
      ...base,
      id: { owningModule: "quran", kind: "surah", canonicalKey: "  " },
      presentations: [{ locale: "en", title: "X", summary: null }],
    }),
  );
  assert.throws(() =>
    createKnowledgeItem({
      ...base,
      id: { owningModule: "quran", kind: "surah", canonicalKey: "1" },
      presentations: [],
    }),
  );
});

test("typing: createKnowledgeItem rejects duplicate-locale presentations", () => {
  assert.throws(() =>
    createKnowledgeItem({
      id: { owningModule: "quran", kind: "surah", canonicalKey: "1" },
      availability: "available",
      editorialClass: "authentic",
      verificationState: "reviewed",
      presentations: [
        { locale: "en", title: "Surah 1", summary: null },
        { locale: "en", title: "Duplicate", summary: null },
      ],
    }),
  );
});

test("typing: createKnowledgeItem defaults source to the shared empty attribution", () => {
  const item = createKnowledgeItem({
    id: { owningModule: "quran", kind: "surah", canonicalKey: "1" },
    availability: "empty",
    editorialClass: "authentic",
    verificationState: "not_reviewed",
    presentations: [{ locale: "en", title: "Surah 1", summary: null }],
  });
  assert.deepEqual(item.source, EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION);
});

// ---------------------------------------------------------------------------
// Relationships: see tests/knowledge-relationship-layer.test.mjs (M7.0-track / KE-1) for
// the full KnowledgeRelationship model — validation, duplicate detection,
// direction, weight, confidence, verification, editorial separation,
// future extension, invalid edges, and self-loops.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Adapters — ownership, editorial state, verification state, localization,
// exercised against the approved Quran and Adhkar module data.
// ---------------------------------------------------------------------------

test("quran adapter: surah ownership is 'quran' and availability/verification follow the real reader data honestly", () => {
  const emptySurah = { number: 2, slug: "2", status: "empty", ayahCount: null };
  const item = surahToKnowledgeItem(emptySurah);
  assert.equal(item.id.owningModule, "quran");
  assert.equal(item.id.kind, "surah");
  assert.equal(item.availability, "empty");
  assert.equal(item.verificationState, "not_reviewed");
  assert.equal(item.editorialClass, "authentic");

  const availableSurah = {
    number: 1,
    slug: "1",
    status: "available",
    ayahCount: 7,
  };
  const availableItem = surahToKnowledgeItem(availableSurah);
  assert.equal(availableItem.verificationState, "reviewed");
  assert.deepEqual(availableItem.presentations.map((p) => p.locale).sort(), [
    "ar",
    "en",
  ]);
  assert.match(
    availableItem.presentations.find((p) => p.locale === "en").title,
    /Surah 1/,
  );
});

test("quran adapter: an ayah item is only ever constructed as available/reviewed, matching verseSlotsFor's own honesty contract", () => {
  const availableSurah = {
    number: 1,
    slug: "1",
    status: "available",
    ayahCount: 3,
  };
  const slots = verseSlotsFor(availableSurah);
  assert.equal(slots.length, 3);
  const item = ayahToKnowledgeItem(slots[0]);
  assert.equal(item.id.kind, "ayah");
  assert.equal(item.availability, "available");
  assert.equal(item.verificationState, "reviewed");
  assert.equal(item.id.canonicalKey, "1:1");
});

test("adhkar adapter: category ownership is 'devotional', always authentic, real category ids used", () => {
  for (const category of ADHKAR_CATEGORIES) {
    const item = adhkarCategoryToKnowledgeItem(
      {
        id: category.id,
        routeSlug: category.routeSlug,
        status: "empty",
        itemCount: null,
      },
      { ar: `فئة ${category.id}`, en: `Category ${category.id}` },
    );
    assert.equal(item.id.owningModule, "devotional");
    assert.equal(item.editorialClass, "authentic");
    assert.match(item.id.canonicalKey, new RegExp(`^category:${category.id}$`));
  }
});

test("adhkar adapter: item verification state passes through the real reviewerStatus field, and source attribution fields are remapped without loss", () => {
  const item = adhkarItemToKnowledgeItem(
    {
      id: "1",
      order: 1,
      arabicText: "نص تجريبي محايد",
      translation: null,
      transliteration: null,
      repeatCount: 3,
      source: {
        ...EMPTY_SOURCE_METADATA,
        sourceType: "hadith",
        gradingStatus: "sahih",
        reviewerStatus: "reviewed",
      },
    },
    "morning",
    { ar: "الذكر الأول", en: "First dhikr" },
  );
  assert.equal(item.verificationState, "reviewed");
  assert.equal(item.source.sourceType, "hadith");
  assert.equal(item.source.authenticityOrGrading, "sahih");
});

// ---------------------------------------------------------------------------
// Cross-module: the same generic constructor and id shape underlies every
// module — proof this layer is one shared abstraction, not parallel
// re-implementations.
// ---------------------------------------------------------------------------

test("cross-module: Quran and Adhkar items are valid KnowledgeItems built through the same constructor", () => {
  const surahItem = surahToKnowledgeItem({
    number: 1,
    slug: "1",
    status: "available",
    ayahCount: 7,
  });
  const adhkarItem = adhkarCategoryToKnowledgeItem(
    { id: "morning", routeSlug: "morning", status: "available", itemCount: 5 },
    { ar: "أذكار الصباح", en: "Morning adhkar" },
  );
  for (const item of [surahItem, adhkarItem]) {
    assert.ok(Object.isFrozen(item));
    assert.ok(item.presentations.length >= 1);
    assert.ok(["authentic", "editorial"].includes(item.editorialClass));
  }
  assert.notEqual(surahItem.id.owningModule, adhkarItem.id.owningModule);
});

// ---------------------------------------------------------------------------
// M7.0-track / KE-1: no adapter may produce a canonicalKey
// that restates its own kind (a stuttering id like "quran:surah:surah:1").
// ---------------------------------------------------------------------------

test("no adapter's formatted id stutters the kind as a leading canonicalKey segment", () => {
  const rawSurah = { number: 1, slug: "1", status: "available", ayahCount: 7 };
  const surahItem = surahToKnowledgeItem(rawSurah);
  const [firstSlot] = verseSlotsFor(rawSurah);
  const ayahItem = ayahToKnowledgeItem(firstSlot);
  const adhkarItem = adhkarCategoryToKnowledgeItem(
    { id: "morning", routeSlug: "morning", status: "available", itemCount: 5 },
    { ar: "أذكار الصباح", en: "Morning adhkar" },
  );
  for (const item of [surahItem, ayahItem, adhkarItem]) {
    const formatted = formatKnowledgeItemId(item.id);
    const doubledKind = `${item.id.owningModule}:${item.id.kind}:${item.id.kind}:`;
    assert.ok(
      !formatted.startsWith(doubledKind),
      `expected "${formatted}" not to stutter kind "${item.id.kind}"`,
    );
  }
});
