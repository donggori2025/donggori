import type { Metadata } from "next";
import EsgCircle from "./EsgCircle";
import { PageHeader, PageShell } from "@/components/ui/app-ui";

export const metadata: Metadata = {
  title: "ESG",
  alternates: { canonical: "/esg" },
  description:
    "동고리 ESG — 공유 생산 환경(E), 지역상생·일감매칭(S), 지역 협력과 투명한 운영(G)",
};

const PILLARS = [
  {
    key: "E",
    title: "Environment",
    subtitle: "동대문 복합지원센터 활용",
    color: "text-[#4F8A61]",
    bar: "bg-[#A8DDB5]",
    surface: "bg-[#f7fbf8]",
    body: "동고리는 가까운 생산 파트너를 찾고 지역의 생산 기반을 함께 활용하는 방향을 지향합니다. 동대문구 패션봉제 복합지원센터를 중심으로 공유 생산과 교육의 가치를 알리고, 장비와 자원을 효율적으로 사용하는 지역 봉제 환경을 응원합니다.",
  },
  {
    key: "S",
    title: "Social",
    subtitle: "지역상생과 일감매칭",
    color: "text-[#4779B8]",
    bar: "bg-[#9EC5F8]",
    surface: "bg-[#f7faff]",
    body: "디자이너와 봉제공장을 온라인으로 연결해 지역 안에서 새로운 제작 기회를 찾도록 돕습니다. 공장의 품목, 원단, 지역과 생산 조건을 비교하는 맞춤 추천으로 생산 파트너를 찾는 과정을 지원하고, 숙련된 생산자와 새로운 브랜드가 함께 성장하는 지역상생을 지향합니다.",
  },
  {
    key: "G",
    title: "Governance",
    subtitle: "지역 협력과 투명한 운영",
    color: "text-[#66708F]",
    bar: "bg-[#B8C0D9]",
    surface: "bg-[#f8f9fc]",
    body: "동고리는 지역 봉제산업의 이해관계자와 협력하고, 이용자가 서비스의 운영 기준을 이해할 수 있는 투명한 운영을 지향합니다. 공장 정보와 서비스 안내를 명확하게 제공하고 이용자의 의견을 반영해, 신뢰할 수 있는 생산 연결 환경을 만들어가겠습니다.",
  },
];

export default function EsgPage() {
  return (
    <PageShell>
        <PageHeader
          title="ESG"
          description={
            <>
          동고리는 환경(E)·사회(S)·거버넌스(G)를 한 원의 세 면으로 봅니다. 복합지원센터의 공유 생산,
          지역 일감 매칭, 지역 협력과 투명한 운영을 함께 지향합니다.
            </>
          }
        />

        <div className="flex justify-center mb-14">
          <EsgCircle />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PILLARS.map((item) => (
            <article key={item.key} className={`border border-dg-line p-6 ${item.surface}`}>
              <div className={`h-1 w-10 ${item.bar} mb-5`} />
              <div className={`text-3xl font-extrabold ${item.color} mb-1`}>{item.key}</div>
              <div className="text-xs font-bold tracking-widest text-gray-400 mb-2">{item.title}</div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{item.subtitle}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
    </PageShell>
  );
}
