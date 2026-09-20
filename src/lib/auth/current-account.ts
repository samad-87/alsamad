import { resolveAccountStatus, type AccountStatus } from "./account-status";
import { resolveCurrentUserId } from "./current-user";

export type CurrentAccount = {
  userId: string;
  status: AccountStatus;
};

export type CurrentAccountDependencies = {
  resolveCurrentUserId: () => Promise<string | null>;
  resolveAccountStatus: (userId: string) => Promise<AccountStatus | null>;
};

const defaultDependencies: CurrentAccountDependencies = {
  resolveCurrentUserId,
  resolveAccountStatus,
};

export async function resolveCurrentAccount(
  dependencies: CurrentAccountDependencies = defaultDependencies,
): Promise<CurrentAccount | null> {
  const userId = await dependencies.resolveCurrentUserId();

  if (userId === null) {
    return null;
  }

  const status = await dependencies.resolveAccountStatus(userId);

  if (status === null) {
    return null;
  }

  return {
    userId,
    status,
  };
}
