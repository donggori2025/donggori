"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { clerkConfig } from "@/lib/clerkConfig";
import { handleClerkError } from "@/lib/clerkErrorTranslator";
import { createUser, checkPhoneNumberExists, checkEmailExists } from '@/lib/userService';
import { config, safeValidateOAuthConfig } from "@/lib/config";

function SignUpForm() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  
  // 입력값 상태
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(true); // 이메일 인증 비활성화
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  // 약관 동의 상태
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  const [agreeKakaoMessage, setAgreeKakaoMessage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0); // 남은 시간(초)
  const [canResend, setCanResend] = useState(false); // 재요청 가능 여부
  // NodeJS 타입 경고 제거 (타입 명시)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { signUp, setActive } = useSignUp();
  const router = useRouter();

  // OAuth 사용자 정보 로드
  useEffect(() => {
    if (provider === 'kakao' || provider === 'naver' || provider === 'google') {
      const tempUserKey = provider === 'kakao' ? 'temp_kakao_user' : provider === 'naver' ? 'temp_naver_user' : 'temp_google_user';
      const tempUserStr = document.cookie
        .split('; ')
        .find(row => row.startsWith(tempUserKey + '='))
        ?.split('=')[1];
      
      if (tempUserStr) {
        try {
          const tempUser = JSON.parse(decodeURIComponent(tempUserStr));
          setName(tempUser.name || "");
          setEmail(tempUser.email || "");
          // 이메일이 있는 OAuth의 경우 이메일 인증을 건너뜀, 없는 경우 인증 절차 유지
          const hasEmail = !!tempUser.email;
          setEmailVerified(hasEmail);
          if (hasEmail) {
            setPassword("OAuthUserPassword123!");
            setPasswordConfirm("OAuthUserPassword123!");
          }
        } catch (error) {
          console.error('OAuth 사용자 정보 파싱 오류:', error);
        }
      }
    }
  }, [provider]);

  // 전체동의 <-> 개별동의 상태 동기화
  useEffect(() => {
    if (agreeTerms && agreePrivacy && agreeMarketing && agreeKakaoMessage) {
      setAgreeAll(true);
    } else {
      setAgreeAll(false);
    }
  }, [agreeTerms, agreePrivacy, agreeMarketing, agreeKakaoMessage]);

  // 전체동의 클릭 시 모든 항목 동기화
  const handleAgreeAll = (checked: boolean) => {
    setAgreeAll(checked);
    setAgreeTerms(checked);
    setAgreePrivacy(checked);
    setAgreeMarketing(checked);
    setAgreeKakaoMessage(checked);
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

  // 전화번호 형식 검증 (국내 하이픈 포함 입력 허용)
  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    return phoneRegex.test(phone);
  };

  // 전화번호 자동 포맷팅
  const formatPhone = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 이메일 인증 제거
  const handleEmailVerify = async () => {};

  // 인증번호 재요청
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerificationCode("");
      startTimer();
    } catch (err: unknown) {
      setError(handleClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증 코드 제출
  const handleVerifyCode = async () => {
    setError("");
    setLoading(true);
    try {
      const normalizeInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
      const cleanCode = normalizeInvisible(verificationCode);
      const res = await signUp?.attemptEmailAddressVerification({ code: cleanCode });
      if (res?.status === "complete") {
        setEmailVerified(true);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setError("인증 코드가 올바르지 않습니다.");
      }
    } catch (err: unknown) {
      setError(handleClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  // 휴대폰 OTP 요청
  const requestPhoneOtp = async () => {
    setError("");
    if (!phone || !validatePhone(phone)) return setError("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/phone/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'signup' })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || '인증번호 요청 실패');
      setVerificationSent(true);
      setVerificationCode("");
      startTimer();
    } catch (e: any) {
      setError(e?.message || '인증번호 요청 실패');
    } finally {
      setLoading(false);
    }
  };

  // 휴대폰 OTP 검증
  const verifyPhoneOtp = async () => {
    setError("");
    if (!verificationCode.trim()) return setError("인증 코드를 입력해주세요.");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: verificationCode.trim(), purpose: 'signup' })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || '인증 실패');
      // 휴대폰 인증 성공 시 이메일 인증과 동일하게 취급
      setEmailVerified(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (e: any) {
      setError(e?.message || '인증 실패');
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 입력값 검증
    if (!name.trim()) return setError("이름을 입력해주세요.");
    if (!phone) return setError("전화번호를 입력해주세요.");
    if (!validatePhone(phone)) return setError("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)");
    if (!email) return setError("이메일을 입력해주세요.");
    
    const normalizeInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const cleanEmail = normalizeInvisible(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) return setError("올바른 이메일 형식이 아닙니다.");
    
    // 도메인 제한 확인 (임시로 비활성화)
    // const domainError = clerkConfig.getDomainError(email);
    // if (domainError) {
    //   setError(domainError);
    //   return;
    // }
    
    if (!emailVerified) return setError("휴대폰 인증을 완료해주세요.");
    if (!agreeTerms || !agreePrivacy) return setError("필수 약관에 동의해주세요.");
    
    setLoading(true);
    try {
      // OAuth 사용자인 경우
      if (provider === 'kakao' || provider === 'naver') {
        const tempUserKey = provider === 'kakao' ? 'temp_kakao_user' : 'temp_naver_user';
        const tempUserStr = document.cookie
          .split('; ')
          .find(row => row.startsWith(tempUserKey + '='))
          ?.split('=')[1];
        
        if (tempUserStr) {
          const tempUser = JSON.parse(decodeURIComponent(tempUserStr));
          
          // 전화번호 중복 체크
          const phoneExists = await checkPhoneNumberExists(phone);
          if (phoneExists) {
            setError('이미 등록된 전화번호입니다.');
            return;
          }
          
          // Supabase에 사용자 저장
          const newUser = await createUser({
            email: tempUser.email || cleanEmail,
            name: tempUser.name,
            phoneNumber: phone,
            profileImage: tempUser.profileImage,
            signupMethod: provider,
            externalId: tempUser.kakaoId || tempUser.naverId,
            kakaoMessageConsent: agreeKakaoMessage,
          });
          
          console.log('OAuth 사용자 생성 성공:', newUser.email);
          
          // OAuth 사용자 정보를 쿠키에 저장
          const userData = {
            email: newUser.email,
            name: newUser.name,
            phoneNumber: newUser.phoneNumber,
            profileImage: newUser.profileImage,
            kakaoId: tempUser.kakaoId,
            naverId: tempUser.naverId,
            isOAuthUser: true,
            signupMethod: provider,
          };
          
          const finalUserKey = provider === 'kakao' ? 'kakao_user' : 'naver_user';
          document.cookie = `${finalUserKey}=${JSON.stringify(userData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `userType=user; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          
          // 임시 쿠키 삭제
          document.cookie = `${tempUserKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          
          // 사용자 정보를 localStorage에 저장
          localStorage.setItem('userType', 'user');
          localStorage.setItem('userName', name.trim());
          localStorage.setItem('userPhone', phone);
          localStorage.setItem('kakaoMessageConsent', agreeKakaoMessage.toString());
          
          window.location.href = '/';
          return;
        }
      }
      
      // 일반 회원가입 (Clerk 사용)
      if (!password) return setError("비밀번호를 입력해주세요.");
      if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
      if (password !== passwordConfirm) return setError("비밀번호가 일치하지 않습니다.");
      
      // 전화번호 중복 체크
      const phoneExists = await checkPhoneNumberExists(phone);
      if (phoneExists) {
        setError('이미 등록된 전화번호입니다.');
        return;
      }
      
      // 이메일 중복 체크
      const emailExists = await checkEmailExists(cleanEmail);
      if (emailExists) {
        setError('이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
        return;
      }
      
      // Supabase에 사용자 저장
      const newUser = await createUser({
        email: cleanEmail,
        name: name.trim(),
        phoneNumber: phone,
        password: password,
        signupMethod: 'email',
        kakaoMessageConsent: agreeKakaoMessage,
      });
      
      console.log('일반 사용자 생성 성공:', newUser.email);
      
      // 회원가입 완료 처리
      if (signUp?.status === "complete") {
        // 사용자 정보를 localStorage에 저장
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userName', name.trim());
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('kakaoMessageConsent', agreeKakaoMessage.toString());
        window.location.href = '/';
        return;
      }
      
      // 세션이 생성된 경우 활성화
      if (signUp?.createdSessionId) {
        await setActive({ session: signUp.createdSessionId });
        // 사용자 정보를 localStorage에 저장
        localStorage.setItem('userType', 'user');
        localStorage.setItem('userName', name.trim());
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('kakaoMessageConsent', agreeKakaoMessage.toString());
        window.location.href = '/';
        return;
      }
      
      setError("회원가입 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } catch (err: unknown) {
      console.error('Clerk 오류:', err);
      setError(handleClerkError(err));
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
      if (provider === 'oauth_naver') {
        const naverConfig = config.oauth.naver;
        if (!naverConfig.clientId) {
          setError('네이버 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          return;
        }
        
        const state = Math.random().toString(36).substring(7);
        const baseOrigin = typeof window !== 'undefined'
          ? (window.location.hostname.endsWith('donggori.com') ? 'https://www.donggori.com' : window.location.origin)
          : (process.env.NEXT_PUBLIC_SITE_URL || (naverConfig.redirectUri ? new URL(naverConfig.redirectUri).origin : ''));
        const naverRedirect = `${baseOrigin}/api/auth/naver/callback`;
        const naverState = btoa(JSON.stringify({ nonce: state, redirectUri: naverRedirect }));
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverConfig.clientId}&redirect_uri=${encodeURIComponent(naverRedirect)}&state=${encodeURIComponent(naverState)}&scope=email,name,profile_image&auth_type=reprompt`;
        
        console.log('네이버 OAuth URL:', naverAuthUrl);
        window.location.href = naverAuthUrl;
        return;
      }

      if (provider === 'oauth_kakao') {
        const kakaoConfig = config.oauth.kakao;
        if (!kakaoConfig.clientId) {
          setError('카카오 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          return;
        }
        
        const state = Math.random().toString(36).substring(7);
        const scope = 'account_email';
        const baseOrigin2 = typeof window !== 'undefined'
          ? (window.location.hostname.endsWith('donggori.com') ? 'https://www.donggori.com' : window.location.origin)
          : (process.env.NEXT_PUBLIC_SITE_URL || (kakaoConfig.redirectUri ? new URL(kakaoConfig.redirectUri).origin : ''));
        const kakaoRedirect = `${baseOrigin2}/api/auth/kakao/callback`;
        const kakaoState = btoa(JSON.stringify({ nonce: state, redirectUri: kakaoRedirect }));
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoConfig.clientId}&redirect_uri=${encodeURIComponent(kakaoRedirect)}&state=${encodeURIComponent(kakaoState)}&scope=${encodeURIComponent(scope)}&prompt=login+consent`;
        
        console.log('카카오 OAuth URL:', kakaoAuthUrl);
        window.location.href = kakaoAuthUrl;
        return;
      }
      
      // Google OAuth는 Clerk을 통해 처리
      if (provider === 'oauth_google') {
        const googleConfig = config.oauth.google;
        if (!googleConfig.clientId) {
          setError('구글 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          return;
        }
        
        console.log('Google OAuth 로그인 시작');
        await signUp.authenticateWithRedirect({
          strategy: provider as any,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/sso-callback',
        });
        return;
      }
      
      console.log('OAuth 로그인 시작:', provider);
      await signUp.authenticateWithRedirect({
        strategy: provider as any,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/sso-callback',
      });
    } catch (err: unknown) {
      setError(handleClerkError(err));
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
          이미 계정이 있으신가요? <Link href="/sign-in" className="text-blue-500 font-semibold">로그인</Link>
        </div>
      </div>
      {/* 회원가입 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
        {/* Clerk Smart CAPTCHA 위젯 */}
        <div id="clerk-captcha" className="mb-2" />
        
        {/* 이름 입력 */}
        <label className="text-sm font-semibold">이름 <span className="text-red-500">*</span></label>
        <input
          type="text"
          placeholder="이름을 입력해주세요."
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border rounded px-3 py-2"
        />
        
        {/* 전화번호 입력 */}
        <label className="text-sm font-semibold">전화번호 <span className="text-red-500">*</span></label>
        <input
          type="tel"
          placeholder="전화번호를 입력해주세요. (예: 010-1234-5678)"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          required
          className="border rounded px-3 py-2"
        />
        
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
          <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded text-sm">이메일 인증 불필요</span>
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
        
        {/* OAuth 사용자가 아닌 경우에만 비밀번호 입력 표시 */}
        {!provider && (
          <>
            <label className="text-sm font-semibold">비밀번호 <span className="text-red-500">*</span></label>
            <input
              type="password"
              placeholder="비밀번호를 입력해주세요."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border rounded px-3 py-2"
              disabled={false}
            />
            <label className="text-sm font-semibold">비밀번호 확인 <span className="text-red-500">*</span></label>
            <input
              type="password"
              placeholder="비밀번호를 다시 입력해주세요."
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              required
              className="border rounded px-3 py-2"
              disabled={false}
            />
          </>
        )}
        
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={agreeKakaoMessage}
                onChange={e => setAgreeKakaoMessage(e.target.checked)}
                id="agree-kakao-message"
                className="w-4 h-4"
              />
              <Link href="/terms/privacy" target="_blank" className="text-sm text-gray-700 underline hover:text-toss-blue">카카오톡 메시지 수신 동의(선택)</Link>
            </div>
          </div>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
            {error.includes("이미 가입된 이메일 주소입니다") && (
              <>
                {" "}
                <Link href="/sign-in" className="underline text-blue-600">로그인 하러가기</Link>
              </>
            )}
          </div>
        )}
        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded font-bold text-lg mt-2 hover:bg-gray-900 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          disabled={
            loading ||
            !name.trim() ||
            !phone ||
            !validatePhone(phone) ||
            !email ||
            !emailVerified ||
            (!provider && (!password || password.length < 6 || password !== passwordConfirm)) ||
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
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/Naver_final.svg" alt="네이버" width={32} height={32} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo_0624.svg" alt="동고리 로고" width={80} height={80} className="mb-2" />
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">DONG<span className="text-black">GORI</span></h1>
          <div className="text-lg font-semibold text-gray-700 mb-1">봉제공장이 필요한 순간, 동고리</div>
        </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col items-center">
          <Loader className="w-8 h-8 animate-spin text-gray-400" />
          <p className="mt-4 text-gray-500">로딩 중...</p>
        </div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
} 