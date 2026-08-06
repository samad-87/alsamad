/**
 * Structural facts about the Quran's chapter layout — cardinality and
 * numbering only, never text, names, or verse counts. A surah's real ayah
 * count is content that must come from an imported, published edition
 * (see ./db-source.ts), not a structural constant.
 */

/** The Quran has 114 chapters; this cardinality is structural, not content. */
export const QURAN_SURAH_COUNT = 114;

export interface SurahStructure {
  readonly number: number;
  readonly slug: string;
}

export const surahStructures: readonly SurahStructure[] = Array.from(
  { length: QURAN_SURAH_COUNT },
  (_, index) => {
    const number = index + 1;
    return { number, slug: String(number) };
  },
);

export function findSurahStructure(slug: string): SurahStructure | undefined {
  return surahStructures.find((surah) => surah.slug === slug);
}

export function adjacentSurahStructures(number: number): {
  readonly previous: SurahStructure | undefined;
  readonly next: SurahStructure | undefined;
} {
  return {
    previous: surahStructures.find((surah) => surah.number === number - 1),
    next: surahStructures.find((surah) => surah.number === number + 1),
  };
}
