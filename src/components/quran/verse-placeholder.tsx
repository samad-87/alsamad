import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { PLACEHOLDER_NOTICE } from "@/lib/quran-reader-mock";
import { BookmarkButton } from "./bookmark-button";
import { ReferenceBadge } from "./reference-badge";

export function VersePlaceholder({
  locale,
  reference,
  ayahNumber,
  elementId,
  showTranslation,
  showTafsir,
}: {
  locale: Locale;
  reference: string;
  ayahNumber: number;
  elementId: string;
  showTranslation: boolean;
  showTafsir: boolean;
}) {
  const c = t(locale);
  return (
    <article className="verse-card fade-in" id={elementId} tabIndex={-1}>
      <div className="verse-marker">{ayahNumber}</div>
      <div className="verse-card-actions">
        <ReferenceBadge reference={reference} label={c.reference} />
        <BookmarkButton locale={locale} reference={reference} />
      </div>
      <div className="verse-card-skeleton" aria-hidden="true">
        <span className="verse-card-skeleton-line" />
        <span className="verse-card-skeleton-line" />
        <span className="verse-card-skeleton-line" />
      </div>
      <p className="muted">{PLACEHOLDER_NOTICE}</p>
      <div className="verse-panel-toggles">
        <span className="chip">{c.translation}</span>
        <span className="chip">{c.tafsir}</span>
        <span className="chip">{c.audio}</span>
        <span className="chip">{c.wordByWord}</span>
      </div>
      {showTranslation && (
        <div className="verse-panel">
          <strong>{c.translation}:</strong> {PLACEHOLDER_NOTICE}
        </div>
      )}
      {showTafsir && (
        <div className="verse-panel">
          <strong>{c.tafsir}:</strong> {PLACEHOLDER_NOTICE}
        </div>
      )}
    </article>
  );
}
