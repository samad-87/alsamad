import {
  authorizationCodeGrant as openidAuthorizationCodeGrant,
  type Configuration,
} from "openid-client";

export type VerifyGoogleOidcOptions = {
  configuration: Configuration;
  callbackUrl: URL;
  pkceCodeVerifier: string;
  expectedState: string;
  expectedNonce: string;
  authorizationCodeGrant?: typeof openidAuthorizationCodeGrant;
};

export async function verifyGoogleOidc({
  configuration,
  callbackUrl,
  pkceCodeVerifier,
  expectedState,
  expectedNonce,
  authorizationCodeGrant = openidAuthorizationCodeGrant,
}: VerifyGoogleOidcOptions): Promise<null | {
  authenticatorNamespace: "google";
  subject: string;
}> {
  try {
    const result = await authorizationCodeGrant(configuration, callbackUrl, {
      pkceCodeVerifier,
      expectedState,
      expectedNonce,
      idTokenExpected: true,
    });

    const claims = result.claims();
    if (!claims) return null;
    const sub = claims.sub;

    if (sub === undefined || sub === null || sub === "") {
      return null;
    }

    return {
      authenticatorNamespace: "google",
      subject: sub,
    };
  } catch {
    // Verification errors do not produce a verified identity
    return null;
  }
}
