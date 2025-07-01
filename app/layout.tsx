import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Clerk 기본 메뉴 한글화(특히 UserButton의 'Manage account' → '프로필')
const koLocalization = {
  userButton: {
    action__manageAccount: "프로필",
    action__signOut: "로그아웃",
  },
};

export const metadata: Metadata = {
  title: "의류 디자이너-봉제공장 매칭 플랫폼",
  description: "의류 디자이너와 봉제공장을 연결하는 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
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
