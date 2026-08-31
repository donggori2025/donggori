import { NextRequest, NextResponse } from "next/server";
import { config } from "@/lib/config";
import {
  createOAuthState,
  getOAuthCallbackUrl,
  oauthNextCookieName,
  oauthStateCookieName,
  safeNextPath,
  type OAuthProvider,
} from "@/lib/oauthState";

export async function GET(request: NextRequest) {
  if (request.nextUrl.hostname === "donggori.com") {
    const canonical = request.nextUrl.clone();
    canonical.hostname = "www.donggori.com";
    canonical.protocol = "https:";
    return NextResponse.redirect(canonical);
  }

  const provider = request.nextUrl.searchParams.get("provider") as OAuthProvider | null;
  const mode = request.nextUrl.searchParams.get("mode");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  if (provider !== "kakao" && provider !== "naver") {
    return NextResponse.json({ error: "지원하지 않는 소셜 로그인입니다." }, { status: 400 });
  }
  if (!config.oauth[provider].clientId) {
    return NextResponse.redirect(new URL(`/sign-in?error=oauth_config_missing&provider=${provider}`, request.url));
  }

  const state = createOAuthState();
  const redirectUri = getOAuthCallbackUrl(provider, request.nextUrl.origin);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: config.oauth[provider].clientId,
    redirect_uri: redirectUri,
    state,
  });

  let authorizeUrl: string;
  if (provider === "naver") {
    params.set("scope", "email,name,profile_image");
    if (mode === "signup") params.set("auth_type", "reprompt");
    authorizeUrl = `https://nid.naver.com/oauth2.0/authorize?${params}`;
  } else {
    params.set("scope", "account_email profile_nickname");
    params.set("prompt", mode === "signup" ? "login consent" : "consent");
    authorizeUrl = `https://kauth.kakao.com/oauth/authorize?${params}`;
  }

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(oauthStateCookieName(provider), state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/api/auth/${provider}/callback`,
    maxAge: 10 * 60,
  });
  response.cookies.set(oauthNextCookieName(provider), next, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: `/api/auth/${provider}/callback`,
    maxAge: 10 * 60,
  });
  return response;
}
