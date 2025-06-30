"use client";
import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="w-full bg-white border-b sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-4 py-4">
        <Link href="/" className="select-none" aria-label="동고리 홈">
          <Image
            src="/logo_0624.svg"
            alt="동고리 로고"
            width={113}
            height={47}
            priority
            style={{ width: 113, height: 47 }}
          />
        </Link>
        <div className="flex items-center gap-8">
          <nav className="hidden md:flex gap-6 text-base font-medium text-[#222222]">
            <Link href="/factories" className="hover:text-[#222222] hover:font-bold transition-colors">봉제공장 찾기</Link>
            <Link href="/matching" className="hover:text-[#222222] hover:font-bold transition-colors">매칭</Link>
            <Link href="/notices" className="hover:text-[#222222] hover:font-bold transition-colors">공지사항</Link>
          </nav>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton>
                <button className="text-base font-medium text-white bg-[#222222] px-3 py-1 rounded hover:bg-[#444] transition-colors">로그인/회원가입</button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/my-page" className="flex items-center">
                <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
} 