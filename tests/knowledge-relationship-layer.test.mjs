import test from "node:test";
import assert from "node:assert/strict";

import {
  createKnowledgeRelationship,
  findDuplicateRelationship,
} from "../src/lib/knowledge/relationships.ts";
import { formatKnowledgeRelationshipId } from "../src/lib/knowledge/identity.ts";
import { KnowledgeEntityError } from "../src/lib/knowledge/errors.ts";
import {
  EMPTY_KNOWLEDGE_RELATIONSHIP_REVIEW_METADATA,
  EMPTY_KNOWLEDGE_RELATIONSHIP_AI_METADATA,
} from "../src/lib/knowledge/types.ts";
import { createKnowledgeItem } from "../src/lib/knowledge/item.ts";

import {
  surahToKnowledgeItem,
  ayahToKnowledgeItem,
} from "../src/lib/knowledge/adapters/quran.ts";
import { adhkarCategoryToKnowledgeItem } from "../src/lib/knowledge/adapters/adhkar.ts";

import { verseSlotsFor } from "../src/lib/quran/content/reader-data.ts";

const NOW = "2026-01-01T00:00:00.000Z";
const creation = { createdBy: "test-fixture", createdAt: NOW };

const AYAH_ID = { owningModule: "quran", kind: "ayah", canonicalKey: "2:255" };
const ADHKAR_ID = {
  owningModule: "devotional",
  kind: "adhkar",
  canonicalKey: "category:morning",
};

function baseInput(overrides = {}) {
  return {
    sourceItemId: AYAH_ID,
    targetItemId: ADHKAR_ID,
    relationshipType: "explains",
    direction: "directional",
    verificationState: "not_reviewed",
    editorialClass: "authentic",
    provenance: "human-curated",
    creation,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Relationship validation (construction, shape, defaults)
// ---------------------------------------------------------------------------

test("validation: constructs a well-formed, frozen edge with every edge-model field present", () => {
  const rel = createKnowledgeRelationship(
    baseInput({ weight: 0.8, confidence: 0.6 }),
  );
  assert.equal(rel.sourceItemId, AYAH_ID);
  assert.equal(rel.targetItemId, ADHKAR_ID);
  assert.equal(rel.targetTopicId, null);
  assert.equal(rel.relationshipType, "explains");
  assert.equal(rel.extensionType, null);
  assert.equal(rel.direction, "directional");
  assert.equal(rel.weight, 0.8);
  assert.equal(rel.confidence, 0.6);
  assert.equal(rel.verificationState, "not_reviewed");
  assert.equal(rel.editorialClass, "authentic");
  assert.equal(rel.provenance, "human-curated");
  assert.deepEqual(rel.review, EMPTY_KNOWLEDGE_RELATIONSHIP_REVIEW_METADATA);
  assert.deepEqual(rel.aiMetadata, EMPTY_KNOWLEDGE_RELATIONSHIP_AI_METADATA);
  assert.equal(typeof rel.id, "string");
  assert.ok(rel.id.length > 0);
  assert.ok(Object.isFrozen(rel));
});

test("validation: rejects a source item id with an unknown owningModule (invalid ownership)", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({
          sourceItemId: { ...AYAH_ID, owningModule: "not-a-module" },
        }),
      ),
    KnowledgeEntityError,
  );
});

test("validation: rejects a target item id with an unknown kind (invalid ownership)", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({ targetItemId: { ...ADHKAR_ID, kind: "not-a-kind" } }),
      ),
    KnowledgeEntityError,
  );
});

test("validation: rejects a blank canonicalKey on either endpoint (broken reference)", () => {
  assert.throws(() =>
    createKnowledgeRelationship(
      baseInput({ sourceItemId: { ...AYAH_ID, canonicalKey: "  " } }),
    ),
  );
  assert.throws(() =>
    createKnowledgeRelationship(
      baseInput({ targetItemId: { ...ADHKAR_ID, canonicalKey: "" } }),
    ),
  );
});

// ---------------------------------------------------------------------------
// Invalid edges: relationship type validation
// ---------------------------------------------------------------------------

test("invalid edges: an unknown relationship type string is rejected", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({ relationshipType: "not-a-real-type" }),
      ),
    KnowledgeEntityError,
  );
});

// ---------------------------------------------------------------------------
// Future extension
// ---------------------------------------------------------------------------

