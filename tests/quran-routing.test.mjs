import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const i18n = read("../src/lib/i18n.ts");
const surahPage = read("../src/app/[locale]/quran/[surah]/page.tsx");
const quranIndexPage = read("../src/app/[locale]/quran/page.tsx");
const sections = read("../src/components/home/sections.tsx");
const surahHeader = read("../src/components/quran/surah-header.tsx");
const versePlaceholder = read("../src/components/quran/verse-placeholder.tsx");
const emptyReaderState = read("../src/components/quran/empty-reader-state.tsx");
const surahSidebar = read("../src/components/quran/surah-sidebar.tsx");
const searchBar = read("../src/components/quran/search-bar.tsx");

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

test("routing: both quran routes exist", () => {
  assert.ok(
    existsSync(new URL("../src/app/[locale]/quran/page.tsx", import.meta.url)),
  );
  assert.ok(
    existsSync(
      new URL("../src/app/[locale]/quran/[surah]/page.tsx", import.meta.url),
    ),
  );
});

test("routing: surah params are generated from real structure, not a mock module", () => {
  assert.match(surahPage, /generateStaticParams/);
  assert.match(surahPage, /surahStructures\.map/);
  assert.doesNotMatch(surahPage, /quran-reader-mock/);
});

test("routing: an unresolved surah slug 404s instead of rendering a fabricated page", () => {
  assert.match(surahPage, /if \(!surah\) notFound\(\);/);
});

test("routing: no page imports the deleted mock module", () => {
  for (const source of [surahPage, quranIndexPage, sections]) {
    assert.doesNotMatch(source, /quran-reader-mock/);
  }
});

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

test("localization: the three honest states are localized in both languages", () => {
  for (const key of [
    "quranStatusEmpty",
    "quranStatusEmptyBody",
    "quranStatusPending",
    "quranStatusPendingBody",
    "quranStatusAvailable",
    "quranStatusAvailableBody",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    const matches = i18n.match(pattern) ?? [];
    assert.ok(
      matches.length >= 2,
      `expected "${key}" to be defined for both locales, found ${matches.length}`,
    );
  }
});

test("localization: status copy is present in both ar and en blocks", () => {
  assert.match(i18n, /ar:\s*\{[\s\S]*?quranStatusEmpty:\s*"لم يتم استيراد/);
  assert.match(
    i18n,
    /en:\s*\{[\s\S]*?quranStatusEmpty:\s*"No content imported/,
  );
});

// ---------------------------------------------------------------------------
// Honest placeholder behaviour
// ---------------------------------------------------------------------------

const FABRICATED_CONTENT_PATTERN =
  /Prophet Muhammad|النبي محمد|ﷺ|قال الله تعالى|قال رسول الله|بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/;

test("honest placeholder: no fabricated Quranic or religious text in the reader UI", () => {
  for (const source of [
    surahPage,
    quranIndexPage,
    surahHeader,
    versePlaceholder,
    emptyReaderState,
    surahSidebar,
    searchBar,
    sections,
  ]) {
    assert.doesNotMatch(source, FABRICATED_CONTENT_PATTERN);
  }
});

test("honest placeholder: the reader still shows the fixed placeholder marker for available content", () => {
  assert.match(versePlaceholder, /PLACEHOLDER_NOTICE/);
  assert.match(versePlaceholder, /from "@\/lib\/quran\/content\/types"/);
});

test("honest placeholder: empty and pending states use dedicated honest copy, not a generic fixture-only message", () => {
  assert.match(emptyReaderState, /"no-content-imported"/);
  assert.match(emptyReaderState, /"import-pending"/);
  assert.match(emptyReaderState, /quranStatusEmptyBody/);
  assert.match(emptyReaderState, /quranStatusPendingBody/);
});

test("honest placeholder: the reader branches on all three states before rendering verses", () => {
  assert.match(surahPage, /surah\.status === "empty"/);
  assert.match(surahPage, /surah\.status === "pending"/);
  assert.match(surahPage, /surah\.status === "available"/);
});

test("the deleted mock module no longer exists on disk", () => {
  assert.equal(
    existsSync(new URL("../src/lib/quran-reader-mock.ts", import.meta.url)),
    false,
  );
});
