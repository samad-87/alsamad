"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type { VerseSlot } from "@/lib/quran/content/reader-data";
import {
  useBookmarks,
  useLastRead,
  useReaderSettings,
} from "@/lib/quran-reader-client";
import { VersePlaceholder } from "./verse-placeholder";

const FONT_SCALE_VALUE: Record<string, number> = {
  sm: 0.85,
  md: 1,
  lg: 1.15,
  xl: 1.35,
};
const WIDTH_VALUE: Record<string, string> = {
  narrow: "38rem",
  comfortable: "47rem",
  wide: "58rem",
};
const LINE_HEIGHT_VALUE: Record<string, number> = {
  compact: 1.6,
  comfortable: 2.05,
  relaxed: 2.5,
};

export function VerseContainer({
  locale,
  slots,
  containerId,
}: {
  locale: Locale;
  slots: readonly VerseSlot[];
  containerId: string;
}) {
  const c = t(locale);
  const [settings] = useReaderSettings();
  const { toggle } = useBookmarks();
  const { lastRead, setLastRead } = useLastRead();
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (settings.viewMode === "focus") {
      const current = slots[focusIndex];
      if (current && current.reference !== lastRead) {
        setLastRead(current.reference);
      }
      return;
    }

    const elements = slots
      .map((slot) => document.getElementById(slot.elementId))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!mostVisible) {
          return;
        }
        const slot = slots.find(
          (candidate) => candidate.elementId === mostVisible.target.id,
        );
        if (slot && slot.reference !== lastRead) {
          setLastRead(slot.reference);
        }
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [settings.viewMode, focusIndex, slots, lastRead, setLastRead]);

  useEffect(() => {
    if (settings.viewMode !== "focus") {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (isEditable) {
        return;
      }
      if (event.key === "ArrowDown" || event.key === "j") {
        event.preventDefault();
        setFocusIndex((index) => Math.min(index + 1, slots.length - 1));
      } else if (event.key === "ArrowUp" || event.key === "k") {
        event.preventDefault();
        setFocusIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "b") {
        const current = slots[focusIndex];
        if (current) {
          toggle(current.reference);
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [settings.viewMode, slots, focusIndex, toggle]);

  const scopeStyle = {
    "--reader-font-scale": FONT_SCALE_VALUE[settings.fontScale],
    "--reader-max-width": WIDTH_VALUE[settings.width],
    "--reader-line-height": LINE_HEIGHT_VALUE[settings.lineSpacing],
  } as React.CSSProperties;

  if (settings.viewMode === "focus") {
    const current = slots[focusIndex];
    if (!current) {
      return null;
    }
    return (
      <div className="verse-reader-scope" style={scopeStyle} id={containerId}>
        <VersePlaceholder
          locale={locale}
          reference={current.reference}
          ayahNumber={current.ayahNumber}
          elementId={current.elementId}
          showTranslation={settings.showTranslation}
          showTafsir={settings.showTafsir}
        />
        <div className="focus-nav">
          <button
            type="button"
            className="button"
            disabled={focusIndex === 0}
            onClick={() => setFocusIndex((index) => Math.max(index - 1, 0))}
          >
            {c.previous}
          </button>
          <span className="muted">
            {focusIndex + 1} / {slots.length}
          </span>
          <button
            type="button"
            className="button button-primary"
            disabled={focusIndex === slots.length - 1}
            onClick={() =>
              setFocusIndex((index) => Math.min(index + 1, slots.length - 1))
            }
          >
            {c.next}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="verse-reader-scope reader-list"
      style={scopeStyle}
      id={containerId}
    >
      {slots.map((slot) => (
        <VersePlaceholder
          key={slot.reference}
          locale={locale}
          reference={slot.reference}
          ayahNumber={slot.ayahNumber}
          elementId={slot.elementId}
          showTranslation={settings.showTranslation}
          showTafsir={settings.showTafsir}
        />
      ))}
    </div>
  );
}
