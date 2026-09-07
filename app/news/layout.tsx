import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News | 동고리",
  description: "동고리와 패션 제조 생태계의 주요 언론 보도를 확인하세요.",
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
