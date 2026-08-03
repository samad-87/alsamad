import { queryClient } from "../src/db/client.ts";

try {
  await queryClient.begin(async (sql) => {
    await sql`select 1 as seed_foundation`;
  });
  console.log("Foundation seed completed (no domain data).");
} finally {
  await queryClient.end();
}
