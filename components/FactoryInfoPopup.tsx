import Image from 'next/image';

import { Factory } from '@/lib/types';

interface FactoryInfoPopupProps {
  factory: Factory;
  onClose?: () => void;
  onDetailClick?: () => void;
}

export default function FactoryInfoPopup({ factory, onDetailClick }: FactoryInfoPopupProps) {
  if (!factory) return null;

  // 주요 품목 정보 구성
  const mainItems = [
    factory.top_items_upper,
    factory.top_items_lower,
    factory.top_items_outer,
    factory.top_items_dress_skirt
  ].filter(Boolean).join(', ') || '-';

  const mainFabrics = factory.main_fabrics || '-';
  const moq = factory.moq || factory.minOrder || '-';

  // 태그 색상 정의
  const tagColors = [
    { label: '봉제', color: '#0ACF83', bg: 'rgba(10, 207, 131, 0.1)' },
    { label: '샘플', color: '#08B7FF', bg: 'rgba(8, 183, 255, 0.1)' },
    { label: '패턴', color: '#FF8308', bg: 'rgba(255, 131, 8, 0.1)' },
    { label: '나염', color: '#A259FF', bg: 'rgba(162, 89, 255, 0.1)' },
    { label: '전사', color: '#ED6262', bg: 'rgba(237, 98, 98, 0.1)' },
  ];

  // 공장 ID 기반으로 태그 선택
  const seed = String(factory.id || 0);
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
  }
  
  const shuffled = [...tagColors].sort((a, b) => {
    const h1 = Math.abs(Math.sin(hash + a.label.length)) % 1;
    const h2 = Math.abs(Math.sin(hash + b.label.length)) % 1;
    return h1 - h2;
  });
  
  const count = (Math.abs(hash) % 2) + 1;
  const selectedTags = shuffled.slice(0, count);

  const factoryName = factory.company_name || factory.name || '공장명 없음';

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* 이미지 */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              const name = String(factory.company_name || factory.name || '');
              const mainImage = require('@/lib/factoryImages').getFactoryMainImage(name);
              if (mainImage && !mainImage.includes('logo_donggori')) {
                return (
                  <Image
                    src={mainImage}
                    alt={factoryName}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                    sizes="96px"
                    loading="lazy"
                    quality={75}
                  />
                );
              }
              return (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">이미지 없음</div>
              );
            })()}
          </div>

          {/* 기본 정보 */}
          <div className="flex-1 min-w-0">
            {/* 태그 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.label}
                  style={{ color: tag.color, background: tag.bg }}
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* 공장명 */}
            <h3 className="font-bold text-base text-gray-900 mb-2">
              {factoryName}
            </h3>

            {/* 주요 정보 */}
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center">
                <span className="font-semibold w-16 flex-shrink-0">주요품목:</span>
                <span className="truncate flex-1">{mainItems}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-16 flex-shrink-0">주요원단:</span>
                <span className="truncate flex-1">{mainFabrics}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold w-16 flex-shrink-0">MOQ:</span>
                <span className="truncate flex-1">{moq}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 상세보기 버튼 */}
      <div className="px-4 pb-4">
        <button
          onClick={onDetailClick}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-900 transition text-sm"
        >
          🔍 상세페이지 보기
        </button>
      </div>
    </div>
  );
} 