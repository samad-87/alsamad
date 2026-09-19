import { and, eq, isNull } from "drizzle-orm";

import { createId } from "../../db/ids";
import { userSessions } from "../../db/schema";

export type SessionRecord = {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export type SessionPersistence = {
  insertSession(session: SessionRecord): Promise<void>;
  findSessionById(sessionId: string): Promise<SessionRecord | null>;
  revokeSessionById(sessionId: string, revokedAt: Date): Promise<void>;
  revokeAllSessionsByUserId(userId: string, revokedAt: Date): Promise<void>;
};

export type SessionRuntimeDependencies = {
  persistence: SessionPersistence;
  now: () => Date;
};

const defaultPersistence: SessionPersistence = {
  async insertSession(session) {
    const { db } = await import("../../db/client");
    await db.insert(userSessions).values(session);
  },

  async findSessionById(sessionId) {
    const { db } = await import("../../db/client");

    const rows = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, sessionId))
      .limit(1);

    return rows[0] ?? null;
  },

  async revokeSessionById(sessionId, revokedAt) {
    const { db } = await import("../../db/client");

    await db
      .update(userSessions)
      .set({ revokedAt })
      .where(
        and(eq(userSessions.id, sessionId), isNull(userSessions.revokedAt)),
      );
  },

  async revokeAllSessionsByUserId(userId, revokedAt) {
    const { db } = await import("../../db/client");

    await db
      .update(userSessions)
      .set({ revokedAt })
      .where(
        and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)),
      );
  },
};

const defaultDependencies: SessionRuntimeDependencies = {
  persistence: defaultPersistence,
  now: () => new Date(),
};

export async function createSession(
  userId: string,
  expiresAt: Date,
  dependencies: SessionRuntimeDependencies = defaultDependencies,
): Promise<string> {
  const createdAt = dependencies.now();

  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= createdAt.getTime()
  ) {
    throw new Error("expiresAt must be after createdAt");
  }

  const session: SessionRecord = {
    id: createId(),
    userId,
    createdAt,
    expiresAt,
    revokedAt: null,
  };

  await dependencies.persistence.insertSession(session);

  return session.id;
}

export async function validateSession(
  sessionId: string,
  dependencies: SessionRuntimeDependencies = defaultDependencies,
): Promise<boolean> {
  const session = await dependencies.persistence.findSessionById(sessionId);

  if (!session || session.revokedAt !== null) {
    return false;
  }

  return session.expiresAt.getTime() > dependencies.now().getTime();
}

export async function revokeSession(
  sessionId: string,
  dependencies: SessionRuntimeDependencies = defaultDependencies,
): Promise<void> {
  const revokedAt = dependencies.now();
  await dependencies.persistence.revokeSessionById(sessionId, revokedAt);
}

export async function revokeAllSessions(
  userId: string,
  dependencies: SessionRuntimeDependencies = defaultDependencies,
): Promise<void> {
  const revokedAt = dependencies.now();
  await dependencies.persistence.revokeAllSessionsByUserId(userId, revokedAt);
}
