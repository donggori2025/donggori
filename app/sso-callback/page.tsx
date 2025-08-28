"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

function SSOCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const error = searchParams.get("error");

  // 구글 로그인 성공 시 통합 사용자 시스템에 저장
  useEffect(() => {
    if (isLoaded && user && !error) {
      const saveGoogleUser = async () => {
        try {
          console.log('구글 사용자 정보를 통합 시스템에 저장:', user);
          
          const userData = {
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.firstName || user.fullName || '',
            phone: '', // 구글에서는 전화번호를 제공하지 않음
            profileImage: user.imageUrl || '',
            loginMethod: 'google',
            externalId: user.externalId || user.id,
            kakaoMessageConsent: false
          };

          const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          if (response.ok) {
            console.log('구글 사용자 정보 저장 성공');
            // 성공적으로 저장되면 홈페이지로 리다이렉트
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            console.error('구글 사용자 정보 저장 실패:', response.statusText);
            // 저장 실패해도 홈페이지로 리다이렉트 (기존 Clerk 로그인은 유지)
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          }
        } catch (error) {
          console.error('구글 사용자 정보 저장 중 오류:', error);
          // 오류 발생해도 홈페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        }
      };

      saveGoogleUser();
    }
  }, [isLoaded, user, error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-sm text-center">
        {!error ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
            <p className="text-gray-600 text-sm mb-6">잠시만 기다려 주세요. 창을 닫지 마세요.</p>
          </>
        ) : (
          <>
            <div className="text-red-500 text-4xl mb-4">✗</div>
            <h2 className="text-xl font-semibold mb-2">로그인에 실패했어요</h2>
            <p className="text-gray-600 text-sm mb-6 break-all">{error}</p>
            <button onClick={() => router.push('/sign-in')} className="px-4 py-2 bg-black text-white rounded">로그인 페이지로 돌아가기</button>
          </>
        )}
        <AuthenticateWithRedirectCallback redirectUrl="/sso-callback" afterSignInUrl="/" afterSignUpUrl="/" />
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" /></div>}>
      <SSOCallbackContent />
    </Suspense>
  );
}
