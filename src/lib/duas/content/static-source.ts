/**
 * Deterministic, side-effect-free DuaContentSource.
 *
 * No filesystem, no network, no database. With no overrides, every
 * category honestly reports "empty" — because as of this milestone the
 * only real content is the existing, separately-maintained editorial
 * duas system, which this read abstraction does not (yet) reflect.
 * Overrides let tests (and a future orchestrator) express "pending" or
 * "available" for specific categories without touching this file or any
 * UI component.
 */
import { DUA_CATEGORIES, DUA_CATEGORY_COUNT } from "./structure";
import type {
  DuaAvailabilitySnapshot,
  DuaCategoryAvailability,
  DuaContentSource,
  DuaContentStatus,
  DuaItem,
} from "./types";

export interface CategoryAvailabilityOverride {
  readonly status: DuaContentStatus;
  readonly items?: readonly DuaItem[];
}

export type CategoryAvailabilityOverrides = Readonly<
  Record<string, CategoryAvailabilityOverride>
>;

/**
 * Aggregate precedence: available > pending > empty. "Available" means at
 * least one category genuinely has reviewed, published content right now
 * — that fact must never be hidden behind "pending" just because other
 * categories haven't started yet; doing so would misreport real, live
 * content as merely "awaiting review". "Pending" only applies once no
 * category is available but at least one has content prepared and not yet
 * cleared review. Only when every category is genuinely empty does the
 * aggregate report "empty".
 */
function overallStatus(
  list: readonly DuaCategoryAvailability[],
): DuaContentStatus {
  if (list.some((c) => c.status === "available")) {
    return "available";
  }
  if (list.some((c) => c.status === "pending")) {
    return "pending";
  }
  return "empty";
}

export function createStaticDuaContentSource(
  overrides: CategoryAvailabilityOverrides = {},
): DuaContentSource {
  function availabilityFor(categoryId: string): DuaCategoryAvailability {
    const override = overrides[categoryId];
    if (!override) {
      return { categoryId, status: "empty", itemCount: null };
    }
    return {
      categoryId,
      status: override.status,
      itemCount:
        override.status === "available" ? (override.items?.length ?? 0) : null,
    };
  }

  function itemsFor(categoryId: string): readonly DuaItem[] {
    const override = overrides[categoryId];
    if (!override || override.status !== "available") {
      return [];
    }
    return override.items ?? [];
  }

  return {
    kind: "static",
    async getCategoryAvailability(categoryId) {
      return availabilityFor(categoryId);
    },
    async listCategoryAvailability() {
      return DUA_CATEGORIES.map((category) => availabilityFor(category.id));
    },
    async getCategoryItems(categoryId) {
      return itemsFor(categoryId);
    },
    async getSnapshot(): Promise<DuaAvailabilitySnapshot> {
      const list = DUA_CATEGORIES.map((category) =>
        availabilityFor(category.id),
      );
      return {
        status: overallStatus(list),
        availableCategoryCount: list.filter((c) => c.status === "available")
          .length,
        totalCategoryCount: DUA_CATEGORY_COUNT,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

/** The current honest default: no read-abstraction-backed content exists yet. */
export const emptyDuaContentSource = createStaticDuaContentSource();
