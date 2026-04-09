import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "./adminSession";

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

    const accessToken = cookieStore.get("accessToken")?.value;
    if (accessToken) {
      try {
        const payload = JSON.parse(
          Buffer.from(accessToken.split(".")[1], "base64").toString()
        );
        if (payload.email) {
          return { authenticated: true, userId: payload.sub || payload.id, email: payload.email, role: "user" };
        }
      } catch {}
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

    const snsToken = cookieStore.get("snsAccessToken")?.value;
    if (snsToken) {
      try {
        const payload = JSON.parse(
          Buffer.from(snsToken.split(".")[1], "base64").toString()
        );
        if (payload.email && payload.isInitialized) {
          return { authenticated: true, userId: payload.sub, email: payload.email, role: "user" };
        }
      } catch {}
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
