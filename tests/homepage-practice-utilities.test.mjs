import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { renderToReadableStream } from "react-dom/server";
import { JSDOM } from "jsdom";

import HomePageModule from "../src/app/[locale]/page.tsx";
import { getCategoryReaderData } from "../src/lib/adhkar/content/reader-data.ts";
import { t } from "../src/lib/i18n.ts";

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

function expectedAdhkarStatus(c, status) {
  if (status === "available") return c.adhkarStatusAvailable;
  if (status === "pending") return c.adhkarStatusPending;
  return c.adhkarStatusEmpty;
}

for (const locale of ["ar", "en"]) {
  test(`${locale} renders truthful Adhkar practices and ordered utilities`, async () => {
    const dom = await renderHome(locale);
    try {
      const { document } = dom.window;
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      const c = t(locale);
      const practice = document.querySelector(".home-practice-region");
      const utilities = document.querySelector(".home-utility-region");
      const morning = await getCategoryReaderData("morning");
      const evening = await getCategoryReaderData("evening");

      assert.ok(practice);
      assert.ok(utilities);
      assert.equal(practice.querySelector("h2")?.textContent.trim(), c.adhkar);

      const morningLinks = document.querySelectorAll(
        `a[href="/${locale}/adhkar/morning"]`,
      );
      const eveningLinks = document.querySelectorAll(
        `a[href="/${locale}/adhkar/evening"]`,
      );
      assert.equal(morningLinks.length, 1);
      assert.equal(eveningLinks.length, 1);
      assert.equal(practice.contains(morningLinks[0]), true);
      assert.equal(practice.contains(eveningLinks[0]), true);
      assert.ok(
        morningLinks[0].textContent.includes(
          expectedAdhkarStatus(c, morning?.status ?? "empty"),
        ),
      );
      assert.ok(
        eveningLinks[0].textContent.includes(
          expectedAdhkarStatus(c, evening?.status ?? "empty"),
        ),
      );

      const utilityLinks = [...utilities.querySelectorAll("a")];
      assert.deepEqual(
        utilityLinks.map((link) => link.getAttribute("href")),
        [
          `/${locale}/prayer-times`,
          `/${locale}/calendar`,
          `/${locale}/tasbeeh`,
          `/${locale}/duas`,
        ],
      );
      assert.equal(practice.querySelector(`a[href="/${locale}/duas"]`), null);
      assert.equal(utilityLinks[0].textContent.includes(c.setupRequired), true);
      assert.equal(utilityLinks[0].textContent.includes(c.noLiveStatus), true);
      assert.equal(utilityLinks[1].textContent.includes(c.setupRequired), true);
      assert.equal(utilityLinks[1].textContent.includes(c.noLiveStatus), true);

      for (const utility of utilityLinks.slice(2)) {
        assert.equal(utility.textContent.includes(c.setupRequired), false);
        assert.equal(utility.textContent.includes(c.noLiveStatus), false);
      }
      const duas = utilityLinks[3].textContent;
      for (const claim of [
        c.adhkarStatusAvailable,
        c.adhkarStatusPending,
        c.adhkarStatusEmpty,
        "verified",
        "authentic",
      ]) {
        assert.equal(duas.toLowerCase().includes(claim.toLowerCase()), false);
      }

      assert.equal(practice.querySelectorAll("button").length, 0);
      assert.equal(utilities.querySelectorAll("button").length, 0);
      assert.equal(practice.querySelector("a a, a button"), null);
      assert.equal(utilities.querySelector("a a, a button"), null);
      assert.equal(document.querySelectorAll("h1").length, 1);
      assert.ok(document.querySelector(".today-quran"));
      assert.equal(
        document.documentElement.dir,
        locale === "ar" ? "rtl" : "ltr",
      );
    } finally {
      dom.window.close();
    }
  });
}

test("Arabic and English preserve the same practice and utility structure", async () => {
  const doms = await Promise.all([renderHome("ar"), renderHome("en")]);
  try {
    const structure = (dom, selector) =>
      [
        ...dom.window.document.querySelector(selector).querySelectorAll("*"),
      ].map((element) => `${element.tagName}:${element.className}`);
    for (const selector of [".home-practice-region", ".home-utility-region"]) {
      assert.deepEqual(
        structure(doms[0], selector),
        structure(doms[1], selector),
      );
    }
  } finally {
    doms.forEach((dom) => dom.window.close());
  }
});

test("practice status is independently sourced without previews or progress", async () => {
  const sections = await source("src/components/home/sections.tsx");
  const practice = sections.slice(
    sections.indexOf("export async function AdhkarDuas"),
    sections.indexOf("export function PrayerCalendar"),
  );

  assert.match(practice, /getCategoryReaderData\("morning"\)/);
  assert.match(practice, /getCategoryReaderData\("evening"\)/);
  assert.doesNotMatch(practice, /getAdhkarOverallStatus|getDuaOverallStatus/);
  assert.doesNotMatch(
    practice,
    /itemCount|preview|streak|progress|completion|recent/i,
  );
});

test("utility content contains no fixture time, date, or Duas source claim", async () => {
  const dom = await renderHome("en");
  try {
    const utility = dom.window.document.querySelector(".home-utility-region");
    assert.ok(utility);
    assert.equal(
      utility.querySelector("time, progress, [aria-valuenow]"),
      null,
    );
    assert.doesNotMatch(utility.textContent, /\b\d{1,2}:\d{2}\b/);
    assert.doesNotMatch(
      utility.textContent,
      /verified items?|authenticity|item count|inventory/i,
    );
  } finally {
    dom.window.close();
  }
});

test("practice and utilities use the compact governed CSS contract", async () => {
  const css = await source("src/app/globals.css");
  const practice = css.match(/\.home-practice-grid\s*\{([^}]*)\}/)?.[1] ?? "";
  const entries =
    css.match(
      /\.home-practice-entry,\s*\.home-utility-entry\s*\{([^}]*)\}/,
    )?.[1] ?? "";
  const group = css.match(/\.home-utility-group\s*\{([^}]*)\}/)?.[1] ?? "";
  const utility = css.match(/\.home-utility-grid\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.match(practice, /repeat\(auto-fit/);
  assert.match(utility, /repeat\(auto-fit/);
  assert.match(entries, /min-height:\s*2\.75rem/);
  assert.match(entries, /box-shadow:\s*var\(--elevation-none\)/);
  assert.match(group, /border:\s*var\(--border-subtle\)/);
  assert.match(group, /box-shadow:\s*var\(--elevation-none\)/);
  assert.doesNotMatch(entries + group + utility, /gradient|transform|glow/i);
  assert.doesNotMatch(css, /--font-quran\s*:/);
});

test("Unit 3 uses committed copy and does not expand package boundaries", async () => {
  const sections = await source("src/components/home/sections.tsx");
  const unit = sections.slice(
    sections.indexOf("export async function AdhkarDuas"),
    sections.indexOf("export function Knowledge"),
  );
  const headI18n = committedSource("src/lib/i18n.ts");

  assert.doesNotMatch(unit, /\bloc\(|getDuaOverallStatus|duaSnapshot/);
  for (const locale of ["ar", "en"]) {
    const c = t(locale);
    for (const value of [
      c.daily,
      c.adhkar,
      c.morning,
      c.evening,
      c.prayer,
      c.calendar,
      c.tasbeeh,
      c.duas,
      c.setupRequired,
      c.noLiveStatus,
    ]) {
      assert.ok(headI18n.includes(value), `${locale}: ${value}`);
    }
  }
  for (const file of ["package.json", "package-lock.json"]) {
    assert.equal(await source(file), committedSource(file), file);
  }
});
