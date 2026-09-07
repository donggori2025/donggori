import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection"; 
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";
import NoticesSection from "@/components/NoticesSection";


export const metadata: Metadata = {
  title: { absolute: "동고리 | 봉제공장 찾기·맞춤 추천" },
  description:
    "의류 제작 조건에 맞는 봉제공장을 찾고 문의할 수 있는 동고리의 공장 정보·맞춤 추천 서비스입니다.",
};

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <InfoSection />
      <StepSection />
      <RecommendSection />
      <NoticesSection />
    </div>
  );
}
