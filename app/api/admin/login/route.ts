import { NextResponse } from "next/server";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";
import { createAdminSessionValue } from "@/lib/adminSession";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const ADMIN_ID = process.env.ADMIN_ID;
    const ADMIN_PW = process.env.ADMIN_PW;

    if (!ADMIN_ID || !ADMIN_PW) {
      console.error("[SECURITY] ADMIN_ID 또는 ADMIN_PW 환경변수가 설정되지 않았습니다.");
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { id, password } = await req.json();

    const idMatch = id && crypto.timingSafeEqual(
      Buffer.from(id.toString()),
      Buffer.from(ADMIN_ID)
    );
    const pwMatch = password && crypto.timingSafeEqual(
      Buffer.from(password.toString()),
      Buffer.from(ADMIN_PW)
    );

    if (!idMatch || !pwMatch) {
      return NextResponse.json({ success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_DURATIONS.ADMIN,
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
}
