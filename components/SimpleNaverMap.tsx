"use client";
import { useEffect, useRef, useState } from 'react';

// Window 인터페이스는 NaverMap.tsx에서 이미 정의되어 있으므로 여기서는 제거

interface SimpleNaverMapProps {
  center?: { lat: number; lng: number };
  level?: number;
  className?: string;
}

export default function SimpleNaverMap({ 
  center = { lat: 37.5765, lng: 127.0525 },
  level = 8,
  className = "w-full h-96"
}: SimpleNaverMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    const loadNaverMap = () => {
      const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '';
      
      console.log('🔍 SimpleNaverMap 디버깅 정보:');
      console.log('- Client ID:', clientId);
      console.log('- Client ID 길이:', clientId.length);
      console.log('- 현재 도메인:', typeof window !== 'undefined' ? window.location.hostname : '서버사이드');
      console.log('- 현재 URL:', typeof window !== 'undefined' ? window.location.href : '서버사이드');
      
      // 환경 변수 체크
      if (!clientId || clientId === 'your-naver-map-client-id') {
        const errorMsg = '❌ 네이버맵 클라이언트 ID가 설정되지 않았습니다.';
        console.error(errorMsg);
        setErrorDetails('환경 변수 NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다.');
        setHasError(true);
        return;
      }

      // 이미 로드되어 있는지 확인
      if (window.naver && window.naver.maps) {
        console.log('✅ 네이버맵이 이미 로드되어 있습니다.');
        setIsLoaded(true);
        return;
      }

      // 스크립트가 이미 로드 중인지 확인
      if (document.querySelector('script[src*="maps.js.ncp"]')) {
        console.log('⏳ 네이버맵 스크립트가 이미 로드 중입니다.');
        return;
      }

      console.log('🚀 네이버맵 스크립트 로드 시작...');
      const script = document.createElement('script');
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}&submodules=geocoder`;
      script.async = true;
      script.defer = true;
      console.log('📡 스크립트 URL:', script.src);
      
      script.onload = () => {
        console.log('✅ 네이버맵 스크립트 로드 성공!');
        setTimeout(() => {
          if (window.naver && window.naver.maps) {
            console.log('✅ 네이버맵 객체 확인됨:', window.naver.maps);
            setIsLoaded(true);
            setHasError(false);
          } else {
            const errorMsg = '❌ 네이버맵 객체를 찾을 수 없습니다';
            console.error(errorMsg);
            console.error('window.naver:', window.naver);
            setErrorDetails('스크립트는 로드되었지만 네이버맵 객체를 찾을 수 없습니다. 클라이언트 ID를 확인해주세요.');
            setHasError(true);
          }
        }, 200);
      };
      
      script.onerror = (error) => {
        const errorMsg = '❌ 네이버맵 스크립트 로드 실패';
        console.error(errorMsg, error);
        
        // 상세한 디버깅 정보 출력
        console.error('🔍 디버깅 정보:');
        console.error('- 클라이언트 ID:', clientId);
        console.error('- 클라이언트 ID 길이:', clientId?.length);
        console.error('- 스크립트 URL:', script.src);
        console.error('- 네트워크 상태:', navigator.onLine);
        console.error('- 현재 도메인:', window.location.hostname);
        console.error('- 프로토콜:', window.location.protocol);
        console.error('- User Agent:', navigator.userAgent);
        
        setErrorDetails('네이버맵 스크립트를 로드할 수 없습니다. 클라이언트 ID와 도메인 설정을 확인해주세요.');
        setHasError(true);
      };
      
      document.head.appendChild(script);
    };

    loadNaverMap();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    console.log('🗺️ 지도 생성 시작...');
    console.log('- isLoaded:', isLoaded);
    console.log('- mapRef.current:', !!mapRef.current);
    console.log('- center:', center);
    console.log('- level:', level);

    try {
      if (!window.naver || !window.naver.maps) {
        console.error('❌ 네이버맵 API가 완전히 로드되지 않았습니다');
        console.error('window.naver:', window.naver);
        return;
      }

      console.log('✅ 네이버맵 API 확인됨');
      const container = mapRef.current;
      console.log('✅ 컨테이너 요소 확인됨:', container);
      
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

      console.log('🗺️ 지도 옵션:', mapOptions);
      const naverMap = new window.naver.maps.Map(container, mapOptions);
      console.log('✅ 네이버맵 인스턴스 생성 성공:', naverMap);
      
      // 지도 클릭 시 줌 레벨 8로 설정 (마커가 아닌 지도 영역 클릭 시에만)
      window.naver.maps.Event.addListener(naverMap, 'click', (e: { overlay?: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        // 마커를 클릭한 것이 아닌 지도 영역을 클릭한 경우에만 줌 레벨 변경
        if (!e.overlay) {
          naverMap.setZoom(8);
        }
      });
    } catch (error) {
      console.error('❌ 네이버지도 생성에 실패했습니다:', error);
      setErrorDetails('지도를 생성하는 중 오류가 발생했습니다.');
      setHasError(true);
    }
  }, [isLoaded, center, level]);

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
        className="w-full h-full rounded-lg overflow-hidden bg-gray-100"
        style={{ minHeight: '400px' }}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">네이버맵 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
} 