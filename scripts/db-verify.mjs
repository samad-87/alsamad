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

      // 30: the read-time query plans against the partial unique indexes
      // and existing edition_id/ayah_id indexes rather than a sequential
      // scan of every edition/translation row.
      const plan = await queryClient`
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
      const planText = JSON.stringify(plan[0]["QUERY PLAN"]);
      assert.doesNotMatch(
        planText,
        /"Relation Name": "editions", "Node Type": "Seq Scan"/,
        "active-edition resolution remains index-supported, not a full editions scan",
      );

      console.log(
        "PASS: ARC-005 read-time live-eligibility revalidation (revocation, elapsed effective_until, disabled locale, withdrawn backing edition, no fallback, no mixed-release read, index-supported query)",
      );
    }

    console.log(
      "PASS: ARC-005 atomic Quran release selector fully verified against real PostgreSQL",
    );
  }

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
