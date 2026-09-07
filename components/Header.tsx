"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAppAuth } from "@/contexts/AuthContext";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { SITE_NAV_ITEMS, SERVICE_LINKS } from "@/lib/navigation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user: authUser, isSignedIn, isLoaded } = useAppAuth();
  const pathname = usePathname();
  const closeMenu = () => setMenuOpen(false);
  const accountHref = isLoaded && isSignedIn ? "/my-page" : "/sign-in";
  const accountLabel = isLoaded && isSignedIn ? "마이페이지" : "로그인/회원가입";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dg-line bg-white/95 backdrop-blur-sm">
      <div className={`${PAGE_CONTAINER_CLASS} grid grid-cols-[1fr_auto] items-center gap-4 py-4 md:grid-cols-[1fr_auto_1fr]`}>
        <Link href="/" onClick={closeMenu} className="justify-self-start" aria-label="동고리 홈">
          <Image src="/logo_donggori.svg" alt="동고리 로고" width={113} height={47} priority className="h-auto w-24 sm:w-28" />
        </Link>
        <nav aria-label="주 메뉴" className="hidden items-center gap-6 text-sm font-semibold md:flex lg:gap-8">
          {SITE_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}
              className={`transition-colors hover:text-black ${pathname.startsWith(item.href) ? "text-black" : "text-gray-500"}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <Link href={accountHref} onClick={closeMenu} aria-label={accountLabel}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-dg-ink px-3 text-xs font-semibold text-white transition hover:bg-black sm:text-sm">
            {isLoaded && isSignedIn && authUser ? "마이페이지" : "로그인/회원가입"}
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} aria-controls="mobile-navigation"
            className="rounded-md p-2 text-gray-800 hover:bg-gray-100 md:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="모바일 메뉴" onKeyDown={(event) => { if (event.key === "Escape") closeMenu(); }}
          className="max-h-[75dvh] overflow-y-auto border-t border-dg-line px-4 py-4 md:hidden">
          {[...SITE_NAV_ITEMS, ...SERVICE_LINKS.filter((item) => !SITE_NAV_ITEMS.some((nav) => nav.href === item.href))].map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={pathname === item.href ? "page" : undefined}
              className="block rounded-md px-3 py-3 font-medium text-gray-700 hover:bg-gray-50">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