test("future extension: a not-yet-formalized relationship type can be represented without editing the relationship model", () => {
  const hadithItem = createKnowledgeItem({
    id: {
      owningModule: "knowledge",
      kind: "future-extension",
      canonicalKey: "hadith:bukhari:1",
    },
    extensionKind: "hadith",
    availability: "available",
    editorialClass: "authentic",
    verificationState: "reviewed",
    presentations: [{ locale: "en", title: "Hadith 1", summary: null }],
  });
  const tafsirItem = createKnowledgeItem({
    id: {
      owningModule: "knowledge",
      kind: "future-extension",
      canonicalKey: "tafsir:ibn-kathir:2:255",
    },
    extensionKind: "tafsir",
    availability: "available",
    editorialClass: "authentic",
    verificationState: "reviewed",
    presentations: [{ locale: "en", title: "Tafsir on 2:255", summary: null }],
  });

  const rel = createKnowledgeRelationship(
    baseInput({
      sourceItemId: tafsirItem.id,
      targetItemId: hadithItem.id,
      relationshipType: "future-extension",
      extensionType: "tafsir-cites-hadith",
    }),
  );
  assert.equal(rel.relationshipType, "future-extension");
  assert.equal(rel.extensionType, "tafsir-cites-hadith");
});

test("future extension: requires a non-blank extensionType", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({ relationshipType: "future-extension" }),
      ),
    KnowledgeEntityError,
  );
});

test("future extension: a known relationship type must not carry an extensionType", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({ relationshipType: "related", extensionType: "x" }),
      ),
    KnowledgeEntityError,
  );
});

// ---------------------------------------------------------------------------
// Target shape
// ---------------------------------------------------------------------------

test("target shape: every non-topic relationship type requires targetItemId and forbids targetTopicId", () => {
  assert.throws(() =>
    createKnowledgeRelationship(baseInput({ targetItemId: null })),
  );
  assert.throws(() =>
    createKnowledgeRelationship(
      baseInput({ targetTopicId: "topic:should-not-be-set" }),
    ),
  );
});

// ---------------------------------------------------------------------------
// Self loops
// ---------------------------------------------------------------------------

test("self loops: an item-to-item relationship cannot connect an item to itself", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({ sourceItemId: AYAH_ID, targetItemId: AYAH_ID }),
      ),
    KnowledgeEntityError,
  );
});

// ---------------------------------------------------------------------------
// Direction
// ---------------------------------------------------------------------------

test("direction: both directional and bidirectional edges construct", () => {
  const directional = createKnowledgeRelationship(
    baseInput({ direction: "directional" }),
  );
  const bidirectional = createKnowledgeRelationship(
    baseInput({ direction: "bidirectional" }),
  );
  assert.equal(directional.direction, "directional");
  assert.equal(bidirectional.direction, "bidirectional");
});

test("direction: id derivation is order-sensitive for directional edges but order-insensitive for bidirectional edges", () => {
  const forward = formatKnowledgeRelationshipId({
    sourceItemId: AYAH_ID,
    targetItemId: ADHKAR_ID,
    targetTopicId: null,
    relationshipType: "related",
    direction: "directional",
  });
  const backward = formatKnowledgeRelationshipId({
    sourceItemId: ADHKAR_ID,
    targetItemId: AYAH_ID,
    targetTopicId: null,
    relationshipType: "related",
    direction: "directional",
  });
  assert.notEqual(forward, backward);

  const bidiForward = formatKnowledgeRelationshipId({
    sourceItemId: AYAH_ID,
    targetItemId: ADHKAR_ID,
    targetTopicId: null,
    relationshipType: "related",
    direction: "bidirectional",
  });
  const bidiBackward = formatKnowledgeRelationshipId({
    sourceItemId: ADHKAR_ID,
    targetItemId: AYAH_ID,
    targetTopicId: null,
    relationshipType: "related",
    direction: "bidirectional",
  });
  assert.equal(bidiForward, bidiBackward);
});

// ---------------------------------------------------------------------------
// Weight
// ---------------------------------------------------------------------------

test("weight: accepts the full 0.0-1.0 range and defaults to null", () => {
  assert.equal(createKnowledgeRelationship(baseInput({ weight: 0 })).weight, 0);
  assert.equal(createKnowledgeRelationship(baseInput({ weight: 1 })).weight, 1);
  assert.equal(
    createKnowledgeRelationship(baseInput({ weight: 0.42 })).weight,
    0.42,
  );
  assert.equal(createKnowledgeRelationship(baseInput()).weight, null);
});

test("weight: rejects values outside 0.0-1.0", () => {
  assert.throws(() => createKnowledgeRelationship(baseInput({ weight: -0.1 })));
  assert.throws(() => createKnowledgeRelationship(baseInput({ weight: 1.1 })));
});

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

test("confidence: accepts the full 0.0-1.0 range independently of weight and defaults to null", () => {
  const rel = createKnowledgeRelationship(
    baseInput({ weight: 0.9, confidence: 0.1 }),
  );
  assert.equal(rel.weight, 0.9);
  assert.equal(rel.confidence, 0.1);
  assert.equal(createKnowledgeRelationship(baseInput()).confidence, null);
});

test("confidence: rejects values outside 0.0-1.0", () => {
  assert.throws(() =>
    createKnowledgeRelationship(baseInput({ confidence: -0.01 })),
  );
  assert.throws(() =>
    createKnowledgeRelationship(baseInput({ confidence: 1.01 })),
  );
});

