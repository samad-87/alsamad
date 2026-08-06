"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { CategoryReaderData } from "@/lib/adhkar/content/reader-data";
import {
  searchAdhkarIndex,
  type AdhkarSearchableEntry,
} from "@/lib/adhkar/content/search";
import { AdhkarCategoryCard } from "./category-card";

/**
 * Mobile-first Adhkar category grid with a lightweight search filter over
 * category labels. This is not the Knowledge Engine — it only ever
 * searches the real, structural category taxonomy plus their honest
 * status; it never indexes invented religious text.
 */
export function AdhkarCategoryExplorer({
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

  const entries: readonly AdhkarSearchableEntry[] = categories.map(
    (category) => ({
      categoryId: category.id,
      label: labels[category.id] ?? category.id,
      routeSlug: category.routeSlug,
      status: category.status,
    }),
  );

  const trimmed = query.trim();
  const visible = trimmed ? searchAdhkarIndex(entries, trimmed) : entries;
  const byId = new Map(categories.map((category) => [category.id, category]));

  return (
    <div>
      <label className="search-field">
        <span className="sr-only">{c.adhkarSearchPlaceholder}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={c.adhkarSearchPlaceholder}
        />
      </label>
      <div className="grid-3 adhkar-category-grid">
        {visible.length === 0 ? (
          <p className="muted">{c.searchNoResults}</p>
        ) : (
          visible.map((entry) => {
            const category = byId.get(entry.categoryId);
            if (!category) {
              return null;
            }
            return (
              <AdhkarCategoryCard
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
