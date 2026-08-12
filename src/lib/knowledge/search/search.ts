/**
 * The single public API for M7.0-track / KE-1. No UI-specific code, no React
 * dependency, no module-specific branching — `index` is any
 * KnowledgeSearchProvider (types.ts), so this function never needs to
 * know which modules exist or how their items were produced.
 */
import { validateSearchFilters } from "./filters";
import type {
  KnowledgeSearchOptions,
  KnowledgeSearchProvider,
  KnowledgeSearchResult,
} from "./types";

/**
 * Validates `options.filters` (throwing KnowledgeEntityError on an
 * unknown or malformed value) and delegates matching to `index`. Filter
 * validation lives here, at the one public entry point, so every current
 * and future KnowledgeSearchProvider implementation gets it for free
 * without reimplementing it.
 */
export function searchKnowledge(
  index: KnowledgeSearchProvider,
  query: string,
  options?: KnowledgeSearchOptions,
): readonly KnowledgeSearchResult[] {
  validateSearchFilters(options?.filters);
  return index.search(query, options);
}
