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
  const [mapInstance, setMapInstance] = useState<any>(null);

  useEffect(() => {
    const loadNaverMap = () => {
      // 임시로 하드코딩된 클라이언트 ID 사용 (테스트용)
      const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || 'c1jy0j43p5';
      
      console.log('🔍 SimpleNaverMap 디버깅 정보:');
      console.log('- Client ID:', clientId);
      console.log('- Client ID 길이:', clientId.length);
      console.log('- 현재 도메인:', typeof window !== 'undefined' ? window.location.hostname : '서버사이드');
      console.log('- 현재 URL:', typeof window !== 'undefined' ? window.location.href : '서버사이드');
      console.log('- 환경:', process.env.NODE_ENV);
      console.log('- Vercel URL:', process.env.VERCEL_URL);
      
      // 환경 변수 체크 (하드코딩된 값도 허용)
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
        
        // 배포 환경에서 도메인 설정 가이드 제공
        if (window.location.hostname !== 'localhost') {
          console.error('🌐 배포 환경 도메인 설정 가이드:');
          console.error('1. 네이버 클라우드 플랫폼 접속: https://www.ncloud.com/');
          console.error('2. AI·NAVER API → Maps 선택');
          console.error('3. Application 등록 확인');
          console.error('4. Web Service URL에 다음 도메인 추가:');
          console.error(`   - ${window.location.origin}`);
          console.error('5. 환경 변수 확인: NEXT_PUBLIC_NAVER_MAP_CLIENT_ID');
        }
        
        setErrorDetails('네이버맵 스크립트를 로드할 수 없습니다. 클라이언트 ID와 도메인 설정을 확인해주세요.');
        setHasError(true);
      };
      
      document.head.appendChild(script);
    };

    loadNaverMap();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.naver?.maps) {
      return;
    }

    try {
      console.log('🗺️ 네이버맵 초기화 시작...');
      console.log('- 중심점:', center);
      console.log('- 줌 레벨:', level);
      console.log('- 맵 컨테이너:', mapRef.current);

      const map = new window.naver.maps.Map(mapRef.current, {
        center: new window.naver.maps.LatLng(center.lat, center.lng),
        zoom: level,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: window.naver.maps.MapTypeControlStyle.DROPDOWN
        },
        zoomControl: true,
        zoomControlOptions: {
          style: window.naver.maps.ZoomControlStyle.SMALL,
          position: window.naver.maps.Position.TOP_RIGHT
        }
      });

      console.log('✅ 네이버맵 초기화 성공!');
      setMapInstance(map);
      setHasError(false);

      // 마커 추가
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(center.lat, center.lng),
        map: map
      });

      console.log('📍 마커 추가 완료');

    } catch (error) {
      console.error('❌ 네이버맵 초기화 실패:', error);
      setErrorDetails(`네이버맵 초기화 중 오류가 발생했습니다: ${error}`);
      setHasError(true);
    }
  }, [isLoaded, center.lat, center.lng, level]);

  // 로딩 중 표시
  if (!isLoaded && !hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">네이버맵 로딩 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  // 오류 표시
  if (hasError) {
    return (
      <div className={`${className} flex items-center justify-center bg-red-50 border-2 border-dashed border-red-300`}>
        <div className="text-center p-4">
          <div className="text-red-600 text-2xl mb-2">⚠️</div>
          <h3 className="text-red-800 font-semibold mb-2">네이버맵 로드 실패</h3>
          <p className="text-red-600 text-sm mb-4">{errorDetails}</p>
          
          {/* 배포 환경에서 도메인 설정 안내 */}
          {typeof window !== 'undefined' && window.location.hostname !== 'localhost' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <h4 className="text-blue-800 font-semibold mb-2">🔧 해결 방법:</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. <a href="https://www.ncloud.com/" target="_blank" rel="noopener noreferrer" className="underline">네이버 클라우드 플랫폼</a> 접속</li>
                <li>2. AI·NAVER API → Maps 선택</li>
                <li>3. Application 등록 확인</li>
                <li>4. Web Service URL에 <code className="bg-blue-100 px-1 rounded">{window.location.origin}</code> 추가</li>
                <li>5. 환경 변수 <code className="bg-blue-100 px-1 rounded">NEXT_PUBLIC_NAVER_MAP_CLIENT_ID</code> 확인</li>
              </ol>
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
} 