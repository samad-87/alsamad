import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

/**
 * Strips JS/TSX comments so assertions about rendered/user-facing content
 * aren't tripped up by source comments that explicitly document an
 * absence or explain a rule.
 */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");

const i18n = read("../src/lib/i18n.ts");
const indexPage = read("../src/app/[locale]/duas/page.tsx");
const generalIndexPage = read("../src/app/[locale]/duas/general/page.tsx");
const generalSlugPage = read(
  "../src/app/[locale]/duas/general/[slug]/page.tsx",
);
const sections = read("../src/components/home/sections.tsx");
const categoryCard = read("../src/components/duas/category-card.tsx");
const categoryExplorer = read("../src/components/duas/category-explorer.tsx");
const collectionReader = read("../src/components/duas/collection-reader.tsx");
const emptyState = read("../src/components/duas/empty-dua-state.tsx");
const sourceTrustPanel = read("../src/components/duas/source-trust-panel.tsx");
const editorialDisclosure = read(
  "../src/components/duas/editorial-disclosure.tsx",
);
const sharePlaceholder = read("../src/components/duas/share-placeholder.tsx");
const bookmarkButton = read("../src/components/duas/bookmark-button.tsx");

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

test("routing: the duas index route exists", () => {
  assert.ok(
    existsSync(new URL("../src/app/[locale]/duas/page.tsx", import.meta.url)),
  );
});

test("routing: the confused legacy fixture-based dua detail route was removed", () => {
  assert.equal(
    existsSync(
      new URL("../src/app/[locale]/duas/[slug]/page.tsx", import.meta.url),
    ),
    false,
  );
  // The duaFixtures *rendering path* is what M6.0 retires (Roadmap: "retires
  // the duaFixtures rendering path" — scoped to src/app/[locale]/duas/, not
  // to src/lib/fixtures.ts, which is outside the M6.0 file boundary). Prove
  // that directly: no live Duas route imports or renders it. The dead export
  // may remain in fixtures.ts.
  for (const route of [indexPage, generalIndexPage, generalSlugPage]) {
    assert.doesNotMatch(route, /duaFixtures/);
  }
});

test("routing: the existing editorial duas routes were left untouched", () => {
  assert.ok(
    existsSync(
      new URL("../src/app/[locale]/duas/general/page.tsx", import.meta.url),
    ),
  );
  assert.ok(
    existsSync(
      new URL(
        "../src/app/[locale]/duas/general/[slug]/page.tsx",
        import.meta.url,
      ),
    ),
  );
});

test("routing: no unnecessary new routes were invented — the index links only to the real, existing general route", () => {
  assert.match(categoryCard, /if \(!data\.routeSlug\)/);
  assert.match(
    categoryCard,
    /href=\{`\/\$\{locale\}\/duas\/\$\{data\.routeSlug\}`\}/,
  );
});

// ---------------------------------------------------------------------------
// Localization
// ---------------------------------------------------------------------------

