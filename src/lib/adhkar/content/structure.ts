/**
 * Structural facts about the Adhkar category taxonomy — identity and
 * routing only, never text. Whether a route exists is itself a structural
 * fact (a category either has an implemented reader page or it doesn't);
 * it carries no religious content.
 */

export interface AdhkarCategoryStructure {
  readonly id: string;
  /** null means no reader route exists yet — the index must render this as a non-linking, honestly labeled entry. */
  readonly routeSlug: string | null;
}

export const ADHKAR_CATEGORIES: readonly AdhkarCategoryStructure[] = [
  { id: "morning", routeSlug: "morning" },
  { id: "evening", routeSlug: "evening" },
  { id: "sleep", routeSlug: null },
  { id: "travel", routeSlug: null },
  { id: "prayer", routeSlug: null },
  { id: "general", routeSlug: null },
];

export const ADHKAR_CATEGORY_COUNT = ADHKAR_CATEGORIES.length;

export function findCategoryById(
  id: string,
): AdhkarCategoryStructure | undefined {
  return ADHKAR_CATEGORIES.find((category) => category.id === id);
}

export function findCategoryByRouteSlug(
  routeSlug: string,
): AdhkarCategoryStructure | undefined {
  return ADHKAR_CATEGORIES.find((category) => category.routeSlug === routeSlug);
}

/** Categories with a real, implemented reader route today. */
export function implementedCategories(): readonly AdhkarCategoryStructure[] {
  return ADHKAR_CATEGORIES.filter((category) => category.routeSlug !== null);
}
