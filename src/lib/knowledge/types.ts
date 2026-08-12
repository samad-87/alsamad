/**
 * M7.0-track / KE-1 Knowledge Entity Layer — provider-independent models.
 *
 * Pure types only. Nothing here performs I/O and nothing here implements
 * search, AI, recommendations, or graph traversal — those are later
 * milestones. This file only names the shared vocabulary that Quran,
 * Quran and Adhkar can be projected into, per
 * ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md.
 *
 * These types generalize compatible source and provenance shapes without
 * copying canonical religious content. Owning modules remain responsible for
 * their real data; the approved adapters are read-only projections.
 */

import type { Locale } from "@/lib/i18n";

/**
 * The module that owns write access to an item's real data.
 *
 * `devotional`, `editorial`, and `knowledge` are the exact three values
 * already approved for `content_items.owning_module` in
 * ALSAMAD_DATABASE_ARCHITECTURE.md. `quran` and `talibeen` name modules
 * whose canonical identity lives outside `content_items` entirely (Quran
 * uses `works`/`quran_surahs` directly; Talibeen is its own isolated
 * schema) but which still need a stable ownership label at this shared
 * entity layer. No database enum is being changed by adding them here.
 */
export type KnowledgeOwningModule =
  "quran" | "devotional" | "editorial" | "knowledge" | "talibeen";

/**
 * Item kinds this architecture must be able to represent, per KE-1's
 * mission: ayah, surah, adhkar, dua, article, guide, marriage-guidance.
 */
export type KnownKnowledgeItemKind =
  | "ayah"
  | "surah"
  | "adhkar"
  | "dua"
  | "article"
  | "guide"
  | "marriage-guidance";

export const KNOWN_KNOWLEDGE_ITEM_KINDS: readonly KnownKnowledgeItemKind[] = [
  "ayah",
  "surah",
  "adhkar",
  "dua",
  "article",
  "guide",
  "marriage-guidance",
];

/**
 * `"future-extension"` is a deliberate open escape hatch: a module built
 * long after this file was written can still produce a valid KnowledgeItem
 * — with kind `"future-extension"` and `extensionKind` naming what it
 * actually is — without this union ever needing to change. This is how the
 * layer supports future item types without hardcoding their business
 * logic here.
 */
export type KnowledgeItemKind = KnownKnowledgeItemKind | "future-extension";

/**
 * Generalizes the three already-identical "empty" | "pending" | "available"
 * unions independently defined as QuranContentStatus, AdhkarContentStatus,
 * and DuaContentStatus. Values of any of those three types are already
 * structurally assignable to this type — no conversion is needed to use
 * them here.
 */
export type KnowledgeAvailabilityState = "empty" | "pending" | "available";

/**
 * Whether an item is sourced from the Quran, authentic Sunnah, or a
 * verified collection ("authentic"), or written by ALSAMAD editors
 * ("editorial"). Mirrors DuaKind, generalized so every module — including
 * Quran and Adhkar, which today only ever produce "authentic" — can
 * express it uniformly. UI built on this layer must branch on this field,
 * never infer or guess it.
 */
export type KnowledgeEditorialClass = "authentic" | "editorial";

export const KNOWN_KNOWLEDGE_EDITORIAL_CLASSES: readonly KnowledgeEditorialClass[] =
  ["authentic", "editorial"];

/**
 * Generalizes AdhkarReviewStatus and DuaReviewerStatus (already identical
 * "not_reviewed" | "in_review" | "reviewed" unions), plus a terminal
 * "rejected" state matching content_revisions.verification_state.
 */
export type KnowledgeVerificationState =
  "not_reviewed" | "in_review" | "reviewed" | "rejected";

export const KNOWN_KNOWLEDGE_VERIFICATION_STATES: readonly KnowledgeVerificationState[] =
  ["not_reviewed", "in_review", "reviewed", "rejected"];

/**
 * Superset of AdhkarSourceType ("quran" | "hadith" | "athar" | "scholarly" |
 * "other") and DuaSourceType ("quran" | "sunnah" | "collection" |
 * "editorial") — the two independently-defined source-type unions this
 * layer generalizes.
 */
export type KnowledgeSourceType =
  | "quran"
  | "sunnah"
  | "hadith"
  | "athar"
  | "scholarly"
  | "collection"
  | "editorial"
  | "other";

/**
 * Generalizes AdhkarSourceMetadata and DuaSourceMetadata, which
 * independently arrived at the same nine-field shape.
 * `authenticityOrGrading` merges DuaSourceMetadata.authenticity and
 * AdhkarSourceMetadata.gradingStatus — the same concept, named differently
 * per module. Every field is nullable: the shape exists so callers can
 * render it once real values exist, not as a promise that they do.
 */
