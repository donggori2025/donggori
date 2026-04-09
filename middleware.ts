import { NextResponse, NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const pathname = req.nextUrl.pathname;

  if (process.env.NODE_ENV === "production" && host === "donggori.com") {
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
