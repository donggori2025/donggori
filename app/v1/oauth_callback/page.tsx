"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Clerk이 자동으로 OAuth 콜백을 처리하므로
    // 단순히 메인 페이지로 리다이렉트
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">로그인 처리 중...</h2>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
} 