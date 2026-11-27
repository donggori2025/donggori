import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 필요합니다.");
  }
  return crypto.randomBytes(32).toString("hex");
})();

type SessionScope = "admin" | "coordinator";

function signature(ts: string, scope: SessionScope) {
  return crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(scope === "admin" ? ts : `coordinator:${ts}`).digest("hex");
}

export function createAdminSessionValue(scope: SessionScope = "admin"): string {
  const ts = Date.now().toString();
  const sig = signature(ts, scope);
  return `${ts}.${sig}`;
}

export function verifyAdminSession(value: string, scope: SessionScope = "admin"): boolean {
  try {
    const dot = value.indexOf(".");
    if (dot < 1) return false;
    const ts = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    const num = parseInt(ts, 10);
    if (isNaN(num) || Date.now() - num > 24 * 60 * 60 * 1000) return false;
    const expected = signature(ts, scope);
    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function studioStaffRole(): Promise<SessionScope | null> {
  const jar = await cookies();
  if (verifyAdminSession(jar.get("admin_session")?.value ?? "")) return "admin";
  if (verifyAdminSession(jar.get("coordinator_session")?.value ?? "", "coordinator")) return "coordinator";
  return null;
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value || !verifyAdminSession(session.value)) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}
