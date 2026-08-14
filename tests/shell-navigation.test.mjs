import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import {
  PathnameContext,
  SearchParamsContext,
} from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import {
  DesktopNavigation,
  isDesktopNavigationCurrent,
} from "../src/components/desktop-navigation.tsx";
import { LocaleSwitcher } from "../src/components/locale-switcher.tsx";
import { ThemeSwitcher } from "../src/components/client-controls.tsx";
import { t } from "../src/lib/i18n.ts";

const root = process.cwd();
const expectedSuffixes = ["", "/quran", "/adhkar", "/duas", "/prayer-times"];

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function installDom({ locale, pathname }) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: `https://alsamad.test${pathname}`,
  });
  dom.window.document.documentElement.lang = locale;
  dom.window.document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  dom.window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });

  const names = [
    "window",
    "self",
    "document",
    "navigator",
    "localStorage",
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
  const previousMatchMedia = globalThis.matchMedia;
  const previousActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;

  for (const name of names) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: name === "self" ? dom.window : dom.window[name],
    });
  }
  globalThis.matchMedia = dom.window.matchMedia;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;

  return () => {
    dom.window.localStorage.clear();
    dom.window.document.body.replaceChildren();
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
    if (previousMatchMedia === undefined) delete globalThis.matchMedia;
    else globalThis.matchMedia = previousMatchMedia;
    if (previousActEnvironment === undefined) {
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    } else {
      globalThis.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  };
}

async function render(element, pathname) {
  const container = document.createElement("div");
  document.body.append(container);
  const reactRoot = createRoot(container);
  await act(async () => {
    reactRoot.render(
      React.createElement(
        PathnameContext.Provider,
        { value: pathname },
        React.createElement(
          SearchParamsContext.Provider,
          { value: new URLSearchParams() },
          element,
        ),
      ),
    );
  });
  return {
    container,
    async unmount() {
      await act(async () => reactRoot.unmount());
      container.remove();
    },
  };
}

for (const locale of ["ar", "en"]) {
  test(`${locale} desktop navigation preserves order, hrefs, and root semantics`, async () => {
    const pathname = `/${locale}`;
    const restore = installDom({ locale, pathname });
    const view = await render(
      React.createElement(DesktopNavigation, { locale }),
      pathname,
    );
    try {
      const nav = view.container.querySelector("nav.desktop-nav");
      assert.equal(nav.getAttribute("aria-label"), t(locale).menu);
      const links = [...nav.querySelectorAll("a")];
      assert.deepEqual(
        links.map((link) => link.getAttribute("href")),
        expectedSuffixes.map((suffix) => `/${locale}${suffix}`),
      );
      assert.deepEqual(
        links.map((link) => link.textContent),
        [
          t(locale).today,
          t(locale).quran,
          t(locale).adhkar,
          t(locale).duas,
          t(locale).prayer,
        ],
      );
      assert.deepEqual(
        links
          .filter((link) => link.getAttribute("aria-current") === "page")
          .map((link) => link.getAttribute("href")),
        [pathname],
      );
      assert.equal(
        document.documentElement.dir,
        locale === "ar" ? "rtl" : "ltr",
      );
    } finally {
      await view.unmount();
      restore();
    }
  });
}

for (const [pathname, currentHref] of [
  ["/ar/quran/1", "/ar/quran"],
  ["/en/adhkar/morning", "/en/adhkar"],
  ["/ar/duas/general/a-calm-heart", "/ar/duas"],
  ["/en/prayer-times", "/en/prayer-times"],
]) {
  test(`${pathname} marks only ${currentHref} current`, async () => {
    const locale = pathname.startsWith("/ar") ? "ar" : "en";
    const restore = installDom({ locale, pathname });
    const view = await render(
      React.createElement(DesktopNavigation, { locale }),
      pathname,
    );
    try {
      const current = [
        ...view.container.querySelectorAll('[aria-current="page"]'),
      ];
      assert.equal(current.length, 1);
      assert.equal(current[0].getAttribute("href"), currentHref);
    } finally {
      await view.unmount();
      restore();
    }
  });
}

