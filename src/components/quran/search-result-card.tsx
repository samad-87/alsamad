import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { SurahSearchHit } from "@/lib/quran/content/search";
import { ReferenceBadge } from "./reference-badge";

export function SearchResultCard({
  locale,
  hit,
  basePath,
}: {
  locale: Locale;
  hit: SurahSearchHit;
  basePath: string;
}) {
  const c = t(locale);
  const label =
    hit.kind === "reference"
      ? hit.reference
      : `${locale === "ar" ? "سورة" : "Surah"} ${hit.surahNumber}`;
  return (
    <Link
      href={`${basePath}${hit.hrefSuffix}`}
      className="search-result-row surface"
    >
      <ReferenceBadge reference={hit.reference} />
      <span>{label}</span>
      <span className="muted">{c.goToSurah} →</span>
    </Link>
  );
}
