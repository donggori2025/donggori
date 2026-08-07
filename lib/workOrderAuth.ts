import type { AuthResult } from "./authHelpers";
import type { WorkOrderRecord } from "./workOrderTypes";

export function canAccessWorkOrder(auth: AuthResult, row: WorkOrderRecord): boolean {
  if (!auth.authenticated) return false;
  if (auth.role === "admin") return true;

  const userEmail = String(row.user_email ?? "").toLowerCase();
  const factoryId = String(row.factory_id ?? "");

  if (auth.role === "user") {
    if (auth.userId && row.user_id && auth.userId === row.user_id) return true;
    if (auth.email && userEmail && auth.email.toLowerCase() === userEmail) return true;
    return false;
  }

  if (auth.role === "factory") {
    return Boolean(auth.userId && factoryId && auth.userId === factoryId);
  }

  return false;
}

export function canRunAdminPaymentAction(auth: AuthResult): boolean {
  return auth.authenticated && auth.role === "admin";
}
