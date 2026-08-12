/**
 * The only KnowledgeSearchProvider implementation this milestone builds:
 * a plain in-memory array scan. It holds a frozen, deduplicated list of
 * documents and answers queries by evaluating matching.ts's rules — no
 * database, no external service, no persistence. A future database-backed
 * provider can satisfy the same KnowledgeSearchProvider interface
 * (types.ts) without this file or searchKnowledge's callers changing.
 */
import { formatKnowledgeItemId } from "../identity";
import { KnowledgeEntityError } from "../errors";
import {
  classifyMatch,
  highlightFragments,
  scoreForMatchType,
} from "./matching";
import { matchesFilters } from "./filters";
import type { KnowledgeItem } from "../types";
import type {
  KnowledgeSearchDocument,
  KnowledgeSearchOptions,
  KnowledgeSearchProvider,
  KnowledgeSearchResult,
} from "./types";

/** Convenience wrapper for callers who only need to index bare items with no aliases/keywords. */
export function toSearchDocument(item: KnowledgeItem): KnowledgeSearchDocument {
  return { item };
}

function assertWellFormedDocument(document: KnowledgeSearchDocument): void {
  const item = document.item;
  if (!item || !item.id) {
    throw new KnowledgeEntityError(
      "a search document must wrap a valid KnowledgeItem with an id (broken adapter output)",
      "broken_adapter_output",
    );
  }
  if (!item.presentations || item.presentations.length === 0) {
    throw new KnowledgeEntityError(
      `KnowledgeItem "${formatKnowledgeItemId(item.id)}" has no presentations and cannot be indexed (broken adapter output)`,
      "broken_adapter_output",
    );
  }
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

function stableSort(
  results: readonly KnowledgeSearchResult[],
): readonly KnowledgeSearchResult[] {
  return [...results].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return formatKnowledgeItemId(a.item.id).localeCompare(
      formatKnowledgeItemId(b.item.id),
    );
  });
}

/**
 * Builds the in-memory index. Rejects malformed documents (broken adapter
 * output) and silently keeps only the first occurrence of any item id
 * that appears more than once in `documents` — an index never stores the
 * same item twice, which is one of the two mechanisms (the other is
 * per-document single-match selection in matching.ts) that together
 * prevent duplicate results.
 */
export function createInMemoryKnowledgeSearchIndex(
  documents: readonly KnowledgeSearchDocument[],
): KnowledgeSearchProvider {
  const seen = new Set<string>();
  const deduped: KnowledgeSearchDocument[] = [];
  for (const document of documents) {
    assertWellFormedDocument(document);
    const key = formatKnowledgeItemId(document.item.id);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(document);
  }
  const frozenDocuments = Object.freeze(deduped);

  return {
    search(query: string, options?: KnowledgeSearchOptions) {
      const normalizedQuery = normalizeQuery(query);
      if (!normalizedQuery) {
        return [];
      }

      const results: KnowledgeSearchResult[] = [];
      for (const document of frozenDocuments) {
        if (!matchesFilters(document.item, options?.filters)) {
          continue;
        }
        const match = classifyMatch(document, normalizedQuery);
        if (!match) {
          continue;
        }
        results.push({
          item: document.item,
          matchedField: match.matchedField,
          matchedText: match.matchedText,
          matchType: match.matchType,
          score: scoreForMatchType(match.matchType),
          highlightedFragments: highlightFragments(match.matchedText, query),
          relationshipCount: options?.relationshipCountLookup
            ? options.relationshipCountLookup(document.item.id)
            : null,
          source: document.item.source,
          verificationState: document.item.verificationState,
          editorialClass: document.item.editorialClass,
        });
      }

      return stableSort(results);
    },
  };
}
