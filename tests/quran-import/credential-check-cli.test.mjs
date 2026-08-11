import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scriptPath = fileURLToPath(
  new URL("../../scripts/quran-credential-check.mjs", import.meta.url),
);

const CREDENTIAL_ENV_KEYS = [
  "QURAN_FOUNDATION_ENVIRONMENT",
  "QURAN_FOUNDATION_SANDBOX_CLIENT_ID",
  "QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET",
  "QURAN_FOUNDATION_PRODUCTION_CLIENT_ID",
  "QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET",
];

const SANDBOX_CLIENT_ID = "synthetic-sandbox-client-id";
const SANDBOX_CLIENT_SECRET = "synthetic-sandbox-secret-value";
const PRODUCTION_CLIENT_ID = "synthetic-production-client-id";
const PRODUCTION_CLIENT_SECRET = "synthetic-production-secret-value";

// Always starts from the parent's environment with every QURAN_FOUNDATION_*
// key explicitly deleted first, then applies only the given synthetic
// overrides. This is required so the process can spawn at all on this
// platform (PATH, SystemRoot, etc.) while guaranteeing the child never
// inherits a real credential the operator may already have exported --
// this never loads .env.local, since --env-file-if-exists is only added by
// the package.json script entry, not by this direct spawn.
function runCli(overrides = {}) {
  const env = { ...process.env };
  for (const key of CREDENTIAL_ENV_KEYS) {
    delete env[key];
  }
  Object.assign(env, overrides);
  return spawnSync(process.execPath, ["--import", "tsx", scriptPath], {
    encoding: "utf8",
    env,
  });
}

function parseOutput(stdout) {
  const fields = {};
  for (const line of stdout.split("\n")) {
    const trimmed = line.replace(/\r$/, "");
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    fields[trimmed.slice(0, separatorIndex)] = trimmed.slice(
      separatorIndex + 1,
    );
  }
  return fields;
}

// 1. sandbox with valid synthetic credentials -> safe local validation succeeds
test("valid sandbox credentials succeed with the exact safe output contract", () => {
  const result = runCli({
    QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
    QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
    QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
  });
  assert.equal(result.status, 0, result.stderr);
  const fields = parseOutput(result.stdout);
  assert.deepEqual(fields, {
    environment: "sandbox",
    credential_config: "valid",
    client_id_present: "true",
    client_secret_present: "true",
    server_only: "true",
    provider_network_validation: "not_performed",
  });
});

// 2. missing selector -> fails closed
test("a missing environment selector fails closed", () => {
  const result = runCli({});
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.equal(fields.environment, "unknown");
  assert.equal(fields.credential_config, "invalid");
  assert.equal(fields.reason, "missing_selector");
  assert.equal(fields.client_id_present, "false");
  assert.equal(fields.client_secret_present, "false");
  assert.equal(fields.provider_network_validation, "not_performed");
});

// 3. invalid selector -> fails closed
test("an unrecognized environment selector fails closed", () => {
  const result = runCli({ QURAN_FOUNDATION_ENVIRONMENT: "staging" });
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.equal(fields.environment, "unknown");
  assert.equal(fields.credential_config, "invalid");
  assert.equal(fields.reason, "invalid_selector");
});

// 4. production selector -> refuses before reading Production values
test("selecting production is refused without reading either Production value", () => {
  const result = runCli({
    QURAN_FOUNDATION_ENVIRONMENT: "production",
    QURAN_FOUNDATION_PRODUCTION_CLIENT_ID: PRODUCTION_CLIENT_ID,
    QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET: PRODUCTION_CLIENT_SECRET,
  });
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.deepEqual(fields, {
    environment: "production",
    credential_config: "refused",
    reason: "production_not_authorized_by_this_script",
    client_id_present: "false",
    client_secret_present: "false",
    server_only: "true",
    provider_network_validation: "not_performed",
  });
  assert.doesNotMatch(result.stdout, new RegExp(PRODUCTION_CLIENT_ID));
  assert.doesNotMatch(result.stdout, new RegExp(PRODUCTION_CLIENT_SECRET));
});

// 5. missing sandbox Client ID -> fails closed
test("a missing sandbox Client ID fails closed", () => {
  const result = runCli({
    QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
    QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
  });
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.equal(fields.environment, "sandbox");
  assert.equal(fields.credential_config, "invalid");
  assert.equal(fields.reason, "missing_client_id");
  assert.equal(fields.client_id_present, "false");
  assert.equal(fields.client_secret_present, "true");
});

