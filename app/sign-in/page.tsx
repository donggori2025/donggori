"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff, Loader } from "lucide-react";
import { getFactoryAuthWithRealName } from "@/lib/factoryAuth";


export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoaded } = useSignIn();

  type OAuthStrategy = 'oauth_google' | 'oauth_facebook' | 'oauth_github' | 'oauth_twitter' | 'oauth_gitlab' | 'oauth_bitbucket' | 'oauth_linkedin' | 'oauth_apple' | 'oauth_discord' | 'oauth_twitch' | 'oauth_slack' | 'oauth_tiktok' | 'oauth_kakao' | 'oauth_naver' | 'oauth_line' | 'oauth_yahoo' | 'oauth_wechat' | 'oauth_weibo' | 'oauth_baidu' | 'oauth_gitee' | 'oauth_instagram' | 'oauth_salesforce' | 'oauth_spotify' | 'oauth_wordpress' | 'oauth_yandex' | 'oauth_zoom';

  // 소셜 로그인 핸들러
  const handleSocial = async (provider: OAuthStrategy) => {
    setError("");
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider as unknown as Parameters<typeof signIn.authenticateWithRedirect>[0]['strategy'],
        redirectUrl: '/v1/oauth_callback',
        redirectUrlComplete: '/',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "소셜 로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 로그인 폼 제출
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // 먼저 봉제공장 로그인 시도
      const factoryAuth = await getFactoryAuthWithRealName(email, password);
      if (factoryAuth) {
              // 봉제공장 로그인 성공 (실제 DB 공장명 포함)
      localStorage.setItem('factoryAuth', JSON.stringify(factoryAuth));
      localStorage.setItem('userType', 'factory');
      // 메인페이지로 리다이렉트
      window.location.href = '/';
      return;
      }
      
      // 봉제공장 로그인이 실패하면 일반 사용자 로그인 시도
      if (!isLoaded) return;
      
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        localStorage.setItem('userType', 'user');
        // 메인페이지로 리다이렉트
        window.location.href = '/';
      } else {
        setError("추가 인증이 필요합니다.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

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
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl shadow p-8 flex flex-col gap-4">
        <label className="text-sm font-semibold">이메일</label>
        <input
          type="text"
          placeholder="이메일 또는 봉제공장 아이디를 입력해주세요."
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
          >
            <Image src="/google.svg" alt="구글" width={32} height={32} />
          </button>
          <button 
            type="button" 
            onClick={() => handleSocial("oauth_kakao")}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FEE500] shadow-sm hover:shadow-md transition-shadow"
          >
            <Image src="/kakao_lastlast.svg" alt="카카오" width={32} height={32} />
          </button>
          <button 
            type="button" 
            onClick={() => handleSocial("oauth_naver")}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#03C75A] shadow-sm hover:shadow-md transition-shadow"
          >
            <Image src="/naver_lastlast.svg" alt="네이버" width={32} height={32} />
          </button>
        </div>
      </form>
    </div>
  );
} 