"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NaverMap from './NaverMap';
import FactoryInfoPopup from './FactoryInfoPopup';
import { FactoryLocation, MapFilters } from '@/lib/types';
import { getFactoryLocations } from '@/lib/factoryMap';
import { Map, List, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FactoryMapViewProps {
  className?: string;
}

export default function FactoryMapView({ className = "" }: FactoryMapViewProps) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [factories, setFactories] = useState<FactoryLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<MapFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactory, setSelectedFactory] = useState<FactoryLocation | null>(null);

  const loadFactories = useCallback(async () => {
    setLoading(true);
    try {
      const factoryData = await getFactoryLocations(filters);
      setFactories(factoryData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 공장 데이터 로드 실패:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadFactories();
  }, [loadFactories]);

  const handleFactoryClick = (factoryId: string) => {
    router.push(`/factories/${factoryId}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, region: searchTerm }));
  };

  const handleMarkerSelect = (factory: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setSelectedFactory(factory);
  };

  const handlePopupClose = () => {
    setSelectedFactory(null);
  };

  const handlePopupDetailClick = () => {
    if (selectedFactory) {
      handleFactoryClick(selectedFactory.id);
    }
  };

  const filteredFactories = factories.filter(factory =>
    factory.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    factory.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mapMarkers = filteredFactories.map(factory => ({
    id: factory.id,
    position: factory.position,
    title: factory.company_name,
    factory: factory,
    onClick: () => handleFactoryClick(factory.id)
  }));

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center min-h-96`}>
        <div className="text-gray-500">공장 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">봉제공장 찾기</h1>
          
          {/* 뷰 모드 토글 */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="flex items-center gap-2"
            >
              <Map className="w-4 h-4" />
              지도
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              목록
            </Button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mt-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="공장명 또는 주소로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button type="submit" size="sm">
              검색
            </Button>
          </form>
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1">
        {viewMode === 'map' ? (
          /* 지도 뷰 */
          <div className="h-[calc(100vh-200px)] relative">
            <NaverMap
              center={{ lat: 37.5665, lng: 126.9780 }}
              level={8}
              markers={mapMarkers}
              selectedMarkerId={selectedFactory?.id}
              onMarkerSelect={handleMarkerSelect}
              className="w-full h-full"
            />
            
            {/* 팝업 카드 */}
            {selectedFactory && (
              <FactoryInfoPopup
                factory={selectedFactory}
                onClose={handlePopupClose}
                onDetailClick={handlePopupDetailClick}
              />
            )}
          </div>
        ) : (
          /* 목록 뷰 */
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFactories.map((factory) => (
                <div
                  key={factory.id}
                  onClick={() => handleFactoryClick(factory.id)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {factory.company_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {factory.company_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {factory.address}
                      </p>
                      {factory.business_type && (
                        <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                          {factory.business_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredFactories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 