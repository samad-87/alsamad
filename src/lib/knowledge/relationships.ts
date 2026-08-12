/**
 * M7.0-track / KE-1 — relationship edge construction and validation.
 *
 * This module only builds and validates one edge at a time. It holds no
 * state, indexes nothing, and answers no queries — "relationships are
 * data, not traversal logic" is enforced by what this file deliberately
 * does not contain: no storage, no lookup-by-item, no path-finding, no
 * ranking, no AI. A future milestone builds the engine that stores and
 * queries collections of these edges; this file only knows how to
 * construct one correctly and detect when two constructed edges are the
 * same edge.
 */
import { KnowledgeEntityError } from "./errors";
import {
  canonicalRelationshipEndpoints,
  formatKnowledgeRelationshipId,
  isSameKnowledgeItem,
  knowledgeItemIdShapeError,
} from "./identity";
import { KNOWN_KNOWLEDGE_RELATIONSHIP_TYPES } from "./types";
import {
  EMPTY_KNOWLEDGE_RELATIONSHIP_AI_METADATA,
  EMPTY_KNOWLEDGE_RELATIONSHIP_REVIEW_METADATA,
  EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION,
} from "./types";
import type {
  KnowledgeEditorialClass,
  KnowledgeItemId,
  KnowledgeRelationship,
  KnowledgeRelationshipAiMetadata,
  KnowledgeRelationshipCreationMetadata,
  KnowledgeRelationshipDirection,
  KnowledgeRelationshipProvenance,
  KnowledgeRelationshipReviewMetadata,
  KnowledgeRelationshipType,
  KnowledgeSourceAttribution,
  KnowledgeVerificationState,
} from "./types";

export interface CreateKnowledgeRelationshipInput {
  readonly sourceItemId: KnowledgeItemId;
  /** Required unless relationshipType is "belongs-to-topic"; forbidden when it is. */
  readonly targetItemId?: KnowledgeItemId | null;
  /** Required only when relationshipType is "belongs-to-topic"; forbidden otherwise. */
  readonly targetTopicId?: string | null;
  readonly relationshipType: KnowledgeRelationshipType;
  /** Required when relationshipType === "future-extension", forbidden otherwise. */
  readonly extensionType?: string | null;
  readonly direction: KnowledgeRelationshipDirection;
  readonly weight?: number | null;
  readonly confidence?: number | null;
  readonly verificationState: KnowledgeVerificationState;
  readonly editorialClass: KnowledgeEditorialClass;
  readonly provenance: KnowledgeRelationshipProvenance;
  readonly source?: KnowledgeSourceAttribution;
  /**
   * Required, not defaulted: this constructor stays fully deterministic
   * (same input always produces the same output, including `id`), so
   * `createdAt` must come from the caller rather than a wall-clock read
   * inside here.
   */
  readonly creation: KnowledgeRelationshipCreationMetadata;
  readonly review?: KnowledgeRelationshipReviewMetadata;
  readonly aiMetadata?: KnowledgeRelationshipAiMetadata;
}

function isInRange01(value: number): boolean {
  return value >= 0 && value <= 1;
}

