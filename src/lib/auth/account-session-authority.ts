import type { AccountStatus } from "./account-status";

export function hasAccountSessionAuthority(status: AccountStatus): boolean {
  return status === "active";
}
