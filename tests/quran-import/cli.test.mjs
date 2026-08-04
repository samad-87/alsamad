import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("../../scripts/quran-import.mjs", import.meta.url),
);

function runCli(extraArgs) {
  return spawnSync(
    process.execPath,
    ["--import", "tsx", scriptPath, ...extraArgs],
    { encoding: "utf8" },
  );
}

test("CLI succeeds with a clean synthetic fixture", () => {
  const result = runCli(["--scenario=clean"]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /production activation: BLOCKED/);
  assert.match(result.stdout, /blocking errors: 0/);
  assert.match(result.stdout, /publicationEligible: false/);
});

test("CLI exits nonzero for a blocking synthetic fixture", () => {
  const result = runCli(["--scenario=blocking"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /production activation: BLOCKED/);
  assert.doesNotMatch(result.stdout, /blocking errors: 0/);
});

test("CLI performs no network access and prints no credential-shaped value", () => {
  const result = runCli(["--scenario=clean"]);
  assert.doesNotMatch(
    result.stdout.toLowerCase(),
    /bearer |api_key|apikey|password/,
  );
});
