"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";
import { AccessibleOverlay } from "@/components/accessible-overlay";
import { ClockIcon, MenuIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { SurahReaderData } from "@/lib/quran/content/reader-data";
import { useLastRead } from "@/lib/quran-reader-client";

export function SurahSidebar({
  locale,
  surahs,
  variant = "sidebar",
}: {
  locale: Locale;
  surahs: readonly SurahReaderData[];
  variant?: "sidebar" | "index";
}) {
  const c = t(locale);
  const pathname = usePathname();
  const { lastRead } = useLastRead();
  const lastReadSurahNumber = lastRead ? Number(lastRead.split(":")[0]) : null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return surahs;
    }
    return surahs.filter((surah) => String(surah.number).includes(trimmed));
  }, [query, surahs]);

  const searchLabel =
    variant === "index" ? c.search : `${c.search} — ${c.surahs}`;

  function statusLabel(surah: SurahReaderData): string {
    if (surah.status === "available") {
      return `${surah.ayahCount} ${locale === "ar" ? "آية" : "verses"}`;
    }
    if (surah.status === "pending") {
      return c.quranStatusPending;
    }
    return c.placeholderNoticeShort;
  }

  function renderList() {
    return (
      <div
        className={variant === "index" ? "surah-grid" : "quran-sidebar-list"}
      >
        {filtered.map((surah) => {
          const href = `/${locale}/quran/${surah.slug}`;
          const active = pathname === href;
          const isLastRead = surah.number === lastReadSurahNumber;
          return (
            <Link
              key={surah.slug}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={
                variant === "index"
                  ? "surah-row surface"
                  : `quran-sidebar-item${active ? " active" : ""}`
              }
            >
              <span className="surah-number">{surah.number}</span>
              {variant === "index" ? (
                <>
                  <div>
                    <strong>
                      {locale === "ar" ? "سورة" : "Surah"} {surah.number}
                    </strong>
                    <span className="muted">
                      {isLastRead ? c.lastRead : statusLabel(surah)}
                    </span>
                  </div>
                  <small>
                    {surah.status === "available"
                      ? `${surah.ayahCount} ${locale === "ar" ? "آية" : "verses"}`
                      : c.placeholderNoticeShort}
                  </small>
                </>
              ) : (
                <span className="quran-sidebar-item-meta">
                  {isLastRead && (
                    <>
                      <ClockIcon size={13} />
                      <span className="sr-only">{c.lastRead}</span>
                    </>
                  )}
                  {surah.status === "available" ? surah.ayahCount : null}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  if (variant === "index") {
    return renderList();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="button quran-sidebar-toggle"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="quran-sidebar-panel"
      >
        <MenuIcon /> {c.surahs}
      </button>
      <aside className="quran-sidebar surface" aria-label={c.surahs}>
        <strong>{c.surahs}</strong>
        <div className="quran-sidebar-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c.searchQuranPlaceholder}
            aria-label={searchLabel}
          />
        </div>
        {renderList()}
      </aside>
      <AccessibleOverlay
        open={open}
        id="quran-sidebar-panel"
        label={c.surahs}
        className="quran-sidebar-panel"
        returnFocusRef={triggerRef}
        onClose={close}
      >
        <button
          type="button"
          className="mobile-close"
          onClick={close}
          aria-label={c.close}
        >
          {c.close} ×
        </button>
        <div className="quran-sidebar-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={c.searchQuranPlaceholder}
            aria-label={searchLabel}
          />
        </div>
        {renderList()}
      </AccessibleOverlay>
    </>
  );
}
