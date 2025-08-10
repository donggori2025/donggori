import React from "react";
import Image from "next/image";

const matchingSteps = [
  {
    image: "/ai-matching-interface.png", // 새로운 AI 매칭 인터페이스 이미지
    title: "1단계: 공정 및 지역 정보 입력",
    desc: "생산하고자 하는 공정(봉제, 샘플, 패턴, 나염, 전사), 지역, MOQ(최소 주문 수량)을 선택해주세요. 이를 바탕으로 적합한 봉제공장을 찾아드립니다.",
    features: ["공정 선택 (봉제/샘플/패턴/나염/전사)", "지역 선택", "MOQ(최소 주문 수량) 선택"],
    icon: "🏭",
    screenshot: "/matching-step1-screenshot.png"
  },
  {
    image: "/ai-matching-interface-2.png", 
    title: "2단계: 장비 및 품목 정보 입력",
    desc: "필요한 재봉기, 패턴기, 특수기 종류와 생산하고자 하는 품목(상의, 하의, 아우터, 원피스 등)을 선택해주세요.",
    features: ["재봉기 선택", "패턴기 선택", "특수기 선택", "품목 선택"],
    icon: "⚙️",
    screenshot: "/matching-step2-screenshot.png"
  },
  {
    image: "/ai-matching-interface-3.png",
    title: "3단계: AI 추천 결과 확인",
    desc: "입력하신 정보를 바탕으로 AI가 가장 적합한 3개의 봉제공장을 추천해드립니다. 각 공장의 상세 정보를 확인하고 의뢰해보세요.",
    features: ["최적 공장 3개 추천", "상세 정보 제공", "직접 의뢰 가능"],
    icon: "🤖",
    screenshot: "/matching-step3-screenshot.png"
  },
];

const StepSection = () => (
  <section className="w-full bg-white py-6 sm:py-8 md:py-12 lg:py-16 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] lg:min-h-[600px] flex items-center">
    <div className="max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6">
      {/* 상단 섹션 */}
      <div className="mb-6 sm:mb-8 md:mb-12">
        {/* 제목과 설명 */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8 items-start">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 md:mb-4">
              AI 매칭으로 빠르게 찾는 봉제공장
            </h2>
          </div>
          <div className="flex-1 lg:max-w-[500px]">
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
              AI가 74개의 봉제공장 데이터를 실시간으로 분석하여 당신의 공정 요구사항에 최적화된 공장을 정확하게 추천해드립니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 카드 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {matchingSteps.map((step, idx) => (
          <div key={`step-${idx}-${step.title}`} className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow duration-300">
            {/* 단계 이미지/아이콘 */}
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-white rounded-lg mb-3 sm:mb-4 flex items-center justify-center overflow-hidden relative">
              {/* 실제 이미지 표시 */}
              <Image
                src={step.image}
                alt={`AI 매칭 인터페이스 ${idx + 1}`}
                width={400}
                height={300}
                className="w-full h-full object-contain rounded-lg"
              />
              {/* 배경 패턴 */}
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 rounded-lg"></div>
              </div>
            </div>
            
            {/* 제목 */}
            <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 md:mb-3 text-gray-800">
              {step.title}
            </h3>
            
            {/* 설명 */}
            <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed mb-2 sm:mb-3">
              {step.desc}
            </p>

            {/* 주요 기능 */}
            <div className="space-y-1">
              {step.features.map((feature, featureIdx) => (
                <div key={`feature-${featureIdx}-${feature}`} className="flex items-center text-xs sm:text-sm text-gray-500">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-blue-400 rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StepSection; 