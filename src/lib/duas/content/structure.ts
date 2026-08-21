/**
 * Structural facts about the Duas category taxonomy — identity and
 * routing only, never text. Whether a route exists is itself a
 * structural fact; it carries no religious content.
 *
 * "general" routes to the existing, already-compliant editorial duas
 * system (src/app/[locale]/duas/general) rather than a new route — this
 * foundation reuses existing routing architecture instead of inventing
 * one.
 */

export interface DuaCategoryStructure {
  readonly id: string;
  /** null means no reader route exists yet — the index must render this as a non-linking, honestly labeled entry. */
  readonly routeSlug: string | null;
}

export const DUA_CATEGORIES: readonly DuaCategoryStructure[] = [
  { id: "general", routeSlug: "general" },
  { id: "family", routeSlug: null },
  { id: "health", routeSlug: null },
  { id: "provision", routeSlug: null },
  { id: "travel", routeSlug: null },
  { id: "forgiveness", routeSlug: null },
  { id: "gratitude", routeSlug: null },
  { id: "protection", routeSlug: null },
];

export const DUA_CATEGORY_COUNT = DUA_CATEGORIES.length;

export function findCategoryById(id: string): DuaCategoryStructure | undefined {
  return DUA_CATEGORIES.find((category) => category.id === id);
}

export function findCategoryByRouteSlug(
  routeSlug: string,
): DuaCategoryStructure | undefined {
  return DUA_CATEGORIES.find((category) => category.routeSlug === routeSlug);
}

/** Categories with a real, implemented reader route today. */
export function implementedCategories(): readonly DuaCategoryStructure[] {
  return DUA_CATEGORIES.filter((category) => category.routeSlug !== null);
}
