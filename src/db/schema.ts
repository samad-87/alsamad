import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
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

export const m3DomainTableCount = 2 as const;

export const licenses = pgTable("licenses", {
  id: uuid("id").primaryKey(),
  providerCode: varchar("provider_code", { length: 64 }).notNull(),
  licenseKey: varchar("license_key", { length: 128 }).notNull(),
  version: varchar("version", { length: 64 }).notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  rightsScope: varchar("rights_scope", { length: 24 }).notNull(),
  attributionText: text("attribution_text").notNull(),
  termsUrl: text("terms_url"),
  retentionPolicy: varchar("retention_policy", { length: 24 }).notNull(),
  retentionDays: integer("retention_days"),
  inApplicationDisplayAllowed: boolean("in_application_display_allowed")
    .notNull()
    .default(false),
  standaloneRedistributionAllowed: boolean("standalone_redistribution_allowed")
    .notNull()
    .default(false),
  derivativesAllowed: boolean("derivatives_allowed").notNull().default(false),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveUntil: timestamp("effective_until", { withTimezone: true }),
  status: varchar("status", { length: 16 }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const works = pgTable("works", {
  id: uuid("id").primaryKey(),
  canonicalKey: varchar("canonical_key", { length: 160 }).notNull().unique(),
  workType: varchar("work_type", { length: 24 }).notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  originalLanguageCode: varchar("original_language_code", {
    length: 8,
  }).notNull(),
  authorityName: varchar("authority_name", { length: 300 }),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const editions = pgTable(
  "editions",
  {
    id: uuid("id").primaryKey(),
    workId: uuid("work_id")
      .notNull()
      .references(() => works.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    editionKey: varchar("edition_key", { length: 160 }).notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    languageCode: varchar("language_code", { length: 8 }).notNull(),
    scriptCode: varchar("script_code", { length: 4 }),
    displayName: varchar("display_name", { length: 300 }).notNull(),
    providerCode: varchar("provider_code", { length: 64 }).notNull(),
    providerEditionId: varchar("provider_edition_id", {
      length: 256,
    }).notNull(),
    importVersion: varchar("import_version", { length: 128 }).notNull(),
    sourceManifestChecksum: varchar("source_manifest_checksum", {
      length: 64,
    }).notNull(),
    providerMetadata: jsonb("provider_metadata").notNull().default({}),
    publicationState: varchar("publication_state", { length: 16 })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    isActiveRelease: boolean("is_active_release").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_editions__active_release_per_work")
      .on(table.workId)
      .where(
        sql`${table.isActiveRelease} and ${table.publicationState} = 'published'`,
      ),
  ],
);

export const passages = pgTable("passages", {
  id: uuid("id").primaryKey(),
  workId: uuid("work_id")
    .notNull()
    .references(() => works.id, { onDelete: "restrict", onUpdate: "restrict" }),
  parentPassageId: uuid("parent_passage_id"),
  canonicalLocator: varchar("canonical_locator", { length: 200 }).notNull(),
  passageType: varchar("passage_type", { length: 24 }).notNull(),
  sequenceNumber: integer("sequence_number").notNull(),
  depth: smallint("depth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const passageTexts = pgTable("passage_texts", {
  id: uuid("id").primaryKey(),
  editionId: uuid("edition_id")
    .notNull()
    .references(() => editions.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
  passageId: uuid("passage_id")
    .notNull()
    .references(() => passages.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
  textContent: text("text_content").notNull(),
  normalizedChecksum: varchar("normalized_checksum", { length: 64 }).notNull(),
  sourceChecksum: varchar("source_checksum", { length: 64 }).notNull(),
  publicationState: varchar("publication_state", { length: 16 })
    .notNull()
    .default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentItems = pgTable("content_items", {
  id: uuid("id").primaryKey(),
  canonicalKey: varchar("canonical_key", { length: 160 }).notNull().unique(),
  contentType: varchar("content_type", { length: 32 }).notNull(),
  originKind: varchar("origin_kind", { length: 16 }).notNull(),
  owningModule: varchar("owning_module", { length: 32 }).notNull(),
  isSensitive: boolean("is_sensitive").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contentRevisions = pgTable("content_revisions", {
  id: uuid("id").primaryKey(),
  contentItemId: uuid("content_item_id")
    .notNull()
    .references(() => contentItems.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
  predecessorRevisionId: uuid("predecessor_revision_id"),
  revisionNumber: integer("revision_number").notNull(),
  sourceText: text("source_text").notNull(),
  sourceLanguageCode: varchar("source_language_code", { length: 8 }).notNull(),
  verificationState: varchar("verification_state", { length: 20 })
    .notNull()
    .default("unverified"),
  publicationState: varchar("publication_state", { length: 16 })
    .notNull()
    .default("draft"),
  provenanceKind: varchar("provenance_kind", { length: 16 }).notNull(),
  providerCode: varchar("provider_code", { length: 64 }),
  providerRecordId: varchar("provider_record_id", { length: 256 }),
  sourceManifestChecksum: varchar("source_manifest_checksum", { length: 64 }),
  contentChecksum: varchar("content_checksum", { length: 64 }).notNull(),
  schemaVersion: integer("schema_version").notNull().default(1),
  lockVersion: integer("lock_version").notNull().default(1),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sourceReferences = pgTable("source_references", {
  id: uuid("id").primaryKey(),
  contentRevisionId: uuid("content_revision_id")
    .notNull()
    .references(() => contentRevisions.id, {
      onDelete: "restrict",
      onUpdate: "restrict",
    }),
  citedWorkId: uuid("cited_work_id")
    .notNull()
    .references(() => works.id, { onDelete: "restrict", onUpdate: "restrict" }),
  citedEditionId: uuid("cited_edition_id").references(() => editions.id, {
    onDelete: "restrict",
    onUpdate: "restrict",
  }),
  citedPassageId: uuid("cited_passage_id").references(() => passages.id, {
    onDelete: "restrict",
    onUpdate: "restrict",
  }),
  referenceRole: varchar("reference_role", { length: 20 }).notNull(),
  locatorLabel: varchar("locator_label", { length: 300 }).notNull(),
  quotation: text("quotation"),
  quotationChecksum: varchar("quotation_checksum", { length: 64 }),
  sourceUrl: text("source_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const release1DomainTableCount = 10 as const;

export const quranSurahs = pgTable(
  "quran_surahs",
  {
    id: uuid("id").primaryKey(),
    workId: uuid("work_id")
      .notNull()
      .references(() => works.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    passageId: uuid("passage_id")
      .notNull()
      .references(() => passages.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    canonicalKey: varchar("canonical_key", { length: 64 }).notNull(),
    surahNumber: smallint("surah_number").notNull(),
    ayahCount: smallint("ayah_count").notNull(),
    nameArabic: varchar("name_arabic", { length: 120 }).notNull(),
    revelationOrder: smallint("revelation_order"),
    revelationPlace: varchar("revelation_place", { length: 16 }),
    providerAliases: jsonb("provider_aliases").notNull().default([]),
    sourceRecordChecksum: varchar("source_record_checksum", {
      length: 64,
    }).notNull(),
    publicationState: varchar("publication_state", { length: 16 })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_quran_surahs__work_number").on(table.workId, table.surahNumber),
    unique("uq_quran_surahs__passage").on(table.passageId),
    unique("uq_quran_surahs__canonical_key").on(table.canonicalKey),
    unique("uq_quran_surahs__revelation_order").on(table.revelationOrder),
    index("ix_quran_surahs__work_number").on(table.workId, table.surahNumber),
    index("ix_quran_surahs__publication_state").on(table.publicationState),
    index("ix_quran_surahs__provider_aliases").using(
      "gin",
      table.providerAliases,
    ),
  ],
);

export const quranAyahs = pgTable(
  "quran_ayahs",
  {
    id: uuid("id").primaryKey(),
    surahId: uuid("surah_id")
      .notNull()
      .references(() => quranSurahs.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    passageId: uuid("passage_id")
      .notNull()
      .references(() => passages.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    canonicalKey: varchar("canonical_key", { length: 80 }).notNull(),
    ayahNumber: smallint("ayah_number").notNull(),
    globalSequenceNumber: smallint("global_sequence_number").notNull(),
    providerAliases: jsonb("provider_aliases").notNull().default([]),
    sourceRecordChecksum: varchar("source_record_checksum", {
      length: 64,
    }).notNull(),
    publicationState: varchar("publication_state", { length: 16 })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_quran_ayahs__surah_number").on(table.surahId, table.ayahNumber),
    unique("uq_quran_ayahs__passage").on(table.passageId),
    unique("uq_quran_ayahs__canonical_key").on(table.canonicalKey),
    unique("uq_quran_ayahs__global_sequence").on(table.globalSequenceNumber),
    index("ix_quran_ayahs__surah_number").on(table.surahId, table.ayahNumber),
    index("ix_quran_ayahs__publication_state").on(table.publicationState),
    index("ix_quran_ayahs__provider_aliases").using(
      "gin",
      table.providerAliases,
    ),
  ],
);

export const quranAyahTexts = pgTable(
  "quran_ayah_texts",
  {
    id: uuid("id").primaryKey(),
    editionId: uuid("edition_id")
      .notNull()
      .references(() => editions.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    ayahId: uuid("ayah_id")
      .notNull()
      .references(() => quranAyahs.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    passageTextId: uuid("passage_text_id")
      .notNull()
      .references(() => passageTexts.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    sourceRecordChecksum: varchar("source_record_checksum", {
      length: 64,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_quran_ayah_texts__edition_ayah").on(
      table.editionId,
      table.ayahId,
    ),
    unique("uq_quran_ayah_texts__passage_text").on(table.passageTextId),
    index("ix_quran_ayah_texts__ayah").on(table.ayahId),
  ],
);

export const quranStructuralMarkers = pgTable(
  "quran_structural_markers",
  {
    id: uuid("id").primaryKey(),
    editionId: uuid("edition_id")
      .notNull()
      .references(() => editions.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    parentMarkerId: uuid("parent_marker_id"),
    markerKind: varchar("marker_kind", { length: 16 }).notNull(),
    markerNumber: smallint("marker_number").notNull(),
    canonicalKey: varchar("canonical_key", { length: 96 }).notNull(),
    startAyahId: uuid("start_ayah_id")
      .notNull()
      .references(() => quranAyahs.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    endAyahId: uuid("end_ayah_id")
      .notNull()
      .references(() => quranAyahs.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    providerAliases: jsonb("provider_aliases").notNull().default([]),
    sourceRecordChecksum: varchar("source_record_checksum", {
      length: 64,
    }).notNull(),
    publicationState: varchar("publication_state", { length: 16 })
      .notNull()
      .default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    foreignKey({
      name: "fk_quran_structural_markers__parent",
      columns: [table.parentMarkerId],
      foreignColumns: [table.id],
    })
      .onDelete("restrict")
      .onUpdate("restrict"),
    unique("uq_quran_structural_markers__kind_number").on(
      table.editionId,
      table.markerKind,
      table.markerNumber,
    ),
    unique("uq_quran_structural_markers__canonical_key").on(
      table.editionId,
      table.canonicalKey,
    ),
    index("ix_quran_structural_markers__range").on(
      table.editionId,
      table.startAyahId,
      table.endAyahId,
    ),
    index("ix_quran_structural_markers__parent").on(table.parentMarkerId),
    index("ix_quran_structural_markers__publication_state").on(
      table.publicationState,
    ),
    index("ix_quran_structural_markers__provider_aliases").using(
      "gin",
      table.providerAliases,
    ),
  ],
);

export const quranTranslationEditions = pgTable(
  "quran_translation_editions",
  {
    id: uuid("id").primaryKey(),
    editionId: uuid("edition_id")
      .notNull()
      .references(() => editions.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    localeId: uuid("locale_id")
      .notNull()
      .references(() => locales.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenses.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    translatorName: varchar("translator_name", { length: 300 }).notNull(),
    methodology: text("methodology").notNull(),
    reviewStatus: varchar("review_status", { length: 16 })
      .notNull()
      .default("pending"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    isActiveRelease: boolean("is_active_release").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_quran_translation_editions__edition").on(table.editionId),
    index("ix_quran_translation_editions__locale_status").on(
      table.localeId,
      table.reviewStatus,
    ),
    index("ix_quran_translation_editions__license").on(table.licenseId),
    index("ix_quran_translation_editions__review_status").on(
      table.reviewStatus,
    ),
    uniqueIndex("uq_quran_translation_editions__active_release_per_locale")
      .on(table.localeId)
      .where(
        sql`${table.isActiveRelease} and ${table.reviewStatus} = 'approved'`,
      ),
  ],
);

export const quranTranslationTexts = pgTable(
  "quran_translation_texts",
  {
    id: uuid("id").primaryKey(),
    translationEditionId: uuid("translation_edition_id")
      .notNull()
      .references(() => quranTranslationEditions.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    ayahId: uuid("ayah_id")
      .notNull()
      .references(() => quranAyahs.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    passageTextId: uuid("passage_text_id")
      .notNull()
      .references(() => passageTexts.id, {
        onDelete: "restrict",
        onUpdate: "restrict",
      }),
    sourceRecordChecksum: varchar("source_record_checksum", {
      length: 64,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_quran_translation_texts__edition_ayah").on(
      table.translationEditionId,
      table.ayahId,
    ),
    unique("uq_quran_translation_texts__passage_text").on(table.passageTextId),
    index("ix_quran_translation_texts__ayah").on(table.ayahId),
  ],
);

export const editorialUsers = pgTable(
  "editorial_users",
  {
    id: uuid("id").primaryKey(),
    status: varchar("status", { length: 16 }).notNull().default("disabled"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "ck_editorial_users__id_uuidv7",
      sql`(get_byte(uuid_send(${table.id}), 6) >> 4) = 7 and (get_byte(uuid_send(${table.id}), 8) & 192) = 128`,
    ),
    check(
      "ck_editorial_users__status",
      sql`${table.status} in ('disabled', 'active')`,
    ),
  ],
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").primaryKey(),
    canonicalKey: varchar("canonical_key", { length: 160 }).notNull(),
    localizedNames: jsonb("localized_names")
      .$type<Record<string, string>>()
      .notNull(),
    status: varchar("status", { length: 16 }).notNull().default("draft"),
    createdBy: uuid("created_by").notNull(),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("uq_topics__canonical_key").on(table.canonicalKey),
    check(
      "ck_topics__id_uuidv7",
      sql`(get_byte(uuid_send(${table.id}), 6) >> 4) = 7 and (get_byte(uuid_send(${table.id}), 8) & 192) = 128`,
    ),
    check(
      "ck_topics__canonical_key",
      sql`btrim(${table.canonicalKey}) <> '' and ${table.canonicalKey} = lower(${table.canonicalKey})`,
    ),
    check(
      "ck_topics__localized_names",
      sql`jsonb_typeof(${table.localizedNames}) = 'object' and ${table.localizedNames} <> '{}'::jsonb`,
    ),
    check(
      "ck_topics__status",
      sql`${table.status} in ('draft', 'approved', 'retired')`,
    ),
    check(
      "ck_topics__approval_evidence",
      sql`(${table.status} = 'draft' and ${table.approvedBy} is null and ${table.approvedAt} is null) or (${table.status} = 'approved' and ${table.approvedBy} is not null and ${table.approvedAt} is not null) or (${table.status} = 'retired' and ((${table.approvedBy} is null and ${table.approvedAt} is null) or (${table.approvedBy} is not null and ${table.approvedAt} is not null)))`,
    ),
    foreignKey({
      name: "fk_topics__created_by",
      columns: [table.createdBy],
      foreignColumns: [editorialUsers.id],
    })
      .onUpdate("restrict")
      .onDelete("restrict"),
    foreignKey({
      name: "fk_topics__approved_by",
      columns: [table.approvedBy],
      foreignColumns: [editorialUsers.id],
    })
      .onUpdate("restrict")
      .onDelete("restrict"),
    index("ix_topics__status").on(table.status),
  ],
);

export const m5DomainTableCount = 6 as const;
export const release1DomainTableCountAfterM5 = 16 as const;
export const editorialIdentityFoundationTableCount = 1 as const;
export const release1DomainTableCountAfterEditorialIdentityFoundation =
  17 as const;
