const GOOGLE_OIDC_LOGIN_TRANSACTION_COOKIE_NAME = "alsamad_google_oidc_tx";

type LoginTransactionCookieStore = {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      path: "/";
      secure: boolean;
      expires: Date;
    },
  ): void;
  delete(name: string): void;
};

export type GoogleOidcLoginTransactionCookieDependencies = {
  getCookieStore: () => Promise<LoginTransactionCookieStore>;
  isProduction: () => boolean;
  now: () => Date;
};

const defaultDependencies: GoogleOidcLoginTransactionCookieDependencies = {
  async getCookieStore() {
    const { cookies } = await import("next/headers");
    return await cookies();
  },
  isProduction: () => process.env.NODE_ENV === "production",
  now: () => new Date(),
};

export async function setGoogleOidcLoginTransactionCookie(
  rawCredential: string,
  expiresAt: Date,
  dependencies: GoogleOidcLoginTransactionCookieDependencies = defaultDependencies,
): Promise<void> {
  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= dependencies.now().getTime()
  ) {
    throw new Error("expiresAt must be in the future");
  }

  const cookieStore = await dependencies.getCookieStore();

  cookieStore.set(GOOGLE_OIDC_LOGIN_TRANSACTION_COOKIE_NAME, rawCredential, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: dependencies.isProduction(),
    expires: expiresAt,
  });
}

export async function readGoogleOidcLoginTransactionCookie(
  dependencies: GoogleOidcLoginTransactionCookieDependencies = defaultDependencies,
): Promise<string | null> {
  const cookieStore = await dependencies.getCookieStore();

  return (
    cookieStore.get(GOOGLE_OIDC_LOGIN_TRANSACTION_COOKIE_NAME)?.value ?? null
  );
}

export async function clearGoogleOidcLoginTransactionCookie(
  dependencies: GoogleOidcLoginTransactionCookieDependencies = defaultDependencies,
): Promise<void> {
  const cookieStore = await dependencies.getCookieStore();
  cookieStore.delete(GOOGLE_OIDC_LOGIN_TRANSACTION_COOKIE_NAME);
}
