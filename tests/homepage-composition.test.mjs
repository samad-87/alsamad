import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToReadableStream } from "react-dom/server";
import { JSDOM } from "jsdom";

import HomePageModule from "../src/app/[locale]/page.tsx";
import { t } from "../src/lib/i18n.ts";

const HomePage =
  typeof HomePageModule === "function"
    ? HomePageModule
    : HomePageModule.default;
const root = process.cwd();

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
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

for (const locale of ["ar", "en"]) {
  test(`${locale} homepage renders the compact truthful composition`, async () => {
    const dom = await renderHome(locale);
    try {
      const { document } = dom.window;
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      const content = document.body.textContent;
      const hero = document.querySelector(".hero");

      assert.ok(hero);
      assert.equal(document.querySelectorAll("h1").length, 1);
      assert.equal(hero.querySelector("h1").textContent, t(locale).heroTitle);
      assert.match(hero.textContent, new RegExp(t(locale).heroBody));
      assert.equal(hero.querySelector(".hero-orbit"), null);
      assert.equal(hero.querySelector(".orbit-inner"), null);

      const actions = [...hero.querySelectorAll("a")];
      assert.deepEqual(
        actions.map((link) => link.getAttribute("href")),
        [`/${locale}/quran`, `/${locale}/adhkar`],
      );
      assert.deepEqual(
        actions.map((link) => link.textContent.trim()),
        [t(locale).exploreQuran, t(locale).heroSecondaryCta],
      );
      assert.match(actions[0].className, /button-primary/);
      assert.doesNotMatch(actions[1].className, /button-primary/);

      assert.equal(
        document
          .querySelector('[role="note"]')
          ?.textContent.includes(t(locale).fixture),
        true,
      );
      assert.match(content, new RegExp(t(locale).quranSectionBody));
      assert.match(content, new RegExp(t(locale).morning));
      assert.match(content, new RegExp(t(locale).evening));
      assert.match(content, new RegExp(t(locale).setupRequired));
      assert.match(content, new RegExp(t(locale).trustTitle));

      assert.doesNotMatch(content, new RegExp(t(locale).dailyJourneyTitle));
      assert.doesNotMatch(content, new RegExp(t(locale).knowledgeTitle));
      assert.doesNotMatch(content, new RegExp(t(locale).marriageJourneyTitle));
      assert.doesNotMatch(content, new RegExp(t(locale).articlesTitle));
      assert.equal(document.querySelector(`a[href="/${locale}/search"]`), null);
      assert.equal(document.querySelectorAll("button").length, 0);
      assert.equal(
        document.documentElement.dir,
        locale === "ar" ? "rtl" : "ltr",
      );

      const headings = [...document.querySelectorAll("h1, h2, h3")];
      assert.equal(headings[0].tagName, "H1");
      assert.equal(
        headings.some((heading) => heading.tagName === "H2"),
        true,
      );
    } finally {
      dom.window.close();
    }
  });
}

test("Hero CSS is compact, token-based, and leaves navigation boundaries intact", async () => {
  const css = await source("src/app/globals.css");
  const hero = css.match(/\.hero\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.doesNotMatch(hero, /min-height:\s*36rem|grid-template-columns/);
  assert.match(hero, /background:\s*var\(--color-surface-principal\)/);
  assert.match(hero, /border-block:\s*var\(--border-subtle\)/);
  assert.match(hero, /box-shadow:\s*var\(--elevation-none\)/);
  assert.doesNotMatch(css, /\.hero-orbit|\.orbit-inner|\.hero::after/);
  assert.doesNotMatch(hero, /gradient|drop-shadow/i);
  assert.match(
    css,
    /@media \(max-width: 1023\.98px\)[\s\S]*?\.desktop-nav\s*\{\s*display: none;/,
  );
  assert.match(
    css,
    /@media \(min-width: 1024px\)[\s\S]*?\.bottom-nav\s*\{\s*display: none;/,
  );
});

test("the unit introduces no package expansion", async () => {
  for (const file of ["package.json", "package-lock.json"]) {
    assert.equal(
      await source(file),
      execFileSync("git", ["show", `HEAD:${file}`], {
        cwd: root,
        encoding: "utf8",
      }),
      file,
    );
  }
});
