import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, NextRequest, NextFetchEvent } from "next/server";

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const host = (req.headers.get("host") || "").toLowerCase();
  const pathname = req.nextUrl.pathname;

  if (process.env.NODE_ENV === "production" && host === "donggori.com") {
    const url = new URL(req.url);
    url.hostname = "www.donggori.com";
    return NextResponse.redirect(url, 308);
  }

  const bypassPaths = [
    "/sign-in",
    "/sign-up",
    "/sso-callback",
    "/v1/oauth_callback",
    "/admin/login",
    "/api/admin",
    "/api/auth",
    "/factory-my-page",
  ];
  if (bypassPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isDevClerkKey = /(^pk_test_|^test_)/.test(publishableKey);
  const isLocalhost =
    host.includes("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("0.0.0.0") ||
    host.endsWith(".local");

  if (isDevClerkKey && !isLocalhost) {
    return NextResponse.next();
  }

  try {
    return clerkMiddleware()(req, ev);
  } catch (err) {
    console.error("[middleware] Clerk 미들웨어 오류:", err);
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
