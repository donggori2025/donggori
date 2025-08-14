import React, { Suspense } from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection"; 
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";
import NoticesSection from "@/components/NoticesSection";
import GlobalPopups from "@/components/GlobalPopups";
import OAuthCallbackHandler from "@/components/OAuthCallbackHandler";

export const metadata: Metadata = {
  title: "동고리 - 의류 봉제·생산 연결 플랫폼",
  description:
    "동고리는 디자이너와 봉제공장을 연결하는 의류 제작 플랫폼입니다. 소량 제작부터 대량 생산까지, 맞춤형 작업지시서로 빠르고 효율적인 생산을 지원합니다.",
};

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <main className="px-2 sm:px-4 md:px-6">
      <Suspense fallback={null}>
        <OAuthCallbackHandler />
      </Suspense>
      <GlobalPopups />
      <section className="max-w-[1200px] mx-auto px-2 sm:px-4 md:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">동고리, 디자이너와 봉제공장을 잇다</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">
          동고리는 의류 제작 과정을 혁신적으로 단축시키는 봉제·생산 연결 플랫폼입니다. 디지털 작업지시서를 통해 의사소통 오류를 줄이고 생산 효율을 높입니다.
        </p>
      </section>
      <HeroSection />
      <InfoSection />
      <StepSection />
      <RecommendSection />
      <NoticesSection />
      {/* 추가 섹션 예시: */}
      {/* 
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-10">여기에 다른 콘텐츠</div>
      </section> 
      */}
    </main>
  );
}