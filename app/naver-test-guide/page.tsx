"use client";
import React from 'react';
import Link from 'next/link';

export default function NaverTestGuidePage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">네이버 로그인 테스트 가이드</h1>
        
        <div className="space-y-6">
          {/* 1단계: 초기화 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-3">1단계: 로그인 상태 초기화</h2>
            <p className="text-red-700 mb-4">
              네이버 로그인 화면을 캡처하기 위해 먼저 모든 로그인 상태를 초기화해야 합니다.
            </p>
            <div className="space-y-2">
              <Link 
                href="/reset-naver" 
                className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                네이버 로그인 상태 초기화
              </Link>
              <p className="text-sm text-red-600">
                위 버튼을 클릭하면 모든 네이버 관련 쿠키가 삭제됩니다.
              </p>
            </div>
          </div>

          {/* 2단계: 네이버 로그아웃 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">2단계: 네이버 계정 로그아웃</h2>
            <p className="text-yellow-700 mb-4">
              네이버 웹사이트에서도 로그아웃해야 합니다.
            </p>
            <div className="space-y-2">
              <a 
                href="https://nid.naver.com/nidlogin.logout" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
              >
                네이버 로그아웃 (새 탭에서 열기)
              </a>
              <p className="text-sm text-yellow-600">
                네이버 로그아웃 페이지에서 로그아웃을 완료하세요.
              </p>
            </div>
          </div>

          {/* 3단계: 테스트 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-3">3단계: 네이버 로그인 테스트</h2>
            <p className="text-green-700 mb-4">
              이제 네이버 로그인 화면을 캡처할 수 있습니다.
            </p>
            <div className="space-y-2">
              <Link 
                href="/debug-naver" 
                className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                네이버 로그인 테스트
              </Link>
              <p className="text-sm text-green-600">
                위 버튼을 클릭하면 네이버 로그인 화면으로 이동합니다.
              </p>
            </div>
          </div>

          {/* 캡처 가이드 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">📸 캡처 가이드</h2>
            <div className="space-y-3 text-blue-700">
              <div>
                <strong>1단계 캡처:</strong> 로그인 페이지에서 네이버 버튼 클릭
              </div>
              <div>
                <strong>2단계 캡처:</strong> 네이버 로그인 화면 (아이디/비밀번호 입력 화면)
              </div>
              <div>
                <strong>3단계 캡처:</strong> 네이버 권한 동의 화면
              </div>
              <div>
                <strong>4단계 캡처:</strong> 로그인 완료 후 메인 페이지 (우상단에 사용자 정보 표시)
              </div>
            </div>
          </div>

          {/* 네이버 개발자센터 설정 확인 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-3">🔧 네이버 개발자센터 설정 확인</h2>
            <div className="space-y-2 text-purple-700">
              <div>✅ Client ID: <code>i7SHra722KMphfUUcPJX</code></div>
              <div>✅ Callback URL: <code>http://localhost:3000/api/auth/naver/callback</code></div>
              <div>✅ 애플리케이션 상태: &quot;개발 중&quot;</div>
              <div>✅ 테스트 사용자 등록 필요</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
