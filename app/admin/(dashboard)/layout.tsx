import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import React from "react";
import { verifyAdminSession } from "@/lib/adminSession";
import AdminSidebar from "./AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session?.value || !verifyAdminSession(session.value)) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <AdminSidebar />
      <div className="pl-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 h-14 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-8 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">동고리 관리자</span>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            사이트 보기 ↗
          </a>
        </header>
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