export interface KnowledgeSourceAttribution {
  readonly sourceType: KnowledgeSourceType | null;
  readonly sourceTitle: string | null;
  readonly collection: string | null;
  readonly reference: string | null;
  readonly authenticityOrGrading: string | null;
  readonly reviewerStatus: KnowledgeVerificationState | null;
  readonly attribution: string | null;
  readonly notes: string | null;
  readonly verificationDate: string | null;
}

export const EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION: KnowledgeSourceAttribution = {
  sourceType: null,
  sourceTitle: null,
  collection: null,
  reference: null,
  authenticityOrGrading: null,
  reviewerStatus: null,
  attribution: null,
  notes: null,
  verificationDate: null,
};

/**
 * Locale-independent identity: the triple that stays stable across every
 * presentation, review cycle, and future relationship. This is the node
 * reference shape from ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md §3.1 —
 * `(owning_module, canonical_key)`, with `kind` split out for type safety.
 *
 * `canonicalKey` only needs to be unique within `(owningModule, kind)` — it
 * must never restate `kind` as its own leading segment (e.g. a surah's key
 * is `"1"`, not `"surah:1"`; `formatKnowledgeItemId` already prefixes both
 * `owningModule` and `kind`, so repeating either inside `canonicalKey`
 * produces a stuttering id like `"quran:surah:surah:1"`). A meaningful
 * sub-scope segment (e.g. `"category:"` vs `"item:"` for two entities that
 * share one `kind`) is fine and expected.
 */
export interface KnowledgeItemId {
  readonly owningModule: KnowledgeOwningModule;
  readonly kind: KnowledgeItemKind;
  readonly canonicalKey: string;
}

/** One localized rendering of an item's presentation-layer text. */
export interface KnowledgeLocalizedText {
  readonly locale: Locale;
  readonly title: string;
  readonly summary: string | null;
}

/**
 * The central entity: a reference to something an owning module already
 * knows about, never a copy of that module's content. `presentations`
 * carries every known locale's text at once — a KnowledgeItem is not tied
 * to one request's locale, matching the architecture's locale-neutral node
 * principle.
 */
export interface KnowledgeItem {
  readonly id: KnowledgeItemId;
  /**
   * Required (non-null) only when `id.kind === "future-extension"`; names
   * the not-yet-formalized type. Must be null for every known kind.
   */
  readonly extensionKind: string | null;
  readonly availability: KnowledgeAvailabilityState;
  readonly editorialClass: KnowledgeEditorialClass;
  readonly verificationState: KnowledgeVerificationState;
  readonly presentations: readonly KnowledgeLocalizedText[];
  readonly source: KnowledgeSourceAttribution;
}

/**
 * A controlled-vocabulary topic node. Locale-independent identity plus
 * localized display names, matching content nodes' own shape.
 */
export interface KnowledgeTopic {
  readonly id: string;
  readonly presentations: readonly KnowledgeLocalizedText[];
}

/**
 * A citation/evidence edge from an item to a source context — mirrors
 * `source_references` (role, locator, optional URL). Distinct from
 * KnowledgeRelationship: a reference points at *evidence*, a relationship
 * connects two *items*.
 */
export type KnowledgeReferenceRole =
  "primary_source" | "supporting" | "attribution" | "context";

export interface KnowledgeReference {
  readonly itemId: KnowledgeItemId;
  readonly role: KnowledgeReferenceRole;
  readonly locatorLabel: string;
  readonly sourceUrl: string | null;
}

/**
 * M7.0-track / KE-1 — the canonical relationship (edge) model. This describes the data
 * shape of an edge only. No traversal, storage, query, ranking, search, or
 * AI logic lives in this layer or anywhere in src/lib/knowledge — a future
 * milestone builds the engine that stores and queries collections of
 * these; this file only defines what one valid edge looks like.
 *
 * Relationship types this milestone must support. "belongs-to-topic" is
 * the only type whose target is a KnowledgeTopic rather than a
 * KnowledgeItem (see KnowledgeRelationship.targetTopicId below);
 * "belongs-to-collection" targets a KnowledgeCollection, but a collection
 * reuses KnowledgeItemId as its own identity (see KnowledgeCollection), so
 * it is still an item-shaped target.
 */
export type KnownKnowledgeRelationshipType =
  | "related"
  | "explains"
  | "references"
  | "expands"
  | "implements"
  | "recommends"
  | "belongs-to-topic"
  | "belongs-to-collection"
  | "supports"
  | "background";

export const KNOWN_KNOWLEDGE_RELATIONSHIP_TYPES: readonly KnownKnowledgeRelationshipType[] =
  [
    "related",
    "explains",
    "references",
    "expands",
    "implements",
    "recommends",
    "belongs-to-topic",
    "belongs-to-collection",
    "supports",
    "background",
  ];

