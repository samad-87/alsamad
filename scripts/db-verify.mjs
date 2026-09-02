import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { sql } from "drizzle-orm";
import { validate as validateUuid, version as uuidVersion } from "uuid";

import { db, queryClient } from "../src/db/client.ts";
import { createId } from "../src/db/ids.ts";

const ids = {
  localeA: "0198a7b0-1000-7000-8000-000000000001",
  localeB: "0198a7b0-1000-7000-8000-000000000002",
  localeC: "0198a7b0-1000-7000-8000-000000000003",
  country: "0198a7b0-2000-7000-8000-000000000001",
  region: "0198a7b0-2000-7000-8000-000000000002",
  city: "0198a7b0-2000-7000-8000-000000000003",
};

const expectDatabaseRejection = async (label, operation) => {
  await assert.rejects(() => queryClient.begin(operation), undefined, label);
  console.log(`PASS rejection: ${label}`);
};

const listFilesRecursively = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFilesRecursively(path)));
    else files.push(path);
  }
  return files;
};

try {
  const connection = await db.execute(sql`select 1 as connected`);
  assert.equal(connection[0]?.connected, 1);

  const id = createId();
  const sample = "السَّمَد — Arabic UTF-8 ✓";
  const persisted = await queryClient`
    select
      ${id}::uuid::text as id,
      ${sample}::text as sample,
      current_setting('server_encoding') as encoding,
      current_setting('TimeZone') as timezone,
      extract(timezone from current_timestamp)::int as utc_offset
  `;
  assert.equal(validateUuid(persisted[0]?.id), true);
  assert.equal(uuidVersion(persisted[0]?.id), 7);
  assert.equal(persisted[0]?.sample, sample);
  assert.equal(persisted[0]?.encoding, "UTF8");
  assert.equal(persisted[0]?.timezone, "UTC");
  assert.equal(persisted[0]?.utc_offset, 0);

  await queryClient.begin(async (transaction) => {
    await transaction`update locales set display_name = 'Arabic commit check' where code = 'ar'`;
  });
  assert.equal(
    (await queryClient`select display_name from locales where code = 'ar'`)[0]
      ?.display_name,
    "Arabic commit check",
  );
  await queryClient`update locales set display_name = 'Arabic' where code = 'ar'`;

  await assert.rejects(() =>
    queryClient.begin(async (transaction) => {
      await transaction`update locales set display_name = 'must roll back' where code = 'ar'`;
      throw new Error("rollback sentinel");
    }),
  );
  assert.equal(
    (await queryClient`select display_name from locales where code = 'ar'`)[0]
      ?.display_name,
    "Arabic",
  );

  const tables = await queryClient`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `;
  assert.deepEqual(
    tables.map(({ table_name }) => table_name),
    [
      "content_items",
      "content_revisions",
      "editions",
      "editorial_users",
      "geographic_areas",
      "licenses",
      "locales",
      "passage_texts",
      "passages",
      "quran_ayah_texts",
      "quran_ayahs",
      "quran_structural_markers",
      "quran_surahs",
      "quran_translation_editions",
      "quran_translation_texts",
      "source_references",
      "topics",
      "user_identities",
      "users",
      "works",
    ],
  );

  const editorialColumns = await queryClient`
    select column_name, data_type, character_maximum_length, is_nullable, column_default
    from information_schema.columns
    where table_schema='public' and table_name='editorial_users'
    order by ordinal_position
  `;
  assert.deepEqual(
    editorialColumns.map(({ column_name }) => column_name),
    ["id", "status", "created_at", "updated_at"],
  );
  assert.deepEqual(
    editorialColumns.map(({ data_type }) => data_type),
    [
      "uuid",
      "character varying",
      "timestamp with time zone",
      "timestamp with time zone",
    ],
  );
  assert.equal(editorialColumns[0]?.is_nullable, "NO");
  assert.equal(editorialColumns[0]?.column_default, null);
  assert.equal(editorialColumns[1]?.character_maximum_length, 16);
  assert.equal(editorialColumns[1]?.is_nullable, "NO");
  assert.match(editorialColumns[1]?.column_default ?? "", /disabled/);
  for (const column of editorialColumns.slice(2)) {
    assert.equal(column.is_nullable, "NO");
    assert.equal(column.column_default, "CURRENT_TIMESTAMP");
  }

  assert.equal(
    (
      await queryClient`
        select count(*)::int as count
        from information_schema.table_constraints
        where table_schema='public' and table_name='editorial_users'
          and constraint_type='FOREIGN KEY'
      `
    )[0]?.count,
    0,
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from editorial_users`)[0]
      ?.count,
    0,
  );

  const editorialId = "0198a7b0-d000-7000-8000-000000000001";
  const editorialId2 = "0198a7b0-d000-7000-8000-000000000002";
  await queryClient
    .begin(async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      let row = (
        await transaction`select status,created_at=updated_at as timestamps_equal from editorial_users where id=${editorialId}::uuid`
      )[0];
      assert.equal(row?.status, "disabled");
      assert.equal(row?.timestamps_equal, true);

      await transaction`update editorial_users set status='active',updated_at=updated_at+interval '1 second' where id=${editorialId}::uuid`;
      row = (
        await transaction`select status,created_at,updated_at from editorial_users where id=${editorialId}::uuid`
      )[0];
      assert.equal(row?.status, "active");

      await transaction`update editorial_users set status='disabled',updated_at=updated_at+interval '1 second' where id=${editorialId}::uuid`;
      await transaction`update editorial_users set status='active',updated_at=updated_at+interval '1 second' where id=${editorialId}::uuid`;
      assert.equal(
        (
          await transaction`select status from editorial_users where id=${editorialId}::uuid`
        )[0]?.status,
        "active",
      );

      await transaction`update editorial_users set status=status,updated_at=updated_at where id=${editorialId}::uuid`;
      throw new Error("Editorial Identity lifecycle rollback");
    })
    .catch((error) =>
      assert.equal(error.message, "Editorial Identity lifecycle rollback"),
    );

  await expectDatabaseRejection("non-v7 editorial id", async (transaction) => {
    await transaction`insert into editorial_users(id) values('0198a7b0-d000-4000-8000-000000000001'::uuid)`;
  });
  await expectDatabaseRejection(
    "invalid RFC variant editorial id",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values('0198a7b0-d000-7000-0000-000000000001'::uuid)`;
    },
  );
  await expectDatabaseRejection(
    "duplicate editorial id",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid),(${editorialId}::uuid)`;
    },
  );
  await expectDatabaseRejection(
    "editorial id mutation",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set id=${editorialId2}::uuid where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "editorial created_at mutation",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set created_at=created_at+interval '1 second' where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "invalid editorial status",
    async (transaction) => {
      await transaction`insert into editorial_users(id,status) values(${editorialId}::uuid,'pending')`;
    },
  );
  await expectDatabaseRejection(
    "status transition without updated_at",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set status='active' where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "status transition with earlier updated_at",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set status='active',updated_at=updated_at-interval '1 second' where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "editorial timestamp-only mutation",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set updated_at=updated_at+interval '1 second' where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "editorial no-op timestamp fabrication",
    async (transaction) => {
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`update editorial_users set status='disabled',updated_at=updated_at+interval '1 second' where id=${editorialId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "synthetic referenced editorial identity deletion",
    async (transaction) => {
      await transaction`create temporary table editorial_user_consumer_fixture(actor_id uuid not null references editorial_users(id) on update restrict on delete restrict) on commit drop`;
      await transaction`insert into editorial_users(id) values(${editorialId}::uuid)`;
      await transaction`insert into editorial_user_consumer_fixture(actor_id) values(${editorialId}::uuid)`;
      await transaction`delete from editorial_users where id=${editorialId}::uuid`;
    },
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from editorial_users`)[0]
      ?.count,
    0,
  );

  const userColumns = await queryClient`
    select column_name, data_type, character_maximum_length, is_nullable, column_default
    from information_schema.columns
    where table_schema='public' and table_name='users'
    order by ordinal_position
  `;
  assert.deepEqual(
    userColumns.map(({ column_name }) => column_name),
    ["id", "status", "created_at", "updated_at"],
  );
  assert.deepEqual(
    userColumns.map(({ data_type }) => data_type),
    [
      "uuid",
      "character varying",
      "timestamp with time zone",
      "timestamp with time zone",
    ],
  );
  assert.equal(userColumns[0]?.is_nullable, "NO");
  assert.equal(userColumns[0]?.column_default, null);
  assert.equal(userColumns[1]?.character_maximum_length, 24);
  assert.equal(userColumns[1]?.is_nullable, "NO");
  assert.match(userColumns[1]?.column_default ?? "", /active/);
  for (const column of userColumns.slice(2)) {
    assert.equal(column.is_nullable, "NO");
    assert.equal(column.column_default, "CURRENT_TIMESTAMP");
  }

  const userConstraints = await queryClient`
    select conname, contype
    from pg_constraint
    where conrelid='users'::regclass
    order by conname
  `;
  assert.deepEqual(
    userConstraints.map(({ conname, contype }) => [conname, contype]),
    [
      ["ck_users__id_uuidv7", "c"],
      ["ck_users__status", "c"],
      ["users_pkey", "p"],
    ],
  );
  assert.equal(
    (
      await queryClient`
        select count(*)::int as count
        from information_schema.table_constraints
        where table_schema='public' and table_name='users'
          and constraint_type='FOREIGN KEY'
      `
    )[0]?.count,
    0,
  );

  const userIndexes = await queryClient`
    select indexname, indexdef
    from pg_indexes
    where schemaname='public' and tablename='users'
    order by indexname
  `;
  assert.equal(userIndexes.length, 1);
  assert.equal(userIndexes[0]?.indexname, "users_pkey");
  assert.match(
    userIndexes[0]?.indexdef ?? "",
    /CREATE UNIQUE INDEX users_pkey ON public\.users USING btree \(id\)/,
  );
  assert.equal(
    (
      await queryClient`
        select count(*)::int as count
        from pg_trigger
        where tgrelid='users'::regclass and not tgisinternal
          and tgname='trg_users__lifecycle_integrity'
      `
    )[0]?.count,
    1,
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from users`)[0]?.count,
    0,
  );

  const userId = "0198a7b0-e000-7000-8000-000000000001";
  const userId2 = "0198a7b0-e000-7000-8000-000000000002";
  await queryClient
    .begin(async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      let row = (
        await transaction`select status,created_at=updated_at as timestamps_equal from users where id=${userId}::uuid`
      )[0];
      assert.equal(row?.status, "active");
      assert.equal(row?.timestamps_equal, true);

      await transaction`update users set status='disabled',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
      await transaction`update users set status='deletion_pending',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
      await transaction`update users set status='deleted',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
      row = (
        await transaction`select status,created_at,updated_at from users where id=${userId}::uuid`
      )[0];
      assert.equal(row?.status, "deleted");
      assert.ok(row.updated_at > row.created_at);
      throw new Error("Public Identity root lifecycle rollback");
    })
    .catch((error) =>
      assert.equal(error.message, "Public Identity root lifecycle rollback"),
    );

  await expectDatabaseRejection(
    "non-v7 public user id",
    async (transaction) => {
      await transaction`insert into users(id) values('0198a7b0-e000-4000-8000-000000000001'::uuid)`;
    },
  );
  await expectDatabaseRejection(
    "invalid RFC variant public user id",
    async (transaction) => {
      await transaction`insert into users(id) values('0198a7b0-e000-7000-0000-000000000001'::uuid)`;
    },
  );
  await expectDatabaseRejection(
    "duplicate public user id",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid),(${userId}::uuid)`;
    },
  );
  await expectDatabaseRejection(
    "invalid public user status",
    async (transaction) => {
      await transaction`insert into users(id,status) values(${userId}::uuid,'pending')`;
    },
  );
  await expectDatabaseRejection(
    "public user id mutation",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set id=${userId2}::uuid where id=${userId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "public user created_at mutation",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set created_at=created_at+interval '1 second' where id=${userId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "public user no-op update",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set status=status,updated_at=updated_at where id=${userId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "public user timestamp-only update",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "public user status transition without updated_at",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set status='disabled' where id=${userId}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "public user status transition with earlier updated_at",
    async (transaction) => {
      await transaction`insert into users(id) values(${userId}::uuid)`;
      await transaction`update users set status='disabled',updated_at=updated_at-interval '1 second' where id=${userId}::uuid`;
    },
  );
  for (const status of ["active", "disabled"]) {
    await expectDatabaseRejection(
      `public user direct ${status} to deleted transition`,
      async (transaction) => {
        await transaction`insert into users(id,status) values(${userId}::uuid,${status})`;
        await transaction`update users set status='deleted',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
      },
    );
  }
  await expectDatabaseRejection(
    "public user transition out of deleted",
    async (transaction) => {
      await transaction`insert into users(id,status) values(${userId}::uuid,'deletion_pending')`;
      await transaction`update users set status='deleted',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
      await transaction`update users set status='active',updated_at=updated_at+interval '1 second' where id=${userId}::uuid`;
    },
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from users`)[0]?.count,
    0,
  );

  const userIdentityColumns = await queryClient`
    select column_name, data_type, character_maximum_length, is_nullable,
      column_default, collation_name
    from information_schema.columns
    where table_schema='public' and table_name='user_identities'
    order by ordinal_position
  `;
  assert.deepEqual(
    userIdentityColumns.map(({ column_name }) => column_name),
    [
      "id",
      "user_id",
      "authenticator_namespace",
      "subject",
      "status",
      "created_at",
      "updated_at",
    ],
  );
  assert.deepEqual(
    userIdentityColumns.map(({ data_type }) => data_type),
    [
      "uuid",
      "uuid",
      "character varying",
      "text",
      "character varying",
      "timestamp with time zone",
      "timestamp with time zone",
    ],
  );
  assert.deepEqual(
    userIdentityColumns.map(({ is_nullable }) => is_nullable),
    ["NO", "NO", "NO", "NO", "NO", "NO", "NO"],
  );
  assert.deepEqual(
    userIdentityColumns.map(({ column_default }) => column_default),
    [null, null, null, null, null, "CURRENT_TIMESTAMP", "CURRENT_TIMESTAMP"],
  );
  assert.equal(userIdentityColumns[2]?.character_maximum_length, 128);
  assert.equal(userIdentityColumns[2]?.collation_name, "C");
  assert.equal(userIdentityColumns[3]?.character_maximum_length, null);
  assert.equal(userIdentityColumns[3]?.collation_name, "C");
  assert.equal(userIdentityColumns[4]?.character_maximum_length, 16);

  const userIdentityConstraints = await queryClient`
    select conname, contype, condeferrable, confupdtype, confdeltype,
      pg_get_constraintdef(oid) as definition
    from pg_constraint
    where conrelid='user_identities'::regclass
    order by conname
  `;
  assert.deepEqual(
    userIdentityConstraints.map(({ conname, contype }) => [conname, contype]),
    [
      ["ck_user_identities__authenticator_namespace", "c"],
      ["ck_user_identities__id_uuidv7", "c"],
      ["ck_user_identities__status", "c"],
      ["ck_user_identities__subject_nonempty", "c"],
      ["fk_user_identities__user", "f"],
      ["uq_user_identities__authenticator_subject", "u"],
      ["user_identities_pkey", "p"],
    ],
  );
  const identityForeignKey = userIdentityConstraints.find(
    ({ conname }) => conname === "fk_user_identities__user",
  );
  assert.equal(identityForeignKey?.condeferrable, false);
  assert.equal(identityForeignKey?.confupdtype, "r");
  assert.equal(identityForeignKey?.confdeltype, "r");
  assert.match(identityForeignKey?.definition ?? "", /REFERENCES users\(id\)/);

  const userIdentityIndexes = await queryClient`
    select indexname, indexdef
    from pg_indexes
    where schemaname='public' and tablename='user_identities'
    order by indexname
  `;
  assert.deepEqual(
    userIdentityIndexes.map(({ indexname }) => indexname),
    [
      "ix_user_identities__user_id",
      "uq_user_identities__authenticator_subject",
      "user_identities_pkey",
    ],
  );
  assert.match(
    userIdentityIndexes.find(
      ({ indexname }) =>
        indexname === "uq_user_identities__authenticator_subject",
    )?.indexdef ?? "",
    /UNIQUE INDEX .* \(authenticator_namespace, subject\)/,
  );
  assert.match(
    userIdentityIndexes.find(
      ({ indexname }) => indexname === "ix_user_identities__user_id",
    )?.indexdef ?? "",
    /INDEX .* \(user_id\)/,
  );
  assert.equal(
    (
      await queryClient`
        select count(*)::int as count
        from pg_trigger
        where tgrelid='user_identities'::regclass and not tgisinternal
          and tgname='trg_user_identities__integrity'
      `
    )[0]?.count,
    1,
  );

  const identityUserId = "0198a7b0-e000-7000-8000-000000000011";
  const identityUserId2 = "0198a7b0-e000-7000-8000-000000000012";
  const identityId = "0198a7b0-e100-7000-8000-000000000001";
  const identityId2 = "0198a7b0-e100-7000-8000-000000000002";
  await queryClient
    .begin(async (transaction) => {
      await transaction`insert into users(id) values(${identityUserId}::uuid),(${identityUserId2}::uuid)`;
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
        values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','CaseSensitive','active'),
          (${identityId2}::uuid,${identityUserId}::uuid,'synthetic','casesensitive','retired')`;
      let row = (
        await transaction`select status,created_at=updated_at as timestamps_equal from user_identities where id=${identityId}::uuid`
      )[0];
      assert.equal(row?.status, "active");
      assert.equal(row?.timestamps_equal, true);
      await transaction`update user_identities set status='retired',updated_at=updated_at+interval '1 second' where id=${identityId}::uuid`;
      await transaction`update user_identities set status='active',updated_at=updated_at+interval '1 second' where id=${identityId}::uuid`;
      row = (
        await transaction`select status,updated_at>created_at as timestamp_advanced from user_identities where id=${identityId}::uuid`
      )[0];
      assert.equal(row?.status, "active");
      assert.equal(row?.timestamp_advanced, true);
      throw new Error("user identity positive verification rollback");
    })
    .catch((error) =>
      assert.equal(
        error.message,
        "user identity positive verification rollback",
      ),
    );

  const rejectIdentityMutation = async (label, operation) =>
    expectDatabaseRejection(label, async (transaction) => {
      await transaction`insert into users(id) values(${identityUserId}::uuid),(${identityUserId2}::uuid)`;
      await operation(transaction);
    });

  await rejectIdentityMutation(
    "non-v7 user identity id",
    (transaction) =>
      transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values('0198a7b0-e100-4000-8000-000000000001'::uuid,${identityUserId}::uuid,'synthetic','subject','active')`,
  );
  await rejectIdentityMutation(
    "invalid RFC variant user identity id",
    (transaction) =>
      transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values('0198a7b0-e100-7000-0000-000000000001'::uuid,${identityUserId}::uuid,'synthetic','subject','active')`,
  );
  await rejectIdentityMutation(
    "omitted user identity id",
    (transaction) =>
      transaction`insert into user_identities(user_id,authenticator_namespace,subject,status)
      values(${identityUserId}::uuid,'synthetic','subject','active')`,
  );
  for (const [label, namespace] of [
    ["uppercase namespace", "Synthetic"],
    ["invalid namespace first character", "_synthetic"],
    ["invalid namespace punctuation", "synthetic:provider"],
    ["empty namespace", ""],
    ["overlong namespace", `a${"b".repeat(128)}`],
  ]) {
    await rejectIdentityMutation(
      label,
      (transaction) =>
        transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
        values(${identityId}::uuid,${identityUserId}::uuid,${namespace},'subject','active')`,
    );
  }
  await rejectIdentityMutation(
    "empty subject",
    (transaction) =>
      transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','','active')`,
  );
  await rejectIdentityMutation(
    "invalid user identity status",
    (transaction) =>
      transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','pending')`,
  );
  await rejectIdentityMutation(
    "omitted user identity status",
    (transaction) =>
      transaction`insert into user_identities(id,user_id,authenticator_namespace,subject)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject')`,
  );
  await expectDatabaseRejection(
    "missing durable user FK",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
    },
  );

  for (const [label, mutation] of [
    ["id", `id='${identityId2}'::uuid`],
    ["user_id", `user_id='${identityUserId2}'::uuid`],
    ["authenticator_namespace", "authenticator_namespace='changed'"],
    ["subject", "subject='changed'"],
    ["created_at", "created_at=created_at+interval '1 second'"],
  ]) {
    await rejectIdentityMutation(
      `immutable user identity ${label}`,
      async (transaction) => {
        await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
        values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
        await transaction.unsafe(
          `update user_identities set ${mutation} where id='${identityId}'::uuid`,
        );
      },
    );
  }
  await rejectIdentityMutation(
    "user identity no-op update",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
      await transaction`update user_identities set status=status,updated_at=updated_at where id=${identityId}::uuid`;
    },
  );
  await rejectIdentityMutation(
    "user identity timestamp-only update",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
      await transaction`update user_identities set updated_at=updated_at+interval '1 second' where id=${identityId}::uuid`;
    },
  );
  await rejectIdentityMutation(
    "status transition without updated_at",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
      await transaction`update user_identities set status='retired' where id=${identityId}::uuid`;
    },
  );
  await rejectIdentityMutation(
    "status transition with earlier updated_at",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
      await transaction`update user_identities set status='retired',updated_at=updated_at-interval '1 second' where id=${identityId}::uuid`;
    },
  );
  await rejectIdentityMutation(
    "retired identity remains uniquely reserved while retained",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','retired')`;
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId2}::uuid,${identityUserId2}::uuid,'synthetic','subject','active')`;
    },
  );
  await rejectIdentityMutation(
    "referenced durable user deletion",
    async (transaction) => {
      await transaction`insert into user_identities(id,user_id,authenticator_namespace,subject,status)
      values(${identityId}::uuid,${identityUserId}::uuid,'synthetic','subject','active')`;
      await transaction`delete from users where id=${identityUserId}::uuid`;
    },
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from user_identities`)[0]
      ?.count,
    0,
  );

  const forbiddenUserColumns = [
    "email",
    "phone",
    "username",
    "display_name",
    "avatar",
    "locale",
    "provider",
    "provider_subject",
    "credential",
    "session",
    "recovery",
    "preferences",
    "saved_items",
    "profile",
    "editorial_user_id",
    "talibeen_profile_id",
    "marketing",
    "analytics",
  ];
  assert.equal(
    userColumns.some(({ column_name }) =>
      forbiddenUserColumns.includes(column_name),
    ),
    false,
  );

  const userMigration = await readFile(
    "drizzle/0013_public_identity_account_root.sql",
    "utf8",
  );
  assert.match(userMigration, /create table if not exists users/);
  assert.match(userMigration, /constraint ck_users__id_uuidv7 check/);
  assert.match(userMigration, /constraint ck_users__status check/);
  assert.match(userMigration, /create trigger trg_users__lifecycle_integrity/);
  assert.doesNotMatch(userMigration, /\binsert\s+into\s+users\b/i);
  assert.doesNotMatch(
    userMigration,
    /\b(?:gen_random_uuid|uuid_generate_v4)\s*\(/i,
  );

  const migrationFiles = (await readdir("drizzle"))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  assert.deepEqual(migrationFiles, [
    "0000_foundation.sql",
    "0001_global_locales_geography.sql",
    "0002_content_integrity_foundation.sql",
    "0003_fix_m4_source_reference_trigger.sql",
    "0004_quran_data_model.sql",
    "0005_license_publication_rights_separation.sql",
    "0006_license_version_immutability.sql",
    "0007_m5_publication_trigger_table_branching.sql",
    "0008_atomic_quran_release_selector.sql",
    "0009_arc005_insert_activation_validation.sql",
    "0011_editorial_identity_foundation.sql",
    "0012_ke2a_topics.sql",
    "0013_public_identity_account_root.sql",
    "0014_public_identity_authentication_linkage.sql",
  ]);

  const userIdentityMigration = await readFile(
    "drizzle/0014_public_identity_authentication_linkage.sql",
    "utf8",
  );
  assert.match(
    userIdentityMigration,
    /create table if not exists user_identities/,
  );
  assert.match(
    userIdentityMigration,
    /constraint ck_user_identities__id_uuidv7 check/,
  );
  assert.match(
    userIdentityMigration,
    /constraint fk_user_identities__user foreign key/,
  );
  assert.match(
    userIdentityMigration,
    /constraint uq_user_identities__authenticator_subject unique/,
  );
  assert.match(
    userIdentityMigration,
    /create trigger trg_user_identities__integrity/,
  );
  assert.doesNotMatch(
    userIdentityMigration,
    /\binsert\s+into\s+user_identities\b/i,
  );
  assert.doesNotMatch(
    userIdentityMigration,
    /\b(?:gen_random_uuid|uuid_generate_v4)\s*\(/i,
  );

  const forbiddenUserIdentityColumns = [
    "provider",
    "provider_name",
    "email",
    "phone",
    "credential",
    "token",
    "secret",
    "assurance",
    "metadata",
    "payload",
    "audit",
    "history",
    "normalized_subject",
    "reassignment_marker",
  ];
  assert.equal(
    userIdentityColumns.some(({ column_name }) =>
      forbiddenUserIdentityColumns.includes(column_name),
    ),
    false,
  );

  const forbiddenEditorialColumns = [
    "staff_key",
    "subject",
    "username",
    "email",
    "display_name",
    "provider_subject",
    "user_id",
    "profile",
  ];
  assert.equal(
    editorialColumns.some(({ column_name }) =>
      forbiddenEditorialColumns.includes(column_name),
    ),
    false,
  );

  const editorialMigration = await readFile(
    "drizzle/0011_editorial_identity_foundation.sql",
    "utf8",
  );
  assert.match(
    editorialMigration,
    /create table if not exists editorial_users/,
  );
  assert.doesNotMatch(
    editorialMigration,
    /\binsert\s+into\s+editorial_users\b/i,
  );
  const journal = JSON.parse(
    await readFile("drizzle/meta/_journal.json", "utf8"),
  );
  assert.deepEqual(
    journal.entries.slice(0, 10).map(({ idx, tag }) => [idx, tag]),
    [
      [0, "0000_foundation"],
      [1, "0001_global_locales_geography"],
      [2, "0002_content_integrity_foundation"],
      [3, "0003_fix_m4_source_reference_trigger"],
      [4, "0004_quran_data_model"],
      [5, "0005_license_publication_rights_separation"],
      [6, "0006_license_version_immutability"],
      [7, "0007_m5_publication_trigger_table_branching"],
      [8, "0008_atomic_quran_release_selector"],
      [9, "0009_arc005_insert_activation_validation"],
    ],
  );
  assert.deepEqual(journal.entries.at(-4), {
    idx: 10,
    version: "7",
    when: 1785796810000,
    tag: "0011_editorial_identity_foundation",
    breakpoints: true,
  });
  assert.deepEqual(journal.entries.at(-3), {
    idx: 11,
    version: "7",
    when: 1785796811000,
    tag: "0012_ke2a_topics",
    breakpoints: true,
  });
  assert.deepEqual(journal.entries.at(-2), {
    idx: 12,
    version: "7",
    when: 1785796812000,
    tag: "0013_public_identity_account_root",
    breakpoints: true,
  });
  assert.deepEqual(journal.entries.at(-1), {
    idx: 13,
    version: "7",
    when: 1785796813000,
    tag: "0014_public_identity_authentication_linkage",
    breakpoints: true,
  });

  const runtimeFiles = (
    await Promise.all(
      ["src/app", "src/components", "src/lib", "scripts"].map(
        listFilesRecursively,
      ),
    )
  )
    .flat()
    .filter(
      (path) =>
        path !== join("scripts", "db-verify.mjs") &&
        !path.endsWith(join("src", "lib", "knowledge", "collections.ts")) &&
        !path.endsWith(join("src", "lib", "knowledge", "references.ts")) &&
        !path.endsWith(
          join("src", "lib", "knowledge", "adapters", "duas.ts"),
        ) &&
        /\.(?:[cm]?[jt]sx?)$/.test(path),
    );
  for (const path of runtimeFiles) {
    const content = await readFile(path, "utf8");
    assert.doesNotMatch(
      content,
      /\busers\b|\buserRoot\b|\buserIdentities\b|\buser_identities\b/,
      `Public Identity root runtime reference in ${path}`,
    );
  }

  const locales = await queryClient`
    select code, id::text, language_tag, direction, native_name, fallback_locale_id
    from locales order by code
  `;
  assert.equal(locales.length, 2);
  assert.deepEqual(
    locales.map(({ code, direction }) => [code, direction]),
    [
      ["ar", "rtl"],
      ["en", "ltr"],
    ],
  );
  for (const locale of locales) {
    assert.equal(uuidVersion(locale.id), 7);
    assert.equal(locale.fallback_locale_id, null);
  }
  assert.equal(
    locales.find(({ code }) => code === "ar")?.native_name,
    "العربية",
  );
  assert.equal(
    (await queryClient`select count(*)::int as count from geographic_areas`)[0]
      ?.count,
    0,
  );

  await expectDatabaseRejection(
    "invalid locale direction",
    async (transaction) => {
      await transaction`update locales set direction = 'top' where code = 'en'`;
    },
  );
  await expectDatabaseRejection("locale self-fallback", async (transaction) => {
    await transaction`update locales set fallback_locale_id = id where code = 'en'`;
  });
  await expectDatabaseRejection(
    "multi-level locale fallback cycle",
    async (transaction) => {
      await transaction`set constraints all deferred`;
      await transaction`insert into locales (id, code, language_tag, language_code, direction, display_name, native_name) values
      (${ids.localeA}::uuid, 'x-a', 'x-a', 'xa', 'ltr', 'A', 'A'),
      (${ids.localeB}::uuid, 'x-b', 'x-b', 'xb', 'ltr', 'B', 'B'),
      (${ids.localeC}::uuid, 'x-c', 'x-c', 'xc', 'ltr', 'C', 'C')`;
      await transaction`update locales set fallback_locale_id = case id
      when ${ids.localeA}::uuid then ${ids.localeB}::uuid
      when ${ids.localeB}::uuid then ${ids.localeC}::uuid
      when ${ids.localeC}::uuid then ${ids.localeA}::uuid end
      where id in (${ids.localeA}::uuid, ${ids.localeB}::uuid, ${ids.localeC}::uuid)`;
    },
  );

  const insertCountry = (transaction) => transaction`
    insert into geographic_areas (id, area_type, country_code, slug, display_name, timezone)
    values (${ids.country}::uuid, 'country', 'NO', 'norway', 'Norway', 'Europe/Oslo')
  `;
  const insertRegion = (transaction) => transaction`
    insert into geographic_areas (id, parent_id, area_type, country_code, subdivision_code, slug, display_name, timezone)
    values (${ids.region}::uuid, ${ids.country}::uuid, 'region', 'NO', 'NO-11', 'rogaland', 'Rogaland', 'Europe/Oslo')
  `;
  const insertCity = (transaction) => transaction`
    insert into geographic_areas (id, parent_id, area_type, country_code, city_code, slug, display_name, timezone, latitude, longitude)
    values (${ids.city}::uuid, ${ids.region}::uuid, 'city', 'NO', 'stavanger', 'stavanger', 'Stavanger', 'Europe/Oslo', 58.970000, 5.733000)
  `;

  await expectDatabaseRejection(
    "geographic self-parent",
    async (transaction) => {
      await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name, timezone)
      values (${ids.city}::uuid, ${ids.city}::uuid, 'city', 'NO', 'self', 'Self', 'Europe/Oslo')`;
    },
  );
  await expectDatabaseRejection(
    "invalid hierarchy type",
    async (transaction) => {
      await insertCountry(transaction);
      await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name)
      values (${ids.region}::uuid, ${ids.country}::uuid, 'country', 'SE', 'invalid', 'Invalid')`;
    },
  );
  await expectDatabaseRejection(
    "country-code inconsistency",
    async (transaction) => {
      await insertCountry(transaction);
      await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name)
      values (${ids.region}::uuid, ${ids.country}::uuid, 'region', 'SE', 'invalid', 'Invalid')`;
    },
  );
  await expectDatabaseRejection("invalid latitude", async (transaction) => {
    await insertCountry(transaction);
    await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name, timezone, latitude)
      values (${ids.city}::uuid, ${ids.country}::uuid, 'city', 'NO', 'invalid-lat', 'Invalid', 'Europe/Oslo', 91)`;
  });
  await expectDatabaseRejection("invalid longitude", async (transaction) => {
    await insertCountry(transaction);
    await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name, timezone, longitude)
      values (${ids.city}::uuid, ${ids.country}::uuid, 'city', 'NO', 'invalid-lon', 'Invalid', 'Europe/Oslo', 181)`;
  });
  await expectDatabaseRejection(
    "city without timezone",
    async (transaction) => {
      await insertCountry(transaction);
      await transaction`insert into geographic_areas (id, parent_id, area_type, country_code, slug, display_name)
      values (${ids.city}::uuid, ${ids.country}::uuid, 'city', 'NO', 'no-timezone', 'Invalid')`;
    },
  );
  await expectDatabaseRejection(
    "multi-level geographic cycle",
    async (transaction) => {
      await transaction`set constraints all deferred`;
      await insertCountry(transaction);
      await insertRegion(transaction);
      await insertCity(transaction);
      await transaction`update geographic_areas set parent_id = ${ids.city}::uuid where id = ${ids.country}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "parent deletion with descendants",
    async (transaction) => {
      await insertCountry(transaction);
      await insertRegion(transaction);
      await transaction`delete from geographic_areas where id = ${ids.country}::uuid`;
    },
  );

  const m4Tables = [
    "licenses",
    "works",
    "editions",
    "passages",
    "passage_texts",
    "content_items",
    "content_revisions",
    "source_references",
  ];
  for (const table of m4Tables) {
    assert.equal(
      (
        await queryClient`select count(*)::int as count from ${queryClient(table)}`
      )[0]?.count,
      0,
    );
  }

  const m5Tables = [
    "quran_surahs",
    "quran_ayahs",
    "quran_ayah_texts",
    "quran_structural_markers",
    "quran_translation_editions",
    "quran_translation_texts",
  ];
  for (const table of m5Tables) {
    assert.equal(
      (
        await queryClient`select count(*)::int as count from ${queryClient(table)}`
      )[0]?.count,
      0,
    );
  }

  const extension =
    await queryClient`select extname from pg_extension where extname = 'pgcrypto'`;
  assert.equal(extension.length, 1);
  const licenseColumns = await queryClient`
    select column_name, column_default, is_nullable
    from information_schema.columns
    where table_schema='public' and table_name='licenses'
      and column_name in ('redistribution_allowed','standalone_redistribution_allowed','in_application_display_allowed')
    order by column_name
  `;
  assert.deepEqual(
    licenseColumns.map(({ column_name }) => column_name),
    ["in_application_display_allowed", "standalone_redistribution_allowed"],
  );
  assert.equal(licenseColumns[0]?.is_nullable, "NO");
  assert.match(licenseColumns[0]?.column_default ?? "", /false/);

  const arc001Migration = await readFile(
    "drizzle/0005_license_publication_rights_separation.sql",
    "utf8",
  );
  await assert.rejects(
    () =>
      queryClient.begin(async (transaction) => {
        const migrationLicenseId = "0198a7b0-3500-7000-8000-000000000001";
        await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,standalone_redistribution_allowed,effective_from,status)
          values(${migrationLicenseId}::uuid,'synthetic','arc001-migration','1','ARC-001 migration fixture','permission','Synthetic attribution','permanent',true,current_timestamp-'1 day'::interval,'active')`;
        await transaction.unsafe(
          "alter table licenses rename column standalone_redistribution_allowed to redistribution_allowed",
        );
        await transaction.unsafe(arc001Migration);
        const migrated = (
          await transaction`select standalone_redistribution_allowed,in_application_display_allowed from licenses where id=${migrationLicenseId}::uuid`
        )[0];
        assert.equal(migrated?.standalone_redistribution_allowed, true);
        assert.equal(migrated?.in_application_display_allowed, false);
        throw new Error("ARC-001 migration preservation rollback");
      }),
    /ARC-001 migration preservation rollback/,
  );
  const fks = await queryClient`
    select count(*)::int as count from pg_constraint c
    join pg_namespace n on n.oid=c.connamespace
    join pg_class source_table on source_table.oid=c.conrelid
    where n.nspname='public'
      and c.contype='f'
      and source_table.relname in (
        'licenses',
        'works',
        'editions',
        'passages',
        'passage_texts',
        'content_items',
        'content_revisions',
        'source_references'
      )
  `;
  assert.equal(fks[0]?.count, 12);

  await queryClient
    .begin(async (transaction) => {
      await transaction`set constraints all deferred`;
      const ids4 = {
        license: "0198a7b0-4000-7000-8000-000000000001",
        work: "0198a7b0-4000-7000-8000-000000000002",
        edition: "0198a7b0-4000-7000-8000-000000000003",
        passage: "0198a7b0-4000-7000-8000-000000000004",
        text: "0198a7b0-4000-7000-8000-000000000005",
        item: "0198a7b0-4000-7000-8000-000000000006",
        revision: "0198a7b0-4000-7000-8000-000000000007",
        source: "0198a7b0-4000-7000-8000-000000000008",
      };
      const arabic = "اللَّهُمَّ اهْدِنَا\r\nإِلَى الْخَيْرِ";
      const sums = (
        await transaction`select alsamad_exact_sha256(${arabic}) exact, alsamad_normalized_sha256(${arabic}) normalized`
      )[0];
      assert.notEqual(sums.exact, sums.normalized);
      await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
      values(${ids4.license}::uuid,'fixture','rights','1','Fixture rights','permission','Fixture attribution','permanent',true,true,current_timestamp-'1 day'::interval,'active')`;
      await transaction`insert into works(id,canonical_key,work_type,title,original_language_code) values(${ids4.work}::uuid,'fixture-work','reference_work','Fixture work','ar')`;
      await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
      values(${ids4.edition}::uuid,${ids4.work}::uuid,${ids4.license}::uuid,'canonical-edition','1','ar','Arab','Fixture edition','fixture','external-alias','snapshot-1',repeat('a',64))`;
      await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${ids4.edition}::uuid`;
      await transaction`insert into passages(id,work_id,canonical_locator,passage_type,sequence_number,depth) values(${ids4.passage}::uuid,${ids4.work}::uuid,'1','entry',1,0)`;
      await transaction`insert into passage_texts(id,edition_id,passage_id,text_content,normalized_checksum,source_checksum,publication_state,published_at)
      values(${ids4.text}::uuid,${ids4.edition}::uuid,${ids4.passage}::uuid,${arabic},${sums.normalized},${sums.exact},'published',current_timestamp)`;
      assert.equal(
        (
          await transaction`select text_content from passage_texts where id=${ids4.text}::uuid`
        )[0]?.text_content,
        arabic,
      );
      await transaction`insert into content_items(id,canonical_key,content_type,origin_kind,owning_module) values(${ids4.item}::uuid,'fixture-article','article','canonical_source','knowledge')`;
      await transaction`insert into content_revisions(id,content_item_id,revision_number,source_text,source_language_code,verification_state,publication_state,provenance_kind,content_checksum,published_at)
      values(${ids4.revision}::uuid,${ids4.item}::uuid,1,${arabic},'ar','source_verified','published','manual',${sums.normalized},current_timestamp)`;
      await transaction`insert into source_references(id,content_revision_id,cited_work_id,cited_edition_id,cited_passage_id,reference_role,locator_label)
      values(${ids4.source}::uuid,${ids4.revision}::uuid,${ids4.work}::uuid,${ids4.edition}::uuid,${ids4.passage}::uuid,'primary_source','Fixture 1')`;
      await transaction`set constraints all immediate`;
      throw new Error("M4 fixture rollback");
    })
    .catch((error) => assert.equal(error.message, "M4 fixture rollback"));

  await expectDatabaseRejection("checksum mismatch", async (transaction) => {
    await transaction`insert into content_items(id,canonical_key,content_type,origin_kind,owning_module) values('0198a7b0-5000-7000-8000-000000000001','bad-checksum','article','canonical_source','knowledge')`;
    await transaction`insert into content_revisions(id,content_item_id,revision_number,source_text,source_language_code,provenance_kind,content_checksum) values('0198a7b0-5000-7000-8000-000000000002','0198a7b0-5000-7000-8000-000000000001',1,'نص','ar','manual',repeat('0',64))`;
  });
  await expectDatabaseRejection(
    "revision sequence gap",
    async (transaction) => {
      await transaction`insert into content_items(id,canonical_key,content_type,origin_kind,owning_module) values('0198a7b0-5000-7000-8000-000000000003','gap','article','canonical_source','knowledge')`;
      await transaction`insert into content_revisions(id,content_item_id,revision_number,source_text,source_language_code,provenance_kind,content_checksum) values('0198a7b0-5000-7000-8000-000000000004','0198a7b0-5000-7000-8000-000000000003',2,'text','en','manual',alsamad_normalized_sha256('text'))`;
    },
  );

  // ARC-004: license-version immutability and historical license evidence.
  {
    const arc004LicenseId = "0198a7b0-6600-7000-8000-000000000001";
    const arc004LicenseV2Id = "0198a7b0-6600-7000-8000-000000000002";
    const arc004WorkId = "0198a7b0-6600-7000-8000-000000000003";
    const arc004EditionId = "0198a7b0-6600-7000-8000-000000000004";

    await queryClient`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,retention_days,terms_url,in_application_display_allowed,standalone_redistribution_allowed,derivatives_allowed,effective_from,effective_until,status)
      values(${arc004LicenseId}::uuid,'arc004','immutability','1','ARC-004 fixture','permission','Original attribution','permanent',null,null,true,true,false,current_timestamp-'1 day'::interval,null,'draft')`;

    // 1. A pre-active (draft) license may still be authored/corrected freely.
    await queryClient`update licenses set rights_scope='open_license' where id=${arc004LicenseId}::uuid`;
    assert.equal(
      (
        await queryClient`select rights_scope from licenses where id=${arc004LicenseId}::uuid`
      )[0]?.rights_scope,
      "open_license",
    );
    await queryClient`update licenses set rights_scope='permission' where id=${arc004LicenseId}::uuid`;

    await queryClient`update licenses set status='active' where id=${arc004LicenseId}::uuid`;

    // 2-10. Once first active/relied upon, every rights-bearing field is frozen.
    await expectDatabaseRejection(
      "license rights_scope immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set rights_scope='open_license' where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license attribution_text immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set attribution_text='Changed attribution' where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license terms_url immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set terms_url='https://example.org/updated-terms' where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license retention_policy immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set retention_policy='time_limited',retention_days=30 where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license retention_days immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set retention_policy='time_limited',retention_days=30 where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license in_application_display_allowed immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set in_application_display_allowed=false where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license standalone_redistribution_allowed immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set standalone_redistribution_allowed=false where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license derivatives_allowed immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set derivatives_allowed=true where id=${arc004LicenseId}::uuid`;
      },
    );
    await expectDatabaseRejection(
      "license effective_until immutable after reliance",
      async (transaction) => {
        await transaction`update licenses set effective_until=current_timestamp+'30 days'::interval where id=${arc004LicenseId}::uuid`;
      },
    );

    // 11. Permitted lifecycle status transitions remain unaffected.
    await queryClient`update licenses set status='expired' where id=${arc004LicenseId}::uuid`;

    // 13. Historical rights content remains unchanged even after the status transition.
    const arc004After = (
      await queryClient`select rights_scope,attribution_text,terms_url,retention_policy,retention_days,in_application_display_allowed,standalone_redistribution_allowed,derivatives_allowed,effective_until,status from licenses where id=${arc004LicenseId}::uuid`
    )[0];
    assert.equal(arc004After?.rights_scope, "permission");
    assert.equal(arc004After?.attribution_text, "Original attribution");
    assert.equal(arc004After?.terms_url, null);
    assert.equal(arc004After?.retention_policy, "permanent");
    assert.equal(arc004After?.retention_days, null);
    assert.equal(arc004After?.in_application_display_allowed, true);
    assert.equal(arc004After?.standalone_redistribution_allowed, true);
    assert.equal(arc004After?.derivatives_allowed, false);
    assert.equal(arc004After?.effective_until, null);
    assert.equal(arc004After?.status, "expired");

    // 12. A later legal/provider revision is a new row under a new version.
    await queryClient`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
      values(${arc004LicenseV2Id}::uuid,'arc004','immutability','2','ARC-004 fixture v2','open_license','Revised attribution','permanent',true,true,current_timestamp,'active')`;

    // 14. Existing edition/license references to the historical row remain valid.
    await queryClient
      .begin(async (transaction) => {
        await transaction`insert into works(id,canonical_key,work_type,title,original_language_code) values(${arc004WorkId}::uuid,'arc004-fixture-work','reference_work','ARC-004 fixture work','ar')`;
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
          values(${arc004EditionId}::uuid,${arc004WorkId}::uuid,${arc004LicenseId}::uuid,'arc004-edition','1','ar','Arab','ARC-004 fixture edition','arc004','arc004-alias','snapshot-1',repeat('a',64))`;
        assert.equal(
          (
            await transaction`select license_id from editions where id=${arc004EditionId}::uuid`
          )[0]?.license_id,
          arc004LicenseId,
        );
        throw new Error("ARC-004 edition reference rollback");
      })
      .catch((error) =>
        assert.equal(error.message, "ARC-004 edition reference rollback"),
      );

    await queryClient`delete from licenses where id in (${arc004LicenseId}::uuid,${arc004LicenseV2Id}::uuid)`;
    console.log("PASS: ARC-004 license-version immutability enforced");
  }

  const insertM5Foundation = async (
    transaction,
    {
      inApplicationDisplayAllowed = true,
      standaloneRedistributionAllowed = true,
      status = "active",
      retentionPolicy = "permanent",
      futureEffectiveWindow = false,
    } = {},
  ) => {
    const fixture = {
      license: "0198a7b0-6000-7000-8000-000000000001",
      work: "0198a7b0-6000-7000-8000-000000000002",
      arabicEdition: "0198a7b0-6000-7000-8000-000000000003",
      translationEdition: "0198a7b0-6000-7000-8000-000000000004",
      rootPassage: "0198a7b0-6000-7000-8000-000000000005",
      surahPassage: "0198a7b0-6000-7000-8000-000000000006",
      ayahPassage: "0198a7b0-6000-7000-8000-000000000007",
      arabicPassageText: "0198a7b0-6000-7000-8000-000000000008",
      translatedPassageText: "0198a7b0-6000-7000-8000-000000000009",
      surah: "0198a7b0-6000-7000-8000-00000000000a",
      ayah: "0198a7b0-6000-7000-8000-00000000000b",
      ayahText: "0198a7b0-6000-7000-8000-00000000000c",
      marker: "0198a7b0-6000-7000-8000-00000000000d",
      translation: "0198a7b0-6000-7000-8000-00000000000e",
      translationText: "0198a7b0-6000-7000-8000-00000000000f",
    };
    const exactArabic = "نَصٌّ عَرَبِيٌّ تَجْرِيبِيٌّ\r\nغَيْرُ دِينِيٍّ";
    const translated = "Synthetic non-religious fixture";
    const checksums = (
      await transaction`select alsamad_exact_sha256(${exactArabic}) exact_arabic, alsamad_normalized_sha256(${exactArabic}) normalized_arabic, alsamad_exact_sha256(${translated}) exact_translation, alsamad_normalized_sha256(${translated}) normalized_translation`
    )[0];
    await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
      values(${fixture.license}::uuid,'synthetic','m5-test','1','Synthetic test license','permission','Synthetic attribution',${retentionPolicy},${inApplicationDisplayAllowed},${standaloneRedistributionAllowed},current_timestamp + ${futureEffectiveWindow ? "1 day" : "-1 day"}::interval,${status})`;
    await transaction`insert into works(id,canonical_key,work_type,title,original_language_code) values(${fixture.work}::uuid,'synthetic-quran-work','quran','Synthetic Quran-shaped work','ar')`;
    await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
      values(${fixture.arabicEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'synthetic-ar','1','ar','Arab','Synthetic Arabic edition','synthetic','ar-alias','test-v1',repeat('a',64)),
      (${fixture.translationEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'synthetic-en','1','en','Latn','Synthetic translation edition','synthetic','en-alias','test-v1',repeat('b',64))`;
    await transaction`insert into passages(id,work_id,parent_passage_id,canonical_locator,passage_type,sequence_number,depth) values
      (${fixture.rootPassage}::uuid,${fixture.work}::uuid,null,'quran','work',1,0),
      (${fixture.surahPassage}::uuid,${fixture.work}::uuid,${fixture.rootPassage}::uuid,'surah:1','chapter',1,1),
      (${fixture.ayahPassage}::uuid,${fixture.work}::uuid,${fixture.surahPassage}::uuid,'1:1','verse',1,2)`;
    await transaction`insert into passage_texts(id,edition_id,passage_id,text_content,normalized_checksum,source_checksum) values
      (${fixture.arabicPassageText}::uuid,${fixture.arabicEdition}::uuid,${fixture.ayahPassage}::uuid,${exactArabic},${checksums.normalized_arabic},${checksums.exact_arabic}),
      (${fixture.translatedPassageText}::uuid,${fixture.translationEdition}::uuid,${fixture.ayahPassage}::uuid,${translated},${checksums.normalized_translation},${checksums.exact_translation})`;
    await transaction`insert into quran_surahs(id,work_id,passage_id,canonical_key,surah_number,ayah_count,name_arabic,source_record_checksum)
      values(${fixture.surah}::uuid,${fixture.work}::uuid,${fixture.surahPassage}::uuid,'quran:surah:1',1,1,'اسم تجريبي',repeat('c',64))`;
    await transaction`insert into quran_ayahs(id,surah_id,passage_id,canonical_key,ayah_number,global_sequence_number,source_record_checksum)
      values(${fixture.ayah}::uuid,${fixture.surah}::uuid,${fixture.ayahPassage}::uuid,'quran:ayah:1:1',1,1,repeat('d',64))`;
    await transaction`insert into quran_ayah_texts(id,edition_id,ayah_id,passage_text_id,source_record_checksum)
      values(${fixture.ayahText}::uuid,${fixture.arabicEdition}::uuid,${fixture.ayah}::uuid,${fixture.arabicPassageText}::uuid,repeat('e',64))`;
    await transaction`insert into quran_structural_markers(id,edition_id,marker_kind,marker_number,canonical_key,start_ayah_id,end_ayah_id,source_record_checksum)
      values(${fixture.marker}::uuid,${fixture.arabicEdition}::uuid,'juz',1,'juz:1',${fixture.ayah}::uuid,${fixture.ayah}::uuid,repeat('f',64))`;
    await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology)
      select ${fixture.translation}::uuid,${fixture.translationEdition}::uuid,id,${fixture.license}::uuid,'Synthetic Translator','Synthetic test methodology' from locales where code='en'`;
    await transaction`insert into quran_translation_texts(id,translation_edition_id,ayah_id,passage_text_id,source_record_checksum)
      values(${fixture.translationText}::uuid,${fixture.translation}::uuid,${fixture.ayah}::uuid,${fixture.translatedPassageText}::uuid,repeat('1',64))`;
    assert.equal(
      (
        await transaction`select text_content from passage_texts where id=${fixture.arabicPassageText}::uuid`
      )[0]?.text_content,
      exactArabic,
    );
    for (const value of Object.values(fixture))
      assert.equal(uuidVersion(value), 7);
    return fixture;
  };

  await assert.rejects(
    () =>
      queryClient.begin(async (transaction) => {
        await transaction`set constraints all deferred`;
        await insertM5Foundation(transaction);
        await transaction`set constraints all immediate`;
        throw new Error("M5 fixture rollback");
      }),
    /M5 fixture rollback/,
  );
  for (const table of m5Tables) {
    assert.equal(
      (
        await queryClient`select count(*)::int as count from ${queryClient(table)}`
      )[0]?.count,
      0,
    );
  }

  await queryClient
    .begin(async (transaction) => {
      const fixture = await insertM5Foundation(transaction, {
        standaloneRedistributionAllowed: false,
      });
      await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${fixture.arabicEdition}::uuid`;
      assert.equal(
        (
          await transaction`select publication_state from editions where id=${fixture.arabicEdition}::uuid`
        )[0]?.publication_state,
        "published",
      );
      throw new Error("ARC-001 publication success rollback");
    })
    .catch((error) =>
      assert.equal(error.message, "ARC-001 publication success rollback"),
    );

  for (const [label, licenseOptions] of [
    [
      "application display denied despite standalone redistribution",
      {
        inApplicationDisplayAllowed: false,
        standaloneRedistributionAllowed: true,
      },
    ],
    [
      "application display and standalone redistribution both denied",
      {
        inApplicationDisplayAllowed: false,
        standaloneRedistributionAllowed: false,
      },
    ],
    ["inactive license", { status: "draft" }],
    ["expired license", { status: "expired" }],
    ["revoked license", { status: "revoked" }],
    ["no-storage license", { retentionPolicy: "no_storage" }],
    ["future license window", { futureEffectiveWindow: true }],
  ]) {
    await expectDatabaseRejection(label, async (transaction) => {
      const fixture = await insertM5Foundation(transaction, licenseOptions);
      await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${fixture.arabicEdition}::uuid`;
    });
  }

  await expectDatabaseRejection("invalid surah number", async (transaction) => {
    await transaction`insert into quran_surahs(id,work_id,passage_id,canonical_key,surah_number,ayah_count,name_arabic,source_record_checksum)
      values('0198a7b0-7000-7000-8000-000000000001','0198a7b0-7000-7000-8000-000000000002','0198a7b0-7000-7000-8000-000000000003','quran:surah:115',115,1,'Synthetic',repeat('a',64))`;
  });
  await expectDatabaseRejection("invalid ayah number", async (transaction) => {
    const fixture = await insertM5Foundation(transaction);
    await transaction`update quran_ayahs set ayah_number=2,canonical_key='quran:ayah:1:2' where id=${fixture.ayah}::uuid`;
  });
  await expectDatabaseRejection(
    "duplicate ayah locator",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`insert into quran_ayahs(id,surah_id,passage_id,canonical_key,ayah_number,global_sequence_number,source_record_checksum)
      values('0198a7b0-7000-7000-8000-000000000004',${fixture.surah}::uuid,${fixture.ayahPassage}::uuid,'quran:ayah:1:1',1,2,repeat('a',64))`;
    },
  );
  await expectDatabaseRejection("ayah surah mismatch", async (transaction) => {
    const fixture = await insertM5Foundation(transaction);
    await transaction`update passages set canonical_locator='2:1' where id=${fixture.ayahPassage}::uuid`;
  });
  await expectDatabaseRejection(
    "invalid structural marker",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`update quran_structural_markers set end_ayah_id=null where id=${fixture.marker}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "translation edition linkage",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`update quran_translation_editions set license_id='0198a7b0-7000-7000-8000-000000000005' where id=${fixture.translation}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "translation text uniqueness",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`insert into quran_translation_texts(id,translation_edition_id,ayah_id,passage_text_id,source_record_checksum)
        values('0198a7b0-7000-7000-8000-000000000006',${fixture.translation}::uuid,${fixture.ayah}::uuid,${fixture.translatedPassageText}::uuid,repeat('a',64))`;
    },
  );
  await expectDatabaseRejection("M5 checksum mismatch", async (transaction) => {
    const fixture = await insertM5Foundation(transaction);
    await transaction`update quran_surahs set source_record_checksum='bad' where id=${fixture.surah}::uuid`;
  });
  await expectDatabaseRejection(
    "M5 publication eligibility",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`update quran_surahs set publication_state='published',published_at=current_timestamp where id=${fixture.surah}::uuid`;
    },
  );
  await expectDatabaseRejection(
    "M5 restrictive deletion",
    async (transaction) => {
      const fixture = await insertM5Foundation(transaction);
      await transaction`delete from quran_surahs where id=${fixture.surah}::uuid`;
    },
  );

  // AUD-001: M5 publication trigger table-branching correction.
  {
    const aud001WorkId = "0198a7b0-9000-7000-8000-000000000001";
    const aud001LicenseId = "0198a7b0-9000-7000-8000-000000000002";
    const aud001EditionId = "0198a7b0-9000-7000-8000-000000000003";
    const aud001RootPassageId = "0198a7b0-9000-7000-8000-000000000004";

    const expectPublicationRejection = async (
      label,
      operation,
      messagePattern,
    ) => {
      let caught;
      try {
        await queryClient.begin(operation);
      } catch (error) {
        caught = error;
      }
      assert.ok(caught, `expected rejection: ${label}`);
      assert.match(caught.message, messagePattern, label);
      assert.doesNotMatch(
        caught.message,
        /has no field/,
        `${label}: must not be the AUD-001 cross-table field-resolution crash`,
      );
      assert.equal(caught.code, "23514", `${label} errcode`);
      console.log(`PASS rejection: ${label}`);
    };

    // 1. Regression proof: quran_ayahs publication no longer crashes with
    // SQLSTATE 42703 ("record new has no field work_id"); it fails closed
    // with its own intended validation message instead.
    await expectPublicationRejection(
      "AUD-001 quran_ayahs publication rejected cleanly when surah is not published",
      async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update quran_ayahs set publication_state='published',published_at=current_timestamp where id=${fixture.ayah}::uuid`;
      },
      /Quran ayah publication is not eligible/,
    );
    for (const table of m5Tables) {
      assert.equal(
        (
          await queryClient`select count(*)::int as count from ${queryClient(table)}`
        )[0]?.count,
        0,
      );
    }

    // 2. Regression proof: quran_structural_markers publication no longer
    // crashes with SQLSTATE 42703; it fails closed with its own message.
    await expectPublicationRejection(
      "AUD-001 quran_structural_markers publication rejected cleanly when edition is not published",
      async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update quran_structural_markers set publication_state='published',published_at=current_timestamp where id=${fixture.marker}::uuid`;
      },
      /Quran marker publication is not eligible/,
    );
    for (const table of m5Tables) {
      assert.equal(
        (
          await queryClient`select count(*)::int as count from ${queryClient(table)}`
        )[0]?.count,
        0,
      );
    }

    // 3. quran_surahs invalid-publication behavior is unchanged by the
    // table-branching correction.
    await expectPublicationRejection(
      "AUD-001 quran_surahs publication rejected cleanly when reconciliation fails",
      async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update quran_surahs set publication_state='published',published_at=current_timestamp where id=${fixture.surah}::uuid`;
      },
      /Quran surah publication is not eligible/,
    );
    for (const table of m5Tables) {
      assert.equal(
        (
          await queryClient`select count(*)::int as count from ${queryClient(table)}`
        )[0]?.count,
        0,
      );
    }

    // 4. Valid quran_structural_markers publication still succeeds once its
    // edition is published.
    await queryClient
      .begin(async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${fixture.arabicEdition}::uuid`;
        await transaction`update quran_structural_markers set publication_state='published',published_at=current_timestamp where id=${fixture.marker}::uuid`;
        assert.equal(
          (
            await transaction`select publication_state from quran_structural_markers where id=${fixture.marker}::uuid`
          )[0]?.publication_state,
          "published",
        );
        throw new Error("AUD-001 marker publication success rollback");
      })
      .catch((error) =>
        assert.equal(
          error.message,
          "AUD-001 marker publication success rollback",
        ),
      );
    for (const table of m5Tables) {
      assert.equal(
        (
          await queryClient`select count(*)::int as count from ${queryClient(table)}`
        )[0]?.count,
        0,
      );
    }

    // 5-7. Valid quran_surahs publication (full 114-surah reconciliation)
    // succeeds, and once a surah is published, valid quran_ayahs publication
    // for an ayah under that surah also succeeds — proving neither branch
    // leaks a column reference belonging to another table.
    await queryClient
      .begin(async (transaction) => {
        await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
          values(${aud001LicenseId}::uuid,'synthetic','aud-001-full-114','1','Synthetic AUD-001 full-114 license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,'active')`;
        await transaction`insert into works(id,canonical_key,work_type,title,original_language_code) values(${aud001WorkId}::uuid,'aud-001-full-114-work','quran','Synthetic AUD-001 full 114-surah work','ar')`;
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
          values(${aud001EditionId}::uuid,${aud001WorkId}::uuid,${aud001LicenseId}::uuid,'aud-001-full-114-ar','1','ar','Arab','Synthetic AUD-001 full Arabic edition','synthetic','aud-001-ar-alias','test-v1',repeat('a',64))`;
        await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${aud001EditionId}::uuid`;
        await transaction`insert into passages(id,work_id,parent_passage_id,canonical_locator,passage_type,sequence_number,depth) values (${aud001RootPassageId}::uuid,${aud001WorkId}::uuid,null,'aud-001-quran-114','work',1,0)`;

        const ayahIds = [];
        for (let n = 1; n <= 114; n += 1) {
          const suffix = n.toString(16).padStart(12, "0");
          const surahPassageId = `0198a7b0-9100-7000-8000-${suffix}`;
          const ayahPassageId = `0198a7b0-9200-7000-8000-${suffix}`;
          const surahId = `0198a7b0-9300-7000-8000-${suffix}`;
          const ayahId = `0198a7b0-9400-7000-8000-${suffix}`;
          await transaction`insert into passages(id,work_id,parent_passage_id,canonical_locator,passage_type,sequence_number,depth) values (${surahPassageId}::uuid,${aud001WorkId}::uuid,${aud001RootPassageId}::uuid,${"surah:" + n},'chapter',${n},1)`;
          await transaction`insert into quran_surahs(id,work_id,passage_id,canonical_key,surah_number,ayah_count,name_arabic,source_record_checksum) values (${surahId}::uuid,${aud001WorkId}::uuid,${surahPassageId}::uuid,${"quran:surah:" + n},${n},1,'اسم',repeat('c',64))`;
          await transaction`insert into passages(id,work_id,parent_passage_id,canonical_locator,passage_type,sequence_number,depth) values (${ayahPassageId}::uuid,${aud001WorkId}::uuid,${surahPassageId}::uuid,${n + ":1"},'verse',1,2)`;
          await transaction`insert into quran_ayahs(id,surah_id,passage_id,canonical_key,ayah_number,global_sequence_number,source_record_checksum) values (${ayahId}::uuid,${surahId}::uuid,${ayahPassageId}::uuid,${"quran:ayah:" + n + ":1"},1,${n},repeat('d',64))`;
          ayahIds.push(ayahId);
        }

        await transaction`update quran_surahs set publication_state='published',published_at=current_timestamp where work_id=${aud001WorkId}::uuid`;
        assert.equal(
          (
            await transaction`select count(*)::int as count from quran_surahs where work_id=${aud001WorkId}::uuid and publication_state='published'`
          )[0]?.count,
          114,
        );

        await transaction`update quran_ayahs set publication_state='published',published_at=current_timestamp where id=${ayahIds[0]}::uuid`;
        assert.equal(
          (
            await transaction`select publication_state from quran_ayahs where id=${ayahIds[0]}::uuid`
          )[0]?.publication_state,
          "published",
        );

        throw new Error("AUD-001 full publication success rollback");
      })
      .catch((error) =>
        assert.equal(
          error.message,
          "AUD-001 full publication success rollback",
        ),
      );
    assert.equal(
      (
        await queryClient`select count(*)::int as count from quran_surahs where work_id=${aud001WorkId}::uuid`
      )[0]?.count,
      0,
    );
    assert.equal(
      (
        await queryClient`select count(*)::int as count from works where id=${aud001WorkId}::uuid`
      )[0]?.count,
      0,
    );
    assert.equal(
      (
        await queryClient`select count(*)::int as count from licenses where id=${aud001LicenseId}::uuid`
      )[0]?.count,
      0,
    );

    console.log(
      "PASS: AUD-001 M5 publication trigger table-branching corrected for quran_surahs, quran_ayahs, and quran_structural_markers",
    );
  }

  // ARC-005: Atomic Quran release selector and publication consistency.
  {
    const publishEligibleFixture = async (transaction, licenseOptions) => {
      const fixture = await insertM5Foundation(transaction, licenseOptions);
      await transaction`update editions set publication_state='published',published_at=current_timestamp where id in (${fixture.arabicEdition}::uuid,${fixture.translationEdition}::uuid)`;
      await transaction`update quran_translation_editions set review_status='approved',reviewed_at=current_timestamp where id=${fixture.translation}::uuid`;
      return fixture;
    };

    // 1-3, 8-10: zero/one active Arabic candidate, second blocked, and
    // activation-eligibility gates (unpublished, unapproved translation).
    await queryClient
      .begin(async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${fixture.arabicEdition}::uuid`;
        assert.equal(
          (
            await transaction`select count(*)::int as c from editions where work_id=${fixture.work}::uuid and is_active_release`
          )[0]?.c,
          0,
          "zero active Arabic candidate is valid",
        );
        await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
        assert.equal(
          (
            await transaction`select is_active_release from editions where id=${fixture.arabicEdition}::uuid`
          )[0]?.is_active_release,
          true,
          "exactly one active Arabic candidate allowed",
        );

        // Sibling published Arabic edition for the same work competing for
        // the same selector scope must be blocked from also activating.
        const sibling = "0198a7b0-b000-7000-8000-000000000101";
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
          values(${sibling}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'sibling-ar','1','ar','Arab','Synthetic sibling Arabic edition','synthetic','ar-sibling-alias','test-v1',repeat('a',64))`;
        await transaction`update editions set publication_state='published',published_at=current_timestamp where id=${sibling}::uuid`;
        await assert.rejects(
          () =>
            transaction.savepoint(
              (sp) =>
                sp`update editions set is_active_release=true where id=${sibling}::uuid`,
            ),
          /duplicate key value violates unique constraint "uq_editions__active_release_per_work"/,
          "second simultaneous active Arabic candidate is blocked",
        );

        // Unapproved translation cannot activate.
        await assert.rejects(
          () =>
            transaction.savepoint(
              (sp) =>
                sp`update quran_translation_editions set is_active_release=true where id=${fixture.translation}::uuid`,
            ),
          /translation release activation requires an approved translation edition/,
          "activation of unapproved translation blocked",
        );

        throw new Error("ARC-005 Arabic uniqueness/gate rollback");
      })
      .catch((error) =>
        assert.equal(error.message, "ARC-005 Arabic uniqueness/gate rollback"),
      );

    // 4-7: zero/one active translation candidate, second blocked, and
    // independent locales may each have their own active candidate.
    await queryClient
      .begin(async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        assert.equal(
          (
            await transaction`select count(*)::int as c from quran_translation_editions where locale_id=(select id from locales where code='en') and is_active_release`
          )[0]?.c,
          0,
          "zero active translation candidate is valid",
        );
        await transaction`update quran_translation_editions set is_active_release=true where id=${fixture.translation}::uuid`;
        assert.equal(
          (
            await transaction`select is_active_release from quran_translation_editions where id=${fixture.translation}::uuid`
          )[0]?.is_active_release,
          true,
          "exactly one active translation candidate allowed per locale",
        );

        // Sibling approved translation edition for the same locale must be
        // blocked from also activating.
        const siblingEdition = "0198a7b0-b000-7000-8000-000000000102";
        const siblingTranslation = "0198a7b0-b000-7000-8000-000000000103";
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
          values(${siblingEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'sibling-en','1','en','Latn','Synthetic sibling translation edition','synthetic','en-sibling-alias','test-v1',repeat('b',64),'published',current_timestamp)`;
        await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at)
          select ${siblingTranslation}::uuid,${siblingEdition}::uuid,id,${fixture.license}::uuid,'Sibling Translator','Sibling methodology','approved',current_timestamp from locales where code='en'`;
        await assert.rejects(
          () =>
            transaction.savepoint(
              (sp) =>
                sp`update quran_translation_editions set is_active_release=true where id=${siblingTranslation}::uuid`,
            ),
          /duplicate key value violates unique constraint "uq_quran_translation_editions__active_release_per_locale"/,
          "second active translation for same locale blocked",
        );

        // A second, independent locale (Arabic) may have its own active
        // translation candidate without interacting with the English one.
        const arEdition = "0198a7b0-b000-7000-8000-000000000104";
        const arTranslation = "0198a7b0-b000-7000-8000-000000000105";
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
          values(${arEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'sibling-ar-translation','1','ar','Arab','Synthetic Arabic-locale translation edition','synthetic','ar-translation-alias','test-v1',repeat('c',64),'published',current_timestamp)`;
        await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at)
          select ${arTranslation}::uuid,${arEdition}::uuid,id,${fixture.license}::uuid,'Arabic Locale Translator','Arabic locale methodology','approved',current_timestamp from locales where code='ar'`;
        await transaction`update quran_translation_editions set is_active_release=true where id=${arTranslation}::uuid`;
        assert.equal(
          (
            await transaction`select is_active_release from quran_translation_editions where id in (${fixture.translation}::uuid,${arTranslation}::uuid)`
          ).every((row) => row.is_active_release === true),
          true,
          "different locales may have independent active translations",
        );

        throw new Error("ARC-005 translation uniqueness/locales rollback");
      })
      .catch((error) =>
        assert.equal(
          error.message,
          "ARC-005 translation uniqueness/locales rollback",
        ),
      );

    // 9: activation with a currently-ineligible (unpublished) Arabic edition
    // is blocked before any license check runs.
    await expectDatabaseRejection(
      "activation of unpublished Arabic candidate blocked",
      async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
      },
    );

    // 11: activation of a translation whose locale is disabled is blocked.
    await queryClient
      .begin(async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        const disabledLocale = "0198a7b0-b000-7000-8000-000000000106";
        const disabledEdition = "0198a7b0-b000-7000-8000-000000000107";
        const disabledTranslation = "0198a7b0-b000-7000-8000-000000000108";
        await transaction`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name,is_enabled,sort_order)
          values(${disabledLocale}::uuid,'xx-arc005','xx-ARC005','xx','ltr','Synthetic Disabled Locale','Synthetic',false,999)`;
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
          values(${disabledEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'disabled-locale-edition','1','xx',null,'Synthetic disabled-locale edition','synthetic','xx-alias','test-v1',repeat('d',64),'published',current_timestamp)`;
        await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at)
          values(${disabledTranslation}::uuid,${disabledEdition}::uuid,${disabledLocale}::uuid,${fixture.license}::uuid,'Disabled Locale Translator','Disabled locale methodology','approved',current_timestamp)`;
        await assert.rejects(
          () =>
            transaction`update quran_translation_editions set is_active_release=true where id=${disabledTranslation}::uuid`,
          /translation release activation requires an enabled locale/,
          "activation of translation with disabled locale blocked",
        );
        throw new Error("ARC-005 disabled locale rollback");
      })
      .catch((error) =>
        assert.equal(error.message, "ARC-005 disabled locale rollback"),
      );

    // 12: activation of a translation whose own backing generic edition was
    // never published is blocked (the natural state of a fresh M5 fixture's
    // `translationEdition`, which insertM5Foundation never publishes).
    await expectDatabaseRejection(
      "activation of translation with ineligible backing edition blocked",
      async (transaction) => {
        const fixture = await insertM5Foundation(transaction);
        await transaction`update quran_translation_editions set review_status='approved',reviewed_at=current_timestamp where id=${fixture.translation}::uuid`;
        await transaction`update quran_translation_editions set is_active_release=true where id=${fixture.translation}::uuid`;
      },
    );

    // Activation-time license eligibility: a license active at publish time
    // may later be revoked (an always-allowed safety operation); activation
    // must then re-check current eligibility, not the historical publish-time
    // gate. This also proves regression: revocation itself is unaffected.
    await expectDatabaseRejection(
      "activation with currently ineligible (revoked) license blocked",
      async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        await transaction`update licenses set status='revoked' where id=${fixture.license}::uuid`;
        await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
      },
    );

    // Regression: editions content/identity remain immutable once published;
    // only is_active_release (and the one-way withdrawal transition) may
    // change afterward.
    await expectDatabaseRejection(
      "published edition content remains immutable",
      async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        await transaction`update editions set display_name='mutated' where id=${fixture.arabicEdition}::uuid`;
      },
    );
    await queryClient
      .begin(async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
        assert.equal(
          (
            await transaction`select is_active_release,display_name from editions where id=${fixture.arabicEdition}::uuid`
          )[0]?.is_active_release,
          true,
          "is_active_release remains mutable on an already-published edition",
        );
        throw new Error("ARC-005 immutability exemption rollback");
      })
      .catch((error) =>
        assert.equal(error.message, "ARC-005 immutability exemption rollback"),
      );

    // 16, 19: a failed activation attempt leaves the prior active candidate
    // unchanged, and withdrawal deterministically clears the active flag.
    await queryClient
      .begin(async (transaction) => {
        const fixture = await publishEligibleFixture(transaction);
        await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
        const sibling = "0198a7b0-b000-7000-8000-000000000109";
        await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum)
          values(${sibling}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'failed-switch-sibling','1','ar','Arab','Synthetic failed-switch sibling','synthetic','failed-switch-alias','test-v1',repeat('a',64))`;
        // Unpublished sibling cannot activate; the failed attempt must not
        // disturb the already-active fixture edition.
        await assert.rejects(() =>
          transaction.savepoint(
            (sp) =>
              sp`update editions set is_active_release=true where id=${sibling}::uuid`,
          ),
        );
        assert.equal(
          (
            await transaction`select is_active_release from editions where id=${fixture.arabicEdition}::uuid`
          )[0]?.is_active_release,
          true,
          "failed activation leaves the prior active candidate unchanged",
        );

        // Explicit withdrawal deterministically clears the active flag in
        // the same transaction as the publication_state transition.
        await transaction`update editions set is_active_release=false,publication_state='withdrawn' where id=${fixture.arabicEdition}::uuid`;
        assert.deepEqual(
          (
            await transaction`select is_active_release,publication_state from editions where id=${fixture.arabicEdition}::uuid`
          )[0],
          { is_active_release: false, publication_state: "withdrawn" },
          "activation vs explicit withdrawal has a deterministic final state",
        );
        // A withdrawn edition can never be reactivated: publication_state
        // is one-way, so the ck_editions__active_release CHECK is
        // unreachable via this path, but the state-transition guard fires
        // first with the immutability message.
        await assert.rejects(
          () =>
            transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`,
        );

        throw new Error("ARC-005 failed-switch/withdrawal rollback");
      })
      .catch((error) =>
        assert.equal(
          error.message,
          "ARC-005 failed-switch/withdrawal rollback",
        ),
      );

    console.log(
      "PASS: ARC-005 database-enforced uniqueness, activation-eligibility, immutability exemption, and withdrawal behavior",
    );

    // 13-15, 17, 18, 20: atomicity and real concurrency, using two
    // independently reserved PostgreSQL connections so lock contention is
    // genuine, not simulated.
    {
      const concWork = "0198a7b0-b000-7000-8000-000000000201";
      const concLicense = "0198a7b0-b000-7000-8000-000000000202";
      const concEditionA = "0198a7b0-b000-7000-8000-000000000203";
      const concEditionB = "0198a7b0-b000-7000-8000-000000000204";
      const concLocale = "en";
      const concTrEditionA = "0198a7b0-b000-7000-8000-000000000205";
      const concTrEditionB = "0198a7b0-b000-7000-8000-000000000206";
      const concTrA = "0198a7b0-b000-7000-8000-000000000207";
      const concTrB = "0198a7b0-b000-7000-8000-000000000208";

      await queryClient`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
        values(${concLicense}::uuid,'synthetic','arc005-concurrency','1','Synthetic ARC-005 concurrency license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,'active')`;
      await queryClient`insert into works(id,canonical_key,work_type,title,original_language_code) values(${concWork}::uuid,'arc005-concurrency-work','quran','Synthetic ARC-005 concurrency work','ar')`;
      await queryClient`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
        values
          (${concEditionA}::uuid,${concWork}::uuid,${concLicense}::uuid,'conc-ar-a','1','ar','Arab','Synthetic concurrency edition A','synthetic','conc-ar-a-alias','test-v1',repeat('a',64),'published',current_timestamp),
          (${concEditionB}::uuid,${concWork}::uuid,${concLicense}::uuid,'conc-ar-b','1','ar','Arab','Synthetic concurrency edition B','synthetic','conc-ar-b-alias','test-v1',repeat('b',64),'published',current_timestamp),
          (${concTrEditionA}::uuid,${concWork}::uuid,${concLicense}::uuid,'conc-en-a','1','en','Latn','Synthetic concurrency translation edition A','synthetic','conc-en-a-alias','test-v1',repeat('c',64),'published',current_timestamp),
          (${concTrEditionB}::uuid,${concWork}::uuid,${concLicense}::uuid,'conc-en-b','1','en','Latn','Synthetic concurrency translation edition B','synthetic','conc-en-b-alias','test-v1',repeat('d',64),'published',current_timestamp)`;
      await queryClient`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at)
        select ${concTrA}::uuid,${concTrEditionA}::uuid,id,${concLicense}::uuid,'Concurrency Translator A','Concurrency methodology A','approved',current_timestamp from locales where code=${concLocale}
        union all
        select ${concTrB}::uuid,${concTrEditionB}::uuid,id,${concLicense}::uuid,'Concurrency Translator B','Concurrency methodology B','approved',current_timestamp from locales where code=${concLocale}`;

      const raceActivation = async (table, columnFilter, idA, idB) => {
        const connA = await queryClient.reserve();
        const connB = await queryClient.reserve();
        try {
          await connA`begin`;
          await connB`begin`;
          await connA`update ${connA(table)} set is_active_release=true where id=${idA}::uuid`;
          let bOutcome;
          const bPromise =
            connB`update ${connB(table)} set is_active_release=true where id=${idB}::uuid`
              .then(() => {
                bOutcome = { ok: true };
              })
              .catch((error) => {
                bOutcome = { ok: false, error };
              });
          // Give connB a real chance to issue its statement and block on
          // connA's uncommitted row before connA resolves the race.
          await new Promise((resolve) => setTimeout(resolve, 300));
          await connA`commit`;
          await bPromise;
          assert.equal(
            bOutcome.ok,
            false,
            `concurrent ${table} activation for the same ${columnFilter} must not both succeed`,
          );
          assert.match(
            bOutcome.error.message,
            /duplicate key value violates unique constraint/,
          );
          try {
            await connB`rollback`;
          } catch {
            // connB's transaction already aborted server-side; nothing to roll back.
          }
          const activeRows =
            await queryClient`select id::text from ${queryClient(table)} where is_active_release=true and id in (${idA}::uuid,${idB}::uuid)`;
          assert.deepEqual(
            activeRows.map((r) => r.id),
            [idA],
            `no committed double-active ${table} state exists after the race`,
          );
        } finally {
          connA.release();
          connB.release();
        }
      };

      // 17, 20: two concurrent Arabic activations for the same work cannot
      // both commit, and no double-active state is ever observable.
      await raceActivation("editions", "work_id", concEditionA, concEditionB);
      console.log(
        "PASS: ARC-005 concurrent Arabic activation race leaves exactly one active candidate",
      );

      // 18: two concurrent translation activations for one locale cannot
      // both commit either.
      await raceActivation(
        "quran_translation_editions",
        "locale_id",
        concTrA,
        concTrB,
      );
      console.log(
        "PASS: ARC-005 concurrent translation activation race leaves exactly one active candidate",
      );

      // 13, 14: A -> B activation and B -> A rollback are each atomic
      // (single-transaction clear-then-set); no intermediate zero- or
      // two-active state is ever committed or externally observable.
      await queryClient.begin(async (transaction) => {
        await transaction`update editions set is_active_release=false where work_id=${concWork}::uuid and is_active_release`;
        await transaction`update editions set is_active_release=true where id=${concEditionA}::uuid`;
      });
      assert.deepEqual(
        (
          await queryClient`select id::text from editions where work_id=${concWork}::uuid and is_active_release`
        ).map((r) => r.id),
        [concEditionA],
        "A activation committed atomically",
      );
      await queryClient.begin(async (transaction) => {
        await transaction`update editions set is_active_release=false where work_id=${concWork}::uuid and is_active_release`;
        await transaction`update editions set is_active_release=true where id=${concEditionB}::uuid`;
      });
      assert.deepEqual(
        (
          await queryClient`select id::text from editions where work_id=${concWork}::uuid and is_active_release`
        ).map((r) => r.id),
        [concEditionB],
        "A -> B activation is atomic",
      );
      await queryClient.begin(async (transaction) => {
        await transaction`update editions set is_active_release=false where work_id=${concWork}::uuid and is_active_release`;
        await transaction`update editions set is_active_release=true where id=${concEditionA}::uuid`;
      });
      assert.deepEqual(
        (
          await queryClient`select id::text from editions where work_id=${concWork}::uuid and is_active_release`
        ).map((r) => r.id),
        [concEditionA],
        "B -> A rollback is atomic",
      );

      // 15: the same atomic primitive applies identically to translation
      // activation switches.
      await queryClient.begin(async (transaction) => {
        await transaction`update quran_translation_editions set is_active_release=true where id=${concTrA}::uuid`;
      });
      await queryClient.begin(async (transaction) => {
        await transaction`update quran_translation_editions set is_active_release=false where locale_id=(select id from locales where code=${concLocale}) and is_active_release`;
        await transaction`update quran_translation_editions set is_active_release=true where id=${concTrB}::uuid`;
      });
      assert.deepEqual(
        (
          await queryClient`select id::text from quran_translation_editions where locale_id=(select id from locales where code=${concLocale}) and is_active_release`
        ).map((r) => r.id),
        [concTrB],
        "translation A -> B switch is atomic",
      );

      await queryClient`delete from quran_translation_editions where id in (${concTrA}::uuid,${concTrB}::uuid)`;
      await queryClient`delete from editions where id in (${concEditionA}::uuid,${concEditionB}::uuid,${concTrEditionA}::uuid,${concTrEditionB}::uuid)`;
      await queryClient`delete from works where id=${concWork}::uuid`;
      await queryClient`delete from licenses where id=${concLicense}::uuid`;
      console.log(
        "PASS: ARC-005 atomic A->B activation, B->A rollback, and translation switch (real committed-state evidence)",
      );
    }

    // 21-30: live eligibility revalidation at read time, using the exact
    // active-candidate/eligibility query shape `db-source.ts` implements.
    // Zero active or zero eligible candidates must both fail closed to no
    // rows, with no fallback to any other published edition.
    {
      const readSurahAvailability = async (sql = queryClient) => sql`
        with active_edition as (
          select e.id
          from editions e
          join works w on w.id = e.work_id
          join licenses lic on lic.id = e.license_id
          where w.work_type = 'quran'
            and e.is_active_release
            and e.publication_state = 'published'
            and lic.status = 'active'
            and lic.retention_policy <> 'no_storage'
            and lic.in_application_display_allowed
            and current_timestamp >= lic.effective_from
            and (lic.effective_until is null or current_timestamp < lic.effective_until)
        )
        select qs.surah_number, count(qat.id)::int as ayah_text_count
        from active_edition ae
        join quran_surahs qs on true
        left join quran_ayahs qa on qa.surah_id = qs.id
        left join quran_ayah_texts qat on qat.ayah_id = qa.id and qat.edition_id = ae.id
        group by qs.id, qs.surah_number
      `;

      await queryClient
        .begin(async (transaction) => {
          const fixture = await publishEligibleFixture(transaction);
          // 27: zero-active candidate fails closed (no rows at all).
          assert.equal((await readSurahAvailability(transaction)).length, 0);

          await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
          const availableWhileActive = await readSurahAvailability(transaction);
          assert.equal(availableWhileActive.length, 1);
          assert.equal(availableWhileActive[0]?.ayah_text_count, 1);

          // 21: a later-revoked license (an always-allowed safety operation)
          // is caught by read-time revalidation even though is_active_release
          // is still true — no cascade trigger cleared it.
          await transaction`update licenses set status='revoked' where id=${fixture.license}::uuid`;
          assert.equal(
            (await readSurahAvailability(transaction)).length,
            0,
            "active Arabic candidate with a later-revoked license is not served",
          );
          assert.equal(
            (
              await transaction`select is_active_release from editions where id=${fixture.arabicEdition}::uuid`
            )[0]?.is_active_release,
            true,
            "revocation does not silently clear is_active_release (no cross-layer cascade trigger)",
          );

          // 26: no automatic fallback to any other published edition occurs
          // even though one exists for the same work.
          const fallbackCandidate = "0198a7b0-b000-7000-8000-000000000301";
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
          values(${fallbackCandidate}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'fallback-candidate','1','ar','Arab','Synthetic fallback candidate','synthetic','fallback-alias','test-v1',repeat('e',64),'published',current_timestamp)`;
          assert.equal(
            (await readSurahAvailability(transaction)).length,
            0,
            "no silent fallback to another published edition occurs",
          );

          // 28: explicit governed replacement restores serving. The
          // replacement must be a genuinely eligible candidate in its own
          // right (a fresh, still-active license) — published editions and
          // their license binding are immutable, so eligibility can never be
          // restored by mutating a row already tied to the revoked license.
          const replacementEdition = "0198a7b0-b000-7000-8000-000000000302";
          const replacementPassageText = "0198a7b0-b000-7000-8000-000000000303";
          const replacementAyahText = "0198a7b0-b000-7000-8000-000000000304";
          const replacementLicense = "0198a7b0-b000-7000-8000-000000000305";
          await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
          values(${replacementLicense}::uuid,'synthetic','arc005-replacement','1','Synthetic replacement license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,'active')`;
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
          values(${replacementEdition}::uuid,${fixture.work}::uuid,${replacementLicense}::uuid,'replacement-candidate','1','ar','Arab','Synthetic replacement candidate','synthetic','replacement-alias','test-v1',repeat('f',64),'published',current_timestamp)`;
          const replacementText = "نَصٌّ بَدِيلٌ";
          const replacementChecksums = (
            await transaction`select alsamad_exact_sha256(${replacementText}) exact, alsamad_normalized_sha256(${replacementText}) normalized`
          )[0];
          await transaction`insert into passage_texts(id,edition_id,passage_id,text_content,normalized_checksum,source_checksum,publication_state,published_at) values
          (${replacementPassageText}::uuid,${replacementEdition}::uuid,${fixture.ayahPassage}::uuid,${replacementText},${replacementChecksums.normalized},${replacementChecksums.exact},'published',current_timestamp)`;
          await transaction`insert into quran_ayah_texts(id,edition_id,ayah_id,passage_text_id,source_record_checksum)
          values(${replacementAyahText}::uuid,${replacementEdition}::uuid,${fixture.ayah}::uuid,${replacementPassageText}::uuid,repeat('f',64))`;
          await transaction`update editions set is_active_release=false where id=${fixture.arabicEdition}::uuid`;
          await transaction`update editions set is_active_release=true where id=${replacementEdition}::uuid`;
          // 29: exactly one candidate's content is ever visible — never a mix.
          const afterReplacement = await readSurahAvailability(transaction);
          assert.equal(afterReplacement.length, 1);
          assert.equal(
            afterReplacement[0]?.ayah_text_count,
            1,
            "explicit governed replacement restores serving with no mixed-release read",
          );

          throw new Error("ARC-005 live-eligibility (revocation) rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "ARC-005 live-eligibility (revocation) rollback",
          ),
        );

      // 22: a license whose effective_until elapses through real time
      // passage (no write at all) stops serving once elapsed, proving
      // read-time revalidation does not depend on any mutation.
      const expiringLicense = "0198a7b0-b000-7000-8000-000000000401";
      const expiringWork = "0198a7b0-b000-7000-8000-000000000402";
      const expiringEdition = "0198a7b0-b000-7000-8000-000000000403";
      const expiringRootPassage = "0198a7b0-b000-7000-8000-000000000404";
      const expiringSurahPassage = "0198a7b0-b000-7000-8000-000000000405";
      const expiringAyahPassage = "0198a7b0-b000-7000-8000-000000000406";
      const expiringSurah = "0198a7b0-b000-7000-8000-000000000407";
      const expiringAyah = "0198a7b0-b000-7000-8000-000000000408";
      const expiringPassageText = "0198a7b0-b000-7000-8000-000000000409";
      const expiringAyahText = "0198a7b0-b000-7000-8000-00000000040a";
      try {
        await queryClient`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,effective_until,status)
          values(${expiringLicense}::uuid,'synthetic','arc005-expiring','1','Synthetic expiring license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,current_timestamp+'2 seconds'::interval,'active')`;
        await queryClient`insert into works(id,canonical_key,work_type,title,original_language_code) values(${expiringWork}::uuid,'arc005-expiring-work','quran','Synthetic expiring-license work','ar')`;
        await queryClient`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at,is_active_release)
          values(${expiringEdition}::uuid,${expiringWork}::uuid,${expiringLicense}::uuid,'expiring-ar','1','ar','Arab','Synthetic expiring edition','synthetic','expiring-alias','test-v1',repeat('a',64),'published',current_timestamp,true)`;
        await queryClient`insert into passages(id,work_id,parent_passage_id,canonical_locator,passage_type,sequence_number,depth) values
          (${expiringRootPassage}::uuid,${expiringWork}::uuid,null,'quran','work',1,0),
          (${expiringSurahPassage}::uuid,${expiringWork}::uuid,${expiringRootPassage}::uuid,'surah:1','chapter',1,1),
          (${expiringAyahPassage}::uuid,${expiringWork}::uuid,${expiringSurahPassage}::uuid,'1:1','verse',1,2)`;
        await queryClient`insert into quran_surahs(id,work_id,passage_id,canonical_key,surah_number,ayah_count,name_arabic,source_record_checksum)
          values(${expiringSurah}::uuid,${expiringWork}::uuid,${expiringSurahPassage}::uuid,'quran:surah:1',1,1,'اسم تجريبي',repeat('c',64))`;
        await queryClient`insert into quran_ayahs(id,surah_id,passage_id,canonical_key,ayah_number,global_sequence_number,source_record_checksum)
          values(${expiringAyah}::uuid,${expiringSurah}::uuid,${expiringAyahPassage}::uuid,'quran:ayah:1:1',1,1,repeat('d',64))`;
        const expiringText = "نَصٌّ مُنْتَهٍ";
        const expiringChecksums = (
          await queryClient`select alsamad_exact_sha256(${expiringText}) exact, alsamad_normalized_sha256(${expiringText}) normalized`
        )[0];
        await queryClient`insert into passage_texts(id,edition_id,passage_id,text_content,normalized_checksum,source_checksum,publication_state,published_at)
          values(${expiringPassageText}::uuid,${expiringEdition}::uuid,${expiringAyahPassage}::uuid,${expiringText},${expiringChecksums.normalized},${expiringChecksums.exact},'published',current_timestamp)`;
        await queryClient`insert into quran_ayah_texts(id,edition_id,ayah_id,passage_text_id,source_record_checksum)
          values(${expiringAyahText}::uuid,${expiringEdition}::uuid,${expiringAyah}::uuid,${expiringPassageText}::uuid,repeat('e',64))`;

        const beforeExpiry = await readSurahAvailability();
        assert.equal(
          beforeExpiry.filter((r) => r.surah_number === 1).length <= 1,
          true,
        );
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const afterExpiry = await readSurahAvailability();
        assert.equal(
          afterExpiry.filter(
            (r) => r.surah_number === 1 && r.ayah_text_count > 0,
          ).length,
          0,
          "active Arabic candidate whose effective_until has elapsed through real time passage is not served",
        );
      } finally {
        await queryClient`delete from quran_ayah_texts where id=${expiringAyahText}::uuid`;
        await queryClient`delete from passage_texts where id=${expiringPassageText}::uuid`;
        await queryClient`delete from quran_ayahs where id=${expiringAyah}::uuid`;
        await queryClient`delete from quran_surahs where id=${expiringSurah}::uuid`;
        await queryClient`delete from passages where id in (${expiringAyahPassage}::uuid,${expiringSurahPassage}::uuid,${expiringRootPassage}::uuid)`;
        await queryClient`update editions set is_active_release=false where id=${expiringEdition}::uuid`;
        await queryClient`delete from editions where id=${expiringEdition}::uuid`;
        await queryClient`delete from works where id=${expiringWork}::uuid`;
        await queryClient`delete from licenses where id=${expiringLicense}::uuid`;
      }

      // 23-25: translation-side live eligibility — disabled locale, an
      // ineligible backing edition, and an ineligible backing license each
      // independently stop translation serving without touching the
      // Arabic selector domain.
      await queryClient
        .begin(async (transaction) => {
          const fixture = await publishEligibleFixture(transaction);
          await transaction`update quran_translation_editions set is_active_release=true where id=${fixture.translation}::uuid`;

          const readTranslationEligible = async () =>
            (
              await transaction`
              select te.id
              from quran_translation_editions te
              join editions ed on ed.id = te.edition_id
              join licenses lic on lic.id = te.license_id
              join locales loc on loc.id = te.locale_id
              where te.is_active_release
                and te.review_status = 'approved'
                and ed.publication_state = 'published'
                and lic.status = 'active'
                and lic.retention_policy <> 'no_storage'
                and lic.in_application_display_allowed
                and current_timestamp >= lic.effective_from
                and (lic.effective_until is null or current_timestamp < lic.effective_until)
                and loc.is_enabled
                and te.id = ${fixture.translation}::uuid
            `
            ).length === 1;

          assert.equal(await readTranslationEligible(), true);

          // 23: locale later disabled.
          await transaction`update locales set is_enabled=false where code='en'`;
          assert.equal(
            await readTranslationEligible(),
            false,
            "active translation whose locale is later disabled is not served",
          );
          await transaction`update locales set is_enabled=true where code='en'`;
          assert.equal(await readTranslationEligible(), true);

          // 24: backing generic edition later withdrawn.
          await transaction`update editions set publication_state='withdrawn' where id=${fixture.translationEdition}::uuid`;
          assert.equal(
            await readTranslationEligible(),
            false,
            "active translation whose backing edition becomes ineligible is not served",
          );

          throw new Error("ARC-005 translation edition withdrawal rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "ARC-005 translation edition withdrawal rollback",
          ),
        );

      await queryClient
        .begin(async (transaction) => {
          const fixture = await publishEligibleFixture(transaction);
          await transaction`update quran_translation_editions set is_active_release=true where id=${fixture.translation}::uuid`;
          // 25: backing license later revoked.
          await transaction`update licenses set status='revoked' where id=${fixture.license}::uuid`;
          const eligible = await transaction`
          select 1 from quran_translation_editions te
          join licenses lic on lic.id = te.license_id
          where te.id=${fixture.translation}::uuid and te.is_active_release and lic.status='active'
        `;
          assert.equal(
            eligible.length,
            0,
            "active translation whose backing license becomes ineligible is not served",
          );
          throw new Error("ARC-005 translation license revocation rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "ARC-005 translation license revocation rollback",
          ),
        );

      // 30 (AUD-ARC005-002 correction): the read-time query plans against
      // the partial unique indexes and existing edition_id/ayah_id indexes
      // rather than a sequential scan of every edition/translation row.
      //
      // The prior assertion checked the literal substring
      // `"Relation Name": "editions", "Node Type": "Seq Scan"` against
      // `JSON.stringify(plan)`, but `EXPLAIN (FORMAT JSON)` always emits
      // `"Node Type"` before `"Relation Name"` in each plan node, so that
      // substring could never match regardless of actual planner behavior
      // -- it never proved index usage. This walks the already-parsed plan
      // object structurally (property access, not string matching), so it
      // cannot depend on JSON key order. It also separates two distinct
      // questions the old assertion conflated: whether the query is
      // index-*compatible* (checked with `enable_seqscan` forced off, which
      // cannot be fooled by a tiny fixture) versus whether the planner
      // actually *chooses* the index unforced at realistic cardinality
      // (checked empirically below with a disposable bulk fixture). Neither
      // check treats a sequential scan on a near-empty table as proof of
      // anything: PostgreSQL legitimately prefers a sequential scan over an
      // index scan when a table is tiny, and that is not an index defect.
      const activeEditionQuery = (sql) => sql`
        explain (format json)
        with active_edition as (
          select e.id from editions e
          join works w on w.id = e.work_id
          join licenses lic on lic.id = e.license_id
          where w.work_type = 'quran' and e.is_active_release and e.publication_state = 'published'
            and lic.status = 'active' and lic.retention_policy <> 'no_storage' and lic.in_application_display_allowed
            and current_timestamp >= lic.effective_from and (lic.effective_until is null or current_timestamp < lic.effective_until)
        )
        select qs.surah_number, count(qat.id) from active_edition ae
        join quran_surahs qs on true
        left join quran_ayahs qa on qa.surah_id = qs.id
        left join quran_ayah_texts qat on qat.ayah_id = qa.id and qat.edition_id = ae.id
        group by qs.id, qs.surah_number
      `;

      const collectPlanNodes = (node, accumulator = []) => {
        if (!node) return accumulator;
        accumulator.push(node);
        for (const child of node.Plans ?? [])
          collectPlanNodes(child, accumulator);
        return accumulator;
      };
      const editionsNodesOf = (planRow) =>
        collectPlanNodes(planRow[0]["QUERY PLAN"][0].Plan).filter(
          (node) => node["Relation Name"] === "editions",
        );
      // "Bitmap Heap Scan" is included because a bitmap-index-driven scan
      // splits across two nodes: the child "Bitmap Index Scan" carries no
      // "Relation Name" (only "Index Name"), while the relation-tagged
      // "Bitmap Heap Scan" node's own Node Type string does not literally
      // contain "Index" even though it is index-driven.
      const usesIndexPath = (nodes) =>
        nodes.some((node) =>
          ["Index Scan", "Index Only Scan", "Bitmap Heap Scan"].includes(
            node["Node Type"],
          ),
        );

      // Natural planner choice against the near-empty verification database
      // is recorded for visibility only -- it is not asserted either way,
      // since a sequential scan here is the planner's legitimate, cost-based
      // choice on so little data, not evidence the index is unusable.
      const naturalPlan = await activeEditionQuery(queryClient);
      const naturalEditionsNodes = editionsNodesOf(naturalPlan);
      assert.ok(
        naturalEditionsNodes.length > 0,
        "query plan structurally references the editions relation",
      );
      console.log(
        `INFO: ARC-005 active-edition query planner choice on the near-empty verification database is ${naturalEditionsNodes.map((node) => node["Node Type"]).join("/")} (informational only; not asserted)`,
      );

      // Index-compatibility: forcing `enable_seqscan off` cannot be fooled
      // by a tiny fixture the way an unforced plan can. If the planner can
      // still produce a valid plan and that plan uses an index-family node
      // against `editions`, the query is structurally index-compatible
      // regardless of what an unforced planner chooses on this fixture.
      await queryClient
        .begin(async (transaction) => {
          await transaction`set local enable_seqscan = off`;
          const forcedPlan = await activeEditionQuery(transaction);
          const forcedEditionsNodes = editionsNodesOf(forcedPlan);
          assert.ok(
            usesIndexPath(forcedEditionsNodes),
            "with enable_seqscan forced off, the active-edition query is index-compatible against editions (structural proof, independent of the unforced fixture-size choice)",
          );
          throw new Error("AUD-ARC005-002 index-compatibility rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "AUD-ARC005-002 index-compatibility rollback",
          ),
        );

      // Realistic-cardinality empirical proof: a bounded, disposable
      // synthetic fixture (rolled back, never committed, no production seed
      // impact) of several thousand published-but-inactive sibling editions
      // for the same work, alongside the one active row. This proves the
      // unforced planner actually chooses an index path against `editions`
      // once there is enough data for a sequential scan to be genuinely
      // more expensive -- not merely that an index exists.
      await queryClient
        .begin(async (transaction) => {
          const fixture = await publishEligibleFixture(transaction);
          await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
          const bulkSiblingCount = 3000;
          await transaction`
            insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at,is_active_release)
            select gen_random_uuid(), ${fixture.work}::uuid, ${fixture.license}::uuid, 'aud-arc005-cardinality-'||gs, '1', 'ar', 'Arab', 'Synthetic bulk cardinality sibling edition '||gs, 'synthetic', 'aud-arc005-cardinality-alias-'||gs, 'test-v1', md5(gs::text)||md5((gs+1)::text), 'published', current_timestamp, false
            from generate_series(1, ${bulkSiblingCount}) gs
          `;
          await transaction`analyze editions`;
          const bulkPlan = await activeEditionQuery(transaction);
          const bulkEditionsNodes = editionsNodesOf(bulkPlan);
          assert.ok(
            usesIndexPath(bulkEditionsNodes),
            `at realistic cardinality (${bulkSiblingCount} published-but-inactive sibling editions for the same work), the unforced planner actually selects an index path against editions rather than a full sequential scan`,
          );
          throw new Error("AUD-ARC005-002 realistic-cardinality rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "AUD-ARC005-002 realistic-cardinality rollback",
          ),
        );

      console.log(
        "PASS: ARC-005 read-time live-eligibility revalidation (revocation, elapsed effective_until, disabled locale, withdrawn backing edition, no fallback, no mixed-release read, structurally index-compatible and empirically index-used query plan)",
      );
    }

    // AUD-ARC005-001: direct INSERT with is_active_release = true must be
    // subject to the same full activation-eligibility contract as the
    // false->true UPDATE transition, on both selector domains. Each
    // rejection case below deliberately sets every other eligibility gate
    // (publication_state/review_status, backing edition, locale) to the
    // value that would already satisfy migration 0008's CHECK constraints,
    // isolating the one gate the INSERT path previously bypassed: live
    // license eligibility, which only the trigger (not any CHECK) enforces.
    {
      await expectDatabaseRejection(
        "direct INSERT of an ineligible (revoked-license) active Arabic edition is rejected",
        async (transaction) => {
          const fixture = await insertM5Foundation(transaction);
          const revokedLicense = "0198a7b0-c000-7000-8000-000000000001";
          await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
            values(${revokedLicense}::uuid,'synthetic','aud-arc005-insert-ar-revoked','1','Synthetic revoked license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,'revoked')`;
          const insertedEdition = "0198a7b0-c000-7000-8000-000000000002";
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at,is_active_release)
            values(${insertedEdition}::uuid,${fixture.work}::uuid,${revokedLicense}::uuid,'aud-arc005-insert-ar','1','ar','Arab','Synthetic INSERT-activated Arabic edition','synthetic','aud-arc005-insert-ar-alias','test-v1',repeat('7',64),'published',current_timestamp,true)`;
        },
      );

      await queryClient
        .begin(async (transaction) => {
          const fixture = await insertM5Foundation(transaction);
          const insertedEdition = "0198a7b0-c000-7000-8000-000000000003";
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at,is_active_release)
            values(${insertedEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'aud-arc005-insert-ar-ok','1','ar','Arab','Synthetic eligible INSERT-activated Arabic edition','synthetic','aud-arc005-insert-ar-ok-alias','test-v1',repeat('8',64),'published',current_timestamp,true)`;
          assert.equal(
            (
              await transaction`select is_active_release from editions where id=${insertedEdition}::uuid`
            )[0]?.is_active_release,
            true,
            "eligible direct INSERT Arabic activation succeeds",
          );
          throw new Error("AUD-ARC005-001 eligible Arabic INSERT rollback");
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "AUD-ARC005-001 eligible Arabic INSERT rollback",
          ),
        );

      // Each translation test creates its own fresh backing edition rather
      // than reusing `fixture.translationEdition`, which `insertM5Foundation`
      // already bound to `fixture.translation` via the
      // uq_quran_translation_editions__edition unique(edition_id) constraint.
      await expectDatabaseRejection(
        "direct INSERT of an ineligible (revoked-license) active translation edition is rejected",
        async (transaction) => {
          const fixture = await insertM5Foundation(transaction);
          const backingEdition = "0198a7b0-c000-7000-8000-000000000007";
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
            values(${backingEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'aud-arc005-insert-tr-backing-ineligible','1','en','Latn','Synthetic INSERT-test backing edition','synthetic','aud-arc005-insert-tr-backing-ineligible-alias','test-v1',repeat('9',64),'published',current_timestamp)`;
          const revokedLicense = "0198a7b0-c000-7000-8000-000000000004";
          await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,in_application_display_allowed,standalone_redistribution_allowed,effective_from,status)
            values(${revokedLicense}::uuid,'synthetic','aud-arc005-insert-tr-revoked','1','Synthetic revoked translation license','permission','Synthetic attribution','permanent',true,true,current_timestamp-'1 day'::interval,'revoked')`;
          const insertedTranslation = "0198a7b0-c000-7000-8000-000000000005";
          await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at,is_active_release)
            select ${insertedTranslation}::uuid,${backingEdition}::uuid,id,${revokedLicense}::uuid,'AUD-ARC005 Translator','AUD-ARC005 methodology','approved',current_timestamp,true from locales where code='en'`;
        },
      );

      await queryClient
        .begin(async (transaction) => {
          const fixture = await insertM5Foundation(transaction);
          const backingEdition = "0198a7b0-c000-7000-8000-000000000008";
          await transaction`insert into editions(id,work_id,license_id,edition_key,version,language_code,script_code,display_name,provider_code,provider_edition_id,import_version,source_manifest_checksum,publication_state,published_at)
            values(${backingEdition}::uuid,${fixture.work}::uuid,${fixture.license}::uuid,'aud-arc005-insert-tr-backing-eligible','1','en','Latn','Synthetic eligible INSERT-test backing edition','synthetic','aud-arc005-insert-tr-backing-eligible-alias','test-v1',repeat('e',64),'published',current_timestamp)`;
          const insertedTranslation = "0198a7b0-c000-7000-8000-000000000006";
          await transaction`insert into quran_translation_editions(id,edition_id,locale_id,license_id,translator_name,methodology,review_status,reviewed_at,is_active_release)
            select ${insertedTranslation}::uuid,${backingEdition}::uuid,id,${fixture.license}::uuid,'AUD-ARC005 Translator','AUD-ARC005 methodology','approved',current_timestamp,true from locales where code='en'`;
          assert.equal(
            (
              await transaction`select is_active_release from quran_translation_editions where id=${insertedTranslation}::uuid`
            )[0]?.is_active_release,
            true,
            "eligible direct INSERT translation activation succeeds",
          );
          throw new Error(
            "AUD-ARC005-001 eligible translation INSERT rollback",
          );
        })
        .catch((error) =>
          assert.equal(
            error.message,
            "AUD-ARC005-001 eligible translation INSERT rollback",
          ),
        );

      // Regression: the false->true UPDATE activation path corrected by
      // migration 0008 and verified above (tests 1-29) must remain exactly
      // as strict after this correction as before it -- the fix only adds
      // INSERT coverage, it does not alter or re-scope UPDATE-path
      // eligibility, uniqueness, withdrawal, rollback, or concurrency
      // behavior. A representative UPDATE-path rejection is re-run here as
      // a direct regression guard on the redefined trigger function itself.
      await expectDatabaseRejection(
        "UPDATE false->true activation of an unpublished Arabic edition remains rejected after the INSERT correction",
        async (transaction) => {
          const fixture = await insertM5Foundation(transaction);
          await transaction`update editions set is_active_release=true where id=${fixture.arabicEdition}::uuid`;
        },
      );

      console.log(
        "PASS: AUD-ARC005-001 direct INSERT with is_active_release = true is subject to full activation eligibility on both selector domains, matching the existing UPDATE path",
      );
    }

    console.log(
      "PASS: ARC-005 atomic Quran release selector fully verified against real PostgreSQL",
    );
  }

  // KE-2A Topics Foundation: synthetic, non-religious, rollback-scoped proof.
  {
    const topicColumns = await queryClient`
      select column_name, data_type, character_maximum_length, is_nullable, column_default
      from information_schema.columns
      where table_schema='public' and table_name='topics'
      order by ordinal_position
    `;
    assert.deepEqual(
      topicColumns.map(({ column_name }) => column_name),
      [
        "id",
        "canonical_key",
        "localized_names",
        "status",
        "created_by",
        "approved_by",
        "approved_at",
        "created_at",
        "updated_at",
      ],
    );
    assert.deepEqual(
      topicColumns.map(({ data_type }) => data_type),
      [
        "uuid",
        "character varying",
        "jsonb",
        "character varying",
        "uuid",
        "uuid",
        "timestamp with time zone",
        "timestamp with time zone",
        "timestamp with time zone",
      ],
    );
    assert.equal(topicColumns[1]?.character_maximum_length, 160);
    assert.equal(topicColumns[3]?.character_maximum_length, 16);
    assert.match(topicColumns[3]?.column_default ?? "", /draft/);
    assert.equal(topicColumns[7]?.column_default, "CURRENT_TIMESTAMP");
    assert.equal(topicColumns[8]?.column_default, "CURRENT_TIMESTAMP");

    const topicConstraints = await queryClient`
      select conname, contype
      from pg_constraint
      where conrelid='topics'::regclass
      order by conname
    `;
    assert.deepEqual(
      topicConstraints.map(({ conname }) => conname),
      [
        "ck_topics__approval_evidence",
        "ck_topics__canonical_key",
        "ck_topics__id_uuidv7",
        "ck_topics__localized_names",
        "ck_topics__status",
        "ctr_topics__localized_names",
        "fk_topics__approved_by",
        "fk_topics__created_by",
        "topics_pkey",
        "uq_topics__canonical_key",
      ],
    );
    assert.equal(
      topicConstraints.filter(({ contype }) => contype === "f").length,
      2,
    );
    assert.deepEqual(
      (
        await queryClient`
          select indexname from pg_indexes
          where schemaname='public' and tablename='topics'
          order by indexname
        `
      ).map(({ indexname }) => indexname),
      ["ix_topics__status", "topics_pkey", "uq_topics__canonical_key"],
    );
    assert.equal(
      (await queryClient`select count(*)::int as count from topics`)[0]?.count,
      0,
    );

    const actor = "0198a7b0-e300-7000-8000-000000000001";
    const disabledActor = "0198a7b0-e300-7000-8000-000000000002";
    const topic = "0198a7b0-e400-7000-8000-000000000001";
    await queryClient
      .begin(async (transaction) => {
        await transaction`insert into editorial_users(id,status) values(${actor}::uuid,'active'),(${disabledActor}::uuid,'disabled')`;
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values(${topic}::uuid,'synthetic-topic','{"en":"Synthetic topic"}'::jsonb,${actor}::uuid)`;
        await transaction`set constraints all immediate`;
        let row = (
          await transaction`select * from topics where id=${topic}::uuid`
        )[0];
        assert.equal(row.status, "draft");
        assert.equal(row.approved_by, null);
        assert.equal(row.approved_at, null);
        const createdAt = row.created_at;
        const firstUpdatedAt = row.updated_at;

        await transaction`update topics set localized_names='{"en":"Synthetic topic revised"}'::jsonb where id=${topic}::uuid`;
        await transaction`set constraints all immediate`;
        row = (
          await transaction`select * from topics where id=${topic}::uuid`
        )[0];
        assert.ok(row.updated_at > firstUpdatedAt);

        await transaction`update topics set status='approved',approved_by=${actor}::uuid where id=${topic}::uuid`;
        row = (
          await transaction`select * from topics where id=${topic}::uuid`
        )[0];
        assert.equal(row.status, "approved");
        assert.equal(row.approved_by, actor);
        assert.equal(
          new Date(row.approved_at).getTime(),
          new Date(row.updated_at).getTime(),
        );
        const approvedAt = row.approved_at;

        await transaction`update topics set status='retired' where id=${topic}::uuid`;
        row = (
          await transaction`select * from topics where id=${topic}::uuid`
        )[0];
        assert.equal(row.status, "retired");
        assert.equal(
          new Date(row.approved_at).getTime(),
          new Date(approvedAt).getTime(),
        );
        assert.equal(
          new Date(row.created_at).getTime(),
          new Date(createdAt).getTime(),
        );
        throw new Error("KE-2A positive fixture rollback");
      })
      .catch((error) =>
        assert.equal(error.message, "KE-2A positive fixture rollback"),
      );

    const rejectTopicMutation = async (label, body) =>
      expectDatabaseRejection(label, async (transaction) => {
        await transaction`insert into editorial_users(id,status) values(${actor}::uuid,'active'),(${disabledActor}::uuid,'disabled')`;
        await body(transaction);
      });

    await rejectTopicMutation(
      "non-UUIDv7 topic id",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-4000-8000-000000000002'::uuid,'bad-id','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`,
    );
    await rejectTopicMutation(
      "uppercase canonical key",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000003'::uuid,'Bad-Key','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`,
    );
    await rejectTopicMutation(
      "blank canonical key",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000004'::uuid,'   ','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`,
    );
    await rejectTopicMutation(
      "empty localized names",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000005'::uuid,'empty-names','{}'::jsonb,${actor}::uuid)`,
    );
    await rejectTopicMutation(
      "non-string localized name",
      async (transaction) => {
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000006'::uuid,'bad-name','{"en":1}'::jsonb,${actor}::uuid)`;
        await transaction`set constraints all immediate`;
      },
    );
    await rejectTopicMutation("missing locale key", async (transaction) => {
      await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000007'::uuid,'missing-locale','{"zz-ke2a":"Synthetic"}'::jsonb,${actor}::uuid)`;
      await transaction`set constraints all immediate`;
    });
    await rejectTopicMutation(
      "disabled creation actor",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000008'::uuid,'disabled-actor','{"en":"Synthetic"}'::jsonb,${disabledActor}::uuid)`,
    );
    await rejectTopicMutation(
      "missing creation actor",
      (transaction) =>
        transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000009'::uuid,'missing-actor','{"en":"Synthetic"}'::jsonb,'0198a7b0-e300-7000-8000-000000000099'::uuid)`,
    );
    await rejectTopicMutation(
      "duplicate canonical key",
      async (transaction) => {
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000010'::uuid,'duplicate-key','{"en":"Synthetic A"}'::jsonb,${actor}::uuid)`;
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000011'::uuid,'duplicate-key','{"en":"Synthetic B"}'::jsonb,${actor}::uuid)`;
      },
    );

    const lifecycleFailure = async (label, mutation) =>
      rejectTopicMutation(label, async (transaction) => {
        const id = "0198a7b0-e400-7000-8000-000000000020";
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values(${id}::uuid,'lifecycle-fixture','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`;
        await mutation(transaction, id);
      });
    await lifecycleFailure(
      "draft lifecycle no-op",
      (transaction, id) =>
        transaction`update topics set status='draft' where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "direct timestamp fabrication",
      (transaction, id) =>
        transaction`update topics set updated_at=updated_at+interval '1 second' where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "immutable topic id",
      (transaction, id) =>
        transaction`update topics set id='0198a7b0-e400-7000-8000-000000000021'::uuid where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "immutable canonical key",
      (transaction, id) =>
        transaction`update topics set canonical_key='changed-key' where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "immutable creator",
      (transaction, id) =>
        transaction`update topics set created_by=${disabledActor}::uuid where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "immutable created_at",
      (transaction, id) =>
        transaction`update topics set created_at=created_at+interval '1 second' where id=${id}::uuid`,
    );
    await lifecycleFailure(
      "approval by disabled actor",
      (transaction, id) =>
        transaction`update topics set status='approved',approved_by=${disabledActor}::uuid where id=${id}::uuid`,
    );
    await lifecycleFailure("approved to draft", async (transaction, id) => {
      await transaction`update topics set status='approved',approved_by=${actor}::uuid where id=${id}::uuid`;
      await transaction`update topics set status='draft',approved_by=null where id=${id}::uuid`;
    });
    await lifecycleFailure(
      "retired topic reactivation",
      async (transaction, id) => {
        await transaction`update topics set status='retired' where id=${id}::uuid`;
        await transaction`update topics set status='draft' where id=${id}::uuid`;
      },
    );
    await lifecycleFailure(
      "retired topic hard delete",
      async (transaction, id) => {
        await transaction`update topics set status='retired' where id=${id}::uuid`;
        await transaction`delete from topics where id=${id}::uuid`;
      },
    );
    await rejectTopicMutation(
      "unsupported isolation fails closed",
      async (transaction) => {
        await transaction`set transaction isolation level serializable`;
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000030'::uuid,'serializable-topic','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`;
        await transaction`set constraints all immediate`;
      },
    );

    // The shared global lock serializes opposite locale-key orders without deadlock.
    await queryClient`insert into editorial_users(id,status) values(${actor}::uuid,'active') on conflict(id) do nothing`;
    const connA = await queryClient.reserve();
    const connB = await queryClient.reserve();
    try {
      await connA`begin`;
      await connB`begin`;
      await connA`insert into topics(id,canonical_key,localized_names,created_by) values
        ('0198a7b0-e400-7000-8000-000000000041'::uuid,'lock-order-a1','{"ar":"A","en":"B"}'::jsonb,${actor}::uuid),
        ('0198a7b0-e400-7000-8000-000000000042'::uuid,'lock-order-a2','{"en":"B","ar":"A"}'::jsonb,${actor}::uuid)`;
      await connB`insert into topics(id,canonical_key,localized_names,created_by) values
        ('0198a7b0-e400-7000-8000-000000000043'::uuid,'lock-order-b1','{"en":"B","ar":"A"}'::jsonb,${actor}::uuid),
        ('0198a7b0-e400-7000-8000-000000000044'::uuid,'lock-order-b2','{"ar":"A","en":"B"}'::jsonb,${actor}::uuid)`;
      await connA`set constraints all immediate`;
      const bConstraints = connB`set constraints all immediate`;
      await new Promise((resolve) => setTimeout(resolve, 100));
      await connA`commit`;
      await bConstraints;
      await connB`commit`;
    } finally {
      try {
        await connA`rollback`;
      } catch {}
      try {
        await connB`rollback`;
      } catch {}
      connA.release();
      connB.release();
    }
    await queryClient`delete from topics where id in (
      '0198a7b0-e400-7000-8000-000000000041'::uuid,
      '0198a7b0-e400-7000-8000-000000000042'::uuid,
      '0198a7b0-e400-7000-8000-000000000043'::uuid,
      '0198a7b0-e400-7000-8000-000000000044'::uuid
    )`;

    const raceLocale = "ke2a-race";
    const raceLocaleId = "0198a7b0-e500-7000-8000-000000000001";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values(${raceLocaleId}::uuid,${raceLocale},'x-ke2a-race','xk','ltr','Synthetic race locale','Synthetic race locale')`;
    await expectDatabaseRejection(
      "referenced locale deletion",
      async (transaction) => {
        await transaction`insert into topics(id,canonical_key,localized_names,created_by) values('0198a7b0-e400-7000-8000-000000000050'::uuid,'referenced-locale','{"ke2a-race":"Synthetic"}'::jsonb,${actor}::uuid)`;
        await transaction`set constraints all immediate`;
        await transaction`delete from locales where code=${raceLocale}`;
      },
    );
    await queryClient`delete from locales where code=${raceLocale}`;

    // Topic validation owns the lock first: the concurrent locale delete waits,
    // then fails after the topic commit becomes visible.
    const topicFirstLocale = "ke2a-topic-first";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values('0198a7b0-e500-7000-8000-000000000003'::uuid,${topicFirstLocale},'x-ke2a-topic-first','xt','ltr','Synthetic topic-first locale','Synthetic topic-first locale')`;
    const topicFirstA = await queryClient.reserve();
    const topicFirstB = await queryClient.reserve();
    try {
      await topicFirstA`begin`;
      await topicFirstB`begin`;
      await topicFirstA`insert into topics(id,canonical_key,localized_names,created_by)
        values('0198a7b0-e400-7000-8000-000000000051'::uuid,'topic-first-race','{"ke2a-topic-first":"Synthetic"}'::jsonb,${actor}::uuid)`;
      await topicFirstA`set constraints all immediate`;
      const deletion =
        topicFirstB`delete from locales where code=${topicFirstLocale}`
          .then(() => ({ ok: true }))
          .catch((error) => ({ ok: false, error }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      await topicFirstA`commit`;
      const deletionResult = await deletion;
      assert.equal(deletionResult.ok, false);
      assert.match(deletionResult.error.message, /referenced by topics/);
    } finally {
      try {
        await topicFirstA`rollback`;
      } catch {}
      try {
        await topicFirstB`rollback`;
      } catch {}
      topicFirstA.release();
      topicFirstB.release();
    }
    await queryClient`delete from topics where id='0198a7b0-e400-7000-8000-000000000051'::uuid`;
    await queryClient`delete from locales where code=${topicFirstLocale}`;

    // Locale deletion owns the lock first: the later topic validation waits,
    // observes the committed deletion, and fails without a dangling key.
    const localeFirstLocale = "k2-locale-first";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values('0198a7b0-e500-7000-8000-000000000004'::uuid,${localeFirstLocale},'x-k2-locale-first','xl','ltr','Synthetic locale-first locale','Synthetic locale-first locale')`;
    const localeFirstA = await queryClient.reserve();
    const localeFirstB = await queryClient.reserve();
    try {
      await localeFirstA`begin`;
      await localeFirstB`begin`;
      await localeFirstA`delete from locales where code=${localeFirstLocale}`;
      await localeFirstB`insert into topics(id,canonical_key,localized_names,created_by)
        values('0198a7b0-e400-7000-8000-000000000052'::uuid,'locale-first-race','{"k2-locale-first":"Synthetic"}'::jsonb,${actor}::uuid)`;
      const validation = localeFirstB`set constraints all immediate`
        .then(() => ({ ok: true }))
        .catch((error) => ({ ok: false, error }));
      await new Promise((resolve) => setTimeout(resolve, 100));
      await localeFirstA`commit`;
      const validationResult = await validation;
      assert.equal(validationResult.ok, false);
      assert.match(
        validationResult.error.message,
        /does not reference locales.code/,
      );
    } finally {
      try {
        await localeFirstA`rollback`;
      } catch {}
      try {
        await localeFirstB`rollback`;
      } catch {}
      localeFirstA.release();
      localeFirstB.release();
    }
    assert.equal(
      (
        await queryClient`select count(*)::int as count from topics where id='0198a7b0-e400-7000-8000-000000000052'::uuid`
      )[0]?.count,
      0,
    );

    const waitForAdvisoryWait = async (pid, label) => {
      for (let attempt = 0; attempt < 100; attempt += 1) {
        const activity = (
          await queryClient`
            select wait_event_type, wait_event
            from pg_stat_activity
            where pid = ${pid}
          `
        )[0];
        if (
          activity?.wait_event_type === "Lock" &&
          activity?.wait_event === "advisory"
        ) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      assert.fail(`${label} did not wait on the governed advisory lock`);
    };

    // Topic localized-name UPDATE owns the lock first: locale deletion waits,
    // then fails after the committed update makes the locale referenced.
    const updateFirstLocale = "ke2a-upd-first";
    const updateFirstTopic = "0198a7b0-e400-7000-8000-000000000053";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values('0198a7b0-e500-7000-8000-000000000005'::uuid,${updateFirstLocale},'x-ke2a-update-first','xu','ltr','Synthetic update-first locale','Synthetic update-first locale')`;
    await queryClient`insert into topics(id,canonical_key,localized_names,created_by)
      values(${updateFirstTopic}::uuid,'update-first-race','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`;
    const updateFirstA = await queryClient.reserve();
    const updateFirstB = await queryClient.reserve();
    try {
      await updateFirstA`begin`;
      await updateFirstB`begin`;
      const updateFirstBPid = (
        await updateFirstB`select pg_backend_pid()::int as pid`
      )[0].pid;
      await updateFirstA`update topics
        set localized_names=jsonb_build_object('en','Synthetic',${updateFirstLocale}::text,'Synthetic update locale')
        where id=${updateFirstTopic}::uuid`;
      await updateFirstA`set constraints all immediate`;
      const deletion =
        updateFirstB`delete from locales where code=${updateFirstLocale}`
          .then(() => ({ ok: true }))
          .catch((error) => ({ ok: false, error }));
      await waitForAdvisoryWait(
        updateFirstBPid,
        "locale deletion behind localized-name update",
      );
      await updateFirstA`commit`;
      const deletionResult = await deletion;
      assert.equal(deletionResult.ok, false);
      assert.match(deletionResult.error.message, /referenced by topics/);
    } finally {
      try {
        await updateFirstA`rollback`;
      } catch {}
      try {
        await updateFirstB`rollback`;
      } catch {}
      updateFirstA.release();
      updateFirstB.release();
    }
    await queryClient`delete from topics where id=${updateFirstTopic}::uuid`;
    await queryClient`delete from locales where code=${updateFirstLocale}`;

    // Locale deletion owns the lock first: the localized-name UPDATE waits,
    // then deferred validation observes the deletion and rejects the update.
    const deleteFirstUpdateLocale = "ke2a-del-upd";
    const deleteFirstUpdateTopic = "0198a7b0-e400-7000-8000-000000000054";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values('0198a7b0-e500-7000-8000-000000000006'::uuid,${deleteFirstUpdateLocale},'x-ke2a-delete-first-update','xd','ltr','Synthetic delete-first update locale','Synthetic delete-first update locale')`;
    await queryClient`insert into topics(id,canonical_key,localized_names,created_by)
      values(${deleteFirstUpdateTopic}::uuid,'delete-first-update-race','{"en":"Synthetic"}'::jsonb,${actor}::uuid)`;
    const deleteFirstUpdateA = await queryClient.reserve();
    const deleteFirstUpdateB = await queryClient.reserve();
    try {
      await deleteFirstUpdateA`begin`;
      await deleteFirstUpdateB`begin`;
      const deleteFirstUpdateBPid = (
        await deleteFirstUpdateB`select pg_backend_pid()::int as pid`
      )[0].pid;
      await deleteFirstUpdateA`delete from locales where code=${deleteFirstUpdateLocale}`;
      await deleteFirstUpdateB`update topics
        set localized_names=jsonb_build_object('en','Synthetic',${deleteFirstUpdateLocale}::text,'Synthetic deleted locale')
        where id=${deleteFirstUpdateTopic}::uuid`;
      const validation = deleteFirstUpdateB`set constraints all immediate`
        .then(() => ({ ok: true }))
        .catch((error) => ({ ok: false, error }));
      await waitForAdvisoryWait(
        deleteFirstUpdateBPid,
        "localized-name update behind locale deletion",
      );
      await deleteFirstUpdateA`commit`;
      const validationResult = await validation;
      assert.equal(validationResult.ok, false);
      assert.match(
        validationResult.error.message,
        /does not reference locales.code/,
      );
    } finally {
      try {
        await deleteFirstUpdateA`rollback`;
      } catch {}
      try {
        await deleteFirstUpdateB`rollback`;
      } catch {}
      deleteFirstUpdateA.release();
      deleteFirstUpdateB.release();
    }
    assert.deepEqual(
      (
        await queryClient`select localized_names from topics where id=${deleteFirstUpdateTopic}::uuid`
      )[0]?.localized_names,
      { en: "Synthetic" },
    );
    await queryClient`delete from topics where id=${deleteFirstUpdateTopic}::uuid`;

    const unreferencedLocale = "ke2a-free";
    await queryClient`insert into locales(id,code,language_tag,language_code,direction,display_name,native_name)
      values('0198a7b0-e500-7000-8000-000000000002'::uuid,${unreferencedLocale},'x-ke2a-free','xf','ltr','Synthetic free locale','Synthetic free locale')`;
    await queryClient`delete from locales where code=${unreferencedLocale}`;
    assert.equal(
      (
        await queryClient`select count(*)::int as count from locales where code=${unreferencedLocale}`
      )[0]?.count,
      0,
    );

    await queryClient.begin(async (transaction) => {
      const before = (
        await transaction`select count(*)::int as count from pg_locks where locktype='advisory' and pid=pg_backend_pid()`
      )[0].count;
      await transaction`select id from topics limit 1`;
      const after = (
        await transaction`select count(*)::int as count from pg_locks where locktype='advisory' and pid=pg_backend_pid()`
      )[0].count;
      assert.equal(
        after,
        before,
        "ordinary topic read acquires no advisory lock",
      );
    });
    const proveAdvisoryRelease = async (ending) => {
      const owner = await queryClient.reserve();
      const contender = await queryClient.reserve();
      try {
        await owner`begin`;
        await contender`begin`;
        await owner`select pg_advisory_xact_lock(hashtextextended('alsamad:ke2:locale-integrity',0))`;
        assert.equal(
          (
            await contender`select pg_try_advisory_xact_lock(hashtextextended('alsamad:ke2:locale-integrity',0)) as acquired`
          )[0].acquired,
          false,
          `competing connection cannot acquire before ${ending}`,
        );
        if (ending === "commit") {
          await owner`commit`;
        } else {
          await owner`rollback`;
        }
        assert.equal(
          (
            await contender`select pg_try_advisory_xact_lock(hashtextextended('alsamad:ke2:locale-integrity',0)) as acquired`
          )[0].acquired,
          true,
          `competing connection acquires after ${ending}`,
        );
        await contender`rollback`;
      } finally {
        try {
          await owner`rollback`;
        } catch {}
        try {
          await contender`rollback`;
        } catch {}
        owner.release();
        contender.release();
      }
    };
    await proveAdvisoryRelease("commit");
    await proveAdvisoryRelease("rollback");

    await queryClient`delete from editorial_users where id=${actor}::uuid`;
    assert.equal(
      (await queryClient`select count(*)::int as count from topics`)[0]?.count,
      0,
      "KE-2A verification leaves zero topic rows",
    );
    console.log(
      "PASS KE-2A: exact topics schema, lifecycle, active actors, timestamps, locale integrity, advisory locking, synthetic rollback fixtures, and zero seeds",
    );
  }

  console.log(
    "PASS schema tables: exactly 17 Release 1 tables plus Editorial Identity, topics, and the runtime-inert users and user_identities persistence",
  );
  console.log(
    "PASS Editorial Identity Foundation: exact four-column table, UUIDv7/variant and lifecycle enforcement, zero rows, synthetic fixtures rolled back",
  );
  console.log(
    "PASS M4: 8 tables, 12 restrictive foreign keys, pgcrypto checksums, zero seed rows",
  );
  console.log("PASS seeds: ar=1, en=1, geographic_areas=0");
  console.log("PASS M5.1: 6 Quran tables, synthetic fixtures rolled back");
  console.log("Real PostgreSQL M3/M4/M5.1 verification passed.");
} finally {
  await queryClient.end();
}
