import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import { queryClient } from "../src/db/client.ts";

try {
  const migrations = (await readdir("drizzle"))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  await queryClient.begin(async (transaction) => {
    for (const migration of migrations) {
      const migrationSql = await readFile(join("drizzle", migration), "utf8");
      await transaction.unsafe(migrationSql);
    }
  });
  console.log("Database migrations applied.");
} finally {
  await queryClient.end();
}
