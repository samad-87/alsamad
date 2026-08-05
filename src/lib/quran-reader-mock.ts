/**
 * Dedicated synthetic mock provider for the Quran Reader UI foundation.
 *
 * Every value here is a deterministic placeholder. There is no real Arabic
 * text, translation, transliteration, or surah name/meaning anywhere in
 * this module — only structural, clearly synthetic numbers and labels.
 * Server-safe: no browser APIs, no network, no database.
 */

/**
 * Fixed required notice shown wherever real content would eventually
 * render. Kept verbatim (not translated) so it remains an unambiguous,
 * greppable marker across the whole reader UI.
 */
export const PLACEHOLDER_NOTICE = "Placeholder — awaiting licensed content";

/** The Quran has 114 chapters; this cardinality is structural, not content. */
export const MOCK_SURAH_COUNT = 114;

export interface MockSurah {
  readonly number: number;
  readonly slug: string;
  /** A deterministic, clearly synthetic verse count — never a real count. */
  readonly mockAyahCount: number;
}

function mockAyahCountFor(number: number): number {
  return 5 + ((number * 7) % 36);
}

export const mockSurahs: readonly MockSurah[] = Array.from(
  { length: MOCK_SURAH_COUNT },
  (_, index) => {
    const number = index + 1;
    return {
      number,
      slug: String(number),
      mockAyahCount: mockAyahCountFor(number),
    };
  },
);

export function findMockSurah(slug: string): MockSurah | undefined {
  return mockSurahs.find((surah) => surah.slug === slug);
}

export function adjacentMockSurahs(number: number): {
  readonly previous: MockSurah | undefined;
  readonly next: MockSurah | undefined;
} {
  return {
    previous: mockSurahs.find((surah) => surah.number === number - 1),
    next: mockSurahs.find((surah) => surah.number === number + 1),
  };
}

export interface MockVerseSlot {
  readonly surahNumber: number;
  readonly ayahNumber: number;
  readonly reference: string;
  readonly elementId: string;
}

export function mockVerseSlots(surah: MockSurah): readonly MockVerseSlot[] {
  return Array.from({ length: surah.mockAyahCount }, (_, index) => {
    const ayahNumber = index + 1;
    return {
      surahNumber: surah.number,
      ayahNumber,
      reference: `${surah.number}:${ayahNumber}`,
      elementId: `ayah-${surah.number}-${ayahNumber}`,
    };
  });
}

export type MockSearchHitKind = "surah" | "reference";

export interface MockSearchHit {
  readonly kind: MockSearchHitKind;
  readonly label: string;
  readonly reference: string;
  readonly hrefSuffix: string;
  readonly surahNumber: number;
  readonly ayahNumber?: number;
}

const REFERENCE_PATTERN = /^(\d{1,3})(?::(\d{1,3}))?$/;

/**
 * Structural-only search: resolves a surah number or "surah:ayah" locator
 * against the synthetic index. There is no verse text to search, so this
 * never claims to match content — only navigable structure.
 */
export function searchMockIndex(query: string): readonly MockSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const referenceMatch = REFERENCE_PATTERN.exec(trimmed);
  if (referenceMatch) {
    const surahNumber = Number(referenceMatch[1]);
    const surah = mockSurahs.find((entry) => entry.number === surahNumber);
    if (!surah) {
      return [];
    }
    if (referenceMatch[2]) {
      const ayahNumber = Number(referenceMatch[2]);
      if (ayahNumber < 1 || ayahNumber > surah.mockAyahCount) {
        return [];
      }
      return [
        {
          kind: "reference",
          label: `${surah.number}:${ayahNumber}`,
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
        label: `Surah ${surah.number}`,
        reference: String(surah.number),
        hrefSuffix: `/${surah.slug}`,
        surahNumber: surah.number,
      },
    ];
  }

  return mockSurahs
    .filter((surah) => String(surah.number).includes(trimmed))
    .slice(0, 8)
    .map((surah) => ({
      kind: "surah" as const,
      label: `Surah ${surah.number}`,
      reference: String(surah.number),
      hrefSuffix: `/${surah.slug}`,
      surahNumber: surah.number,
    }));
}
