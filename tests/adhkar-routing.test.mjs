import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

/**
 * Strips JS/TSX comments so assertions about rendered/user-facing content
 * aren't tripped up by source comments that explicitly document an
 * absence (e.g. "no streaks" inside a JSDoc block).
 */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const i18n = read("../src/lib/i18n.ts");
const indexPage = read("../src/app/[locale]/adhkar/page.tsx");
const periodPage = read("../src/app/[locale]/adhkar/[period]/page.tsx");
const sections = read("../src/components/home/sections.tsx");
const clientControls = read("../src/components/client-controls.tsx");
const categoryCard = read("../src/components/adhkar/category-card.tsx");
const categoryExplorer = read("../src/components/adhkar/category-explorer.tsx");
const collectionReader = read("../src/components/adhkar/collection-reader.tsx");
const emptyState = read("../src/components/adhkar/empty-adhkar-state.tsx");
const sourceTrustPanel = read(
  "../src/components/adhkar/source-trust-panel.tsx",
);
const repetitionCounter = read(
  "../src/components/adhkar/repetition-counter.tsx",
);
const bookmarkButton = read("../src/components/adhkar/bookmark-button.tsx");
const globalsCss = read("../src/app/globals.css");

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

test("routing: the adhkar index and [period] routes exist", () => {
  assert.ok(
    existsSync(new URL("../src/app/[locale]/adhkar/page.tsx", import.meta.url)),
  );
  assert.ok(
    existsSync(
      new URL("../src/app/[locale]/adhkar/[period]/page.tsx", import.meta.url),
    ),
  );
});

test("routing: static params are generated from real structure, not a hardcoded list", () => {
  assert.match(periodPage, /generateStaticParams/);
  assert.match(periodPage, /implementedCategories\(\)/);
});

test("routing: an unresolved or unimplemented period 404s", () => {
  assert.match(
    periodPage,
    /if \(!category \|\| !category\.routeSlug\) notFound\(\);/,
  );
});

test("routing: the old DhikrReader/ReligiousPlaceholder prototype is gone", () => {
  assert.doesNotMatch(clientControls, /DhikrReader/);
  assert.doesNotMatch(clientControls, /ReligiousPlaceholder/);
});

test("routing: no broken links — the index only links categories that have a route", () => {
  assert.match(categoryCard, /if \(!data\.routeSlug\)/);
  assert.match(
    categoryCard,
    /href=\{`\/\$\{locale\}\/adhkar\/\$\{data\.routeSlug\}`\}/,
  );
});

// ---------------------------------------------------------------------------
// Homepage integration
// ---------------------------------------------------------------------------

test("homepage: morning and evening adhkar links are correct", () => {
  const adhkarSectionMatch = sections.match(
    /export async function AdhkarDuas[\s\S]*?\n}\n/,
  );
  assert.ok(adhkarSectionMatch, "expected to find the AdhkarDuas section");
  const body = adhkarSectionMatch[0];
  assert.match(body, /href:\s*`\/\$\{locale\}\/adhkar\/morning`/);
  assert.match(body, /href:\s*`\/\$\{locale\}\/adhkar\/evening`/);
});

test("homepage: the Adhkar section reflects honest, non-fabricated status", () => {
  const adhkarSectionMatch = sections.match(
    /export async function AdhkarDuas[\s\S]*?\n}\n/,
  );
  assert.ok(adhkarSectionMatch, "expected to find the AdhkarDuas section");
  const body = adhkarSectionMatch[0];
  assert.match(body, /getCategoryReaderData\("morning"\)/);
  assert.match(body, /getCategoryReaderData\("evening"\)/);
  assert.doesNotMatch(body, /getAdhkarOverallStatus/);
  assert.doesNotMatch(body, /adhkarStatusAvailable\s*:\s*true/);
});

test("homepage: no fake counts or live data in the Adhkar section", () => {
  const adhkarSectionMatch = sections.match(
    /export async function AdhkarDuas[\s\S]*?\n}\n/,
  );
  assert.ok(adhkarSectionMatch, "expected to find the AdhkarDuas section");
  const body = adhkarSectionMatch[0];
  assert.doesNotMatch(body, /\d+\s*(streak|day|verse|dhikr)s?\b/i);
});

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

