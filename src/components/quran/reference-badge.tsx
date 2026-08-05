export function ReferenceBadge({
  reference,
  label,
}: {
  reference: string;
  label?: string;
}) {
  return (
    <span className="reference-badge" title={label}>
      {reference}
    </span>
  );
}
