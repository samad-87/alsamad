/**
 * Composition root for the Duas content source.
 *
 * This reflects the true current state honestly rather than defaulting
 * everything to empty: the existing, separately-maintained editorial
 * duas system (src/lib/general-duas.ts, routed at /duas/general) already
 * has real, published content, so the "general" category correctly
 * reports "available" with a real item count. Every other category
 * genuinely has nothing yet, so it reports "empty". No database
 * credentials or connection are required to build or run the app — this
 * only reads an existing in-repo module.
 *
 * The "general" override below is seeded with the real, already-published
 * `generalDuas` entries projected into the `DuaItem` shape (never invented
 * text) so `getCategoryAvailability`/`listCategoryAvailability` and
 * `getCategoryItems` stay derived from the same single array and can never
 * disagree on count or content — there is deliberately no separate
 * item-count override path to keep in sync by hand.
 *
 * No already-approved database contract exists yet that explicitly
 * authorizes storing Duas content in a specific schema shape, so — per
 * this milestone's UI + architecture-only scope — the read abstraction
 * stops here for every other category. A future milestone that receives
 * an explicit, approved schema contract should add a guarded source
 * (mirroring src/lib/quran/content/db-source.ts) and swap it in here — a
 * change to this one function, not to any UI component.
 */
import { generalDuas } from "@/lib/general-duas";
import { createStaticDuaContentSource } from "./static-source";
import { EMPTY_DUA_SOURCE_METADATA } from "./types";
import type { DuaContentSource, DuaItem } from "./types";

/**
 * Real Editorial General Dua entries, projected (not invented) from
 * `generalDuas` into the `DuaItem` shape. `title`/`arabicText` use the
 * Arabic form — the invariant, locale-independent identity of each entry,
 * consistent with `arabicText` always being Arabic regardless of page
 * locale. `kind` is always "editorial": these are, by their own published
 * disclosure, team-composed duas, never presented as authentic. `source`
 * stays the honest all-null metadata — these entries are not drawn from
 * the Quran or Sunnah, so attaching authenticity/source fields would be
 * fabricated, not real. `order` is the entries' existing, stable array
 * position — deterministic and never reshuffled per render.
 */
const GENERAL_DUA_ITEMS: readonly DuaItem[] = generalDuas.map(
  (dua, index): DuaItem => ({
    id: dua.slug,
    order: index + 1,
    kind: "editorial",
    title: dua.title.ar,
    arabicText: dua.arabic,
    translation: dua.translation,
    transliteration: dua.transliteration ?? null,
    source: EMPTY_DUA_SOURCE_METADATA,
  }),
);

const productionSource = createStaticDuaContentSource({
  general: { status: "available", items: GENERAL_DUA_ITEMS },
});

export function getDuaContentSource(): DuaContentSource {
  return productionSource;
}
