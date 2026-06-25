import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { featureFlags } from "@/lib/featureFlags";

export const metadata: Metadata = {
  title: "AI 의류 생성 Studio | 동고리",
  description: "예시 의류를 참고하거나 옵션을 선택해 AI 이미지 생성용 의류 상품 프롬프트를 만들어보세요.",
};

export default function AiClothingLayout({ children }: { children: React.ReactNode }) {
  if (!featureFlags.aiClothing) redirect("/matching");
  return children;
}
