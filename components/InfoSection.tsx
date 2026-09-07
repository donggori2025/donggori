"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { factories as fallbackFactories, fetchFactoriesFromDB, type Factory } from "@/lib/factories";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

const CARD_COUNT = 10;
const VISIBLE = 3.35;
const GAP_PX = 16;

function getCardFabricsById(list: Factory[]) {
  const fabricChips = [
    { label: "봉제", color: "#0ACF83", bg: "rgba(10, 207, 131, 0.1)" },
    { label: "샘플", color: "#08B7FF", bg: "rgba(8, 183, 255, 0.1)" },
    { label: "패턴", color: "#FF8308", bg: "rgba(255, 131, 8, 0.1)" },
    { label: "나염", color: "#A259FF", bg: "rgba(162, 89, 255, 0.1)" },
    { label: "전사", color: "#ED6262", bg: "rgba(237, 98, 98, 0.1)" },
  ];
  return Object.fromEntries(
    list.map((f, idx) => {
      const seed = String(f.id ?? idx);
      let hash = 0;
      for (let i = 0; i < seed.length; i++) hash = (hash << 5) - hash + seed.charCodeAt(i);
      const shuffled = [...fabricChips].sort((a, b) => {
        const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
        const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
        return h1 - h2;
      });
      return [f.id ?? idx, shuffled.slice(0, (Math.abs(hash) % 2) + 1)];
    }),
  );
}

