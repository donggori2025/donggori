import { NextResponse, NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const pathname = req.nextUrl.pathname;

  // The local Naver Maps application accepts http://localhost:3000 as its web origin.
  if (
    process.env.NODE_ENV === "development" && ["/factories", "/factories/map"].includes(pathname) &&
    ["127.0.0.1:3000", "127.0.0.1:3217", "localhost:3217"].includes(host)
  ) {
    const url = new URL("http://localhost:3000/factories");
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url, 307);
  }

  // 운영 보안: 프로덕션에서 디버그 페이지/API 차단
  if (process.env.NODE_ENV === "production") {
    if (pathname.startsWith("/debug-") || pathname.startsWith("/api/debug")) {
      return NextResponse.rewrite(new URL("/_not-found", req.url));
    }
  }

  if (process.env.NODE_ENV === "production" && (host === "donggori.com" || host === "donggori.kr" || host === "www.donggori.kr")) {
    const url = new URL(req.url);
    url.hostname = "www.donggori.com";
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
