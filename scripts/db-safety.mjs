import { assertSafeDatabaseTarget, readDatabaseEnv } from "../src/db/env.ts";

assertSafeDatabaseTarget(readDatabaseEnv());
console.log("Database safety guards passed.");
