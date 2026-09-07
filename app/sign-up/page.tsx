"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";

type SocialProvider = "kakao" | "naver";

function SocialButtons({ loading, onSelect }: { loading: SocialProvider | null; onSelect: (provider: SocialProvider) => void }) {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => onSelect("kakao")}
        disabled={loading !== null}
        className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#FEE500] font-semibold text-[#191919] disabled:opacity-60"
      >
        {loading === "kakao" ? <Loader className="h-5 w-5 animate-spin" /> : <Image src="/kakao_lastlast.svg" alt="" width={28} height={28} />}
        카카오로 가입하기
      </button>
      <button
        type="button"
        onClick={() => onSelect("naver")}
        disabled={loading !== null}
        className="flex h-12 items-center justify-center gap-3 rounded-lg bg-[#03C75A] font-semibold text-white disabled:opacity-60"
      >
        {loading === "naver" ? <Loader className="h-5 w-5 animate-spin" /> : <Image src="/naver_icon.svg" alt="" width={25} height={25} />}
        네이버로 가입하기
      </button>
    </div>
  );
}

function SignUpForm() {
  const searchParams = useSearchParams();
  const rawProvider = searchParams.get("provider");
  const provider: SocialProvider | null = rawProvider === "kakao" || rawProvider === "naver" ? rawProvider : null;
  const next = searchParams.get("next");
  const nextPath = next && /^\/(?!\/)[^\\\r\n]*$/.test(next) ? next : "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [contextLoading, setContextLoading] = useState(provider !== null);
  const [loading, setLoading] = useState<SocialProvider | "submit" | null>(null);
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!provider) return;
    fetch("/api/auth/signup-context", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.provider !== provider || !payload.email) {
          throw new Error(payload.error || "소셜 계정의 이메일 제공 동의가 필요합니다.");
        }
        setEmail(payload.email);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "소셜 가입 정보를 확인하지 못했습니다."))
      .finally(() => setContextLoading(false));
  }, [provider]);

  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSocial = (selectedProvider: SocialProvider) => {
    setLoading(selectedProvider);
    window.location.href = `/api/auth/oauth/start?provider=${selectedProvider}&mode=signup&next=${encodeURIComponent(nextPath)}`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!provider || !email) return setError("소셜 인증을 다시 진행해주세요.");
    if (!name.trim()) return setError("이름을 입력해주세요.");
    if (!agreeTerms || !agreePrivacy) return setError("필수 약관에 동의해주세요.");

    setError("");
    setLoading("submit");
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name.trim(), phoneNumber: phone, signupMethod: provider }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "회원가입 중 오류가 발생했습니다.");
      window.location.assign(nextPath);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "회원가입 중 오류가 발생했습니다.");
      setLoading(null);
    }
  };

  if (!provider) {
    return (
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h2 className="text-center text-xl font-bold">소셜 계정으로 회원가입</h2>
        <p className="mb-6 mt-2 text-center text-sm text-gray-500">별도의 이메일 비밀번호 가입은 현재 운영하지 않습니다.</p>
        <SocialButtons loading={loading === "kakao" || loading === "naver" ? loading : null} onSelect={handleSocial} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl bg-white p-8 shadow">
      <h2 className="text-xl font-bold">가입 정보 확인</h2>
      <p className="mb-6 mt-1 text-sm text-gray-500">{provider === "kakao" ? "카카오" : "네이버"} 인증이 완료되었습니다.</p>

      <div className="flex flex-col gap-4">
        <label className="text-sm font-semibold">이름 <span className="text-red-500">*</span>
          <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded border px-3 py-2 font-normal" required />
        </label>
        <label className="text-sm font-semibold">전화번호 (선택)
          <input type="tel" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} placeholder="010-1234-5678" className="mt-2 w-full rounded border px-3 py-2 font-normal" />
        </label>
        <label className="text-sm font-semibold">소셜 계정 이메일
          <input type="email" value={email} readOnly className="mt-2 w-full rounded border bg-gray-50 px-3 py-2 font-normal text-gray-600" />
        </label>

        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={agreeAll} onChange={(event) => handleAgreeAll(event.target.checked)} className="h-4 w-4" />
            전체 동의
          </label>
          <label className="ml-6 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={agreeTerms} onChange={(event) => setAgreeTerms(event.target.checked)} className="h-4 w-4" />
            <Link href="/terms/service" target="_blank" className="underline">이용약관 동의(필수)</Link>
          </label>
          <label className="ml-6 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={agreePrivacy} onChange={(event) => setAgreePrivacy(event.target.checked)} className="h-4 w-4" />
            <Link href="/terms/privacy" target="_blank" className="underline">개인정보 처리방침 동의(필수)</Link>
          </label>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={contextLoading || loading !== null || !email || !name.trim() || !agreeTerms || !agreePrivacy} className="mt-2 flex h-12 items-center justify-center rounded bg-black font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">
          {contextLoading || loading === "submit" ? <Loader className="h-5 w-5 animate-spin" /> : "회원가입 완료"}
        </button>
      </div>
    </form>
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className={`${PAGE_CONTAINER_CLASS} flex flex-col items-center py-12`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <Image src="/logo_0624.svg" alt="동고리 로고" width={80} height={80} className="mb-2" />
          <h1 className="text-4xl font-extrabold tracking-tight">DONGGORI</h1>
          <p className="mt-2 text-sm text-gray-500">이미 계정이 있으신가요? <Link href="/sign-in" className="font-semibold text-blue-500">로그인</Link></p>
        </div>
        <Suspense fallback={<Loader className="h-8 w-8 animate-spin text-gray-400" />}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
