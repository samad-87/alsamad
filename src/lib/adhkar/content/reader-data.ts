/**
 * Server-side data helpers that combine category structure with the
 * configured AdhkarContentSource. Pages and server components depend only
 * on these functions — never on a concrete source implementation.
 *
 * Every helper accepts an optional source, defaulting to the configured
 * production seam (`getAdhkarContentSource()`). Tests inject a
 * `createStaticAdhkarContentSource({...})` fixture to exercise pending/
 * available rendering paths without touching the default wiring.
 */
import { getAdhkarContentSource } from "./source";
import { ADHKAR_CATEGORIES, findCategoryById } from "./structure";
import type {
  AdhkarAvailabilitySnapshot,
  AdhkarContentSource,
  AdhkarContentStatus,
  AdhkarItem,
} from "./types";

export interface CategoryReaderData {
  readonly id: string;
  readonly routeSlug: string | null;
  readonly status: AdhkarContentStatus;
  readonly itemCount: number | null;
}

export async function getCategoryReaderData(
  categoryId: string,
  source: AdhkarContentSource = getAdhkarContentSource(),
): Promise<CategoryReaderData | null> {
  const structure = findCategoryById(categoryId);
  if (!structure) {
    return null;
  }
  const availability = await source.getCategoryAvailability(structure.id);
  return {
    id: structure.id,
    routeSlug: structure.routeSlug,
    status: availability.status,
    itemCount: availability.itemCount,
  };
}

export async function listCategoryReaderData(
  source: AdhkarContentSource = getAdhkarContentSource(),
): Promise<readonly CategoryReaderData[]> {
  const list = await source.listCategoryAvailability();
  const byId = new Map(list.map((entry) => [entry.categoryId, entry]));
  return ADHKAR_CATEGORIES.map((structure) => {
    const availability = byId.get(structure.id);
    return {
      id: structure.id,
      routeSlug: structure.routeSlug,
      status: availability?.status ?? "empty",
      itemCount: availability?.itemCount ?? null,
    };
  });
}

export async function getCategoryItemsReaderData(
  categoryId: string,
  source: AdhkarContentSource = getAdhkarContentSource(),
): Promise<readonly AdhkarItem[]> {
  return source.getCategoryItems(categoryId);
}

export async function getAdhkarOverallStatus(
  source: AdhkarContentSource = getAdhkarContentSource(),
): Promise<AdhkarAvailabilitySnapshot> {
  return source.getSnapshot();
}