/**
 * Mirrors KnowledgeItemKind's own open escape hatch: a relationship type
 * not yet formalized here (e.g. a Hadith-specific or Fatwa-specific
 * connection) can be represented today via `"future-extension"` +
 * `extensionType`, without editing this union.
 */
export type KnowledgeRelationshipType =
  KnownKnowledgeRelationshipType | "future-extension";

export type KnowledgeRelationshipDirection = "directional" | "bidirectional";

/**
 * Who or what asserted this edge exists. Distinct from `editorialClass`
 * (which classifies the *claim* the edge makes, mirroring
 * KnowledgeEditorialClass on KnowledgeItem) — `provenance` classifies the
 * *edge record itself*. An AI-suggested edge must never be constructed
 * with `verificationState: "reviewed"`; only a human/editorial process
 * that has reviewed it may move it there (enforced by
 * createKnowledgeRelationship, not by this type).
 */
export type KnowledgeRelationshipProvenance =
  "human-curated" | "editorial" | "verified" | "future-ai-suggested";

export interface KnowledgeRelationshipCreationMetadata {
  readonly createdBy: string | null;
  /** ISO 8601 timestamp. Always set — every edge has a creation moment. */
  readonly createdAt: string;
}

export interface KnowledgeRelationshipReviewMetadata {
  readonly reviewedBy: string | null;
  /** ISO 8601 timestamp, null until reviewed. */
  readonly reviewedAt: string | null;
  readonly reviewNotes: string | null;
}

export const EMPTY_KNOWLEDGE_RELATIONSHIP_REVIEW_METADATA: KnowledgeRelationshipReviewMetadata =
  {
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
  };

/**
 * Reserved shape for future AI involvement in this edge's creation. No AI
 * logic reads or writes this in this milestone — the fields exist so a
 * later AI-suggestion pipeline has somewhere honest to write, without ever
 * needing to modify KnowledgeRelationship itself.
 */
export interface KnowledgeRelationshipAiMetadata {
  readonly suggestedByModel: string | null;
  /** ISO 8601 timestamp, null when no AI was involved. */
  readonly suggestedAt: string | null;
  readonly rationale: string | null;
}

export const EMPTY_KNOWLEDGE_RELATIONSHIP_AI_METADATA: KnowledgeRelationshipAiMetadata =
  {
    suggestedByModel: null,
    suggestedAt: null,
    rationale: null,
  };

/**
 * One edge. Exactly one of `targetItemId` / `targetTopicId` is set,
 * determined by `relationshipType`: `"belongs-to-topic"` sets
 * `targetTopicId`; every other type (including `"future-extension"`) sets
 * `targetItemId`. `createKnowledgeRelationship` enforces this — the type
 * alone cannot.
 */
export interface KnowledgeRelationship {
  /** Deterministically derived from (type, direction, source, target) — see formatKnowledgeRelationshipId. Two edges that mean the same thing collide on this id. */
  readonly id: string;
  readonly sourceItemId: KnowledgeItemId;
  readonly targetItemId: KnowledgeItemId | null;
  readonly targetTopicId: string | null;
  readonly relationshipType: KnowledgeRelationshipType;
  /** Required (non-null) only when relationshipType === "future-extension". */
  readonly extensionType: string | null;
  readonly direction: KnowledgeRelationshipDirection;
  /** Advisory only, 0.0–1.0, never authoritative. Null when not yet weighted. */
  readonly weight: number | null;
  /** How certain the asserting source is this edge is correct, 0.0–1.0. Most meaningful for future-ai-suggested edges; null when not applicable. */
  readonly confidence: number | null;
  readonly verificationState: KnowledgeVerificationState;
  readonly editorialClass: KnowledgeEditorialClass;
  readonly provenance: KnowledgeRelationshipProvenance;
  readonly source: KnowledgeSourceAttribution;
  readonly creation: KnowledgeRelationshipCreationMetadata;
  readonly review: KnowledgeRelationshipReviewMetadata;
  readonly aiMetadata: KnowledgeRelationshipAiMetadata;
}

/**
 * An ordered grouping of items, e.g. "Morning adhkar" or "General duas".
 * Reuses KnowledgeItemId as its own identity because a collection is
 * itself addressable and citable, matching `devotional_collections`
 * carrying its own content-item-backed title/description.
 */
export interface KnowledgeCollectionMember {
  readonly itemId: KnowledgeItemId;
  readonly position: number;
}

export interface KnowledgeCollection {
  readonly id: KnowledgeItemId;
  readonly presentations: readonly KnowledgeLocalizedText[];
  readonly members: readonly KnowledgeCollectionMember[];
}
