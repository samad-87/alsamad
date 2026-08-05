"use client";

import { BookIcon, TargetIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useReaderSettings } from "@/lib/quran-reader-client";

export function ReadingModeSwitcher({ locale }: { locale: Locale }) {
  const c = t(locale);
  const [settings, update] = useReaderSettings();
  return (
    <div className="segmented" role="group" aria-label={c.viewModeContinuous}>
      <button
        type="button"
        aria-pressed={settings.viewMode === "continuous"}
        onClick={() => update({ viewMode: "continuous" })}
      >
        <BookIcon size={16} /> {c.viewModeContinuous}
      </button>
      <button
        type="button"
        aria-pressed={settings.viewMode === "focus"}
        onClick={() => update({ viewMode: "focus" })}
      >
        <TargetIcon size={16} /> {c.viewModeFocus}
      </button>
    </div>
  );
}
