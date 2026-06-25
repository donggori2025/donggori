import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI 모델핏 Studio | 동고리",
  description: "예시를 참고하거나 옵션을 선택해 AI 이미지 생성용 모델핏 프롬프트를 만들어보세요.",
};

export default function AiModelFitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
