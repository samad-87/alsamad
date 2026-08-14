import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import {
  LocaleSwitcher,
  switchLocalePath,
} from "../src/components/locale-switcher.tsx";

const pathCases = [
  ["/ar", "en", "/en"],
  ["/en", "ar", "/ar"],
  ["/ar/quran/1", "en", "/en/quran/1"],
  ["/en/quran/1", "ar", "/ar/quran/1"],
  ["/ar/adhkar/morning", "en", "/en/adhkar/morning"],
  ["/en/adhkar/evening", "ar", "/ar/adhkar/evening"],
  ["/ar/duas/daily-guidance", "en", "/en/duas/daily-guidance"],
  ["/ar/duas/general/a-calm-heart", "en", "/en/duas/general/a-calm-heart"],
  ["/ar/a%20b", "en", "/en/a%20b"],
  ["/en/quran", "en", "/en/quran"],
  ["/foo", "en", "/en"],
  ["/", "ar", "/ar"],
];

for (const [pathname, target, expected] of pathCases) {
  test(`switches ${pathname} to ${expected}`, () => {
    assert.equal(switchLocalePath(pathname, target), expected);
  });
}

test("repeated switching restores the original pathname", () => {
  const original = "/ar/quran/1";
  const english = switchLocalePath(original, "en");
  assert.equal(switchLocalePath(english, "ar"), original);
});

function installDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://alsamad.test/ar",
  });
  const names = [
    "window",
    "self",
    "document",
    "navigator",
    "HTMLElement",
    "Element",
    "Node",
    "Event",
    "MouseEvent",
  ];
  const previous = new Map(
    names.map((name) => [
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    ]),
  );
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;

  for (const name of names) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: name === "self" ? dom.window : dom.window[name],
    });
  }
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return () => {
    dom.window.document.body.replaceChildren();
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
    if (previousActEnvironment === undefined) {
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    } else {
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  };
}

async function renderSwitcher({ locale, pathname, query = "", direction }) {
  const container = document.createElement("div");
  document.body.append(container);
  document.documentElement.lang = locale;
  document.documentElement.dir = direction;
  const root = createRoot(container);
  await act(async () => {
    root.render(
      React.createElement(
        PathnameContext.Provider,
        { value: pathname },
        React.createElement(
          SearchParamsContext.Provider,
          { value: new URLSearchParams(query) },
          React.createElement(LocaleSwitcher, { locale }),
        ),
      ),
    );
  });
  return {
    link: container.querySelector("a"),
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

test("rendered Arabic switcher preserves a nested route and query", async () => {
  const restoreDom = installDom();
  const view = await renderSwitcher({
    locale: "ar",
    pathname: "/ar/quran/1",
    query: "view=focus&bookmark=2%3A5",
    direction: "rtl",
  });
  try {
    assert.equal(
      view.link.getAttribute("href"),
      "/en/quran/1?view=focus&bookmark=2%3A5",
    );
    assert.equal(view.link.getAttribute("aria-label"), "English");
    assert.equal(document.documentElement.lang, "ar");
    assert.equal(document.documentElement.dir, "rtl");
    const params = new URL(view.link.href).searchParams;
    assert.equal(params.get("view"), "focus");
    assert.equal(params.get("bookmark"), "2:5");
  } finally {
    await view.unmount();
    restoreDom();
  }
});

test("rendered English switcher preserves its route without a trailing query marker", async () => {
  const restoreDom = installDom();
  const view = await renderSwitcher({
    locale: "en",
    pathname: "/en/adhkar/morning",
    direction: "ltr",
  });
  try {
    assert.equal(view.link.getAttribute("href"), "/ar/adhkar/morning");
    assert.equal(view.link.getAttribute("aria-label"), "العربية");
    assert.equal(view.link.getAttribute("href").endsWith("?"), false);
    assert.equal(document.documentElement.lang, "en");
    assert.equal(document.documentElement.dir, "ltr");
  } finally {
    await view.unmount();
    restoreDom();
  }
});
