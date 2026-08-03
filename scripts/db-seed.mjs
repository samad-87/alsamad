import { queryClient } from "../src/db/client.ts";

const localeSeeds = [
  {
    id: "0198a7b0-0000-7000-8000-000000000001",
    code: "ar",
    languageTag: "ar",
    languageCode: "ar",
    scriptCode: "Arab",
    direction: "rtl",
    displayName: "Arabic",
    nativeName: "العربية",
    sortOrder: 10,
  },
  {
    id: "0198a7b0-0000-7000-8000-000000000002",
    code: "en",
    languageTag: "en",
    languageCode: "en",
    scriptCode: "Latn",
    direction: "ltr",
    displayName: "English",
    nativeName: "English",
    sortOrder: 20,
  },
];

try {
  await queryClient.begin(async (sql) => {
    for (const locale of localeSeeds) {
      await sql`
        insert into locales (
          id, code, language_tag, language_code, script_code, direction,
          display_name, native_name, is_enabled, sort_order
        ) values (
          ${locale.id}::uuid, ${locale.code}, ${locale.languageTag},
          ${locale.languageCode}, ${locale.scriptCode}, ${locale.direction},
          ${locale.displayName}, ${locale.nativeName}, true, ${locale.sortOrder}
        )
        on conflict (code) do update set
          language_tag = excluded.language_tag,
          language_code = excluded.language_code,
          script_code = excluded.script_code,
          region_code = null,
          direction = excluded.direction,
          display_name = excluded.display_name,
          native_name = excluded.native_name,
          fallback_locale_id = null,
          is_enabled = true,
          sort_order = excluded.sort_order,
          updated_at = current_timestamp
      `;
    }
  });
  console.log("M3 seed completed: 2 locales, 0 geographic areas.");
} finally {
  await queryClient.end();
}
