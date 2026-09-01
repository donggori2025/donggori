"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ChevronDown,
  FileText,
  Layers,
  Library,
  MessageSquare,
  PencilRuler,
  Share2,
  Sparkles,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { FlatThumb } from "@/components/flats";
import { cn } from "@/lib/utils";

const PRODUCT_TABS = [
  {
    id: "design",
    label: "Design",
    title: "제품이 어떻게 보이는지",
    body: "도식화와 디자인 에셋을 하나의 캔버스에서 구성합니다.",
  },
  {
    id: "specs",
    label: "Specs",
    title: "제품을 어떻게 만들지",
    body: "원단, 부자재, 사이즈까지 생산에 필요한 정보를 구조화합니다.",
  },
  {
    id: "pack",
    label: "Tech Pack",
    title: "공장에 전달할 문서",
    body: "Design과 Specs를 기반으로 공장 전달용 Tech Pack을 생성합니다. 100%를 채우지 않아도 미리볼 수 있습니다.",
  },
] as const;

const PROBLEMS = [
  { tool: "Illustrator", use: "도식화" },
  { tool: "Excel", use: "사이즈 / 원단" },
  { tool: "Messenger", use: "수정사항" },
  { tool: "PDF", use: "작업지시서" },
];

const FEATURES = [
  {
    n: "01",
    icon: PencilRuler,
    title: "Design",
    kicker: "형태",
    body: "자유롭게 디자인하세요. 도식화와 디자인 에셋을 하나의 캔버스에서 구성합니다.",
    points: ["무한대지", "템플릿", "에셋"],
  },
  {
    n: "02",
    icon: FileText,
    title: "Specs",
    kicker: "정의",
    body: "어떻게 만들지 정의하세요. 원단, 부자재, 사이즈까지 생산에 필요한 정보를 구조화합니다.",
    points: ["원단·부자재", "사이즈", "주의사항"],
  },
  {
    n: "03",
    icon: Layers,
    title: "Tech Pack",
    kicker: "결과",
    body: "입력한 정보가 문서가 됩니다. Design과 Specs를 기반으로 공장 전달용 Tech Pack을 생성합니다.",
    points: ["미리보기", "인쇄", "PDF"],
  },
  {
    n: "04",
    icon: Library,
    title: "Library",
    kicker: "자재",
    body: "매번 다시 입력하지 마세요. 자주 사용하는 원단과 부자재를 저장하고 여러 제품에서 다시 사용하세요.",
    points: ["원단", "부자재", "라벨"],
  },
  {
    n: "05",
    icon: MessageSquare,
    title: "Collaboration",
    kicker: "내부",
    body: "제품 위에서 함께 확인하세요. 디자인과 생산 정보를 팀과 함께 검토합니다.",
    points: ["코멘트", "버전", "멘션"],
  },
  {
    n: "06",
    icon: Share2,
    title: "Share",
    kicker: "공장",
    body: "공장에는 필요한 정보만 전달하세요. 보기 전용 공유 페이지와 PDF로 제품 정보를 전달합니다.",
    points: ["보기 전용", "인쇄", "PDF"],
  },
];

const STEPS = [
  {
    n: "01",
    kicker: "Design",
    title: "제품의 형태를 만드세요",
    body: "템플릿·레퍼런스·빈 제품 중 하나로 시작하고, 도식화를 한 캔버스에 모읍니다.",
  },
  {
    n: "02",
    kicker: "Specs",
    title: "생산에 필요한 정보를 입력하세요",
    body: "원단, 사이즈, 수량을 같은 제품에 붙여 완성도를 올립니다.",
  },
  {
    n: "03",
    kicker: "Tech Pack",
    title: "완성된 문서를 공유하세요",
    body: "공장에는 보기 전용 페이지와 PDF만 전달합니다.",
  },
];

