"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { CategoryReaderData } from "@/lib/duas/content/reader-data";
import {
  searchDuaIndex,
  type DuaSearchableEntry,
} from "@/lib/duas/content/search";
import { DuaCategoryCard } from "./category-card";

/**
 * Mobile-first Dua category grid with a lightweight search filter over
 * category labels. This is not the Knowledge Engine — it only ever
 * searches the real, structural category taxonomy plus their honest
 * status; it never indexes invented dua text.
 */
export function DuaCategoryExplorer({
  locale,
  categories,
  labels,
}: {
  locale: Locale;
  categories: readonly CategoryReaderData[];
  labels: Readonly<Record<string, string>>;
}) {
  const c = t(locale);
  const [query, setQuery] = useState("");

  const entries: readonly DuaSearchableEntry[] = categories.map((category) => ({
    categoryId: category.id,
    label: labels[category.id] ?? category.id,
    routeSlug: category.routeSlug,
    status: category.status,
  }));

  const trimmed = query.trim();
  const visible = trimmed ? searchDuaIndex(entries, trimmed) : entries;
  const byId = new Map(categories.map((category) => [category.id, category]));

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">{c.duaSearchPlaceholder}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={c.duaSearchPlaceholder}
        />
      </label>
      <div className="grid-3 dua-category-grid">
        {visible.length === 0 ? (
          <p className="muted">{c.searchNoResults}</p>
        ) : (
          visible.map((entry) => {
            const category = byId.get(entry.categoryId);
            if (!category) {
              return null;
            }
            return (
              <DuaCategoryCard
                key={entry.categoryId}
                locale={locale}
                label={entry.label}
                data={category}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
