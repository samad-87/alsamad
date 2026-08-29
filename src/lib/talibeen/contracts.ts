/**
 * Talibeen Foundation domain contracts.
 *
 * This module is synthetic-only and runtime-inert. It defines no persistence,
 * public projection, identity-provider binding, or production composition.
 */

declare const alsamadIdentityReferenceBrand: unique symbol;
declare const talibeenPrivateProfileReferenceBrand: unique symbol;
declare const alsamadPublicProfileReferenceBrand: unique symbol;

export type SyntheticAlsamadIdentityReference = string & {
  readonly [alsamadIdentityReferenceBrand]: "synthetic-alsamad-identity";
};

export type TalibeenPrivateProfileReference = string & {
  readonly [talibeenPrivateProfileReferenceBrand]: "talibeen-private-profile";
};

export type AlsamadPublicProfileReference = string & {
  readonly [alsamadPublicProfileReferenceBrand]: "alsamad-public-profile";
};

export type MarriageCandidateSex = "man" | "woman";

export type TalibeenVerificationState = "unverified" | "verified";

export type TalibeenMembership = "free" | "plus";

export interface TalibeenPrivateProfileContract {
  readonly boundary: "talibeen-private";
  readonly profileReference: TalibeenPrivateProfileReference;
  readonly identityReference: SyntheticAlsamadIdentityReference;
}

export interface AlsamadPublicProfileContract {
  readonly boundary: "alsamad-public";
  readonly profileReference: AlsamadPublicProfileReference;
}

export interface TalibeenAccountSemantics {
  readonly verification: TalibeenVerificationState;
  readonly membership: TalibeenMembership;
}

export const TALIBEEN_FOUNDATION_RUNTIME = {
  activation: "default-off",
  composition: "not-composed",
  exposure: "none",
} as const;

export function syntheticAlsamadIdentityReference(
  value: string,
): SyntheticAlsamadIdentityReference | null {
  const normalized = value.trim();
  return normalized ? (normalized as SyntheticAlsamadIdentityReference) : null;
}

export function talibeenPrivateProfileReference(
  value: string,
): TalibeenPrivateProfileReference | null {
  const normalized = value.trim();
  return normalized ? (normalized as TalibeenPrivateProfileReference) : null;
}

export function alsamadPublicProfileReference(
  value: string,
): AlsamadPublicProfileReference | null {
  const normalized = value.trim();
  return normalized ? (normalized as AlsamadPublicProfileReference) : null;
}
