import { NextRequest } from "next/server";

export function getInternalAuthHeaders(): Record<string, string> {
  const secret = process.env.INTERNAL_API_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    "x-internal-auth": secret,
  };
}

export function verifyInternalAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }
  return req.headers.get("x-internal-auth") === secret;
}
