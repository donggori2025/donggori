"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const TABS = [
  { key: "전체", label: "전체" },
  { key: "공지", label: "공지" },
  { key: "일반", label: "일반" },
  { key: "채용공고", label: "채용공고" },
];

export default function NoticesPage() {
  const [tab, setTab] = useState("전체");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/notices');
        const json = await res.json();
        if (res.ok && json.success) setItems(json.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === '전체') return items;
    return items.filter((n:any) => n.category === tab);
  }, [items, tab]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dateA = new Date(a.start_at || a.created_at).getTime();
    const dateB = new Date(b.start_at || b.created_at).getTime();
    return dateB - dateA;
  }), [filtered]);

  return (
    <section className="w-full bg-white py-16 min-h-[600px]">
      <div className="max-w-[1400px] mx-auto px-6">
        <h2 className="text-[40px] font-extrabold text-gray-900 mb-2">공지사항</h2>
        <div className="text-gray-500 mb-8">동고리의 다양한 소식들을 확인해보세요.</div>
        {/* 탭 */}
        <div className="flex gap-2 border-b border-gray-200 mb-4">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-6 py-3 font-bold text-base border-b-2 transition-all ${tab===t.key ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}
              onClick={()=>setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* 리스트 헤더 */}
        <div className="grid grid-cols-12 py-4 text-gray-400 text-sm font-bold border-b border-gray-200">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-2 text-center">카테고리</div>
          <div className="col-span-7">제목/내용</div>
          <div className="col-span-2 text-center">등록일</div>
        </div>
        {/* 리스트 */}
        <ul>
          {loading ? (
            <li className="py-16 text-center text-gray-400 text-lg">로딩 중...</li>
          ) : sorted.length === 0 ? (
            <li className="py-16 text-center text-gray-400 text-lg">등록된 공지사항이 없습니다.</li>
          ) : (
            sorted.map((notice: any, index: number) => (
              <li key={notice.id} className="grid grid-cols-12 items-center py-4 border-b border-gray-100 hover:bg-gray-50 transition group">
                <div className="col-span-1 text-center text-gray-400">{index + 1}</div>
                <div className="col-span-2 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${notice.category === '공지' ? 'bg-red-100 text-red-700' : notice.category === '채용공고' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{notice.category}</span>
                </div>
                <div className="col-span-7">
                  <Link href={`/notices/${notice.id}`} className="font-medium text-gray-900 group-hover:underline block mb-1">
                    {notice.title}
                  </Link>
                  <span className="text-gray-400 text-sm truncate block">{(notice.content || '').slice(0, 50)}{(notice.content || '').length > 50 ? '...' : ''}</span>
                </div>
                <div className="col-span-2 text-center text-gray-400">{(notice.start_at || notice.created_at || '').slice(0,10)}</div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
} 