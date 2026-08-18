import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

test("mobile bottom navigation matches the accepted Sakīnah header treatment, not legacy glass styling", async () => {
  const css = await source("src/app/globals.css");
  const bottomNav = css.match(/\.bottom-nav\s*\{([^}]*)\}/)?.[1] ?? "";

  assert.doesNotMatch(bottomNav, /backdrop-filter|blur\(|color-mix|gradient/i);
  assert.match(bottomNav, /background:\s*var\(--color-surface-principal\)/);
  assert.match(bottomNav, /border-block-start:\s*var\(--border-subtle\)/);
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
