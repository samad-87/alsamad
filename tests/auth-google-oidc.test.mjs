import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { verifyGoogleOidc } from "../src/lib/auth/google-oidc.js";

const mockConfiguration = {
  grant: null,
};

const callbackUrl = "https://example.com/callback";
const pkceCodeVerifier = "verifier123";
const expectedState = "state123";
const expectedNonce = "nonce123";

describe("verifyGoogleOidc", () => {
  beforeEach(() => {
    mockConfiguration.grant = null;
  });

  afterEach(() => {
    mock.reset();
  });

  it("should return verified identity with correct namespace and subject when sub is present", async () => {
    const mockGrant = mock.fn(async () => ({
      claims: () => ({ sub: "1234567890" }),
    }));

    mockConfiguration.grant = mockGrant;

    const result = await verifyGoogleOidc({
      configuration: mockConfiguration,
      callbackUrl,
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      authorizationCodeGrant: mockGrant,
    });

    assert.deepStrictEqual(result, {
      authenticatorNamespace: "google",
      subject: "1234567890",
    });

    assert.equal(mockGrant.mock.callCount(), 1);
    const callArgs = mockGrant.mock.calls[0].arguments;
    assert.strictEqual(callArgs[0], mockConfiguration);
    assert.strictEqual(callArgs[1], callbackUrl);
    assert.deepStrictEqual(callArgs[2], {
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      idTokenExpected: true,
    });
  });

  it("should return null when claims are missing", async () => {
    const mockGrant = mock.fn(async () => ({
      claims: () => undefined,
    }));

    mockConfiguration.grant = mockGrant;

    const result = await verifyGoogleOidc({
      configuration: mockConfiguration,
      callbackUrl,
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      authorizationCodeGrant: mockGrant,
    });

    assert.strictEqual(result, null);
  });

  it("should return null when sub is missing", async () => {
    const mockGrant = mock.fn(async () => ({
      claims: () => ({ email: "test@example.com" }),
    }));

    mockConfiguration.grant = mockGrant;

    const result = await verifyGoogleOidc({
      configuration: mockConfiguration,
      callbackUrl,
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      authorizationCodeGrant: mockGrant,
    });

    assert.strictEqual(result, null);
  });

  it("should return null when sub is empty string", async () => {
    const mockGrant = mock.fn(async () => ({
      claims: () => ({ sub: "" }),
    }));

    mockConfiguration.grant = mockGrant;

    const result = await verifyGoogleOidc({
      configuration: mockConfiguration,
      callbackUrl,
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      authorizationCodeGrant: mockGrant,
    });

    assert.strictEqual(result, null);
  });

  it("should return null when verification fails", async () => {
    const mockGrant = mock.fn(async () => {
      throw new Error("Verification failed");
    });

    mockConfiguration.grant = mockGrant;

    const result = await verifyGoogleOidc({
      configuration: mockConfiguration,
      callbackUrl,
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      authorizationCodeGrant: mockGrant,
    });

    assert.strictEqual(result, null);
  });
});
