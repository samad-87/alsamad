import { resolveCurrentSession } from "./session-cookie";
import { resolveSessionUserId } from "./session-runtime";

export type CurrentUserDependencies = {
  resolveCurrentSession: () => Promise<string | null>;
  resolveSessionUserId: (sessionId: string) => Promise<string | null>;
};

const defaultDependencies: CurrentUserDependencies = {
  resolveCurrentSession,
  resolveSessionUserId,
};

export async function resolveCurrentUserId(
  dependencies: CurrentUserDependencies = defaultDependencies,
): Promise<string | null> {
  const sessionId = await dependencies.resolveCurrentSession();

  if (sessionId === null) {
    return null;
  }

  return dependencies.resolveSessionUserId(sessionId);
}
