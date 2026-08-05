import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type EmptyReaderStateKind =
  "no-search-results" | "no-bookmarks" | "no-last-read" | "error";

export function EmptyReaderState({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EmptyReaderStateKind;
}) {
  const c = t(locale);
  const copy: Record<EmptyReaderStateKind, { icon: string; title: string }> = {
    "no-search-results": { icon: "◇", title: c.searchNoResults },
    "no-bookmarks": { icon: "☆", title: c.noBookmarksYet },
    "no-last-read": { icon: "◌", title: c.noLastRead },
    error: { icon: "!", title: c.searchNoResults },
  };
  const entry = copy[kind];
  return (
    <div className="empty-state surface">
      <span aria-hidden="true">{entry.icon}</span>
      <strong>{entry.title}</strong>
      <p className="muted">{c.fixture}</p>
    </div>
  );
}
