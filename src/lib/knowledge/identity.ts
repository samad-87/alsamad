/**
 * Pure helpers for KnowledgeItemId — the stable, locale-independent
 * identity every KnowledgeItem, KnowledgeReference, and
 * KnowledgeRelationship endpoint carries — plus id derivation for
 * KnowledgeRelationship itself. No I/O, no storage.
 */
import { KNOWN_KNOWLEDGE_ITEM_KINDS } from "./types";
import type {
  KnowledgeItemId,
  KnowledgeRelationshipDirection,
  KnowledgeRelationshipType,
} from "./types";

export const KNOWN_OWNING_MODULES: readonly KnowledgeItemId["owningModule"][] =
  ["quran", "devotional", "editorial", "knowledge", "talibeen"];

export const KNOWN_ITEM_KINDS: readonly KnowledgeItemId["kind"][] = [
  ...KNOWN_KNOWLEDGE_ITEM_KINDS,
  "future-extension",
];

/**
 * Formats an id as a single stable string, safe to use as a map key or in
 * a URL path segment. `canonicalKey` may itself contain colons (e.g.
 * "2:255" for an ayah) — `parseKnowledgeItemId` accounts for this.
 */
export function formatKnowledgeItemId(id: KnowledgeItemId): string {
  return `${id.owningModule}:${id.kind}:${id.canonicalKey}`;
}

/**
 * Inverse of `formatKnowledgeItemId`. Returns null for malformed input
 * rather than throwing, since callers may pass arbitrary strings (e.g.
 * from a URL) that were never guaranteed to be a valid id.
 */
export function parseKnowledgeItemId(value: string): KnowledgeItemId | null {
  const segments = value.split(":");
  if (segments.length < 3) {
    return null;
  }
  const [owningModule, kind, ...rest] = segments;
  const canonicalKey = rest.join(":");
  if (
    !canonicalKey ||
    !KNOWN_OWNING_MODULES.includes(
      owningModule as KnowledgeItemId["owningModule"],
    ) ||
    !KNOWN_ITEM_KINDS.includes(kind as KnowledgeItemId["kind"])
  ) {
    return null;
  }
  return {
    owningModule: owningModule as KnowledgeItemId["owningModule"],
    kind: kind as KnowledgeItemId["kind"],
    canonicalKey,
  };
}

export function isSameKnowledgeItem(
  a: KnowledgeItemId,
  b: KnowledgeItemId,
): boolean {
  return (
    a.owningModule === b.owningModule &&
    a.kind === b.kind &&
    a.canonicalKey === b.canonicalKey
  );
}

/**
 * Structural well-formedness only: known owningModule, known kind,
 * non-blank canonicalKey. This does not — and cannot — confirm the
 * referenced item actually exists in its owning module; that would
 * require a real data store, out of scope for this layer. Returns a
 * description of the first problem found, or null when the id is
 * well-formed. Shared by relationship-endpoint validation
 * (src/lib/knowledge/relationships.ts); item construction validates kind
 * separately because it also governs the extensionKind invariant.
 */
export function knowledgeItemIdShapeError(id: KnowledgeItemId): string | null {
  if (!id.canonicalKey.trim()) {
    return "canonicalKey must not be blank";
  }
  if (!KNOWN_OWNING_MODULES.includes(id.owningModule)) {
    return `unknown owningModule: "${id.owningModule}"`;
  }
  if (!KNOWN_ITEM_KINDS.includes(id.kind)) {
    return `unknown kind: "${id.kind}"`;
  }
  return null;
}

interface RelationshipEndpointsInput {
  readonly sourceItemId: KnowledgeItemId;
  readonly targetItemId: KnowledgeItemId | null;
  readonly targetTopicId: string | null;
  readonly direction: KnowledgeRelationshipDirection;
}

/**
 * The two endpoint keys, canonicalized for duplicate-edge comparison. For
 * a `"bidirectional"` edge, A-relates-B and B-relates-A are the same edge,
 * so the pair is sorted into a stable order; for a `"directional"` edge,
 * order is semantically meaningful and preserved as given.
 */
export function canonicalRelationshipEndpoints(
  input: RelationshipEndpointsInput,
): readonly [string, string] {
  const sourceKey = formatKnowledgeItemId(input.sourceItemId);
  const targetKey = input.targetItemId
    ? formatKnowledgeItemId(input.targetItemId)
    : `topic:${input.targetTopicId}`;
  const pair: [string, string] = [sourceKey, targetKey];
  return input.direction === "bidirectional"
    ? ([...pair].sort() as [string, string])
    : pair;
}

/**
 * Deterministic id for a relationship, derived from its type and
 * canonicalized endpoints — never random. Two constructed edges that mean
 * the same thing collide on this id, which is exactly what makes
 * duplicate-edge detection (findDuplicateRelationship) a simple equality
 * check rather than a semantic comparison.
 */
export function formatKnowledgeRelationshipId(
  input: RelationshipEndpointsInput & {
    readonly relationshipType: KnowledgeRelationshipType;
  },
): string {
  const [a, b] = canonicalRelationshipEndpoints(input);
  return `${input.relationshipType}::${a}::${b}`;
}