const PLANS = [
  {
    id: "solo",
    name: "솔로",
    audience: "제품 정의 흐름을 익히는 시작",
    price: 0,
    billed: "무료",
    cta: "무료로 시작하기",
    featured: false,
    bullets: ["작업지시서 3개", "기본 Specs", "Tech Pack 미리보기", "2D 생성 월 60 크레딧"],
  },
  {
    id: "designer",
    name: "디자이너",
    audience: "혼자 제품을 개발하는 디자이너",
    price: 19000,
    billed: "월",
    cta: "시작하기",
    featured: true,
    bullets: [
      "작업지시서 20개",
      "50GB 스토리지",
      "확장된 디자인 에디터",
      "7일 체험 100 크레딧 · 이후 월 1,000 크레딧",
      "2D·3D 목업 생성",
      "도식화 템플릿 432개",
      "전체 에셋 사용",
      "미러모드(대칭)",
    ],
  },
  {
    id: "team",
    name: "팀",
    audience: "디자인팀이 함께 제품을 만드는 경우",
    price: 39000,
    billed: "석 / 월",
    cta: "시작하기",
    featured: false,
    note: "최소 2석부터",
    bullets: ["작업지시서 무제한", "전체 Specs", "팀 협업", "Tech Pack", "석당 2,100 크레딧"],
  },
  {
    id: "brand",
    name: "브랜드",
    audience: "여러 제품과 생산 파트너를 관리하는 브랜드",
    price: 59000,
    billed: "석 / 월",
    cta: "시작하기",
    featured: false,
    note: "최소 2석부터",
    bullets: [
      "작업지시서 무제한",
      "전체 Specs",
      "팀 협업",
      "Tech Pack",
      "석당 2,100 크레딧",
      "공장 공유",
      "생산 의뢰",
      "프로모션 생산",
    ],
  },
] as const;

const TEMPLATES_TEASER = [
  { name: "Basic T-Shirt", items: ["Front / Back Flat", "기본 Spec", "기본 Size Spec", "작업 주의사항"] },
  { name: "Oversized Hoodie", items: ["후드 도식화", "원단 자리", "사이즈 스펙", "인쇄 시안"] },
  { name: "Oxford Shirt", items: ["셔츠 플랫", "기본 Spec", "칼라·커프", "사이즈 스펙"] },
];

const FAQS = [
  {
    q: "무료로 시작할 수 있나요?",
    a: "솔로 플랜은 무료입니다. 작업지시서 3개, 기본 Specs, Tech Pack 미리보기, 월 60 크레딧(2D)으로 제품 정의 흐름을 익힐 수 있습니다.",
  },
  {
    q: "작업지시서 한도를 넘으면 어떻게 되나요?",
    a: "보관과 열람은 유지되고, 새로 만들거나 작업지시서를 늘리려면 상위 플랜이 필요합니다. 한도는 동시에 작업 중인 작업지시서 기준입니다.",
  },
  {
    q: "완성도가 무엇인가요?",
    a: "필수 Spec 기준으로 제품이 얼마나 정의되었는지를 나타냅니다. 100%를 채우지 않아도 Tech Pack은 언제든 미리볼 수 있습니다.",
  },
  {
    q: "크레딧은 어디에 쓰이나요?",
    a: "2D·3D 목업 생성에만 쓰입니다. 제품 작성과 Specs 입력은 무료이며 작업지시서 한도만 적용됩니다.",
  },
  {
    q: "팀과 브랜드의 차이는요?",
    a: "팀과 브랜드 모두 최소 2석부터입니다. 브랜드는 팀 구성에 공장 공유, 생산 의뢰, 프로모션 생산이 더해집니다.",
  },
  {
    q: "엔터프라이즈는 어떤 플랜인가요?",
    a: "원하는 기능만 골라 조합하는 맞춤 플랜입니다. 표준에 없는 흐름이 필요하면 추가 개발도 가능합니다.",
  },
];

function yearlyPrice(monthly: number) {
  return Math.round((monthly * 12 * 0.8) / 12);
}

function formatWon(n: number) {
  return `₩${n.toLocaleString("ko-KR")}`;
}

