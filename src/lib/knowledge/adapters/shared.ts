/**
 * Shared helper used by every adapter that receives caller-supplied,
 * per-locale labels rather than deriving presentation text itself (Adhkar
 * and Duas category/item ids have no localized name stored anywhere but
 * src/lib/i18n.ts, which the knowledge layer must not duplicate).
 */
import type { Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";
import type { KnowledgeLocalizedText } from "../types";

export function labelsToPresentations(
  labels: Readonly<Record<Locale, string>>,
): readonly KnowledgeLocalizedText[] {
  return locales.map((locale) => ({
    locale,
    title: labels[locale],
    summary: null,
  }));
}
