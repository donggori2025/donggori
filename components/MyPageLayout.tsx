'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 마이페이지 메뉴 항목 배열(경로 명확화)
const menu = [
  { label: "문의 내역", href: "/my-page/inquiries" },
  { label: "프로필 수정", href: "/my-page/profile" },
];

// 마이페이지 2단 레이아웃 컴포넌트
export default function MyPageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex w-full max-w-[1200px] mx-auto min-h-[80vh] pt-10">
      {/* 좌측 사이드바 */}
      <aside className="w-56 pr-8 border-r">
        <div className="font-bold text-xl mb-8">마이페이지</div>
        <nav className="flex flex-col gap-2">
          {menu.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded text-base font-medium transition-colors ${pathname === item.href ? "bg-toss-blue text-black font-bold" : "text-gray-700 hover:bg-gray-100"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* 우측 메인 컨텐츠 */}
      <main className="flex-1 pl-8">{children}</main>
    </div>
  );
} 