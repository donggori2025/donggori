"use client";
import React from "react";
import { useState } from 'react';
import NaverMap from '@/components/NaverMap';
import SimpleNaverMap from '@/components/SimpleNaverMap';

export default function TestMapPage() {
  const [mapType, setMapType] = useState<'simple' | 'full'>('full');
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });

  const testMarkers = [
    {
      id: '1',
      position: { lat: 37.5665, lng: 126.9780 },
      title: '서울시청',
      onClick: () => console.log('서울시청 클릭')
    },
    {
      id: '2',
      position: { lat: 37.5765, lng: 127.0525 },
      title: '동대문구',
      onClick: () => console.log('동대문구 클릭')
    }
  ];

  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '';
  const hasValidClientId = clientId && clientId !== 'your-naver-map-client-id' && clientId.length > 10;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">네이버 지도 테스트</h1>
        
        {/* API 설정 안내 */}
        {!hasValidClientId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ 네이버 맵 API 설정 필요</h2>
            <div className="text-yellow-700 space-y-4">
              <p>네이버맵 API v3를 사용하기 위해 새로운 클라이언트 ID가 필요합니다.</p>
              
              <div className="bg-white p-4 rounded border border-yellow-300">
                <h3 className="font-semibold mb-3 text-yellow-800">🔧 새로운 클라이언트 ID 발급 방법:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <a href="https://www.ncloud.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                      네이버 클라우드 플랫폼
                    </a>에 접속하여 로그인
                  </li>
                  <li><strong>AI·NAVER API</strong> → <strong>Maps</strong> 선택</li>
                  <li><strong>Maps</strong> 서비스 신청 (JavaScript API v3)</li>
                  <li><strong>Application 등록</strong> 클릭</li>
                  <li>애플리케이션 정보 입력:
                    <ul className="ml-4 mt-1 space-y-1">
                      <li>• <strong>Application 이름</strong>: 동고리 (또는 원하는 이름)</li>
                      <li>• <strong>Service Environment</strong>: Web</li>
                      <li>• <strong>Web Service URL</strong>: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code> (개발용)</li>
                    </ul>
                  </li>
                  <li>발급받은 <strong>Client ID</strong> 복사</li>
                </ol>
              </div>
              
              <div className="bg-white p-4 rounded border border-yellow-300">
                <h3 className="font-semibold mb-2 text-yellow-800">📝 환경 변수 설정:</h3>
                <div className="text-sm">
                  <p className="mb-2">프로젝트 루트에 <code className="bg-gray-100 px-1 rounded">.env.local</code> 파일을 생성하고 다음 내용을 추가:</p>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`# 네이버맵 API 설정
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=your-actual-client-id-here

# 기존 설정들...
BLOB_READ_WRITE_TOKEN=your-blob-read-write-token
IMAGE_SERVICE=vercel-blob`}
                  </pre>
                </div>
              </div>
              
              <div className="flex gap-3">
                <a 
                  href="https://www.ncloud.com/product/applicationService/maps" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  🚀 네이버 클라우드 플랫폼 바로가기
                </a>
                <a 
                  href="https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                >
                  📖 API 문서 보기
                </a>
              </div>
            </div>
          </div>
        )}
        
        {/* 컨트롤 패널 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">지도 설정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                지도 타입
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMapType('simple')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    mapType === 'simple'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  간단한 지도
                </button>
                <button
                  onClick={() => setMapType('full')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    mapType === 'full'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  완전한 지도 (마커 포함)
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                중심 좌표
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCenter({ lat: 37.5665, lng: 126.9780 })}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  서울시청
                </button>
                <button
                  onClick={() => setCenter({ lat: 37.5765, lng: 127.0525 })}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  동대문구
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>현재 설정:</strong> {mapType === 'simple' ? '간단한 지도' : '완전한 지도'} | 
              중심: ({center.lat.toFixed(4)}, {center.lng.toFixed(4)})
            </p>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              {mapType === 'simple' ? '간단한 네이버 지도' : '완전한 네이버 지도 (마커 포함)'}
            </h2>
          </div>
          
          <div className="h-[600px]">
            {mapType === 'simple' ? (
              <SimpleNaverMap
                center={center}
                level={8}
                className="w-full h-full"
              />
            ) : (
              <NaverMap
                center={center}
                level={8}
                markers={testMarkers}
                onMarkerSelect={(marker) => console.log('마커 선택:', marker)}
                onLoadError={() => console.log('지도 로드 실패')}
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* 디버그 정보 */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">🔍 디버그 정보</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <span>• 환경 변수:</span>
              <span className={process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ? 'text-green-600' : 'text-red-600'}>
                {process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ? '✅ 설정됨' : '❌ 설정되지 않음'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>• Client ID:</span>
              <span className="font-mono">
                {process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 
                  ? '***' + process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID.slice(-4) 
                  : '없음'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>• API 상태:</span>
              <span className={hasValidClientId ? 'text-green-600' : 'text-red-600'}>
                {hasValidClientId ? '✅ 새로운 API 사용 가능' : '❌ 새로운 클라이언트 ID 필요'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>• 현재 도메인:</span>
              <span className="font-mono">{typeof window !== 'undefined' ? window.location.hostname : '서버사이드'}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 브라우저 개발자 도구의 콘솔에서 자세한 로그를 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 