test("unmatched routes produce no false current destination", async () => {
  const pathname = "/en/search";
  const restore = installDom({ locale: "en", pathname });
  const view = await render(
    React.createElement(DesktopNavigation, { locale: "en" }),
    pathname,
  );
  try {
    assert.equal(
      view.container.querySelectorAll('[aria-current="page"]').length,
      0,
    );
    assert.equal(isDesktopNavigationCurrent("/en/quranic", "/en/quran"), false);
  } finally {
    await view.unmount();
    restore();
  }
});

test("locale and theme controls retain accessible behavior", async () => {
  const pathname = "/en/quran/1";
  const restore = installDom({ locale: "en", pathname });
  const view = await render(
    React.createElement(
      React.Fragment,
      null,
      React.createElement(LocaleSwitcher, { locale: "en" }),
      React.createElement(ThemeSwitcher, {
        locale: "en",
        className: "icon-button",
      }),
    ),
    pathname,
  );
  try {
    const localeLink = view.container.querySelector("a.locale-button");
    assert.equal(localeLink.getAttribute("href"), "/ar/quran/1");
    assert.equal(localeLink.getAttribute("aria-label"), "العربية");
    const themeButton = view.container.querySelector("button.icon-button");
    assert.equal(themeButton.getAttribute("aria-label"), t("en").dark);
    await act(async () => themeButton.click());
    assert.equal(localStorage.getItem("alsamad-theme"), "dark");
    assert.equal(themeButton.getAttribute("aria-label"), t("en").light);
  } finally {
    await view.unmount();
    restore();
  }
});

test("shell keeps search and the server/client boundary", async () => {
  const shell = await source("src/components/shell.tsx");
  const desktopNavigation = await source(
    "src/components/desktop-navigation.tsx",
  );

  assert.doesNotMatch(shell, /^\s*["']use client["']/m);
  assert.match(shell, /<DesktopNavigation locale=\{locale\} \/>/);
  assert.match(shell, /href=\{`\/\$\{locale\}\/search`\}/);
  assert.match(desktopNavigation, /^"use client";/);
  assert.match(desktopNavigation, /usePathname\(\)/);
  assert.doesNotMatch(shell, /usePathname/);
});

test("CSS preserves the breakpoint and restrained header contract", async () => {
  const css = await source("src/app/globals.css");
  const header = css.match(/\.site-header\s*\{([^}]*)\}/)?.[1] ?? "";
  const current =
    css.match(/\.desktop-nav a\[aria-current="page"\]\s*\{([^}]*)\}/)?.[1] ??
    "";
  const indicator =
    css.match(
      /\.desktop-nav a\[aria-current="page"\]::after\s*\{([^}]*)\}/,
    )?.[1] ?? "";

  assert.match(
    css,
    /@media \(max-width: 1023\.98px\)\s*\{\s*\.desktop-nav\s*\{\s*display: none;/s,
  );
  assert.match(
    css,
    /@media \(min-width: 1024px\)[\s\S]*?\.bottom-nav\s*\{\s*display: none;/,
  );
  assert.match(
    css,
    /@media \(min-width: 1024px\)[\s\S]*?\.header-inner\s*\{[^}]*min-height: 4\.75rem;/,
  );
  assert.match(header, /background:\s*var\(--color-surface-principal\)/);
  assert.match(header, /border-block-end:\s*var\(--border-subtle\)/);
  assert.match(header, /box-shadow:\s*var\(--elevation-none\)/);
  assert.doesNotMatch(header, /gradient|backdrop-filter|blur|color-mix/i);
  assert.match(current, /color:\s*var\(--state-navigation-current\)/);
  assert.doesNotMatch(current, /background|border-radius|box-shadow|transform/);
  assert.match(indicator, /inset-inline:/);
  assert.match(indicator, /inset-block-end:/);
  assert.doesNotMatch(indicator, /left|right|transform|animation/);
});

test("package manifests remain byte-equivalent to committed HEAD", async () => {
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
