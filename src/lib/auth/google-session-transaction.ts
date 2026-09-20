import { verifyGoogleOidc } from "./google-oidc.js";
import { establishVerifiedSession } from "./verified-session-establishment";

export type GoogleSessionTransactionDependencies = {
  verifyGoogleOidc: typeof verifyGoogleOidc;
  establishVerifiedSession: typeof establishVerifiedSession;
};

const defaultDependencies: GoogleSessionTransactionDependencies = {
  verifyGoogleOidc,
  establishVerifiedSession,
};

export async function establishGoogleVerifiedSession(
  verificationInput: Parameters<typeof verifyGoogleOidc>[0],
  expiresAt: Date,
  dependencies: GoogleSessionTransactionDependencies = defaultDependencies,
): Promise<string | null> {
  const verifiedIdentity =
    await dependencies.verifyGoogleOidc(verificationInput);

  if (verifiedIdentity === null) {
    return null;
  }

  return await dependencies.establishVerifiedSession(
    verifiedIdentity,
    expiresAt,
  );
}
