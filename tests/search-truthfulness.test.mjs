import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";

import SearchPageModule from "../src/app/[locale]/search/page.tsx";

const SearchPage =
  typeof SearchPageModule === "function"
    ? SearchPageModule
    : SearchPageModule.default;

async function renderSearchPage(locale) {
  const markup = renderToStaticMarkup(
    await SearchPage({ params: Promise.resolve({ locale }) }),
  );
  return new JSDOM(`<!doctype html><body>${markup}</body>`);
}

for (const { locale, message, otherMessage } of [
  {
    locale: "ar",
    message: "البحث الموحّد غير متاح بعد. هذه الميزة ما زالت قيد الإعداد.",
    otherMessage:
      "Unified search is not available yet. This feature is still being prepared.",
  },
  {
    locale: "en",
    message:
      "Unified search is not available yet. This feature is still being prepared.",
    otherMessage: "البحث الموحّد غير متاح بعد. هذه الميزة ما زالت قيد الإعداد.",
  },
]) {
  test(`${locale} search route renders one truthful static unavailable state`, async () => {
    const dom = await renderSearchPage(locale);
    try {
      const { document } = dom.window;
      assert.equal(document.querySelectorAll("h1").length, 1);
      assert.match(document.body.textContent, new RegExp(message));
      assert.doesNotMatch(document.body.textContent, new RegExp(otherMessage));

      assert.equal(document.querySelector("input"), null);
      assert.equal(document.querySelector("form"), null);
      assert.equal(document.querySelector("button"), null);
      assert.equal(document.querySelector(".filter-bar"), null);
      assert.equal(document.querySelector(".states-grid"), null);
      assert.equal(document.querySelector(".loading"), null);
      assert.equal(document.querySelector(".error"), null);
      assert.equal(document.querySelector(".empty-state"), null);

      const information = document.querySelector(
        'section[aria-labelledby="search-unavailable-title"]',
      );
      assert.ok(information);
      assert.equal(information.querySelectorAll("h2").length, 1);
    } finally {
      dom.window.close();
    }
  });
}

test("search route remains runtime-inert and provider-independent", async () => {
  const source = readFileSync(
    new URL("../src/app/[locale]/search/page.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /@\/lib\/knowledge|src\/lib\/knowledge/);
  assert.doesNotMatch(source, /provider|DATABASE_URL|postgres|fetch\s*\(/i);

  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => {
    networkCalls += 1;
    throw new Error("network access is not permitted in this test");
  };
  try {
    const dom = await renderSearchPage("en");
    dom.window.close();
    assert.equal(networkCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
