/**
 * Read-only projections from the existing Quran content module into
 * KnowledgeItem. These functions perform no status computation of their
 * own — they only reshape data the Quran module already produced via
 * src/lib/quran/content/reader-data.ts. The Quran is always canonical, so
 * editorialClass is always "authentic" and verificationState is always
 * "reviewed" (never re-derived, per
 * ALSAMAD_KNOWLEDGE_ENGINE_ARCHITECTURE.md §3.4: "Quran — always canonical,
 * Quran is never editorial").
 */
import { locales } from "@/lib/i18n";
import { createKnowledgeItem } from "../item";
import type { KnowledgeItem, KnowledgeLocalizedText } from "../types";
import type {
  SurahReaderData,
  VerseSlot,
} from "@/lib/quran/content/reader-data";

function surahLabel(locale: (typeof locales)[number], surahNumber: number) {
  return `${locale === "ar" ? "سورة" : "Surah"} ${surahNumber}`;
}

export function surahToKnowledgeItem(surah: SurahReaderData): KnowledgeItem {
  const presentations: readonly KnowledgeLocalizedText[] = locales.map(
    (locale) => ({
      locale,
      title: surahLabel(locale, surah.number),
      summary: null,
    }),
  );

  return createKnowledgeItem({
    id: {
      owningModule: "quran",
      kind: "surah",
      canonicalKey: `${surah.number}`,
    },
    availability: surah.status,
    editorialClass: "authentic",
    verificationState:
      surah.status === "available" ? "reviewed" : "not_reviewed",
    presentations,
  });
}

/**
 * A VerseSlot only ever exists for a surah whose status is already
 * "available" with a real ayahCount (see verseSlotsFor's own contract),
 * so an ayah projected here is always "available" and "reviewed" — that
 * invariant is enforced by the Quran module, not re-checked here.
 */
export function ayahToKnowledgeItem(slot: VerseSlot): KnowledgeItem {
  const presentations: readonly KnowledgeLocalizedText[] = locales.map(
    (locale) => ({
      locale,
      title: `${locale === "ar" ? "آية" : "Ayah"} ${slot.reference}`,
      summary: null,
    }),
  );

  return createKnowledgeItem({
    id: {
      owningModule: "quran",
      kind: "ayah",
      canonicalKey: slot.reference,
    },
    availability: "available",
    editorialClass: "authentic",
    verificationState: "reviewed",
    presentations,
  });
}
