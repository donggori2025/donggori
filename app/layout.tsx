import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "동고리 - 봉제공장 찾기",
  description: "봉제공장을 쉽게 찾고 연결할 수 있는 플랫폼",
  verification: {
    google: "LCeILHoTlwmHGlbfN4HuuXz3FcZtrmw_iQppOlEOO4s",
  },
};

// Clerk 설정 검증
function validateClerkConfig() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.');
    return false;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ Clerk Publishable Key 형식이 올바르지 않습니다.');
    return false;
  }
  
  console.log('✅ Clerk 설정이 올바릅니다.');
  return true;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isClerkValid = validateClerkConfig();
  
  if (!isClerkValid) {
    // Clerk 설정이 유효하지 않으면 기본 레이아웃만 렌더링
    return (
      <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-toss-gray min-h-screen flex flex-col`}>
          <Header />
          <main className="w-full flex-1">
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
              <div className="mb-8 flex flex-col items-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">DONG<span className="text-black">GORI</span></h1>
                <div className="text-lg font-semibold text-gray-700 mb-1">봉제공장이 필요한 순간, 동고리</div>
                <div className="text-red-500 text-sm text-center mt-4">
                  인증 서비스 설정 오류가 발생했습니다.<br />
                  관리자에게 문의해주세요.
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      // TODO: 커스텀 도메인 DNS 문제 해결 후 다시 활성화
      // frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
    >
      <html lang="ko">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-toss-gray min-h-screen flex flex-col`}>
          <Header />
          <main className="w-full flex-1">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
