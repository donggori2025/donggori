"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import InfoSection from "@/components/InfoSection"; 
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";
import NoticesSection from "@/components/NoticesSection";
import GlobalPopups from "@/components/GlobalPopups";

// 메인 페이지 컴포넌트
export default function HomePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    // OAuth 콜백 처리
    const handleOAuthCallback = () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (code || error) {
        console.log('OAuth 콜백 감지:', { code: code ? '있음' : '없음', error });
        console.log('Clerk 상태:', { isLoaded, isSignedIn, user: user?.id });

        if (error) {
          console.error('OAuth 오류:', error);
          alert(`OAuth 오류: ${error}`);
          return;
        }

        if (isSignedIn && user) {
          console.log('OAuth 로그인 성공:', user.id);
          // URL에서 OAuth 파라미터 제거
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    if (isLoaded) {
      handleOAuthCallback();
    }
  }, [searchParams, isLoaded, isSignedIn, user]);

  return (
    <main className="px-2 sm:px-4 md:px-6">
      <GlobalPopups />
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