import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { createId } from "../../db/ids";
import { googleOidcLoginTransactions } from "../../db/schema";

export type GoogleOidcLoginTransactionRecord = {
  id: string;
  credentialHash: string;
  state: string;
  nonce: string;
  pkceCodeVerifier: string;
  createdAt: Date;
  expiresAt: Date;
  consumedAt: Date | null;
};

export type GoogleOidcLoginTransactionPayload = {
  state: string;
  nonce: string;
  pkceCodeVerifier: string;
};

export type GoogleOidcLoginTransactionPersistence = {
  insertTransaction(
    transaction: GoogleOidcLoginTransactionRecord,
  ): Promise<void>;

  consumeTransactionByCredentialHash(
    credentialHash: string,
    consumedAt: Date,
  ): Promise<GoogleOidcLoginTransactionPayload | null>;
};

export type GoogleOidcLoginTransactionDependencies = {
  persistence: GoogleOidcLoginTransactionPersistence;
  now: () => Date;
};

function hashCredential(rawCredential: string): string {
  return createHash("sha256").update(rawCredential, "utf8").digest("hex");
}

const defaultPersistence: GoogleOidcLoginTransactionPersistence = {
  async insertTransaction(transaction) {
    const { db } = await import("../../db/client");
    await db.insert(googleOidcLoginTransactions).values(transaction);
  },

  async consumeTransactionByCredentialHash(credentialHash, consumedAt) {
    const { db } = await import("../../db/client");

    const rows = await db
      .update(googleOidcLoginTransactions)
      .set({ consumedAt })
      .where(
        and(
          eq(googleOidcLoginTransactions.credentialHash, credentialHash),
          isNull(googleOidcLoginTransactions.consumedAt),
          gt(googleOidcLoginTransactions.expiresAt, consumedAt),
        ),
      )
      .returning({
        state: googleOidcLoginTransactions.state,
        nonce: googleOidcLoginTransactions.nonce,
        pkceCodeVerifier: googleOidcLoginTransactions.pkceCodeVerifier,
      });

    return rows[0] ?? null;
  },
};

const defaultDependencies: GoogleOidcLoginTransactionDependencies = {
  persistence: defaultPersistence,
  now: () => new Date(),
};

export async function issueGoogleOidcLoginTransaction(
  state: string,
  nonce: string,
  pkceCodeVerifier: string,
  expiresAt: Date,
  dependencies: GoogleOidcLoginTransactionDependencies = defaultDependencies,
): Promise<string> {
  const createdAt = dependencies.now();

  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= createdAt.getTime()
  ) {
    throw new Error("expiresAt must be after createdAt");
  }

  const rawCredential = randomBytes(32).toString("base64url");
  const credentialHash = hashCredential(rawCredential);

  await dependencies.persistence.insertTransaction({
    id: createId(),
    credentialHash,
    state,
    nonce,
    pkceCodeVerifier,
    createdAt,
    expiresAt,
    consumedAt: null,
  });

  return rawCredential;
}

export async function consumeGoogleOidcLoginTransaction(
  rawCredential: string,
  dependencies: GoogleOidcLoginTransactionDependencies = defaultDependencies,
): Promise<GoogleOidcLoginTransactionPayload | null> {
  const credentialHash = hashCredential(rawCredential);
  const consumedAt = dependencies.now();

  return dependencies.persistence.consumeTransactionByCredentialHash(
    credentialHash,
    consumedAt,
  );
}
