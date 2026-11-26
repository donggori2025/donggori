import "./home.css";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import LandingSections from "@/components/home/LandingSections";
import type { Metadata } from "next";
import FactoryShowcase from "@/components/home/FactoryShowcase";
import StepSection from "@/components/StepSection";
import RecommendSection from "@/components/RecommendSection";
import NoticesSection from "@/components/NoticesSection";


export const metadata: Metadata = {
  title: { absolute: "동고리 | 봉제공장·맞춤 추천" },
  description:
    "의류 제작 조건에 맞는 봉제공장을 찾고 문의할 수 있는 동고리의 공장 정보·맞춤 추천 서비스입니다.",
};

const faq = [
  ["공장별 제작 조건은 어디에서 확인하나요?", "제작업체 목록에서 품목, 원단, 최소 주문 수량으로 검색하세요. 업체를 선택하면 해당 공장이 등록한 제작 조건을 확인할 수 있어요."],
  ["어느 공장에 의뢰할지 정하지 못했어요.", "맞춤 추천에 만들 옷의 품목과 수량을 입력하거나 조건을 차례로 선택하세요. 내 조건에 맞는 공장을 비교할 수 있어요."],
  ["디자인 의뢰 전에 무엇을 준비하나요?", "상품 유형과 담당자 이름, 연락처, 요청 내용을 준비해 주세요. 참고할 사진이나 도면은 접수 후 카카오톡 상담에서 전달할 수 있어요."],
  ["접수한 의뢰는 어디에서 확인하나요?", "의뢰할 때 사용한 계정으로 로그인한 뒤 마이페이지의 의뢰내역을 열어 주세요."],
];

export default function HomePage() {
  return (
    <LandingSections>
      <FactoryShowcase />
      <StepSection />
      <RecommendSection />
      <NoticesSection />
      <section className="landing-faq" aria-labelledby="faq-heading">
        <div className="site-wide faq-layout">
          <div>
            <h2 id="faq-heading">자주 묻는 질문</h2>
            <Link href="/service" className="landing-link">서비스 이용안내 <ArrowRight size={16} /></Link>
          </div>
          <div className="faq-rows">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<ChevronDown size={18} aria-hidden="true" /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </LandingSections>
  );
}
