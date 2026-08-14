import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const cssPath = resolve(root, "src/app/globals.css");

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

function rule(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing CSS rule: ${selector}`);
  return match[1];
}

function declarations(css, selector) {
  return new Map(
    [...rule(css, selector).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
      ([, name, value]) => [name, value.trim().toLowerCase()],
    ),
  );
}

const lightPalette = {
  "--color-canvas": "#f8fbf9",
  "--color-surface-principal": "#ffffff",
  "--color-surface-grouped": "#eef5f1",
  "--color-text": "#10231b",
  "--color-text-muted": "#617168",
  "--color-action-primary": "#0f5b43",
  "--color-action-primary-strong": "#083d2d",
  "--color-action-primary-soft": "#dcece5",
  "--color-emphasis-trust": "#9b742b",
  "--color-border-structural": "#dbe6e0",
  "--color-danger": "#b42318",
};

const darkPalette = {
  "--color-canvas": "#07130f",
  "--color-surface-principal": "#0d1d17",
  "--color-surface-grouped": "#14271f",
  "--color-text": "#f3f7f4",
  "--color-text-muted": "#a2b0a8",
  "--color-action-primary": "#68bc98",
  "--color-action-primary-strong": "#91d3b4",
  "--color-action-primary-soft": "#173d2e",
  "--color-emphasis-trust": "#d3ae62",
  "--color-border-structural": "#263c33",
  "--color-danger": "#ff8a80",
};

test("the exact governed light and dark semantic palettes are frozen", async () => {
  const css = await readFile(cssPath, "utf8");
  const light = declarations(css, ":root");
  const dark = declarations(css, '[data-theme="dark"]');

  for (const [name, value] of Object.entries(lightPalette)) {
    assert.equal(light.get(name), value, `light ${name}`);
  }
  for (const [name, value] of Object.entries(darkPalette)) {
    assert.equal(dark.get(name), value, `dark ${name}`);
  }

  assert.equal(light.get("--primary"), "var(--color-action-primary)");
  assert.equal(light.get("--gold"), "var(--color-emphasis-trust)");
  assert.notEqual(light.get("--primary"), light.get("--gold"));
});

test("the radius and spacing foundations use the one governed scale", async () => {
  const css = await readFile(cssPath, "utf8");
  const tokens = declarations(css, ":root");

  assert.equal(tokens.get("--radius-control"), "12px");
  assert.equal(tokens.get("--radius-card"), "20px");
  assert.equal(tokens.get("--radius-feature"), "32px");
  assert.equal(tokens.get("--radius-pill"), "999px");
  assert.deepEqual(
    [
      "--space-inline-tight",
      "--space-inline-default",
      "--space-control-gap",
      "--space-card-padding",
      "--space-section-gap",
      "--space-reading-gap",
      "--space-page-gutter",
      "--space-layout-wide",
    ].map((name) => tokens.get(name)),
    ["8px", "12px", "16px", "24px", "32px", "48px", "16px", "64px"],
  );
});

test("semantic surfaces prefer tone then border and reserve elevation for floating layers", async () => {
  const css = await readFile(cssPath, "utf8");

  for (const selector of [
    ".surface-canvas",
    ".surface-principal",
    ".surface-reading",
    ".surface-grouped",
    ".surface-interactive",
    ".surface-floating",
    ".surface-feature",
    ".surface-status",
    ".surface-source",
  ]) {
    assert.match(css, new RegExp(`\\${selector}\\b`), selector);
  }

  assert.match(
    rule(css, ".surface-canvas"),
    /box-shadow:\s*var\(--elevation-none\)/,
  );
  assert.match(rule(css, ".surface-reading"), /border:\s*0/);
  assert.match(
    rule(css, ".surface-reading"),
    /box-shadow:\s*var\(--elevation-none\)/,
  );
  assert.match(
    rule(css, ".surface-grouped"),
    /background:\s*var\(--color-surface-grouped\)/,
  );
  assert.match(
    rule(css, ".surface-interactive"),
    /border:\s*var\(--border-subtle\)/,
  );
  assert.match(
    rule(css, ".surface-floating"),
    /box-shadow:\s*var\(--elevation-floating\)/,
  );
  assert.match(
    rule(css, ".surface-feature"),
    /box-shadow:\s*var\(--elevation-none\)/,
  );
  assert.doesNotMatch(
    rule(css, ".surface-interactive:hover"),
    /transform|box-shadow/,
  );

  assert.match(rule(css, ".surface"), /box-shadow:\s*var\(--elevation-none\)/);
  assert.match(
    rule(css, ".feature-surface"),
    /box-shadow:\s*var\(--elevation-none\)/,
  );
});

test("dark elevation is restrained and contains no glow foundation", async () => {
  const css = await readFile(cssPath, "utf8");
  const dark = declarations(css, '[data-theme="dark"]');

  assert.equal(
    dark.get("--elevation-floating"),
    "0 12px 36px rgba(0, 0, 0, 0.12)",
  );
  assert.equal(
    dark.get("--elevation-modal"),
    "0 20px 56px rgba(0, 0, 0, 0.12)",
  );
  assert.doesNotMatch(
    rule(css, '[data-theme="dark"]'),
    /glow|drop-shadow|0 0 \d/,
  );
});

test("state roles remain separate semantic tokens rather than one pill primitive", async () => {
  const css = await readFile(cssPath, "utf8");
  const tokens = declarations(css, ":root");
  const roles = [
    "--state-status-surface",
    "--state-category-surface",
    "--state-badge-surface",
    "--state-filter-surface",
    "--state-navigation-current",
    "--state-compact-action",
    "--state-source-emphasis",
  ];

  for (const role of roles) assert.ok(tokens.has(role), role);
  assert.equal(
    tokens.get("--state-source-emphasis"),
    "var(--color-emphasis-trust)",
  );
  assert.equal(
    tokens.get("--state-compact-action"),
    "var(--color-action-primary)",
  );
  assert.notEqual(
    tokens.get("--state-source-emphasis"),
    tokens.get("--state-compact-action"),
  );
  assert.doesNotMatch(
    css,
    /\.state-(?:status|category|badge|filter|navigation|compact-action|source)[^{]*\{[^}]*border-radius:\s*var\(--radius-pill\)/s,
  );
});

test("the foundation remains local, CSS-only, and Quran typography stays unbound", async () => {
  const css = await readFile(cssPath, "utf8");
  const foundation = css.slice(0, css.indexOf("* {"));

  assert.doesNotMatch(css, /--font-quran\s*:/);
  assert.doesNotMatch(foundation, /@font-face|font-family|https?:|url\(/i);
  assert.doesNotMatch(
    foundation,
    /quran|surah|ayah|dua|adhkar|header|bottom-nav/i,
  );
});

test("package dependency manifests remain byte-equivalent to committed HEAD", async () => {
  for (const file of ["package.json", "package-lock.json"]) {
    const current = await source(file);
    const baseline = execFileSync("git", ["show", `HEAD:${file}`], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(current, baseline, file);
  }
});
