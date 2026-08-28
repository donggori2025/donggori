import crypto from "crypto";
import type { NextResponse } from "next/server";

export type OAuthProvider = "kakao" | "naver";

export function oauthStateCookieName(provider: OAuthProvider): string {
  return `oauth_state_${provider}`;
}

export function oauthNextCookieName(provider: OAuthProvider): string {
  return `oauth_next_${provider}`;
}

/** Only accept an in-app absolute path. This deliberately rejects `//host`. */
export function safeNextPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !/^\/(?!\/)[^\\\r\n]*$/.test(value)) return fallback;
  return value;
}

export function createOAuthState(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function verifyOAuthState(actual: string | null, expected?: string): boolean {
  if (!actual || !expected || actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function getOAuthCallbackUrl(provider: OAuthProvider, requestOrigin: string): string {
  const parsed = new URL(requestOrigin);
  const origin = parsed.hostname.endsWith("donggori.com")
    ? "https://www.donggori.com"
    : parsed.origin;
  return `${origin}/api/auth/${provider}/callback`;
}

export function clearOAuthStateCookie(response: NextResponse, provider: OAuthProvider): void {
  response.cookies.set(oauthStateCookieName(provider), "", {
    httpOnly: true,
    path: `/api/auth/${provider}/callback`,
    maxAge: 0,
  });
}

export function clearOAuthNextCookie(response: NextResponse, provider: OAuthProvider): void {
  response.cookies.set(oauthNextCookieName(provider), "", {
    httpOnly: true,
    path: `/api/auth/${provider}/callback`,
    maxAge: 0,
  });
}
