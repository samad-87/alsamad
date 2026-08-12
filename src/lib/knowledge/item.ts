/**
 * Pure constructor for KnowledgeItem. Validates the invariants the type
 * alone cannot express, then returns a frozen (defensively immutable)
 * object. No I/O, no storage — this is the one place every adapter and
 * every future caller funnels through so those invariants are enforced
 * uniformly instead of re-checked ad hoc.
 */
import { KnowledgeEntityError } from "./errors";
import { KNOWN_KNOWLEDGE_ITEM_KINDS } from "./types";
import type {
  KnowledgeAvailabilityState,
  KnowledgeEditorialClass,
  KnowledgeItem,
  KnowledgeItemId,
  KnowledgeLocalizedText,
  KnowledgeSourceAttribution,
  KnowledgeVerificationState,
} from "./types";
import { EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION } from "./types";

export interface CreateKnowledgeItemInput {
  readonly id: KnowledgeItemId;
  /** Required when id.kind === "future-extension", forbidden otherwise. */
  readonly extensionKind?: string | null;
  readonly availability: KnowledgeAvailabilityState;
  readonly editorialClass: KnowledgeEditorialClass;
  readonly verificationState: KnowledgeVerificationState;
  readonly presentations: readonly KnowledgeLocalizedText[];
  readonly source?: KnowledgeSourceAttribution;
}

export function createKnowledgeItem(
  input: CreateKnowledgeItemInput,
): KnowledgeItem {
  const { id } = input;

  if (!id.canonicalKey.trim()) {
    throw new KnowledgeEntityError(
      "KnowledgeItem.id.canonicalKey must not be blank",
      "blank_canonical_key",
    );
  }

  const isKnownKind = (
    KNOWN_KNOWLEDGE_ITEM_KINDS as readonly string[]
  ).includes(id.kind);

  if (id.kind === "future-extension") {
    if (!input.extensionKind || !input.extensionKind.trim()) {
      throw new KnowledgeEntityError(
        'extensionKind is required and must be non-blank when id.kind is "future-extension"',
        "missing_extension_kind",
      );
    }
  } else if (isKnownKind) {
    if (input.extensionKind) {
      throw new KnowledgeEntityError(
        "extensionKind must be null for a known kind",
        "unexpected_extension_kind",
      );
    }
  } else {
    throw new KnowledgeEntityError(
      `unknown KnowledgeItemKind: "${id.kind}"`,
      "unknown_kind",
    );
  }

  if (input.presentations.length === 0) {
    throw new KnowledgeEntityError(
      "KnowledgeItem must carry at least one localized presentation",
      "missing_presentation",
    );
  }

  const localeSeen = new Set<string>();
  for (const presentation of input.presentations) {
    if (localeSeen.has(presentation.locale)) {
      throw new KnowledgeEntityError(
        `duplicate presentation for locale "${presentation.locale}"`,
        "duplicate_presentation_locale",
      );
    }
    localeSeen.add(presentation.locale);
    if (!presentation.title.trim()) {
      throw new KnowledgeEntityError(
        `presentation for locale "${presentation.locale}" must have a non-blank title`,
        "blank_presentation_title",
      );
    }
  }

  const item: KnowledgeItem = {
    id,
    extensionKind: input.extensionKind ?? null,
    availability: input.availability,
    editorialClass: input.editorialClass,
    verificationState: input.verificationState,
    presentations: input.presentations,
    source: input.source ?? EMPTY_KNOWLEDGE_SOURCE_ATTRIBUTION,
  };

  return Object.freeze(item);
}
