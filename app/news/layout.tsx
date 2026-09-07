import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  alternates: { canonical: "/news" },
  description: "동고리와 패션 제조 생태계의 주요 언론 보도를 확인하세요.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
