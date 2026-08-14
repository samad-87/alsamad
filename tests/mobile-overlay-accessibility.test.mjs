import test from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

import { BottomNav } from "../src/components/bottom-nav.tsx";
import { AccessibleOverlay } from "../src/components/accessible-overlay.tsx";
import { MobileMenu } from "../src/components/client-controls.tsx";
import { SurahSidebar } from "../src/components/quran/surah-sidebar.tsx";
import { t } from "../src/lib/i18n.ts";

function installDom(direction) {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://alsamad.test/en/quran/1",
  });
  dom.window.document.documentElement.dir = direction;
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
    "KeyboardEvent",
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
    dom.window.localStorage.clear();
    dom.window.sessionStorage.clear();
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

function trackKeydownListeners() {
  const listeners = {
    keydown: new Set(),
    focusin: new Set(),
  };
  const addEventListener = document.addEventListener.bind(document);
  const removeEventListener = document.removeEventListener.bind(document);
  document.addEventListener = (type, listener, options) => {
    if (type === "keydown" || type === "focusin") {
      listeners[type].add(listener);
    }
    return addEventListener(type, listener, options);
  };
  document.removeEventListener = (type, listener, options) => {
    if (type === "keydown" || type === "focusin") {
      listeners[type].delete(listener);
    }
    return removeEventListener(type, listener, options);
  };
  return listeners;
}

async function render(element) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(element));
  return {
    container,
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
    },
  };
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true }),
    );
  });
}

async function keydown(key, shiftKey = false) {
  await act(async () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
}

function dialog() {
  return document.querySelector('[role="dialog"]');
}

function assertOpenDialog(name) {
  const overlay = dialog();
  assert.ok(overlay);
  assert.equal(overlay.getAttribute("aria-modal"), "true");
  assert.equal(overlay.getAttribute("aria-label"), name);
  assert.ok(overlay.contains(document.activeElement));
  return overlay;
}

function preventNavigation(link) {
  link.addEventListener("click", (event) => event.preventDefault());
}

function OverlayFixture({ children }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const close = React.useCallback(() => setOpen(false), []);
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      { ref: triggerRef, onClick: () => setOpen(true) },
      "Open",
    ),
    React.createElement("button", { id: "background" }, "Background"),
    React.createElement(
      AccessibleOverlay,
      {
        open,
        id: "test-overlay",
        label: "Test overlay",
        className: "test-overlay",
        returnFocusRef: triggerRef,
        onClose: close,
      },
      children,
    ),
  );
}

for (const direction of ["ltr", "rtl"]) {
  test(`More overlay traps and restores focus in ${direction}`, async () => {
    const restoreDom = installDom(direction);
    const listeners = trackKeydownListeners();
    const locale = direction === "rtl" ? "ar" : "en";
    const copy = t(locale);
    const view = await render(
      React.createElement(
        PathnameContext.Provider,
        { value: `/${locale}` },
        React.createElement(BottomNav, { locale }),
      ),
    );
    try {
      const trigger = view.container.querySelector(".bottom-nav-more button");
      assert.ok(trigger);
      assert.equal(dialog(), null);
      assert.equal(trigger.getAttribute("aria-expanded"), "false");

      await click(trigger);
      let overlay = assertOpenDialog(copy.more);
      assert.equal(trigger.getAttribute("aria-expanded"), "true");
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const close = overlay.querySelector("button");
      const links = [...overlay.querySelectorAll("a")];
      assert.equal(close.getAttribute("aria-label"), copy.close);
      assert.deepEqual(
        links.map((link) => link.getAttribute("href")),
        [
          `/${locale}/duas`,
          `/${locale}/prayer-times`,
          `/${locale}/calendar`,
          `/${locale}/tasbeeh`,
        ],
      );
      assert.equal(document.activeElement, close);

      const background = view.container.querySelector(".bottom-nav-item");
      background.focus();
      assert.equal(document.activeElement, close);
      background.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      background.focus();
      assert.equal(document.activeElement, close);
      links[0].focus();
      assert.equal(document.activeElement, links[0]);

      links.at(-1).focus();
      await keydown("Tab");
      assert.equal(document.activeElement, close);
      close.focus();
      await keydown("Tab", true);
      assert.equal(document.activeElement, links.at(-1));

      await click(close);
      assert.equal(dialog(), null);
      assert.equal(document.activeElement, trigger);
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);

      await click(trigger);
      overlay = assertOpenDialog(copy.more);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      await keydown("Escape");
      assert.equal(dialog(), null);
      assert.equal(document.activeElement, trigger);
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);

      await click(trigger);
      overlay = assertOpenDialog(copy.more);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const link = overlay.querySelector("a");
      preventNavigation(link);
      await click(link);
      assert.equal(dialog(), null);
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);

      await click(trigger);
      assertOpenDialog(copy.more);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const triggerParent = trigger.parentElement;
      trigger.remove();
      await keydown("Escape");
      assert.equal(dialog(), null);
      triggerParent.prepend(trigger);
    } finally {
      await view.unmount();
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);
      restoreDom();
    }
  });
}

