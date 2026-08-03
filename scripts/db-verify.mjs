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
    ["geographic_areas", "locales"],
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

  console.log("PASS schema tables: geographic_areas, locales (exactly 2)");
  console.log("PASS seeds: ar=1, en=1, geographic_areas=0");
  console.log("Real PostgreSQL M3 verification passed.");
} finally {
  await queryClient.end();
}
