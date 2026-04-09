import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || (() => {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    console.error("[SECURITY] ADMIN_SESSION_SECRET 환경변수가 설정되지 않았습니다. 서버 재시작 시 세션이 무효화됩니다.");
  }
  return crypto.randomBytes(32).toString("hex");
})();

export function createAdminSessionValue(): string {
  const ts = Date.now().toString();
  const sig = crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(ts).digest("hex");
  return `${ts}.${sig}`;
}

export function verifyAdminSession(value: string): boolean {
  try {
    const dot = value.indexOf(".");
    if (dot < 1) return false;
    const ts = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    const num = parseInt(ts, 10);
    if (isNaN(num) || Date.now() - num > 24 * 60 * 60 * 1000) return false;
    const expected = crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(ts).digest("hex");
    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value || !verifyAdminSession(session.value)) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}
