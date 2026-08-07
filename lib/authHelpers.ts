import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./adminSession";
import { verifyFactorySessionValue } from "./factorySession";
import { verifySessionToken } from "./session";
import { parseCookieJson } from "./utils";

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  email?: string;
  role?: "user" | "admin" | "factory";
}

export async function getRequestAuth(req?: NextRequest): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();

    const adminSession = cookieStore.get("admin_session")?.value;
    if (adminSession && verifyAdminSession(adminSession)) {
      return { authenticated: true, role: "admin" };
    }

    // 동고리 세션 토큰은 JWT가 아니라 sessions 테이블에 저장되는 임의 토큰(UUID 등)입니다.
    // 쿠키에서 토큰을 읽어 DB에서 유효성 검증을 수행합니다.
    const accessToken = cookieStore.get("access_token")?.value;
    if (accessToken) {
      const { valid, data } = await verifySessionToken(accessToken);
      if (valid) {
        return {
          authenticated: true,
          userId: String((data as any)?.user_id ?? ""),
          email: (data as any)?.user_email ?? undefined,
          role: "user",
        };
      }
    }

    for (const name of ["kakao_user", "naver_user", "google_user"]) {
      const socialCookie = cookieStore.get(name)?.value;
      if (socialCookie) {
        const data = parseCookieJson<{ id?: string; email?: string }>(socialCookie);
        if (data?.email || data?.id) {
          return { authenticated: true, userId: data.id, email: data.email, role: "user" };
        }
      }
    }

    const snsToken = cookieStore.get("sns_access_token")?.value;
    if (snsToken) {
      const { valid, data } = await verifySessionToken(snsToken);
      if (valid) {
        return {
          authenticated: true,
          userId: String((data as any)?.user_id ?? (data as any)?.external_id ?? ""),
          email: (data as any)?.user_email ?? undefined,
          role: "user",
        };
      }
    }

    const factorySession = cookieStore.get("factory_session")?.value;
    if (factorySession) {
      const payload = verifyFactorySessionValue(factorySession);
      if (payload?.factoryId) {
        return { authenticated: true, userId: payload.factoryId, role: "factory" };
      }
    }

    const factoryUser = cookieStore.get("factory_user")?.value;
    if (factoryUser) {
      const data = parseCookieJson<{ factoryId?: string }>(factoryUser);
      if (data?.factoryId) {
        return { authenticated: true, userId: String(data.factoryId), role: "factory" };
      }
    }

    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

export function unauthorized(message = "인증이 필요합니다.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}
