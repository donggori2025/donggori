import type { AuthResult } from "./authHelpers";

export function canAccessMatchRequest(
  auth: AuthResult,
  row: { user_id?: unknown; user_email?: unknown; factory_id?: unknown }
): boolean {
  if (!auth.authenticated) return false;
  if (auth.role === "admin") return true;

  const userId = String(row.user_id ?? "");
  const userEmail = String(row.user_email ?? "").toLowerCase();

  if (auth.role === "user") {
    if (auth.userId && userId && auth.userId === userId) return true;
    if (auth.email && userEmail && auth.email.toLowerCase() === userEmail) return true;
    return false;
  }

  return false;
}
