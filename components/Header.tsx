"use client";
import Link from "next/link";
import Image from "next/image";
import { SignedIn, useUser } from "@clerk/nextjs";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getFactoryProfileImage } from "@/lib/factoryAuth";
import { storage } from "@/lib/utils";
import type { FactoryAuth } from "@/lib/types";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [factoryAuth, setFactoryAuth] = useState<FactoryAuth | null>(null);
  const [factoryProfileImage, setFactoryProfileImage] = useState<string | null>(null);
  const [naverUser, setNaverUser] = useState<any>(null);
  const [kakaoUser, setKakaoUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  // 네비게이션 메뉴 항목을 메모이제이션
  const navMenu = useMemo(() => [
    { href: "/factories", label: "봉제공장 찾기" },
    { href: "/matching", label: "AI 매칭" },
    { href: "/notices", label: "공지사항" },
  ], []);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setMounted(true);
  }, []);

  // 사용자 타입과 공장 인증 정보 로드
  useEffect(() => {
    if (!mounted) return;
    
    try {
      // userType은 단순 문자열이므로 직접 localStorage에서 가져옴
      const storedUserType = localStorage.getItem('userType');
      const storedFactoryAuth = storage.get<FactoryAuth>('factoryAuth');
      
      setUserType(storedUserType);
      if (storedFactoryAuth) {
        setFactoryAuth(storedFactoryAuth);
        
        // 공장 프로필 이미지 로드
        if (storedFactoryAuth.factoryId) {
          console.log('공장 프로필 이미지 로드 시작:', { factoryId: storedFactoryAuth.factoryId });
          
          getFactoryProfileImage(storedFactoryAuth.factoryId)
            .then(image => {
              console.log('공장 프로필 이미지 로드 성공:', { factoryId: storedFactoryAuth.factoryId, image });
              setFactoryProfileImage(image);
            })
            .catch((error) => {
              console.error('공장 프로필 이미지 로드 실패:', {
                factoryId: storedFactoryAuth.factoryId,
                error: error instanceof Error ? error.message : String(error),
                fullError: error
              });
              setFactoryProfileImage(null);
            });
        }
      }

      // 네이버 사용자 정보 로드
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const naverUserCookie = getCookie('naver_user');
      if (naverUserCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(naverUserCookie));
          setNaverUser(userData);
          console.log('네이버 사용자 정보 로드:', userData);
        } catch (error) {
          console.error('네이버 사용자 정보 파싱 오류:', error);
        }
      }

      // 카카오 사용자 정보 로드
      const kakaoUserCookie = getCookie('kakao_user');
      if (kakaoUserCookie) {
        try {
          const userData = JSON.parse(decodeURIComponent(kakaoUserCookie));
          setKakaoUser(userData);
          console.log('카카오 사용자 정보 로드:', userData);
        } catch (error) {
          console.error('카카오 사용자 정보 파싱 오류:', error);
        }
      }
    } catch (error) {
      console.error('Header initialization error:', error);
    }
  }, [mounted, isSignedIn]); // isSignedIn 상태 변화도 감지

  // 로그인 버튼 클릭 핸들러
  const handleSignInClick = useCallback(() => {
    router.push("/sign-in");
  }, [router]);

  // 메뉴 토글 핸들러
  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev);
  }, []);

  // 메뉴 닫기 핸들러
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // 서버 사이드 렌더링 시 기본 UI만 표시
  if (!mounted) {
    return (
      <header className="w-full bg-white border-b px-4 sm:px-6 sticky top-0 z-[9999]">
        <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between px-0 py-3 sm:py-4">
          {/* 로고 */}
          <Link href="/" className="select-none flex-shrink-0" aria-label="동고리 홈">
            <Image
              src="/logo_donggori.svg"
              alt="동고리 로고"
              width={113}
              height={47}
              priority
              className="w-24 sm:w-28 md:w-[113px] h-auto min-h-[32px]"
              style={{ height: 'auto', minHeight: '32px' }}
            />
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <nav className="flex gap-4 lg:gap-6 text-sm lg:text-base font-medium text-[#222222]">
              {navMenu.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`hover:text-[#222222] hover:font-bold transition-colors ${
                    item.label === "AI 매칭" ? "ai-matching-glow" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* SSR 초기 렌더에서도 로그인 버튼 노출 (하이드레이션 후 상태에 따라 교체됨) */}
            <Link
              href="/sign-in"
              className="text-sm lg:text-base font-medium text-white bg-[#222222] px-2 lg:px-3 py-1 rounded hover:bg-[#444] transition-colors"
            >
              로그인/회원가입
            </Link>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <div className="md:hidden flex items-center">
            <button
              aria-label="메뉴 열기"
              className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-white border-b px-4 sm:px-6 sticky top-0 z-[9999]">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between px-0 py-3 sm:py-4">
        {/* 로고 */}
        <Link href="/" className="select-none flex-shrink-0" aria-label="동고리 홈">
          <Image
            src="/logo_donggori.svg"
            alt="동고리 로고"
            width={113}
            height={47}
            priority
            className="w-24 sm:w-28 md:w-[113px] h-auto min-h-[32px]"
            style={{ height: 'auto', minHeight: '32px' }}
          />
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <nav className="flex gap-4 lg:gap-6 text-sm lg:text-base font-medium text-[#222222]">
            {navMenu.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`hover:text-[#222222] hover:font-bold transition-colors ${
                  item.label === "AI 매칭" ? "ai-matching-glow" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* 로그인 전: 로그인/회원가입 버튼 */}
            {(!isLoaded || (!isSignedIn && !factoryAuth && !naverUser && !kakaoUser)) && (
              <button
                className="text-sm lg:text-base font-medium text-white bg-[#222222] px-2 lg:px-3 py-1 rounded hover:bg-[#444] transition-colors"
                onClick={handleSignInClick}
              >
                로그인/회원가입
              </button>
            )}

            {/* Clerk 로그인 후: 프로필 이미지 */}
            {isSignedIn && user && (
              <Link href="/my-page" className="flex items-center" aria-label="마이페이지로 이동">
                <Image
                  src={user.imageUrl}
                  alt="프로필 이미지"
                  width={40}
                  height={40}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-gray-200 hover:shadow-md transition-shadow"
                />
              </Link>
            )}

            {/* 네이버 로그인 후: 네이버 프로필 이미지 */}
            {naverUser && (
              <Link href="/my-page" className="flex items-center" aria-label="마이페이지로 이동">
                <Image
                  src={naverUser.profileImage || "/logo_donggori.png"}
                  alt="네이버 프로필 이미지"
                  width={40}
                  height={40}
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-gray-200 hover:shadow-md transition-shadow"
                />
              </Link>
            )}

            {/* 카카오 로그인 후: 카카오 프로필 이미지 */}
            {kakaoUser && (
              <Link href="/my-page" className="flex items-center" aria-label="마이페이지로 이동">
                <img
                  src={kakaoUser.profileImage || "/logo_donggori.png"}
                  alt="카카오 프로필 이미지"
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-gray-200 hover:shadow-md transition-shadow"
                />
              </Link>
            )}

            {/* 봉제공장 로그인 후: 공장 프로필 이미지 */}
            {userType === 'factory' && factoryAuth && (
              <Link href="/factory-my-page" className="flex items-center" aria-label="공장 마이페이지로 이동">
                {factoryProfileImage ? (
                  <Image
                    src={factoryProfileImage}
                    alt="공장 프로필 이미지"
                    width={40}
                    height={40}
                    className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover border border-gray-200 hover:shadow-md transition-shadow"
                  />
                ) : (
                  <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center hover:shadow-md transition-shadow">
                    <svg
                      className="w-5 h-5 lg:w-6 lg:h-6 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>

        {/* 모바일 햄버거 버튼 */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="메뉴 열기"
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={toggleMenu}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* 모바일 드로어 메뉴 */}
        {menuOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-end md:hidden">
            {/* 오버레이 */}
            <div
              className="absolute inset-0 bg-black/20"
              onClick={closeMenu}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  closeMenu();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="오버레이 클릭 시 메뉴 닫기"
            />
            
            {/* 사이드 드로어 메뉴 */}
            <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-xl p-6 animate-slide-in-right flex flex-col gap-6">
              {/* 닫기 버튼 */}
              <button
                className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
                aria-label="메뉴 닫기"
                onClick={closeMenu}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    closeMenu();
                  }
                }}
              >
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 메뉴 그룹 */}
              <div className="flex flex-col gap-4 mt-8">
                {navMenu.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="py-3 px-4 rounded-lg hover:bg-gray-100 text-gray-800 font-medium text-lg transition-colors"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

                              {/* 로그인/회원가입 또는 프로필 이미지 */}
                <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-gray-200">
                  {(!isLoaded || (!isSignedIn && !factoryAuth && !naverUser && !kakaoUser)) && (
                    <button
                      className="w-full py-3 px-4 rounded-lg bg-[#222222] hover:bg-[#444] text-white font-medium transition-colors"
                      onClick={handleSignInClick}
                    >
                      로그인/회원가입
                    </button>
                  )}

                  {/* Clerk 로그인 후: 프로필 이미지 */}
                  {isSignedIn && user && (
                    <Link href="/my-page" className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 transition-colors">
                      <Image
                        src={user.imageUrl}
                        alt="프로필 이미지"
                        width={40}
                        height={40}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium">마이페이지</span>
                    </Link>
                  )}

                  {/* 네이버 로그인 후 모바일 메뉴 */}
                  {naverUser && (
                    <Link href="/my-page" className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 transition-colors">
                      <Image
                        src={naverUser.profileImage || "/logo_donggori.png"}
                        alt="네이버 프로필 이미지"
                        width={40}
                        height={40}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium">마이페이지</span>
                    </Link>
                  )}

                  {/* 카카오 로그인 후 모바일 메뉴 */}
                  {kakaoUser && (
                    <Link href="/my-page" className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 transition-colors">
                      <img
                        src={kakaoUser.profileImage || "/logo_donggori.png"}
                        alt="카카오 프로필 이미지"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                      <span className="font-medium">마이페이지</span>
                    </Link>
                  )}

                  {/* 봉제공장 로그인 후 모바일 메뉴 */}
                  {userType === 'factory' && factoryAuth && (
                    <Link href="/factory-my-page" className="flex items-center justify-center gap-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 transition-colors">
                      {factoryProfileImage ? (
                        <Image
                          src={factoryProfileImage}
                          alt="공장 프로필 이미지"
                          width={40}
                          height={40}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium">공장 마이페이지</span>
                    </Link>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>

      {/* 사이드 드로어 애니메이션 */}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </header>
  );
} 