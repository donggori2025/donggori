"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Menu, MousePointer2, PenTool, Square, Type, X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { FlatThumb } from "@/components/flats";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#features", label: "서비스" },
  { href: "/templates", label: "템플릿" },
  { href: "#pricing", label: "요금제" },
  { href: "#guide", label: "콘텐츠" },
  { href: "#faq", label: "고객지원" },
] as const;

const HERO_CHIPS = ["도식화", "작업지시서", "BOM", "POM", "드라이브", "멘션"] as const;

const FEATURES = [
  {
    n: "01",
    kicker: "파일 & 폴더",
    title: "시즌 폴더를 제품 단위로 둔다",
    points: ["폴더 구조", "작업 파일 검색", "팀 워크스페이스"],
    visual: "drive" as const,
  },
  {
    n: "02",
    kicker: "도식화 에디터",
    title: "실루엣과 디테일을 같은 패스에서",
    points: ["벡터 드로잉", "패스 편집", "패션 Asset"],
    visual: "editor" as const,
  },
  {
    n: "03",
    kicker: "작업지시서 시스템",
    title: "도식화와 지시서가 같은 버전",
    points: ["도식화 연결", "기본 스펙", "사이즈 스펙"],
    visual: "pack" as const,
  },
  {
    n: "04",
    kicker: "원부자재",
    title: "원단·부자재 기준을 한 BOM으로",
    points: ["원단 상세", "부자재 리스트", "발주 수량"],
    visual: "bom" as const,
  },
  {
    n: "05",
    kicker: "협업 & 언급",
    title: "코멘트를 레이어에 붙인다",
    points: ["@멘션", "코멘트", "수정 히스토리"],
    visual: "collab" as const,
  },
  {
    n: "06",
    kicker: "2D & 3D 목업",
    title: "핏을 2D와 3D에서 같은 기준으로",
    points: ["2D", "3D 전환", "목업 생성", "결과 이력"],
    visual: "mockup" as const,
  },
] as const;

const EXTRAS = [
  {
    title: "작업본은 암호화되어 남습니다",
    body: "시즌이 바뀌어도 같은 제품으로 이어집니다. 확정본과 작업본을 따로 모으지 않습니다.",
  },
  {
    title: "드라이브·BOM·생산 의뢰가 연결됩니다",
    body: "형태가 바뀌면 지시서와 발주 수량이 같은 제품 ID를 따릅니다.",
  },
] as const;

const STEPS = [
  {
    n: "01",
    kicker: "디자인 모드",
    title: "도식화 수정이 스펙을 밀어낸다.",
    body: "스케치, 실루엣, 디테일 수정을 같은 에디터에서 닫습니다. 별도 파일을 다시 붙이지 않습니다.",
  },
  {
    n: "02",
    kicker: "부자재 / POM",
    title: "POM과 BOM을 지시서 기준으로 고정한다.",
    body: "사이즈, 원단, 부자재, 치수를 한 스펙으로 둡니다. 담당자가 달라도 기준이 갈라지지 않습니다.",
  },
  {
    n: "03",
    kicker: "생산 의뢰하기",
    title: "공장에는 확정본만 넘긴다.",
    body: "같은 제품 데이터로 의뢰합니다. 구두 수정과 빠진 치수를 지시서 밖에서 처리하지 않습니다.",
  },
] as const;

