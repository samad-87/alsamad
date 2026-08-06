import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { CategoryReaderData } from "@/lib/adhkar/content/reader-data";

/**
 * A single Adhkar index category card. Categories with an implemented
 * route render as a real link carrying an honest status line; categories
 * with no route yet render as a non-linking, clearly labeled future
 * module — never a broken link, never invented content.
 */
export function AdhkarCategoryCard({
  locale,
  label,
  data,
}: {
  locale: Locale;
  label: string;
  data: CategoryReaderData;
}) {
  const c = t(locale);

  if (!data.routeSlug) {
    return (
      <article className="content-card surface placeholder-card">
        <span className="eyebrow">{c.futureModule}</span>
        <h3>{label}</h3>
        <p className="muted">{c.adhkarFutureCategoryBody}</p>
        <span className="chip status-chip">
          {c.futureModule} · {c.comingSoon}
        </span>
      </article>
    );
  }

  const statusLabel =
    data.status === "available"
      ? c.adhkarStatusAvailable
      : data.status === "pending"
        ? c.adhkarStatusPending
        : c.adhkarStatusEmpty;
  const statusIcon =
    data.status === "available" ? "✓" : data.status === "pending" ? "◐" : "◌";

  return (
    <Link
      href={`/${locale}/adhkar/${data.routeSlug}`}
      className="content-card surface"
    >
      <span className="eyebrow">{c.categories}</span>
      <h3>{label}</h3>
      <p className="muted">
        {statusIcon} {statusLabel}
      </p>
      <span className="card-action">{c.view} →</span>
    </Link>
  );
}