function FactoryImageCard({ factory, idx }: { factory: Factory; idx: number }) {
  const { images, loading } = useFactoryImages(factory);
  const fallback = factory.images?.[0] || factory.image;

  return (
    <div className="group flex h-44 w-full items-center justify-center overflow-hidden bg-gray-100 sm:h-48">
      {loading && !fallback ? (
        <div className="text-sm font-medium text-gray-400">이미지 로딩 중...</div>
      ) : (images[0] && images[0] !== "/logo_donggori.png") || fallback ? (
        <Image
          src={(images[0] && images[0] !== "/logo_donggori.png" ? images[0] : fallback) as string}
          alt={typeof factory.company_name === "string" ? factory.company_name : "공장 이미지"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          width={400}
          height={192}
          priority={idx < 4}
          unoptimized
        />
      ) : (
        <div className="text-sm font-medium text-gray-400">이미지 준비 중</div>
      )}
    </div>
  );
}

const InfoSection = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [paused, setPaused] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchFactoriesFromDB()
      .then((data) => {
        const withImages = data.filter(
          (factory) =>
            (factory.images && factory.images.length > 0 && !factory.images[0].includes("logo_donggori")) ||
            (factory.image && !String(factory.image).includes("logo_donggori")),
        );
        const source = withImages.length > 0 ? withImages : data.length > 0 ? data : fallbackFactories;
        setFactories(source.slice(0, CARD_COUNT));
      })
      .catch(() => {
        setFactories(fallbackFactories.slice(0, CARD_COUNT));
      });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => {
      const styles = window.getComputedStyle(el);
      const padX =
        (Number.parseFloat(styles.paddingLeft) || 0) +
        (Number.parseFloat(styles.paddingRight) || 0);
      setCardWidth((el.clientWidth - padX - GAP_PX * Math.floor(VISIBLE - 1)) / VISIBLE);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [factories.length]);

  const maxIdx = Math.max(0, factories.length - Math.floor(VISIBLE));
  const fabricsById = getCardFabricsById(factories);
  const safeIdx = Math.min(slideIdx, maxIdx);
  const translateX = cardWidth > 0 ? -(safeIdx * (cardWidth + GAP_PX)) : 0;

  useEffect(() => {
    if (factories.length <= 1 || paused || cardWidth === 0) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev >= maxIdx ? 0 : prev + 1));
    }, 3200);
    return () => window.clearInterval(timer);
  }, [factories.length, paused, cardWidth, maxIdx]);

  return (
    <section className="dg-section w-full bg-white">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-center lg:gap-10 xl:gap-14">
          <div className="order-2 flex flex-col items-start text-left lg:order-1">
            <h2 className="dg-section-title">
              70+ 개의 인증된
              <br />
              고퀄리티 봉제공장
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-gray-500 md:mt-4 md:text-base">
              동고리는 70개 이상의 봉제공장과 3개 패션봉제협회 품질인증을 통해 고퀄리티 봉제를 약속합니다.
            </p>
            <Link
              href="/matching"
              className="mt-6 inline-flex items-center gap-3 rounded-md bg-dg-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black md:mt-8"
            >
              봉제공장 매칭받기
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-sm">→</span>
            </Link>
          </div>

          <div className="order-1 w-full min-w-0 lg:order-2">
            <div
              ref={viewportRef}
              className="relative hidden overflow-hidden py-3 md:block"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {factories.length === 0 ? (
                <div className="grid grid-cols-3 gap-4 px-1">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-72 animate-pulse rounded-xl bg-gray-50" />
                  ))}
                </div>
              ) : (
                <div
                  className="flex px-1 transition-transform duration-700 ease-out"
                  style={{ gap: GAP_PX, transform: `translateX(${translateX}px)` }}
                >
                  {factories.map((factory, idx) => {
                    const displayName = factory.name || factory.company_name || "이름 없음";
                    const mainItems =
                      [factory.top_items_upper, factory.top_items_lower, factory.top_items_outer, factory.top_items_dress_skirt]
                        .filter((v) => typeof v === "string" && v.length > 0)
                        .join(", ") || "-";
                    const chips = fabricsById[factory.id ?? idx] || [];
                    return (
                      <Link
                        key={factory.id ?? idx}
                        href={`/factories/${factory.id}`}
                        className="flex shrink-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.07)]"
                        style={{ width: cardWidth || undefined }}
                      >
                        <FactoryImageCard factory={factory} idx={idx} />
                        <div className="flex flex-1 flex-col px-3 py-4 sm:px-4">
                          <div className="mb-2 flex flex-wrap gap-1">
                            {chips.map((chip) => (
                              <span
                                key={chip.label}
                                style={{ color: chip.color, background: chip.bg }}
                                className="rounded-full px-2 py-1 text-xs font-semibold"
                              >
                                {chip.label}
                              </span>
                            ))}
                          </div>
                          <div className="mb-1 text-sm font-bold">{displayName}</div>
                          <div className="mb-1 flex items-start text-xs font-bold text-[#333]/60">
                            <span className="mr-1 shrink-0">주요품목</span>
                            <span className="flex-1 truncate font-normal">{mainItems}</span>
                          </div>
                          <div className="text-xs font-bold text-[#333]/60">
                            MOQ{" "}
                            <span className="font-normal">
                              {typeof factory.moq === "number"
                                ? factory.moq
                                : typeof factory.minOrder === "number"
                                  ? factory.minOrder
                                  : "-"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="-mx-4 overflow-x-auto px-4 py-2 scrollbar-hide md:hidden">
              <div className="flex w-max gap-3 pb-1">
                {factories.map((factory, idx) => (
                  <Link
                    key={factory.id ?? idx}
                    href={`/factories/${factory.id}`}
                    className="w-[72vw] max-w-[250px] shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03]"
                  >
                    <FactoryImageCard factory={factory} idx={idx} />
                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-gray-900">
                        {factory.name || factory.company_name || "이름 없음"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {factories.length > 1 && (
              <div className="mt-5 hidden items-center justify-end gap-2 md:flex">
                <button
                  type="button"
                  aria-label="이전"
                  onClick={() => setSlideIdx((prev) => (prev <= 0 ? maxIdx : prev - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="다음"
                  onClick={() => setSlideIdx((prev) => (prev >= maxIdx ? 0 : prev + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