// 6. missing sandbox Client Secret -> fails closed
test("a missing sandbox Client Secret fails closed", () => {
  const result = runCli({
    QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
    QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
  });
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.equal(fields.environment, "sandbox");
  assert.equal(fields.credential_config, "invalid");
  assert.equal(fields.reason, "missing_client_secret");
  assert.equal(fields.client_id_present, "true");
  assert.equal(fields.client_secret_present, "false");
});

// 7. no fallback to Production values
test("sandbox selection never falls back to present Production credentials", () => {
  const result = runCli({
    QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
    QURAN_FOUNDATION_PRODUCTION_CLIENT_ID: PRODUCTION_CLIENT_ID,
    QURAN_FOUNDATION_PRODUCTION_CLIENT_SECRET: PRODUCTION_CLIENT_SECRET,
  });
  assert.notEqual(result.status, 0);
  const fields = parseOutput(result.stdout);
  assert.equal(fields.credential_config, "invalid");
  assert.equal(fields.reason, "missing_client_id");
  assert.doesNotMatch(result.stdout, new RegExp(PRODUCTION_CLIENT_ID));
  assert.doesNotMatch(result.stdout, new RegExp(PRODUCTION_CLIENT_SECRET));
});

// 8 & 9. safe output never contains credential values, lengths, prefixes, hashes, or fragments
test("no invocation ever prints a credential value, length, prefix, or hash-shaped fragment", () => {
  const cases = [
    {},
    { QURAN_FOUNDATION_ENVIRONMENT: "garbage" },
    { QURAN_FOUNDATION_ENVIRONMENT: "production" },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
    },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
    },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
      QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
    },
  ];
  const expectedFields = new Set([
    "environment",
    "credential_config",
    "reason",
    "client_id_present",
    "client_secret_present",
    "server_only",
    "provider_network_validation",
  ]);
  for (const overrides of cases) {
    const result = runCli(overrides);
    assert.doesNotMatch(result.stdout, new RegExp(SANDBOX_CLIENT_ID));
    assert.doesNotMatch(result.stdout, new RegExp(SANDBOX_CLIENT_SECRET));
    assert.doesNotMatch(result.stdout, /[0-9a-f]{32,}/i); // no hash/hex-fragment-shaped output
    assert.doesNotMatch(result.stdout.toLowerCase(), /bearer |authorization:/);
    for (const line of result.stdout.split("\n")) {
      const trimmed = line.replace(/\r$/, "");
      if (trimmed === "") continue;
      const key = trimmed.slice(0, trimmed.indexOf("="));
      assert.ok(expectedFields.has(key), `unexpected output field: ${trimmed}`);
    }
  }
});

// 10. errors contain no secrets (stderr must never carry a credential value)
test("stderr never contains a credential value under any tested input", () => {
  const cases = [
    { QURAN_FOUNDATION_ENVIRONMENT: "sandbox" },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
      QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
    },
  ];
  for (const overrides of cases) {
    const result = runCli(overrides);
    assert.doesNotMatch(result.stderr, new RegExp(SANDBOX_CLIENT_ID));
    assert.doesNotMatch(result.stderr, new RegExp(SANDBOX_CLIENT_SECRET));
  }
});

// 11. no network call occurs (static source check: no HTTP/fetch/DNS capability at all)
test("the script's source contains no network-capable import or call", () => {
  const source = readFileSync(scriptPath, "utf8");
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /require\(["']https?["']\)/);
  assert.doesNotMatch(source, /from ["']node:https?["']/);
  assert.doesNotMatch(source, /from ["']node:dns["']/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
});

// 12. provider_network_validation remains not_performed in every reachable case
test("provider_network_validation is always exactly not_performed", () => {
  const cases = [
    {},
    { QURAN_FOUNDATION_ENVIRONMENT: "production" },
    {
      QURAN_FOUNDATION_ENVIRONMENT: "sandbox",
      QURAN_FOUNDATION_SANDBOX_CLIENT_ID: SANDBOX_CLIENT_ID,
      QURAN_FOUNDATION_SANDBOX_CLIENT_SECRET: SANDBOX_CLIENT_SECRET,
    },
  ];
  for (const overrides of cases) {
    const result = runCli(overrides);
    const fields = parseOutput(result.stdout);
    assert.equal(fields.provider_network_validation, "not_performed");
  }
});
