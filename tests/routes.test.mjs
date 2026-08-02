import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const localeLayout = readFileSync(
  new URL("../src/app/[locale]/layout.tsx", import.meta.url),
  "utf8",
);
const i18n = readFileSync(
  new URL("../src/lib/i18n.ts", import.meta.url),
  "utf8",
);
const generalDuas = readFileSync(
  new URL("../src/lib/general-duas.ts", import.meta.url),
  "utf8",
);

test("locale foundation declares Arabic and English", () => {
  assert.match(i18n, /\["ar", "en"\]/);
});

test("locale shell owns document direction", () => {
  assert.match(localeLayout, /AppShell/);
});

test("general duas are explicitly editorial and not attributed to revelation", () => {
  assert.match(generalDuas, /editorialNote/);
  assert.doesNotMatch(generalDuas, /Prophet Muhammad|النبي محمد|ﷺ/);
});
