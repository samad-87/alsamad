/**
 * Deterministic, side-effect-free AdhkarContentSource.
 *
 * No filesystem, no network, no database. With no overrides, every
 * category honestly reports "empty" — because as of this milestone no
 * verified dhikr content has been reviewed or published. Overrides let
 * tests (and a future orchestrator) express "pending" or "available" for
 * specific categories without touching this file or any UI component.
 */
import { ADHKAR_CATEGORY_COUNT, ADHKAR_CATEGORIES } from "./structure";
import type {
  AdhkarAvailabilitySnapshot,
  AdhkarContentSource,
  AdhkarContentStatus,
  AdhkarItem,
  CategoryAvailability,
} from "./types";

export interface CategoryAvailabilityOverride {
  readonly status: AdhkarContentStatus;
  readonly items?: readonly AdhkarItem[];
}

export type CategoryAvailabilityOverrides = Readonly<
  Record<string, CategoryAvailabilityOverride>
>;

function overallStatus(
  list: readonly CategoryAvailability[],
): AdhkarContentStatus {
  const availableCount = list.filter((c) => c.status === "available").length;
  if (availableCount === list.length) {
    return "available";
  }
  const hasProgress = list.some((c) => c.status !== "empty");
  return hasProgress ? "pending" : "empty";
}

export function createStaticAdhkarContentSource(
  overrides: CategoryAvailabilityOverrides = {},
): AdhkarContentSource {
  function availabilityFor(categoryId: string): CategoryAvailability {
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

  function itemsFor(categoryId: string): readonly AdhkarItem[] {
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
      return ADHKAR_CATEGORIES.map((category) => availabilityFor(category.id));
    },
    async getCategoryItems(categoryId) {
      return itemsFor(categoryId);
    },
    async getSnapshot(): Promise<AdhkarAvailabilitySnapshot> {
      const list = ADHKAR_CATEGORIES.map((category) =>
        availabilityFor(category.id),
      );
      return {
        status: overallStatus(list),
        availableCategoryCount: list.filter((c) => c.status === "available")
          .length,
        totalCategoryCount: ADHKAR_CATEGORY_COUNT,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

/** The current honest default: no verified content exists yet. */
export const emptyAdhkarContentSource = createStaticAdhkarContentSource();
