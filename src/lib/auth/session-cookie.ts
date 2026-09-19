import { resolveSessionCredential } from "./session-credential";

const SESSION_COOKIE_NAME = "alsamad_session";

type SessionCookieStore = {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      path: "/";
      secure: boolean;
    },
  ): void;
  delete(name: string): void;
};

export type SessionCookieDependencies = {
  getCookieStore: () => Promise<SessionCookieStore>;
  resolveCredential: (rawCredential: string) => Promise<string | null>;
  isProduction: () => boolean;
};

const defaultDependencies: SessionCookieDependencies = {
  async getCookieStore() {
    const { cookies } = await import("next/headers");
    return await cookies();
  },

  resolveCredential: resolveSessionCredential,

  isProduction: () => process.env.NODE_ENV === "production",
};

export async function setSessionCookie(
  rawCredential: string,
  dependencies: SessionCookieDependencies = defaultDependencies,
): Promise<void> {
  const cookieStore = await dependencies.getCookieStore();

  cookieStore.set(SESSION_COOKIE_NAME, rawCredential, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: dependencies.isProduction(),
  });
}

export async function readSessionCookie(
  dependencies: SessionCookieDependencies = defaultDependencies,
): Promise<string | null> {
  const cookieStore = await dependencies.getCookieStore();

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function clearSessionCookie(
  dependencies: SessionCookieDependencies = defaultDependencies,
): Promise<void> {
  const cookieStore = await dependencies.getCookieStore();

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function resolveCurrentSession(
  dependencies: SessionCookieDependencies = defaultDependencies,
): Promise<string | null> {
  const rawCredential = await readSessionCookie(dependencies);

  if (!rawCredential) {
    return null;
  }

  return dependencies.resolveCredential(rawCredential);
}
