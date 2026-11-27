import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { studioStaffRole } from "@/lib/adminSession";
import CoordinatorShell from "./CoordinatorShell";
import "../../studio/presentation.css";
import "../coordinator.css";

export const metadata = { title: "코디네이터 상담 | 동고리" };

export default async function CoordinatorLayout({ children }: { children: ReactNode }) {
  const role = await studioStaffRole();
  if (!role) redirect("/admin/login");
  async function logout() {
    "use server";
    const jar = await cookies();
    jar.delete("coordinator_session");
    jar.delete("admin_session");
    redirect("/admin/login");
  }
  return <CoordinatorShell role={role} logout={logout}>{children}</CoordinatorShell>;
}
