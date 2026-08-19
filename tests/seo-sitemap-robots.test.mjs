import test from "node:test";
import assert from "node:assert/strict";

import sitemapModule from "../src/app/sitemap.ts";
import robotsModule from "../src/app/robots.ts";
import { surahStructures } from "../src/lib/quran/content/structure.ts";
import { implementedCategories } from "../src/lib/adhkar/content/structure.ts";
import { generalDuas } from "../src/lib/general-duas.ts";
import { SITE_ORIGIN } from "../src/lib/seo.ts";

const sitemap =
  typeof sitemapModule === "function" ? sitemapModule : sitemapModule.default;
const robots =
  typeof robotsModule === "function" ? robotsModule : robotsModule.default;

const DEFERRED_OR_EXCLUDED = [
  "/search",
  "/showcase",
  "/duas",
  "/prayer-times",
  "/calendar",
];

test("sitemap contains exactly the authorized static route universe, both locales", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  for (const path of ["", "/quran", "/adhkar", "/duas/general", "/tasbeeh"]) {
    assert.ok(urls.includes(`${SITE_ORIGIN}/ar${path}`), `missing ar${path}`);
    assert.ok(urls.includes(`${SITE_ORIGIN}/en${path}`), `missing en${path}`);
  }
});

test("sitemap includes every deterministically enumerable dynamic route from committed data", () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const surah of surahStructures) {
    assert.ok(urls.includes(`${SITE_ORIGIN}/ar/quran/${surah.slug}`));
    assert.ok(urls.includes(`${SITE_ORIGIN}/en/quran/${surah.slug}`));
  }
  assert.ok(urls.includes(`${SITE_ORIGIN}/ar/adhkar/morning`));
  assert.ok(urls.includes(`${SITE_ORIGIN}/en/adhkar/evening`));
  for (const dua of generalDuas) {
    assert.ok(urls.includes(`${SITE_ORIGIN}/ar/duas/general/${dua.slug}`));
    assert.ok(urls.includes(`${SITE_ORIGIN}/en/duas/general/${dua.slug}`));
  }
});

test("sitemap excludes /search, /showcase, and every deferred placeholder route", () => {
  const urls = sitemap().map((entry) => entry.url);
  for (const path of DEFERRED_OR_EXCLUDED) {
    assert.equal(
      urls.some(
        (url) =>
          url === `${SITE_ORIGIN}/ar${path}` ||
          url === `${SITE_ORIGIN}/en${path}`,
      ),
      false,
      `sitemap must not include ${path}`,
    );
  }
});

test("sitemap contains no fabricated lastModified, changeFrequency, or priority", () => {
  for (const entry of sitemap()) {
    assert.equal("lastModified" in entry, false);
    assert.equal("changeFrequency" in entry, false);
    assert.equal("priority" in entry, false);
  }
});

test("sitemap has exactly the expected entry count and no duplicate URLs", () => {
  const STATIC_PATH_COUNT = 5; // "", /quran, /adhkar, /duas/general, /tasbeeh
  const expectedCount =
    (STATIC_PATH_COUNT +
      surahStructures.length +
      implementedCategories().length +
      generalDuas.length) *
    2;

  const urls = sitemap().map((entry) => entry.url);
  assert.equal(urls.length, expectedCount);
  assert.equal(
    new Set(urls).size,
    urls.length,
    "sitemap must contain no duplicate URLs",
  );
});

test("sitemap entries carry reciprocal ar/en alternates as fully-qualified absolute URLs", () => {
  const entries = sitemap();
  const home = entries.find((entry) => entry.url === `${SITE_ORIGIN}/ar`);
  assert.deepEqual(home.alternates.languages, {
    ar: `${SITE_ORIGIN}/ar`,
    en: `${SITE_ORIGIN}/en`,
  });
});

test("no sitemap alternate hreflang value is a relative path", () => {
  for (const entry of sitemap()) {
    for (const href of Object.values(entry.alternates.languages)) {
      assert.equal(
        href.startsWith("/"),
        false,
        `hreflang value must be absolute, got "${href}"`,
      );
      assert.ok(href.startsWith(SITE_ORIGIN));
    }
  }
});

test("robots has no site-wide Disallow and points to the real sitemap", () => {
  const output = robots();
  assert.equal(output.rules.userAgent, "*");
  assert.equal(output.rules.allow, "/");
  assert.equal(output.rules.disallow, undefined);
  assert.equal(output.sitemap, `${SITE_ORIGIN}/sitemap.xml`);
});

test("robots and sitemap use the established production host only", () => {
  assert.equal(SITE_ORIGIN, "https://al-samad.com");
  const output = robots();
  assert.ok(output.sitemap.startsWith(SITE_ORIGIN));
  for (const entry of sitemap()) {
    assert.ok(entry.url.startsWith(SITE_ORIGIN));
  }
});
