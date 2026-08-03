import { z } from "zod";

const databaseEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().startsWith("postgresql://"),
  DATABASE_SSL: z.enum(["true", "false"]).default("false"),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);
const SAFE_DATABASE_NAMES = /^(alsamad_(local|test))$/;

export const readDatabaseEnv = (
  source: NodeJS.ProcessEnv = process.env,
): DatabaseEnv => databaseEnvSchema.parse(source);

export function assertSafeDatabaseTarget(env: DatabaseEnv): void {
  const url = new URL(env.DATABASE_URL);

  if (env.NODE_ENV === "production") {
    throw new Error("Local database commands are prohibited in production.");
  }
  if (!LOCAL_HOSTS.has(url.hostname)) {
    throw new Error(
      `Database host ${url.hostname} is not an approved local target.`,
    );
  }
  if (!SAFE_DATABASE_NAMES.test(url.pathname.slice(1))) {
    throw new Error("Database name must be alsamad_local or alsamad_test.");
  }
  if (env.DATABASE_SSL === "true") {
    throw new Error(
      "Local lifecycle commands must not claim a remote TLS database.",
    );
  }
}
