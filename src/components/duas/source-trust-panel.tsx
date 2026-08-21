import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type {
  DuaContentStatus,
  DuaSourceMetadata,
} from "@/lib/duas/content/types";

/**
 * Source/status area and authenticity badge for an authentic dua. Never
 * rendered for editorial items (see EditorialDisclosure). When no
 * verified source exists (the honest default today), it shows a calm
 * status badge and message instead of an empty or fabricated metadata
 * table.
 */
export function SourceTrustPanel({
  locale,
  status,
  source,
}: {
  locale: Locale;
  status: DuaContentStatus;
  source: DuaSourceMetadata | null;
}) {
  const c = t(locale);

  if (status !== "available" || !source) {
    const badge =
      status === "pending"
        ? { icon: "◐", label: c.duaBadgePending }
        : { icon: "◌", label: c.duaBadgeNotVerified };
    return (
      <div className="source-row dua-source-status">
        <span className="chip">
          {badge.icon} {badge.label}
        </span>
        <span className="muted">
          {status === "pending" ? c.duaStatusPendingBody : c.duaStatusEmptyBody}
        </span>
      </div>
    );
  }

  // Authenticity is the item's own truth, drawn from `source.authenticity`
  // — never inferred from the category's availability status. An
  // "available" category can still contain an item whose source has not
  // been verified, and the badge must say so honestly rather than risk
  // contradicting the detail table below, which renders that same value.
  const badge =
    source.authenticity === "verified"
      ? { icon: "✓", label: c.duaBadgeVerified }
      : { icon: "◌", label: c.duaBadgeNotVerified };

  const fields: readonly [string, string | null][] = [
    [c.duaSourceType, source.sourceType],
    [c.duaSourceTitle, source.sourceTitle],
    [c.duaCollection, source.collection],
    [c.duaReference, source.reference],
    [c.duaAuthenticity, source.authenticity],
    [c.duaReviewer, source.reviewer],
    [c.duaAttribution, source.attribution],
    [c.duaNotes, source.notes],
    [c.duaVerificationDate, source.verificationDate],
  ];
  const populated = fields.filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  return (
    <div className="dua-source-panel surface">
      <span className="chip">
        {badge.icon} {badge.label}
      </span>
      {populated.length > 0 && (
        <dl className="grid-2 dua-source-fields">
          {populated.map(([label, value]) => (
            <div key={label}>
              <dt className="eyebrow">{label}</dt>
              <dd className="muted">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
