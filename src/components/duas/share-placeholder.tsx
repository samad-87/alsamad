import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

/**
 * Disabled share affordance — no real sharing capability exists yet.
 * Mirrors the existing "X later" disabled-chip convention already used
 * for audio (see the Quran reader's translation/tafsir/audio toggles).
 */
export function DuaSharePlaceholder({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <button type="button" className="button" disabled title={c.duaShareLater}>
      {c.duaShareLater}
    </button>
  );
}