test("focus discovery excludes disabled, negative, hidden, and inert controls", async () => {
  const restoreDom = installDom("ltr");
  const children = React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      { id: "disabled", disabled: true },
      "Disabled",
    ),
    React.createElement("button", { id: "negative-one", tabIndex: -1 }, "-1"),
    React.createElement("button", { id: "negative-two", tabIndex: -2 }, "-2"),
    React.createElement("button", { id: "hidden", hidden: true }, "Hidden"),
    React.createElement(
      "button",
      { id: "display-none", style: { display: "none" } },
      "Display none",
    ),
    React.createElement(
      "button",
      { id: "visibility-hidden", style: { visibility: "hidden" } },
      "Visibility hidden",
    ),
    React.createElement(
      "button",
      { id: "visibility-collapse", style: { visibility: "collapse" } },
      "Visibility collapse",
    ),
    React.createElement(
      "div",
      { inert: true },
      React.createElement("button", { id: "inert-child" }, "Inert"),
    ),
    React.createElement(
      "button",
      { id: "aria-hidden", "aria-hidden": "true" },
      "Aria hidden",
    ),
    React.createElement("button", { id: "valid" }, "Valid"),
  );
  const view = await render(
    React.createElement(OverlayFixture, null, children),
  );
  try {
    await click(view.container.querySelector("button"));
    const overlay = assertOpenDialog("Test overlay");
    const valid = overlay.querySelector("#valid");
    assert.ok(document.activeElement === valid, "initial valid control");

    for (const id of [
      "negative-one",
      "negative-two",
      "hidden",
      "display-none",
      "visibility-hidden",
      "visibility-collapse",
      "inert-child",
      "aria-hidden",
    ]) {
      overlay.querySelector(`#${id}`).focus();
      await keydown("Tab");
      assert.ok(document.activeElement === valid, id);
    }

    view.container.querySelector("button").focus();
    assert.ok(
      document.activeElement === valid,
      "collapsed control is not a containment redirect target",
    );

    valid.focus();
    await keydown("Tab");
    assert.ok(document.activeElement === valid, "forward single-control cycle");
    await keydown("Tab", true);
    assert.ok(document.activeElement === valid, "reverse single-control cycle");
  } finally {
    await view.unmount();
    restoreDom();
  }
});

test("an overlay without valid child controls contains focus on its dialog", async () => {
  const restoreDom = installDom("ltr");
  const listeners = trackKeydownListeners();
  const view = await render(
    React.createElement(
      OverlayFixture,
      null,
      React.createElement("button", { hidden: true }, "Hidden"),
    ),
  );
  try {
    await click(view.container.querySelector("button"));
    const overlay = assertOpenDialog("Test overlay");
    assert.equal(overlay.getAttribute("tabindex"), "-1");
    assert.equal(document.activeElement, overlay);

    await keydown("Tab");
    assert.equal(document.activeElement, overlay);
    const background = view.container.querySelector("#background");
    background.focus();
    assert.equal(document.activeElement, overlay);
  } finally {
    await view.unmount();
    assert.equal(listeners.keydown.size, 0);
    assert.equal(listeners.focusin.size, 0);
    restoreDom();
  }
});

test("More overlay keeps a single focusable control stable", async () => {
  const restoreDom = installDom("ltr");
  const view = await render(React.createElement(MobileMenu, { locale: "en" }));
  try {
    const trigger = view.container.querySelector("button");
    await click(trigger);
    const close = assertOpenDialog(t("en").more).querySelector("button");
    assert.equal(document.activeElement, close);
    await keydown("Tab");
    assert.equal(document.activeElement, close);
    await keydown("Tab", true);
    assert.equal(document.activeElement, close);
  } finally {
    await view.unmount();
    restoreDom();
  }
});

for (const direction of ["ltr", "rtl"]) {
  test(`Surah picker traps and restores focus in ${direction}`, async () => {
    const restoreDom = installDom(direction);
    const listeners = trackKeydownListeners();
    const locale = direction === "rtl" ? "ar" : "en";
    const copy = t(locale);
    const surahs = [
      { number: 1, slug: "1", status: "empty", ayahCount: null },
      { number: 2, slug: "2", status: "available", ayahCount: 286 },
    ];
    const view = await render(
      React.createElement(
        PathnameContext.Provider,
        { value: `/${locale}/quran/1` },
        React.createElement(SurahSidebar, { locale, surahs }),
      ),
    );
    try {
      const trigger = view.container.querySelector(".quran-sidebar-toggle");
      assert.ok(trigger);
      assert.equal(dialog(), null);

      await click(trigger);
      let overlay = assertOpenDialog(copy.surahs);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const close = overlay.querySelector("button");
      const links = [...overlay.querySelectorAll("a")];
      assert.equal(close.getAttribute("aria-label"), copy.close);
      assert.equal(document.activeElement, close);
      assert.equal(links[0].getAttribute("aria-current"), "page");
      assert.deepEqual(
        links.map((link) => link.getAttribute("href")),
        [`/${locale}/quran/1`, `/${locale}/quran/2`],
      );

      links.at(-1).focus();
      await keydown("Tab");
      assert.equal(document.activeElement, close);
      close.focus();
      await keydown("Tab", true);
      assert.equal(document.activeElement, links.at(-1));

      await click(close);
      assert.equal(dialog(), null);
      assert.equal(document.activeElement, trigger);
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);

      await click(trigger);
      assertOpenDialog(copy.surahs);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      await keydown("Escape");
      assert.equal(dialog(), null);
      assert.equal(document.activeElement, trigger);

      await click(trigger);
      overlay = assertOpenDialog(copy.surahs);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const firstLink = overlay.querySelector("a");
      preventNavigation(firstLink);
      await click(firstLink);
      assert.equal(dialog(), null);
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);

      await click(trigger);
      assertOpenDialog(copy.surahs);
      assert.equal(listeners.keydown.size, 1);
      assert.equal(listeners.focusin.size, 1);
      const triggerParent = trigger.parentElement;
      trigger.remove();
      await keydown("Escape");
      assert.equal(dialog(), null);
      triggerParent.prepend(trigger);
    } finally {
      await view.unmount();
      assert.equal(listeners.keydown.size, 0);
      assert.equal(listeners.focusin.size, 0);
      restoreDom();
    }
  });
}
