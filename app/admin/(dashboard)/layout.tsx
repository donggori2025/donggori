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
    <div className="min-h-screen max-w-[1400px] mx-auto relative">
      <AdminSidebar />
      <main className="flex-1 bg-white p-6 ml-64 pt-[72px]">{children}</main>
    </div>
  );
}
