"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";
import {
  createRepetitionState,
  incrementRepetition,
  isRepetitionComplete,
  repetitionPercent,
  resetRepetition,
} from "@/lib/adhkar/repetition-logic";

/**
 * Standalone repetition-count interaction: increment, reset, a clear
 * current/target display, and a progress bar. Local component state only
 * — no persistence, no account dependency, no vibration, and no claim
 * that reaching the target completes or is accepted as a religious act.
 */
export function RepetitionCounter({
  locale,
  target,
}: {
  locale: Locale;
  target: number;
}) {
  const c = t(locale);
  const [state, setState] = useState(() => createRepetitionState(target));
  const complete = isRepetitionComplete(state);

  return (
    <div className="repetition-counter">
      <div className="progress-track" aria-hidden="true">
        <span style={{ width: `${repetitionPercent(state)}%` }} />
      </div>
      <div className="repetition-controls">
        <button
          type="button"
          className="button"
          onClick={() => setState((prev) => resetRepetition(prev))}
        >
          {c.reset}
        </button>
        <button
          type="button"
          className="rep-button"
          disabled={complete}
          onClick={() => setState((prev) => incrementRepetition(prev))}
          aria-label={`${c.adhkarIncrementAria}. ${state.current} ${c.adhkarOf} ${state.target}`}
        >
          <strong aria-live="polite">
            {state.current} / {state.target}
          </strong>
          <span>{c.count}</span>
        </button>
      </div>
    </div>
  );
}
