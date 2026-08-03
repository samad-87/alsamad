import assert from "node:assert/strict";

import { sql } from "drizzle-orm";
import { validate as validateUuid, version as uuidVersion } from "uuid";

import { db, queryClient } from "../src/db/client.ts";
import { createId } from "../src/db/ids.ts";

try {
  const connection = await db.execute(sql`select 1 as connected`);
  assert.equal(connection[0]?.connected, 1);

  await queryClient.begin(async (transaction) => {
    const result = await transaction`select 42 as transaction_value`;
    assert.equal(result[0]?.transaction_value, 42);
  });

  const id = createId();
  const sample = "السَّمَد — Arabic UTF-8 ✓";
  const persisted = await queryClient`
    select
      ${id}::uuid::text as id,
      ${sample}::text as sample,
      current_setting('server_encoding') as encoding,
      current_setting('TimeZone') as timezone,
      now() = now() at time zone 'UTC' as utc_semantics
  `;

  assert.equal(validateUuid(persisted[0]?.id), true);
  assert.equal(uuidVersion(persisted[0]?.id), 7);
  assert.equal(persisted[0]?.sample, sample);
  assert.equal(persisted[0]?.encoding, "UTF8");
  assert.equal(persisted[0]?.timezone, "UTC");
  assert.equal(persisted[0]?.utc_semantics, true);

  const physicalTables = await queryClient`
    select count(*)::int as count
    from information_schema.tables
    where table_schema not in ('pg_catalog', 'information_schema')
      and table_type = 'BASE TABLE'
  `;
  assert.equal(physicalTables[0]?.count, 0);

  console.log("Real PostgreSQL foundation verification passed.");
} finally {
  await queryClient.end();
}
