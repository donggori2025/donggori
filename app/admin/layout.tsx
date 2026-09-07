import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 단순 래퍼: 실제 보호는 (dashboard)/layout.tsx에서 수행
  return children;
}

