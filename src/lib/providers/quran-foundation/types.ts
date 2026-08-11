/**
 * Quran.Foundation provider types for the M5.2 non-networking adapter shell,
 * extended by M5.2B (ALSAMAD_IMPLEMENTATION_ROADMAP.md) with the credential
 * and token-lifecycle shapes that unit authorizes.
 *
 * These are type-only declarations (field names, never values). No base URL,
 * scope, or resource-fetch field is added here — those remain unauthorized
 * until a separately approved unit permits controlled network access.
 */
import type {
  NormalizedQuranRecord,
  ProviderRecordEnvelope,
} from "../../quran/import/contracts";

/**
 * M5.2B's resolved mapping: Quran.Foundation's external "Pre-Production"
 * environment corresponds to exactly `"sandbox"`. `"production"` is the
 * separate, still-blocked environment. This is a narrower, credential-gate
 * -specific alias of the broader `ProviderEnvironment` type in
 * `../../quran/import/contracts`, which also carries the unmapped
 * `"staging"` value that this unit does not use.
 */
export type QuranFoundationProviderEnvironment = "sandbox" | "production";

/**
 * A structurally validated credential pair for exactly one explicitly
 * selected environment. `clientSecret` is a secret per M5.2B's
 * classification: server-only, never logged, never persisted, never
 * embedded in a manifest/evidence/checkpoint/audit-event/database row.
 */
export interface QuranFoundationCredentials {
  readonly environment: QuranFoundationProviderEnvironment;
  readonly clientId: string;
  readonly clientSecret: string;
}

/** The outcome of a server-side Content API token request. */
export interface QuranFoundationTokenResponse {
  readonly accessToken: string;
  readonly expiresInSeconds: number;
}

/**
 * Injected transport for OAuth token acquisition, mirroring the existing
 * injected-operation pattern already used by `executeInjectedWithRetry` in
 * `./adapter`. This unit owns no URL, HTTP client, or real network call; a
 * later, separately authorized unit supplies a real transport.
 */
export interface QuranFoundationTokenTransport {
  requestAccessToken(
    credentials: QuranFoundationCredentials,
  ): Promise<QuranFoundationTokenResponse>;
}

export interface QuranFoundationAdapterConfig {
  readonly processIdentity: string;
  readonly softwareVersion: string;
  /**
   * Optional so every existing M5.2A construction (`processIdentity` and
   * `softwareVersion` only) remains valid and behaviorally unchanged.
   * Required only by the new `acquireAccessToken` method.
   */
  readonly credentials?: QuranFoundationCredentials;
}

/** Real Quran.Foundation payload shapes are not authorized in M5.2. */
export type RawQuranFoundationPayload = Readonly<Record<string, unknown>>;

export type QuranFoundationRecordEnvelope =
  ProviderRecordEnvelope<RawQuranFoundationPayload>;

export type { NormalizedQuranRecord };
