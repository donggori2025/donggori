import { NextRequest, NextResponse } from "next/server";
import { getFactoryAuthWithRealName } from "@/lib/factoryAuthServer";
import { createFactorySessionValue } from "@/lib/factorySession";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: "아이디와 비밀번호가 필요합니다." }, { status: 400 });
    }

    const factoryAuth = await getFactoryAuthWithRealName(String(username), String(password));
    if (!factoryAuth) {
      return NextResponse.json(
        { success: false, error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    const sessionValue = createFactorySessionValue({
      factoryId: factoryAuth.factoryId,
      factoryName: factoryAuth.factoryName,
      username: factoryAuth.username,
    });

    const res = NextResponse.json({
      success: true,
      factoryId: factoryAuth.factoryId,
      factoryName: factoryAuth.factoryName,
      username: factoryAuth.username,
    });

    res.cookies.set("factory_session", sessionValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_DURATIONS.FACTORY,
    });

    return res;
  } catch (e: unknown) {
    const err = e as Error;
    return NextResponse.json({ success: false, error: err?.message || "server error" }, { status: 500 });
  }
}
