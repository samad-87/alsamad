import { hasAccountSessionAuthority as defaultHasAccountSessionAuthority } from "./account-session-authority";
import {
  resolveCurrentAccount as defaultResolveCurrentAccount,
  type CurrentAccount,
} from "./current-account";

export type CurrentAuthorizedAccountDependencies = {
  resolveCurrentAccount: () => Promise<CurrentAccount | null>;
  hasAccountSessionAuthority: (status: CurrentAccount["status"]) => boolean;
};

const defaultDependencies: CurrentAuthorizedAccountDependencies = {
  resolveCurrentAccount: defaultResolveCurrentAccount,
  hasAccountSessionAuthority: defaultHasAccountSessionAuthority,
};

export async function resolveCurrentAuthorizedAccount(
  dependencies: CurrentAuthorizedAccountDependencies = defaultDependencies,
): Promise<CurrentAccount | null> {
  const account = await dependencies.resolveCurrentAccount();

  if (account === null) return null;

  if (!dependencies.hasAccountSessionAuthority(account.status)) return null;

  return account;
}
