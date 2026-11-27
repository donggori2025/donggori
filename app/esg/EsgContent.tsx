import Image from "next/image";
import PortalPage from "@/components/PortalPage";
import { ArrowDownRight } from "lucide-react";

const PILLARS = [
  {
    id: "environment",
    key: "E",
    goals: ["가까운 생산 연결", "공유 생산·교육 가치 확산"],
    title: "Environment",
    subtitle: "공유 생산 환경 (동대문 패션복합지원센터)",
    image: "/images/esg/e.jpg",
    imageAlt: "숲길을 따라 이어지는 생산 환경의 이미지",
    body: "동고리는 가까운 생산 파트너를 찾고 지역의 생산 기반을 함께 활용하는 방향을 지향합니다. 동대문구 패션봉제 복합지원센터를 중심으로 공유 생산과 교육의 가치를 알리고, 장비와 자원을 효율적으로 쓰는 지역 봉제 환경을 응원합니다.",
  },
  {
    id: "social",
    key: "S",
    goals: ["지역 일감 매칭", "숙련 생산자와 브랜드의 만남"],
    title: "Social",
    subtitle: "지역상생과 일감 매칭",
    image: "/images/esg/s.jpg",
    imageAlt: "함께 내일을 바라보는 사람들의 이미지",
    body: "디자이너와 봉제공장을 연결해 지역 안에서 새로운 제작 기회를 찾도록 돕습니다. 공장의 품목, 원단, 지역과 생산 조건을 비교하는 맞춤 추천으로 생산 파트너를 찾는 과정을 지원하고, 숙련된 생산자와 새로운 브랜드가 함께 성장하는 지역상생을 지향합니다.",
  },
  {
    id: "governance",
    key: "G",
    goals: ["공장 정보 명확 제공", "운영 기준의 투명한 안내"],
    title: "Governance",
    subtitle: "지역 협력과 투명한 운영",
    image: "/images/esg/g.jpg",
    imageAlt: "신뢰와 기준을 상징하는 도시 풍경",
    body: "동고리는 지역 봉제산업의 이해관계자와 협력하고, 이용자가 서비스의 운영 기준을 이해할 수 있도록 투명한 운영을 지향합니다. 공장 정보와 서비스 안내를 명확하게 제공하고 이용자의 의견을 반영해, 신뢰할 수 있는 생산 연결 환경을 만들어가겠습니다.",
  },
] as const;

const PRINCIPLES = [
  "동고리는 환경, 사회, 거버넌스 측면에서 지역 봉제 생태계의 구성원으로서 관련 법과 이용자 보호를 지키며 지역사회에 기여합니다.",
  "옷을 만드는 사람과 공장, 그리고 지역의 기대를 반영해 지속 가능한 생산 연결을 추진합니다.",
  "이용자의 요청에 귀 기울이고 공장 정보와 운영 기준을 공개해 사회적 신뢰를 쌓아갑니다.",
  "서비스 운영 전반에 ESG 방향을 반영하고, 동대문의 생산 경험과 새로운 브랜드가 함께 성장하도록 노력합니다.",
] as const;

export default function EsgContent() {
  return (
    <PortalPage title="동고리 ESG" description="동대문 봉제산업의 공유 생산 환경과 지역상생, 투명한 운영을 위한 동고리의 방향입니다.">
      <div className="grid gap-5 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <a key={pillar.id} href={`#${pillar.id}`} className="pg-panel group overflow-hidden" aria-label={`${pillar.subtitle} 자세히 보기`}>
            <div className="relative aspect-[2/1] overflow-hidden">
              <Image src={pillar.image} alt={pillar.imageAlt} fill sizes="(min-width: 768px) 28vw, 92vw" className="object-cover motion-safe:transition-transform motion-safe:group-hover:scale-[1.03]" />
            </div>
            <div className="grid gap-2 p-5 sm:p-6">
              <span className="text-sm font-bold text-[#0a5fda]" lang="en">{pillar.title}</span>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{pillar.subtitle}</h2>
                <ArrowDownRight aria-hidden="true" size={20} className="shrink-0" />
              </div>
            </div>
          </a>
        ))}
      </div>
      <section className="pg-editorial-section">
        <h2>ESG 전략</h2>
        <div className="divide-y divide-blue-100 border-y border-blue-100">
          {PILLARS.map((pillar) => (
            <article key={pillar.id} id={pillar.id} className="grid scroll-mt-24 grid-cols-[2rem_1fr] gap-4 py-6">
              <span aria-hidden="true" className="pg-search-brand text-3xl font-bold">{pillar.key}</span>
              <div>
                <h3 className="text-lg font-bold">{pillar.subtitle}</h3>
                <p className="mt-2 max-w-prose leading-relaxed text-dg-muted">{pillar.body}</p>
                <p className="mt-3 text-sm font-semibold text-[#1754a2]">{pillar.goals.join(" · ")}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="pg-editorial-section">
        <h2>ESG 운영 방침</h2>
        <ul className="grid gap-x-8 gap-y-5 rounded-2xl bg-blue-50/70 p-6 leading-relaxed text-dg-muted sm:grid-cols-2 sm:p-8">
          {PRINCIPLES.map((text) => <li key={text}>{text}</li>)}
        </ul>
      </section>
    </PortalPage>
  );
}
