import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteFrame from "@/components/SiteFrame";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "동고리 - 의류 봉제·생산 연결 플랫폼",
  description: "봉제공장을 쉽게 찾고 연결할 수 있는 플랫폼",
  verification: {
    google: "LCeILHoTlwmHGlbfN4HuuXz3FcZtrmw_iQppOlEOO4s",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white antialiased`}>
        <AuthProvider>
          <SiteFrame>{children}</SiteFrame>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
