import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { MockSearchHit } from "@/lib/quran-reader-mock";
import { ReferenceBadge } from "./reference-badge";

export function SearchResultCard({
  locale,
  hit,
  basePath,
}: {
  locale: Locale;
  hit: MockSearchHit;
  basePath: string;
}) {
  const c = t(locale);
  return (
    <Link
      href={`${basePath}${hit.hrefSuffix}`}
      className="search-result-row surface"
    >
      <ReferenceBadge reference={hit.reference} />
      <span>{hit.label}</span>
      <span className="muted">{c.goToSurah} →</span>
    </Link>
  );
}
