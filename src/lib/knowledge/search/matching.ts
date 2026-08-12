/**
 * Pure, deterministic string matching. No tokenization, no stemming, no
 * fuzzy distance, no learned model — every rule here is a plain
 * case-insensitive string comparison over already-known fields.
 */
import type {
  KnowledgeSearchDocument,
  KnowledgeSearchHighlightFragment,
  KnowledgeSearchMatchedField,
  KnowledgeSearchMatchType,
} from "./types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export interface KnowledgeSearchMatchCandidate {
  readonly matchType: KnowledgeSearchMatchType;
  readonly matchedField: KnowledgeSearchMatchedField;
  readonly matchedText: string;
}

/**
 * Evaluates every rule against a document in priority order (exact, slug,
 * alias, prefix, keyword, contains — see
 * KNOWLEDGE_SEARCH_MATCH_TYPE_PRIORITY) and returns only the single
 * highest-priority match, or null. Returning at most one candidate per
 * document is what keeps a single search call from producing more than
 * one result for the same item.
 */
export function classifyMatch(
  document: KnowledgeSearchDocument,
  normalizedQuery: string,
): KnowledgeSearchMatchCandidate | null {
  if (!normalizedQuery) {
    return null;
  }

  const titles = document.item.presentations.map((p) => p.title);
  const summaries = document.item.presentations
    .map((p) => p.summary)
    .filter((value): value is string => Boolean(value));
  const aliases = document.aliases ?? [];
  const keywords = document.keywords ?? [];
  const canonicalKey = document.item.id.canonicalKey;

  for (const title of titles) {
    if (normalize(title) === normalizedQuery) {
      return { matchType: "exact", matchedField: "title", matchedText: title };
    }
  }

  if (normalize(canonicalKey) === normalizedQuery) {
    return {
      matchType: "slug",
      matchedField: "canonicalKey",
      matchedText: canonicalKey,
    };
  }

  for (const alias of aliases) {
    if (normalize(alias) === normalizedQuery) {
      return { matchType: "alias", matchedField: "alias", matchedText: alias };
    }
  }

  for (const title of titles) {
    if (normalize(title).startsWith(normalizedQuery)) {
      return { matchType: "prefix", matchedField: "title", matchedText: title };
    }
  }

  for (const keyword of keywords) {
    if (normalize(keyword).includes(normalizedQuery)) {
      return {
        matchType: "keyword",
        matchedField: "keyword",
        matchedText: keyword,
      };
    }
  }

  for (const title of titles) {
    if (normalize(title).includes(normalizedQuery)) {
      return {
        matchType: "contains",
        matchedField: "title",
        matchedText: title,
      };
    }
  }
  for (const summary of summaries) {
    if (normalize(summary).includes(normalizedQuery)) {
      return {
        matchType: "contains",
        matchedField: "summary",
        matchedText: summary,
      };
    }
  }

  return null;
}

/**
 * Fixed lookup table, not a computed relevance score: every "exact" match
 * always scores 1, every "contains" match always scores 0.5, regardless
 * of item content. This is a deterministic tiebreaker for sorting, never
 * an AI or term-frequency-based relevance signal.
 */
const MATCH_TYPE_SCORE: Readonly<Record<KnowledgeSearchMatchType, number>> = {
  exact: 1,
  slug: 0.95,
  alias: 0.9,
  prefix: 0.75,
  keyword: 0.6,
  contains: 0.5,
};

export function scoreForMatchType(matchType: KnowledgeSearchMatchType): number {
  return MATCH_TYPE_SCORE[matchType];
}

/**
 * Splits `text` into up to three fragments around the first
 * case-insensitive occurrence of `query`. Deterministic and purely
 * substring-based — no fuzzy alignment.
 */
export function highlightFragments(
  text: string,
  query: string,
): readonly KnowledgeSearchHighlightFragment[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [{ text, matched: false }];
  }

  const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
  if (index === -1) {
    return [{ text, matched: false }];
  }

  const fragments: KnowledgeSearchHighlightFragment[] = [];
  if (index > 0) {
    fragments.push({ text: text.slice(0, index), matched: false });
  }
  fragments.push({
    text: text.slice(index, index + trimmedQuery.length),
    matched: true,
  });
  if (index + trimmedQuery.length < text.length) {
    fragments.push({
      text: text.slice(index + trimmedQuery.length),
      matched: false,
    });
  }
  return fragments;
}

export { normalize as normalizeSearchText };
