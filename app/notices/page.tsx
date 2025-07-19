"use client";
import React, { useState } from "react";
import { notices } from "@/lib/notices";
import Link from "next/link";

const TABS = [
  { key: "전체", label: "전체" },
  { key: "공지", label: "공지" },
  { key: "일반", label: "일반" },
  { key: "채용공고", label: "채용공고" },
];

export default function NoticesPage() {
  const [tab, setTab] = useState("전체");
  // 최신순, 번호 역순
  const filtered = tab === "전체" ? notices : notices.filter(n => n.type === tab);
  const sorted = [...filtered].sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <section className="w-full bg-white py-12 min-h-[600px]">
      <div className="max-w-[900px] mx-auto px-4">
        <h2 className="text-[40px] font-extrabold text-gray-900 mb-2">공지사항</h2>
        <div className="text-gray-500 mb-6">동고리의 다양한 소식들을 확인해보세요.</div>
        {/* 탭 */}
        <div className="flex gap-2 border-b border-gray-200 mb-2">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 font-bold text-base border-b-2 transition-all ${tab===t.key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              onClick={()=>setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* 리스트 헤더 */}
        <div className="grid grid-cols-12 py-2 text-gray-400 text-sm font-bold border-b border-gray-100">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-2 text-center">카테고리</div>
          <div className="col-span-7">제목/내용</div>
          <div className="col-span-2 text-center">등록일</div>
        </div>
        {/* 리스트 */}
        <ul>
          {sorted.length === 0 ? (
            <li className="py-12 text-center text-gray-400">등록된 공지사항이 없습니다.</li>
          ) : (
            sorted.map((notice) => (
              <li key={notice.id} className="grid grid-cols-12 items-center py-3 border-b border-gray-100 hover:bg-gray-50 transition group">
                <div className="col-span-1 text-center text-gray-400">{notice.id}</div>
                <div className="col-span-2 text-center">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${notice.type === '공지' ? 'bg-red-100 text-red-700' : notice.type === '채용공고' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{notice.type}</span>
                </div>
                <div className="col-span-7 truncate">
                  <Link href={`/notices/${notice.id}`} className="font-medium text-gray-900 group-hover:underline">
                    {notice.title}
                  </Link>
                  <span className="ml-2 text-gray-400 text-sm truncate">{notice.content.slice(0, 40)}{notice.content.length > 40 ? '...' : ''}</span>
                </div>
                <div className="col-span-2 text-center text-gray-400">{notice.createdAt}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
} 