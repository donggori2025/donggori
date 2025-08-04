"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  // 입력값 상태
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // 이메일 인증 여부
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  // 약관 동의 상태
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0); // 남은 시간(초)
  const [canResend, setCanResend] = useState(false); // 재요청 가능 여부
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  // 전체동의 <-> 개별동의 상태 동기화
  useEffect(() => {
    if (agreeTerms && agreePrivacy && agreeMarketing) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeTerms, agreePrivacy, agreeMarketing]);

  // 전체동의 클릭 시 모든 항목 동기화
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
  };

  // 타이머 시작 함수
  const startTimer = () => {
    setTimer(180); // 3분(180초)
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 이메일 인증 요청
  const handleEmailVerify = async () => {
    setError("");
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    setLoading(true);
    try {
      await signUp?.create({ emailAddress: email, password: password || "TempPassword!1" });
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationSent(true);
      setVerificationCode("");
      startTimer();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "이메일 인증 요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 인증번호 재요청
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationCode("");
      startTimer();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "인증번호 재요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증 코드 제출
  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signUp?.attemptEmailAddressVerification({ code: verificationCode });
      if (res?.status === "complete") {
        setEmailVerified(true);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setError("인증 코드가 올바르지 않습니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "이메일 인증 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("이메일을 입력해주세요.");
    if (!emailVerified) return setError("이메일 인증을 완료해주세요.");
    if (!password) return setError("비밀번호를 입력해주세요.");
    if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    if (password !== passwordConfirm) return setError("비밀번호가 일치하지 않습니다.");
    if (!agreeTerms || !agreePrivacy) return setError("필수 약관에 동의해주세요.");
    setLoading(true);
    try {
      if (!signUp || !signUp.createdSessionId) {
        setError("");
        setLoading(true);
        setTimeout(() => window.location.replace("/"), 2500);
        return;
      }
      await setActive({ session: signUp.createdSessionId });
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message :
        "예상치 못한 오류가 발생했습니다. 새로고침 후 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const handleSocial = async (provider: 'oauth_google' | 'oauth_kakao' | 'oauth_naver') => {
    setError("");
    if (!signUp) return;
    setLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider as any,
        redirectUrl: '/v1/oauth_callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "소셜 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 타이머를 mm:ss 형식으로 변환
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* 상단 로고/타이틀/설명 */}
      <div className="mb-8 flex flex-col items-center">
        <Image src="/logo_0624.svg" alt="동고리 로고" width={80} height={80} className="mb-2" />
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">DONG<span className="text-black">GORI</span></h1>
        <div className="text-lg font-semibold text-gray-700 mb-1">봉제공장이 필요한 순간, 동고리</div>
        <div className="text-gray-500 text-sm">
          아직 회원 아니신가요? <Link href="/sign-up" className="text-blue-500 font-semibold">회원가입</Link>
        </div>
      </div>
      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
        {/* Clerk Smart CAPTCHA 위젯 */}
        <div id="clerk-captcha" className="mb-2" />
        <label className="text-sm font-semibold">이메일</label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded px-3 py-2 flex-1"
            disabled={emailVerified}
          />
          {!emailVerified && !verificationSent && (
            <button type="button" onClick={handleEmailVerify} className="px-4 py-2 bg-gray-200 rounded text-sm font-semibold hover:bg-gray-300" disabled={loading}>
              이메일 인증
            </button>
          )}
          {verificationSent && !emailVerified && (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded text-sm font-semibold" disabled>
              인증코드 발송됨
            </button>
          )}
          {emailVerified && (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">인증완료</span>
          )}
        </div>
        {/* 인증코드 입력 및 타이머 */}
        {verificationSent && !emailVerified && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="인증코드 입력"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button type="button" onClick={handleVerifyCode} className="px-4 py-2 bg-blue-500 text-white rounded text-sm font-semibold hover:bg-blue-600" disabled={loading}>
              인증 확인
            </button>
            {/* 타이머/재요청 */}
            {!canResend ? (
              <span className="text-xs text-gray-500 w-16 text-center">{formatTime(timer)}</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-xs text-blue-500 underline w-16 text-center" disabled={loading}>
                인증번호 재요청
              </button>
            )}
          </div>
        )}
        <label className="text-sm font-semibold">비밀번호</label>
        <input
          type="password"
          placeholder="비밀번호를 입력해주세요."
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border rounded px-3 py-2"
          disabled={!emailVerified}
        />
        <label className="text-sm font-semibold">비밀번호 확인</label>
        <input
          type="password"
          placeholder="비밀번호를 다시 입력해주세요."
          value={passwordConfirm}
          onChange={e => setPasswordConfirm(e.target.value)}
          required
          className="border rounded px-3 py-2"
          disabled={!emailVerified}
        />
        {/* 약관 동의 영역 */}
        <div className="flex flex-col gap-2 mt-2">
          {/* 전체 동의 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={agreeAll}
              onChange={e => handleAgreeAll(e.target.checked)}
              id="agree-all"
              className="w-4 h-4"
              required
            />
            <label htmlFor="agree-all" className="text-sm font-semibold text-gray-700">전체 동의</label>
          </div>
          <div className="pl-6 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                id="agree-terms"
                className="w-4 h-4"
                required
              />
              <Link href="/terms/service" target="_blank" className="text-sm text-gray-700 underline hover:text-toss-blue">이용약관 동의(필수)</Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={e => setAgreePrivacy(e.target.checked)}
                id="agree-privacy"
                className="w-4 h-4"
                required
              />
              <Link href="/terms/privacy" target="_blank" className="text-sm text-gray-700 underline hover:text-toss-blue">개인정보이용동의(필수)</Link>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={e => setAgreeMarketing(e.target.checked)}
                id="agree-marketing"
                className="w-4 h-4"
              />
              <Link href="/terms/marketing" target="_blank" className="text-sm text-gray-700 underline hover:text-toss-blue">마케팅정보활용동의(선택)</Link>
            </div>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded font-bold text-lg mt-2 hover:bg-gray-900 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={
            loading ||
            !email ||
            !emailVerified ||
            !password ||
            password.length < 6 ||
            password !== passwordConfirm ||
            !agreeTerms ||
            !agreePrivacy
          }
        >
          {loading ? "가입 중..." : "회원가입"}
        </button>
        {/* 구분선 */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 text-sm">SNS 계정으로 로그인/회원가입</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        {/* 소셜 로그인 버튼 */}
        <div className="flex justify-center gap-6 mt-4">
          <button 
            type="button" 
            onClick={() => handleSocial("oauth_google")}
            disabled={loading}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/google.svg" alt="구글" width={32} height={32} />}
          </button>
          <button 
            type="button" 
            onClick={() => handleSocial("oauth_kakao")}
            disabled={loading}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/kakao_lastlast.svg" alt="카카오" width={32} height={32} />}
          </button>
          <button 
            type="button" 
            onClick={() => handleSocial("oauth_naver")}
            disabled={loading}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#03C75A] shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/naver_lastlast.svg" alt="네이버" width={32} height={32} />}
          </button>
        </div>
      </form>
    </div>
  );
} 