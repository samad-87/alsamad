/**
 * Generic filter validation and matching. Every check here compares a
 * plain value against a known-value list already exported elsewhere in
 * src/lib/knowledge — nothing here branches on which module an item came
 * from.
 */
import { locales } from "@/lib/i18n";
import { KnowledgeEntityError } from "../errors";
import { KNOWN_ITEM_KINDS, KNOWN_OWNING_MODULES } from "../identity";
import {
  KNOWN_KNOWLEDGE_EDITORIAL_CLASSES,
  KNOWN_KNOWLEDGE_VERIFICATION_STATES,
} from "../types";
import type { KnowledgeItem } from "../types";
import type { KnowledgeSearchFilters } from "./types";

function validateKnownValues<T extends string>(
  values: readonly T[] | undefined,
  known: readonly T[],
  fieldName: string,
): void {
  if (!values) {
    return;
  }
  for (const value of values) {
    if (!known.includes(value)) {
      throw new KnowledgeEntityError(
        `unknown value "${value}" in filters.${fieldName}`,
        "unknown_filter_value",
      );
    }
  }
}

/** Throws KnowledgeEntityError on the first unknown or malformed filter value found. */
export function validateSearchFilters(
  filters: KnowledgeSearchFilters | undefined,
): void {
  if (!filters) {
    return;
  }
  validateKnownValues(
    filters.owningModules,
    KNOWN_OWNING_MODULES,
    "owningModules",
  );
  validateKnownValues(filters.kinds, KNOWN_ITEM_KINDS, "kinds");
  validateKnownValues(
    filters.editorialClasses,
    KNOWN_KNOWLEDGE_EDITORIAL_CLASSES,
    "editorialClasses",
  );
  validateKnownValues(
    filters.verificationStates,
    KNOWN_KNOWLEDGE_VERIFICATION_STATES,
    "verificationStates",
  );
  validateKnownValues(filters.locales, locales, "locales");
  if (filters.extensionKinds) {
    for (const value of filters.extensionKinds) {
      if (!value.trim()) {
        throw new KnowledgeEntityError(
          "filters.extensionKinds must not contain blank values",
          "invalid_filter_value",
        );
      }
    }
  }
}

/** Pure predicate. Assumes filters have already been validated. */
export function matchesFilters(
  item: KnowledgeItem,
  filters: KnowledgeSearchFilters | undefined,
): boolean {
  if (!filters) {
    return true;
  }
  if (
    filters.owningModules &&
    !filters.owningModules.includes(item.id.owningModule)
  ) {
    return false;
  }
  if (filters.kinds && !filters.kinds.includes(item.id.kind)) {
    return false;
  }
  if (
    filters.editorialClasses &&
    !filters.editorialClasses.includes(item.editorialClass)
  ) {
    return false;
  }
  if (
    filters.verificationStates &&
    !filters.verificationStates.includes(item.verificationState)
  ) {
    return false;
  }
  if (
    filters.locales &&
    !item.presentations.some((p) => filters.locales!.includes(p.locale))
  ) {
    return false;
  }
  if (filters.extensionKinds) {
    if (item.id.kind !== "future-extension") {
      return false;
    }
    if (
      !item.extensionKind ||
      !filters.extensionKinds.includes(item.extensionKind)
    ) {
      return false;
    }
  }
  return true;
}
