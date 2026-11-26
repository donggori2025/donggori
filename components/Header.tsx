"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, UserRound, X } from "lucide-react";
import { useAppAuth } from "@/contexts/AuthContext";
import { SITE_NAV_ITEMS } from "@/lib/navigation";

function headerLinkLabel({ href, label }: { href: string; label: string }) {
  return (
    <span className="relative inline-flex items-center gap-1.5 whitespace-nowrap group-aria-[current]:after:absolute group-aria-[current]:after:inset-x-0 group-aria-[current]:after:-bottom-1.5 group-aria-[current]:after:h-0.5 group-aria-[current]:after:bg-current">
      {href === "/matching" && (
        <span className="inline-flex h-6 items-center rounded-full bg-[linear-gradient(110deg,#0d6bc6,#0a5fda_52%,#244ab3)] px-2 text-[13px] leading-none font-bold text-white">AI</span>
      )}
      {label}
    </span>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useAppAuth();
  const signedIn = isLoaded && isSignedIn && !!user;
  const pathname = usePathname();

  function currentMenu(href: string) {
    if (pathname === href) return "page";
    if (pathname.startsWith(`${href}/`)) return "location";
  }
  const closeMenu = () => setMenuOpen(false);
  const accountLabel = signedIn ? `${user.name?.trim() || "회원"}님` : "로그인/회원가입";

  return (
    <header className="site-header sticky top-0 z-40 w-full border-b border-[#e5e5e2] bg-white/95 backdrop-blur-sm">
      <a href="#public-content" className="sr-only focus:not-sr-only focus:absolute focus:bg-white focus:p-3">본문 바로가기</a>
      <div className="site-wide grid grid-cols-[1fr_auto] items-center gap-4 py-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" onClick={closeMenu} className="justify-self-start" aria-label="동고리 홈">
          <Image src="/logo_donggori_0914_transparent.svg" alt="동고리 로고" width={798} height={266} sizes="(min-width: 640px) 112px, 96px" priority className="h-auto w-24 sm:w-28" />
        </Link>
        <nav aria-label="주 메뉴" className="hidden items-center gap-4 whitespace-nowrap text-sm font-bold lg:flex lg:gap-5 lg:text-base xl:gap-10">
          {SITE_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} aria-current={currentMenu(item.href)}
              className="group inline-flex min-h-10 items-center text-dg-ink hover:opacity-80">
              {headerLinkLabel(item)}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 max-w-full items-center gap-2 justify-self-end">
          <Link href={signedIn ? "/my-page" : "/sign-in"} onClick={closeMenu}
            aria-label={signedIn ? `${accountLabel} 마이페이지` : accountLabel}
            aria-current={signedIn ? currentMenu("/my-page") : undefined}
            className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-2 whitespace-nowrap px-3 text-xs font-semibold transition sm:text-sm ${signedIn ? "rounded-full border border-blue-100 bg-blue-50 text-dg-ink hover:bg-blue-100" : "rounded-md bg-[#141414] text-white hover:bg-black"}`}>
            {signedIn && <UserRound className="size-4 shrink-0 text-[#0a5fda]" aria-hidden="true" />}
            <span className="max-w-28 truncate">{accountLabel}</span>
          </Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={menuOpen} aria-controls="mobile-navigation"
            className="rounded-md p-2 text-gray-800 hover:bg-gray-100 lg:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <nav id="mobile-navigation" aria-label="모바일 메뉴" onKeyDown={(event) => { if (event.key === "Escape") closeMenu(); }}
          className="max-h-[75dvh] overflow-y-auto border-t border-[#e5e5e2] px-4 py-4 lg:hidden">
          {SITE_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={closeMenu} aria-current={currentMenu(item.href)}
              className="group block rounded-md px-3 py-3 font-medium text-dg-ink hover:bg-gray-50">
              {headerLinkLabel(item)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
