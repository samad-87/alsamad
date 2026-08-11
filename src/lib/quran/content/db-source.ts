/**
 * Database-backed QuranContentSource — the designated future connection
 * point to the M5.2 import harness's output.
 *
 * This reads the existing M5.1 schema exactly as designed and changes no
 * schema, no migration, and no import-harness architecture:
 *   - a surah with no `quran_surahs` row at all           -> "empty"
 *   - a surah row exists but is not `publicationState =
 *     "published"`, or has no ayah text rows yet          -> "pending"
 *   - a surah row is published and has ayah text rows     -> "available",
 *     with a real, sourced ayahCount (never fabricated)
 *
 * ARC-005 (`ADR-0006`, `ALSAMAD_DATABASE_ARCHITECTURE.md` §5.3.12): ayah text
 * availability is scoped to the single currently active Arabic edition, and
 * that candidate's full live eligibility (license currently active, not
 * expired, and permitted for in-application display) is re-derived in the
 * same query on every call — `is_active_release` alone is never treated as
 * proof of servability. A missing or currently ineligible active edition
 * yields no rows, which the existing classification below already reports
 * as the same honest "empty"/"pending" states; there is no fallback to any
 * other published edition.
 *
 * It is not wired into any page as of M5.4 (see ./source.ts) and requires
 * no credentials to exist in the codebase: every call is guarded so a
 * missing DATABASE_URL, an unreachable database, or any query failure
 * resolves to the same honest "empty" result instead of throwing. It never
 * fetches from a provider and never writes anything.
 */
import { QURAN_SURAH_COUNT, surahStructures } from "./structure";
import type {
  QuranAvailabilitySnapshot,
  QuranContentSource,
  QuranContentStatus,
  SurahAvailability,
} from "./types";

const QUERY_TIMEOUT_MS = 3000;

interface AvailabilityRow {
  readonly surah_number: number;
  readonly publication_state: string;
  readonly ayah_text_count: string | number;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error("quran availability query timed out")),
      ms,
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Returns null (never throws) whenever real availability cannot be
 * determined — missing credentials, an unreachable database, or a query
 * failure are all treated identically as "we don't know", which the caller
 * maps to the honest "empty" state.
 */
async function loadAvailabilityRows(): Promise<
  readonly AvailabilityRow[] | null
> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    const [{ db }, { sql }] = await Promise.all([
      import("@/db/client"),
      import("drizzle-orm"),
    ]);
    const rows = await withTimeout(
      db.execute(sql`
        with active_edition as (
          select e.id
          from editions e
          join works w on w.id = e.work_id
          join licenses lic on lic.id = e.license_id
          where w.work_type = 'quran'
            and e.is_active_release
            and e.publication_state = 'published'
            and lic.status = 'active'
            and lic.retention_policy <> 'no_storage'
            and lic.in_application_display_allowed
            and current_timestamp >= lic.effective_from
            and (lic.effective_until is null or current_timestamp < lic.effective_until)
        )
        select
          qs.surah_number as surah_number,
          qs.publication_state as publication_state,
          count(qat.id) as ayah_text_count
        from active_edition ae
        join quran_surahs qs on true
        left join quran_ayahs qa on qa.surah_id = qs.id
        left join quran_ayah_texts qat on qat.ayah_id = qa.id and qat.edition_id = ae.id
        group by qs.id, qs.surah_number, qs.publication_state
      `),
      QUERY_TIMEOUT_MS,
    );
    return rows as unknown as readonly AvailabilityRow[];
  } catch {
    return null;
  }
}

function classifyRow(row: AvailabilityRow): SurahAvailability {
  const ayahCount = Number(row.ayah_text_count);
  if (row.publication_state === "published" && ayahCount > 0) {
    return { surahNumber: row.surah_number, status: "available", ayahCount };
  }
  return { surahNumber: row.surah_number, status: "pending", ayahCount: null };
}

async function loadAvailabilityMap(): Promise<Map<
  number,
  SurahAvailability
> | null> {
  const rows = await loadAvailabilityRows();
  if (!rows) {
    return null;
  }
  const byNumber = new Map<number, SurahAvailability>();
  for (const row of rows) {
    byNumber.set(row.surah_number, classifyRow(row));
  }
  return byNumber;
}

export function createDatabaseQuranContentSource(): QuranContentSource {
  return {
    kind: "database",
    async getSurahAvailability(surahNumber) {
      const byNumber = await loadAvailabilityMap();
      return (
        byNumber?.get(surahNumber) ?? {
          surahNumber,
          status: "empty",
          ayahCount: null,
        }
      );
    },
    async listSurahAvailability() {
      const byNumber = await loadAvailabilityMap();
      return surahStructures.map(
        (surah) =>
          byNumber?.get(surah.number) ?? {
            surahNumber: surah.number,
            status: "empty" as const,
            ayahCount: null,
          },
      );
    },
    async getSnapshot(): Promise<QuranAvailabilitySnapshot> {
      const byNumber = await loadAvailabilityMap();
      const list = surahStructures.map(
        (surah) =>
          byNumber?.get(surah.number) ?? {
            surahNumber: surah.number,
            status: "empty" as const,
            ayahCount: null,
          },
      );
      const availableSurahCount = list.filter(
        (s) => s.status === "available",
      ).length;
      const hasProgress = list.some((s) => s.status !== "empty");
      const status: QuranContentStatus =
        availableSurahCount === QURAN_SURAH_COUNT
          ? "available"
          : hasProgress
            ? "pending"
            : "empty";
      return {
        status,
        availableSurahCount,
        totalSurahCount: QURAN_SURAH_COUNT,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}
