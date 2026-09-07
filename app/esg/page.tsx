import type { Metadata } from "next";
import EsgContent from "./EsgContent";

export const metadata: Metadata = {
  title: "ESG",
  alternates: { canonical: "/esg" },
  description:
    "동고리 ESG — 공유 생산 환경(동대문 패션복합지원센터), 지역상생·일감매칭(S), 지역 협력과 투명한 운영(G)",
};

export default function EsgPage() {
  return <EsgContent />;
}
