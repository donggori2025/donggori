import type { Metadata } from "next";
import EsgCircle from "./EsgCircle";
import { PageHeader, PageShell } from "@/components/ui/app-ui";

export const metadata: Metadata = {
  title: "ESG",
  alternates: { canonical: "/esg" },
  description:
    "동고리 ESG — 복합지원센터 활용(E), 지역상생·일감매칭(S), 동대문구청과 패션 특구 거버넌스(G)",
};

const PILLARS = [
  {
    key: "E",
    title: "Environment",
    subtitle: "동대문 복합지원센터 활용",
    color: "text-[#4F8A61]",
    bar: "bg-[#A8DDB5]",
    surface: "bg-[#f7fbf8]",
    body: "동고리는 용두동 한빛로 62 동대문구 패션봉제 복합지원센터를 생산·교육의 거점으로 활용합니다. 공용 재단실과 특수기, CAD 교육 공간을 함께 쓰며 영세 업체가 장비를 중복 구매하지 않아도 되게 합니다. 공유 설비와 스마트 제조 장비는 과잉 투자와 불필요한 물류 이동을 줄여, 지역 봉제가 자원을 아끼며 생산할 수 있는 환경 기반이 됩니다.",
  },
  {
    key: "S",
    title: "Social",
    subtitle: "지역상생과 일감매칭",
    color: "text-[#4779B8]",
    bar: "bg-[#9EC5F8]",
    surface: "bg-[#f7faff]",
    body: "디자이너와 관내 봉제공장을 온라인으로 이어 숙련 인력에게는 안정적인 일감을, 브랜드·청년 디자이너에게는 가까운 생산 파트너를 연결합니다. AI 매칭과 현장 실태조사로 쌓인 공장 DB는 소개와 발품에 의존하던 거래를 줄이고, 지역 안에서 일이 돌게 하는 상생 장치입니다. 산학 프로젝트와 첫 거래 연결은 세대가 다른 생산자와 창작자가 같은 생태계에 머물게 합니다.",
  },
  {
    key: "G",
    title: "Governance",
    subtitle: "동대문구청과 9개 패션 특구",
    color: "text-[#66708F]",
    bar: "bg-[#B8C0D9]",
    surface: "bg-[#f8f9fc]",
    body: "동고리는 동대문구청과 지역 봉제협회, 수행기관이 함께 운영하는 공공형 플랫폼입니다. 구청의 산업 정책과 등록·검증 체계 위에서 데이터가 관리되고, 동대문 패션타운을 포함한 전국 9개 패션 특구와 생산·유통 네트워크를 맞춥니다. 특구의 기획·판매 수요와 동대문 봉제 생산을 같은 거버넌스로 묶어, 투명한 매칭과 지속 가능한 산업 운영의 기준을 만듭니다.",
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
          지역 일감 매칭, 구청과 패션 특구가 맞물린 공공 운영이 같은 원을 이룹니다.
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
