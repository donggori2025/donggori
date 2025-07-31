"use client";
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    title: string;
    factory?: any; // 공장 정보 추가
    onClick?: () => void;
  }>;
  selectedMarkerId?: string; // 선택된 마커 ID 추가
  onMapLoad?: (map: any) => void;
  onMarkerSelect?: (factory: any) => void; // 마커 선택 콜백 추가
  className?: string;
}

export default function KakaoMap({ 
  center = { lat: 37.5665, lng: 126.9780 }, // 서울 시청
  level = 3,
  markers = [],
  selectedMarkerId,
  onMapLoad,
  onMarkerSelect,
  className = "w-full h-96"
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 카카오맵 API 로드
    const loadKakaoMap = () => {
      console.log('🗺️ 카카오맵 API 로딩 시작...');
      console.log('🔑 API Key:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      console.log('🔑 API Key 길이:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY?.length);
      console.log('🔑 API Key 존재 여부:', !!process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      
      // 이미 로드되어 있는지 확인
      if (window.kakao && window.kakao.maps && window.kakao.maps.LatLng) {
        console.log('✅ 카카오맵 API 이미 로드됨');
        setIsLoaded(true);
        return;
      }

      // 스크립트가 이미 로드 중인지 확인
      if (document.querySelector('script[src*="dapi.kakao.com"]')) {
        console.log('⏳ 카카오맵 스크립트 이미 로드 중...');
        return;
      }

      console.log('📥 카카오맵 스크립트 로딩 중...');
      const script = document.createElement('script');
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services&autoload=false`;
      script.async = true;
      
      script.onload = () => {
        console.log('📦 카카오맵 스크립트 로드 완료');
        // autoload=false로 설정했으므로 수동으로 초기화
        if (window.kakao && window.kakao.maps) {
          console.log('🔄 카카오맵 초기화 중...');
          window.kakao.maps.load(() => {
            console.log('✅ 카카오맵 초기화 완료');
            setIsLoaded(true);
          });
        } else {
          console.error('❌ 카카오맵 객체를 찾을 수 없음');
        }
      };
      
      script.onerror = (error) => {
        console.error('❌ 카카오맵 스크립트 로드 실패:', error);
      };
      
      document.head.appendChild(script);
    };

    loadKakaoMap();
  }, []);

  // 지도 초기화
  useEffect(() => {
    console.log('🗺️ 지도 초기화 시도:', { isLoaded, hasRef: !!mapRef.current, isInitialized });
    
    if (!isLoaded || !mapRef.current || isInitialized) {
      console.log('❌ 지도 초기화 조건 불만족:', { isLoaded, hasRef: !!mapRef.current, isInitialized });
      return;
    }

    try {
      // API가 완전히 로드되었는지 한 번 더 확인
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.LatLng) {
        console.error('❌ 카카오맵 API가 완전히 로드되지 않음');
        return;
      }

      console.log('✅ 지도 생성 시작...');
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(center.lat, center.lng),
        level: level
      };

      console.log('📍 지도 중심점:', center);
      const kakaoMap = new window.kakao.maps.Map(container, options);
      setMap(kakaoMap);
      setIsInitialized(true);
      console.log('✅ 지도 생성 완료');

      if (onMapLoad) {
        onMapLoad(kakaoMap);
      }
    } catch (error) {
      console.error('❌ 카카오지도 생성 실패:', error);
    }
  }, [isLoaded, center.lat, center.lng, level, onMapLoad, isInitialized]);

  // DOM 요소가 준비되었는지 확인하는 추가 useEffect
  useEffect(() => {
    if (isLoaded && mapRef.current && !isInitialized) {
      console.log('✅ DOM 요소 준비됨, 지도 초기화 재시도');
      // 강제로 지도 초기화 재시도
      setTimeout(() => {
        if (mapRef.current && window.kakao && window.kakao.maps && !isInitialized) {
          try {
            console.log('🔄 지도 재초기화 시도...');
            const container = mapRef.current;
            const options = {
              center: new window.kakao.maps.LatLng(center.lat, center.lng),
              level: level
            };

            const kakaoMap = new window.kakao.maps.Map(container, options);
            setMap(kakaoMap);
            setIsInitialized(true);
            console.log('✅ 지도 재초기화 완료');

            if (onMapLoad) {
              onMapLoad(kakaoMap);
            }
          } catch (error) {
            console.error('❌ 지도 재초기화 실패:', error);
          }
        }
      }, 100);
    }
  }, [isLoaded, mapRef.current, isInitialized, center.lat, center.lng, level, onMapLoad]);

  // 마커 업데이트
  useEffect(() => {
    if (!map || !isLoaded || !isInitialized) return;

    try {
      console.log(`🗺️ 마커 업데이트 시작: ${markers.length}개 마커`);
      
      // 기존 마커들 제거 (removeOverlays가 없는 경우를 대비)
      if (map.removeOverlays) {
        map.removeOverlays();
      }

      // 새로운 마커들 추가
      markers.forEach((markerData, index) => {
        try {
          console.log(`📍 마커 ${index + 1}: ${markerData.title} - ${markerData.position.lat}, ${markerData.position.lng}`);
          
          const isSelected = selectedMarkerId === markerData.id;
          
          // 선택된 마커와 일반 마커의 크기 차이
          const markerSize = isSelected ? 36 : 30; // 선택된 마커는 1.2배 크기
          const markerImageSize = new window.kakao.maps.Size(markerSize, markerSize);
          const markerOffset = new window.kakao.maps.Point(markerSize / 2, markerSize);
          
          // 마커 이미지 생성
          let markerImage;
          if (isSelected) {
            // 선택된 마커: 파란색 원형, 원 없음
            markerImage = new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTgiIGZpbGw9IiMyNTYzZWYiLz4KPGNpcmNsZSBjeD0iMTgiIGN5PSIxOCIgcj0iMTIiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==',
              markerImageSize,
              { offset: markerOffset }
            );
          } else {
            // 일반 마커: 아래로 가면서 좁아지는 디자인, 가운데 뚫림
            markerImage = new window.kakao.maps.MarkerImage(
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAzMCAzMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDJMMjAgMTJMMTggMjBIMTJMMTAgMTJMMTUgMloiIGZpbGw9IiMyNTYzZWYiLz4KPGNpcmNsZSBjeD0iMTUiIGN5PSIxMiIgcj0iMyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
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
            console.log(`🖱️ 마커 클릭: ${markerData.title} (클릭 수: ${clickCount})`);
            
            if (clickCount === 1) {
              // 첫 번째 클릭 - 정보 표시 (이전 선택 해제되고 새로운 마커 선택)
              if (onMarkerSelect && markerData.factory) {
                console.log(`ℹ️ 마커 정보 표시: ${markerData.factory.company_name}`);
                onMarkerSelect(markerData.factory);
              }
              
              // 300ms 후 클릭 카운트 리셋
              clickTimer = setTimeout(() => {
                clickCount = 0;
              }, 300);
            } else if (clickCount === 2) {
              // 두 번째 클릭 - 상세페이지 이동
              console.log(`🔗 상세페이지 이동: ${markerData.title}`);
              clearTimeout(clickTimer);
              clickCount = 0;
              if (markerData.onClick) {
                markerData.onClick();
              }
            }
          });

          // 마커에 툴팁 추가
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${markerData.title}</div>`
          });

          window.kakao.maps.event.addListener(marker, 'mouseover', function() {
            infowindow.open(map, marker);
          });

          window.kakao.maps.event.addListener(marker, 'mouseout', function() {
            infowindow.close();
          });
        } catch (error) {
          console.error(`❌ 마커 생성 실패 (${markerData.title}):`, error);
        }
      });
      
      console.log('✅ 마커 업데이트 완료');
    } catch (error) {
      console.error('❌ 마커 업데이트 실패:', error);
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