"use client";

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

interface SimpleKakaoMapProps {
  className?: string;
}

export default function SimpleKakaoMap({ className = "w-full h-96" }: SimpleKakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🗺️ SimpleKakaoMap 시작');
    console.log('🔑 API Key:', process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);

    // 이미 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      console.log('✅ 카카오맵 이미 로드됨');
      setIsLoaded(true);
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    if (document.querySelector('script[src*="dapi.kakao.com"]')) {
      console.log('⏳ 스크립트 이미 로드 중...');
      return;
    }

    console.log('📥 스크립트 로딩 시작...');
    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      console.log('📦 스크립트 로드 완료');
      if (window.kakao && window.kakao.maps) {
        console.log('🔄 카카오맵 초기화 중...');
        window.kakao.maps.load(() => {
          console.log('✅ 카카오맵 초기화 완료');
          setIsLoaded(true);
        });
      } else {
        console.error('❌ 카카오맵 객체를 찾을 수 없음');
        setError('카카오맵 객체를 찾을 수 없습니다.');
      }
    };
    
    script.onerror = (error) => {
      console.error('❌ 스크립트 로드 실패:', error);
      setError('카카오맵 스크립트 로드에 실패했습니다.');
    };
    
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    console.log('🗺️ 지도 초기화 시도:', { isLoaded, hasRef: !!mapRef.current });
    
    if (!isLoaded || !mapRef.current) {
      console.log('❌ 지도 초기화 조건 불만족:', { isLoaded, hasRef: !!mapRef.current });
      return;
    }

    try {
      console.log('✅ 지도 생성 시작...');
      const container = mapRef.current;
      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
        level: 3
      };

      const map = new window.kakao.maps.Map(container, options);
      console.log('✅ 지도 생성 완료');
    } catch (error) {
      console.error('❌ 지도 생성 실패:', error);
      setError('지도 생성에 실패했습니다.');
    }
  }, [isLoaded]);

  // DOM 요소가 준비되었는지 확인하는 추가 useEffect
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      console.log('✅ DOM 요소 준비됨, 지도 초기화 재시도');
      // 강제로 지도 초기화 재시도
      setTimeout(() => {
        if (mapRef.current && window.kakao && window.kakao.maps) {
          try {
            console.log('🔄 지도 재초기화 시도...');
            const container = mapRef.current;
            const options = {
              center: new window.kakao.maps.LatLng(37.5665, 126.9780),
              level: 3
            };

            const map = new window.kakao.maps.Map(container, options);
            console.log('✅ 지도 재초기화 완료');
          } catch (error) {
            console.error('❌ 지도 재초기화 실패:', error);
          }
        }
      }, 100);
    }
  }, [isLoaded, mapRef.current]);

  if (error) {
    return (
      <div className={`${className} bg-red-100 flex items-center justify-center`}>
        <div className="text-red-600">
          <div className="font-bold">지도 로드 실패</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-gray-500">
          지도를 불러오는 중...<br/>
          API Key: {process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ? '설정됨' : '설정되지 않음'}
        </div>
      </div>
    );
  }

  return (
    <div ref={mapRef} className={className} />
  );
} 