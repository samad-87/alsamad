import { resolveCurrentSession } from "./session-cookie";
import { revokeSession } from "./session-runtime";
import { clearSessionCookie } from "./session-cookie";

export async function signOutCurrentSession(dependencies?: {
  resolveCurrentSession?: () => Promise<string | null>;
  revokeSession?: (sessionId: string) => Promise<void>;
  clearSessionCookie?: () => Promise<void>;
}): Promise<void> {
  const {
    resolveCurrentSession: resolve = resolveCurrentSession,
    revokeSession: revoke = revokeSession,
    clearSessionCookie: clear = clearSessionCookie,
  } = dependencies ?? {};

  const sessionId = await resolve();

  if (sessionId === null) {
    // No active session, just clear the cookie
    await clear();
    return;
  }

  let revokeError: unknown | null = null;
  let clearError: unknown | null = null;

  try {
    await revoke(sessionId);
  } catch (error) {
    revokeError = error;
  }

  try {
    await clear();
  } catch (error) {
    clearError = error;
  }

  if (revokeError !== null && clearError !== null) {
    throw new AggregateError(
      [revokeError, clearError],
      "Session revocation and cookie clearing failed",
    );
  }

  if (revokeError !== null) {
    throw revokeError;
  }

  if (clearError !== null) {
    throw clearError;
  }
}
