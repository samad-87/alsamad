import { issueSessionCredential } from "./session-credential";
import { setSessionCookie } from "./session-cookie";
import { createSession, revokeSession } from "./session-runtime";

export type SessionFlowDependencies = {
  createSession: (userId: string, expiresAt: Date) => Promise<string>;

  issueSessionCredential: (sessionId: string) => Promise<string>;

  setSessionCookie: (rawCredential: string) => Promise<void>;

  revokeSession: (sessionId: string) => Promise<void>;
};

const defaultDependencies: SessionFlowDependencies = {
  createSession,
  issueSessionCredential,
  setSessionCookie,
  revokeSession,
};

export async function establishSession(
  userId: string,
  expiresAt: Date,
  dependencies: SessionFlowDependencies = defaultDependencies,
): Promise<string> {
  const sessionId = await dependencies.createSession(userId, expiresAt);

  try {
    const rawCredential = await dependencies.issueSessionCredential(sessionId);

    await dependencies.setSessionCookie(rawCredential);

    return sessionId;
  } catch (establishmentError) {
    try {
      await dependencies.revokeSession(sessionId);
    } catch (compensationError) {
      throw new AggregateError(
        [establishmentError, compensationError],
        "Session establishment failed and compensating revocation also failed",
      );
    }

    throw establishmentError;
  }
}
