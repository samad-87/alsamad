import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type EmptyReaderStateKind =
  | "no-search-results"
  | "no-bookmarks"
  | "no-last-read"
  | "no-content-imported"
  | "import-pending"
  | "error";

export function EmptyReaderState({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EmptyReaderStateKind;
}) {
  const c = t(locale);
  const copy: Record<
    EmptyReaderStateKind,
    { icon: string; title: string; body: string }
  > = {
    "no-search-results": {
      icon: "◇",
      title: c.searchNoResults,
      body: c.fixture,
    },
    "no-bookmarks": { icon: "☆", title: c.noBookmarksYet, body: c.fixture },
    "no-last-read": { icon: "◌", title: c.noLastRead, body: c.fixture },
    "no-content-imported": {
      icon: "◌",
      title: c.quranStatusEmpty,
      body: c.quranStatusEmptyBody,
    },
    "import-pending": {
      icon: "◐",
      title: c.quranStatusPending,
      body: c.quranStatusPendingBody,
    },
    error: { icon: "!", title: c.searchNoResults, body: c.fixture },
  };
  const entry = copy[kind];
  return (
    <div className="empty-state surface">
      <span aria-hidden="true">{entry.icon}</span>
      <strong>{entry.title}</strong>
      <p className="muted">{entry.body}</p>
    </div>
  );
}