export function createKnowledgeRelationship(
  input: CreateKnowledgeRelationshipInput,
): KnowledgeRelationship {
  const sourceError = knowledgeItemIdShapeError(input.sourceItemId);
  if (sourceError) {
    throw new KnowledgeEntityError(
      `KnowledgeRelationship.sourceItemId is invalid: ${sourceError}`,
      "invalid_source_item_id",
    );
  }

  const isKnownType = (
    KNOWN_KNOWLEDGE_RELATIONSHIP_TYPES as readonly string[]
  ).includes(input.relationshipType);

  if (input.relationshipType === "future-extension") {
    if (!input.extensionType || !input.extensionType.trim()) {
      throw new KnowledgeEntityError(
        'extensionType is required and must be non-blank when relationshipType is "future-extension"',
        "missing_extension_type",
      );
    }
  } else if (isKnownType) {
    if (input.extensionType) {
      throw new KnowledgeEntityError(
        "extensionType must be null for a known relationshipType",
        "unexpected_extension_type",
      );
    }
  } else {
    throw new KnowledgeEntityError(
      `unknown KnowledgeRelationshipType: "${input.relationshipType}"`,
      "unknown_relationship_type",
    );
  }

  const targetsTopic = input.relationshipType === "belongs-to-topic";

  if (targetsTopic) {
    if (input.targetItemId) {
      throw new KnowledgeEntityError(
        'targetItemId must not be set when relationshipType is "belongs-to-topic"',
        "unexpected_target_item_id",
      );
    }
    if (!input.targetTopicId || !input.targetTopicId.trim()) {
      throw new KnowledgeEntityError(
        'targetTopicId is required and must be non-blank when relationshipType is "belongs-to-topic"',
        "missing_target_topic_id",
      );
    }
  } else {
    if (input.targetTopicId) {
      throw new KnowledgeEntityError(
        'targetTopicId must only be set when relationshipType is "belongs-to-topic"',
        "unexpected_target_topic_id",
      );
    }
    if (!input.targetItemId) {
      throw new KnowledgeEntityError(
        "targetItemId is required for this relationshipType",
        "missing_target_item_id",
      );
    }
    const targetError = knowledgeItemIdShapeError(input.targetItemId);
    if (targetError) {
      throw new KnowledgeEntityError(
        `KnowledgeRelationship.targetItemId is invalid: ${targetError}`,
        "invalid_target_item_id",
      );
    }
    if (isSameKnowledgeItem(input.sourceItemId, input.targetItemId)) {
      throw new KnowledgeEntityError(
        "a KnowledgeRelationship cannot connect an item to itself",
        "self_relationship",
      );
    }
  }

  const weight = input.weight ?? null;
  if (weight !== null && !isInRange01(weight)) {
    throw new KnowledgeEntityError(
      "KnowledgeRelationship.weight must be between 0.0 and 1.0 when set",
      "weight_out_of_range",
    );
  }

  const confidence = input.confidence ?? null;
  if (confidence !== null && !isInRange01(confidence)) {
    throw new KnowledgeEntityError(
      "KnowledgeRelationship.confidence must be between 0.0 and 1.0 when set",
      "confidence_out_of_range",
    );
  }

  if (
    input.provenance === "future-ai-suggested" &&
    input.verificationState === "reviewed"
  ) {
    throw new KnowledgeEntityError(
      'a "future-ai-suggested" relationship must never be constructed already "reviewed" — only a human/editorial review may move it there',
      "ai_relationship_cannot_be_pre_verified",
    );
  }

  const targetItemId = targetsTopic ? null : (input.targetItemId ?? null);
  const targetTopicId = targetsTopic ? (input.targetTopicId ?? null) : null;

  const id = formatKnowledgeRelationshipId({
    sourceItemId: input.sourceItemId,
    targetItemId,
    targetTopicId,
    direction: input.direction,
    relationshipType: input.relationshipType,
  });

  const relationship: KnowledgeRelationship = {
    id,
    sourceItemId: input.sourceItemId,
    targetItemId,
    targetTopicId,
    relationshipType: input.relationshipType,
    extensionType: input.extensionType ?? null,
    direction: input.direction,
    weight,
    confidence,
    verificationState: input.verificationState,
    editorialClass: input.editorialClass,
    provenance: input.provenance,
    source: input.source ?? EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION,
    creation: input.creation,
    review: input.review ?? EMPTY_KNOWLEDGE_RELATIONSHIP_REVIEW_METADATA,
    aiMetadata: input.aiMetadata ?? EMPTY_KNOWLEDGE_RELATIONSHIP_AI_METADATA,
  };

  return Object.freeze(relationship);
}

type CommonRelationshipInput = Omit<
  CreateKnowledgeRelationshipInput,
  "relationshipType" | "targetItemId" | "targetTopicId" | "extensionType"
>;

/** Convenience wrapper: builds a "belongs-to-topic" edge without callers having to know the target-shape rule. */
export function relateItemToTopic(
  input: CommonRelationshipInput & { readonly targetTopicId: string },
): KnowledgeRelationship {
  return createKnowledgeRelationship({
    ...input,
    relationshipType: "belongs-to-topic",
    targetItemId: null,
  });
}

/**
 * Convenience wrapper: builds a "belongs-to-collection" edge. A
 * collection's own identity is a KnowledgeItemId (see KnowledgeCollection
 * in types.ts), so this is still an item-shaped target under the hood.
 */
export function relateItemToCollection(
  input: CommonRelationshipInput & { readonly collectionId: KnowledgeItemId },
): KnowledgeRelationship {
  const { collectionId, ...rest } = input;
  return createKnowledgeRelationship({
    ...rest,
    relationshipType: "belongs-to-collection",
    targetItemId: collectionId,
    targetTopicId: null,
  });
}

/**
 * Pure equality check over an explicitly-passed list — not an index, not
 * storage, not a query engine. Two relationships are duplicates when they
 * mean the same thing (same type, same canonicalized endpoints), which
 * `id` already captures.
 */
export function findDuplicateRelationship(
  candidate: KnowledgeRelationship,
  existing: readonly KnowledgeRelationship[],
): KnowledgeRelationship | null {
  return existing.find((edge) => edge.id === candidate.id) ?? null;
}

export { canonicalRelationshipEndpoints };
