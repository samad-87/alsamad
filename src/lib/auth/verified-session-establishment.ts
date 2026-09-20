import type { VerifiedIdentity } from "./verified-identity";
import { resolveVerifiedAccountContext as defaultResolveVerifiedAccountContext } from "./verified-account-context";
import { hasAccountSessionAuthority as defaultHasAccountSessionAuthority } from "./account-session-authority";
import { establishSession as defaultEstablishSession } from "./session-flow";

export async function establishVerifiedSession(
  identity: VerifiedIdentity,
  expiresAt: Date,
  dependencies?: {
    resolveVerifiedAccountContext?: typeof defaultResolveVerifiedAccountContext;
    hasAccountSessionAuthority?: typeof defaultHasAccountSessionAuthority;
    establishSession?: typeof defaultEstablishSession;
  },
): Promise<string | null> {
  const {
    resolveVerifiedAccountContext = defaultResolveVerifiedAccountContext,
    hasAccountSessionAuthority = defaultHasAccountSessionAuthority,
    establishSession = defaultEstablishSession,
  } = dependencies ?? {};

  const context = await resolveVerifiedAccountContext(identity);
  if (!context) return null;

  const { userId, status } = context;

  if (!hasAccountSessionAuthority(status)) return null;

  return await establishSession(userId, expiresAt);
}
