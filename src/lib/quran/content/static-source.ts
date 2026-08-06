/**
 * Deterministic, side-effect-free QuranContentSource.
 *
 * No filesystem, no network, no database. With no overrides, every surah
 * honestly reports "empty" — because as of M5.4 nothing has actually been
 * imported. Overrides let tests (and a future orchestrator) express
 * "pending" or "available" for specific surahs without touching this file
 * or any UI component.
 */
import { QURAN_SURAH_COUNT, surahStructures } from "./structure";
import type {
  QuranAvailabilitySnapshot,
  QuranContentSource,
  QuranContentStatus,
  SurahAvailability,
} from "./types";

export interface SurahAvailabilityOverride {
  readonly status: QuranContentStatus;
  /** Ignored unless status is "available". */
  readonly ayahCount?: number;
}

export type SurahAvailabilityOverrides = Readonly<
  Record<number, SurahAvailabilityOverride>
>;

function overallStatus(list: readonly SurahAvailability[]): QuranContentStatus {
  const availableCount = list.filter((s) => s.status === "available").length;
  if (availableCount === list.length) {
    return "available";
  }
  const hasProgress = list.some((s) => s.status !== "empty");
  return hasProgress ? "pending" : "empty";
}

export function createStaticQuranContentSource(
  overrides: SurahAvailabilityOverrides = {},
): QuranContentSource {
  function availabilityFor(surahNumber: number): SurahAvailability {
    const override = overrides[surahNumber];
    if (!override) {
      return { surahNumber, status: "empty", ayahCount: null };
    }
    return {
      surahNumber,
      status: override.status,
      ayahCount:
        override.status === "available" ? (override.ayahCount ?? null) : null,
    };
  }

  return {
    kind: "static",
    async getSurahAvailability(surahNumber) {
      return availabilityFor(surahNumber);
    },
    async listSurahAvailability() {
      return surahStructures.map((surah) => availabilityFor(surah.number));
    },
    async getSnapshot(): Promise<QuranAvailabilitySnapshot> {
      const list = surahStructures.map((surah) =>
        availabilityFor(surah.number),
      );
      return {
        status: overallStatus(list),
        availableSurahCount: list.filter((s) => s.status === "available")
          .length,
        totalSurahCount: QURAN_SURAH_COUNT,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

/** The current honest default: nothing has been imported yet. */
export const emptyQuranContentSource = createStaticQuranContentSource();
