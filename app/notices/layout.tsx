import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공지사항",
  alternates: { canonical: "/notices" },
  description: "동고리의 새로운 소식과 주요 안내를 확인하세요.",
};

export default function NoticesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