export function LandingPage() {
  const [tab, setTab] = useState<(typeof PRODUCT_TABS)[number]["id"]>("design");
  const [yearly, setYearly] = useState(true);
  const [faq, setFaq] = useState<number | null>(0);
  const activeTab = PRODUCT_TABS.find((t) => t.id === tab) ?? PRODUCT_TABS[0];

  return (
    <div className="canvas-dot min-h-full bg-paper text-ink fade-up">
      <header className="sticky top-0 z-20 border-b border-mist/80 bg-snow/80 backdrop-blur-md">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" aria-label="faddit 홈">
            <BrandLogo className="h-7" />
          </Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            <a href="#features" className="rounded-full px-3 py-2 text-[13px] text-stone hover:bg-paper hover:text-ink">
              서비스
            </a>
            <Link href="/templates" className="rounded-full px-3 py-2 text-[13px] text-stone hover:bg-paper hover:text-ink">
              템플릿
            </Link>
            <a href="#pricing" className="rounded-full px-3 py-2 text-[13px] text-stone hover:bg-paper hover:text-ink">
              요금제
            </a>
          </nav>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-snow"
          >
            시작하기
            <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center lg:py-24">
          <p className="text-[11px] tracking-[0.2em] text-stone uppercase">패션 제품 개발 워크스페이스</p>
          <h1 className="mt-4 max-w-[14ch] text-[40px] leading-[1.12] font-semibold tracking-tight sm:text-[52px]">
            디자인부터 생산 사양까지 하나의 제품 안에서.
          </h1>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-stone">
            흩어져 있던 도식화, 원단, 사이즈를 하나로 연결하세요. 제품 정보를 완성하면 Tech Pack까지 자동으로
            정리됩니다.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-snow"
            >
              무료로 제품 만들기
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center rounded-full border border-mist bg-snow px-5 py-2.5 text-[14px] text-ink hover:border-fog"
            >
              템플릿 보기
            </Link>
          </div>
          <div className="mt-12 w-full max-w-3xl text-left">
            <HeroPreview />
          </div>
        </section>

        <section className="border-t border-mist bg-snow/40">
          <div className="mx-auto max-w-4xl px-6 py-16 text-center">
            <h2 className="mx-auto max-w-[16ch] text-[28px] font-semibold tracking-tight">
              아직도 하나의 제품을 여러 파일에서 관리하고 있나요?
            </h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {PROBLEMS.map((item) => (
                <article key={item.tool} className="rounded-2xl border border-mist bg-snow px-4 py-5">
                  <p className="text-[14px] font-semibold tracking-tight">{item.tool}</p>
                  <p className="mt-1 text-[12px] text-stone">{item.use}</p>
                </article>
              ))}
            </div>
            <p className="mx-auto mt-6 max-w-[40ch] text-[14px] text-stone">
              패딧에서는 이 모든 정보가 하나의 제품에 연결됩니다.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Product Workspace</p>
          <h2 className="mx-auto mt-2 max-w-[18ch] text-[28px] font-semibold tracking-tight">
            작업에서 정의, 정의에서 결과로
          </h2>
          <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {PRODUCT_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-[13px] transition-colors",
                  tab === item.id ? "bg-ink text-snow" : "bg-paper text-stone hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="rounded-[28px] border border-mist bg-snow p-6 lg:p-8">
            <p className="text-[11px] tracking-[0.16em] text-stone uppercase">{activeTab.label}</p>
            <h3 className="mt-2 text-[24px] font-semibold tracking-tight">{activeTab.title}</h3>
            <p className="mx-auto mt-3 max-w-[46ch] text-[14px] leading-relaxed text-stone">{activeTab.body}</p>
            <div className="mx-auto mt-8 max-w-xl text-left">
              <TabPreview id={tab} />
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 text-center">
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">기능</p>
          <h2 className="mx-auto mt-2 max-w-[20ch] text-[28px] font-semibold tracking-tight">하나의 제품 안에서 완성하세요</h2>
          <p className="mx-auto mt-2 max-w-[46ch] text-[14px] text-stone">
            Illustrator의 도식화, Excel의 사양표, 메신저의 피드백까지. 패딧에서 하나의 제품 프로젝트로 연결하세요.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.n} className="rounded-2xl border border-mist bg-snow p-6 text-left">
                  <div className="flex items-center justify-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-ink">
                      <Icon size={16} strokeWidth={1.7} />
                    </span>
                    <p className="text-[11px] tracking-widest text-stone">
                      {item.n} / {item.kicker}
                    </p>
                  </div>
                  <h3 className="mt-5 text-center text-[16px] font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-2 text-center text-[13px] leading-relaxed text-stone">{item.body}</p>
                  <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {item.points.map((p) => (
                      <li key={p} className="rounded-full bg-paper px-2.5 py-1 text-[11px] text-stone">
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-mist bg-snow/50">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Workflow</p>
            <h2 className="mx-auto mt-2 max-w-[22ch] text-[28px] font-semibold tracking-tight">
              새 제품에서 공유까지, 한 흐름으로
            </h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step) => (
                <li key={step.n} className="rounded-2xl border border-mist bg-snow p-6">
                  <p className="text-[12px] tracking-widest text-stone">
                    {step.n} {step.kicker}
                  </p>
                  <p className="mt-3 text-[16px] font-semibold tracking-tight">{step.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-stone">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Templates</p>
          <h2 className="mt-2 text-[28px] font-semibold tracking-tight">제품 정의의 시작점</h2>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14px] text-stone">
            템플릿은 단순 도식화 라이브러리가 아닙니다. 기본 Spec과 Size Spec까지 함께 시작합니다.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {TEMPLATES_TEASER.map((tpl) => (
              <article key={tpl.name} className="rounded-2xl border border-mist bg-snow p-5 text-left">
                <p className="text-[15px] font-semibold tracking-tight">{tpl.name}</p>
                <ul className="mt-3 space-y-1.5 text-[13px] text-stone">
                  {tpl.items.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <Link
            href="/templates"
            className="mt-8 inline-flex items-center gap-1.5 rounded-full border border-mist bg-snow px-5 py-2.5 text-[14px] hover:border-fog"
          >
            템플릿 보기
            <ArrowRight size={14} />
          </Link>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16 text-center">
          <div className="flex flex-col items-center gap-6">
            <div>
              <p className="text-[11px] tracking-[0.18em] text-stone uppercase">요금제</p>
              <h2 className="mt-2 text-[28px] font-semibold tracking-tight">작업 방식에 맞는 플랜으로 시작하세요</h2>
              <p className="mx-auto mt-2 max-w-[48ch] text-[14px] text-stone">
                스토리지가 아니라 작업지시서 수와 목업 크레딧으로 나눕니다. 제품 작성은 무료입니다.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-mist bg-snow p-1 text-[12px]">
              <button
                type="button"
                onClick={() => setYearly(false)}
                className={cn("rounded-full px-3 py-1.5", !yearly ? "bg-ink text-snow" : "text-stone")}
              >
                월간
              </button>
              <button
                type="button"
                onClick={() => setYearly(true)}
                className={cn("rounded-full px-3 py-1.5", yearly ? "bg-ink text-snow" : "text-stone")}
              >
                연간 20% 절약
              </button>
            </div>
          </div>

          <div className="mt-10 grid items-stretch gap-4 pt-3 lg:grid-cols-4">
            {PLANS.map((plan) => {
              const paid = plan.price > 0;
              const display = paid && yearly ? yearlyPrice(plan.price) : plan.price;
              return (
                <article
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-snow p-5 text-center",
                    plan.featured
                      ? "z-10 -translate-y-2 border-ink shadow-float lg:-translate-y-3"
                      : "border-mist",
                  )}
                >
                  {plan.featured && (
                    <p className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-medium tracking-wide text-snow">
                      인기
                    </p>
                  )}
                  <h3 className="text-[20px] font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-1 min-h-[40px] text-[13px] leading-snug text-stone">{plan.audience}</p>
                  <p className="mt-5 text-[28px] font-semibold tracking-tight">
                    {paid ? formatWon(display) : "무료"}
                    {paid && <span className="ml-1 text-[13px] font-normal text-stone">/{plan.billed}</span>}
                  </p>
                  {paid && yearly && (
                    <p className="mt-1 text-[11px] text-stone">출시가 {formatWon(plan.price)}/{plan.billed}</p>
                  )}
                  {"note" in plan && plan.note && <p className="mt-1 text-[11px] text-stone">{plan.note}</p>}
                  <ul className="mt-5 flex-1 space-y-2 text-left text-[13px]">
                    {plan.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <Check size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-ink" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-6">
                    <Link
                      href="/dashboard"
                      className={cn(
                        "inline-flex w-full items-center justify-center rounded-full py-2.5 text-[13px] font-medium",
                        plan.featured ? "bg-ink text-snow" : "border border-mist bg-paper text-ink hover:border-fog",
                      )}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-6 rounded-[28px] border border-mist bg-snow p-6 text-center sm:p-8">
            <p className="text-[11px] tracking-[0.16em] text-stone uppercase">Enterprise</p>
            <h3 className="mt-2 text-[22px] font-semibold tracking-tight">엔터프라이즈</h3>
            <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-stone">
              표준 플랜에 없는 조합이 필요할 때입니다. 작업지시서 한도, Specs 깊이, 공유 범위, 크레딧을 골라 붙이고, 없는
              흐름은 추가 개발로 맞춥니다.
            </p>
            <ul className="mx-auto mt-4 inline-flex flex-col items-start gap-1.5 text-[13px] text-stone">
              <li className="flex gap-2">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-ink" />
                원하는 기능만 조합한 맞춤 플랜
              </li>
              <li className="flex gap-2">
                <Share2 size={14} className="mt-0.5 shrink-0 text-ink" />
                브랜드·공장 온보딩과 워크스페이스 설계
              </li>
              <li className="flex gap-2">
                <PencilRuler size={14} className="mt-0.5 shrink-0 text-ink" />
                전용 스펙 항목, 내보내기, 연동 등 추가 개발
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-snow"
              >
                도입 상담하기
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-[28px] font-semibold tracking-tight">자주 묻는 질문</h2>
          <div className="mt-6 divide-y divide-mist border-y border-mist text-left">
            {FAQS.map((item, i) => {
              const open = faq === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-medium">{item.q}</span>
                    <ChevronDown size={16} className={cn("shrink-0 text-stone transition", open && "rotate-180")} />
                  </button>
                  {open && <p className="pb-4 text-[14px] leading-relaxed text-stone">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-mist">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-14 text-center">
            <div>
              <p className="text-[22px] font-semibold tracking-tight">지금 바로 제품을 정의하세요</p>
              <p className="mt-1 text-[14px] text-stone">솔로로 흐름을 익히거나, 템플릿으로 한 벌을 바로 열어보세요.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-snow"
              >
                무료로 제품 만들기
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center rounded-full border border-mist bg-snow px-5 py-2.5 text-[14px]"
              >
                템플릿 보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-mist bg-snow/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-center sm:grid-cols-4">
          <div>
            <BrandLogo className="mx-auto h-6" />
            <p className="mt-3 text-[12px] leading-relaxed text-stone">
              Faddit은 패션 제품 개발을 위한 Product Definition Workspace입니다.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium">서비스</p>
            <ul className="mt-3 space-y-1.5 text-[12px] text-stone">
              <li>
                <a href="#features">Design</a>
              </li>
              <li>
                <a href="#features">Specs</a>
              </li>
              <li>
                <a href="#features">Tech Pack</a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium">템플릿</p>
            <ul className="mt-3 space-y-1.5 text-[12px] text-stone">
              <li>
                <Link href="/templates">도식화 템플릿</Link>
              </li>
              <li>
                <Link href="/templates">제품 템플릿</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium">요금제</p>
            <ul className="mt-3 space-y-1.5 text-[12px] text-stone">
              <li>
                <a href="#pricing">솔로 · 디자이너 · 팀 · 브랜드</a>
              </li>
              <li>
                <a href="#pricing">엔터프라이즈</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl justify-center gap-6 border-t border-mist px-6 py-4 text-[11px] text-stone">
          <p>© 2026 Faddit</p>
          <p>KR</p>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="rounded-[28px] border border-mist bg-snow p-4 shadow-float">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[13px] font-medium tracking-tight">Oversized Hoodie #01</p>
          <p className="mt-0.5 text-[11px] text-stone">26SS-HD-01 · 26SS Collection</p>
        </div>
        <span className="rounded-full bg-peach px-2.5 py-1 text-[10px] font-medium text-peach-ink">작성 중 · 72%</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-mist bg-paper">
          <div className="h-[210px] w-[190px] text-ink">
            <FlatThumb category="hoodie" />
          </div>
        </div>
        <div className="space-y-2 rounded-2xl border border-mist bg-paper p-4">
          <p className="text-[11px] text-stone">제품 식별</p>
          <SpecRow label="아이템" value="Hoodie" />
          <SpecRow label="성별" value="Unisex" />
          <SpecRow label="Fit" value="Crop" />
          <SpecRow label="원단" value="Cotton Fleece 420g" />
          <div className="mt-3 rounded-xl bg-snow px-3 py-2.5">
            <p className="text-[11px] text-stone">김MD · Specs</p>
            <p className="mt-1 text-[12px] leading-snug">이 원단 500g으로 변경 가능한지 확인해주세요.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabPreview({ id }: { id: (typeof PRODUCT_TABS)[number]["id"] }) {
  if (id === "specs") {
    return (
      <div className="space-y-2 rounded-2xl border border-mist bg-paper p-4">
        <p className="text-[12px] font-medium">생산 사양</p>
        <SpecRow label="사이즈" value="S–XL · CM" />
        <SpecRow label="가슴단면" value="58 / 60 / 62 / 64" />
        <SpecRow label="부자재" value="Metal Eyelet Ø8" />
        <SpecRow label="주의사항" value="리테일 접기 · 폴리백" />
      </div>
    );
  }
  if (id === "pack") {
    return (
      <div className="rounded-2xl border border-mist bg-paper p-4">
        <p className="text-[12px] font-medium">Tech Pack · A4 가로</p>
        <p className="mt-2 text-[12px] text-stone">도식화 · 사이즈 · 원단 · 라벨이 한 시트에 붙습니다.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["FLAT", "SIZE", "FABRIC"].map((label) => (
            <div key={label} className="rounded-xl bg-snow px-3 py-6 text-center text-[11px] tracking-wide text-stone">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-mist bg-paper">
      <div className="h-[180px] w-[160px] text-ink">
        <FlatThumb category="hoodie" />
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-snow px-3 py-1.5 text-[12px]">
      <span className="text-stone">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
