/**
 * Provider-independent Adhkar read abstraction.
 *
 * Pure types only. Nothing here performs I/O, and nothing here may ever
 * carry invented dhikr text, fabricated hadith, or a fabricated source
 * reference — only structural facts (category taxonomy) and an honest
 * three-state availability model, exactly mirroring the Quran integration
 * foundation (src/lib/quran/content).
 */

/**
 * The only three honest states a category or item may report:
 * - "empty": no verified content exists for this scope yet.
 * - "pending": verified content has been prepared but has not cleared
 *   review, so it must not be rendered as real content yet.
 * - "available": reviewed, verified content exists for this scope.
 */
export type AdhkarContentStatus = "empty" | "pending" | "available";

/** The kind of source a future verified dhikr item is drawn from. */
export type AdhkarSourceType =
  "quran" | "hadith" | "athar" | "scholarly" | "other";

export type AdhkarReviewStatus = "not_reviewed" | "in_review" | "reviewed";

/**
 * Everything a future verified dhikr item must be able to represent about
 * its provenance, per the M(Adhkar) source and trust model. Every field is
 * nullable because, as of this milestone, no item has real values for any
 * of them — the shape exists so the UI can render it once real data does.
 */
export interface AdhkarSourceMetadata {
  readonly sourceType: AdhkarSourceType | null;
  readonly sourceTitle: string | null;
  readonly collection: string | null;
  readonly referenceLocator: string | null;
  readonly gradingStatus: string | null;
  readonly reviewerStatus: AdhkarReviewStatus | null;
  readonly attribution: string | null;
  readonly notes: string | null;
  readonly verificationDate: string | null;
}

export const EMPTY_SOURCE_METADATA: AdhkarSourceMetadata = {
  sourceType: null,
  sourceTitle: null,
  collection: null,
  referenceLocator: null,
  gradingStatus: null,
  reviewerStatus: null,
  attribution: null,
  notes: null,
  verificationDate: null,
};

/**
 * A single verified dhikr item. Only ever populated once a real, reviewed
 * source exists — `arabicText` is never a placeholder or invented string.
 */
export interface AdhkarItem {
  readonly id: string;
  readonly order: number;
  readonly arabicText: string;
  readonly translation: string | null;
  readonly transliteration: string | null;
  readonly repeatCount: number;
  readonly source: AdhkarSourceMetadata;
}

export interface CategoryAvailability {
  readonly categoryId: string;
  readonly status: AdhkarContentStatus;
  /** Only ever non-null when status is "available", and only ever a real, sourced count. */
  readonly itemCount: number | null;
}

export interface AdhkarAvailabilitySnapshot {
  readonly status: AdhkarContentStatus;
  readonly availableCategoryCount: number;
  readonly totalCategoryCount: number;
  readonly generatedAt: string;
}

/**
 * Provider-independent read seam between the Adhkar UI and wherever
 * verified content eventually lives. Pages and components depend only on
 * this interface, never on a concrete storage mechanism.
 */
export interface AdhkarContentSource {
  readonly kind: string;
  getCategoryAvailability(categoryId: string): Promise<CategoryAvailability>;
  listCategoryAvailability(): Promise<readonly CategoryAvailability[]>;
  getCategoryItems(categoryId: string): Promise<readonly AdhkarItem[]>;
  getSnapshot(): Promise<AdhkarAvailabilitySnapshot>;
}

/**
 * Fixed required notice shown wherever real content would eventually
 * render. Kept verbatim so it remains an unambiguous, greppable marker.
 */
export const PLACEHOLDER_NOTICE = "Placeholder — awaiting licensed content";
