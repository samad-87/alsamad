import test from "node:test";
import assert from "node:assert/strict";

import { resolveAuthenticationIdentity } from "../src/lib/auth/identity-resolution.ts";

const USER_ID = "018f2f2a-0000-7000-8000-000000000001";

function dependenciesFor(rows, capture) {
  return {
    persistence: {
      async findByCanonicalIdentity(authenticatorNamespace, subject) {
        if (capture) {
          capture.authenticatorNamespace = authenticatorNamespace;
          capture.subject = subject;
        }

        return rows;
      },
    },
  };
}

test("active identity returns exact durable userId", async () => {
  const result = await resolveAuthenticationIdentity(
    "google",
    "subject-123",
    dependenciesFor([
      {
        userId: USER_ID,
        status: "active",
      },
    ]),
  );

  assert.equal(result, USER_ID);
});

test("retired identity returns null", async () => {
  const result = await resolveAuthenticationIdentity(
    "google",
    "subject-123",
    dependenciesFor([
      {
        userId: USER_ID,
        status: "retired",
      },
    ]),
  );

  assert.equal(result, null);
});

test("missing identity returns null", async () => {
  const result = await resolveAuthenticationIdentity(
    "google",
    "subject-123",
    dependenciesFor([]),
  );

  assert.equal(result, null);
});

test("ambiguous identity returns null", async () => {
  const result = await resolveAuthenticationIdentity(
    "google",
    "subject-123",
    dependenciesFor([
      {
        userId: USER_ID,
        status: "active",
      },
      {
        userId: "018f2f2a-0000-7000-8000-000000000002",
        status: "active",
      },
    ]),
  );

  assert.equal(result, null);
});

test("authenticator namespace is passed unchanged", async () => {
  const capture = {};

  await resolveAuthenticationIdentity(
    "Google.Mixed_Case",
    "subject",
    dependenciesFor([], capture),
  );

  assert.equal(capture.authenticatorNamespace, "Google.Mixed_Case");
});

test("subject is passed unchanged", async () => {
  const capture = {};

  await resolveAuthenticationIdentity(
    "google",
    " Subject With Spaces ",
    dependenciesFor([], capture),
  );

  assert.equal(capture.subject, " Subject With Spaces ");
});

test("resolver performs no implicit normalization", async () => {
  const capture = {};

  await resolveAuthenticationIdentity(
    "Provider.Mixed",
    "  AbC-123  ",
    dependenciesFor([], capture),
  );

  assert.deepEqual(capture, {
    authenticatorNamespace: "Provider.Mixed",
    subject: "  AbC-123  ",
  });
});
