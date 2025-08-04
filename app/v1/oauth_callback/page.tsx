"use client";
import { useSignIn } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthCallbackPage() {
  const { signIn, isLoaded } = useSignIn();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const handleCallback = async () => {
      try {
        const result = await signIn.attemptFirstFactor({
          strategy: "oauth_callback",
          redirectUrl: "/v1/oauth_callback",
        });

        if (result.status === "complete") {
          // 소셜 로그인 성공
          localStorage.setItem('userType', 'user');
          router.push("/");
        } else {
          // 추가 인증이 필요한 경우
          console.log("Additional authentication required");
          router.push("/");
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        router.push("/sign-in?error=oauth_failed");
      }
    };

    handleCallback();
  }, [signIn, isLoaded, router]);

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