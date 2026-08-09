/**
 * M5.2 idempotency and checkpointing.
 *
 * Pure in-memory domain logic only — no filesystem, no database, no network.
 * See ALSAMAD_DATABASE_ARCHITECTURE.md section 5.3.11 for the authoritative
 * idempotency contract.
 */
import { createHash } from "node:crypto";

import {
  CheckpointRegressionError,
  type ImportCheckpoint,
  type ImportRunKeyInput,
  UnknownImportRunError,
  ImportRunTerminalError,
} from "./contracts";
import { canonicalJson } from "./manifest";

/**
 * Deterministic import run key: SHA-256 of
 * (manifestId, manifestSchemaVersion, providerCode, providerSnapshotVersion,
 * resourceId, resourceVersion, adapterVersion).
 */
export function computeImportRunKey(input: ImportRunKeyInput): string {
  const canonical = canonicalJson({
    manifestId: input.manifestId,
    manifestSchemaVersion: input.manifestSchemaVersion,
    providerCode: input.providerCode,
    providerSnapshotVersion: input.providerSnapshotVersion,
    resourceId: input.resourceId,
    resourceVersion: input.resourceVersion,
    adapterVersion: input.adapterVersion,
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

interface RunRecord {
  latest: ImportCheckpoint;
  cancelledAt: string | null;
  supersededByRunKey: string | null;
  completed: boolean;
}

/**
 * Tracks the latest checkpoint per import run key. A changed
 * resource/version/checksum always produces a different run key and
 * therefore a brand-new, independent run record.
 */
export class InMemoryCheckpointStore {
  private readonly runs = new Map<string, RunRecord>();

  /**
   * Advances a run's checkpoint.
   * - First checkpoint for a run key is always accepted.
   * - Re-submitting the identical (sequence, rollingChecksum) pair is a
   *   retry-safe no-op that returns the already-stored checkpoint
   *   (duplicate suppression).
   * - A lower sequence, or the same sequence with a different checksum,
   *   is a regression and is rejected.
   */
  advance(checkpoint: ImportCheckpoint): ImportCheckpoint {
    const existing = this.runs.get(checkpoint.runKey);
    if (!existing) {
      this.runs.set(checkpoint.runKey, {
        latest: checkpoint,
        cancelledAt: null,
        supersededByRunKey: null,
        completed:
          checkpoint.status === "dry_run_passed" ||
          checkpoint.status === "dry_run_failed",
      });
      return checkpoint;
    }

    const { latest } = existing;
    if (checkpoint.sequence === latest.sequence) {
      if (canonicalJson(checkpoint) === canonicalJson(latest)) {
        return latest;
      }
      throw new CheckpointRegressionError(checkpoint.runKey);
    }
    if (existing.cancelledAt)
      throw new ImportRunTerminalError(checkpoint.runKey, "cancelled");
    if (existing.supersededByRunKey)
      throw new ImportRunTerminalError(checkpoint.runKey, "superseded");
    if (existing.completed)
      throw new ImportRunTerminalError(checkpoint.runKey, "completed");
    if (
      checkpoint.manifestChecksum !== latest.manifestChecksum ||
      checkpoint.attemptId !== latest.attemptId
    ) {
      throw new CheckpointRegressionError(checkpoint.runKey);
    }
    if (
      checkpoint.byteCount < latest.byteCount ||
      checkpoint.rowCount < latest.rowCount
    ) {
      throw new CheckpointRegressionError(checkpoint.runKey);
    }
    if (checkpoint.sequence < latest.sequence) {
      throw new CheckpointRegressionError(checkpoint.runKey);
    }

    existing.latest = checkpoint;
    existing.completed =
      checkpoint.status === "dry_run_passed" ||
      checkpoint.status === "dry_run_failed";
    return checkpoint;
  }

  /** The last checkpoint-verified resume point for a run, if any. */
  latest(runKey: string): ImportCheckpoint | null {
    return this.runs.get(runKey)?.latest ?? null;
  }

  markCancelled(runKey: string, atIso: string): void {
    const existing = this.runs.get(runKey);
    if (!existing) {
      throw new UnknownImportRunError(runKey);
    }
    existing.cancelledAt = atIso;
  }

  isCancelled(runKey: string): boolean {
    return this.runs.get(runKey)?.cancelledAt != null;
  }

  /** Marks an older run key as replaced by a newer manifest's run key. */
  markSuperseded(oldRunKey: string, newRunKey: string): void {
    const existing = this.runs.get(oldRunKey);
    if (!existing) {
      throw new UnknownImportRunError(oldRunKey);
    }
    existing.supersededByRunKey = newRunKey;
  }

  isSuperseded(runKey: string): boolean {
    return this.runs.get(runKey)?.supersededByRunKey != null;
  }

  /** A run is stale once its latest checkpoint is older than the timeout. */
  isStale(runKey: string, nowIso: string, timeoutMs: number): boolean {
    const latest = this.latest(runKey);
    if (!latest) {
      return false;
    }
    const elapsedMs = Date.parse(nowIso) - Date.parse(latest.recordedAt);
    return elapsedMs > timeoutMs;
  }
}
