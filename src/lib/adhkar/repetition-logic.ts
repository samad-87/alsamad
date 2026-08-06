/**
 * Pure repetition-count state transitions. No I/O, no persistence — used
 * directly by RepetitionCounter and exercised by tests with synthetic
 * numeric fixtures only.
 */

export interface RepetitionState {
  readonly current: number;
  readonly target: number;
}

export function createRepetitionState(target: number): RepetitionState {
  return { current: 0, target: Math.max(1, Math.floor(target)) };
}

/** Never exceeds the target — the display always reads a bounded "current / target". */
export function incrementRepetition(state: RepetitionState): RepetitionState {
  return { ...state, current: Math.min(state.current + 1, state.target) };
}

export function resetRepetition(state: RepetitionState): RepetitionState {
  return { ...state, current: 0 };
}

export function isRepetitionComplete(state: RepetitionState): boolean {
  return state.current >= state.target;
}

export function repetitionPercent(state: RepetitionState): number {
  if (state.target <= 0) {
    return 0;
  }
  return Math.round((state.current / state.target) * 100);
}
