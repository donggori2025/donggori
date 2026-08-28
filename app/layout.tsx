import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalPopups from "@/components/GlobalPopups";
import { AuthProvider } from "@/contexts/AuthContext";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.donggori.com");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "동고리 | 봉제공장 찾기",
    template: "%s | 동고리",
  },
  description: "필요한 조건에 맞는 봉제공장을 찾고 문의할 수 있는 동고리입니다.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "동고리",
    title: "동고리 | 봉제공장 찾기",
    description: "필요한 조건에 맞는 봉제공장을 찾고 문의할 수 있는 동고리입니다.",
  },
  twitter: { card: "summary" },
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
      <body className="antialiased bg-toss-gray min-h-screen flex flex-col">
        <AuthProvider>
          <GlobalPopups />
          <Header />
          <main className="w-full flex-1">
            {children}
          </main>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
