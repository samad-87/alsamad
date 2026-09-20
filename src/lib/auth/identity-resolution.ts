import { and, eq } from "drizzle-orm";

import { userIdentities } from "../../db/schema";

type IdentityResolutionRow = {
  userId: string;
  status: string;
};

export type IdentityResolutionPersistence = {
  findByCanonicalIdentity: (
    authenticatorNamespace: string,
    subject: string,
  ) => Promise<readonly IdentityResolutionRow[]>;
};

export type IdentityResolutionDependencies = {
  persistence: IdentityResolutionPersistence;
};

const defaultPersistence: IdentityResolutionPersistence = {
  async findByCanonicalIdentity(authenticatorNamespace, subject) {
    const { db } = await import("../../db/client");

    return db
      .select({
        userId: userIdentities.userId,
        status: userIdentities.status,
      })
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.authenticatorNamespace, authenticatorNamespace),
          eq(userIdentities.subject, subject),
        ),
      )
      .limit(2);
  },
};

const defaultDependencies: IdentityResolutionDependencies = {
  persistence: defaultPersistence,
};

export async function resolveAuthenticationIdentity(
  authenticatorNamespace: string,
  subject: string,
  dependencies: IdentityResolutionDependencies = defaultDependencies,
): Promise<string | null> {
  const rows = await dependencies.persistence.findByCanonicalIdentity(
    authenticatorNamespace,
    subject,
  );

  if (rows.length !== 1) {
    return null;
  }

  const [identity] = rows;

  if (identity.status !== "active") {
    return null;
  }

  return identity.userId;
}
