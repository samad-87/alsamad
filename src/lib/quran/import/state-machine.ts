/**
 * M5.2 import state machine.
 *
 * Exactly the 17 states recorded in ALSAMAD_IMPLEMENTATION_ROADMAP.md's
 * M5.2 import state machine. No production activation state is defined or
 * reachable here.
 */
import {
  type ImportState,
  type StateTransitionRecord,
  InvalidStateTransitionError,
} from "./contracts";

const TERMINAL_STATES: ReadonlySet<ImportState> = new Set([
  "withdrawn",
  "deleted",
  "expired",
  "superseded",
]);

/**
 * Explicit forward transitions. Withdrawal is layered on top separately
 * because a provider or rights withdrawal signal can arrive from any
 * non-terminal state.
 */
const ALLOWED_TRANSITIONS: Readonly<
  Record<ImportState, readonly ImportState[]>
> = {
  created: ["awaiting_source_approval", "blocked"],
  awaiting_source_approval: ["awaiting_license_approval", "blocked"],
  awaiting_license_approval: ["ready", "blocked"],
  ready: ["fetching", "blocked"],
  fetching: ["quarantined", "blocked"],
  quarantined: ["validating", "blocked", "expired", "deleted"],
  validating: ["normalized", "blocked"],
  normalized: ["staged", "blocked"],
  staged: ["reconciling", "blocked"],
  reconciling: ["dry_run_passed", "dry_run_failed"],
  dry_run_passed: ["awaiting_scholarly_approval", "superseded", "expired"],
  dry_run_failed: ["blocked", "superseded"],
  awaiting_scholarly_approval: ["blocked", "superseded", "expired"],
  blocked: ["superseded"],
  withdrawn: [],
  deleted: [],
  expired: [],
  superseded: [],
};

export const IMPORT_STATES: readonly ImportState[] = Object.keys(
  ALLOWED_TRANSITIONS,
) as ImportState[];

/** No state in this machine may ever equal a production activation label. */
const PROHIBITED_PRODUCTION_STATES: ReadonlySet<string> = new Set([
  "activated",
  "published",
  "publishing",
  "production_active",
  "live",
]);

for (const state of IMPORT_STATES) {
  if (PROHIBITED_PRODUCTION_STATES.has(state)) {
    throw new Error(
      `M5.2 state machine must never define a production activation state ("${state}")`,
    );
  }
}

export function isTerminalState(state: ImportState): boolean {
  return TERMINAL_STATES.has(state);
}

export function isTransitionAllowed(
  from: ImportState,
  to: ImportState,
): boolean {
  if (TERMINAL_STATES.has(from)) {
    return false;
  }
  if (to === "withdrawn") {
    return true;
  }
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export interface ImportStateMachineOptions {
  readonly now?: () => Date;
}

/**
 * Guards transitions, enforces terminal states, and keeps an in-memory
 * transition history. The clock is injectable so tests can assert exact
 * timestamps deterministically.
 */
export class ImportStateMachine {
  private state: ImportState;
  private readonly clock: () => Date;
  private readonly transitions: StateTransitionRecord[] = [];

  constructor(
    initialState: ImportState = "created",
    options: ImportStateMachineOptions = {},
  ) {
    this.state = initialState;
    this.clock = options.now ?? (() => new Date());
  }

  current(): ImportState {
    return this.state;
  }

  history(): readonly StateTransitionRecord[] {
    return this.transitions.slice();
  }

  transition(to: ImportState, reason: string | null = null): ImportState {
    const from = this.state;
    if (!isTransitionAllowed(from, to)) {
      throw new InvalidStateTransitionError(from, to);
    }
    this.state = to;
    this.transitions.push({
      from,
      to,
      at: this.clock().toISOString(),
      reason,
    });
    return this.state;
  }
}
