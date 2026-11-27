"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, ChevronRight, Clock3, Inbox, LogOut, Mail, Menu, Settings, UserRound, X } from "lucide-react";

const home = "/admin/coordinator";
const menu = [
  { key: "all", name: "대화·문의", href: home, Icon: Inbox },
  { key: "new", name: "새 문의", href: home + "?filter=new", Icon: Mail },
  { key: "waiting", name: "답변 대기", href: home + "?filter=waiting", Icon: Clock3 },
] as const;

export default function CoordinatorShell({ children, role, logout }: {
  children: ReactNode; role: "admin" | "coordinator"; logout: () => Promise<void>;
}) {
  const path = usePathname();
  const filter = useSearchParams().get("filter");
  const detail = path.startsWith(home + "/");
  const active = detail ? menu[0] : menu.find(item => item.key === filter) ?? menu[0];
  const dialog = useRef<HTMLDialogElement>(null);
  const closeMenu = () => dialog.current?.close();
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 961px)");
    const onResize = () => { if (desktop.matches) dialog.current?.close(); };
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  function navigation(mobile: boolean) {
    return <>
      <div className="coord-rail-brand">
        <Link href={home} aria-label="동고리 상담 대시보드" onClick={closeMenu}>
          <img src="/logo_donggori_0914_transparent.svg" alt="동고리" width={96} height={32} />
        </Link>
        {mobile && <button type="button" className="coord-menu-button" aria-label="메뉴 닫기" onClick={closeMenu}><X size={20} /></button>}
      </div>
      <nav className="coord-rail-nav" aria-label="코디네이터 메뉴">
        {menu.map(({ key, name, href, Icon }) =>
          <Link key={key} href={href} onClick={closeMenu} aria-current={active.key === key ? (detail ? "location" : "page") : undefined}>
            <Icon size={18} aria-hidden />{name}
          </Link>)}
      </nav>
      <div className="coord-rail-footer">
        {role === "admin" && <Link href="/admin/operations" onClick={closeMenu}><Settings size={16} aria-hidden />서비스 관리</Link>}
        <Link href="/" target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} aria-hidden />동고리 사이트 보기</Link>
        <form action={logout}><button><LogOut size={16} aria-hidden />로그아웃</button></form>
      </div>
    </>;
  }

  return <div className="coord-shell">
    <aside className="coord-rail">{navigation(false)}</aside>
    <div className="coord-workspace">
      <header className="coord-topbar">
        <button type="button" className="coord-menu-button coord-menu-trigger" aria-label="코디네이터 메뉴 열기"
          aria-haspopup="dialog" aria-controls="coord-mobile-menu" onClick={() => dialog.current?.showModal()}><Menu size={21} /></button>
        <div className="coord-location"><span>상담 관리</span><ChevronRight size={14} aria-hidden /><strong>{detail ? "상담 상세" : active.name}</strong></div>
        <span className="coord-role"><UserRound size={16} aria-hidden />{role === "admin" ? "관리자" : "코디네이터"}</span>
      </header>
      {children}
    </div>
    <dialog id="coord-mobile-menu" ref={dialog} className="coord-menu-drawer" aria-label="코디네이터 메뉴"
      onClick={e => { if (e.target === e.currentTarget) closeMenu(); }}>
      <div className="coord-drawer-inner">{navigation(true)}</div>
    </dialog>
  </div>;
}
