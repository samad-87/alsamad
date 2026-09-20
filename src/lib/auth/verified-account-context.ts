import { VerifiedIdentity } from "./verified-identity";
import { resolveVerifiedAuthenticationIdentity } from "./verified-identity-resolution";
import { resolveAccountStatus, AccountStatus } from "./account-status";

export type VerifiedAccountContext = {
  userId: string;
  status: AccountStatus;
};

export async function resolveVerifiedAccountContext(
  identity: VerifiedIdentity,
  dependencies?: {
    resolveVerifiedAuthenticationIdentity: (
      identity: VerifiedIdentity,
    ) => Promise<string | null>;
    resolveAccountStatus: (userId: string) => Promise<AccountStatus | null>;
  },
): Promise<VerifiedAccountContext | null> {
  const resolveVerifiedAuthIdentity =
    dependencies?.resolveVerifiedAuthenticationIdentity ??
    resolveVerifiedAuthenticationIdentity;
  const resolveAccountStatusFn =
    dependencies?.resolveAccountStatus ?? resolveAccountStatus;

  const userId = await resolveVerifiedAuthIdentity(identity);
  if (userId === null) {
    return null;
  }

  const status = await resolveAccountStatusFn(userId);
  if (status === null) {
    return null;
  }

  return { userId, status };
}
