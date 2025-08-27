"use client";
import React, { useState, useEffect } from 'react';

export default function DebugKakaoPage() {
  const [envVars, setEnvVars] = useState<any>({});
  const [kakaoAuthUrl, setKakaoAuthUrl] = useState('');

  useEffect(() => {
    // 환경 변수 확인
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const kakaoClientSecret = process.env.KAKAO_CLIENT_SECRET;
    const kakaoRedirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || 'http://localhost:3000/api/auth/kakao/callback';
    
    setEnvVars({
      kakaoClientId,
      kakaoClientSecret: kakaoClientSecret ? '설정됨' : '설정되지 않음',
      kakaoRedirectUri,
    });

    // 카카오 OAuth URL 생성
    if (kakaoClientId) {
      const currentPort = window.location.port || '3000';
      const redirectUri = kakaoRedirectUri || `http://localhost:${currentPort}/api/auth/kakao/callback`;
      const state = Math.random().toString(36).substring(7);
      
      const authUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
      setKakaoAuthUrl(authUrl);
    }
  }, []);

  const handleKakaoLogin = () => {
    if (kakaoAuthUrl) {
      console.log('카카오 OAuth URL:', kakaoAuthUrl);
      window.location.href = kakaoAuthUrl;
    } else {
      alert('카카오 클라이언트 ID가 설정되지 않았습니다.');
    }
  };

  const handleResetKakao = () => {
    // 카카오 관련 쿠키 삭제
    document.cookie = "kakao_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    // 로컬 스토리지 삭제
    localStorage.removeItem('userType');
    
    alert('카카오 로그인 상태가 초기화되었습니다.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">카카오 로그인 디버그</h1>
        
        {/* 환경 변수 상태 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">환경 변수 상태</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">카카오 클라이언트 ID:</span>
              <span className={envVars.kakaoClientId ? 'text-green-600' : 'text-red-600'}>
                {envVars.kakaoClientId || '설정되지 않음'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">카카오 클라이언트 시크릿:</span>
              <span className={envVars.kakaoClientSecret === '설정됨' ? 'text-green-600' : 'text-red-600'}>
                {envVars.kakaoClientSecret}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">리다이렉트 URI:</span>
              <span className="text-blue-600">{envVars.kakaoRedirectUri}</span>
            </div>
          </div>
        </div>

        {/* 카카오 OAuth URL */}
        {kakaoAuthUrl && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">카카오 OAuth URL</h2>
            <div className="bg-gray-100 p-3 rounded text-sm break-all">
              {kakaoAuthUrl}
            </div>
          </div>
        )}

        {/* 테스트 버튼들 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">테스트</h2>
          <div className="space-y-3">
            <button
              onClick={handleKakaoLogin}
              disabled={!envVars.kakaoClientId}
              className="w-full bg-yellow-400 text-black py-3 px-4 rounded-lg font-medium hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              카카오 로그인 테스트
            </button>
            <button
              onClick={handleResetKakao}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600"
            >
              카카오 로그인 상태 초기화
            </button>
          </div>
        </div>

        {/* 설정 가이드 */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">설정 가이드</h2>
          <div className="space-y-3 text-blue-800">
            <div>
              <h3 className="font-medium">1. 카카오 개발자센터 설정</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• Web 플랫폼 등록</li>
                <li>• 사이트 도메인: http://localhost:3000</li>
                <li>• Redirect URI: http://localhost:3000/api/auth/kakao/callback</li>
                <li>• 동의항목: 닉네임, 프로필 사진, 이메일 (필수)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">2. 환경 변수 설정</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• .env.local 파일에 카카오 OAuth 설정 추가</li>
                <li>• REST API 키를 NEXT_PUBLIC_KAKAO_CLIENT_ID에 설정</li>
                <li>• Client Secret을 KAKAO_CLIENT_SECRET에 설정</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium">3. 서버 재시작</h3>
              <ul className="ml-4 space-y-1 text-sm">
                <li>• 환경 변수 적용을 위해 개발 서버 재시작</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
