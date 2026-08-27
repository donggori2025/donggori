import { NextRequest, NextResponse } from "next/server";
import { revokeSessionToken } from "@/lib/session";

const COOKIE_NAMES = [
  "access_token",
  "sns_access_token",
  "factory_session",
  "admin_session",
  "signup_proof",
  "reset_proof",
  "kakao_user",
  "naver_user",
  "factory_user",
  "isLoggedIn",
  "userType",
];

export async function POST(request: NextRequest) {
  const tokens = [
    request.cookies.get("access_token")?.value,
    request.cookies.get("sns_access_token")?.value,
  ].filter((token): token is string => !!token);

  try {
    await Promise.all(tokens.map(revokeSessionToken));
  } catch {
    return NextResponse.json({ success: false, error: "로그아웃에 실패했습니다." }, { status: 500 });
  }

  const response = NextResponse.json({ success: true });
  for (const name of COOKIE_NAMES) {
    response.cookies.set(name, "", { httpOnly: true, path: "/", maxAge: 0 });
  }
  return response;
}
