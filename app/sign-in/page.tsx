"use client";
import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getFactoryAuthWithRealName } from "@/lib/factoryAuth";
import { clerkConfig } from "@/lib/clerkConfig";
import { handleClerkError } from "@/lib/clerkErrorTranslator";
import { config, safeValidateOAuthConfig } from "@/lib/config";

// Clerk 설정 검증
function validateClerkSetup() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    return {
      isValid: false,
      message: '인증 서비스 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.'
    };
  }
  
  if (!publishableKey.startsWith('pk_')) {
    return {
      isValid: false,
      message: '인증 서비스 설정이 올바르지 않습니다. 관리자에게 문의해주세요.'
    };
  }
  
  return { isValid: true, message: '' };
}

// 오류 메시지 처리를 위한 컴포넌트
function ErrorHandler({ onError }: { onError: (error: string) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      switch (errorParam) {
        case 'duplicate_phone':
          onError('이미 등록된 전화번호입니다. 다른 전화번호를 사용해주세요.');
          break;
        case 'duplicate_email':
          onError('이미 등록된 이메일입니다. 다른 이메일을 사용하거나 로그인해주세요.');
          break;
        case 'kakao_oauth_error':
          onError('카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'naver_oauth_error':
          onError('네이버 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'no_code':
          onError('인증 코드를 받지 못했습니다. 다시 시도해주세요.');
          break;
        case 'token_exchange_failed':
          onError('인증 토큰 교환에 실패했습니다. 다시 시도해주세요.');
          break;
        case 'user_info_failed':
          onError('사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.');
          break;
        case 'no_email':
          onError('이메일 정보를 받지 못했습니다. 다시 시도해주세요.');
          break;
        case 'user_creation_failed':
          onError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'server_error':
          onError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          break;
        default:
          onError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  }, [searchParams, onError]);

  return null;
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoaded } = useSignIn();
  const [socialLoading, setSocialLoading] = useState<null | 'google' | 'kakao' | 'naver'>(null);

  // 소셜 로그인 핸들러
  const handleSocial = async (provider: 'oauth_google' | 'oauth_kakao' | 'oauth_naver') => {
    setError("");
    if (!isLoaded) return;
    setLoading(true);
    setSocialLoading(provider === 'oauth_google' ? 'google' : provider === 'oauth_kakao' ? 'kakao' : 'naver');
    
    try {
      if (provider === 'oauth_naver') {
        const naverConfig = config.oauth.naver;
        if (!naverConfig.clientId) {
          setError('네이버 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          setSocialLoading(null);
          return;
        }
        
        const state = Math.random().toString(36).substring(7);
        const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverConfig.clientId}&redirect_uri=${encodeURIComponent(naverConfig.redirectUri)}&state=${state}&scope=email,name,profile_image`;
        
        console.log('네이버 OAuth URL:', naverAuthUrl);
        window.location.href = naverAuthUrl;
        return;
      }

      if (provider === 'oauth_kakao') {
        const kakaoConfig = config.oauth.kakao;
        if (!kakaoConfig.clientId) {
          setError('카카오 로그인 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.');
          setLoading(false);
          setSocialLoading(null);
          return;
        }
        
        const state = Math.random().toString(36).substring(7);
        // Kakao 권한: 이메일과 프로필 이미지만 요청 (전화번호는 민감/제공 제한)
        const scope = 'account_email,profile_image,profile_nickname';
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakaoConfig.clientId}&redirect_uri=${encodeURIComponent(kakaoConfig.redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
        
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
          setSocialLoading(null);
          return;
        }
        
        console.log('Google OAuth 로그인 시작');
        await signIn.authenticateWithRedirect({
          strategy: provider as any,
          redirectUrl: '/sso-callback',
          redirectUrlComplete: '/',
        });
        return;
      }
      
      console.log('OAuth 로그인 시작:', provider);
      await signIn.authenticateWithRedirect({
        strategy: provider as any,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      console.error('OAuth 로그인 오류:', err);
      setError(handleClerkError(err));
      setLoading(false);
      setSocialLoading(null);
    }
  };

  // 로그인 폼 제출
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // 먼저 봉제공장 로그인 시도
      const normalizeInvisible = (s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
      const cleanId = normalizeInvisible(email);
      const cleanPw = normalizeInvisible(password);

      const factoryAuth = await getFactoryAuthWithRealName(cleanId, cleanPw);
      
      if (factoryAuth) {
        console.log('봉제공장 로그인 성공:', factoryAuth.factoryName);
        
        document.cookie = `factory_user=${JSON.stringify({
          id: cleanId,
          realName: factoryAuth.factoryName,
          isFactoryUser: true,
        })}; path=/; max-age=${60 * 60 * 24 * 7}`;

        document.cookie = `userType=factory; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`;

        window.location.href = '/';
        return;
      }

      // 봉제공장 로그인 실패 시 일반 사용자 로그인 시도
      console.log('봉제공장 로그인 실패, 일반 사용자 로그인 시도');
      
      if (!isLoaded || !signIn) {
        setError('로그인 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        console.log('일반 사용자 로그인 성공');
        
        document.cookie = `userType=user; path=/; max-age=${60 * 60 * 24 * 7}`;
        document.cookie = `isLoggedIn=true; path=/; max-age=${60 * 60 * 24 * 7}`;

        window.location.href = '/';
      } else {
        console.log('로그인 상태:', result.status);
        setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (err: unknown) {
      console.error('로그인 오류:', err);
      setError(handleClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
      <label className="text-sm font-semibold">이메일</label>
      <input
        type="text"
        placeholder="이메일(사용자) 또는 봉제공장 아이디 입력"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        required
        className="border rounded px-3 py-2"
      />
      <label className="text-sm font-semibold">비밀번호</label>
      <div className="flex items-center border rounded px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-black">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="비밀번호를 입력해주세요."
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          required
          className="flex-1 outline-none bg-transparent"
          style={{ minWidth: 0 }}
        />
        <button
          type="button"
          tabIndex={-1}
          className="ml-2 text-gray-400 hover:text-black"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex items-center justify-between text-sm mt-2 mb-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
            id="remember"
            className="w-4 h-4"
          />
          <label htmlFor="remember" className="text-gray-700">아이디 저장</label>
        </div>
        <a href="#" className="text-gray-400 hover:text-black">비밀번호를 잊으셨나요?</a>
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <button type="submit" className="w-full bg-black text-white py-3 rounded font-bold text-lg mt-2 hover:bg-gray-900 transition flex items-center justify-center" disabled={loading}>
        {loading ? <Loader className="w-5 h-5 animate-spin" /> : "로그인"}
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
          className="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm hover:shadow-md transition-shadow"
          aria-busy={socialLoading === 'google'}
          disabled={!!socialLoading}
        >
          {socialLoading === 'google' ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/google.svg" alt="구글" width={32} height={32} />}
        </button>
        <button 
          type="button" 
          onClick={() => {
            console.log('카카오 버튼 클릭됨');
            handleSocial("oauth_kakao");
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] shadow-sm hover:shadow-md transition-shadow"
          aria-busy={socialLoading === 'kakao'}
          disabled={!!socialLoading}
        >
          {socialLoading === 'kakao' ? <Loader className="w-5 h-5 animate-spin" /> : <Image src="/kakao_lastlast.svg" alt="카카오" width={32} height={32} />}
        </button>
        <button 
          type="button" 
          onClick={() => handleSocial("oauth_naver")}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[#00C73C] shadow-sm hover:shadow-md transition-shadow"
          aria-busy={socialLoading === 'naver'}
          disabled={!!socialLoading}
        >
          {socialLoading === 'naver' ? (
            <Loader className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Image src="/naver_icon.svg" alt="네이버" width={28} height={28} />
          )}
        </button>
      </div>
      {/* 소셜 리디렉션 안내 */}
      {socialLoading && (
        <div className="text-center text-sm text-gray-600 mt-3">
          {socialLoading === 'google' && '구글로 이동 중입니다...'}
          {socialLoading === 'kakao' && '카카오로 이동 중입니다...'}
          {socialLoading === 'naver' && '네이버로 이동 중입니다...'}
        </div>
      )}
    </form>
  );
}

export default function SignInPage() {
  const [error, setError] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* 상단 로고/타이틀/설명 */}
      <div className="mb-8 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">DONG<span className="text-black">GORI</span></h1>
        <div className="text-lg font-semibold text-gray-700 mb-1">봉제공장이 필요한 순간, 동고리</div>
        <div className="text-gray-500 text-sm mb-2">
          아직 회원 아니신가요? <Link href="/sign-up" className="text-blue-500 font-semibold">회원가입</Link>
        </div>
      </div>
      {/* 로그인 폼 */}
      <Suspense fallback={<Loader className="w-10 h-10 animate-spin text-black" />}>
        <ErrorHandler onError={setError} />
        <SignInForm />
      </Suspense>
    </div>
  );
} 