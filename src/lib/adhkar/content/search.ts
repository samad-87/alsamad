/**
 * Provider-independent Adhkar search abstraction.
 *
 * Pure and synchronous: operates over an already-resolved, localized list
 * of searchable entries (category labels today; verified item titles and
 * source metadata once real content exists) so a client component can
 * filter on every keystroke without a network round trip. This is
 * intentionally not the full Knowledge Engine — it only searches
 * structural category identity and, once populated, verified metadata. It
 * never indexes invented religious text.
 */

export interface AdhkarSearchableEntry {
  readonly categoryId: string;
  readonly label: string;
  readonly routeSlug: string | null;
  readonly status: "empty" | "pending" | "available";
}

export type AdhkarSearchHit = AdhkarSearchableEntry;

export function searchAdhkarIndex(
  entries: readonly AdhkarSearchableEntry[],
  query: string,
): readonly AdhkarSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  const normalized = trimmed.toLocaleLowerCase();
  return entries.filter((entry) =>
    entry.label.toLocaleLowerCase().includes(normalized),
  );
}
