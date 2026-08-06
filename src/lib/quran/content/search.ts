/**
 * Structural + availability-aware search over an already-fetched surah
 * list (see reader-data.ts). Pure and synchronous: it never fetches, so a
 * client component can filter on every keystroke without a network round
 * trip.
 *
 * A surah-number query always resolves — 114 is a structural fact. An
 * ayah-level query ("2:5") only resolves once that surah's real, imported
 * ayah count is known; we never guess whether an unverified ayah number
 * exists.
 */
import type { SurahReaderData } from "./reader-data";

export type SurahSearchHitKind = "surah" | "reference";

export interface SurahSearchHit {
  readonly kind: SurahSearchHitKind;
  readonly reference: string;
  readonly hrefSuffix: string;
  readonly surahNumber: number;
  readonly ayahNumber?: number;
}

const REFERENCE_PATTERN = /^(\d{1,3})(?::(\d{1,3}))?$/;

export function searchSurahIndex(
  surahs: readonly SurahReaderData[],
  query: string,
): readonly SurahSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const referenceMatch = REFERENCE_PATTERN.exec(trimmed);
  if (referenceMatch) {
    const surahNumber = Number(referenceMatch[1]);
    const surah = surahs.find((entry) => entry.number === surahNumber);
    if (!surah) {
      return [];
    }
    if (referenceMatch[2]) {
      const ayahNumber = Number(referenceMatch[2]);
      if (!surah.ayahCount || ayahNumber < 1 || ayahNumber > surah.ayahCount) {
        return [];
      }
      return [
        {
          kind: "reference",
          reference: `${surah.number}:${ayahNumber}`,
          hrefSuffix: `/${surah.slug}#ayah-${surah.number}-${ayahNumber}`,
          surahNumber: surah.number,
          ayahNumber,
        },
      ];
    }
    return [
      {
        kind: "surah",
        reference: String(surah.number),
        hrefSuffix: `/${surah.slug}`,
        surahNumber: surah.number,
      },
    ];
  }

  return surahs
    .filter((surah) => String(surah.number).includes(trimmed))
    .slice(0, 8)
    .map((surah) => ({
      kind: "surah" as const,
      reference: String(surah.number),
      hrefSuffix: `/${surah.slug}`,
      surahNumber: surah.number,
    }));
}
