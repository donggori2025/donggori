"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { House, Layers, Megaphone, MessagesSquare, Store } from "lucide-react";

const NAV = [
  { group: "상담", items: [{ href: "/admin/coordinator", label: "대화·문의", icon: MessagesSquare }] },
  { group: "운영", items: [{ href: "/admin/operations", label: "서비스 관리", icon: House }] },
  { group: "관리", items: [
    { href: "/admin/factories", label: "등록 업장 관리", icon: Store },
    { href: "/admin/notices", label: "공지사항 관리", icon: Megaphone },
    { href: "/admin/popups", label: "팝업 관리", icon: Layers },
  ] },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        window.location.href = "/admin/login";
      } else {
        alert("로그아웃에 실패했습니다.");
      }
    } catch {
      alert("로그아웃 중 오류가 발생했습니다.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="association-sidebar md:fixed md:inset-y-0 md:left-0 z-30 flex md:w-64 flex-col border-r border-gray-200/80 bg-white">
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="text-lg font-bold text-gray-900 tracking-tight">동고리</div>
        <div className="text-xs text-gray-400 mt-0.5">관리자 콘솔</div>
      </div>

      <nav aria-label="관리자 메뉴" className="flex-1 px-3 py-4 md:space-y-1">
        {NAV.map(({ group, items }) => (
          <div className="association-nav-group" key={group}>
            <p className="hidden md:block px-3 pt-3 pb-1 text-xs font-semibold text-gray-500">{group}</p>
            {items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href, href === "/admin");
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-[#1362ce] text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:text-gray-900"}`}>
                  <Icon size={20} aria-hidden="true" />{label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-md px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
        >
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </aside>
  );
}
