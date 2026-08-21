"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { DuaContentStatus, DuaItem } from "@/lib/duas/content/types";
import { DuaBookmarkButton } from "./bookmark-button";
import { EditorialDisclosure } from "./editorial-disclosure";
import { EmptyDuaState } from "./empty-dua-state";
import { DuaSharePlaceholder } from "./share-placeholder";
import { SourceTrustPanel } from "./source-trust-panel";

/**
 * Reusable Dua collection reader. When no content exists for the
 * category (the honest default today), it renders a calm empty or
 * pending state instead of placeholder religious text. Once items exist,
 * it renders them one at a time with large Arabic typography and,
 * depending on each item's `kind`, either the mandatory editorial
 * disclosure or the authentic source/trust panel — the two are never
 * merged or made to look alike. No audio, no repetition counter, no fake
 * completion statistics.
 */
export function DuaCollectionReader({
  locale,
  status,
  items,
}: {
  locale: Locale;
  status: DuaContentStatus;
  items: readonly DuaItem[];
}) {
  const c = t(locale);
  const [index, setIndex] = useState(0);

  if (status !== "available" || items.length === 0) {
    return (
      <EmptyDuaState
        locale={locale}
        kind={status === "pending" ? "pending-review" : "no-content"}
      />
    );
  }

  const current = items[Math.min(index, items.length - 1)];
  const isLast = index === items.length - 1;
  const isEditorial = current.kind === "editorial";

  return (
    <div className="dua-collection">
      <div className="reader-toolbar">
        <span dir="ltr">
          {current.order} / {items.length}
        </span>
        <div className="progress-track">
          <span style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
      </div>
      <article className="religious-card surface fade-in">
        <div className="verse-card-actions">
          <span className="chip status-chip">
            {isEditorial
              ? `◆ ${c.duaEditorialBadge}`
              : `◆ ${c.duaAuthenticBadge}`}
          </span>
          <DuaBookmarkButton locale={locale} itemId={current.id} />
        </div>
        <h2 className="title" lang="ar" dir="rtl">
          {current.title}
        </h2>
        <p className="arabic-reading" lang="ar" dir="rtl">
          {current.arabicText}
        </p>
        {current.transliteration && (
          <p className="muted" lang="en" dir="ltr">
            {current.transliteration}
          </p>
        )}
        {current.translation && (
          <p lang="en" dir="ltr">
            {current.translation}
          </p>
        )}
        <div className="action-row">
          <DuaSharePlaceholder locale={locale} />
        </div>
        <hr />
        {isEditorial ? (
          <EditorialDisclosure locale={locale} />
        ) : (
          <SourceTrustPanel
            locale={locale}
            status={status}
            source={current.source}
          />
        )}
      </article>
      <div className="counter-row">
        <button
          type="button"
          className="button"
          disabled={index === 0}
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
        >
          {c.previous}
        </button>
        <span
          className="muted"
          dir="ltr"
          style={{ textAlign: "center", display: "inline-block" }}
        >
          {current.order} / {items.length}
        </span>
        <button
          type="button"
          className="button button-primary"
          disabled={isLast}
          onClick={() =>
            setIndex((value) => Math.min(items.length - 1, value + 1))
          }
        >
          {isLast ? c.complete : c.next}
        </button>
      </div>
    </div>
  );
}
