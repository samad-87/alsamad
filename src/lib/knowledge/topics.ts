import { validate as validateUuid, version as uuidVersion } from "uuid";

export const TOPIC_STATUSES = ["draft", "approved", "retired"] as const;

export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export type TopicLocalizedNames = Readonly<Record<string, string>>;

export interface TopicRecord {
  readonly id: string;
  readonly canonicalKey: string;
  readonly localizedNames: TopicLocalizedNames;
  readonly status: TopicStatus;
  readonly createdBy: string;
  readonly approvedBy: string | null;
  readonly approvedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type TopicErrorCode =
  | "validation"
  | "not_found"
  | "invalid_transition"
  | "canonical_key_conflict"
  | "inactive_editorial_actor"
  | "database_invariant";

export class TopicError extends Error {
  readonly code: TopicErrorCode;
  override readonly cause?: unknown;

  constructor(code: TopicErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "TopicError";
    this.code = code;
    this.cause = cause;
  }
}

export interface TopicDatabaseRow {
  readonly id: string;
  readonly canonical_key: string;
  readonly localized_names: unknown;
  readonly status: string;
  readonly created_by: string;
  readonly approved_by: string | null;
  readonly approved_at: Date | string | null;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
}

const UUID_V7_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireUuidV7(value: string, field: string): string {
  if (
    !validateUuid(value) ||
    uuidVersion(value) !== 7 ||
    !UUID_V7_PATTERN.test(value)
  ) {
    throw new TopicError("validation", `${field} must be a UUIDv7 identifier`);
  }
  return value;
}

export function requireCanonicalKey(value: string): string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 160 ||
    value.trim().length === 0 ||
    value !== value.toLowerCase()
  ) {
    throw new TopicError(
      "validation",
      "canonicalKey must be non-blank, lowercase, and at most 160 characters",
    );
  }
  return value;
}

export function requireLocalizedNames(
  value: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  if (value === null || Array.isArray(value) || typeof value !== "object") {
    throw new TopicError(
      "validation",
      "localizedNames must be a locale-to-name object",
    );
  }
  const entries = Object.entries(value);
  if (entries.length === 0) {
    throw new TopicError("validation", "localizedNames must not be empty");
  }
  for (const [locale, name] of entries) {
    if (!locale.trim() || typeof name !== "string" || !name.trim()) {
      throw new TopicError(
        "validation",
        "localizedNames must map non-blank locale codes to non-blank names",
      );
    }
  }
  return Object.freeze(Object.fromEntries(entries));
}

export function localizedNamesEqual(
  left: Readonly<Record<string, string>>,
  right: Readonly<Record<string, string>>,
): boolean {
  const leftKeys = Object.keys(left).sort();
  const rightKeys = Object.keys(right).sort();
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every(
      (key, index) =>
        key === rightKeys[index] && left[key] === right[rightKeys[index]],
    )
  );
}

function requireDate(value: Date | string, field: string): Date {
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new TopicError("database_invariant", `${field} is not a valid date`);
  }
  return date;
}

export function toTopicRecord(row: TopicDatabaseRow): TopicRecord {
  if (!TOPIC_STATUSES.includes(row.status as TopicStatus)) {
    throw new TopicError("database_invariant", "topic status is not governed");
  }
  if (
    row.localized_names === null ||
    Array.isArray(row.localized_names) ||
    typeof row.localized_names !== "object"
  ) {
    throw new TopicError(
      "database_invariant",
      "topic localized_names is not an object",
    );
  }

  let localizedNames: Readonly<Record<string, string>>;
  try {
    localizedNames = requireLocalizedNames(
      row.localized_names as Record<string, string>,
    );
  } catch (error) {
    throw new TopicError(
      "database_invariant",
      "topic localized_names violates its governed shape",
      error,
    );
  }
  const approvedAt =
    row.approved_at === null
      ? null
      : requireDate(row.approved_at, "approved_at");

  return Object.freeze({
    id: row.id,
    canonicalKey: row.canonical_key,
    localizedNames,
    status: row.status as TopicStatus,
    createdBy: row.created_by,
    approvedBy: row.approved_by,
    approvedAt,
    createdAt: requireDate(row.created_at, "created_at"),
    updatedAt: requireDate(row.updated_at, "updated_at"),
  });
}

export function topicError(
  error: unknown,
  fallbackMessage: string,
): TopicError {
  if (error instanceof TopicError) return error;

  const databaseError = error as {
    readonly code?: string;
    readonly constraint_name?: string;
    readonly constraint?: string;
  };
  const constraint = databaseError.constraint_name ?? databaseError.constraint;
  if (
    databaseError.code === "23505" &&
    constraint === "uq_topics__canonical_key"
  ) {
    return new TopicError(
      "canonical_key_conflict",
      "canonical key already exists",
      error,
    );
  }

  return new TopicError("database_invariant", fallbackMessage, error);
}
