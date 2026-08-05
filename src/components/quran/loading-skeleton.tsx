export function LoadingSkeleton({
  rows = 3,
  "aria-label": ariaLabel = "Loading",
}: {
  rows?: number;
  "aria-label"?: string;
}) {
  return (
    <div
      className="reader-list"
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {Array.from({ length: rows }, (_, index) => (
        <div className="verse-card surface" key={index}>
          <div className="verse-card-skeleton">
            <span className="verse-card-skeleton-line" />
            <span className="verse-card-skeleton-line" />
            <span className="verse-card-skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
