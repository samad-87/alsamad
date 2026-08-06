/**
 * M5.4 provider-independent Quran read abstraction.
 *
 * Pure types only. Nothing here performs I/O, and nothing here may ever
 * carry fabricated verse text, translation, or transliteration — only
 * structural facts (surah numbers, ayah counts once genuinely imported)
 * and an honest three-state availability model.
 */

/**
 * The only three honest states the reader may report for a piece of
 * content:
 * - "empty": nothing has been imported for this scope.
 * - "pending": an import has produced data for this scope but it has not
 *   cleared publication (e.g. still in scholarly review), so it must not
 *   be rendered as real content yet.
 * - "available": imported, published content exists for this scope.
 */
export type QuranContentStatus = "empty" | "pending" | "available";

export interface SurahAvailability {
  readonly surahNumber: number;
  readonly status: QuranContentStatus;
  /** Only ever non-null when status is "available", and only ever a real, sourced count. */
  readonly ayahCount: number | null;
}

export interface QuranAvailabilitySnapshot {
  readonly status: QuranContentStatus;
  readonly availableSurahCount: number;
  /** 114 — a structural fact about the Quran, not imported content. */
  readonly totalSurahCount: number;
  readonly generatedAt: string;
}

/**
 * Provider-independent read seam between the UI and wherever imported
 * content eventually lives. The reader and homepage depend only on this
 * interface, never on a concrete storage mechanism or mock structure.
 */
export interface QuranContentSource {
  readonly kind: string;
  getSurahAvailability(surahNumber: number): Promise<SurahAvailability>;
  listSurahAvailability(): Promise<readonly SurahAvailability[]>;
  getSnapshot(): Promise<QuranAvailabilitySnapshot>;
}

/**
 * Fixed required notice shown wherever real content would eventually
 * render. Kept verbatim (not translated) so it remains an unambiguous,
 * greppable marker across the whole reader UI.
 */
export const PLACEHOLDER_NOTICE = "Placeholder — awaiting licensed content";
