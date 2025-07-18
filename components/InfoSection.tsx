import React, { useEffect, useState, useRef } from "react";
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

const DEMO_IMAGES = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
];

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
      setFactories(data.slice(0, CARD_COUNT));
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
    <section className="w-full bg-white py-16 min-h-[600px] flex items-center">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          {/* Why us? 칩 + 점 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">Why us?</span>
            <span className="w-4 h-4 rounded-full" style={{ background: '#a78bfa' }}></span>
          </div>
          {/* 상단: 정보 섹션 */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">70+ 개의 인증된 고퀄리티 봉제공장</h2>
            <p className="text-lg text-gray-500 mb-6">
              동고리는 70개 이상의 봉제공장 있으며 3곳의 패션봉제협회의 품질인증을 받은 고퀄리티의 봉제를 약속드립니다.
            </p>
            <Link href="/factories" className="inline-flex items-center bg-neutral-100 text-black px-8 py-3 rounded-[1000px] font-bold text-lg hover:bg-neutral-200 transition shadow-none gap-2 mx-auto w-fit">
              <span>봉제공장 찾아보기</span>
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-black">
                <span className="text-base text-white">→</span>
              </span>
            </Link>
          </div>

          {/* 하단: 공장 카드 슬라이드 */}
          <div className="w-full overflow-hidden">
            <div
              className={`flex gap-4 ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
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
                  <Link href={`/factories/${f.id}`} key={`${f.id ?? 'noid'}-${idx}`} className="rounded-xl p-0 bg-white overflow-hidden flex flex-col cursor-pointer hover:shadow-lg transition-shadow w-[calc(25%-12px)] flex-shrink-0">
                    {/* 이미지 영역 */}
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden rounded-xl">
                      <img
                        src={f.image || DEMO_IMAGES[idx % DEMO_IMAGES.length]}
                        alt={typeof f.company_name === 'string' ? f.company_name : '공장 이미지'}
                        className="object-cover w-full h-full rounded-xl"
                      />
                    </div>
                    {/* 정보 영역 */}
                    <div className="flex-1 flex flex-col p-3 text-left">
                      {/* 주요 원단 칩 */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {randomFabrics.map((chip) => (
                          <span key={chip.label} style={{ color: chip.color, background: chip.bg }} className="rounded-full px-2 py-1 text-xs font-semibold">
                            {chip.label}
                          </span>
                        ))}
                      </div>
                      <div className="font-bold text-sm mb-1 text-left">{displayName}</div>
                      {/* 주요 품목 */}
                      <div className="text-xs font-bold mb-1 flex items-start" style={{ color: '#333333', opacity: 0.6 }}>
                        <span className="shrink-0 mr-1">주요품목</span>
                        <span className="font-normal flex-1">{mainItems}</span>
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