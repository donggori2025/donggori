"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GlobalPopups from "@/components/GlobalPopups";

export default function SiteFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen w-full flex-1">{children}</main>;
  }

  return (
    <>
      <GlobalPopups />
      <Header />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </>
  );
}
