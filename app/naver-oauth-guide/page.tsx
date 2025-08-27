"use client";
import React from 'react';

export default function NaverOAuthGuidePage() {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">네이버 OAuth 권한 설정 가이드</h1>
        
        <div className="space-y-6">
          {/* 권한 동의 화면 문제 해결 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-3">🚨 권한 동의 화면이 안 나오는 이유</h2>
            <div className="space-y-3 text-red-700">
              <div>1. <strong>네이버 개발자센터에서 권한 범위가 설정되지 않음</strong></div>
              <div>2. <strong>이미 동의한 권한이 있어서 자동으로 넘어감</strong></div>
              <div>3. <strong>테스트 사용자로 등록되지 않음</strong></div>
            </div>
          </div>

          {/* 네이버 개발자센터 설정 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-3">🔧 네이버 개발자센터 설정 방법</h2>
            <div className="space-y-4 text-blue-700">
              <div>
                <h3 className="font-semibold">1. 애플리케이션 선택</h3>
                <p>네이버 개발자센터 → 내 애플리케이션 → donggori 선택</p>
              </div>
              
              <div>
                <h3 className="font-semibold">2. API 설정 탭으로 이동</h3>
                <p>상단 탭에서 "API 설정" 클릭</p>
              </div>
              
              <div>
                <h3 className="font-semibold">3. 네이버 로그인 권한 설정</h3>
                <p>"네이버 로그인" 섹션에서 다음 권한들을 추가:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><code>이메일 주소</code> (email)</li>
                  <li><code>이름</code> (name)</li>
                  <li><code>프로필 사진</code> (profile_image)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">4. Callback URL 확인</h3>
                <p>Callback URL에 다음이 정확히 등록되어 있는지 확인:</p>
                <code className="block bg-blue-100 p-2 rounded mt-2">
                  http://localhost:3000/api/auth/naver/callback
                </code>
              </div>
            </div>
          </div>

          {/* 권한 동의 화면 강제 표시 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-3">✅ 권한 동의 화면 강제 표시 방법</h2>
            <div className="space-y-3 text-green-700">
              <div>
                <h3 className="font-semibold">방법 1: 네이버 계정에서 권한 해제</h3>
                <p>1. <a href="https://nid.naver.com/user2/help/myInfo.naver" target="_blank" rel="noopener noreferrer" className="underline">네이버 개인정보 관리</a> 접속</p>
                <p>2. "연결된 서비스 관리" → "donggori" 찾기</p>
                <p>3. "연결 해제" 클릭</p>
              </div>
              
              <div>
                <h3 className="font-semibold">방법 2: 시크릿 모드에서 테스트</h3>
                <p>1. 브라우저 시크릿 모드(Incognito) 활성화</p>
                <p>2. <a href="http://localhost:3000/debug-naver" className="underline">네이버 로그인 테스트</a> 접속</p>
                <p>3. 네이버 로그인 진행</p>
              </div>
              
              <div>
                <h3 className="font-semibold">방법 3: 다른 네이버 계정 사용</h3>
                <p>1. 다른 네이버 계정으로 로그인</p>
                <p>2. 테스트 사용자로 등록된 계정 사용</p>
              </div>
            </div>
          </div>

          {/* 테스트 사용자 등록 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-3">👥 테스트 사용자 등록 방법</h2>
            <div className="space-y-3 text-yellow-700">
              <div>
                <h3 className="font-semibold">1. 멤버관리 탭으로 이동</h3>
                <p>네이버 개발자센터 → donggori → "멤버관리" 탭</p>
              </div>
              
              <div>
                <h3 className="font-semibold">2. 테스트 사용자 추가</h3>
                <p>테스트할 네이버 계정의 이메일 주소를 입력하고 추가</p>
              </div>
              
              <div>
                <h3 className="font-semibold">3. 최대 5명까지 등록 가능</h3>
                <p>개발 중 상태에서는 테스트 사용자만 로그인 가능</p>
              </div>
            </div>
          </div>

          {/* 현재 설정된 권한 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-purple-800 mb-3">📋 현재 설정된 OAuth 권한</h2>
            <div className="space-y-2 text-purple-700">
              <div><strong>Client ID:</strong> <code>i7SHra722KMphfUUcPJX</code></div>
              <div><strong>Callback URL:</strong> <code>http://localhost:3000/api/auth/naver/callback</code></div>
              <div><strong>요청 권한:</strong> <code>email,name,profile_image</code></div>
              <div><strong>애플리케이션 상태:</strong> 개발 중</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
