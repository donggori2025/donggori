"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader, PageShell } from "@/components/ui/app-ui";

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
        const res = await fetch("/api/notices");
        const json = await res.json();
        if (res.ok && json.success) setItems(json.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (tab === "전체") return items;
    return items.filter((n: any) => n.category === tab);
  }, [items, tab]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const dateA = new Date(a.start_at || a.created_at).getTime();
    const dateB = new Date(b.start_at || b.created_at).getTime();
    return dateB - dateA;
  }), [filtered]);

  return (
    <PageShell>
        <PageHeader
          title="공지사항"
          description="동고리의 새로운 소식과 주요 안내를 확인하세요."
        />
        <div className="flex border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`px-5 py-3 text-base font-bold transition-colors sm:px-6 ${
                tab === t.key
                  ? "-mb-px border-b-2 border-black text-black"
                  : "text-gray-400 hover:text-black"
              }`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-12 border-b border-gray-200 py-4 text-sm font-bold text-gray-400">
          <div className="col-span-1 text-center">번호</div>
          <div className="col-span-2 text-center">카테고리</div>
          <div className="col-span-7">제목/내용</div>
          <div className="col-span-2 text-center">등록일</div>
        </div>
        <ul>
          {loading ? (
            <li className="py-16 text-center text-gray-400 text-lg">로딩 중...</li>
          ) : sorted.length === 0 ? (
            <li className="py-16 text-center text-gray-400 text-lg">등록된 공지사항이 없습니다.</li>
          ) : (
            sorted.map((notice: any, index: number) => (
              <li key={notice.id} className="group grid grid-cols-12 items-center border-b border-gray-100 py-5 transition hover:bg-gray-50 sm:py-6">
                <div className="col-span-1 text-center text-gray-400">{index + 1}</div>
                <div className="col-span-2 text-center">
                  <span className="text-xs font-semibold text-gray-500">{notice.category}</span>
                </div>
                <div className="col-span-7">
                  <Link href={`/notices/${notice.id}`} className="font-medium text-gray-900 group-hover:underline block mb-1">
                    {notice.title}
                  </Link>
                  <span className="text-gray-400 text-sm truncate block">{(notice.content || "").slice(0, 50)}{(notice.content || "").length > 50 ? "..." : ""}</span>
                </div>
                <div className="col-span-2 text-center text-gray-400">{(notice.start_at || notice.created_at || "").slice(0, 10)}</div>
              </li>
            ))
          )}
        </ul>
    </PageShell>
  );
}
