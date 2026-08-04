import assert from "node:assert/strict";
import test from "node:test";

import { InvalidStateTransitionError } from "../../src/lib/quran/import/contracts.ts";
import {
  IMPORT_STATES,
  ImportStateMachine,
  isTerminalState,
  isTransitionAllowed,
} from "../../src/lib/quran/import/state-machine.ts";

const FIXED_CLOCK = () => new Date("2026-01-01T00:00:00.000Z");

test("no production activation state is defined", () => {
  for (const state of IMPORT_STATES) {
    assert.doesNotMatch(state, /activat|publish|^live$/i);
  }
});

test("valid transitions succeed and are recorded with a deterministic timestamp", () => {
  const machine = new ImportStateMachine("created", { now: FIXED_CLOCK });
  machine.transition("awaiting_source_approval", "source approved");
  assert.equal(machine.current(), "awaiting_source_approval");
  const history = machine.history();
  assert.equal(history.length, 1);
  assert.deepEqual(history[0], {
    from: "created",
    to: "awaiting_source_approval",
    at: "2026-01-01T00:00:00.000Z",
    reason: "source approved",
  });
});

test("invalid transitions are rejected and do not change state", () => {
  const machine = new ImportStateMachine("created", { now: FIXED_CLOCK });
  assert.throws(
    () => machine.transition("staged"),
    InvalidStateTransitionError,
  );
  assert.equal(machine.current(), "created");
  assert.equal(machine.history().length, 0);
});

test("terminal states reject every further transition", () => {
  const machine = new ImportStateMachine("blocked", { now: FIXED_CLOCK });
  machine.transition("superseded");
  assert.equal(isTerminalState("superseded"), true);
  assert.throws(() => machine.transition("blocked"));
  assert.throws(() => machine.transition("withdrawn"));
});

test("withdrawal is reachable from any non-terminal state", () => {
  assert.equal(isTransitionAllowed("fetching", "withdrawn"), true);
  assert.equal(isTransitionAllowed("reconciling", "withdrawn"), true);
  assert.equal(isTransitionAllowed("withdrawn", "withdrawn"), false);
});

test("full happy-path lifecycle to dry_run_passed and scholarly review", () => {
  const machine = new ImportStateMachine("created", { now: FIXED_CLOCK });
  for (const to of [
    "awaiting_source_approval",
    "awaiting_license_approval",
    "ready",
    "fetching",
    "quarantined",
    "validating",
    "normalized",
    "staged",
    "reconciling",
    "dry_run_passed",
    "awaiting_scholarly_approval",
  ]) {
    machine.transition(to);
  }
  assert.equal(machine.current(), "awaiting_scholarly_approval");
  assert.equal(machine.history().length, 11);
});
