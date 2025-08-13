import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// 개발용 Clerk 키를 사용하면서 로컬호스트가 아닌 환경(예: 다른 PC에서 IP로 접속)에서는
// Clerk 미들웨어를 건너뛰어 팩토리/일반 라우트가 정상 동작하도록 우회합니다.
export default function middleware(req: Request) {
  try {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
    const host = (req.headers.get('host') || '').toLowerCase();

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
    // @ts-expect-error: clerkMiddleware는 NextRequest를 기대하지만 서버 런타임에서 Request로도 동작
    return clerkMiddleware()(req as any);
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