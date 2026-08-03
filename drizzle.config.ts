import { defineConfig } from "drizzle-kit";

import { readDatabaseEnv } from "./src/db/env";

const databaseEnv = readDatabaseEnv();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: databaseEnv.DATABASE_URL },
  strict: true,
  verbose: true,
});
