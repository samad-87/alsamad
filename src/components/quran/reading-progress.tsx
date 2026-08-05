"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

export function ReadingProgress({
  locale,
  targetId,
}: {
  locale: Locale;
  targetId: string;
}) {
  const c = t(locale);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }
    function measure() {
      const rect = target!.getBoundingClientRect();
      const scrollable = Math.max(rect.height - window.innerHeight, 1);
      const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);
      setPercent(Math.round((scrolled / scrollable) * 100));
    }
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  return (
    <div className="reader-progress-row" aria-label={c.readingProgress}>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={c.readingProgress}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
      <small className="muted">{percent}%</small>
    </div>
  );
}
