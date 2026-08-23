import test from "node:test";
import assert from "node:assert/strict";

import * as topicsModule from "../src/lib/knowledge/topics.ts";
import {
  localizedNamesEqual,
  requireCanonicalKey,
  requireLocalizedNames,
  requireUuidV7,
  toTopicRecord,
  TopicError,
  topicError,
} from "../src/lib/knowledge/topics.ts";
import { createTopicRepository } from "../src/lib/knowledge/topic-repository.ts";

const ids = {
  actor: "0198a7b0-e100-7000-8000-000000000001",
  disabled: "0198a7b0-e100-7000-8000-000000000002",
  topicA: "0198a7b0-e200-7000-8000-000000000001",
  topicB: "0198a7b0-e200-7000-8000-000000000002",
  topicC: "0198a7b0-e200-7000-8000-000000000003",
};

const cloneRow = (row) => ({
  ...row,
  localized_names: { ...row.localized_names },
  approved_at: row.approved_at && new Date(row.approved_at),
  created_at: new Date(row.created_at),
  updated_at: new Date(row.updated_at),
});

function createFakeClient() {
  const state = {
    actors: new Map([
      [ids.actor, "active"],
      [ids.disabled, "disabled"],
    ]),
    topics: new Map(),
    tick: Date.parse("2026-08-23T00:00:00.000Z"),
  };

  const eventTime = (oldTime) => {
    state.tick += 1;
    return new Date(Math.max(state.tick, oldTime.getTime() + 1));
  };

  const sql = async (strings, ...values) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim().toLowerCase();
    if (query.startsWith("set transaction isolation level")) return [];
    if (query.includes("from editorial_users")) {
      return state.actors.get(values[0]) === "active"
        ? [{ id: values[0] }]
        : [];
    }
    if (query.includes("from topics where id") && query.startsWith("select")) {
      const row = state.topics.get(values[0]);
      return row ? [cloneRow(row)] : [];
    }
    if (query.startsWith("insert into topics")) {
      const [id, canonicalKey, localizedNamesJson, createdBy] = values;
      if (
        [...state.topics.values()].some(
          (row) => row.canonical_key === canonicalKey,
        )
      ) {
        const error = new Error("duplicate canonical key");
        error.code = "23505";
        error.constraint_name = "uq_topics__canonical_key";
        throw error;
      }
      const now = new Date(++state.tick);
      const row = {
        id,
        canonical_key: canonicalKey,
        localized_names: JSON.parse(localizedNamesJson),
        status: "draft",
        created_by: createdBy,
        approved_by: null,
        approved_at: null,
        created_at: now,
        updated_at: now,
      };
      state.topics.set(id, row);
      return [cloneRow(row)];
    }
    if (
      query.startsWith("update topics") &&
      query.includes("set localized_names")
    ) {
      const [localizedNamesJson, id] = values;
      const row = state.topics.get(id);
      row.localized_names = JSON.parse(localizedNamesJson);
      row.updated_at = eventTime(row.updated_at);
      return [cloneRow(row)];
    }
    if (
      query.startsWith("update topics") &&
      query.includes("set status = 'approved'")
    ) {
      const [approvedBy, id] = values;
      const row = state.topics.get(id);
      const now = eventTime(row.updated_at);
      row.status = "approved";
      row.approved_by = approvedBy;
      row.approved_at = now;
      row.updated_at = now;
      return [cloneRow(row)];
    }
    if (
      query.startsWith("update topics") &&
      query.includes("set status = 'retired'")
    ) {
      const id = values[0];
      const row = state.topics.get(id);
      row.status = "retired";
      row.updated_at = eventTime(row.updated_at);
      return [cloneRow(row)];
    }
    throw new Error(`unexpected fake SQL: ${query}`);
  };

  sql.begin = async (operation) => {
    const snapshot = new Map(
      [...state.topics].map(([id, row]) => [id, cloneRow(row)]),
    );
    try {
      return await operation(sql);
    } catch (error) {
      state.topics = snapshot;
      throw error;
    }
  };

  return { client: sql, state };
}

test("domain validation enforces UUIDv7, canonical keys, and localized names", () => {
  assert.equal(requireUuidV7(ids.topicA, "id"), ids.topicA);
  assert.throws(
    () => requireUuidV7("0198a7b0-e200-4000-8000-000000000001", "id"),
    (error) => error instanceof TopicError && error.code === "validation",
  );
  assert.equal(requireCanonicalKey("mercy"), "mercy");
  for (const invalid of ["", "   ", "Mercy", "x".repeat(161)]) {
    assert.throws(
      () => requireCanonicalKey(invalid),
      (error) => error instanceof TopicError && error.code === "validation",
    );
  }
  assert.deepEqual(requireLocalizedNames({ en: "Mercy" }), { en: "Mercy" });
  assert.throws(() => requireLocalizedNames({}));
  assert.throws(() => requireLocalizedNames({ en: " " }));
  assert.throws(
    () => requireLocalizedNames(null),
    (error) => error instanceof TopicError && error.code === "validation",
  );
  assert.equal(localizedNamesEqual({ en: "Mercy" }, { en: "Mercy" }), true);
});

