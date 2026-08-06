import type { SurahReaderData } from "@/lib/quran/content/reader-data";
import { PLACEHOLDER_NOTICE } from "@/lib/quran/content/types";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function SurahHeader({
  locale,
  surah,
}: {
  locale: Locale;
  surah: SurahReaderData;
}) {
  const c = t(locale);
  const statusLabel =
    surah.status === "available"
      ? `${surah.ayahCount} ${locale === "ar" ? "آية" : "verses"}`
      : surah.status === "pending"
        ? c.quranStatusPending
        : c.quranStatusEmpty;
  return (
    <header className="reader-header feature-surface">
      <span className="eyebrow">{c.reader}</span>
      <h1 className="title">
        {locale === "ar" ? "سورة" : "Surah"} {surah.number}
      </h1>
      <p>{statusLabel}</p>
      <p className="muted">{PLACEHOLDER_NOTICE}</p>
    </header>
  );
}
