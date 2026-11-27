"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/adminFetch";
import { AdminAlert } from "@/components/admin/admin-ui";

import { ArrowRight, ArrowUpRight, Clock3, Inbox, Layers, Megaphone, MessagesSquare } from "lucide-react";

type Stats = { factories: number; notices: number; popups: number };

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then((res) => res.json())
      .then((json) => {
        if (!json.success) throw new Error(json.error || "통계 불러오기 실패");
        setStats(json.data);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const publishing = [
    { title: "공지사항", description: "협회 소식 작성 및 게시", href: "/admin/notices", icon: Megaphone, count: stats?.notices },
    { title: "팝업", description: "안내 팝업과 노출 기간 설정", href: "/admin/popups", icon: Layers, count: stats?.popups },
  ];

  return (
    <section className="association-dashboard" aria-labelledby="association-title">
      <h1 id="association-title">서비스 관리</h1>
      {error && <AdminAlert>{error}</AdminAlert>}
      <Link href="/admin/factories" className="association-workshops">
        <div>
          <h2>등록 업장</h2>
          <p className="association-total">{stats?.factories.toLocaleString("ko-KR") ?? "—"}<small>곳</small></p>
          <span className="association-open">업장 관리 <ArrowRight size={17} /></span>
        </div>
      </Link>
      <div className="association-tools">
        <section className="association-panel">
          <h2><MessagesSquare size={20} />코디네이터 상담</h2>
          <Link href="/admin/coordinator?filter=new"><Inbox /><span>새 문의 확인</span><ArrowRight /></Link>
          <Link href="/admin/coordinator?filter=waiting"><Clock3 /><span>답변 대기 문의</span><ArrowRight /></Link>
          <Link className="association-all" href="/admin/coordinator">전체 대화 보기 <ArrowUpRight /></Link>
        </section>
        <section className="association-panel">
          <h2>공지·팝업 관리</h2>
          {publishing.map(({ title, description, href, icon: Icon, count }) => (
            <Link key={href} href={href}><Icon /><span>{title}<small>{description}</small></span>
              <b>{count?.toLocaleString("ko-KR") ?? "—"}건</b><ArrowRight /></Link>
          ))}
        </section>
      </div>
    </section>
  );
}
