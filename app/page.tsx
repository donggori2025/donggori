"use client";
import React from "react";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection"; 
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <main className="px-6">
      <HeroSection />
      <InfoSection />
      <StepSection />
      <RecommendSection />
      {/* 추가 섹션 예시: */}
      {/* 
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-10">여기에 다른 콘텐츠</div>
      </section> 
      */}
    </main>


  );
}