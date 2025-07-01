"use client";
import Link from "next/link";
import Image from "next/image";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  useUser,
} from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  // 햄버거 메뉴 오픈/닫힘 상태 관리
  const [menuOpen, setMenuOpen] = useState(false);
  // Clerk에서 현재 로그인한 사용자 정보 가져오기
  const { user } = useUser();
  const router = useRouter();

  // 네비게이션 메뉴 항목
  const navMenu = [
    { href: "/factories", label: "봉제공장 찾기" },
    { href: "/matching", label: "매칭" },
    { href: "/notices", label: "공지사항" },
  ];

  return (
    <header className="w-full bg-white border-b sticky top-0 z-[9999]">
      <div className="max-w-[1200px] mx-auto w-full flex items-center justify-between px-10 py-4">
        {/* 로고 */}
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
        {/* 데스크탑 메뉴: md 이상에서만 보임 */}
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex gap-6 text-base font-medium text-[#222222]">
            {navMenu.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#222222] hover:font-bold transition-colors">{item.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {/* 로그인 전: 로그인/회원가입 버튼 노출 */}
            <SignedOut>
              <button
                className="text-base font-medium text-white bg-[#222222] px-3 py-1 rounded hover:bg-[#444] transition-colors"
                onClick={() => router.push("/sign-in")}
              >
                로그인/회원가입
              </button>
            </SignedOut>
            {/* 로그인 후: 프로필 이미지(아바타) 클릭 시 마이페이지로 이동 */}
            <SignedIn>
              {user && (
                <Link href="/my-page" className="flex items-center" aria-label="마이페이지로 이동">
                  <Image
                    src={user.imageUrl}
                    alt="프로필 이미지"
                    width={40}
                    height={40}
                    className="w-9 h-9 rounded-full object-cover border border-gray-200 hover:shadow-md transition-shadow"
                  />
                </Link>
              )}
            </SignedIn>
          </div>
        </div>
        {/* 모바일: md 미만에서만 햄버거 버튼 보임 */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="메뉴 열기"
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => setMenuOpen(true)}
          >
            {/* 햄버거 아이콘 (SVG) */}
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* 드로어 메뉴: 햄버거 버튼 클릭 시 노출, md 이상에서는 숨김 */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-end md:hidden">
            {/* 오버레이 */}
            <div
              className="absolute inset-0 bg-black/10"
              onClick={() => setMenuOpen(false)}
              aria-label="오버레이 클릭 시 메뉴 닫기"
            />
            {/* 사이드 드로어 메뉴 */}
            <div className="relative w-64 bg-white h-full shadow-lg p-6 animate-slide-in-right flex flex-col gap-6">
              {/* 닫기 버튼 */}
              <button
                className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
                aria-label="메뉴 닫기"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {/* 메뉴 그룹 */}
              <div className="flex flex-col gap-4 mt-8">
                {navMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-2 px-2 rounded hover:bg-gray-100 text-gray-800"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              {/* 로그인/회원가입 또는 프로필 이미지 */}
              <div className="flex gap-2 mt-4">
                <SignedOut>
                  <button
                    className="flex-1 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                    onClick={() => router.push("/sign-in")}
                  >
                    로그인/회원가입
                  </button>
                </SignedOut>
                <SignedIn>
                  {user && (
                    <Link href="/my-page" className="flex-1 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-800 py-2">
                      <Image
                        src={user.imageUrl}
                        alt="프로필 이미지"
                        width={40}
                        height={40}
                        className="w-7 h-7 rounded-full object-cover border border-gray-200 mr-2"
                      />
                      마이페이지
                    </Link>
                  )}
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 사이드 드로어 애니메이션 (Tailwind에 없으므로 직접 정의 필요) */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.2s ease;
        }
      `}</style>
    </header>
  );
} 