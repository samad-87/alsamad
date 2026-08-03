import assert from "node:assert/strict";

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
      "geographic_areas",
      "licenses",
      "locales",
      "passage_texts",
      "passages",
      "source_references",
      "works",
    ],
  );

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

  const extension =
    await queryClient`select extname from pg_extension where extname = 'pgcrypto'`;
  assert.equal(extension.length, 1);
  const fks = await queryClient`
  select count(*)::int as count
  from pg_constraint c
  join pg_namespace n on n.oid = c.connamespace
  join pg_class source_table on source_table.oid = c.conrelid
  where n.nspname = 'public'
    and c.contype = 'f'
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
      await transaction`insert into licenses(id,provider_code,license_key,version,name,rights_scope,attribution_text,retention_policy,redistribution_allowed,effective_from,status)
      values(${ids4.license}::uuid,'fixture','rights','1','Fixture rights','permission','Fixture attribution','permanent',true,current_timestamp-'1 day'::interval,'active')`;
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

  console.log("PASS schema tables: exactly 10 cumulative Release 1 tables");
  console.log(
    "PASS M4: 8 tables, 12 restrictive foreign keys, pgcrypto checksums, zero seed rows",
  );
  console.log("PASS seeds: ar=1, en=1, geographic_areas=0");
  console.log("Real PostgreSQL M3 verification passed.");
} finally {
  await queryClient.end();
}
