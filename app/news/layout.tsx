import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "동고리 소식",
  alternates: { canonical: "/news" },
  description: "동고리 플랫폼 공지사항과 동대문 봉제산업에 관한 보도자료를 확인하세요.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
