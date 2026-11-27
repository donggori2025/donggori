import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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
    title: "3단계: 맞춤 추천 결과 확인",
    desc: "입력한 조건에 맞는 봉제공장을 최대 3곳까지 추천해드립니다.",
    features: ["조건에 맞는 공장 추천", "상세 정보 제공", "직접 의뢰 가능"],
  },
];

const StepSection = () => (
  <section className="matching-guide" aria-labelledby="matching-guide-title">
    <div className="site-wide">
      <div className="section-heading">
        <h2 id="matching-guide-title">맞춤 추천 이용방법</h2>
        <Link className="landing-link" href="/matching">맞춤 추천 시작 <ArrowRight size={16} /></Link>
      </div>
      <ol className="guide-steps">
        {matchingSteps.map((step, i) => (
          <li key={step.title}>
            <div className="guide-preview">
              <Image src={step.image} alt={`맞춤 추천 인터페이스 ${i + 1}`} width={480} height={360}
                className="h-full w-full object-contain" unoptimized />
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
            <ul>{step.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default StepSection;
