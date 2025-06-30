"use client";
import React from "react";
import HeroSection from "../components/HeroSection";
import ContentCard from "../components/ContentCard";
import InfoSection from "../components/InfoSection";
import StepSection from "../components/StepSection";
import RecommendSection from "../components/RecommendSection";

const contents = [
  {
    title: "스마트 공장 투어",
    description: "최신 스마트 공장을 직접 둘러보고, 자동화 생산 과정을 체험해보세요.",
    imageUrl: "/public/factory1.jpg",
  },
  {
    title: "전통 수제 코스",
    description: "장인의 손길이 담긴 전통 수제 공정을 직접 경험할 수 있습니다.",
    imageUrl: "/public/factory2.jpg",
  },
  {
    title: "매칭 서비스",
    description: "나에게 맞는 공장 체험을 추천받고, 쉽고 빠르게 예약하세요.",
    imageUrl: "/public/matching.jpg",
  },
];

// 메인 페이지 컴포넌트
export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <InfoSection />
      <StepSection />
      <RecommendSection />
      {/* 추가 섹션 예시: */}
      {/* <section className="w-full bg-gray-50 py-16">
        <div className="max-w-[1200px] mx-auto px-4">여기에 다른 콘텐츠</div>
      </section> */}
    </main>
  );
}
