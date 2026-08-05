"use client";

import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useReaderSettings } from "@/lib/quran-reader-client";

export function TranslationToggle({ locale }: { locale: Locale }) {
  const c = t(locale);
  const [settings, update] = useReaderSettings();
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={settings.showTranslation}
      onClick={() => update({ showTranslation: !settings.showTranslation })}
    >
      {c.translation}
    </button>
  );
}
