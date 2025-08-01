"use client";
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    factory?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    onClick?: () => void;
  }>;
  selectedMarkerId?: string; // 선택된 마커 ID 추가
  onMapLoad?: (map: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onMarkerSelect?: (factory: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  className?: string;
}

export default function KakaoMap({ 
  center = { lat: 37.5765, lng: 127.0525 }, // 동대문구 중심
  level = 3,
  markers = [],
  selectedMarkerId,
  onMapLoad,
  onMarkerSelect,
  className = "w-full h-96"
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 카카오맵 API 로드
    const loadKakaoMap = () => {
      const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
      
      // API 키가 없으면 에러 처리
      if (!apiKey) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ 카카오맵 API 키가 설정되지 않았습니다.');
        }
        return;
      }
      
      // 이미 로드되어 있는지 확인
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        setIsLoaded(true);
        return;
      }

      // 스크립트가 이미 로드 중인지 확인
      if (document.querySelector('script[src*="dapi.kakao.com"]')) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        // autoload=false로 설정했으므로 수동으로 초기화
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            setIsLoaded(true);
          });
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ 카카오맵 객체를 찾을 수 없음');
          }
        }
      };
      
      script.onerror = (error) => {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ 카카오맵 스크립트 로드 실패:', error);
          console.error('🔍 디버깅 정보:');
          console.error('- API Key:', apiKey);
          console.error('- API Key 길이:', apiKey?.length);
          console.error('- 스크립트 URL:', script.src);
          console.error('- 네트워크 상태:', navigator.onLine);
        }
      };
      
      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || isInitialized) {
      return;
    }

    try {
      // API가 완전히 로드되었는지 한 번 더 확인
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ 카카오맵 API가 완전히 로드되지 않음');
        }
        return;
      }

      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level
      };

      const kakaoMap = new window.kakao.maps.Map(container, options);
      setMap(kakaoMap);
      setIsInitialized(true);

      if (onMapLoad) {
        onMapLoad(kakaoMap);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 카카오지도 생성 실패:', error);
      }
    }
  }, [isLoaded, center, level, onMapLoad, isInitialized]);

  // DOM 요소가 준비되었는지 확인하는 추가 useEffect
  useEffect(() => {
    if (isLoaded && mapRef.current && !isInitialized) {
      // 강제로 지도 초기화 재시도
      setTimeout(() => {
        if (mapRef.current && window.kakao && window.kakao.maps && !isInitialized) {
          try {
            const container = mapRef.current;
            const options = {
              center: new window.kakao.maps.LatLng(center.lat, center.lng),
              level: level
            };

            const kakaoMap = new window.kakao.maps.Map(container, options);
            setMap(kakaoMap);
            setIsInitialized(true);

            if (onMapLoad) {
              onMapLoad(kakaoMap);
            }
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ 지도 재초기화 실패:', error);
            }
          }
        }
      }, 100);
    }
  }, [isLoaded, isInitialized, center, level, onMapLoad]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !isLoaded || !isInitialized) return;

    try {
      // 기존 마커들 제거 (removeOverlays가 없는 경우를 대비)
      if (map.removeOverlays) {
        map.removeOverlays();
      }

      // 새로운 마커들 추가
      markers.forEach((markerData, index) => {
        try {
          // 마커 데이터 유효성 검사
          if (!markerData || !markerData.position || 
              typeof markerData.position.lat !== 'number' || 
              typeof markerData.position.lng !== 'number' ||
              !markerData.title) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(`⚠️ 유효하지 않은 마커 데이터 (인덱스 ${index}):`, markerData);
            }
            return;
          }
          
          const isSelected = selectedMarkerId === markerData.id;
          
          // 선택된 마커와 일반 마커의 크기 차이 (더 큰 차이)
          const markerSize = isSelected ? 45 : 30; // 선택된 마커는 1.5배 크기
          const markerImageSize = new window.kakao.maps.Size(markerSize, markerSize);
          const markerOffset = new window.kakao.maps.Point(markerSize / 2, markerSize);
          
          // 마커 이미지 생성
          let markerImage;
          if (isSelected) {
            // 선택된 마커: 파란색 핀 모양 마커 (크기만 커짐)
            markerImage = new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIHZpZXdCb3g9IjAgMCA0NSA0NSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyLjUgMkMyOC4yODQgMiAzMyA2LjcxNiAzMyAxMkMzMyAxNy4yODQgMjguMjg0IDIyIDIyLjUgMjJDMTYuNzE2IDIyIDEyIDE3LjI4NCAxMiAxMkMxMiA2LjcxNiAxNi43MTYgMiAyMi41IDJaIiBmaWxsPSIjMjU2M2VmIi8+CjxjaXJjbGUgY3g9IjIyLjUiIGN5PSIxMiIgcj0iNSIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIyLjUgMjJMMjIuNSA0NUwyMCA0NUwyMCAyMkwyMi41IDIyWiIgZmlsbD0iIzI1NjNlZiIvPgo8L3N2Zz4=',
              markerImageSize,
              { offset: markerOffset }
            );
          } else {
            // 일반 마커: 파란색 핀 모양 마커 (클래식한 지도 마커)
            markerImage = new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDJDMjAuNTIzIDIgMjUgNi40NzcgMjUgMTJDMjUgMTcuNTIzIDIwLjUyMyAyMiAxNSAyMkM5LjQ3NyAyMiA1IDE3LjUyMyA1IDEyQzUgNi40NzcgOS40NzcgMiAxNSAyWiIgZmlsbD0iIzI1NjNlZiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTUgMjJMMTUgMzBMMTMgMzBMMTMgMjJMMTUgMjJaIiBmaWxsPSIjMjU2M2VmIi8+Cjwvc3ZnPg==',
              markerImageSize,
              { offset: markerOffset }
            );
          }
          
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(
              markerData.position.lat, 
              markerData.position.lng
            ),
            image: markerImage,
            zIndex: isSelected ? 10 : 1, // 선택된 마커는 더 높은 zIndex
            clickable: true
          });

          // 마커를 지도에 표시
          marker.setMap(map);

          // 마커 클릭 이벤트 (싱글 클릭 - 정보 표시, 더블 클릭 - 상세페이지 이동)
          let clickCount = 0;
          let clickTimer: NodeJS.Timeout;
          
          window.kakao.maps.event.addListener(marker, 'click', function() {
            clickCount++;
            
            if (clickCount === 1) {
              // 첫 번째 클릭 - 정보 표시 (이전 선택 해제되고 새로운 마커 선택)
              if (onMarkerSelect && markerData.factory) {
                onMarkerSelect(markerData.factory);
              }
              
              // 300ms 후 클릭 카운트 리셋
              clickTimer = setTimeout(() => {
                clickCount = 0;
              }, 300);
            } else if (clickCount === 2) {
              // 두 번째 클릭 - 상세페이지 이동
              clearTimeout(clickTimer);
              clickCount = 0;
              if (markerData.onClick) {
                markerData.onClick();
              }
            }
          });

          // 마커에 툴팁 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:8px 12px;font-size:13px;font-weight:500;background:white;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #e5e7eb;color:#374151;">${markerData.title}</div>`
          });

          window.kakao.maps.event.addListener(marker, 'mouseover', function() {
            infowindow.open(map, marker);
          });

          window.kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
          });
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`❌ 마커 생성 실패 (${markerData.title}):`, error);
          }
        }
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ 마커 업데이트 실패:', error);
      }
    }
  }, [map, markers, isLoaded, isInitialized, selectedMarkerId, onMarkerSelect]);

  if (!isLoaded || !window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-gray-500">
          지도를 불러오는 중...<br/>
          {!isLoaded && "API 로딩 중..."}<br/>
          {!window.kakao && "카카오 객체 없음"}<br/>
          {!window.kakao?.maps && "카카오맵 객체 없음"}<br/>
          {!window.kakao?.maps?.LatLng && "LatLng 생성자 없음"}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={className}
      style={{ minHeight: '400px' }}
    />
  );
} 