// ---------------------------------------------------------------------------
// Verification state / AI-never-auto-verified rule
// ---------------------------------------------------------------------------

test("verification: human-curated, editorial, and verified provenance may be constructed in any verification state, including reviewed", () => {
  for (const provenance of ["human-curated", "editorial", "verified"]) {
    const rel = createKnowledgeRelationship(
      baseInput({ provenance, verificationState: "reviewed" }),
    );
    assert.equal(rel.verificationState, "reviewed");
  }
});

test("verification: a future-ai-suggested relationship must never be constructed already 'reviewed'", () => {
  assert.throws(
    () =>
      createKnowledgeRelationship(
        baseInput({
          provenance: "future-ai-suggested",
          verificationState: "reviewed",
        }),
      ),
    KnowledgeEntityError,
  );
});

test("verification: a future-ai-suggested relationship may be constructed not_reviewed, in_review, or rejected", () => {
  for (const verificationState of ["not_reviewed", "in_review", "rejected"]) {
    const rel = createKnowledgeRelationship(
      baseInput({ provenance: "future-ai-suggested", verificationState }),
    );
    assert.equal(rel.verificationState, verificationState);
    assert.equal(rel.provenance, "future-ai-suggested");
  }
});

// ---------------------------------------------------------------------------
// Editorial separation
// ---------------------------------------------------------------------------

test("editorial separation: editorialClass is required and never inferred, and both classes construct distinctly", () => {
  const authentic = createKnowledgeRelationship(
    baseInput({ editorialClass: "authentic" }),
  );
  const editorial = createKnowledgeRelationship(
    baseInput({ editorialClass: "editorial" }),
  );
  assert.equal(authentic.editorialClass, "authentic");
  assert.equal(editorial.editorialClass, "editorial");
  assert.notEqual(authentic.editorialClass, editorial.editorialClass);
});

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

test("duplicate detection: two edges built from identical inputs collide on id and are detected as duplicates", () => {
  const first = createKnowledgeRelationship(baseInput());
  const second = createKnowledgeRelationship(baseInput());
  assert.equal(first.id, second.id);
  assert.deepEqual(findDuplicateRelationship(second, [first]), first);
});

test("duplicate detection: a bidirectional edge is detected as a duplicate of the same edge with source/target swapped", () => {
  const first = createKnowledgeRelationship(
    baseInput({ direction: "bidirectional" }),
  );
  const swapped = createKnowledgeRelationship(
    baseInput({
      sourceItemId: ADHKAR_ID,
      targetItemId: AYAH_ID,
      direction: "bidirectional",
    }),
  );
  assert.equal(first.id, swapped.id);
  assert.deepEqual(findDuplicateRelationship(swapped, [first]), first);
});

test("duplicate detection: a directional edge with source/target swapped is NOT a duplicate — order is meaningful", () => {
  const first = createKnowledgeRelationship(
    baseInput({ direction: "directional" }),
  );
  const swapped = createKnowledgeRelationship(
    baseInput({
      sourceItemId: ADHKAR_ID,
      targetItemId: AYAH_ID,
      direction: "directional",
    }),
  );
  assert.notEqual(first.id, swapped.id);
  assert.equal(findDuplicateRelationship(swapped, [first]), null);
});

test("duplicate detection: identical endpoints with a different relationshipType are NOT duplicates", () => {
  const explains = createKnowledgeRelationship(
    baseInput({ relationshipType: "explains" }),
  );
  const related = createKnowledgeRelationship(
    baseInput({ relationshipType: "related" }),
  );
  assert.notEqual(explains.id, related.id);
  assert.equal(findDuplicateRelationship(related, [explains]), null);
});

// ---------------------------------------------------------------------------
// Cross-module: relating real items produced by M7.0-track / KE-1
// adapters, proving the relationship layer needs zero module-specific
// logic to connect them.
// ---------------------------------------------------------------------------

test("cross-module: a real Quran ayah can be related to a real Adhkar category using only generic constructors", () => {
  const surah = surahToKnowledgeItem({
    number: 1,
    slug: "1",
    status: "available",
    ayahCount: 7,
  });
  const [ayahSlot] = verseSlotsFor({
    number: 1,
    slug: "1",
    status: "available",
    ayahCount: 7,
  });
  const ayah = ayahToKnowledgeItem(ayahSlot);
  const adhkar = adhkarCategoryToKnowledgeItem(
    { id: "morning", routeSlug: "morning", status: "available", itemCount: 5 },
    { ar: "Morning adhkar", en: "Morning adhkar" },
  );

  const rel = createKnowledgeRelationship(
    baseInput({
      sourceItemId: ayah.id,
      targetItemId: adhkar.id,
      relationshipType: "related",
      editorialClass: "authentic",
      provenance: "human-curated",
    }),
  );
  assert.equal(rel.sourceItemId.owningModule, "quran");
  assert.equal(rel.targetItemId.owningModule, "devotional");
  assert.notEqual(surah.id.owningModule, undefined);
});
