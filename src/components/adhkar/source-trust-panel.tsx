import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import type {
  AdhkarContentStatus,
  AdhkarSourceMetadata,
} from "@/lib/adhkar/content/types";

/**
 * Renders the source/status area and verification badge required for
 * every Adhkar item. When no verified source exists (the honest default
 * today), it shows a calm status badge and message instead of an empty or
 * fabricated metadata table.
 */
export function SourceTrustPanel({
  locale,
  status,
  source,
}: {
  locale: Locale;
  status: AdhkarContentStatus;
  source: AdhkarSourceMetadata | null;
}) {
  const c = t(locale);
  const badge =
    status === "available"
      ? { icon: "✓", label: c.adhkarBadgeVerified }
      : status === "pending"
        ? { icon: "◐", label: c.adhkarBadgePending }
        : { icon: "◌", label: c.adhkarBadgeNotVerified };

  if (status !== "available" || !source) {
    return (
      <div className="source-row adhkar-source-status">
        <span className="chip">
          {badge.icon} {badge.label}
        </span>
        <span className="muted">
          {status === "pending"
            ? c.adhkarStatusPendingBody
            : c.adhkarStatusEmptyBody}
        </span>
      </div>
    );
  }

  const fields: readonly [string, string | null][] = [
    [c.adhkarSourceType, source.sourceType],
    [c.adhkarSourceTitle, source.sourceTitle],
    [c.adhkarCollection, source.collection],
    [c.adhkarReferenceLocator, source.referenceLocator],
    [c.adhkarGradingStatus, source.gradingStatus],
    [c.adhkarReviewerStatus, source.reviewerStatus],
    [c.adhkarAttribution, source.attribution],
    [c.adhkarNotes, source.notes],
    [c.adhkarVerificationDate, source.verificationDate],
  ];
  const populated = fields.filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );

  return (
    <div className="adhkar-source-panel surface">
      <span className="chip">
        {badge.icon} {badge.label}
      </span>
      {populated.length > 0 && (
        <dl className="grid-2 adhkar-source-fields">
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
