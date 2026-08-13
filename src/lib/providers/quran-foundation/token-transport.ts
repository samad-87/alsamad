import type {
  QuranFoundationCredentials,
  QuranFoundationTokenResponse,
  QuranFoundationTokenTransport,
} from "./types";

if (typeof window !== "undefined") {
  throw new Error("Quran.Foundation token transport is server-only.");
}

const TOKEN_ENDPOINT = "https://prelive-oauth2.quran.foundation/oauth2/token";
const TOKEN_ORIGIN = "https://prelive-oauth2.quran.foundation";
const MAX_RESPONSE_BYTES = 16 * 1024;
const DEFAULT_TIMEOUT_MS = 30_000;

export type TokenTransportErrorCode =
  | "production_not_authorized"
  | "invalid_credentials_shape"
  | "timeout"
  | "network_failure"
  | "redirect_rejected"
  | "http_4xx"
  | "http_5xx"
  | "invalid_http_response"
  | "response_too_large"
  | "malformed_json"
  | "missing_access_token"
  | "invalid_expires_in"
  | "invalid_token_type"
  | "invalid_scope";

export class QuranFoundationTokenTransportError extends Error {
  readonly code: TokenTransportErrorCode;

  constructor(code: TokenTransportErrorCode) {
    super(`Quran.Foundation token transport failed: ${code}.`);
    this.name = "QuranFoundationTokenTransportError";
    this.code = code;
  }
}

export interface TokenAttemptEvidence {
  readonly tokenEndpointAttempted: boolean;
  readonly httpStatusClass:
    "2xx" | "4xx" | "5xx" | "network_error" | "timeout" | "not_attempted";
  readonly authentication: "pass" | "fail" | "not_attempted";
  readonly tokenReturned: boolean;
  readonly tokenTypeValid: boolean | null;
  readonly scopeValid: boolean | null;
  readonly expiryMetadataValid: boolean | null;
}

const INITIAL_EVIDENCE: TokenAttemptEvidence = Object.freeze({
  tokenEndpointAttempted: false,
  httpStatusClass: "not_attempted",
  authentication: "not_attempted",
  tokenReturned: false,
  tokenTypeValid: null,
  scopeValid: null,
  expiryMetadataValid: null,
});

function isNonBlank(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function safeError(code: TokenTransportErrorCode): never {
  throw new QuranFoundationTokenTransportError(code);
}

function readWithAbort(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException("Aborted", "AbortError"));
    if (signal.aborted) {
      onAbort();
      return;
    }
    // The check and registration are synchronous, so an AbortSignal cannot
    // transition between them on the JavaScript event loop without the
    // listener observing that transition.
    signal.addEventListener("abort", onAbort, { once: true });
    reader.read().then(
      (result) => {
        signal.removeEventListener("abort", onAbort);
        resolve(result);
      },
      (error: unknown) => {
        signal.removeEventListener("abort", onAbort);
        reject(error);
      },
    );
  });
}

