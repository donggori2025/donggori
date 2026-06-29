"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";
import { AdminAlert, AdminCard, AdminPageHeader } from "@/components/admin/admin-ui";

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
    <>
      <AdminPageHeader
        title="대시보드"
        description="동고리 서비스 데이터를 한눈에 확인합니다."
      />

      {error && <AdminAlert>{error}</AdminAlert>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="group">
            <AdminCard className="h-full hover:border-gray-300 hover:shadow-md transition">
              <div className="text-sm text-gray-500 mb-1">{card.label}</div>
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition">
                {loading ? "—" : (card.value ?? 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{card.desc}</div>
            </AdminCard>
          </Link>
        ))}
      </div>

      <AdminCard title="빠른 작업">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/factories"
            className="inline-flex items-center rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition"
          >
            업장 추가/수정
          </Link>
          <Link
            href="/admin/notices"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            공지 작성
          </Link>
          <Link
            href="/admin/popups"
            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            팝업 등록
          </Link>
        </div>
      </AdminCard>
    </>
  );
}
