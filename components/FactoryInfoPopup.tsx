import Image from 'next/image';
import { X } from 'lucide-react';

interface FactoryInfoPopupProps {
  factory: any;
  onClose: () => void;
  onDetailClick: () => void;
}

export default function FactoryInfoPopup({ factory, onClose, onDetailClick }: FactoryInfoPopupProps) {
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

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="font-bold text-lg text-gray-900 truncate flex-1">
          {factory.company_name || factory.name || '공장'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-2 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 내용 - 가로 레이아웃 */}
      <div className="p-3">
        <div className="flex items-start gap-4">
          {/* 이미지 */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={factory.images && factory.images.length > 0 ? factory.images[0] : (factory.image || '/logo_donggori.png')}
              alt={factory.company_name || '공장 이미지'}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </div>

          {/* 정보 */}
          <div className="flex-1 min-w-0">
            {/* 태그 */}
            <div className="flex flex-wrap gap-1 mb-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.label}
                  style={{ color: tag.color, background: tag.bg }}
                  className="rounded-full px-2 py-1 text-xs font-semibold"
                >
                  {tag.label}
                </span>
              ))}
            </div>

            {/* 정보 - 텍스트 오버플로우 방지 */}
            <div className="space-y-1 text-sm">
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 flex-shrink-0">주요품목:</span>
                <span className="text-gray-900 ml-1 truncate block">{mainItems}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 flex-shrink-0">주요원단:</span>
                <span className="text-gray-900 ml-1 truncate block">{mainFabrics}</span>
              </div>
              <div className="flex items-start">
                <span className="font-semibold text-gray-600 flex-shrink-0">MOQ:</span>
                <span className="text-gray-900 ml-1">{moq}</span>
              </div>
            </div>
          </div>

          {/* 상세보기 버튼 */}
          <button
            onClick={onDetailClick}
            className="bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap flex-shrink-0"
          >
            상세보기
          </button>
        </div>
      </div>
    </div>
  );
} 