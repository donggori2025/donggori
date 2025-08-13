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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
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