test("localization: the three honest states are localized in both languages", () => {
  for (const key of [
    "duaStatusEmpty",
    "duaStatusEmptyBody",
    "duaStatusPending",
    "duaStatusPendingBody",
    "duaStatusAvailable",
    "duaStatusAvailableBody",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    const matches = i18n.match(pattern) ?? [];
    assert.ok(
      matches.length >= 2,
      `expected "${key}" to be defined for both locales, found ${matches.length}`,
    );
  }
});

test("localization: all eight category labels exist for both languages", () => {
  for (const key of [
    "duaCategoryGeneral",
    "duaCategoryFamily",
    "duaCategoryHealth",
    "duaCategoryProvision",
    "duaCategoryTravel",
    "duaCategoryForgiveness",
    "duaCategoryGratitude",
    "duaCategoryProtection",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    assert.equal((i18n.match(pattern) ?? []).length, 2, key);
  }
});

test("localization: source/trust field labels exist for both languages", () => {
  for (const key of [
    "duaSourceType",
    "duaSourceTitle",
    "duaCollection",
    "duaReference",
    "duaAuthenticity",
    "duaReviewer",
    "duaAttribution",
    "duaNotes",
    "duaVerificationDate",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    assert.equal((i18n.match(pattern) ?? []).length, 2, key);
  }
});

test("localization: editorial disclosure copy exists for both languages", () => {
  for (const key of [
    "duaEditorialBadge",
    "duaEditorialExplanation",
    "duaNotFromQuranSunnah",
    "duaAlsamadAttribution",
    "duaAuthenticBadge",
  ]) {
    const pattern = new RegExp(`${key}:\\s*"[^"]+"`, "g");
    assert.equal((i18n.match(pattern) ?? []).length, 2, key);
  }
});

test("localization: ar block carries Arabic status copy, en block carries English", () => {
  assert.match(i18n, /ar:\s*\{[\s\S]*?duaStatusEmpty:\s*"لا يوجد محتوى بعد"/);
  assert.match(
    i18n,
    /en:\s*\{[\s\S]*?duaStatusEmpty:\s*"No content available"/,
  );
});

// ---------------------------------------------------------------------------
// Homepage integration
// ---------------------------------------------------------------------------

test("homepage: Duas is exposed as a working, honest utility link, per the committed Unit-3 practice/utility contract (tests/homepage-practice-utilities.test.mjs)", () => {
  const practiceRegion = sections.slice(
    sections.indexOf("export async function AdhkarDuas"),
    sections.indexOf("export function PrayerCalendar"),
  );
  const utilityRegion = sections.slice(
    sections.indexOf("export function PrayerCalendar"),
    sections.indexOf("export function Knowledge"),
  );

  // A working, localized Duas link exists in the existing utility
  // presentation, and is rendered through the same shared Link as every
  // other utility entry.
  assert.match(
    utilityRegion,
    /\{\s*title:\s*c\.duas\s*,\s*href:\s*`\/\$\{locale\}\/duas`\s*\}/,
  );
  assert.match(utilityRegion, /href=\{utility\.href\}/);

  // That entry claims no status/verified/authentic/live-source-derived
  // state — it stays the bare { title, href } shape (no `status` key), and
  // no Duas source call leaks into this region.
  assert.doesNotMatch(
    utilityRegion,
    /getDuaOverallStatus|duaStatusIcon|duaSnapshot/,
  );

  // The morning/evening Adhkar practice region — the one place the M6.0
  // Roadmap's "mirroring 7cd72ee" precedent could have suggested adding a
  // Duas card — remains untouched: no Duas link, no Duas source call.
  assert.doesNotMatch(practiceRegion, /\/duas`/);
  assert.doesNotMatch(
    practiceRegion,
    /getDuaOverallStatus|duaStatusIcon|duaSnapshot/,
  );
});

test("homepage: no fake counts or live data in the Duas card", () => {
  const sectionMatch = sections.match(
    /export async function AdhkarDuas[\s\S]*?\n}\n/,
  );
  assert.ok(sectionMatch, "expected to find the AdhkarDuas section");
  assert.doesNotMatch(
    stripComments(sectionMatch[0]),
    /\d+\s*(streak|day)s?\b/i,
  );
});

// ---------------------------------------------------------------------------
// Authentic vs Editorial separation (never mixed, never identical)
// ---------------------------------------------------------------------------

test("the collection reader renders different UI for authentic vs editorial items", () => {
  assert.match(collectionReader, /isEditorial \? \(/);
  assert.match(collectionReader, /<EditorialDisclosure/);
  assert.match(collectionReader, /<SourceTrustPanel/);
});

test("editorial duas always render the four mandatory disclosures unconditionally", () => {
  const body = stripComments(editorialDisclosure);
  assert.match(body, /duaEditorialBadge/);
  assert.match(body, /duaEditorialExplanation/);
  assert.match(body, /duaNotFromQuranSunnah/);
  assert.match(body, /duaAlsamadAttribution/);
  // No conditional branch guards these — they always render together.
  assert.doesNotMatch(body, /if\s*\(/);
});

test("the source/trust panel (authentic path) never renders editorial copy", () => {
  assert.doesNotMatch(
    sourceTrustPanel,
    /duaEditorialBadge|duaEditorialExplanation/,
  );
});

test("the editorial disclosure never renders authenticity/verification copy meant for authentic duas", () => {
  assert.doesNotMatch(
    editorialDisclosure,
    /duaAuthenticBadge|duaBadgeVerified/,
  );
});

// ---------------------------------------------------------------------------
// Honest content behaviour
// ---------------------------------------------------------------------------

const FABRICATED_CONTENT_PATTERN =
  /Prophet Muhammad|النبي محمد|ﷺ|قال الله تعالى|قال رسول الله|بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ|أَعُوذُ بِاللَّه/;

test("honest content: no fabricated Islamic text anywhere in the new duas UI", () => {
  for (const source of [
    indexPage,
    categoryCard,
    categoryExplorer,
    collectionReader,
    emptyState,
    sourceTrustPanel,
    editorialDisclosure,
    sharePlaceholder,
    bookmarkButton,
    sections,
  ]) {
    assert.doesNotMatch(source, FABRICATED_CONTENT_PATTERN);
  }
});

test("honest content: existing editorial duas remain explicitly non-authentic and untouched", () => {
  assert.match(generalIndexPage, /General Dua/);
  assert.match(generalSlugPage, /General Dua/);
  assert.doesNotMatch(generalSlugPage, FABRICATED_CONTENT_PATTERN);
});

test("honest content: the collection reader shows a calm state instead of placeholder text when unverified", () => {
  assert.match(
    collectionReader,
    /status !== "available" \|\| items\.length === 0/,
  );
  assert.match(collectionReader, /EmptyDuaState/);
});

test("honest content: empty and pending states use dedicated honest copy", () => {
  assert.match(emptyState, /"no-content"/);
  assert.match(emptyState, /"pending-review"/);
  assert.match(emptyState, /duaStatusEmptyBody/);
  assert.match(emptyState, /duaStatusPendingBody/);
});

test("honest content: the source/trust panel never renders a metadata table for unverified content", () => {
  assert.match(sourceTrustPanel, /status !== "available" \|\| !source/);
});

test("no audio and no repetition counter rendered in the collection reader (per spec)", () => {
  const body = stripComments(collectionReader);
  assert.doesNotMatch(body, /audio|Audio/);
  assert.doesNotMatch(body, /rep-button|repetition/i);
});

test("share is a disabled placeholder, not a working share action", () => {
  assert.match(sharePlaceholder, /disabled/);
});

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test("bookmark button exposes aria-pressed and a locale-aware label", () => {
  assert.match(bookmarkButton, /aria-pressed=\{active\}/);
  assert.match(
    bookmarkButton,
    /aria-label=\{active \? c\.bookmarkRemove : c\.bookmarkAdd\}/,
  );
});

test("the collection reader marks Arabic text with lang and dir regardless of page locale", () => {
  assert.match(collectionReader, /lang="ar"/);
  assert.match(collectionReader, /dir="rtl"/);
});

test("the title heading itself — not just the file generally — carries Arabic lang/dir semantics, since DuaItem.title is canonical Arabic source text", () => {
  const titleHeading = collectionReader.match(
    /<h2\b[^>]*>\s*\{current\.title\}\s*<\/h2>/,
  );
  assert.ok(
    titleHeading,
    "expected to find the <h2>{current.title}</h2> heading",
  );
  assert.match(titleHeading[0], /lang="ar"/);
  assert.match(titleHeading[0], /dir="rtl"/);
});

test("P2-2 regression: the translation and transliteration elements themselves carry English lang/dir semantics", () => {
  const transliterationEl = collectionReader.match(
    /<p\b[^>]*>\s*\{current\.transliteration\}\s*<\/p>/,
  );
  const translationEl = collectionReader.match(
    /<p\b[^>]*>\s*\{current\.translation\}\s*<\/p>/,
  );
  assert.ok(
    transliterationEl,
    "expected to find the {current.transliteration} paragraph",
  );
  assert.ok(
    translationEl,
    "expected to find the {current.translation} paragraph",
  );
  for (const element of [transliterationEl[0], translationEl[0]]) {
    assert.match(element, /lang="en"/);
    assert.match(element, /dir="ltr"/);
  }
});

test("P2 regression: the toolbar and footer counters use the same item-order field, never array index", () => {
  const numberDisplays = [
    ...collectionReader.matchAll(
      /\{(current\.order|index \+ 1)\} \/ \{items\.length\}/g,
    ),
  ].map((match) => match[1]);
  assert.equal(
    numberDisplays.length,
    2,
    "expected exactly two user-visible '<n> / <count>' counters (toolbar + footer)",
  );
  assert.deepEqual(
    new Set(numberDisplays),
    new Set(["current.order"]),
    "toolbar and footer must both display current.order, never a raw array index",
  );
});

test("the index page uses a real page heading and landmark structure", () => {
  assert.match(indexPage, /PageHeader/);
  assert.match(indexPage, /Breadcrumbs/);
});

// ---------------------------------------------------------------------------
// Motion / no new dependency
// ---------------------------------------------------------------------------

test("motion: no new animation dependency and no new @keyframes were introduced for duas", () => {
  const packageJson = read("../package.json");
  assert.doesNotMatch(packageJson, /framer-motion|gsap|react-spring|lottie/);
  const globalsCss = read("../src/app/globals.css");
  const newDuasCss = globalsCss.slice(globalsCss.indexOf("Duas foundation"));
  assert.doesNotMatch(newDuasCss, /@keyframes/);
});

test("the collection reader reuses the existing restrained fade-in, not a new animation", () => {
  assert.match(collectionReader, /className="religious-card surface fade-in"/);
});

test("no new dependency was added for the duas foundation", () => {
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
