import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type EmptyAdhkarStateKind = "no-content" | "pending-review";

export function EmptyAdhkarState({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EmptyAdhkarStateKind;
}) {
  const c = t(locale);
  const copy: Record<
    EmptyAdhkarStateKind,
    { icon: string; title: string; body: string }
  > = {
    "no-content": {
      icon: "◌",
      title: c.adhkarStatusEmpty,
      body: c.adhkarStatusEmptyBody,
    },
    "pending-review": {
      icon: "◐",
      title: c.adhkarStatusPending,
      body: c.adhkarStatusPendingBody,
    },
  };
  const entry = copy[kind];
  return (
    <div className="empty-state surface">
      <span aria-hidden="true">{entry.icon}</span>
      <strong>{entry.title}</strong>
      <p className="muted">{entry.body}</p>
    </div>
  );
}