async function readBoundedBody(
  response: Response,
  signal: AbortSignal,
): Promise<Uint8Array> {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null) {
    const parsedLength = Number(declaredLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength < 0) {
      safeError("invalid_http_response");
    }
    if (parsedLength > MAX_RESPONSE_BYTES) safeError("response_too_large");
  }

  if (!response.body) return new Uint8Array();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await readWithAbort(reader, signal);
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) {
        safeError("response_too_large");
      }
      chunks.push(value);
    }
  } catch (error) {
    // Best-effort cleanup must never delay the governed timeout/error result.
    // Attaching a rejection handler prevents a hostile cancel implementation
    // from creating an unhandled rejection, while deliberately not awaiting
    // a cancellation promise that may never settle.
    void reader.cancel().catch(() => undefined);
    throw error;
  }
  reader.releaseLock();
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export class QuranFoundationPreProductionTokenTransport implements QuranFoundationTokenTransport {
  private readonly fetchImplementation: typeof globalThis.fetch;
  private readonly timeoutMs: number;
  private lastAttemptEvidence: TokenAttemptEvidence = INITIAL_EVIDENCE;

  constructor(
    options: {
      fetch?: typeof globalThis.fetch;
      timeoutMs?: number;
    } = {},
  ) {
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    if (
      !Number.isFinite(timeoutMs) ||
      !Number.isInteger(timeoutMs) ||
      timeoutMs <= 0 ||
      timeoutMs > DEFAULT_TIMEOUT_MS
    ) {
      throw new Error(
        "timeoutMs must be a positive integer no greater than 30000.",
      );
    }
    this.fetchImplementation = options.fetch ?? globalThis.fetch;
    this.timeoutMs = timeoutMs;
  }

  getLastAttemptEvidence(): Readonly<TokenAttemptEvidence> {
    return Object.freeze({ ...this.lastAttemptEvidence });
  }

  async requestAccessToken(
    credentials: QuranFoundationCredentials,
  ): Promise<QuranFoundationTokenResponse> {
    this.lastAttemptEvidence = INITIAL_EVIDENCE;
    if (credentials?.environment !== "sandbox") {
      safeError("production_not_authorized");
    }
    if (
      !isNonBlank(credentials.clientId) ||
      !isNonBlank(credentials.clientSecret)
    ) {
      safeError("invalid_credentials_shape");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    this.lastAttemptEvidence = {
      ...INITIAL_EVIDENCE,
      tokenEndpointAttempted: true,
      authentication: "fail",
    };

    let response: Response;
    try {
      response = await this.fetchImplementation(TOKEN_ENDPOINT, {
        method: "POST",
        redirect: "error",
        signal: controller.signal,
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${credentials.clientId}:${credentials.clientSecret}`,
            "utf8",
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=content",
      });
    } catch {
      if (controller.signal.aborted) {
        clearTimeout(timeout);
        this.lastAttemptEvidence = {
          ...this.lastAttemptEvidence,
          httpStatusClass: "timeout",
        };
        safeError("timeout");
      }
      clearTimeout(timeout);
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        httpStatusClass: "network_error",
      };
      safeError("network_failure");
    }
    // A fetch implementation may ignore AbortSignal and resolve after the
    // governed deadline. Timeout must win before any response property is
    // inspected, regardless of what that late response contains.
    if (controller.signal.aborted) {
      clearTimeout(timeout);
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        httpStatusClass: "timeout",
      };
      safeError("timeout");
    }
    try {
      if (response.redirected) {
        safeError("redirect_rejected");
      }
      if (!isNonBlank(response.url)) safeError("invalid_http_response");
      if (new URL(response.url).origin !== TOKEN_ORIGIN) {
        safeError("redirect_rejected");
      }
      const statusClass =
        response.status >= 200 && response.status < 300
          ? "2xx"
          : response.status >= 400 && response.status < 500
            ? "4xx"
            : response.status >= 500 && response.status < 600
              ? "5xx"
              : "network_error";
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        httpStatusClass: statusClass,
      };
      if (!response.ok) {
        if (statusClass === "4xx") safeError("http_4xx");
        if (statusClass === "5xx") safeError("http_5xx");
        safeError("invalid_http_response");
      }

      const bytes = await readBoundedBody(response, controller.signal);
      let payload: unknown;
      try {
        payload = JSON.parse(
          new TextDecoder("utf-8", { fatal: true }).decode(bytes),
        );
      } catch {
        safeError("malformed_json");
      }
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        safeError("malformed_json");
      }
      const record = payload as Record<string, unknown>;
      if (!isNonBlank(record.access_token)) safeError("missing_access_token");
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        tokenReturned: true,
      };

      const tokenTypeValid =
        typeof record.token_type === "string" &&
        record.token_type.toLowerCase() === "bearer";
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        tokenTypeValid,
      };
      if (!tokenTypeValid) safeError("invalid_token_type");

      const scopeValid =
        typeof record.scope === "string" &&
        record.scope.split(/\s+/u).filter(Boolean).includes("content");
      this.lastAttemptEvidence = { ...this.lastAttemptEvidence, scopeValid };
      if (!scopeValid) safeError("invalid_scope");

      const expiresInSeconds = record.expires_in;
      const expiryMetadataValid =
        typeof expiresInSeconds === "number" &&
        Number.isFinite(expiresInSeconds) &&
        Number.isInteger(expiresInSeconds) &&
        expiresInSeconds > 0;
      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        expiryMetadataValid,
      };
      if (!expiryMetadataValid) safeError("invalid_expires_in");

      this.lastAttemptEvidence = {
        ...this.lastAttemptEvidence,
        authentication: "pass",
      };
      return {
        accessToken: record.access_token,
        expiresInSeconds: expiresInSeconds as number,
      };
    } catch (error) {
      if (error instanceof QuranFoundationTokenTransportError) throw error;
      if (controller.signal.aborted) {
        this.lastAttemptEvidence = {
          ...this.lastAttemptEvidence,
          httpStatusClass: "timeout",
        };
        safeError("timeout");
      }
      safeError("invalid_http_response");
    } finally {
      clearTimeout(timeout);
    }
  }
}
