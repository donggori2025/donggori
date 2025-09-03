"use client";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
function SSOCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    const run = async () => {
      if (!isLoaded || !isSignedIn || !user) return;
      // 이메일 기준으로 사용자 레코드 조회
      const email = user.emailAddresses?.[0]?.emailAddress || "";
      if (!email) {
        router.push("/sign-in?error=no_email");
        return;
      }

      const { data, error: dbError } = await supabase
        .from("users")
        .select("id, phoneNumber, name, profileImage")
        .eq("email", email)
        .limit(1)
        .maybeSingle();

      // 클라이언트 쿠키에 임시 사용자 저장 후 가입 폼으로 유도 (전화번호가 없거나 사용자 레코드 없음)
      if (dbError || !data || !data.phoneNumber) {
        const temp = {
          email,
          name: user.firstName || user.username || "",
          phoneNumber: undefined,
          profileImage: user.imageUrl,
          googleId: user.id,
          isOAuthUser: true,
          signupMethod: "google",
        };
        document.cookie = `temp_google_user=${encodeURIComponent(JSON.stringify(temp))}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        // snsAccessToken 발급(초기화 안됨)
        try {
          await fetch('/api/auth/sns/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, externalId: user.id, provider: 'google', isInitialized: false })
          });
        } catch {}
        router.replace("/sign-up?provider=google");
        return;
      }

      // 전화번호가 있으면 snsAccessToken 발급 후 홈으로 이동
      try {
        await fetch('/api/auth/sns/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, externalId: user.id, provider: 'google', isInitialized: true })
        });
      } catch {}
      router.replace("/");
    };
    run();
  }, [isLoaded, isSignedIn, user, router]);

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
        <AuthenticateWithRedirectCallback redirectUrl="/sso-callback" afterSignInUrl="/sso-callback" afterSignUpUrl="/sso-callback" />
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
