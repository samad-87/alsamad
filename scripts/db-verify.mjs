import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
      "quran_ayah_texts",
      "quran_ayahs",
      "quran_structural_markers",
      "quran_surahs",
      "quran_translation_editions",
      "quran_translation_texts",
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

  console.log("PASS schema tables: exactly 16 cumulative Release 1 tables");
  console.log(
    "PASS M4: 8 tables, 12 restrictive foreign keys, pgcrypto checksums, zero seed rows",
  );
  console.log("PASS seeds: ar=1, en=1, geographic_areas=0");
  console.log("PASS M5.1: 6 Quran tables, synthetic fixtures rolled back");
  console.log("Real PostgreSQL M3/M4/M5.1 verification passed.");
} finally {
  await queryClient.end();
}