test("TopicRecord mapping is persisted and separate from KE-1 KnowledgeTopic", () => {
  const record = toTopicRecord({
    id: ids.topicA,
    canonical_key: "mercy",
    localized_names: { en: "Mercy" },
    status: "draft",
    created_by: ids.actor,
    approved_by: null,
    approved_at: null,
    created_at: new Date("2026-08-23T00:00:00Z"),
    updated_at: new Date("2026-08-23T00:00:00Z"),
  });
  assert.equal(record.canonicalKey, "mercy");
  assert.equal(record.status, "draft");
  assert.equal("presentations" in record, false);
  assert.equal("KnowledgeTopic" in topicsModule, false);
  assert.ok(Object.isFrozen(record));
});

test("repository executes create, read, complete-name update, approve, and retire", async () => {
  const { client } = createFakeClient();
  const repository = createTopicRepository(client, () => ids.topicA);
  const created = await repository.createTopic({
    canonicalKey: "mercy",
    localizedNames: { en: "Mercy" },
    createdBy: ids.actor,
  });
  assert.equal(created.status, "draft");
  assert.deepEqual(
    (await repository.readTopicById(ids.topicA)).localizedNames,
    {
      en: "Mercy",
    },
  );

  const updated = await repository.updateLocalizedNames({
    topicId: ids.topicA,
    localizedNames: { en: "Mercy", ar: "Rahma" },
    actorId: ids.actor,
  });
  assert.deepEqual(updated.localizedNames, { en: "Mercy", ar: "Rahma" });
  assert.ok(updated.updatedAt > created.updatedAt);

  const approved = await repository.approveTopic({
    topicId: ids.topicA,
    approvedBy: ids.actor,
  });
  assert.equal(approved.status, "approved");
  assert.equal(approved.approvedBy, ids.actor);
  assert.equal(approved.approvedAt.getTime(), approved.updatedAt.getTime());

  const retired = await repository.retireTopic({
    topicId: ids.topicA,
    actorId: ids.actor,
  });
  assert.equal(retired.status, "retired");
  assert.equal(retired.approvedBy, approved.approvedBy);
  assert.equal(retired.approvedAt.getTime(), approved.approvedAt.getTime());
});

test("read absence, no-op, inactive actor, not-found, and terminal states are classified", async () => {
  const { client } = createFakeClient();
  const repository = createTopicRepository(client, () => ids.topicA);
  assert.equal(await repository.readTopicById(ids.topicB), null);
  await assert.rejects(
    repository.createTopic({
      canonicalKey: "mercy",
      localizedNames: { en: "Mercy" },
      createdBy: ids.disabled,
    }),
    (error) => error.code === "inactive_editorial_actor",
  );
  await repository.createTopic({
    canonicalKey: "mercy",
    localizedNames: { en: "Mercy" },
    createdBy: ids.actor,
  });
  await assert.rejects(
    repository.updateLocalizedNames({
      topicId: ids.topicA,
      localizedNames: { en: "Mercy" },
      actorId: ids.actor,
    }),
    (error) => error.code === "invalid_transition",
  );
  await assert.rejects(
    repository.retireTopic({ topicId: ids.topicB, actorId: ids.actor }),
    (error) => error.code === "not_found",
  );
  await repository.retireTopic({ topicId: ids.topicA, actorId: ids.actor });
  await assert.rejects(
    repository.approveTopic({ topicId: ids.topicA, approvedBy: ids.actor }),
    (error) => error.code === "invalid_transition",
  );
});

test("canonical-key correction atomically retires and replaces a topic", async () => {
  const { client } = createFakeClient();
  const generated = [ids.topicA, ids.topicB];
  const repository = createTopicRepository(client, () => generated.shift());
  await repository.createTopic({
    canonicalKey: "mercyy",
    localizedNames: { en: "Mercy" },
    createdBy: ids.actor,
  });
  const result = await repository.correctCanonicalKey({
    topicId: ids.topicA,
    canonicalKey: "mercy",
    actorId: ids.actor,
  });
  assert.equal(result.retired.status, "retired");
  assert.equal(result.retired.canonicalKey, "mercyy");
  assert.equal(result.replacement.id, ids.topicB);
  assert.equal(result.replacement.canonicalKey, "mercy");
  assert.equal(result.replacement.status, "draft");
  assert.equal(result.replacement.createdBy, ids.actor);
  assert.equal(result.replacement.approvedBy, null);
  assert.equal(result.replacement.approvedAt, null);
  assert.deepEqual(result.replacement.localizedNames, { en: "Mercy" });
});

test("canonical conflicts and unexpected database failures map without raw leakage", () => {
  const conflict = new Error("raw duplicate");
  conflict.code = "23505";
  conflict.constraint_name = "uq_topics__canonical_key";
  const mappedConflict = topicError(conflict, "fallback");
  assert.equal(mappedConflict.code, "canonical_key_conflict");
  assert.notEqual(mappedConflict.message, conflict.message);

  const invariant = topicError(new Error("raw infrastructure"), "safe message");
  assert.equal(invariant.code, "database_invariant");
  assert.equal(invariant.message, "safe message");
  assert.ok(invariant.cause);
});