const PLANS = [
  {
    id: "basic",
    name: "베이직",
    audience: "개인 작업용 기본 좌석",
    price: 0,
    billed: "",
    cta: "워크스페이스 열기",
    featured: false,
    bullets: [
      "10GB 스토리지",
      "디자인 에디터(제한)",
      "월 60 크레딧 · 2D 전용",
      "3D 목업 미지원",
      "도식화 템플릿 54개",
      "전체 에셋 사용",
    ],
  },
  {
    id: "pro",
    name: "프로",
    audience: "도식화·목업 사용량이 필요한 개인 플랜",
    price: 14900,
    billed: "월",
    cta: "이 플랜으로",
    featured: true,
    bullets: [
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
    id: "business",
    name: "비즈니스",
    audience: "지시서와 생산 의뢰까지 쓰는 실무 플랜",
    price: 39000,
    billed: "월",
    cta: "이 플랜으로",
    featured: false,
    bullets: [
      "100GB 스토리지",
      "확장된 디자인 에디터",
      "7일 체험 100 크레딧 · 이후 월 2,100 크레딧",
      "2D·3D 목업 생성",
      "도식화 템플릿 전체",
      "전체 에셋 사용",
      "미러모드(대칭)",
      "생산 의뢰하기",
    ],
  },
  {
    id: "team",
    name: "팀",
    audience: "같은 제품 위에서 좌석을 나누는 플랜",
    price: 59000,
    billed: "석/월",
    cta: "이 플랜으로",
    featured: false,
    note: "최소 2명부터 시작",
    bullets: [
      "100GB 스토리지 / 석",
      "확장된 디자인 에디터",
      "월 2,100 크레딧/석 · 팀 공용",
      "도식화 템플릿 전체",
      "전체 에셋 사용",
      "미러모드(대칭)",
      "생산 의뢰하기",
      "팀 워크스페이스 · 초대",
      "팀 메시지",
    ],
  },
] as const;

const FAQS = [
  {
    q: "도식화와 스펙은 같이 저장되나요?",
    a: "같은 제품에 붙습니다. 실루엣을 고치면 작업지시서·사이즈 스펙·BOM이 그 버전을 따릅니다.",
  },
  {
    q: "수정본은 어떻게 남나요?",
    a: "코멘트와 수정 히스토리가 제품에 쌓입니다. 레이어에 멘션을 남기면 메신저로 파일을 다시 보내지 않아도 됩니다.",
  },
  {
    q: "공장에는 어떤 화면이 보이나요?",
    a: "보기 전용 공유와 PDF 작업지시서로 나갑니다. 작업 파일과 확정본이 섞이지 않습니다.",
  },
  {
    q: "작업지시서는 어떤 형태로 나가나요?",
    a: "도식화, POM, BOM이 묶인 지시서를 작성하고 PDF로 보냅니다.",
  },
  {
    q: "팀 작업은 같은 제품에서 되나요?",
    a: "팀 플랜에서 워크스페이스를 나누고, 같은 제품 위에 멤버를 초대합니다.",
  },
  {
    q: "요금제는 작업 중에 바꿀 수 있나요?",
    a: "마이페이지에서 플랜을 바꾸거나 해지할 수 있습니다. 작업 중인 제품은 그대로 남습니다.",
  },
] as const;

const REVIEWS = [
  {
    role: "브랜드 디자이너",
    text: "도식화 고치고 지시서를 다시 그리는 시간이 빠졌습니다. 수정본이 제품에 남거든요.",
    tint: "rose" as const,
  },
  {
    role: "패턴실",
    text: "POM이 도식화와 어긋난 채 넘어오는 일이 줄었습니다. 치수 기준이 같은 자리에 있습니다.",
    tint: "peach" as const,
  },
  {
    role: "테크니컬 디자이너",
    text: "공장 공유는 보기 전용으로 나갑니다. 작업 파일과 전달본이 섞이지 않습니다.",
    tint: "mint" as const,
  },
] as const;

function formatWon(n: number) {
  return `₩${n.toLocaleString("ko-KR")}`;
}

function scrollToHash(id: string, behavior: ScrollBehavior = "smooth") {
  document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
}

function HashLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: `#${string}`;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState(null, "", href);
        scrollToHash(href.slice(1));
        onNavigate?.();
      }}
    >
      {children}
    </a>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [yearly, setYearly] = useState(true);
  const [faq, setFaq] = useState<number | null>(0);

  useEffect(() => {
    let node: HTMLElement | null = document.querySelector(".landing-page");
    while (node && node !== document.body) {
      const overflow = getComputedStyle(node).overflowY;
      if (overflow === "auto" || overflow === "scroll") break;
      node = node.parentElement;
    }
    const scroller = node && node !== document.body ? node : null;
    const read = () => setScrolled((scroller ? scroller.scrollTop : window.scrollY) > 8);
    read();
    const target: EventTarget = scroller ?? window;
    target.addEventListener("scroll", read, { passive: true });
    const hash = window.location.hash.slice(1);
    if (hash) requestAnimationFrame(() => scrollToHash(hash, "auto"));
    return () => target.removeEventListener("scroll", read);
  }, []);

  return (
    <div className="landing-page min-h-full">
      <header
        className={cn(
          "sticky top-0 z-30 w-full transition-colors",
          scrolled ? "border-b border-[var(--landing-line)] bg-[var(--landing-paper)]/88 backdrop-blur-md" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[64px] max-w-[1080px] items-center justify-between px-5">
          <Link href="/" aria-label="패딧 홈">
            <BrandLogo className="h-6" />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.href} href={item.href} className="landing-navlink">
                  {item.label}
                </Link>
              ) : (
                <HashLink key={item.href} href={item.href} className="landing-navlink">
                  {item.label}
                </HashLink>
              ),
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="landing-navlink hidden sm:inline">
              로그인
            </Link>
            <Link href="/dashboard" className="landing-pill !px-5 !py-2 text-[13px]">
              시작하기
            </Link>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-[var(--landing-line)] bg-[var(--landing-paper)] px-5 py-3 lg:hidden">
            <div className="flex flex-col">
              {NAV.map((item) =>
                item.href.startsWith("/") ? (
                  <Link key={item.href} href={item.href} className="py-2.5 text-[15px]" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                ) : (
                  <HashLink key={item.href} href={item.href} className="py-2.5 text-[15px]" onNavigate={() => setMenuOpen(false)}>
                    {item.label}
                  </HashLink>
                ),
              )}
              <Link href="/dashboard" className="py-2.5 text-[15px]" onClick={() => setMenuOpen(false)}>
                로그인
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="mx-auto flex max-w-[1120px] flex-col items-center px-5 pb-24 pt-[88px] text-center sm:pt-[100px] lg:pb-32 lg:pt-[112px]">
          <h1 className="landing-display max-w-[16ch] text-[40px] sm:text-[52px] lg:text-[58px]">
            <span className="landing-word" style={{ animationDelay: "40ms" }}>
              도식화와 작업지시서를
            </span>
            <span className="landing-word" style={{ animationDelay: "140ms" }}>
              한 제품 위에 둔다.
            </span>
          </h1>
          <p className="landing-sub mt-5 max-w-[36rem]">
            실루엣이 바뀌면 POM이 따라오고, 원부자재가 지시서에 남습니다.{" "}
            <br className="hidden sm:block" />
            공장에 넘기는 버전을 파일 밖으로 빼지 마세요.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/dashboard" className="landing-pill">
              워크스페이스 열기
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
            <Link href="/templates" className="landing-pill-ghost">
              도식화 템플릿 보기
            </Link>
          </div>
          <div className="mt-16 w-full sm:mt-20" aria-label="도식화 에디터 미리보기">
            <BrowserFrame title="패딧 도식화">
              <EditorPreview />
            </BrowserFrame>
          </div>
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {HERO_CHIPS.map((name) => (
              <li key={name} className="landing-chip">
                {name}
              </li>
            ))}
          </ul>
        </section>

        <section id="features" className="mx-auto max-w-[1080px] scroll-mt-20 px-5 pb-20 pt-8 lg:pb-28 lg:pt-12">
          <div className="text-center">
            <p className="landing-eyebrow">기능</p>
            <h2 className="landing-display mt-4 text-[32px] sm:text-[40px]">한 제품에 붙는 작업들</h2>
            <p className="landing-sub mx-auto mt-3 max-w-[42ch]">
              도식화, 작업지시서, 원부자재, 목업. 시즌 폴더가 아니라 제품 단위로 묶습니다.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5">
            {FEATURES.map((item) => (
              <article key={item.n} className="landing-feature">
                <div className="px-6 pb-2 pt-6">
                  <p className="text-[12px] tracking-[0.08em] text-[var(--landing-muted)]">
                    {item.n} / {item.kicker}
                  </p>
                  <h3 className="mt-2 text-[18px] font-medium tracking-[-0.03em]">{item.title}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {item.points.map((point) => (
                      <li key={point} className="rounded-full bg-[var(--landing-paper)] px-2.5 py-1 text-[12px] text-[var(--landing-muted)]">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <Link href="/dashboard" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium">
                    열기
                    <ArrowRight size={13} strokeWidth={1.8} />
                  </Link>
                </div>
                <div className="landing-feature-stage">
                  <FeatureVisual kind={item.visual} />
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {EXTRAS.map((item) => (
              <article key={item.title} className="landing-extra text-left">
                <h4 className="text-[17px] font-medium tracking-[-0.03em]">{item.title}</h4>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--landing-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="landing-dark px-5 py-20 lg:py-28">
          <div className="mx-auto max-w-[1080px]">
            <p className="landing-eyebrow">워크플로우</p>
            <h2 className="landing-display mt-4 max-w-[16ch] text-[32px] sm:text-[40px]">
              디자인에서 생산 의뢰까지, 같은 데이터로.
            </h2>
            <p className="landing-sub mt-4 max-w-[38rem] !text-white/55">
              지시서에 없는 수정을 메신저로 보내지 않습니다.{" "}
              <br className="hidden sm:block" />
              형태, 치수, 원부자재가 한 흐름으로 공장에 갑니다.
            </p>
            <div className="mt-12 grid gap-3 lg:grid-cols-3">
              {STEPS.map((step) => (
                <article key={step.n} className="landing-dark-card">
                  <div>
                    <p className="text-[12px] tracking-[0.14em] text-white/45">
                      {step.n}
                      <span className="ml-2 tracking-normal">{step.kicker}</span>
                    </p>
                    <h3 className="mt-4 text-[20px] font-medium tracking-[-0.03em]">{step.title}</h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-white/55">{step.body}</p>
                  </div>
                  <div className="mt-8 flex justify-center text-[var(--landing-paper)]">
                    <StepVisual n={step.n} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-[1080px] scroll-mt-20 px-5 py-20 text-center lg:py-28">
          <p className="landing-eyebrow">요금제</p>
          <h2 className="landing-display mt-4 text-[32px] sm:text-[40px]">작업량과 좌석에 맞는 플랜</h2>
          <p className="landing-sub mx-auto mt-3 max-w-[42ch]">개인 작업부터 팀 워크스페이스까지. 용량과 크레딧만 올리면 됩니다.</p>
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-[var(--landing-line)] bg-[var(--landing-card)] p-1 text-[13px]">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn("rounded-full px-4 py-1.5", !yearly ? "bg-[var(--landing-ink)] text-[var(--landing-paper)]" : "text-[var(--landing-muted)]")}
            >
              월간
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn("rounded-full px-4 py-1.5", yearly ? "bg-[var(--landing-ink)] text-[var(--landing-paper)]" : "text-[var(--landing-muted)]")}
            >
              연간 20% 절약
            </button>
          </div>
          <div className="mt-12 grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan) => (
              <article key={plan.id} className="landing-price">
                <h3 className="text-[20px] font-medium tracking-[-0.03em]">{plan.name}</h3>
                <p className="mt-2 min-h-[40px] text-[13px] leading-snug text-[var(--landing-muted)]">{plan.audience}</p>
                <p className="mt-6 text-[32px] font-medium tracking-[-0.04em]">
                  {plan.price === 0 ? "무료" : formatWon(plan.price)}
                  {plan.billed ? <span className="ml-1 text-[13px] font-normal text-[var(--landing-muted)]">/{plan.billed}</span> : null}
                </p>
                {"note" in plan && plan.note && <p className="mt-1 text-[11px] text-[var(--landing-muted)]">{plan.note}</p>}
                <ul className="mt-6 flex-1 space-y-2.5 text-left text-[13px]">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <Check size={14} strokeWidth={2} className="mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className={cn(
                    "mt-8 inline-flex w-full items-center justify-center rounded-full py-2.5 text-[13px] font-medium",
                    plan.featured
                      ? "bg-[var(--landing-ink)] text-[var(--landing-paper)]"
                      : "border border-[var(--landing-line)] bg-[var(--landing-paper)]",
                  )}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
          <HashLink href="#pricing" className="mt-8 inline-flex text-[14px] text-[var(--landing-muted)]">
            요금제 상세보기
          </HashLink>
        </section>

        <section id="guide" className="mx-auto max-w-[1080px] scroll-mt-20 px-5 py-20 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-[720px]">
              <h2 className="landing-display max-w-[14ch] text-[32px] sm:text-[40px]">
                좋은 기준은,
                <br />
                다시 꺼내 볼 수 있어야 하니까.
              </h2>
              <p className="landing-sub mt-4 max-w-[40rem]">
                작업지시서, 도식화, 부자재, 발주. 막히는 지점만 짧게 정리했습니다.
              </p>
            </div>
            <Link href="/library" className="landing-pill shrink-0 self-start lg:self-auto">
              서비스 가이드 보기
              <ArrowRight size={15} strokeWidth={1.8} />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {REVIEWS.map((item) => (
              <blockquote key={item.role} className={cn("landing-guide", `landing-guide-${item.tint}`)}>
                <p className="text-[16px] leading-[1.55] tracking-[-0.02em]">“{item.text}”</p>
                <footer className="mt-8 text-[13px] font-medium not-italic">{item.role}</footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-[720px] scroll-mt-20 px-5 py-20 lg:py-28">
          <div className="text-center">
            <p className="landing-eyebrow">자주 묻는 질문</p>
            <h2 className="landing-display mt-4 text-[32px] sm:text-[40px]">자주 묻는 질문</h2>
            <p className="landing-sub mt-3">버전, 공유, 스펙 동기화에 대한 답입니다.</p>
          </div>
          <div className="mt-10">
            {FAQS.map((item, i) => {
              const open = faq === i;
              return (
                <div key={item.q} className="border-b border-[var(--landing-line)]">
                  <button
                    type="button"
                    onClick={() => setFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="text-[15px] font-medium tracking-[-0.02em]">{item.q}</span>
                    <ChevronDown size={16} className={cn("shrink-0 text-[var(--landing-muted)] transition", open && "rotate-180")} />
                  </button>
                  {open && <p className="pb-4 text-[14px] leading-relaxed text-[var(--landing-muted)]">{item.a}</p>}
                </div>
              );
            })}
          </div>
        </section>

        <section className="landing-cta-band px-5 py-16 md:py-20">
          <div className="mx-auto max-w-[1080px] text-center">
            <h2 className="landing-display text-[32px] sm:text-[40px]">진행 중인 제품부터 옮기세요</h2>
            <p className="mx-auto mt-4 max-w-[36rem] text-[16px] leading-relaxed text-white/55 sm:text-[18px]">
              템플릿으로 실루엣을 열거나, 워크스페이스에서 지금 시즌 작업을 이어서 하세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/templates" className="landing-pill-invert">
                도식화 템플릿 열기
                <ArrowRight size={15} strokeWidth={1.8} />
              </Link>
              <Link href="/templates" className="landing-pill-ghost">
                작업지시서 템플릿 보기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--landing-line)]">
        <div className="mx-auto grid max-w-[1080px] gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <p className="text-[13px] font-medium">서비스</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--landing-muted)]">
              <li>
                <HashLink href="#features">파일 & 폴더</HashLink>
              </li>
              <li>
                <HashLink href="#features">도식화 에디터</HashLink>
              </li>
              <li>
                <HashLink href="#features">작업지시서 시스템</HashLink>
              </li>
              <li>
                <HashLink href="#features">원부자재</HashLink>
              </li>
              <li>
                <HashLink href="#features">협업 & 언급</HashLink>
              </li>
              <li>
                <HashLink href="#features">2D & 3D 목업</HashLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-medium">템플릿</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--landing-muted)]">
              <li>
                <Link href="/templates">무료</Link>
              </li>
              <li>
                <Link href="/templates">도식화 템플릿</Link>
              </li>
              <li>
                <Link href="/templates">작업지시서 템플릿</Link>
              </li>
              <li>
                <Link href="/library">에셋</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-medium">요금제</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--landing-muted)]">
              <li>
                <HashLink href="#pricing">요금제 상세보기</HashLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-medium">콘텐츠</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--landing-muted)]">
              <li>
                <Link href="/library">서비스 가이드</Link>
              </li>
              <li>
                <HashLink href="#guide">패션 인사이트</HashLink>
              </li>
              <li>
                <HashLink href="#guide">회사 소식</HashLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-[13px] font-medium">고객지원</p>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--landing-muted)]">
              <li>
                <HashLink href="#faq">지원센터</HashLink>
              </li>
              <li>
                <HashLink href="#faq">업데이트 노트</HashLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-[1080px] space-y-1.5 px-5 pb-16 text-[12px] leading-relaxed text-[var(--landing-muted)]">
          <p className="font-medium text-[var(--landing-ink)]">주식회사 패딧</p>
          <p>사업자등록번호 : 521-87-03693 | 대표 : 최성락 | 02 - 3394 - 6141 평일 (09:00 - 18:00)</p>
          <p>주소 : 서울특별시 동대문구 망우로 46, DDM워크센터 4호</p>
          <p>통신판매업: 2026-서울동대문-0106</p>
          <p className="pt-3">© 2026 Faddit, All Rights Reserved · 개인정보처리방침 | 이용약관 | 환불정책</p>
        </div>
      </footer>
    </div>
  );
}

function BrowserFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="landing-frame">
      <div className="flex items-center gap-3 border-b border-[var(--landing-line)] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-[#e4ddd4]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#e4ddd4]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#e4ddd4]" />
        </span>
        <span className="mx-auto max-w-[220px] truncate rounded-full bg-[var(--landing-card)] px-3 py-1 text-center text-[11px] text-[var(--landing-muted)]">
          {title}
        </span>
        <span className="w-10" />
      </div>
      <div className="bg-[var(--landing-paper)]">{children}</div>
    </div>
  );
}

function EditorPreview() {
  return (
    <div className="grid min-h-[280px] grid-cols-[48px_1fr] sm:min-h-[420px] lg:grid-cols-[52px_1fr_168px]">
      <aside className="flex flex-col items-center gap-3 border-r border-[var(--landing-line)] py-5 text-[var(--landing-muted)]">
        <MousePointer2 size={15} strokeWidth={1.7} />
        <PenTool size={15} strokeWidth={1.7} />
        <Square size={15} strokeWidth={1.7} />
        <Type size={15} strokeWidth={1.7} />
      </aside>
      <div className="relative flex items-center justify-center overflow-hidden px-6 py-8">
        <svg viewBox="0 0 420 280" className="h-[200px] w-full max-w-[420px] sm:h-[260px]" aria-hidden>
          <path
            d="M48 210C92 188 118 92 168 78c46-13 62 54 108 48 38-5 62-48 104-40"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="168" cy="78" r="4.5" fill="currentColor" />
          <circle cx="276" cy="126" r="4.5" fill="currentColor" />
        </svg>
        <div className="pointer-events-none absolute bottom-6 right-8 hidden h-[120px] w-[108px] text-[var(--landing-ink)] sm:block">
          <FlatThumb category="hoodie" />
        </div>
      </div>
      <aside className="hidden border-l border-[var(--landing-line)] p-4 text-left lg:block">
        <p className="text-[11px] tracking-[0.12em] text-[var(--landing-muted)]">레이어</p>
        <ul className="mt-3 space-y-2 text-[12px]">
          {["Hood", "Body", "Sleeve", "Rib"].map((layer, i) => (
            <li key={layer} className={cn("rounded-lg px-2.5 py-1.5", i === 1 ? "bg-[var(--landing-card)] font-medium" : "text-[var(--landing-muted)]")}>
              {layer}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function StepVisual({ n }: { n: string }) {
  if (n === "02") {
    return (
      <div className="w-full max-w-[220px] space-y-1.5">
        <SpecRow label="POM" value="CB Length" dark />
        <SpecRow label="원단" value="Fleece 420g" dark />
        <SpecRow label="발주" value="300" dark />
      </div>
    );
  }
  if (n === "03") {
    return (
      <div className="grid w-full max-w-[230px] grid-cols-3 gap-2">
        {["FLAT", "SIZE", "BOM"].map((label) => (
          <div
            key={label}
            className="flex aspect-[3/4] items-center justify-center rounded-[14px] border border-white/12 bg-white/5 text-[10px] tracking-[0.14em] text-white/50"
          >
            {label}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="h-[132px] w-[118px]">
      <FlatThumb category="hoodie" />
    </div>
  );
}

function FeatureVisual({ kind }: { kind: (typeof FEATURES)[number]["visual"] }) {
  if (kind === "editor" || kind === "mockup") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-[150px] w-[132px] text-[var(--landing-ink)]">
          <FlatThumb category={kind === "mockup" ? "jacket" : "hoodie"} />
        </div>
      </div>
    );
  }
  if (kind === "pack") {
    return (
      <div className="grid h-full grid-cols-3 items-center gap-2 px-4">
        {["FLAT", "SIZE", "BOM"].map((label) => (
          <div
            key={label}
            className="flex aspect-[3/4] items-center justify-center rounded-[14px] border border-[var(--landing-line)] bg-[var(--landing-paper)] text-[10px] tracking-[0.14em] text-[var(--landing-muted)]"
          >
            {label}
          </div>
        ))}
      </div>
    );
  }
  if (kind === "bom") {
    return (
      <div className="mx-auto w-full max-w-[230px] space-y-1.5">
        <SpecRow label="원단" value="Cotton 20s" />
        <SpecRow label="부자재" value="리브 2×2" />
        <SpecRow label="발주" value="300" />
      </div>
    );
  }
  if (kind === "collab") {
    return (
      <div className="mx-auto w-full max-w-[240px] rounded-[16px] border border-[var(--landing-line)] bg-[var(--landing-paper)] px-4 py-5 text-left">
        <p className="text-[11px] text-[var(--landing-muted)]">@패턴실 · 코멘트</p>
        <p className="mt-2 text-[13px] leading-snug">CB Length 1.2cm. 이번 버전 지시서에 반영.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-[250px] overflow-hidden rounded-[16px] border border-[var(--landing-line)] bg-[var(--landing-paper)]">
      {["26SS-HD-01  후디", "26SS-TS-04  티셔츠", "26SS-PT-02  팬츠"].map((row) => (
        <p key={row} className="border-b border-[var(--landing-line)] px-3 py-2.5 text-left text-[12px] last:border-0">
          {row}
        </p>
      ))}
    </div>
  );
}

function SpecRow({ label, value, dark }: { label: string; value: string; dark?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-3 py-2 text-[12px]",
        dark ? "bg-white/8" : "bg-[var(--landing-paper)]",
      )}
    >
      <span className={dark ? "text-white/45" : "text-[var(--landing-muted)]"}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
