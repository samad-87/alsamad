"use client";

import { BookmarkIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useDuaBookmarks } from "@/lib/duas/client";

export function DuaBookmarkButton({
  locale,
  itemId,
}: {
  locale: Locale;
  itemId: string;
}) {
  const c = t(locale);
  const { isBookmarked, toggle } = useDuaBookmarks();
  const active = isBookmarked(itemId);
  return (
    <button
      type="button"
      className={`bookmark-button${active ? " active" : ""}`}
      aria-pressed={active}
      aria-label={active ? c.bookmarkRemove : c.bookmarkAdd}
      onClick={() => toggle(itemId)}
    >
      <BookmarkIcon filled={active} />
    </button>
  );
}
