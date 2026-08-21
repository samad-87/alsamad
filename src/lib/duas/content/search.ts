/**
 * Provider-independent Duas search abstraction.
 *
 * Pure and synchronous: operates over an already-resolved, localized list
 * of searchable entries (category labels today; verified dua titles and
 * source metadata once real content exists) so a client component can
 * filter on every keystroke without a network round trip. It never
 * indexes invented dua text — only structural category identity and,
 * once populated, verified metadata.
 */

export interface DuaSearchableEntry {
  readonly categoryId: string;
  readonly label: string;
  readonly routeSlug: string | null;
  readonly status: "empty" | "pending" | "available";
}

export type DuaSearchHit = DuaSearchableEntry;

export function searchDuaIndex(
  entries: readonly DuaSearchableEntry[],
  query: string,
): readonly DuaSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const normalized = trimmed.toLocaleLowerCase();
  return entries.filter((entry) =>
    entry.label.toLocaleLowerCase().includes(normalized),
  );
}
