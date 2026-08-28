"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { fetchFactoriesFromDB, Factory } from "@/lib/factoryCatalog";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import Link from "next/link";

function getCardFabricsById(factories: Factory[]) {
  const colors = [
    { color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
    { color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
  ] as const;
  return Object.fromEntries(
    factories.map((f, idx) => {
      const labels = [f.factory_type, f.main_fabrics]
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, 2);
      return [
        f.id ?? idx,
        labels.map((label, chipIndex) => ({ label, ...colors[chipIndex % colors.length] })),
      ];
    })
  );
}

const CARD_COUNT = 10;
const VISIBLE_COUNT = 4;

// 공장 이미지 카드 컴포넌트
function FactoryImageCard({ factory, idx }: { factory: Factory; idx: number }) {
  const { images, loading } = useFactoryImages(factory);
  
  return (
    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg sm:rounded-t-xl group">
      {loading ? (
        <div className="text-gray-400 text-sm font-medium">
          이미지 로딩 중...
        </div>
      ) : images.length > 0 && images[0] !== '/logo_donggori.png' ? (
        <Image
          src={images[0]}
          alt={typeof factory.company_name === 'string' ? factory.company_name : '공장 이미지'}
          className="object-cover w-full h-full rounded-t-lg sm:rounded-t-xl group-hover:scale-110 transition-transform duration-300"
          width={400}
          height={192}
          priority={idx < 4}
          unoptimized
        />
      ) : (
        <div className="text-gray-400 text-sm font-medium">
          이미지 준비 중
        </div>
      )}
    </div>
  );
}

const InfoSection = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [slideIdx, setSlideIdx] = useState(VISIBLE_COUNT); // 시작은 복제 앞쪽 끝
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 무한루프용: 앞뒤로 복제
  const getLoopedFactories = () => {
    if (factories.length === 0) return [];
    return [
      ...factories.slice(-VISIBLE_COUNT),
      ...factories,
      ...factories.slice(0, VISIBLE_COUNT)
    ];
  };
  const loopedFactories = getLoopedFactories();
  const total = factories.length;

  useEffect(() => {
    fetchFactoriesFromDB().then((data) => {
      // 이미지가 있는 업장들만 필터링 (로고 이미지 제외)
      const factoriesWithImages = data.filter(factory => 
        factory.images && 
        factory.images.length > 0 && 
        factory.images[0] !== '/logo_donggori.png' &&
        !factory.images[0].includes('logo_donggori')
      );
      
      // 이미지가 있는 업장이 CARD_COUNT보다 적으면 모든 업장 사용
      const factoriesToShow = factoriesWithImages.length >= CARD_COUNT 
        ? factoriesWithImages.slice(0, CARD_COUNT)
        : data.slice(0, CARD_COUNT);
      
      setFactories(factoriesToShow);
    });
  }, []);

  // 슬라이드 자동 이동
  useEffect(() => {
    if (total === 0) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsTransitioning(true);
      setSlideIdx((prev) => prev + 1);
    }, 3000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [slideIdx, total]);

  // 무한루프 효과: 끝에 도달하면 transition 없이 jump
  useEffect(() => {
    if (slideIdx === total + VISIBLE_COUNT) {
      setTimeout(() => {
        setIsTransitioning(false); // transition off
        setSlideIdx(VISIBLE_COUNT);
      }, 700);
    } else if (slideIdx === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideIdx(total);
      }, 700);
    } else {
      setIsTransitioning(true); // 항상 이동 시에는 transition on
    }
  }, [slideIdx, total]);

  const cardFabricsById = getCardFabricsById(loopedFactories);

  const getTranslateX = () => {
    return `-${slideIdx * 25}%`;
  };

  return (
    <section className="w-full bg-[#f6f7fb] py-10 sm:py-12 md:py-16 lg:py-20">
      <div className={PAGE_CONTAINER_CLASS}>
        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-10 xl:gap-14 lg:items-center">
          {/* 캐러셀 — 모바일·태블릿 상단, 데스크탑 우측 */}
          <div className="order-1 lg:order-2 w-full overflow-hidden py-1 lg:py-0">
            <div className="hidden lg:block overflow-hidden">
              <div
                className={`flex gap-4 ${isTransitioning ? "transition-transform duration-700 ease-in-out" : ""}`}
                style={{ transform: `translateX(${getTranslateX()})` }}
              >
                {loopedFactories.map((f, idx) => {
                  const displayName = typeof f.name === "string" && f.name
                    ? f.name
                    : typeof f.company_name === "string" && f.company_name
                      ? f.company_name
                      : "이름 없음";
                  const mainItems = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt]
                    .filter((v) => typeof v === "string" && v.length > 0)
                    .join(", ") || "-";
                  const randomFabrics = cardFabricsById[f.id ?? idx] || [];
                  return (
                    <Link
                      href={`/factories/${f.id}`}
                      key={`${f.id ?? "noid"}-${idx}`}
                      className="rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer w-[calc(25%-12px)] flex-shrink-0 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                    >
                      <FactoryImageCard factory={f} idx={idx} />
                      <div className="flex-1 flex flex-col px-3 sm:px-4 py-4 text-left">
                        <div className="flex flex-wrap gap-1 mb-2">
                          {randomFabrics.map((chip, chipIndex) => (
                            <span
                              key={`fabric-${chipIndex}-${chip.label}`}
                              style={{ color: chip.color, background: chip.bg }}
                              className="rounded-full px-2 py-1 text-xs font-semibold"
                            >
                              {chip.label}
                            </span>
                          ))}
                        </div>
                        <div className="font-bold text-sm mb-1 text-left">{displayName}</div>
                        <div className="text-xs font-bold mb-1 flex items-start text-[#333]/60">
                          <span className="shrink-0 mr-1">주요품목</span>
                          <span className="font-normal flex-1 truncate">{mainItems}</span>
                        </div>
                        <div className="text-xs font-bold text-left text-[#333]/60">
                          MOQ{" "}
                          <span className="font-normal">
                            {typeof f.moq === "number"
                              ? f.moq
                              : typeof f.moq === "string" && !isNaN(Number(f.moq))
                                ? Number(f.moq)
                                : typeof f.minOrder === "number"
                                  ? f.minOrder
                                  : "-"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 모바일·태블릿: 가로 스크롤 카드 */}
            <div className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 w-max pb-1">
                {factories.slice(0, 6).map((f, idx) => {
                  const displayName = f.name || f.company_name || "이름 없음";
                  return (
                    <Link
                      href={`/factories/${f.id}`}
                      key={f.id}
                      className="w-[200px] shrink-0 rounded-xl border border-gray-100 overflow-hidden bg-white hover:shadow-md transition-shadow"
                    >
                      <FactoryImageCard factory={f} idx={idx} />
                      <div className="p-3">
                        <p className="font-bold text-sm text-gray-900 truncate">{displayName}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 텍스트 + CTA — 모바일 하단, 데스크탑 좌측 */}
          <div className="order-2 lg:order-1 flex flex-col items-start text-left mt-6 lg:mt-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight tracking-tight">
              조건에 맞는
              <br />
              봉제공장 찾기
            </h2>
            <p className="mt-3 md:mt-4 text-sm md:text-base text-gray-500 leading-relaxed max-w-sm">
              지역, 생산 품목, 최소 주문 수량 등을 비교해 적합한 공장을 찾아보세요.
            </p>
            <Link
              href="/matching"
              className="mt-6 md:mt-8 inline-flex items-center gap-2 bg-[#111] text-white px-6 py-3 rounded-full font-semibold text-sm md:text-base hover:bg-black transition-colors"
            >
              봉제공장 매칭받기
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white/15">
                <span className="text-sm">→</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
