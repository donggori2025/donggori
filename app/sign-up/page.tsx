"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { createUser, checkPhoneNumberExists, checkEmailExists, checkSupabaseConnection } from '@/lib/userService';
import { config, safeValidateOAuthConfig } from "@/lib/config";

function SignUpForm() {
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  
  // 입력값 상태
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false); // 이메일 인증 여부
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
  const router = useRouter();

  // OAuth 사용자 정보 로드
  useEffect(() => {
    if (provider === 'kakao' || provider === 'naver') {
      const tempUserKey = provider === 'kakao' ? 'temp_kakao_user' : 'temp_naver_user';
      const tempUserStr = document.cookie
        .split('; ')
        .find(row => row.startsWith(tempUserKey + '='))
        ?.split('=')[1];
      
      if (tempUserStr) {
        try {
          const tempUser = JSON.parse(decodeURIComponent(tempUserStr));
          setName(tempUser.name || "");
          setEmail(tempUser.email || "");
          const hasEmail = !!tempUser.email;
          if (tempUser.phoneNumber) {
            const normalized = formatPhone(tempUser.phoneNumber);
            setPhone(normalized);
          }
          // 소셜 로그인 사용자는 이메일 인증 완료로 간주
          if (tempUser.email) {
            setEmailVerified(true);
          }
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
    const digitsOnly = String(value || '').replace(/[^0-9]/g, '');
    if (!digitsOnly) return '';
    // +82로 온 경우 국내형식으로 변환
    const local = digitsOnly.startsWith('82') ? `0${digitsOnly.slice(2)}` : digitsOnly;
    const n = local.replace(/^0+/, '0');
    if (n.length <= 3) return n;
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`;
  };


  // 인증번호 재요청
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      await requestEmailOtp();
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증 코드 제출
  const handleVerifyCode = async () => {
    setError("");
    if (!verificationCode.trim()) return setError("인증 코드를 입력해주세요.");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode.trim(), purpose: 'signup' })
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || '인증 실패');
      // 이메일 인증 성공
      setEmailVerified(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (e: any) {
      setError(e?.message || '인증 실패');
    } finally {
      setLoading(false);
    }
  };

  // 이메일 OTP 요청
  const requestEmailOtp = async () => {
    setError("");
    if (!email) return setError("이메일을 입력해주세요.");
    
    const normalizeInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const cleanEmail = normalizeInvisible(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) return setError("올바른 이메일 형식이 아닙니다.");
    
    // 이메일 중복 체크
    try {
      const exists = await checkEmailExists(cleanEmail);
      if (exists) {
        const msg = '이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.';
        setError(msg);
        if (typeof window !== 'undefined') alert(msg);
        return;
      }
    } catch (e) {
      // 중복 체크 실패 시에도 인증 요청을 막지는 않음
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/auth/email/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose: 'signup' })
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


  // 회원가입 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // 입력값 검증
    if (!name.trim()) return setError("이름을 입력해주세요.");
    if (!email) return setError("이메일을 입력해주세요.");
    
    const normalizeInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    const cleanEmail = normalizeInvisible(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) return setError("올바른 이메일 형식이 아닙니다.");
    
    if (!emailVerified) return setError("이메일 인증을 완료해주세요.");
    if (!agreeTerms || !agreePrivacy) return setError("필수 약관에 동의해주세요.");
    
    setLoading(true);
    try {
      // Supabase 연결 상태 확인
      const connectionCheck = await checkSupabaseConnection();
      if (!connectionCheck.success) {
        throw new Error(`데이터베이스 연결 오류: ${connectionCheck.error || '알 수 없는 오류'}`);
      }
      // OAuth 사용자인 경우
      if (provider === 'kakao' || provider === 'naver') {
        const tempUserKey = provider === 'kakao' ? 'temp_kakao_user' : 'temp_naver_user';
        const tempUserStr = document.cookie
          .split('; ')
          .find(row => row.startsWith(tempUserKey + '='))
          ?.split('=')[1];
        
        if (tempUserStr) {
          const tempUser = JSON.parse(decodeURIComponent(tempUserStr));
          
          // 이메일 중복 체크
          const emailExists = await checkEmailExists(cleanEmail);
          if (emailExists) {
            const msg = '이미 등록된 이메일이라 해당 소셜로는 회원가입이 불가합니다. 메인으로 이동합니다.';
            setError(msg);
            if (typeof window !== 'undefined') alert(msg);
            window.location.href = '/';
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
      
      // 일반 회원가입 (Supabase만 사용)
      if (!password) return setError("비밀번호를 입력해주세요.");
      if (password.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
      if (password !== passwordConfirm) return setError("비밀번호가 일치하지 않습니다.");
      
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
      
      // 회원가입 완료 처리 - 사용자 정보를 localStorage에 저장
      localStorage.setItem('userType', 'user');
      localStorage.setItem('userName', name.trim());
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('kakaoMessageConsent', agreeKakaoMessage.toString());
      localStorage.setItem('userEmail', cleanEmail);
      
      // 성공 메시지 표시 후 메인 페이지로 이동
      alert('회원가입이 완료되었습니다!');
      window.location.href = '/';
    } catch (err: unknown) {
      console.error('회원가입 오류:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const handleSocial = async (provider: 'oauth_kakao' | 'oauth_naver') => {
    setError("");
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
      
      console.log('OAuth 로그인 시작:', provider);
      // Kakao/Naver만 지원
    } catch (err: unknown) {
      console.error('소셜 로그인 오류:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
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
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded-xl shadow p-8 flex flex-col gap-4">
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
        
        {/* 전화번호 입력 (선택사항) */}
        <label className="text-sm font-semibold">전화번호 (선택사항)</label>
        <input
          type="tel"
          placeholder="전화번호를 입력해주세요. (예: 010-1234-5678)"
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          className="border rounded px-3 py-2"
        />
        
        <label className="text-sm font-semibold">이메일 <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="이메일을 입력해주세요."
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border rounded px-3 py-2 flex-1"
            disabled={false}
          />
          {emailVerified ? (
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded text-sm font-semibold">인증완료</span>
          ) : verificationSent ? (
            <button type="button" className="px-4 py-2 bg-gray-200 rounded text-sm font-semibold" disabled>
              인증코드 발송됨
            </button>
          ) : (
            <button type="button" onClick={requestEmailOtp} className="px-4 py-2 bg-gray-200 rounded text-sm font-semibold hover:bg-gray-300" disabled={loading || !email}>
              이메일 인증
            </button>
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
        <div className="flex justify-center gap-6 mt-5">
          {/* 구글 버튼 제거 */}
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