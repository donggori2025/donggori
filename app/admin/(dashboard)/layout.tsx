import React from "react";
import { cookies } from "next/headers";
import AdminSidebar from "./AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-sm border rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-bold mb-4">관리자 로그인 필요</h1>
          <a className="text-blue-600 underline" href="/admin/login">로그인 페이지로 이동</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto relative">
      {/* 좌측 사이드바 */}
      <AdminSidebar />
      
      {/* 우측 메인 컨텐츠 */}
      <main className="flex-1 bg-white p-6 ml-64 pt-[72px]">
        {children}
      </main>
    </div>
  );
}


