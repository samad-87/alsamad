"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type {
  AdhkarContentStatus,
  AdhkarItem,
} from "@/lib/adhkar/content/types";
import { AdhkarBookmarkButton } from "./bookmark-button";
import { EmptyAdhkarState } from "./empty-adhkar-state";
import { RepetitionCounter } from "./repetition-counter";
import { SourceTrustPanel } from "./source-trust-panel";

/**
 * Reusable Adhkar collection reader. When no verified item exists for the
 * category (the honest default today), it renders a calm empty or pending
 * state instead of placeholder religious text. Once verified items exist,
 * it renders them one at a time with large Arabic typography, a
 * source/trust panel, a repetition counter, and bookmark UI — no
 * completion statistics, no streaks, no gamification.
 */
export function AdhkarCollectionReader({
  locale,
  status,
  items,
}: {
  locale: Locale;
  status: AdhkarContentStatus;
  items: readonly AdhkarItem[];
}) {
  const c = t(locale);
  const [index, setIndex] = useState(0);

  if (status !== "available" || items.length === 0) {
    return (
      <EmptyAdhkarState
        locale={locale}
        kind={status === "pending" ? "pending-review" : "no-content"}
      />
    );
  }

  const current = items[Math.min(index, items.length - 1)];
  const isLast = index === items.length - 1;

  return (
    <div className="adhkar-collection">
      <div className="reader-toolbar">
        <span>
          {index + 1} / {items.length}
        </span>
        <div className="progress-track">
          <span style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
      </div>
      <article className="religious-card surface fade-in">
        <div className="item-number">{current.order}</div>
        <div className="verse-card-actions">
          <AdhkarBookmarkButton locale={locale} itemId={current.id} />
        </div>
        <p className="arabic-reading" lang="ar" dir="rtl">
          {current.arabicText}
        </p>
        {current.transliteration && (
          <p className="muted">{current.transliteration}</p>
        )}
        {current.translation && <p>{current.translation}</p>}
        <hr />
        <SourceTrustPanel
          locale={locale}
          status={status}
          source={current.source}
        />
        <RepetitionCounter
          key={current.id}
          locale={locale}
          target={current.repeatCount}
        />
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
        <span className="muted" style={{ textAlign: "center" }}>
          {current.order} {c.adhkarOf} {items.length}
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
