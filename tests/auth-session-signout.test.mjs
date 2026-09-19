import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import { signOutCurrentSession } from "../src/lib/auth/session-signout.js";

const mockResolve = mock.fn();
const mockRevoke = mock.fn();
const mockClear = mock.fn();

beforeEach(() => {
  mockResolve.mock.resetCalls();
  mockRevoke.mock.resetCalls();
  mockClear.mock.resetCalls();
});

afterEach(() => {
  mockResolve.mock.restore();
  mockRevoke.mock.restore();
  mockClear.mock.restore();
});

describe("signOutCurrentSession", () => {
  it("should clear cookie when no session is resolved", async () => {
    mockResolve.mock.mockImplementationOnce(() => Promise.resolve(null));

    await signOutCurrentSession({
      resolveCurrentSession: mockResolve,
      revokeSession: mockRevoke,
      clearSessionCookie: mockClear,
    });

    assert.strictEqual(mockResolve.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.callCount(), 0);
    assert.strictEqual(mockClear.mock.callCount(), 1);
  });

  it("should revoke session and clear cookie when session exists", async () => {
    mockResolve.mock.mockImplementationOnce(() =>
      Promise.resolve("session-123"),
    );
    mockRevoke.mock.mockImplementationOnce(() => Promise.resolve());
    mockClear.mock.mockImplementationOnce(() => Promise.resolve());

    await signOutCurrentSession({
      resolveCurrentSession: mockResolve,
      revokeSession: mockRevoke,
      clearSessionCookie: mockClear,
    });

    assert.strictEqual(mockResolve.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.calls[0].arguments[0], "session-123");
    assert.strictEqual(mockClear.mock.callCount(), 1);
  });

  it("should rethrow revoke error when revoke fails but clear succeeds", async () => {
    mockResolve.mock.mockImplementationOnce(() =>
      Promise.resolve("session-123"),
    );
    mockRevoke.mock.mockImplementationOnce(() =>
      Promise.reject(new Error("Revocation failed")),
    );
    mockClear.mock.mockImplementationOnce(() => Promise.resolve());

    await assert.rejects(
      signOutCurrentSession({
        resolveCurrentSession: mockResolve,
        revokeSession: mockRevoke,
        clearSessionCookie: mockClear,
      }),
      (error) => {
        return error.message === "Revocation failed";
      },
    );

    assert.strictEqual(mockResolve.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.callCount(), 1);
    assert.strictEqual(mockClear.mock.callCount(), 1);
  });

  it("should throw clear error when revoke succeeds but clear fails", async () => {
    mockResolve.mock.mockImplementationOnce(() =>
      Promise.resolve("session-123"),
    );
    mockRevoke.mock.mockImplementationOnce(() => Promise.resolve());
    mockClear.mock.mockImplementationOnce(() =>
      Promise.reject(new Error("Cookie clear failed")),
    );

    await assert.rejects(
      signOutCurrentSession({
        resolveCurrentSession: mockResolve,
        revokeSession: mockRevoke,
        clearSessionCookie: mockClear,
      }),
      (error) => {
        return error.message === "Cookie clear failed";
      },
    );

    assert.strictEqual(mockResolve.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.callCount(), 1);
    assert.strictEqual(mockClear.mock.callCount(), 1);
  });

  it("should throw AggregateError when both revoke and clear fail", async () => {
    mockResolve.mock.mockImplementationOnce(() =>
      Promise.resolve("session-123"),
    );
    mockRevoke.mock.mockImplementationOnce(() =>
      Promise.reject(new Error("Revocation failed")),
    );
    mockClear.mock.mockImplementationOnce(() =>
      Promise.reject(new Error("Cookie clear failed")),
    );

    await assert.rejects(
      signOutCurrentSession({
        resolveCurrentSession: mockResolve,
        revokeSession: mockRevoke,
        clearSessionCookie: mockClear,
      }),
      (error) => {
        return (
          error instanceof AggregateError &&
          error.errors.length === 2 &&
          error.errors[0].message === "Revocation failed" &&
          error.errors[1].message === "Cookie clear failed"
        );
      },
    );

    assert.strictEqual(mockResolve.mock.callCount(), 1);
    assert.strictEqual(mockRevoke.mock.callCount(), 1);
    assert.strictEqual(mockClear.mock.callCount(), 1);
  });
});
