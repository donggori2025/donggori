import React from "react";
import Image from "next/image";
import Link from "next/link";
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
  <section className="dg-section w-full bg-[#f5f5f3]">
    <div className={PAGE_CONTAINER_CLASS}>
      <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.55fr)] lg:items-start lg:gap-10 xl:gap-12">
        <div className="order-2 grid grid-cols-1 border border-gray-200 bg-white sm:grid-cols-3 lg:order-1">
          {matchingSteps.map((step, idx) => (
            <div
              key={`step-${idx}-${step.title}`}
              className={`p-5 transition-colors duration-200 hover:bg-gray-50 md:p-6 ${
                idx < matchingSteps.length - 1 ? "border-b border-gray-200 sm:border-b-0 sm:border-r" : ""
              }`}
            >
              <div className="mb-5 flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gray-50">
                <Image
                  src={step.image}
                  alt={`AI 매칭 인터페이스 ${idx + 1}`}
                  width={480}
                  height={360}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900 md:text-lg">{step.title}</h3>
              <p className="mb-3 text-sm leading-relaxed text-gray-500">{step.desc}</p>
              <div className="space-y-1.5">
                {step.features.map((feature, featureIdx) => (
                  <div
                    key={`feature-${featureIdx}-${feature}`}
                    className="flex items-center text-xs text-gray-500 sm:text-sm"
                  >
                    <div className="ai-spectrum-bg mr-2 h-1.5 w-1.5 shrink-0 rounded-full" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="order-1 flex flex-col items-start text-left lg:order-2 lg:pt-2">
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-dg-ink break-keep sm:text-4xl">
            AI 매칭으로
            <br />
            빠르게 찾는 봉제공장
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-500 md:text-base">
            AI가 봉제공장 데이터를 실시간 분석해 공정 요구사항에 최적화된 공장을 추천합니다.
          </p>
          <Link
            href="/matching"
            className="mt-8 inline-flex items-center gap-3 rounded-md bg-dg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            AI로 매칭받기
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm">→</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default StepSection;
