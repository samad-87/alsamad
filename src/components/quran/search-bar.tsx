"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { SurahReaderData } from "@/lib/quran/content/reader-data";
import { searchSurahIndex } from "@/lib/quran/content/search";
import { EmptyReaderState } from "./empty-reader-state";
import { SearchResultCard } from "./search-result-card";

export function SearchBar({
  locale,
  basePath,
  surahs,
}: {
  locale: Locale;
  basePath: string;
  surahs: readonly SurahReaderData[];
}) {
  const c = t(locale);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (event.key === "/" && !isEditable) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const trimmed = query.trim();
  const results = searchSurahIndex(surahs, trimmed);

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">{c.search}</span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={c.searchQuranPlaceholder}
        />
      </label>
      <p className="keyboard-hint">
        <kbd>/</kbd> {c.searchShortcutHint}
      </p>
      {trimmed && (
        <div className="search-results" aria-live="polite">
          {results.length === 0 ? (
            <EmptyReaderState locale={locale} kind="no-search-results" />
          ) : (
            <>
              <p className="muted">
                {results.length} {c.searchResultsCount}
              </p>
              {results.map((hit) => (
                <SearchResultCard
                  key={hit.hrefSuffix}
                  locale={locale}
                  hit={hit}
                  basePath={basePath}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
