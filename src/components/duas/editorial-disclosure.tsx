import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

/**
 * Mandatory, unconditional editorial disclosure. Every editorial dua must
 * always display these four things — this component never hides or
 * shortens any of them, and it never renders for an authentic item. This
 * is what keeps editorial duas from ever appearing identical to
 * authentic ones.
 */
export function EditorialDisclosure({ locale }: { locale: Locale }) {
  const c = t(locale);
  return (
    <aside className="editorial-note surface dua-editorial-disclosure">
      <span className="chip status-chip">◆ {c.duaEditorialBadge}</span>
      <p>{c.duaEditorialExplanation}</p>
      <p className="muted">{c.duaNotFromQuranSunnah}</p>
      <p className="muted">{c.duaAlsamadAttribution}</p>
    </aside>
  );
}
