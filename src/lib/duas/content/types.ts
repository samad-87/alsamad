/**
 * Provider-independent Duas read abstraction.
 *
 * Pure types only. Nothing here performs I/O, and nothing here may ever
 * carry invented dua text or a fabricated reference — only structural
 * facts (category taxonomy) and an honest three-state availability model,
 * mirroring the Adhkar and Quran integration foundations
 * (src/lib/adhkar/content, src/lib/quran/content).
 *
 * The single most important rule enforced by this module's shape: every
 * DuaItem carries an explicit, required `kind` — "authentic" or
 * "editorial" — and the two must never be presented identically. UI
 * components branch on `kind`, never guess it.
 */

/**
 * The only three honest states a category or item may report:
 * - "empty": no content exists for this scope yet.
 * - "pending": content has been prepared but has not cleared review.
 * - "available": reviewed, published content exists for this scope.
 */
export type DuaContentStatus = "empty" | "pending" | "available";

/**
 * Authentic: sourced from the Quran, authentic Sunnah, or a verified
 * collection. Editorial: written by ALSAMAD editors. These are
 * intentionally different concepts that must never be visually or
 * structurally indistinguishable.
 */
export type DuaKind = "authentic" | "editorial";

export type DuaSourceType = "quran" | "sunnah" | "collection" | "editorial";

export type DuaReviewerStatus = "not_reviewed" | "in_review" | "reviewed";

export type DuaAuthenticityStatus =
  "not_applicable" | "unverified" | "verified";

/**
 * Everything a future dua item must be able to represent about its
 * provenance. Every field is nullable because, as of this milestone, no
 * item has real values for any of them — the shape exists so the UI can
 * render it once real data does.
 */
export interface DuaSourceMetadata {
  readonly sourceType: DuaSourceType | null;
  readonly sourceTitle: string | null;
  readonly collection: string | null;
  readonly reference: string | null;
  readonly authenticity: DuaAuthenticityStatus | null;
  readonly reviewer: DuaReviewerStatus | null;
  readonly attribution: string | null;
  readonly notes: string | null;
  readonly verificationDate: string | null;
}

export const EMPTY_DUA_SOURCE_METADATA: DuaSourceMetadata = {
  sourceType: null,
  sourceTitle: null,
  collection: null,
  reference: null,
  authenticity: null,
  reviewer: null,
  attribution: null,
  notes: null,
  verificationDate: null,
};

/**
 * A single dua item. Only ever populated once real content exists —
 * `arabicText` is never a placeholder or invented string. `kind` is
 * required and drives which badge (authenticity vs editorial) the reader
 * shows; there is no default and no inference.
 */
export interface DuaItem {
  readonly id: string;
  readonly order: number;
  readonly kind: DuaKind;
  readonly title: string;
  readonly arabicText: string;
  readonly translation: string | null;
  readonly transliteration: string | null;
  readonly source: DuaSourceMetadata;
}

export interface DuaCategoryAvailability {
  readonly categoryId: string;
  readonly status: DuaContentStatus;
  /** Only ever non-null when status is "available", and only ever a real, sourced count. */
  readonly itemCount: number | null;
}

export interface DuaAvailabilitySnapshot {
  readonly status: DuaContentStatus;
  readonly availableCategoryCount: number;
  readonly totalCategoryCount: number;
  readonly generatedAt: string;
}

/**
 * Provider-independent read seam between the Duas UI and wherever real
 * content eventually lives. Pages and components depend only on this
 * interface, never on a concrete storage mechanism.
 */
export interface DuaContentSource {
  readonly kind: string;
  getCategoryAvailability(categoryId: string): Promise<DuaCategoryAvailability>;
  listCategoryAvailability(): Promise<readonly DuaCategoryAvailability[]>;
  getCategoryItems(categoryId: string): Promise<readonly DuaItem[]>;
  getSnapshot(): Promise<DuaAvailabilitySnapshot>;
}

/**
 * Fixed required notice shown wherever real content would eventually
 * render. Kept verbatim so it remains an unambiguous, greppable marker.
 */
export const PLACEHOLDER_NOTICE = "Placeholder — awaiting licensed content";
