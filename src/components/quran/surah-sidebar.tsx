"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ClockIcon, MenuIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useLastRead } from "@/lib/quran-reader-client";
import { mockSurahs } from "@/lib/quran-reader-mock";

export function SurahSidebar({
  locale,
  variant = "sidebar",
}: {
  locale: Locale;
  variant?: "sidebar" | "index";
}) {
  const c = t(locale);
  const pathname = usePathname();
  const { lastRead } = useLastRead();
  const lastReadSurahNumber = lastRead ? Number(lastRead.split(":")[0]) : null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return mockSurahs;
    }
    return mockSurahs.filter((surah) => String(surah.number).includes(trimmed));
  }, [query]);

  const searchLabel =
    variant === "index" ? c.search : `${c.search} — ${c.surahs}`;

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
                      {isLastRead ? c.lastRead : c.placeholderNoticeShort}
                    </span>
                  </div>
                  <small>
                    {surah.mockAyahCount} {locale === "ar" ? "آية" : "verses"}
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
                  {surah.mockAyahCount}
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
      {open && (
        <div id="quran-sidebar-panel" className="quran-sidebar-panel">
          <button
            type="button"
            className="mobile-close"
            onClick={() => setOpen(false)}
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
        </div>
      )}
    </>
  );
}
