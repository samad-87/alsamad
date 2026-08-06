/**
 * Composition root for the Adhkar content source.
 *
 * This milestone wires every Adhkar page to the static, always-honest
 * "nothing verified yet" source below — the true current state of the
 * system: no dhikr content has been reviewed or published, so every
 * category is genuinely "empty". No database credentials or connection
 * are required to build or run the app.
 *
 * Unlike the Quran integration foundation (src/lib/quran/content), no
 * already-approved database contract exists yet that explicitly authorizes
 * storing verified Adhkar content in a specific schema shape. Per this
 * milestone's scope, that means the read abstraction stops here: a future
 * milestone that receives an explicit, approved schema contract for
 * verified Adhkar content should add a guarded source (mirroring
 * src/lib/quran/content/db-source.ts) and swap it in here — a change to
 * this one function, not to any UI component.
 */
import { emptyAdhkarContentSource } from "./static-source";
import type { AdhkarContentSource } from "./types";

export function getAdhkarContentSource(): AdhkarContentSource {
  return emptyAdhkarContentSource;
}
