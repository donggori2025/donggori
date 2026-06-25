import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "디자인 의뢰하기 | 동고리",
  description: "원하시는 상품 정보를 남겨주시면 디자인 가능 여부와 진행 방안을 안내드립니다.",
};

export default function DesignRequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
