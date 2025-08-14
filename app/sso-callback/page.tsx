"use client";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
function SSOCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

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
