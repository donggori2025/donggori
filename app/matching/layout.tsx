import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 매칭 | 동고리",
  description: "몇 가지 정보만 알려주시면 가장 적합한 봉제공장 3곳을 추천해드립니다.",
};

export default function MatchingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
