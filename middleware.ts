// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

// 임시로 Clerk 미들웨어 비활성화
export default function middleware() {
  // Clerk 미들웨어 비활성화
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};