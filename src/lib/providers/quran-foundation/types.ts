/**
 * Quran.Foundation provider types for the M5.2 non-networking adapter shell.
 *
 * Deliberately excludes any base URL, credential, token, or scope field —
 * those remain unauthorized until a separate credential-gate contract is
 * approved (see ALSAMAD_IMPLEMENTATION_ROADMAP.md's M5.2 acceptance gates).
 */
import type {
  NormalizedQuranRecord,
  ProviderRecordEnvelope,
} from "../../quran/import/contracts";

export interface QuranFoundationAdapterConfig {
  readonly processIdentity: string;
  readonly softwareVersion: string;
}

/** Real Quran.Foundation payload shapes are not authorized in M5.2. */
export type RawQuranFoundationPayload = Readonly<Record<string, unknown>>;

export type QuranFoundationRecordEnvelope =
  ProviderRecordEnvelope<RawQuranFoundationPayload>;

export type { NormalizedQuranRecord };
