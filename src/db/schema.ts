import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const locales = pgTable(
  "locales",
  {
    id: uuid("id").primaryKey(),
    code: varchar("code", { length: 16 }).notNull(),
    languageTag: varchar("language_tag", { length: 35 }).notNull(),
    languageCode: varchar("language_code", { length: 8 }).notNull(),
    scriptCode: varchar("script_code", { length: 4 }),
    regionCode: varchar("region_code", { length: 3 }),
    direction: varchar("direction", { length: 3 }).notNull(),
    displayName: varchar("display_name", { length: 100 }).notNull(),
    nativeName: varchar("native_name", { length: 100 }).notNull(),
    fallbackLocaleId: uuid("fallback_locale_id"),
    isEnabled: boolean("is_enabled").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_locales__code").on(table.code),
    unique("uq_locales__language_tag").on(table.languageTag),
    check("ck_locales__direction", sql`${table.direction} in ('rtl', 'ltr')`),
    check("ck_locales__sort_order", sql`${table.sortOrder} >= 0`),
    check(
      "ck_locales__fallback_not_self",
      sql`${table.fallbackLocaleId} is null or ${table.fallbackLocaleId} <> ${table.id}`,
    ),
    check(
      "ck_locales__code_lowercase",
      sql`${table.code} = lower(${table.code})`,
    ),
    check(
      "ck_locales__language_code_lowercase",
      sql`${table.languageCode} = lower(${table.languageCode})`,
    ),
    check(
      "ck_locales__script_code",
      sql`${table.scriptCode} is null or ${table.scriptCode} ~ '^[A-Z][a-z]{3}$'`,
    ),
    check(
      "ck_locales__region_code",
      sql`${table.regionCode} is null or ${table.regionCode} ~ '^([A-Z]{2}|[0-9]{3})$'`,
    ),
    index("ix_locales__enabled_sort_order").on(
      table.isEnabled,
      table.sortOrder,
    ),
    index("ix_locales__fallback_locale_id").on(table.fallbackLocaleId),
    foreignKey({
      name: "fk_locales__fallback_locale_id",
      columns: [table.fallbackLocaleId],
      foreignColumns: [table.id],
    }).onDelete("restrict"),
  ],
);

export const geographicAreas = pgTable(
  "geographic_areas",
  {
    id: uuid("id").primaryKey(),
    parentId: uuid("parent_id"),
    areaType: varchar("area_type", { length: 16 }).notNull(),
    countryCode: varchar("country_code", { length: 2 }),
    subdivisionCode: varchar("subdivision_code", { length: 16 }),
    cityCode: varchar("city_code", { length: 64 }),
    slug: varchar("slug", { length: 128 }).notNull(),
    displayName: varchar("display_name", { length: 160 }).notNull(),
    timezone: varchar("timezone", { length: 64 }),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "ck_geographic_areas__parent_not_self",
      sql`${table.parentId} is null or ${table.parentId} <> ${table.id}`,
    ),
    check(
      "ck_geographic_areas__area_type",
      sql`${table.areaType} in ('country', 'region', 'city')`,
    ),
    check(
      "ck_geographic_areas__country_code",
      sql`${table.countryCode} is not null and ${table.countryCode} ~ '^[A-Z]{2}$'`,
    ),
    check(
      "ck_geographic_areas__slug",
      sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`,
    ),
    check(
      "ck_geographic_areas__latitude",
      sql`${table.latitude} is null or ${table.latitude} between -90 and 90`,
    ),
    check(
      "ck_geographic_areas__longitude",
      sql`${table.longitude} is null or ${table.longitude} between -180 and 180`,
    ),
    check(
      "ck_geographic_areas__city_timezone",
      sql`${table.areaType} <> 'city' or ${table.timezone} is not null`,
    ),
    unique("uq_geographic_areas__parent_type_slug")
      .on(table.parentId, table.areaType, table.slug)
      .nullsNotDistinct(),
    uniqueIndex("uq_geographic_areas__country_code")
      .on(table.countryCode)
      .where(sql`${table.areaType} = 'country'`),
    uniqueIndex("uq_geographic_areas__country_subdivision_code")
      .on(table.countryCode, table.subdivisionCode)
      .where(sql`${table.subdivisionCode} is not null`),
    uniqueIndex("uq_geographic_areas__country_city_code")
      .on(table.countryCode, table.cityCode)
      .where(sql`${table.cityCode} is not null`),
    index("ix_geographic_areas__parent_id").on(table.parentId),
    index("ix_geographic_areas__area_type").on(table.areaType),
    index("ix_geographic_areas__country_code").on(table.countryCode),
    index("ix_geographic_areas__timezone").on(table.timezone),
    index("ix_geographic_areas__is_active").on(table.isActive),
    foreignKey({
      name: "fk_geographic_areas__parent_id",
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("restrict"),
  ],
);

export const release1DomainTableCount = 2 as const;
