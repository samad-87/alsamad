/**
 * Composition root for the reader's content source.
 *
 * M5.4 wires the reader and homepage to the static, always-honest "nothing
 * imported yet" source below — that is the true current state of the
 * system: no import has run, so every surah is genuinely "empty". No
 * database credentials or connection are required to build or run the app.
 *
 * `createDatabaseQuranContentSource` (./db-source.ts) is fully implemented
 * and tested against the real M5.1 schema as the designated future
 * swap-in: once an import has published content, changing this function to
 * return it is a one-line change, not an architecture change.
 */
import { emptyQuranContentSource } from "./static-source";
import type { QuranContentSource } from "./types";

export function getQuranContentSource(): QuranContentSource {
  return emptyQuranContentSource;
}
