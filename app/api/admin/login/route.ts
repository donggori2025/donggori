import { NextResponse } from "next/server";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";
import { createAdminSessionValue } from "@/lib/adminSession";
import {
  safeTimingEqual,
  getClientIp,
  checkLoginRateLimit,
  recordLoginFailure,
  clearLoginAttempts,
} from "@/lib/adminHelpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkLoginRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: `로그인 시도 횟수를 초과했습니다. ${rateCheck.retryAfterSec}초 후 다시 시도해주세요.` },
        { status: 429 }
      );
    }

    const ADMIN_ID = process.env.ADMIN_ID;
    const ADMIN_PW = process.env.ADMIN_PW;

    if (!ADMIN_ID || !ADMIN_PW) {
      console.error("[SECURITY] ADMIN_ID 또는 ADMIN_PW 환경변수가 설정되지 않았습니다.");
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { id, password } = await req.json();
    const idStr = typeof id === "string" ? id : "";
    const pwStr = typeof password === "string" ? password : "";

    const idMatch = safeTimingEqual(idStr, ADMIN_ID);
    const pwMatch = safeTimingEqual(pwStr, ADMIN_PW);

    if (!idMatch || !pwMatch) {
      recordLoginFailure(ip);
      return NextResponse.json({ success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    clearLoginAttempts(ip);

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_DURATIONS.ADMIN,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
}
