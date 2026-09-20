import { resolveAuthenticationIdentity } from "./identity-resolution";
import type { VerifiedIdentity } from "./verified-identity";

export type VerifiedIdentityResolutionDependencies = {
  resolveAuthenticationIdentity: (
    authenticatorNamespace: string,
    subject: string,
  ) => Promise<string | null>;
};

const defaultDependencies: VerifiedIdentityResolutionDependencies = {
  resolveAuthenticationIdentity,
};

export async function resolveVerifiedAuthenticationIdentity(
  identity: VerifiedIdentity,
  dependencies: VerifiedIdentityResolutionDependencies = defaultDependencies,
): Promise<string | null> {
  return dependencies.resolveAuthenticationIdentity(
    identity.authenticatorNamespace,
    identity.subject,
  );
}
