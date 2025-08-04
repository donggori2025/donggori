import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 보호된 라우트 정의
const protectedRoutes = createRouteMatcher([
  '/my-page(.*)',
  '/factory-my-page(.*)',
  '/payment(.*)',
]);

// 공개 라우트 정의
const publicRoutes = createRouteMatcher([
  '/',
  '/factories(.*)',
  '/matching',
  '/notices(.*)',
  '/sign-in',
  '/sign-up',
  '/terms(.*)',
  '/api(.*)',
]);

export default clerkMiddleware((auth, req) => {
  // API 라우트는 Clerk 미들웨어를 건너뜀
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return;
  }

  // 공개 라우트는 인증 없이 접근 가능
  if (publicRoutes(req)) {
    return;
  }

  // 보호된 라우트는 인증 필요
  if (protectedRoutes(req)) {
    return auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};