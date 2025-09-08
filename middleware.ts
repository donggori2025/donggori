import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, NextRequest, NextFetchEvent } from 'next/server';

// 개발용 Clerk 키를 사용하면서 로컬호스트가 아닌 환경(예: 다른 PC에서 IP로 접속)에서는
// Clerk 미들웨어를 건너뛰어 팩토리/일반 라우트가 정상 동작하도록 우회합니다.
export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    const host = (req.headers.get('host') || '').toLowerCase();
    const pathname = req.nextUrl.pathname;

    // 프로덕션에서 non-www를 www로 정규화 (OAuth redirect_uri 안정화)
    if (process.env.NODE_ENV === 'production' && host === 'donggori.com') {
      const url = new URL(req.url);
      url.hostname = 'www.donggori.com';
      return NextResponse.redirect(url, 308);
    }

    // 팩토리/관리자 로그인 및 공개 페이지에서는 Clerk 미들웨어 완전 우회
    const bypassPaths = [
      '/sign-in',
      '/sign-up',
      '/sso-callback',
      '/v1/oauth_callback',
      '/admin/login',
      '/api/admin',
      // 소셜/인증 API는 Clerk 미들웨어 영향 없이 동작하도록 우회
      '/api/auth',
      // 업장(봉제공장) 전용 페이지는 Clerk 미들웨어에 의존하지 않음
      '/factory-my-page',
      '/factory-my-page/requests',
    ];
    if (bypassPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const isDevClerkKey = /(^pk_test_|^test_)/.test(publishableKey);
    const isLocalhost =
      host.includes('localhost') ||
      host.startsWith('127.0.0.1') ||
      host.startsWith('0.0.0.0') ||
      host.endsWith('.local');

    if (isDevClerkKey && !isLocalhost) {
      // Clerk dev 키 제한 환경에서는 Clerk 미들웨어를 우회
      return NextResponse.next();
    }

    // 기본 Clerk 미들웨어 동작
    return clerkMiddleware()(req, ev);
  } catch {
    // 예외 시에도 앱 동작을 막지 않도록 통과
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};