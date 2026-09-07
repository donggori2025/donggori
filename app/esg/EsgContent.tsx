import Image from "next/image";
import { PageShell } from "@/components/ui/app-ui";

const TAGS = ["#공유생산", "#지역상생", "#맞춤추천", "#투명운영"];

const PILLARS = [
  {
    id: "environment",
    key: "E",
    title: "Environment",
    subtitle: "공유 생산 환경 (동대문 패션복합지원센터)",
    image: "/images/esg/e.jpg",
    imageAlt: "숲길을 따라 이어지는 생산 환경의 이미지",
    body: "동고리는 가까운 생산 파트너를 찾고 지역의 생산 기반을 함께 활용하는 방향을 지향합니다. 동대문구 패션봉제 복합지원센터를 중심으로 공유 생산과 교육의 가치를 알리고, 장비와 자원을 효율적으로 쓰는 지역 봉제 환경을 응원합니다.",
  },
  {
    id: "social",
    key: "S",
    title: "Social",
    subtitle: "지역상생과 일감 매칭",
    image: "/images/esg/s.jpg",
    imageAlt: "함께 내일을 바라보는 사람들의 이미지",
    body: "디자이너와 봉제공장을 연결해 지역 안에서 새로운 제작 기회를 찾도록 돕습니다. 공장의 품목, 원단, 지역과 생산 조건을 비교하는 맞춤 추천으로 생산 파트너를 찾는 과정을 지원하고, 숙련된 생산자와 새로운 브랜드가 함께 성장하는 지역상생을 지향합니다.",
  },
  {
    id: "governance",
    key: "G",
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

const STRATEGY = [
  {
    heading: "환경",
    goals: ["가까운 생산 연결", "공유 생산·교육 가치 확산"],
  },
  {
    heading: "사회",
    goals: ["지역 일감 매칭", "숙련 생산자와 브랜드의 만남"],
  },
  {
    heading: "거버넌스",
    goals: ["공장 정보 명확 제공", "운영 기준의 투명한 안내"],
  },
] as const;

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-8 flex items-stretch gap-3 sm:mb-10">
      <span className="w-1 shrink-0 bg-dg-ink" aria-hidden />
      <h2 className="text-2xl font-bold tracking-tight text-dg-ink sm:text-3xl">{children}</h2>
    </div>
  );
}

export default function EsgContent() {
  return (
    <PageShell>
      <header className="mb-8 border-b border-dg-line pb-6 sm:mb-10">
        <h1 className="dg-page-title">ESG</h1>
      </header>

      <section className="pb-16 sm:pb-20">
        <SectionTitle>ESG란?</SectionTitle>
        <p className="-mt-4 mb-5 max-w-3xl text-sm leading-7 text-dg-muted sm:-mt-6 sm:text-base">
          동고리는 옷을 만드는 사람과 잘 만드는 공장을 잇는 과정에서 환경·사회·거버넌스를 함께 생각합니다.
        </p>
        <ul className="mb-10 flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-gray-200 bg-[#f7f7f5] px-3 py-1.5 text-xs text-gray-700"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {PILLARS.map((pillar) => (
            <article key={pillar.id} className="flex flex-col overflow-hidden border border-dg-line bg-white">
              <a href={`#${pillar.id}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                  <Image
                    src={pillar.image}
                    alt={pillar.imageAlt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col px-5 py-6">
                  <p className="text-xl font-bold text-dg-ink">{pillar.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{pillar.subtitle}</p>
                  <span className="mt-6 text-xs font-semibold text-gray-400 group-hover:text-gray-800">
                    &gt; 자세히 보기
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <SectionTitle>ESG 운영 방침</SectionTitle>
        <p className="max-w-3xl text-sm leading-7 text-dg-muted sm:text-base">
          동고리는 동대문의 생산 경험과 새로운 브랜드의 아이디어가 더 빠르고 정확하게 만나도록,
          서비스의 방향에 ESG를 담습니다. 확인되지 않은 실적이나 인증을 내세우지 않고,
          지금 운영하는 연결과 공개 기준을 바탕으로 책임을 다하겠습니다.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2">
          {PRINCIPLES.map((text, index) => (
            <li key={text} className="border border-dg-line bg-[#fafafa] px-6 py-7">
              <span className="text-3xl font-light text-[#c9c9c4]" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-sm leading-7 text-gray-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>ESG 전략</SectionTitle>
        <div className="overflow-hidden border border-dg-line">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {STRATEGY.map((column, index) => (
              <div
                key={column.heading}
                className={`border-dg-line ${index > 0 ? "border-t md:border-t-0 md:border-l" : ""}`}
              >
                <p className="bg-[#f3f3f0] px-5 py-3 text-center text-sm font-bold text-dg-ink">{column.heading}</p>
              </div>
            ))}
          </div>
          <p className="bg-dg-ink px-5 py-3 text-center text-sm font-semibold text-white">전략 방향</p>
          <div className="grid grid-cols-1 md:grid-cols-3">
            {STRATEGY.map((column, index) => (
              <ul
                key={`${column.heading}-goals`}
                className={`space-y-3 px-5 py-6 text-center text-sm leading-6 text-gray-700 ${
                  index > 0 ? "border-t border-dg-line md:border-t-0 md:border-l" : ""
                }`}
              >
                {column.goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article key={`${pillar.id}-detail`} id={pillar.id} className="scroll-mt-28">
              <p className="text-3xl font-extrabold tracking-tight text-dg-ink">
                {pillar.key}
                <span className="ml-1 text-base font-semibold tracking-normal text-gray-400">
                  {pillar.title.slice(1)}
                </span>
              </p>
              <h3 className="mt-3 text-lg font-bold text-gray-900">{pillar.subtitle}</h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
