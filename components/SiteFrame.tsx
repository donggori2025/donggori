"use client";

import { Fragment, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import { SERVICE_LINKS, SUPPORT_LINKS } from "@/lib/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalPopups from "@/components/GlobalPopups";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen w-full flex-1">{children}</main>;
  }

  if (pathname === "/factories") {
    return (
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
        <GlobalPopups />
        <Header />
        <main id="public-content" tabIndex={-1} className="civic-main relative min-h-0 flex-1">{children}</main>
      </div>
    );
  }

  const route = [...SERVICE_LINKS, ...SUPPORT_LINKS,
    {href: "/my-page", label: "마이페이지"}, {href: "/sign-in", label: "로그인"},
    {href: "/service", label: "서비스 이용안내"}, {href: "/reset-password", label: "비밀번호 재설정"},
    {href: "/sign-up", label: "회원가입"}, {href: "/work-order", label: "작업지시서"},
  ].find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  const studio = pathname === "/studio";
  const ContentFrame = studio ? "div" : Fragment;
  return (
    <>
      <GlobalPopups />
      <ContentFrame {...(studio ? { className: "studio-content-frame" } : {})}>
      <Header />
      <main id="public-content" tabIndex={-1} className="civic-main w-full flex-1">
        {route && <nav aria-label="현재 위치" className="civic-location"><div className={PAGE_CONTAINER_CLASS}>
          <Link href="/">홈</Link><span aria-hidden>›</span>
          {pathname === route.href ? <strong aria-current="page">{route.label}</strong> :
            <><Link href={route.href}>{route.label}</Link><span aria-hidden>›</span><strong aria-current="page">{pathname.endsWith("/request") ? "제작 의뢰" : pathname === "/factories/list" ? "목록 보기" : "상세보기"}</strong></>}
        </div></nav>}
        {children}
      </main>
      </ContentFrame>
      <Footer />
    </>
  );
}
