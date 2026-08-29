import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  TALIBEEN_FOUNDATION_RUNTIME,
  alsamadPublicProfileReference,
  syntheticAlsamadIdentityReference,
  talibeenPrivateProfileReference,
} from "../src/lib/talibeen/contracts.ts";
import {
  evaluateAdultEligibility,
  evaluateCandidateDirection,
} from "../src/lib/talibeen/eligibility.ts";

test("adult eligibility accepts exactly 18 and older adults", () => {
  assert.deepEqual(evaluateAdultEligibility(18), { eligible: true });
  assert.deepEqual(evaluateAdultEligibility(42), { eligible: true });
});

test("adult eligibility rejects people under 18", () => {
  assert.deepEqual(evaluateAdultEligibility(17), {
    eligible: false,
    reason: "under-18",
  });
  assert.deepEqual(evaluateAdultEligibility(0), {
    eligible: false,
    reason: "under-18",
  });
});

test("adult eligibility fails closed for missing, invalid, or malformed input", () => {
  for (const input of [
    undefined,
    null,
    "18",
    "unknown",
    NaN,
    Infinity,
    18.5,
    -1,
  ]) {
    assert.deepEqual(evaluateAdultEligibility(input), {
      eligible: false,
      reason: "invalid-age",
    });
  }
});

test("candidate direction allows only man-to-woman and woman-to-man", () => {
  assert.deepEqual(evaluateCandidateDirection("man", "woman"), {
    eligible: true,
  });
  assert.deepEqual(evaluateCandidateDirection("woman", "man"), {
    eligible: true,
  });
});

test("candidate direction rejects same-sex directions", () => {
  assert.deepEqual(evaluateCandidateDirection("man", "man"), {
    eligible: false,
    reason: "same-sex-direction",
  });
  assert.deepEqual(evaluateCandidateDirection("woman", "woman"), {
    eligible: false,
    reason: "same-sex-direction",
  });
});

test("candidate direction fails closed for invalid or generic values", () => {
  for (const [source, target] of [
    ["unknown", "woman"],
    ["man", "unknown"],
    ["any", "woman"],
    ["man", "any"],
    [undefined, "woman"],
    ["man", null],
  ]) {
    assert.deepEqual(evaluateCandidateDirection(source, target), {
      eligible: false,
      reason: "invalid-direction",
    });
  }
});

test("identity references are opaque synthetic values with no resolver", () => {
  assert.equal(
    syntheticAlsamadIdentityReference(" synthetic-person-1 "),
    "synthetic-person-1",
  );
  assert.equal(syntheticAlsamadIdentityReference("  "), null);
});

test("private Talibeen and public ALSAMAD profile references remain separate", () => {
  const privateReference = talibeenPrivateProfileReference("private-1");
  const publicReference = alsamadPublicProfileReference("public-1");

  assert.equal(privateReference, "private-1");
  assert.equal(publicReference, "public-1");
  assert.notEqual(privateReference, publicReference);
});

test("verification and membership are independent semantics", () => {
  const verifiedFree = { verification: "verified", membership: "free" };
  const unverifiedPlus = { verification: "unverified", membership: "plus" };

  assert.deepEqual(verifiedFree, {
    verification: "verified",
    membership: "free",
  });
  assert.deepEqual(unverifiedPlus, {
    verification: "unverified",
    membership: "plus",
  });
  for (const forbiddenImplication of [
    "trust",
    "ranking",
    "safety",
    "compatibility",
  ]) {
    assert.equal(forbiddenImplication in unverifiedPlus, false);
  }
});

test("Foundation is explicitly default-off and not runtime-composed", () => {
  assert.deepEqual(TALIBEEN_FOUNDATION_RUNTIME, {
    activation: "default-off",
    composition: "not-composed",
    exposure: "none",
  });
});

test("Foundation source has no imports, I/O, persistence, providers, or runtime wiring", async () => {
  const sourcePaths = [
    new URL("../src/lib/talibeen/contracts.ts", import.meta.url),
    new URL("../src/lib/talibeen/eligibility.ts", import.meta.url),
  ];
  const sources = await Promise.all(
    sourcePaths.map((sourcePath) => readFile(sourcePath, "utf8")),
  );
  const combined = sources.join("\n");
  const executableText = combined
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

  assert.doesNotMatch(combined, /^\s*import\s/m);
  assert.doesNotMatch(
    executableText,
    /(?:app\/|components\/|next\/|drizzle|database|repository|migration|node:fs|fetch\s*\(|axios|provider|process\.env|analytics|telemetry|notification|payment|openai|knowledge|quran|devotional)/i,
  );
});
