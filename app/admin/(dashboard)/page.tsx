"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";

type Stats = { factories: number; notices: number; popups: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "통계 불러오기 실패");
        setStats(json.data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "등록 업장", value: stats?.factories, href: "/admin/factories", desc: "봉제공장 DB 관리" },
    { label: "공지사항", value: stats?.notices, href: "/admin/notices", desc: "공지 등록·수정" },
    { label: "팝업", value: stats?.popups, href: "/admin/popups", desc: "메인 팝업 관리" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-2">관리자 대시보드</h1>
      <p className="text-sm text-gray-500 mb-8">동고리 서비스 데이터를 관리합니다.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-gray-300 hover:shadow transition"
          >
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "—" : (card.value ?? 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">{card.desc}</div>
          </Link>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold text-gray-900 mb-3">빠른 작업</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/factories" className="px-4 py-2 bg-[#222] text-white rounded-lg text-sm font-medium hover:bg-[#444] transition">
            업장 추가/수정
          </Link>
          <Link href="/admin/notices" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            공지 작성
          </Link>
          <Link href="/admin/popups" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            팝업 등록
          </Link>
          <Link href="/" target="_blank" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
            사이트 미리보기 ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
