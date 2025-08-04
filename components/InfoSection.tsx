import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { fetchFactoriesFromDB, Factory } from "@/lib/factories";
import Link from "next/link";

function getCardFabricsById(factories: Factory[]) {
  const fabricChips = [
    { label: '봉제', color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
    { label: '샘플', color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
    { label: '패턴', color: '#FF8308', bg: 'rgba(255, 131, 8, 0.1)' },
    { label: '나염', color: '#A259FF', bg: 'rgba(162, 89, 255, 0.1)' },
    { label: '전사', color: '#ED6262', bg: 'rgba(237, 98, 98, 0.1)' },
  ];
  return Object.fromEntries(
    factories.map((f, idx) => {
      const seed = String(f.id ?? idx);
      let hash = 0;
      for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      const shuffled = [...fabricChips].sort((a, b) => {
        const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
        const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
        return h1 - h2;
      });
      const count = (Math.abs(hash) % 2) + 1;
      return [f.id ?? idx, shuffled.slice(0, count)];
    })
  );
}



const CARD_COUNT = 10;
const VISIBLE_COUNT = 4;

const InfoSection = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [slideIdx, setSlideIdx] = useState(VISIBLE_COUNT); // 시작은 복제 앞쪽 끝
  const [isTransitioning, setIsTransitioning] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          {/* 상단: 정보 섹션 */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">70+ 개의 인증된 고퀄리티 봉제공장</h2>
            <p className="text-base sm:text-lg text-gray-500 mb-4 sm:mb-6 px-4 sm:px-0">
              동고리는 70개 이상의 봉제공장 있으며 3곳의 패션봉제협회의 품질인증을 받은 고퀄리티의 봉제를 약속드립니다.
            </p>
            <Link href="/matching" className="inline-flex items-center bg-neutral-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-[1000px] font-bold text-base sm:text-lg hover:bg-neutral-500 transition-all duration-300 shadow-none gap-2 mx-auto w-fit relative overflow-hidden group hover:scale-105">
              <span className="relative z-10">봉제공장 매칭받기</span>
              <span className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full bg-white relative z-10">
                <span className="text-sm sm:text-base text-black">→</span>
              </span>
              {/* 강화된 Glow 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[1000px] animate-enhanced-glow blur-sm opacity-70"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-[1000px] animate-enhanced-glow blur-md scale-110 opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 rounded-[1000px] animate-enhanced-glow blur-lg scale-125 opacity-30"></div>
              {/* 호버 시 추가 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-[1000px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              {/* 레인보우 glow 효과 */}
              <div className="absolute inset-0 animate-rainbow-glow rounded-[1000px] blur-xl scale-150 opacity-20"></div>
            </Link>
          </div>

          {/* 하단: 공장 카드 슬라이드 */}
          <div className="w-full overflow-hidden py-2 sm:py-4">
            <div
              className={`flex gap-2 sm:gap-4 ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
              style={{ transform: `translateX(${getTranslateX()})` }}
            >
              {loopedFactories.map((f, idx) => {
                const displayName = typeof f.name === 'string' && f.name
                  ? f.name
                  : typeof f.company_name === 'string' && f.company_name
                    ? f.company_name
                    : '이름 없음';
                const mainItems = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt]
                  .filter((v) => typeof v === 'string' && v.length > 0)
                  .join(', ') || '-';
                const randomFabrics = cardFabricsById[f.id ?? idx] || [];
                return (
                  <Link href={`/factories/${f.id}`} key={`${f.id ?? 'noid'}-${idx}`} className="rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer w-[calc(50%-4px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-12px)] flex-shrink-0">
                    {/* 이미지 영역 */}
                    <div className="w-full h-32 sm:h-40 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-xl group">
                      {(f.images && f.images.length > 0 && f.images[0] && f.images[0] !== '/logo_donggori.png' && !f.images[0].includes('동고')) || 
                       (f.image && f.image !== '/logo_donggori.png' && !f.image.includes('동고') && !f.image.includes('unsplash')) ? (
                        <Image
                          src={f.images && f.images.length > 0 ? f.images[0] : f.image}
                          alt={typeof f.company_name === 'string' ? f.company_name : '공장 이미지'}
                          className="object-cover w-full h-full rounded-t-xl group-hover:scale-110 transition-transform duration-300"
                          width={400}
                          height={192}
                          priority={idx < 4}
                          unoptimized
                        />
                      ) : (
                        <div className="text-gray-400 text-xs sm:text-sm font-medium">
                          이미지 준비 중
                        </div>
                      )}
                    </div>
                    {/* 정보 영역 */}
                    <div className="flex-1 flex flex-col px-0 py-3 sm:py-4 text-left">
                      {/* 주요 원단 칩 */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {randomFabrics.map((chip) => (
                          <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold">
                            {chip.label}
                          </span>
                        ))}
                      </div>
                      <div className="font-bold text-xs sm:text-sm mb-1 text-left">{displayName}</div>
                      {/* 주요 품목 */}
                      <div className="text-xs font-bold mb-1 flex items-start" style={{ color: '#333333', opacity: 0.6 }}>
                        <span className="shrink-0 mr-1">주요품목</span>
                        <span className="font-normal flex-1 truncate">{mainItems}</span>
                      </div>
                      <div className="text-xs font-bold text-left" style={{ color: '#333333', opacity: 0.6 }}>
                        MOQ(최소 주문 수량) <span className="font-normal">{typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' && !isNaN(Number(f.moq)) ? Number(f.moq) : (typeof f.minOrder === 'number' ? f.minOrder : '-'))}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection; 