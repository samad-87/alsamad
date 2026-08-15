import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToReadableStream } from "react-dom/server";
import { JSDOM } from "jsdom";

import HomePageModule from "../src/app/[locale]/page.tsx";
import { t } from "../src/lib/i18n.ts";
import { getQuranOverallStatus } from "../src/lib/quran/content/reader-data.ts";

const HomePage =
  typeof HomePageModule === "function"
    ? HomePageModule
    : HomePageModule.default;
const root = process.cwd();

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function committedSource(relativePath) {
  return execFileSync("git", ["show", `HEAD:${relativePath}`], {
    cwd: root,
    encoding: "utf8",
  });
}

async function renderHome(locale) {
  const element = await HomePage({ params: Promise.resolve({ locale }) });
  const stream = await renderToReadableStream(element);
  await stream.allReady;
  const markup = await new Response(stream).text();
  return new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    url: `https://alsamad.test/${locale}`,
  });
}

function headingLevels(document) {
  return [...document.querySelectorAll("h1, h2, h3")].map((heading) =>
    Number(heading.tagName.slice(1)),
  );
}

for (const locale of ["ar", "en"]) {
  test(`${locale} renders one truthful Today and Quran primary stack`, async () => {
    const dom = await renderHome(locale);
    try {
      const { document } = dom.window;
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      const c = t(locale);
      const hero = document.querySelector(".hero");
      const today = document.querySelector(".today-quran");
      const snapshot = await getQuranOverallStatus();
      const expectedStatusLabel =
        snapshot.status === "available"
          ? c.quranStatusAvailable
          : snapshot.status === "pending"
            ? c.quranStatusPending
            : c.quranStatusEmpty;

      assert.ok(hero);
      assert.ok(today);
      assert.equal(document.querySelectorAll(".today-quran").length, 1);
      assert.equal(document.querySelectorAll("h1").length, 1);
      assert.equal(today.querySelector("h2")?.textContent.trim(), c.quran);
      assert.equal(
        today.querySelector(".eyebrow")?.textContent.trim(),
        c.today,
      );
      assert.ok(today.textContent.includes(expectedStatusLabel));

      const heroLinks = [...hero.querySelectorAll("a")];
      assert.deepEqual(
        heroLinks.map((link) => link.getAttribute("href")),
        [`/${locale}/quran`, `/${locale}/adhkar`],
      );
      assert.match(heroLinks[0].className, /button-primary/);
      assert.doesNotMatch(heroLinks[1].className, /button-primary/);

      const todayLinks = [...today.querySelectorAll("a")];
      assert.equal(todayLinks.length, 1);
      assert.equal(todayLinks[0].getAttribute("href"), `/${locale}/quran`);
      assert.equal(todayLinks[0].textContent.trim(), c.surahs);
      assert.doesNotMatch(todayLinks[0].className, /button-primary/);
      assert.equal(today.querySelectorAll("button").length, 0);

      assert.equal(
        document.querySelector(`a[href="/${locale}/quran/1"]`),
        null,
      );
      for (const deferredCopy of [
        c.quranSectionBody,
        c.continueReadingCta,
        c.continueReadingPlaceholder,
        c.readerWidth,
        c.readingProgress,
      ]) {
        assert.equal(document.body.textContent.includes(deferredCopy), false);
      }

      assert.equal(today.querySelector("time"), null);
      assert.equal(today.querySelector("progress"), null);
      assert.equal(today.querySelector("[aria-valuenow]"), null);
      assert.equal(today.querySelector("[data-surah]"), null);
      assert.equal(today.querySelector("blockquote"), null);

      const morningLinks = document.querySelectorAll(
        `a[href="/${locale}/adhkar/morning"]`,
      );
      const eveningLinks = document.querySelectorAll(
        `a[href="/${locale}/adhkar/evening"]`,
      );
      assert.equal(morningLinks.length, 1);
      assert.equal(eveningLinks.length, 1);
      assert.equal(
        today.querySelector(`a[href="/${locale}/adhkar/morning"]`),
        null,
      );
      assert.equal(
        today.querySelector(`a[href="/${locale}/adhkar/evening"]`),
        null,
      );

      const levels = headingLevels(document);
      assert.equal(levels[0], 1);
      for (let index = 1; index < levels.length; index += 1) {
        assert.ok(levels[index] - levels[index - 1] <= 1);
      }
      assert.equal(
        document.documentElement.dir,
        locale === "ar" ? "rtl" : "ltr",
      );
    } finally {
      dom.window.close();
    }
  });
}

test("Arabic and English use the same Today and Quran structure", async () => {
  const doms = await Promise.all([renderHome("ar"), renderHome("en")]);
  try {
    const structure = (dom) =>
      [
        ...dom.window.document
          .querySelector(".today-quran")
          .querySelectorAll("*"),
      ].map((element) => `${element.tagName}:${element.className}`);
    assert.deepEqual(structure(doms[0]), structure(doms[1]));
  } finally {
    doms.forEach((dom) => dom.window.close());
  }
});

test("Today and Quran CSS is compact, grouped, sequential, and token based", async () => {
  const css = await source("src/app/globals.css");
  const today = css.match(/\.today-quran\s*\{([^}]*)\}/)?.[1] ?? "";
  const heading = css.match(/\.today-quran-heading\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(today, /border:\s*var\(--border-subtle\)/);
  assert.match(today, /box-shadow:\s*var\(--elevation-none\)/);
  assert.doesNotMatch(
    today,
    /min-height|height|gradient|grid-template-columns/,
  );
  assert.match(heading, /flex-wrap:\s*wrap/);
  assert.doesNotMatch(
    css,
    /\.quran-entry-grid|\.quran-entry-side|\.quran-entry-main/,
  );
  assert.match(css, /\.button\s*\{[\s\S]*?min-height:\s*2\.85rem/);
  assert.doesNotMatch(css, /--font-quran\s*:/);
  assert.match(
    css,
    /@media \(max-width: 1023\.98px\)[\s\S]*?\.desktop-nav\s*\{\s*display: none;/,
  );
  assert.match(
    css,
    /@media \(min-width: 1024px\)[\s\S]*?\.bottom-nav\s*\{\s*display: none;/,
  );
});

test("Unit 2 does not depend on fixture changes or new translation copy", async () => {
  const sections = await source("src/components/home/sections.tsx");
  const quranEntry = sections.slice(
    sections.indexOf("export async function QuranEntry"),
    sections.indexOf("export async function AdhkarDuas"),
  );
  const headI18n = committedSource("src/lib/i18n.ts");

  assert.doesNotMatch(quranEntry, /\bloc\(|prayerFixtures|hijri|countdown/i);
  for (const locale of ["ar", "en"]) {
    const c = t(locale);
    for (const value of [
      c.today,
      c.quran,
      c.quranStatusAvailable,
      c.quranStatusPending,
      c.quranStatusEmpty,
      c.surahs,
    ]) {
      assert.ok(headI18n.includes(value), `${locale}: ${value}`);
    }
  }
});

test("package manifests remain byte-equivalent to committed HEAD", async () => {
  for (const file of ["package.json", "package-lock.json"]) {
    assert.equal(await source(file), committedSource(file), file);
  }
});
