import { NextResponse } from "next/server";
import { createAdminSessionValue } from "@/lib/adminSession";
import { getFactoryAuthWithRealName } from "@/lib/factoryAuthServer";
import { createFactorySessionValue } from "@/lib/factorySession";
import { createSessionRecord } from "@/lib/session";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";

const DEV_USER = {
  id: "dev-user-1",
  email: "dev@donggori.local",
  name: "개발 테스트 사용자",
  phoneNumber: "01000000000",
};

const DEV_FACTORY_USERNAME = "factory01";
const DEV_FACTORY_PASSWORD = "factory01!";

function devOnly() {
  return process.env.NODE_ENV === "development";
}

export async function POST(req: Request) {
  if (!devOnly()) {
    return NextResponse.json({ success: false, error: "개발 환경에서만 사용할 수 있습니다." }, { status: 403 });
  }

  try {
    const { role } = await req.json();
    if (!["user", "factory", "admin"].includes(role)) {
      return NextResponse.json({ success: false, error: "role은 user, factory, admin 중 하나여야 합니다." }, { status: 400 });
    }

    if (role === "user") {
      const res = NextResponse.json({
        success: true,
        role: "user",
        redirectTo: "/",
        user: DEV_USER,
      });

      res.cookies.set(
        "kakao_user",
        JSON.stringify({
          id: DEV_USER.id,
          email: DEV_USER.email,
          name: DEV_USER.name,
          phoneNumber: DEV_USER.phoneNumber,
        }),
        {
          sameSite: "lax",
          secure: false,
          path: "/",
          maxAge: SESSION_DURATIONS.USER,
        }
      );

      try {
        const { token } = await createSessionRecord({
          type: "local",
          userId: DEV_USER.id,
          userEmail: DEV_USER.email,
          isInitialized: true,
          ttlSec: SESSION_DURATIONS.USER,
        });
        res.cookies.set("access_token", token, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
          path: "/",
          maxAge: SESSION_DURATIONS.USER,
        });
      } catch {
        // 로컬에서 Supabase 세션 생성이 실패해도 쿠키 기반 개발 로그인은 유지합니다.
      }

      res.cookies.set("userType", "user", {
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.USER,
      });
      res.cookies.set("isLoggedIn", "true", {
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.USER,
      });
      return res;
    }

    if (role === "factory") {
      const factoryAuth = await getFactoryAuthWithRealName(DEV_FACTORY_USERNAME, DEV_FACTORY_PASSWORD);
      if (!factoryAuth) {
        return NextResponse.json({ success: false, error: "개발용 공장 계정을 찾을 수 없습니다." }, { status: 500 });
      }

      const sessionValue = createFactorySessionValue({
        factoryId: factoryAuth.factoryId,
        factoryName: factoryAuth.factoryName,
        username: factoryAuth.username,
      });

      const res = NextResponse.json({
        success: true,
        role: "factory",
        redirectTo: "/factory-my-page/work-orders",
        factory: {
          factoryId: factoryAuth.factoryId,
          factoryName: factoryAuth.factoryName,
          username: factoryAuth.username,
        },
      });

      res.cookies.set("factory_session", sessionValue, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.FACTORY,
      });
      res.cookies.set("factory_user", JSON.stringify({
        id: factoryAuth.username,
        factoryId: factoryAuth.factoryId,
        realName: factoryAuth.factoryName,
        isFactoryUser: true,
      }), {
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.FACTORY,
      });
      res.cookies.set("userType", "factory", {
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.FACTORY,
      });
      res.cookies.set("isLoggedIn", "true", {
        sameSite: "lax",
        secure: false,
        path: "/",
        maxAge: SESSION_DURATIONS.FACTORY,
      });
      return res;
    }

    const res = NextResponse.json({
      success: true,
      role: "admin",
      redirectTo: "/admin",
    });

    res.cookies.set("admin_session", createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: SESSION_DURATIONS.ADMIN,
      path: "/",
    });
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "개발 로그인에 실패했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
