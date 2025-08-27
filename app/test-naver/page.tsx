"use client";
import React from 'react';

export default function TestNaverPage() {
  const handleNaverLogin = () => {
    const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    const currentPort = window.location.port || '3000';
    const redirectUri = process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || `http://localhost:${currentPort}/api/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);
    
    const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=email,name,profile_image`;
    
    console.log('네이버 OAuth URL:', naverAuthUrl);
    console.log('Client ID:', naverClientId);
    console.log('Redirect URI:', redirectUri);
    
    window.location.href = naverAuthUrl;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">네이버 로그인 테스트</h1>
        <button
          onClick={handleNaverLogin}
          className="px-6 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02b351] transition-colors"
        >
          네이버 로그인 테스트
        </button>
        <div className="mt-4 text-sm text-gray-600">
          <p>Client ID: {process.env.NEXT_PUBLIC_NAVER_CLIENT_ID}</p>
          <p>Redirect URI: {process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI}</p>
        </div>
      </div>
    </div>
  );
}
