import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./adminSession";
import { verifySessionToken } from "./session";

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

    // access_token 은 HMAC 서명 토큰(v1.*)이며, 구형 DB 세션 토큰도 호환 검증한다.
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
        try {
          const data = JSON.parse(socialCookie);
          if (data.email || data.id) {
            return { authenticated: true, userId: data.id, email: data.email, role: "user" };
          }
        } catch {}
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
      try {
        const data = JSON.parse(factorySession);
        if (data.factoryId) {
          return { authenticated: true, userId: data.factoryId, role: "factory" };
        }
      } catch {}
    }

    return { authenticated: false };
  } catch {
    return { authenticated: false };
  }
}

export function unauthorized(message = "인증이 필요합니다.") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}
