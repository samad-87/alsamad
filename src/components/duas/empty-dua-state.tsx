import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export type EmptyDuaStateKind = "no-content" | "pending-review";

export function EmptyDuaState({
  locale,
  kind,
}: {
  locale: Locale;
  kind: EmptyDuaStateKind;
}) {
  const c = t(locale);
  const copy: Record<
    EmptyDuaStateKind,
    { icon: string; title: string; body: string }
  > = {
    "no-content": {
      icon: "◌",
      title: c.duaStatusEmpty,
      body: c.duaStatusEmptyBody,
    },
    "pending-review": {
      icon: "◐",
      title: c.duaStatusPending,
      body: c.duaStatusPendingBody,
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
