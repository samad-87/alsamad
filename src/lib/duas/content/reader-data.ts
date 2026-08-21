/**
 * Server-side data helpers that combine category structure with the
 * configured DuaContentSource. Pages and server components depend only
 * on these functions — never on a concrete source implementation.
 *
 * Every helper accepts an optional source, defaulting to the configured
 * production seam (`getDuaContentSource()`). Tests inject a
 * `createStaticDuaContentSource({...})` fixture to exercise pending/
 * available rendering paths without touching the default wiring.
 */
import { getDuaContentSource } from "./source";
import { DUA_CATEGORIES, findCategoryById } from "./structure";
import type {
  DuaAvailabilitySnapshot,
  DuaContentSource,
  DuaContentStatus,
  DuaItem,
} from "./types";

export interface CategoryReaderData {
  readonly id: string;
  readonly routeSlug: string | null;
  readonly status: DuaContentStatus;
  readonly itemCount: number | null;
}

export async function getCategoryReaderData(
  categoryId: string,
  source: DuaContentSource = getDuaContentSource(),
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
  source: DuaContentSource = getDuaContentSource(),
): Promise<readonly CategoryReaderData[]> {
  const list = await source.listCategoryAvailability();
  const byId = new Map(list.map((entry) => [entry.categoryId, entry]));
  return DUA_CATEGORIES.map((structure) => {
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
  source: DuaContentSource = getDuaContentSource(),
): Promise<readonly DuaItem[]> {
  return source.getCategoryItems(categoryId);
}

export async function getDuaOverallStatus(
  source: DuaContentSource = getDuaContentSource(),
): Promise<DuaAvailabilitySnapshot> {
  return source.getSnapshot();
}
