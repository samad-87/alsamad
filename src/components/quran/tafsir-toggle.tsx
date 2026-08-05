"use client";

import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import { useReaderSettings } from "@/lib/quran-reader-client";

export function TafsirToggle({ locale }: { locale: Locale }) {
  const c = t(locale);
  const [settings, update] = useReaderSettings();
  return (
    <button
      type="button"
      className="chip"
      aria-pressed={settings.showTafsir}
      onClick={() => update({ showTafsir: !settings.showTafsir })}
    >
      {c.tafsir}
    </button>
  );
}
