import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  title: "동고리 - 봉제공장 찾기",
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-toss-gray min-h-screen flex flex-col`}>
        <AuthProvider>
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
