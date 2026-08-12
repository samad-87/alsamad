/**
 * Read-only projections from the existing Adhkar content module into
 * KnowledgeItem. These functions perform no status computation of their
 * own — they only reshape data the Adhkar module already produced via
 * src/lib/adhkar/content/reader-data.ts. Adhkar is always authentic content
 * (no editorial concept exists for it), matching the module's own types.
 *
 * Localized titles are supplied by the caller (a record keyed by locale)
 * rather than looked up here, since the category/item id-to-copy mapping
 * already lives in src/lib/i18n.ts and should not be duplicated in this
 * layer.
 */
import type { Locale } from "@/lib/i18n";
import { createKnowledgeItem } from "../item";
import type { KnowledgeItem, KnowledgeSourceAttribution } from "../types";
import type {
  AdhkarItem,
  AdhkarSourceMetadata,
} from "@/lib/adhkar/content/types";
import type { CategoryReaderData } from "@/lib/adhkar/content/reader-data";
import { labelsToPresentations } from "./shared";

function toSourceAttribution(
  source: AdhkarSourceMetadata,
): KnowledgeSourceAttribution {
  return {
    sourceType: source.sourceType,
    sourceTitle: source.sourceTitle,
    collection: source.collection,
    reference: source.referenceLocator,
    authenticityOrGrading: source.gradingStatus,
    reviewerStatus: source.reviewerStatus,
    attribution: source.attribution,
    notes: source.notes,
    verificationDate: source.verificationDate,
  };
}

function reviewerStatusToVerificationState(
  reviewerStatus: AdhkarSourceMetadata["reviewerStatus"],
) {
  return reviewerStatus ?? "not_reviewed";
}

export function adhkarCategoryToKnowledgeItem(
  category: CategoryReaderData,
  labels: Readonly<Record<Locale, string>>,
): KnowledgeItem {
  return createKnowledgeItem({
    id: {
      owningModule: "devotional",
      kind: "adhkar",
      canonicalKey: `category:${category.id}`,
    },
    availability: category.status,
    editorialClass: "authentic",
    verificationState:
      category.status === "available" ? "reviewed" : "not_reviewed",
    presentations: labelsToPresentations(labels),
  });
}

export function adhkarItemToKnowledgeItem(
  item: AdhkarItem,
  categoryId: string,
  labels: Readonly<Record<Locale, string>>,
): KnowledgeItem {
  return createKnowledgeItem({
    id: {
      owningModule: "devotional",
      kind: "adhkar",
      canonicalKey: `item:${categoryId}:${item.id}`,
    },
    availability: "available",
    editorialClass: "authentic",
    verificationState: reviewerStatusToVerificationState(
      item.source.reviewerStatus,
    ),
    presentations: labelsToPresentations(labels),
    source: toSourceAttribution(item.source),
  });
}
