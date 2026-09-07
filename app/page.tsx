import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection"; 
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";
import NoticesSection from "@/components/NoticesSection";


export const metadata: Metadata = {
  title: "동고리 - 의류 봉제·생산 연결 플랫폼",
  description:
    "동고리는 디자이너와 봉제공장을 연결하는 의류 제작 플랫폼입니다. 소량 제작부터 대량 생산까지, 맞춤형 작업지시서로 빠르고 효율적인 생산을 지원합니다.",
};

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <InfoSection />
      <StepSection />
      <RecommendSection />
      <NoticesSection />
    </>
  );
}