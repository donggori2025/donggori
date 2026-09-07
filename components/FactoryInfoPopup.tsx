import Image from 'next/image';

import { Factory, FactoryLocation } from '@/lib/types';
import { getFactoryMainImage } from '@/lib/factoryImages';

interface FactoryInfoPopupProps {
  factory: Factory | FactoryLocation;
  onClose?: () => void;
  onDetailClick?: () => void;
}

export default function FactoryInfoPopup({ factory, onDetailClick }: FactoryInfoPopupProps) {
  if (!factory) return null;

  // 주요 품목 정보 구성
  const isFullFactory = (v: Factory | FactoryLocation): v is Factory => {
    return (
      typeof (v as any).top_items_upper !== "undefined" ||
      typeof (v as any).main_fabrics !== "undefined" ||
      typeof (v as any).moq !== "undefined"
    );
  };

  const mainItems = isFullFactory(factory)
    ? [
        factory.top_items_upper,
        factory.top_items_lower,
        factory.top_items_outer,
        (factory as any).top_items_dress_skirt,
      ]
        .filter(Boolean)
        .join(", ") || "-"
    : "-";

  const mainFabrics = isFullFactory(factory) ? factory.main_fabrics || "-" : "-";
  const moq = isFullFactory(factory) ? (factory.moq || (factory as any).minOrder || "-") : "-";

  const selectedTags = Array.from(
    new Set(
      [isFullFactory(factory) ? factory.factory_type : undefined, factory.business_type]
        .flatMap((value) => typeof value === "string" ? value.split(",") : [])
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ).slice(0, 2);

  const factoryName = factory.company_name || '공장명 없음';

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-10">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* 이미지 */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              const mainImage = getFactoryMainImage(factory);
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
                  key={tag}
                  className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"
                >
                  {tag}
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
