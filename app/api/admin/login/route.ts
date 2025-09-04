import { NextResponse } from "next/server";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";

const ADMIN_ID = "donggori2025";
const ADMIN_PW = "donggori2025";

export async function POST(req: Request) {
  try {
    const { id, password } = await req.json();

    if (id !== ADMIN_ID || password !== ADMIN_PW) {
      return NextResponse.json({ success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_session", "ok", {
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


