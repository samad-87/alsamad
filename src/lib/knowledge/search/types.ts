/**
 * M7.0-track / KE-1 — Unified Knowledge Search Foundation. Pure types only.
 *
 * This search layer consumes the existing KnowledgeItem model as-is (it is
 * never modified or extended here) and knows nothing about which module
 * produced any given item — no owningModule/kind ever appears in a branch
 * inside this subsystem. No semantic search, embeddings, vector search,
 * AI ranking, graph traversal, or recommendation logic lives here or
 * anywhere in src/lib/knowledge; this is deterministic string matching
 * only, exactly as scoped for this milestone.
 */
import type { Locale } from "@/lib/i18n";
import type {
  KnowledgeEditorialClass,
  KnowledgeItem,
  KnowledgeItemId,
  KnowledgeItemKind,
  KnowledgeOwningModule,
  KnowledgeSourceAttribution,
  KnowledgeVerificationState,
} from "../types";

/**
 * Deterministic rules, evaluated in this exact priority order (most
 * specific first) — see matching.ts. Every rule is a plain string
 * comparison; none of these involve tokenization, stemming, fuzzy
 * distance, or any learned model.
 */
export type KnowledgeSearchMatchType =
  "exact" | "slug" | "alias" | "prefix" | "keyword" | "contains";

export const KNOWLEDGE_SEARCH_MATCH_TYPE_PRIORITY: readonly KnowledgeSearchMatchType[] =
  ["exact", "slug", "alias", "prefix", "keyword", "contains"];

/** Which field within a document the winning match was found in. */
export type KnowledgeSearchMatchedField =
  "title" | "summary" | "canonicalKey" | "alias" | "keyword";

export interface KnowledgeSearchHighlightFragment {
  readonly text: string;
  readonly matched: boolean;
}

/**
 * What gets indexed. Wraps a KnowledgeItem without modifying it —
 * `aliases`/`keywords` are optional caller-supplied search handles (a
 * legacy slug, a topic tag) that do not belong on the entity model itself
 * and are not produced by a KE-1 adapter. Most callers can index a bare
 * KnowledgeItem via `toSearchDocument`.
 */
export interface KnowledgeSearchDocument {
  readonly item: KnowledgeItem;
  readonly aliases?: readonly string[];
  readonly keywords?: readonly string[];
}

export interface KnowledgeSearchResult {
  readonly item: KnowledgeItem;
  readonly matchedField: KnowledgeSearchMatchedField;
  readonly matchedText: string;
  readonly matchType: KnowledgeSearchMatchType;
  /** A fixed function of matchType only (see matching.ts) — never term frequency, AI relevance, or embeddings. */
  readonly score: number;
  readonly highlightedFragments: readonly KnowledgeSearchHighlightFragment[];
  /**
   * Optional placeholder. This layer never traverses relationships itself
   * (no graph engine exists here) — populated only when the caller injects
   * `relationshipCountLookup` into KnowledgeSearchOptions; null otherwise.
   */
  readonly relationshipCount: number | null;
  readonly source: KnowledgeSourceAttribution;
  readonly verificationState: KnowledgeVerificationState;
  readonly editorialClass: KnowledgeEditorialClass;
}

/**
 * Generic value filters only — no module-specific predicate ever lives
 * here. Every field is a plain allow-list compared against fields
 * KnowledgeItem already exposes.
 */
export interface KnowledgeSearchFilters {
  readonly owningModules?: readonly KnowledgeOwningModule[];
  readonly kinds?: readonly KnowledgeItemKind[];
  readonly editorialClasses?: readonly KnowledgeEditorialClass[];
  readonly verificationStates?: readonly KnowledgeVerificationState[];
  /** An item passes when at least one of its presentations is in one of these locales. */
  readonly locales?: readonly Locale[];
  /**
   * Restricts results to `kind: "future-extension"` items whose
   * `extensionKind` is in this list. Items with a known kind never match
   * when this filter is set.
   */
  readonly extensionKinds?: readonly string[];
}

export interface KnowledgeSearchOptions {
  readonly filters?: KnowledgeSearchFilters;
  readonly relationshipCountLookup?: (itemId: KnowledgeItemId) => number;
}

/**
 * The pluggable seam. This milestone implements exactly one provider
 * (createInMemoryKnowledgeSearchIndex, in index.ts). A future
 * database-backed index can implement this same interface without
 * searchKnowledge or any caller changing — "future database indexing must
 * be pluggable" is satisfied by depending on this interface, not a
 * concrete implementation.
 */
export interface KnowledgeSearchProvider {
  search(
    query: string,
    options?: KnowledgeSearchOptions,
  ): readonly KnowledgeSearchResult[];
}