test("localization: the three honest states are localized in both languages", () => {
  for (const key of [
    "adhkarStatusEmpty",
    "adhkarStatusEmptyBody",
    "adhkarStatusPending",
    "adhkarStatusPendingBody",
    "adhkarStatusAvailable",
    "adhkarStatusAvailableBody",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    const matches = i18n.match(pattern) ?? [];
    assert.ok(
      matches.length >= 2,
      `expected "${key}" to be defined for both locales, found ${matches.length}`,
    );
  }
});

test("localization: category labels exist for both languages", () => {
  for (const key of [
    "adhkarPrayerCategory",
    "adhkarSleep",
    "adhkarTravel",
    "adhkarGeneral",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    assert.equal((i18n.match(pattern) ?? []).length, 2, key);
  }
});

test("localization: source/trust field labels exist for both languages", () => {
  for (const key of [
    "adhkarSourceType",
    "adhkarSourceTitle",
    "adhkarCollection",
    "adhkarReferenceLocator",
    "adhkarGradingStatus",
    "adhkarReviewerStatus",
    "adhkarAttribution",
    "adhkarNotes",
    "adhkarVerificationDate",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    assert.equal((i18n.match(pattern) ?? []).length, 2, key);
  }
});

test("localization: ar block carries Arabic status copy, en block carries English", () => {
  assert.match(
    i18n,
    /ar:\s*\{[\s\S]*?adhkarStatusEmpty:\s*"لا يوجد محتوى موثّق بعد"/,
  );
  assert.match(
    i18n,
    /en:\s*\{[\s\S]*?adhkarStatusEmpty:\s*"No verified content available"/,
  );
});

// ---------------------------------------------------------------------------
// Honest content behaviour
// ---------------------------------------------------------------------------

const FABRICATED_CONTENT_PATTERN =
  /Prophet Muhammad|النبي محمد|ﷺ|قال الله تعالى|قال رسول الله|بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ|سُبْحَانَ اللَّه|أَسْتَغْفِرُ اللَّه/;

test("honest content: no fabricated adhkar/hadith text anywhere in the adhkar UI", () => {
  for (const source of [
    indexPage,
    periodPage,
    categoryCard,
    categoryExplorer,
    collectionReader,
    emptyState,
    sourceTrustPanel,
    repetitionCounter,
    bookmarkButton,
    sections,
  ]) {
    assert.doesNotMatch(source, FABRICATED_CONTENT_PATTERN);
  }
});

test("honest content: the collection reader shows a calm state instead of placeholder text when unverified", () => {
  assert.match(
    collectionReader,
    /status !== "available" \|\| items\.length === 0/,
  );
  assert.match(collectionReader, /EmptyAdhkarState/);
});

test("honest content: empty and pending states use dedicated honest copy", () => {
  assert.match(emptyState, /"no-content"/);
  assert.match(emptyState, /"pending-review"/);
  assert.match(emptyState, /adhkarStatusEmptyBody/);
  assert.match(emptyState, /adhkarStatusPendingBody/);
});

test("honest content: the source/trust panel never renders a metadata table for unverified content", () => {
  assert.match(sourceTrustPanel, /status !== "available" \|\| !source/);
});

test("no gamification: no streak, points, or celebratory language rendered in the adhkar UI", () => {
  for (const source of [
    collectionReader,
    repetitionCounter,
    sourceTrustPanel,
  ]) {
    assert.doesNotMatch(
      stripComments(source),
      /streak|confetti|celebrat|reward|points\b/i,
    );
  }
});

test("no completion claim: the repetition counter never renders a claim that a religious act is accepted or complete", () => {
  assert.doesNotMatch(
    stripComments(repetitionCounter),
    /accept(ed)?|complete!|قُبِل|مقبول/i,
  );
});

// ---------------------------------------------------------------------------
// Repetition interaction accessibility
// ---------------------------------------------------------------------------

test("repetition counter exposes an accessible label and a live count", () => {
  assert.match(repetitionCounter, /aria-label=/);
  assert.match(repetitionCounter, /aria-live="polite"/);
});

test("repetition counter has no vibration dependency", () => {
  assert.doesNotMatch(repetitionCounter, /navigator\.vibrate/);
});

test("repetition counter buttons are real <button> elements (keyboard operable by default)", () => {
  const buttonCount = (repetitionCounter.match(/<button/g) ?? []).length;
  assert.equal(buttonCount, 2);
});

test("touch target: the repetition button and reset action use existing large-target classes", () => {
  assert.match(repetitionCounter, /className="rep-button"/);
  assert.match(globalsCss, /\.rep-button\s*\{[\s\S]*?width:\s*7rem/);
  assert.match(globalsCss, /\.button\s*\{[\s\S]*?min-height:\s*2\.85rem/);
});

// ---------------------------------------------------------------------------
// RTL / LTR correctness
// ---------------------------------------------------------------------------

test("the collection reader marks Arabic text with lang and dir regardless of page locale", () => {
  assert.match(collectionReader, /lang="ar"/);
  assert.match(collectionReader, /dir="rtl"/);
});

// ---------------------------------------------------------------------------
// Accessibility semantics
// ---------------------------------------------------------------------------

test("bookmark button exposes aria-pressed and a locale-aware label", () => {
  assert.match(bookmarkButton, /aria-pressed=\{active\}/);
  assert.match(
    bookmarkButton,
    /aria-label=\{active \? c\.bookmarkRemove : c\.bookmarkAdd\}/,
  );
});

test("the index page uses a real page heading and landmark structure", () => {
  assert.match(indexPage, /PageHeader/);
  assert.match(indexPage, /Breadcrumbs/);
});

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

test("motion: no new animation dependency and no new @keyframes were introduced for adhkar", () => {
  const packageJson = read("../package.json");
  assert.doesNotMatch(packageJson, /framer-motion|gsap|react-spring|lottie/);
  const newAdhkarCss = globalsCss.slice(
    globalsCss.indexOf("Adhkar foundation"),
  );
  assert.doesNotMatch(newAdhkarCss, /@keyframes/);
});

test("motion: the collection reader reuses the existing restrained fade-in, not a new animation", () => {
  assert.match(collectionReader, /className="religious-card surface fade-in"/);
  assert.match(globalsCss, /\.fade-in\s*\{\s*animation:\s*fade-in-up/);
});

test("reduced motion: the existing global rule neutralizes all transitions/animations, covering new elements", () => {
  assert.match(
    globalsCss,
    /prefers-reduced-motion: reduce\)\s*\{[\s\S]*?animation-duration:\s*0\.01ms\s*!important/,
  );
});

// ---------------------------------------------------------------------------
// No dependency / no forbidden-scope changes
// ---------------------------------------------------------------------------

test("no new dependency was added for the adhkar foundation", () => {
  const packageJson = JSON.parse(read("../package.json"));
  const known = new Set([
    "drizzle-orm",
    "next",
    "postgres",
    "react",
    "react-dom",
    "uuid",
    "zod",
  ]);
  for (const name of Object.keys(packageJson.dependencies)) {
    assert.ok(known.has(name), `unexpected new dependency: ${name}`);
  }
});
