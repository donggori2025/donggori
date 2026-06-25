import React from "react";
import Image from "next/image";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

const matchingSteps = [
  {
    image: "/ai-matching-interface.png",
    title: "1단계: 공정 및 지역 정보 입력",
    desc: "생산하고자 하는 공정, 지역, MOQ를 선택해주세요. 적합한 봉제공장을 찾아드립니다.",
    features: ["공정 선택 (봉제/샘플/패턴/나염/전사)", "지역 선택", "MOQ 선택"],
  },
  {
    image: "/ai-matching-interface-2.png",
    title: "2단계: 장비 및 품목 정보 입력",
    desc: "필요한 재봉기, 패턴기, 특수기와 생산 품목을 선택해주세요.",
    features: ["재봉기 선택", "패턴기 선택", "특수기 선택", "품목 선택"],
  },
  {
    image: "/ai-matching-interface-3.png",
    title: "3단계: AI 추천 결과 확인",
    desc: "입력 정보를 바탕으로 AI가 가장 적합한 3개의 봉제공장을 추천해드립니다.",
    features: ["최적 공장 3개 추천", "상세 정보 제공", "직접 의뢰 가능"],
  },
];

const StepSection = () => (
  <section className="w-full bg-[#f6f7fb] py-10 sm:py-12 md:py-16 lg:py-20">
    <div className={PAGE_CONTAINER_CLASS}>
      <div className="mb-8 md:mb-12">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-10 items-start">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
              AI 매칭으로 빠르게 찾는 봉제공장
            </h2>
          </div>
          <div className="flex-1 lg:max-w-[480px]">
            <p className="text-sm md:text-base text-gray-500 leading-relaxed">
              AI가 봉제공장 데이터를 실시간 분석해 공정 요구사항에 최적화된 공장을 추천합니다.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {matchingSteps.map((step, idx) => (
          <div
            key={`step-${idx}-${step.title}`}
            className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 hover:shadow-md transition-shadow duration-300"
          >
            <div className="w-full h-44 sm:h-52 md:h-56 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <Image
                src={step.image}
                alt={`AI 매칭 인터페이스 ${idx + 1}`}
                width={400}
                height={300}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>

            <h3 className="text-base md:text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-3">{step.desc}</p>

            <div className="space-y-1.5">
              {step.features.map((feature, featureIdx) => (
                <div key={`feature-${featureIdx}-${feature}`} className="flex items-center text-xs sm:text-sm text-gray-500">
                  <div className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-2 shrink-0" />
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
