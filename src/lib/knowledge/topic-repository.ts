import { createId } from "../../db/ids";
import {
  localizedNamesEqual,
  requireCanonicalKey,
  requireLocalizedNames,
  requireUuidV7,
  toTopicRecord,
  TopicError,
  topicError,
  type TopicDatabaseRow,
  type TopicLocalizedNames,
  type TopicRecord,
} from "./topics";

type SqlRow = Readonly<Record<string, unknown>>;

export interface TopicSql {
  <T extends readonly SqlRow[] = readonly SqlRow[]>(
    strings: TemplateStringsArray,
    ...values: readonly unknown[]
  ): Promise<T>;
}

export interface TopicRepositoryClient extends TopicSql {
  begin<T>(callback: (transaction: TopicSql) => Promise<T>): Promise<T>;
}

export interface CreateTopicInput {
  readonly canonicalKey: string;
  readonly localizedNames: TopicLocalizedNames;
  readonly createdBy: string;
}

export interface UpdateTopicLocalizedNamesInput {
  readonly topicId: string;
  readonly localizedNames: TopicLocalizedNames;
  readonly actorId: string;
}

export interface ApproveTopicInput {
  readonly topicId: string;
  readonly approvedBy: string;
}

export interface RetireTopicInput {
  readonly topicId: string;
  readonly actorId: string;
}

export interface CorrectTopicCanonicalKeyInput {
  readonly topicId: string;
  readonly canonicalKey: string;
  readonly actorId: string;
}

export interface TopicCanonicalReplacement {
  readonly retired: TopicRecord;
  readonly replacement: TopicRecord;
}

export interface TopicRepository {
  createTopic(input: CreateTopicInput): Promise<TopicRecord>;
  readTopicById(id: string): Promise<TopicRecord | null>;
  updateLocalizedNames(
    input: UpdateTopicLocalizedNamesInput,
  ): Promise<TopicRecord>;
  approveTopic(input: ApproveTopicInput): Promise<TopicRecord>;
  retireTopic(input: RetireTopicInput): Promise<TopicRecord>;
  correctCanonicalKey(
    input: CorrectTopicCanonicalKeyInput,
  ): Promise<TopicCanonicalReplacement>;
}

const asTopicRows = (rows: readonly SqlRow[]): readonly TopicDatabaseRow[] =>
  rows as readonly unknown[] as readonly TopicDatabaseRow[];

async function beginReadCommitted<T>(
  client: TopicRepositoryClient,
  operation: (transaction: TopicSql) => Promise<T>,
): Promise<T> {
  return client.begin(async (transaction) => {
    await transaction`set transaction isolation level read committed`;
    return operation(transaction);
  });
}

async function requireActiveActor(
  transaction: TopicSql,
  actorId: string,
): Promise<void> {
  requireUuidV7(actorId, "actorId");
  const actors = await transaction<readonly SqlRow[]>`
    select id from editorial_users
    where id = ${actorId}::uuid and status = 'active'
    for share
  `;
  if (actors.length !== 1) {
    throw new TopicError(
      "inactive_editorial_actor",
      "required editorial actor is missing or inactive",
    );
  }
}

async function lockTopic(
  transaction: TopicSql,
  topicId: string,
): Promise<TopicRecord> {
  const rows = await transaction<readonly SqlRow[]>`
    select id, canonical_key, localized_names, status, created_by,
           approved_by, approved_at, created_at, updated_at
    from topics where id = ${topicId}::uuid
    for update
  `;
  if (rows.length === 0) {
    throw new TopicError("not_found", "topic was not found");
  }
  return toTopicRecord(asTopicRows(rows)[0]);
}

