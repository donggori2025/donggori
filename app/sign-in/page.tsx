"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";

function ErrorHandler({ onError }: { onError: (error: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const messages: Record<string, string> = {
      duplicate_phone: "이미 등록된 전화번호입니다.",
      duplicate_email: "이미 등록된 이메일입니다.",
      kakao_oauth_error: "카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      naver_oauth_error: "네이버 로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
      no_code: "인증 코드를 받지 못했습니다. 다시 시도해주세요.",
      token_exchange_failed: "인증 토큰 교환에 실패했습니다. 다시 시도해주세요.",
      user_info_failed: "사용자 정보를 가져오지 못했습니다. 다시 시도해주세요.",
      no_email: "소셜 계정의 이메일 제공 동의가 필요합니다.",
      user_creation_failed: "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.",
      server_error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      account_link_required: "같은 이메일로 이미 가입된 계정입니다. 기존 로그인 방식을 이용해주세요.",
    };
    const error = searchParams.get("error");
    if (error) onError(messages[error] || "로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
  }, [searchParams, onError]);

  return null;
}

function SignInForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [socialLoading, setSocialLoading] = useState<"kakao" | "naver" | null>(null);
  const next = searchParams.get("next");
  const nextPath = next && /^\/(?!\/)[^\\\r\n]*$/.test(next) ? next : "/";

  const handleSocial = (provider: "kakao" | "naver") => {
    setError("");
    setSocialLoading(provider);
    window.location.href = `/api/auth/oauth/start?provider=${provider}&next=${encodeURIComponent(nextPath)}`;
  };

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
      <ErrorHandler onError={setError} />
      <h2 className="text-center text-xl font-bold">소셜 계정으로 로그인</h2>
      <p className="mt-2 text-center text-sm text-gray-500">
        로그인과 회원가입은 카카오 또는 네이버 계정으로 진행됩니다.
      </p>
      {error && <div className="mt-5 text-center text-sm text-red-500">{error}</div>}

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => handleSocial("kakao")}
          disabled={socialLoading !== null}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#FEE500] font-semibold text-[#191919] transition hover:brightness-95 disabled:opacity-60"
          aria-busy={socialLoading === "kakao"}
        >
          {socialLoading === "kakao" ? <Loader className="h-5 w-5 animate-spin" /> : <Image src="/kakao_lastlast.svg" alt="" width={28} height={28} />}
          카카오로 계속하기
        </button>
        <button
          type="button"
          onClick={() => handleSocial("naver")}
          disabled={socialLoading !== null}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-[#03C75A] font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
          aria-busy={socialLoading === "naver"}
        >
          {socialLoading === "naver" ? <Loader className="h-5 w-5 animate-spin" /> : <Image src="/naver_icon.svg" alt="" width={25} height={25} />}
          네이버로 계속하기
        </button>
      </div>

      {socialLoading && (
        <p className="mt-4 text-center text-sm text-gray-500">
          {socialLoading === "kakao" ? "카카오" : "네이버"}로 이동 중입니다...
        </p>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">DONGGORI</h1>
        <p className="text-lg font-semibold text-gray-700">봉제공장이 필요한 순간, 동고리</p>
      </div>
      <Suspense fallback={<Loader className="h-10 w-10 animate-spin text-black" />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}
