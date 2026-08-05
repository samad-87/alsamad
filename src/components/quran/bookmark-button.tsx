"use client";

import { BookmarkIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useBookmarks } from "@/lib/quran-reader-client";

export function BookmarkButton({
  locale,
  reference,
}: {
  locale: Locale;
  reference: string;
}) {
  const c = t(locale);
  const { isBookmarked, toggle } = useBookmarks();
  const active = isBookmarked(reference);
  return (
    <button
      type="button"
      className={`bookmark-button${active ? " active" : ""}`}
      aria-pressed={active}
      aria-label={active ? c.bookmarkRemove : c.bookmarkAdd}
      onClick={() => toggle(reference)}
    >
      <BookmarkIcon filled={active} />
    </button>
  );
}
