import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const i18n = read("../src/lib/i18n.ts");
const sections = read("../src/components/home/sections.tsx");
const bottomNav = read("../src/components/bottom-nav.tsx");
const shell = read("../src/components/shell.tsx");
const homePage = read("../src/app/[locale]/page.tsx");
const globalsCss = read("../src/app/globals.css");
const packageJson = read("../package.json");

test("brand wordmark is locale-specific: الصمد in Arabic, Alsamad in English", () => {
  assert.match(i18n, /ar:\s*\{[\s\S]*?brand:\s*"الصمد"/);
  assert.match(i18n, /en:\s*\{[\s\S]*?brand:\s*"Alsamad"/);
});

test("homepage sections contain no fabricated religious content", () => {
  for (const source of [sections, homePage]) {
    assert.doesNotMatch(
      source,
      /Prophet Muhammad|النبي محمد|ﷺ|قال الله تعالى|قال رسول الله/,
    );
    // no hard-coded clock-style prayer time or Hijri year presented as real
    assert.doesNotMatch(source, /\b\d{1,2}:\d{2}\b/);
    assert.doesNotMatch(source, /١٤٤٨|1448 هـ/);
  }
});

test("bottom navigation holds at most five destinations", () => {
  const linkItems = [
    ...bottomNav.matchAll(/href:\s*`\$\{base\}([^`]*)`|href:\s*base,/g),
  ];
  // Home + Quran + Search + Adhkar links, plus the More drawer trigger = 5
  assert.ok(
    linkItems.length <= 4,
    "expected at most 4 direct nav links besides More",
  );
  assert.match(bottomNav, /MoreIcon/);
  assert.match(bottomNav, /c\.more/);
});

test("bottom navigation exposes correct active-route semantics", () => {
  assert.match(bottomNav, /aria-current=\{active \? "page" : undefined\}/);
});

test("bottom navigation items are thumb reachable and safe-area aware in CSS", () => {
  assert.match(
    globalsCss,
    /\.bottom-nav\s*\{[\s\S]*?env\(safe-area-inset-bottom\)/,
  );
  assert.match(
    globalsCss,
    /\.bottom-nav-item\s*\{[\s\S]*?min-height:\s*3\.25rem/,
  );
});

test("Marriage Journey uses the approved localized naming", () => {
  assert.match(i18n, /marriageJourneyTitle:\s*"طالبين الحلال"/);
  assert.match(i18n, /marriageJourneyTitle:\s*"Marriage Journey"/);
  assert.match(sections, /MarriageJourney/);
});

test("Marriage Journey avoids dating-app patterns", () => {
  assert.doesNotMatch(
    sections,
    /match(ed)?\s*count|profile card|swipe|like button/i,
  );
});

test("prayer, calendar, articles and marriage sections use honest pending/placeholder wording", () => {
  assert.match(i18n, /setupRequired:/);
  assert.match(i18n, /noLiveStatus:/);
  assert.match(i18n, /comingSoon:/);
  assert.match(i18n, /futureModule:/);
  assert.match(sections, /c\.setupRequired/);
  assert.match(sections, /c\.noLiveStatus/);
  assert.match(sections, /c\.comingSoon/);
  assert.match(sections, /c\.futureModule/);
});

test("locale shell sets document direction for RTL and LTR", () => {
  assert.match(shell, /dir=\{locale === "ar" \? "rtl" : "ltr"\}/);
});

test("reduced motion neutralizes animation duration and stagger delay", () => {
  assert.match(
    globalsCss,
    /prefers-reduced-motion: reduce\)\s*\{[\s\S]*?animation-delay:\s*0ms\s*!important/,
  );
  assert.match(
    globalsCss,
    /prefers-reduced-motion: reduce\)\s*\{[\s\S]*?transition-delay:\s*0ms\s*!important/,
  );
});

test("motion foundation uses CSS only, no new animation dependency", () => {
  assert.doesNotMatch(packageJson, /framer-motion|gsap|react-spring|lottie/);
  assert.match(globalsCss, /--duration-standard/);
  assert.match(globalsCss, /--distance-max/);
});

test("no broken internal links are introduced by the homepage", () => {
  const knownRoutes = new Set([
    "quran",
    "adhkar",
    "duas",
    "prayer-times",
    "calendar",
    "search",
    "tasbeeh",
    "showcase",
  ]);
  const sourceFiles = [sections, bottomNav, shell, homePage];
  const found = new Set();
  for (const source of sourceFiles) {
    const matches = source.matchAll(
      /href=\{`\/\$\{(?:locale|other)\}([^`]*)`\}|href:\s*`\/\$\{locale\}([^`]*)`/g,
    );
    for (const m of matches) {
      const suffix = m[1] ?? m[2] ?? "";
      const segment = suffix.split("/").filter(Boolean)[0];
      // skip further dynamic interpolation (e.g. locale switcher's `${path}`)
      if (segment && !segment.includes("$")) found.add(segment);
    }
  }
  for (const segment of found) {
    assert.ok(
      knownRoutes.has(segment),
      `route segment "${segment}" is not a known existing route`,
    );
  }
  assert.ok(found.size > 0, "expected at least one internal link to be found");
});

test("homepage route directory exists for both locales at build time", () => {
  assert.ok(
    existsSync(new URL("../src/app/[locale]/page.tsx", import.meta.url)),
  );
});
