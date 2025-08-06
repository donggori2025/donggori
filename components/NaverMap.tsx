"use client";
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { config } from '@/lib/config';

// 네이버 맵 타입 정의
interface NaverMaps {
  Map: any;
  LatLng: any;
  Marker: any;
  Size: any;
  Point: any;
  Event: any;
  Position: any;
  MapTypeControlStyle: any;
  ZoomControlStyle: any;
}

interface NaverMapInstance {
  setZoom: (level: number) => void;
  getCenter: () => any;
  getZoom: () => number;
}

declare global {
  interface Window {
    naver: {
      maps: NaverMaps;
    };
  }
}

interface MarkerData {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  factory?: any;
  onClick?: () => void;
}

interface NaverMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  markers?: MarkerData[];
  selectedMarkerId?: string;
  onMapLoad?: (map: NaverMapInstance) => void;
  onMarkerSelect?: (factory: any) => void;
  onLoadError?: () => void;
  className?: string;
  isPopupOpen?: boolean;
}

export default function NaverMap({ 
  center = { lat: 37.5801, lng: 127.0448 }, // 청량리역 근처
  level = 14,
  markers = [],
  selectedMarkerId,
  onMapLoad,
  onMarkerSelect,
  onLoadError,
  className = "w-full h-96",
  isPopupOpen = false
}: NaverMapProps) {
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<NaverMapInstance | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [markerElements, setMarkerElements] = useState<any[]>([]);

  // 환경 변수 검증
  const clientId = useMemo(() => {
    return config.naver.clientId;
  }, []);

  // 에러 상태가 변경될 때 onLoadError 콜백 호출
  useEffect(() => {
    if (hasError && onLoadError) {
      onLoadError();
    }
  }, [hasError, onLoadError]);

  // 네이버맵 API 로드
  const loadNaverMap = useCallback(() => {
    // API 키가 없으면 에러 처리
    if (!clientId) {
      const errorMsg = '네이버맵 Client ID가 설정되지 않았습니다.';
      setErrorDetails('환경 변수 NEXT_PUBLIC_NAVER_CLIENT_ID가 설정되지 않았습니다.');
      setHasError(true);
      return;
    }

    // 이미 로드되어 있는지 확인
    if (window.naver && window.naver.maps) {
      setIsLoaded(true);
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    if (document.querySelector('script[src*="maps.js.ncp"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 약간의 지연을 두고 확인
      setTimeout(() => {
        if (window.naver && window.naver.maps) {
          setIsLoaded(true);
          setHasError(false);
        } else {
          setErrorDetails('스크립트는 로드되었지만 네이버맵 객체를 찾을 수 없습니다. Client ID를 확인해주세요.');
          setHasError(true);
        }
      }, 200);
    };
    
    script.onerror = () => {
      setErrorDetails('네이버맵 스크립트를 로드할 수 없습니다. Client ID와 도메인 설정을 확인해주세요.');
      setHasError(true);
    };
    
    document.head.appendChild(script);
  }, [clientId]);

  useEffect(() => {
    loadNaverMap();
  }, [loadNaverMap]);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || isInitialized) {
      return;
    }

    try {
      // API가 완전히 로드되었는지 한 번 더 확인
      if (!window.naver || !window.naver.maps) {
        return;
      }

      const container = mapRef.current;
      const mapOptions = {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: level,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.DROPDOWN,
          position: window.naver.maps.Position.TOP_RIGHT
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_RIGHT
        },
        clickableIcons: false
      };

      const naverMap = new window.naver.maps.Map(container, mapOptions);
      setMap(naverMap);
      setIsInitialized(true);
      setHasError(false);

      // 지도 클릭 이벤트
      window.naver.maps.Event.addListener(naverMap, 'click', (e: { overlay?: any }) => {
        // 마커를 클릭한 것이 아닌 지도 영역을 클릭한 경우에만 줌 레벨 변경
        if (!e.overlay && !isPopupOpen) {
          naverMap.setZoom(8);
        }
      });

      if (onMapLoad) {
        onMapLoad(naverMap);
      }
    } catch (error) {
      setErrorDetails('지도를 생성하는 중 오류가 발생했습니다.');
      setHasError(true);
    }
  }, [isLoaded, center, level, onMapLoad, isInitialized, isPopupOpen]);

  // 마커 생성 및 관리
  useEffect(() => {
    if (!map || !isInitialized) return;

    // 기존 마커들 제거
    markerElements.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });

    const newMarkers: any[] = [];

    markers.forEach(markerData => {
      try {
        const position = new window.naver.maps.LatLng(
          markerData.position.lat, 
          markerData.position.lng
        );

        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: position,
          map: map,
          title: markerData.title
        });

        // 마커 클릭 이벤트
        if (markerData.onClick) {
          window.naver.maps.Event.addListener(marker, 'click', () => {
            markerData.onClick?.();
            if (onMarkerSelect && markerData.factory) {
              onMarkerSelect(markerData.factory);
            }
          });
        }

        // 커스텀 마커 스타일 적용
        const isSelected = selectedMarkerId === markerData.id;
        const markerSize = isSelected ? 36 : 30;
        
        marker.setIcon({
          content: `
            <div style="
              width: ${markerSize}px;
              height: ${markerSize}px;
              cursor: pointer;
              position: relative;
              transform: translate(-50%, -100%);
              transition: all 0.2s ease-in-out;
            ">
              <svg
                width="${markerSize}"
                height="${markerSize}"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <!-- 핀 그림자 -->
                <ellipse
                  cx="12"
                  cy="22"
                  rx="3"
                  ry="1"
                  fill="rgba(0,0,0,0.2)"
                />
                <!-- 핀 몸체 -->
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#0ACF83"
                  stroke="#0ACF83"
                  stroke-width="0.5"
                />
                <!-- 핀 상단 흰색 원 -->
                <circle
                  cx="12"
                  cy="9"
                  r="3"
                  fill="#ffffff"
                  stroke="#0ACF83"
                  stroke-width="0.5"
                />
                ${isSelected ? `
                <!-- 선택된 경우 추가 효과 -->
                <circle
                  cx="12"
                  cy="9"
                  r="6"
                  fill="none"
                  stroke="#0ACF83"
                  stroke-width="1"
                  opacity="0.6"
                />
                <circle
                  cx="12"
                  cy="9"
                  r="4"
                  fill="none"
                  stroke="#0ACF83"
                  stroke-width="1"
                  opacity="0.3"
                />
                ` : ''}
              </svg>
            </div>
          `,
          size: new window.naver.maps.Size(markerSize, markerSize),
          anchor: new window.naver.maps.Point(markerSize / 2, markerSize)
        });

        newMarkers.push(marker);
      } catch (error) {
        // 개발 환경에서만 에러 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.error('마커 생성에 실패했습니다:', error);
        }
      }
    });

    setMarkerElements(newMarkers);
  }, [map, isInitialized, markers, selectedMarkerId, onMarkerSelect]);

  // 에러 상태일 때 표시할 내용
  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg`}>
        <div className="text-center p-8 max-w-md">
          <div className="text-red-500 text-lg font-semibold mb-3">
            🗺️ 지도를 불러올 수 없습니다
          </div>
          <div className="text-gray-600 text-sm mb-4">
            {errorDetails}
          </div>
          
          {/* 해결 방법 안내 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-800 mb-2">🔧 해결 방법:</h4>
            <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
              <li>네이버 클라우드 플랫폼에서 Maps API 신청</li>
              <li>새로운 Client ID 발급</li>
              <li>웹 서비스 URL에 <code className="bg-blue-100 px-1 rounded">http://localhost:3000</code> 등록</li>
              <li>.env.local 파일에 Client ID 설정</li>
            </ol>
            <div className="mt-3">
              <a 
                href="https://www.ncloud.com/product/applicationService/maps" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                📖 네이버 클라우드 플랫폼 바로가기
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
} 