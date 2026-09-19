import { createHash, randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";

import { sessionCredentials } from "../../db/schema";
import {
  validateSession,
  type SessionRuntimeDependencies,
} from "./session-runtime";

export type SessionCredentialPersistence = {
  insertCredential(sessionId: string, credentialHash: string): Promise<void>;

  findSessionIdByCredentialHash(credentialHash: string): Promise<string | null>;
};

export type SessionCredentialDependencies = {
  persistence: SessionCredentialPersistence;
  sessionRuntimeDependencies?: SessionRuntimeDependencies;
};

function hashCredential(rawCredential: string): string {
  return createHash("sha256").update(rawCredential, "utf8").digest("hex");
}

const defaultPersistence: SessionCredentialPersistence = {
  async insertCredential(sessionId, credentialHash) {
    const { db } = await import("../../db/client");

    await db.insert(sessionCredentials).values({
      sessionId,
      credentialHash,
    });
  },

  async findSessionIdByCredentialHash(credentialHash) {
    const { db } = await import("../../db/client");

    const rows = await db
      .select({
        sessionId: sessionCredentials.sessionId,
      })
      .from(sessionCredentials)
      .where(eq(sessionCredentials.credentialHash, credentialHash))
      .limit(1);

    return rows[0]?.sessionId ?? null;
  },
};

const defaultDependencies: SessionCredentialDependencies = {
  persistence: defaultPersistence,
};

export async function issueSessionCredential(
  sessionId: string,
  dependencies: SessionCredentialDependencies = defaultDependencies,
): Promise<string> {
  const rawCredential = randomBytes(32).toString("base64url");
  const credentialHash = hashCredential(rawCredential);

  await dependencies.persistence.insertCredential(sessionId, credentialHash);

  return rawCredential;
}

export async function resolveSessionCredential(
  rawCredential: string,
  dependencies: SessionCredentialDependencies = defaultDependencies,
): Promise<string | null> {
  const credentialHash = hashCredential(rawCredential);

  const sessionId =
    await dependencies.persistence.findSessionIdByCredentialHash(
      credentialHash,
    );

  if (!sessionId) {
    return null;
  }

  const valid = await validateSession(
    sessionId,
    dependencies.sessionRuntimeDependencies,
  );

  return valid ? sessionId : null;
}
