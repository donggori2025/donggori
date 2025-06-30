"use client";
import { notices, Notice } from "@/lib/notices";
import { useState } from "react";
import Link from "next/link";

// 공지사항 탭 목록
const TABS = ["전체", "공지", "일반", "채용공고"] as const;
type TabType = typeof TABS[number];

export default function NoticesPage() {
  // 현재 선택된 탭 상태 관리
  const [tab, setTab] = useState<TabType>("전체");

  // 탭에 따라 필터링된 공지사항 리스트 반환
  const filtered = tab === "전체" ? notices : notices.filter(n => n.type === tab);

  // 번호는 최신순(내림차순)으로 부여
  const sorted = [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="max-w-[1200px] mx-auto py-16 px-4">
      {/* 상단 제목/설명 */}
      <h1 className="text-[40px] font-extrabold text-gray-900 mb-2">공지사항</h1>
      <p className="text-lg text-gray-500 mb-8">동고리의 다양한 소식들을 확인해보세요.</p>

      {/* 탭 메뉴 */}
      <div className="flex gap-8 border-b border-gray-200 mb-6 text-lg font-semibold">
        {TABS.map((t) => (
          <button
            key={t}
            className={`pb-2 px-2 -mb-px border-b-2 transition font-bold ${tab === t ? "border-black text-black" : "border-transparent text-gray-400"}`}
            onClick={() => setTab(t)}
            type="button"
          >
            {t}
          </button>
        ))}
      </div>

      {/* 공지사항 표 형태 리스트 */}
      <div className="w-full">
        <div className="grid grid-cols-[60px_1fr_120px] text-gray-400 text-base font-semibold border-b border-gray-200 pb-2 mb-2">
          <div className="text-center">번호</div>
          <div>제목</div>
          <div className="text-right">날짜</div>
        </div>
        <div className="divide-y divide-gray-100">
          {sorted.length === 0 ? (
            <div className="text-center text-gray-400 py-12">공지사항이 없습니다.</div>
          ) : (
            sorted.map((notice, idx) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="grid grid-cols-[60px_1fr_120px] items-center py-3 hover:bg-gray-50 transition rounded cursor-pointer group"
              >
                <div className="text-center text-gray-500 group-hover:text-black font-medium">{sorted.length - idx}</div>
                <div className="truncate text-black font-medium group-hover:font-bold group-hover:text-black">{notice.title}</div>
                <div className="text-right text-gray-400 group-hover:text-black">{notice.createdAt}</div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/*
        주니어 개발자 설명:
        - 탭은 useState로 관리하며, 클릭 시 setTab으로 변경합니다.
        - 공지사항 데이터는 type 필드로 필터링합니다.
        - 표 형태는 grid로 구현, 번호는 최신순으로 부여합니다.
        - 각 행은 hover 시 배경/텍스트 강조, Link로 상세페이지 이동.
        - Tailwind CSS로 빠르게 스타일링할 수 있습니다.
      */}
    </div>
  );
} 