export function createTopicRepository(
  client: TopicRepositoryClient,
  idFactory: () => string = createId,
): TopicRepository {
  return {
    async createTopic(input) {
      const canonicalKey = requireCanonicalKey(input.canonicalKey);
      const localizedNames = requireLocalizedNames(input.localizedNames);
      requireUuidV7(input.createdBy, "createdBy");
      const id = requireUuidV7(idFactory(), "id");

      try {
        return await beginReadCommitted(client, async (transaction) => {
          await requireActiveActor(transaction, input.createdBy);
          const rows = await transaction<readonly SqlRow[]>`
            insert into topics(id, canonical_key, localized_names, created_by)
            values(
              ${id}::uuid,
              ${canonicalKey},
              ${JSON.stringify(localizedNames)}::jsonb,
              ${input.createdBy}::uuid
            )
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          return toTopicRecord(asTopicRows(rows)[0]);
        });
      } catch (error) {
        throw topicError(error, "topic creation violated a database invariant");
      }
    },

    async readTopicById(id) {
      requireUuidV7(id, "id");
      try {
        const rows = await client<readonly SqlRow[]>`
          select id, canonical_key, localized_names, status, created_by,
                 approved_by, approved_at, created_at, updated_at
          from topics where id = ${id}::uuid
        `;
        return rows.length === 0 ? null : toTopicRecord(asTopicRows(rows)[0]);
      } catch (error) {
        throw topicError(error, "topic read violated a database invariant");
      }
    },

    async updateLocalizedNames(input) {
      requireUuidV7(input.topicId, "topicId");
      const localizedNames = requireLocalizedNames(input.localizedNames);
      try {
        return await beginReadCommitted(client, async (transaction) => {
          await requireActiveActor(transaction, input.actorId);
          const topic = await lockTopic(transaction, input.topicId);
          if (topic.status === "retired") {
            throw new TopicError(
              "invalid_transition",
              "retired topic is terminal",
            );
          }
          if (localizedNamesEqual(topic.localizedNames, localizedNames)) {
            throw new TopicError(
              "invalid_transition",
              "localized-name replacement must make an actual change",
            );
          }
          const rows = await transaction<readonly SqlRow[]>`
            update topics
            set localized_names = ${JSON.stringify(localizedNames)}::jsonb
            where id = ${input.topicId}::uuid
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          return toTopicRecord(asTopicRows(rows)[0]);
        });
      } catch (error) {
        throw topicError(
          error,
          "localized-name replacement violated a database invariant",
        );
      }
    },

    async approveTopic(input) {
      requireUuidV7(input.topicId, "topicId");
      try {
        return await beginReadCommitted(client, async (transaction) => {
          await requireActiveActor(transaction, input.approvedBy);
          const topic = await lockTopic(transaction, input.topicId);
          if (topic.status !== "draft") {
            throw new TopicError(
              "invalid_transition",
              "only a draft topic may be approved",
            );
          }
          const rows = await transaction<readonly SqlRow[]>`
            update topics
            set status = 'approved', approved_by = ${input.approvedBy}::uuid
            where id = ${input.topicId}::uuid
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          return toTopicRecord(asTopicRows(rows)[0]);
        });
      } catch (error) {
        throw topicError(error, "topic approval violated a database invariant");
      }
    },

    async retireTopic(input) {
      requireUuidV7(input.topicId, "topicId");
      try {
        return await beginReadCommitted(client, async (transaction) => {
          await requireActiveActor(transaction, input.actorId);
          const topic = await lockTopic(transaction, input.topicId);
          if (topic.status === "retired") {
            throw new TopicError(
              "invalid_transition",
              "retired topic is terminal",
            );
          }
          const rows = await transaction<readonly SqlRow[]>`
            update topics set status = 'retired'
            where id = ${input.topicId}::uuid
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          return toTopicRecord(asTopicRows(rows)[0]);
        });
      } catch (error) {
        throw topicError(
          error,
          "topic retirement violated a database invariant",
        );
      }
    },

    async correctCanonicalKey(input) {
      requireUuidV7(input.topicId, "topicId");
      const canonicalKey = requireCanonicalKey(input.canonicalKey);
      const replacementId = requireUuidV7(idFactory(), "replacementId");

      try {
        return await beginReadCommitted(client, async (transaction) => {
          await requireActiveActor(transaction, input.actorId);
          const topic = await lockTopic(transaction, input.topicId);
          if (topic.status === "retired") {
            throw new TopicError(
              "invalid_transition",
              "retired topic is terminal",
            );
          }
          if (topic.canonicalKey === canonicalKey) {
            throw new TopicError(
              "invalid_transition",
              "canonical replacement must change the canonical key",
            );
          }

          const retiredRows = await transaction<readonly SqlRow[]>`
            update topics set status = 'retired'
            where id = ${input.topicId}::uuid
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          const replacementRows = await transaction<readonly SqlRow[]>`
            insert into topics(id, canonical_key, localized_names, created_by)
            values(
              ${replacementId}::uuid,
              ${canonicalKey},
              ${JSON.stringify(topic.localizedNames)}::jsonb,
              ${input.actorId}::uuid
            )
            returning id, canonical_key, localized_names, status, created_by,
                      approved_by, approved_at, created_at, updated_at
          `;
          return Object.freeze({
            retired: toTopicRecord(asTopicRows(retiredRows)[0]),
            replacement: toTopicRecord(asTopicRows(replacementRows)[0]),
          });
        });
      } catch (error) {
        throw topicError(
          error,
          "canonical replacement violated a database invariant",
        );
      }
    },
  };
}
