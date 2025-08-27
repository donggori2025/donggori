"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetNaverPage() {
  const router = useRouter();
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    // 모든 네이버 관련 쿠키 삭제
    const cookiesToDelete = [
      'naver_user',
      'userType', 
      'isLoggedIn',
      '__session',
      '_clerk_db_jwt',
      '_client_uat'
    ];

    cookiesToDelete.forEach(cookieName => {
      // 모든 경로에서 쿠키 삭제
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`;
    });

    // localStorage도 정리
    localStorage.removeItem('userType');
    localStorage.removeItem('factoryAuth');

    console.log('네이버 로그인 상태 완전 초기화 완료');
    setResetComplete(true);

    // 3초 후 메인 페이지로 리다이렉트
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        {resetComplete ? (
          <>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">네이버 로그인 상태 초기화 완료</h1>
            <p className="text-gray-600 mb-4">
              모든 네이버 관련 쿠키와 로그인 정보가 삭제되었습니다.
            </p>
            <p className="text-sm text-gray-500">
              3초 후 메인 페이지로 이동합니다...
            </p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">네이버 로그인 상태 초기화 중...</h1>
            <p className="text-gray-600">
              쿠키와 로그인 정보를 삭제하고 있습니다.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
