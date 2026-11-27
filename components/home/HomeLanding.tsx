"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import {
  MdOutlineDesignServices,
  MdOutlineVisibility,
  MdOutlinePeopleAlt,
  MdOutlineHandshake,
} from "react-icons/md";
import { fetchFactoriesFromDB, type Factory } from "@/lib/factoryCatalog";
import { hasFactoryImages } from "@/lib/factoryImages";
import { serviceFaq } from "@/lib/serviceFaq";
import MatchingTicker from "./MatchingTicker";
import DirectoryTour from "./DirectoryTour";
import FactoryPrompt from "@/components/FactoryPrompt";
import FactoryMap from "./FactoryMap";
import FactoryPortraits from "./FactoryPortraits";
import { NewsDesk } from "./PortalNews";
import { useCountTransition } from "./useCountTransition";

// 조회수·방문자는 운영성과보고서(2026-11-23) 2쪽의 반올림 수치, 디자이너 가입수는 별도 제공 수치.
const usageMetrics = [
  { label: "전체 페이지 조회수", unit: "회", figure: 35000, Icon: MdOutlineVisibility },
  { label: "홈페이지 방문자", unit: "명", figure: 6700, Icon: MdOutlinePeopleAlt },
  { label: "매칭 페이지 방문자", unit: "명", figure: 1700, Icon: MdOutlineHandshake },
  { label: "디자이너 가입수", unit: "명", figure: 500, Icon: MdOutlineDesignServices },
] as const;
const countFormat = new Intl.NumberFormat("ko-KR");

const usageTotals = usageMetrics.map(({ figure }) => figure);
function UsageStats() {
  const { ref, values } = useCountTransition<HTMLElement>(usageTotals);

  return (
    <section ref={ref} className="pg-usage-section" aria-label="동고리 이용 통계">
      <dl className="site-wide pg-usage">
        {usageMetrics.map(({ label, unit, figure, Icon }, i) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <Icon aria-hidden="true" />
              <span className="sr-only">약 {countFormat.format(figure)}{unit}</span>
              <span className="pg-usage-value" aria-hidden="true">
                <span className="pg-usage-digits" data-final={countFormat.format(figure)}>
                  <span>{countFormat.format(values[i])}</span>
                </span><span className="pg-usage-unit">{unit}</span><small>++</small>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function HomeLanding() {
  const landing = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState<Factory[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    if (!landing.current || !("IntersectionObserver" in window)) return;
    const sections = landing.current.querySelectorAll<HTMLElement>(":scope > section, :scope > .pg-entry > section");
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-reveal", "shown");
        observer.unobserve(entry.target);
      }
    });
    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight) continue;
      section.dataset.reveal = "waiting";
      observer.observe(section);
    }
    return () => {
      observer.disconnect();
      for (const section of sections) delete section.dataset.reveal;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    fetchFactoriesFromDB(controller.signal)
      .then((factories) => {
        factories.sort((a, b) =>
          Number(hasFactoryImages(b)) - Number(hasFactoryImages(a))
          || (a.company_name || a.name).localeCompare(b.company_name || b.name, "ko")
        );
        setRows(factories);
        setStatus("ready");
      })
      .catch(() => { if (!controller.signal.aborted) setStatus("error"); });
    return () => controller.abort();
  }, []);

  return (
    <div className="pg-page" ref={landing}>
      <a className="civic-skip" href="#pg-search">
        제작 조건 검색으로 이동
      </a>
      <div className="pg-entry">
        <section className="pg-search" aria-labelledby="pg-search-title">
          <h1 id="pg-search-title">
            옷을 만들땐<br />
            이곳 <span className="pg-search-brand">동고리에서</span> 찾으세요!
          </h1>
          <div className="pg-prompt-stage">
            <FactoryPrompt inputId="pg-search" />
          </div>
        </section>
        <FactoryPortraits rows={rows} />
      </div>
      <UsageStats />
      <MatchingTicker />
      <DirectoryTour rows={rows} status={status} />
      <FactoryMap rows={rows} status={status} />
      <NewsDesk />
      <section id="pg-faq" className="pg-faq" aria-labelledby="pg-faq-title">
        <div className="pg-wide grid items-start gap-6 md:grid-cols-[1fr_2fr] md:gap-12">
          <div>
            <h2 id="pg-faq-title">자주 묻는 질문</h2>
            <Link href="/service" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
              서비스 이용안내 <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="pg-faq-list divide-y divide-dg-line border-y border-dg-line">
            {serviceFaq.map(([question, answer]) => (
              <details key={question} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 font-semibold md:text-lg">
                  {question}
                  <ChevronDown size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
                </summary>
                <p className="max-w-prose pb-5 pr-6 leading-relaxed text-dg-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
