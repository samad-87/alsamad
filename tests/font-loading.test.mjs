import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const fontDirectory = resolve(root, "src/app/fonts");
const sansFile = "NotoSansArabic[wdth,wght]-v2.013.woff2";
const naskhFile = "NotoNaskhArabic[wght]-v2.021.woff2";
const expectedHashes = new Map([
  [
    sansFile,
    "59b0599488c516ce5c607b70e8bd68bd5c1f89c33602aa68092a14134d54ed85",
  ],
  [
    naskhFile,
    "c6b2e27a2b5ce90f9bf02fee8e3acdb800694fef9e0a2431a2bfd11217debf36",
  ],
]);

async function source(relativePath) {
  return readFile(resolve(root, relativePath), "utf8");
}

for (const [file, expectedHash] of expectedHashes) {
  test(`${file} is the approved derived binary`, async () => {
    const bytes = await readFile(resolve(fontDirectory, file));
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      expectedHash,
    );
  });
}

test("the complete upstream OFL notice is present", async () => {
  const noticeBytes = await readFile(
    resolve(fontDirectory, "OFL-Noto-Arabic.txt"),
  );
  assert.equal(
    createHash("sha256").update(noticeBytes).digest("hex"),
    "a7a5a25eb188bf1cd96982030d53e23c33485c69b1044a562254226857ee13af",
  );
  const notice = noticeBytes.toString("utf8");
  assert.match(notice, /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(notice, /Copyright 2022 The Noto Project Authors/);
});

test("the loader uses only the approved local font roles", async () => {
  const loader = await source("src/app/fonts.ts");
  assert.match(loader, /from "next\/font\/local"/);
  assert.match(
    loader,
    new RegExp(sansFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
  assert.match(
    loader,
    new RegExp(naskhFile.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
  assert.match(loader, /variable: "--font-arabic-ui"/);
  assert.match(loader, /variable: "--font-arabic-reading"/);
  assert.equal(loader.match(/preload: false/g)?.length, 2);
  assert.doesNotMatch(loader, /https?:|next\/font\/google|font-quran/i);
});

test("CSS binds Arabic UI and devotional reading without binding Quran", async () => {
  const css = await source("src/app/globals.css");
  assert.match(
    css,
    /\[dir="rtl"\] body\s*{\s*font-family: var\(--font-arabic-ui\), Tahoma, Arial, sans-serif;/,
  );
  assert.match(
    css,
    /\.arabic-reading\s*{\s*font-family: var\(--font-arabic-reading\), serif;/,
  );
  assert.doesNotMatch(css, /--font-quran\s*:/);
  assert.match(css, /body\s*{[\s\S]*?font-family:\s*Inter,/);
});

test("the server shell installs both role variables", async () => {
  const shell = await source("src/components/shell.tsx");
  assert.match(shell, /arabicUiFont\.variable/);
  assert.match(shell, /arabicReadingFont\.variable/);
  assert.doesNotMatch(shell, /^\s*["']use client["']/m);
});

test("no Quran font binary or unapproved font asset is present", async () => {
  const files = await readdir(fontDirectory);
  const binaries = files.filter((file) => /\.(?:woff2?|ttf|otf)$/i.test(file));
  assert.deepEqual(binaries.sort(), [...expectedHashes.keys()].sort());
  assert.equal(
    binaries.some((file) => /quran/i.test(file)),
    false,
  );
});

test("all dependency sections match the committed baseline", async () => {
  const current = JSON.parse(await source("package.json"));
  const baseline = JSON.parse(
    execFileSync("git", ["show", "HEAD:package.json"], {
      cwd: root,
      encoding: "utf8",
    }),
  );
  for (const section of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    assert.deepEqual(current[section] ?? {}, baseline[section] ?? {}, section);
  }
});
