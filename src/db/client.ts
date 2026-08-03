import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { assertSafeDatabaseTarget, readDatabaseEnv } from "./env";

const databaseEnv = readDatabaseEnv();

assertSafeDatabaseTarget(databaseEnv);

export const queryClient = postgres(databaseEnv.DATABASE_URL, {
  max: databaseEnv.NODE_ENV === "test" ? 1 : 10,
  ssl: databaseEnv.DATABASE_SSL === "true" ? "require" : false,
  onnotice: () => undefined,
});

export const db = drizzle(queryClient);
