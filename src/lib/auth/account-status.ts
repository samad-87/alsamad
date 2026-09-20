import { eq } from "drizzle-orm";

import { users } from "../../db/schema";
import { resolveCurrentUserId } from "./current-user";

export const accountStatuses = [
  "active",
  "disabled",
  "deletion_pending",
  "deleted",
] as const;

export type AccountStatus = (typeof accountStatuses)[number];

export type AccountStatusPersistence = {
  findStatusByUserId: (userId: string) => Promise<AccountStatus | null>;
};

export type AccountStatusDependencies = {
  persistence: AccountStatusPersistence;
};

const defaultPersistence: AccountStatusPersistence = {
  async findStatusByUserId(userId) {
    const { db } = await import("../../db/client");

    const rows = await db
      .select({
        status: users.status,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!rows[0]) {
      return null;
    }

    return rows[0].status as AccountStatus;
  },
};

const defaultAccountStatusDependencies: AccountStatusDependencies = {
  persistence: defaultPersistence,
};

export async function resolveAccountStatus(
  userId: string,
  dependencies: AccountStatusDependencies = defaultAccountStatusDependencies,
): Promise<AccountStatus | null> {
  return dependencies.persistence.findStatusByUserId(userId);
}

export type CurrentAccountStatusDependencies = {
  resolveCurrentUserId: () => Promise<string | null>;
  resolveAccountStatus: (userId: string) => Promise<AccountStatus | null>;
};

const defaultCurrentAccountStatusDependencies: CurrentAccountStatusDependencies =
  {
    resolveCurrentUserId,
    resolveAccountStatus,
  };

export async function resolveCurrentAccountStatus(
  dependencies: CurrentAccountStatusDependencies = defaultCurrentAccountStatusDependencies,
): Promise<AccountStatus | null> {
  const userId = await dependencies.resolveCurrentUserId();

  if (userId === null) {
    return null;
  }

  return dependencies.resolveAccountStatus(userId);
}
