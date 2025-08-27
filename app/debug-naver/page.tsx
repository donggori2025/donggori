"use client";
import React, { useEffect, useState } from 'react';

export default function DebugNaverPage() {
  const [envVars, setEnvVars] = useState<any>({});

  useEffect(() => {
    setEnvVars({
      NEXT_PUBLIC_NAVER_CLIENT_ID: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID,
      NEXT_PUBLIC_NAVER_REDIRECT_URI: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI,
      currentPort: window.location.port,
      currentHost: window.location.host,
      currentOrigin: window.location.origin,
    });
  }, []);

  const handleNaverLogin = () => {
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || `http://localhost:${window.location.port}/api/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,name,profile_image`;
    
    console.log('=== 네이버 OAuth 디버그 정보 ===');
    console.log('Client ID:', naverClientId);
    console.log('Redirect URI:', redirectUri);
    console.log('State:', state);
    console.log('Full URL:', naverAuthUrl);
    console.log('==============================');
    
    window.location.href = naverAuthUrl;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">네이버 OAuth 디버그</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">환경변수 확인</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Client ID:</strong> {envVars.NEXT_PUBLIC_NAVER_CLIENT_ID || '설정되지 않음'}</div>
            <div><strong>Redirect URI:</strong> {envVars.NEXT_PUBLIC_NAVER_REDIRECT_URI || '설정되지 않음'}</div>
            <div><strong>현재 포트:</strong> {envVars.currentPort || '80'}</div>
            <div><strong>현재 호스트:</strong> {envVars.currentHost}</div>
            <div><strong>현재 Origin:</strong> {envVars.currentOrigin}</div>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-3">네이버 개발자센터 설정 확인사항</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Client ID가 정확히 등록되어 있는지 확인</li>
            <li>Redirect URI가 <code>http://localhost:3000/api/auth/naver/callback</code>로 정확히 등록되어 있는지 확인</li>
            <li>애플리케이션 상태가 "개발 중"인지 확인</li>
            <li>테스트 사용자로 등록되어 있는지 확인</li>
          </ul>
        </div>

        <div className="text-center">
          <button
            onClick={handleNaverLogin}
            className="px-6 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition-colors"
          >
            네이버 로그인 테스트
          </button>
        </div>

        <div className="mt-6 bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">문제 해결 방법</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>네이버 개발자센터에서 Redirect URI를 <code>http://localhost:3000/api/auth/naver/callback</code>로 정확히 등록</li>
            <li>브라우저 개발자 도구 콘솔에서 로그 확인</li>
            <li>네트워크 탭에서 OAuth 요청/응답 확인</li>
            <li>환경변수가 제대로 로드되었는지 확인</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
