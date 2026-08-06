/**
 * Server-side data helpers that combine surah structure with the
 * configured QuranContentSource. Pages and server components depend only
 * on these functions — never on a mock module, never on a concrete source
 * implementation.
 */
import { getQuranContentSource } from "./source";
import { findSurahStructure, surahStructures } from "./structure";
import type {
  QuranAvailabilitySnapshot,
  QuranContentSource,
  QuranContentStatus,
} from "./types";

export interface SurahReaderData {
  readonly number: number;
  readonly slug: string;
  readonly status: QuranContentStatus;
  readonly ayahCount: number | null;
}

/**
 * Every helper below accepts an optional source, defaulting to the
 * configured production seam (`getQuranContentSource()`). Tests inject a
 * `createStaticQuranContentSource({...})` fixture to exercise pending/
 * available rendering paths without touching the default wiring.
 */
export async function getSurahReaderData(
  slug: string,
  source: QuranContentSource = getQuranContentSource(),
): Promise<SurahReaderData | null> {
  const structure = findSurahStructure(slug);
  if (!structure) {
    return null;
  }
  const availability = await source.getSurahAvailability(structure.number);
  return {
    number: structure.number,
    slug: structure.slug,
    status: availability.status,
    ayahCount: availability.ayahCount,
  };
}

export async function listSurahReaderData(
  source: QuranContentSource = getQuranContentSource(),
): Promise<readonly SurahReaderData[]> {
  const list = await source.listSurahAvailability();
  const byNumber = new Map(list.map((entry) => [entry.surahNumber, entry]));
  return surahStructures.map((structure) => {
    const availability = byNumber.get(structure.number);
    return {
      number: structure.number,
      slug: structure.slug,
      status: availability?.status ?? "empty",
      ayahCount: availability?.ayahCount ?? null,
    };
  });
}

export async function getQuranOverallStatus(
  source: QuranContentSource = getQuranContentSource(),
): Promise<QuranAvailabilitySnapshot> {
  return source.getSnapshot();
}

export interface VerseSlot {
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly reference: string;
  readonly elementId: string;
}

/**
 * Never fabricates a verse count: slots only exist once a surah is
 * genuinely "available" with a real, sourced ayahCount.
 */
export function verseSlotsFor(surah: SurahReaderData): readonly VerseSlot[] {
  if (surah.status !== "available" || !surah.ayahCount) {
    return [];
  }
  return Array.from({ length: surah.ayahCount }, (_, index) => {
    const ayahNumber = index + 1;
    return {
      surahNumber: surah.number,
      ayahNumber,
      reference: `${surah.number}:${ayahNumber}`,
      elementId: `ayah-${surah.number}-${ayahNumber}`,
    };
  });
}
