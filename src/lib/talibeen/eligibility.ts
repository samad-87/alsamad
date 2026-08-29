/** Pure, fail-closed Talibeen Foundation eligibility rules. */

export const TALIBEEN_MINIMUM_AGE = 18 as const;

export type AdultEligibilityResult =
  | { readonly eligible: true }
  | {
      readonly eligible: false;
      readonly reason: "invalid-age" | "under-18";
    };

export type CandidateDirectionResult =
  | { readonly eligible: true }
  | {
      readonly eligible: false;
      readonly reason: "invalid-direction" | "same-sex-direction";
    };

export function evaluateAdultEligibility(age: unknown): AdultEligibilityResult {
  if (
    typeof age !== "number" ||
    !Number.isFinite(age) ||
    !Number.isInteger(age) ||
    age < 0
  ) {
    return { eligible: false, reason: "invalid-age" };
  }

  return age >= TALIBEEN_MINIMUM_AGE
    ? { eligible: true }
    : { eligible: false, reason: "under-18" };
}

export function evaluateCandidateDirection(
  source: unknown,
  target: unknown,
): CandidateDirectionResult {
  const sourceIsValid = source === "man" || source === "woman";
  const targetIsValid = target === "man" || target === "woman";

  if (!sourceIsValid || !targetIsValid) {
    return { eligible: false, reason: "invalid-direction" };
  }

  return source !== target
    ? { eligible: true }
    : { eligible: false, reason: "same-sex-direction" };
}
