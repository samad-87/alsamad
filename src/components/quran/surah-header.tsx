import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { MockSurah } from "@/lib/quran-reader-mock";
import { PLACEHOLDER_NOTICE } from "@/lib/quran-reader-mock";

export function SurahHeader({
  locale,
  surah,
}: {
  locale: Locale;
  surah: MockSurah;
}) {
  const c = t(locale);
  return (
    <header className="reader-header feature-surface">
      <span className="eyebrow">{c.reader}</span>
      <h1 className="title">
        {locale === "ar" ? "سورة" : "Surah"} {surah.number}
      </h1>
      <p>
        {surah.mockAyahCount}{" "}
        {locale === "ar" ? "آية (تجريبي)" : "verses (mock)"}
      </p>
      <p className="muted">{PLACEHOLDER_NOTICE}</p>
    </header>
  );
}
