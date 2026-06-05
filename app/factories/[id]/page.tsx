"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
// Clerk 제거 운영에 맞춰 로컬/쿠키/Supabase 기반 확인으로 전환
import { Button } from "@/components/ui/button";
import { Factory } from "@/lib/factories";
import { Share, ArrowLeft, Check, MessageCircle, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFactoryMainImage } from "@/lib/factoryImages";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";

const OPEN_KAKAO_CHAT_URL = "https://open.kakao.com/o/sLFYzFki";

export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user: any = null;
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 공장 이미지 훅 사용
  const { images: factoryImages, loading: imagesLoading } = useFactoryImages(factory?.name || factory?.company_name || '');
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // 앱 레벨 로그인 감지 (Clerk 또는 커스텀 쿠키/스토리지)
  const isAppLoggedIn = () => {
    try {
      if (typeof document === 'undefined') return false;
      
      // 일반 로그인 확인
      if (document.cookie.includes('isLoggedIn=true')) return true;
      if (typeof localStorage !== 'undefined' && (localStorage.getItem('userType') || localStorage.getItem('isLoggedIn') === 'true')) return true;
      
      // 소셜 로그인 쿠키 확인
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };
      
      // 카카오 로그인 확인
      const kakaoUser = getCookie('kakao_user');
      if (kakaoUser) {
        try {
          const user = JSON.parse(decodeURIComponent(kakaoUser));
          if (user && user.id && user.email) return true;
        } catch (e) {
          console.error('카카오 사용자 쿠키 파싱 오류:', e);
        }
      }
      
      // 네이버 로그인 확인
      const naverUser = getCookie('naver_user');
      if (naverUser) {
        try {
          const user = JSON.parse(decodeURIComponent(naverUser));
          if (user && user.id && user.email) return true;
        } catch (e) {
          console.error('네이버 사용자 쿠키 파싱 오류:', e);
        }
      }
      
      // 팩토리 로그인 확인
      const factoryUser = getCookie('factory_user');
      if (factoryUser) {
        try {
          const user = JSON.parse(decodeURIComponent(factoryUser));
          if (user && user.id) return true;
        } catch (e) {
          console.error('팩토리 사용자 쿠키 파싱 오류:', e);
        }
      }
      
    } catch (error) {
      console.error('로그인 상태 확인 오류:', error);
    }
    return false;
  };

  const getAppUserName = () => {
    try {
      const lsName = localStorage.getItem('userName');
      if (lsName) return lsName;
      // 쿠키에서 카카오/네이버 사용자명 시도
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };
      const kakao = getCookie('kakao_user');
      if (kakao) {
        const u = JSON.parse(decodeURIComponent(kakao));
        if (u?.name) return u.name;
      }
      const naver = getCookie('naver_user');
      if (naver) {
        const u = JSON.parse(decodeURIComponent(naver));
        if (u?.name) return u.name;
      }
    } catch {}
    return '';
  };

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setFactoryId(resolved.id);
    })();
  }, [params]);

  useEffect(() => {
    if (!factoryId) return;
    async function fetchFactory() {
      setLoading(true);
      const { data } = await supabase.from("donggori").select("*").eq("id", factoryId).single();
      
      if (data) {
        // 이미지 매핑 적용
        const companyName = String(data.company_name || data.name || "공장명 없음");
        const mappedFactory: Factory = {
          ...data,
          id: String(data.id || Math.random()),
          name: companyName,
          ownerUserId: String(data.owner_user_id || data.ownerUserId || "unknown"),
          region: String(data.admin_district || data.region || "지역 없음"),
          items: [], // items는 별도 필드들로 구성
          minOrder: Number(data.moq) || 0,
          description: String(data.intro_text || data.intro || data.description || "설명 없음"),
          image: getFactoryMainImage(companyName), // 업장 이름으로 이미지 매칭
          images: [], // 이미지는 훅에서 가져옴
          contact: String(data.phone_num || data.phone_number || data.contact || "연락처 없음"),
          lat: Number(data.lat) || 37.5665,
          lng: Number(data.lng) || 126.9780,
          kakaoUrl: String(data.kakao_url || data.kakaoUrl || ""),
          processes: data.processes ? (Array.isArray(data.processes) ? data.processes as string[] : [String(data.processes)]) : [],
          // DB 연동용 확장 필드들
          business_type: data.business_type as string | undefined,
          equipment: data.equipment as string | undefined,
          sewing_machines: data.sewing_machines as string | undefined,
          pattern_machines: data.pattern_machines as string | undefined,
          special_machines: data.special_machines as string | undefined,
          top_items_upper: data.top_items_upper as string | undefined,
          top_items_lower: data.top_items_lower as string | undefined,
          top_items_outer: data.top_items_outer as string | undefined,
          top_items_dress_skirt: data.top_items_dress_skirt as string | undefined,
          top_items_bag: data.top_items_bag as string | undefined,
          top_items_fashion_accessory: data.top_items_fashion_accessory as string | undefined,
          top_items_underwear: data.top_items_underwear as string | undefined,
          top_items_sports_leisure: data.top_items_sports_leisure as string | undefined,
          top_items_pet: data.top_items_pet as string | undefined,
          moq: Number(data.moq) || undefined,
          monthly_capacity: Number(data.monthly_capacity) || undefined,
          admin_district: data.admin_district as string | undefined,
          intro: (data.intro_text || data.intro) as string | undefined,
          phone_number: (data.phone_num || data.phone_number) as string | undefined,
          factory_type: data.factory_type as string | undefined,
          main_fabrics: data.main_fabrics as string | undefined,
          distribution: data.distribution as string | undefined,
          delivery: data.delivery as string | undefined,
          company_name: data.company_name as string | undefined,
          contact_name: data.contact_name as string | undefined,
          email: data.email as string | undefined,
          address: data.address as string | undefined,
          established_year: Number(data.established_year) || undefined,
          brands_supplied: data.brands_supplied as string | undefined,
        };
        
        // 디버깅을 위한 로그 추가
        console.log("Fetched factory data:", data);
        console.log("Mapped factory:", mappedFactory);
        console.log("Factory images:", mappedFactory.images);
        console.log("Factory image:", mappedFactory.image);
        
        setFactory(mappedFactory);
      }
      
      setLoading(false);
    }
    fetchFactory();
  }, [factoryId]);

  // 현재 이미지가 변경될 때 썸네일 영역을 자동으로 스크롤
  useEffect(() => {
    if (thumbnailRef.current && displayImages && displayImages.length > 0) {
      // 화면 크기에 따른 썸네일 크기 계산
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const isTablet = window.innerWidth < 768; // md breakpoint
      
      let thumbnailWidth = 80; // w-20 (mobile)
      if (!isMobile && isTablet) {
        thumbnailWidth = 96; // w-24 (tablet)
      } else if (!isTablet) {
        thumbnailWidth = 112; // w-28 (desktop)
      }
      
      // lg 브레이크포인트 추가
      if (window.innerWidth >= 1024) {
        thumbnailWidth = 128; // w-32 (large desktop)
      }
      
      const gap = 8; // gap-2
      const scrollPosition = currentImageIndex * (thumbnailWidth + gap);
      
      thumbnailRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [currentImageIndex, factory]);

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

  const handleKakaoInquiry = () => {
    if (!isAppLoggedIn()) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }
    const inquiryCode = `INQ-${Date.now().toString().slice(-8)}`;
    const factoryName = factory.company_name || factory.name || "공장";
    const userName = getAppUserName() || "미입력";
    const inquiryDate = new Date().toLocaleDateString("ko-KR");

    const inquiryText = [
      `[${factoryName} 문의]`,
      "",
      "- 요청 구분: 문의하기",
      `- 문의번호: ${inquiryCode}`,
      `- 업장명: ${factoryName}`,
      `- 문의자: ${userName}`,
      `- 문의일: ${inquiryDate}`,
      "",
      "동고리를 통해 문의드립니다.",
    ].join("\n");

    const inquiry = {
      id: Date.now(),
      inquiryCode,
      userId: 'custom',
      factoryId: factory.id,
      factoryName,
      userName,
      date: new Date().toISOString().slice(0, 10),
      status: "카톡 문의 완료",
      method: "카카오톡",
      image: displayImages?.[0] || factory.image,
    };
    const prev = JSON.parse(localStorage.getItem("inquiries") || "[]");
    localStorage.setItem("inquiries", JSON.stringify([inquiry, ...prev]));
    navigator.clipboard.writeText(inquiryText)
      .then(() => {
        alert("문의 내용이 클립보드에 복사되었습니다.\n카카오톡 채팅창에 붙여넣기 후 전송해주세요.\n(문의번호 포함)");
        window.open(OPEN_KAKAO_CHAT_URL, "_blank");
      })
      .catch(() => {
        alert("클립보드 복사에 실패하여 카카오톡만 이동합니다.\n문의번호: " + inquiryCode);
        window.open(OPEN_KAKAO_CHAT_URL, "_blank");
      });
  };

  const goToRequestAfterSignIn = (service: "standard" | "deluxe" | "premium") => {
    const resolvedFactoryId = factoryId || String(factory?.id || "");
    if (!resolvedFactoryId) {
      alert("공장 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    const nextPath = `/factories/${resolvedFactoryId}/request?service=${service}`;
    window.location.href = `/sign-in?next=${encodeURIComponent(nextPath)}`;
  };

  const handleShare = async () => {
    const currentUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(currentUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000); // 2초 후 복사 상태 해제
    } catch (err) {
      console.error('클립보드 복사 실패:', err);
      // 폴백: 구형 브라우저 지원
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // 장비/기술 등은 Chip 형태로 분리
  const splitChips = (val: string | null | undefined) =>
    typeof val === "string"
      ? val.split(/,|\|| /).map((v) => v.trim()).filter(Boolean)
      : [];

  // 실제 공장 이미지 배열 (훅에서 가져온 이미지들)
  const displayImages = factoryImages && factoryImages.length > 0 
    ? factoryImages.filter(img => 
        img && 
        img !== '/logo_donggori.png' && 
        !img.includes('unsplash') &&
        !img.includes('logo_donggori')
      )
    : []; // 이미지가 없으면 빈 배열

  const handleConsultRequest = () => {
    if (!isAppLoggedIn()) {
      goToRequestAfterSignIn("standard");
      return;
    }
    const userName = getAppUserName();
    const resolvedFactoryId = factoryId || String(factory.id || "");
    window.location.href = `/factories/${resolvedFactoryId}/request?service=standard&name=${encodeURIComponent(userName)}`;
  };

  const factoryName = factory.company_name || "공장";
  const primaryBadge = factory.admin_district ? `${factory.admin_district} TOP 100` : "동대문구 TOP 100";
  const secondaryBadge = factory.factory_type ? `${factory.factory_type} 전문` : "샘플 전문";
  const majorItems = [
    factory.top_items_upper,
    factory.top_items_lower,
    factory.top_items_outer,
    factory.top_items_dress_skirt,
    factory.top_items_bag,
    factory.top_items_fashion_accessory,
    factory.top_items_underwear,
    factory.top_items_sports_leisure,
    factory.top_items_pet,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(", ");

  const minOrderText = factory.moq || factory.minOrder ? `${factory.moq || factory.minOrder}pcs` : "-";
  const maxCapaText = factory.monthly_capacity ? `${factory.monthly_capacity}pcs` : "-";
  const currentYear = new Date().getFullYear();
  const experienceText = factory.established_year && factory.established_year > 1900 && factory.established_year <= currentYear
    ? `${currentYear - factory.established_year + 1}년차`
    : factory.established_year
      ? String(factory.established_year)
      : "-";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1250px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[640px_1fr] gap-8 xl:gap-9 items-start">
          <section>
            {displayImages.length > 0 ? (
              <div className="relative">
                <div className="relative w-full h-[560px] md:h-[620px] lg:h-[640px] xl:h-[660px] bg-[#f7f7f8] rounded-xl overflow-hidden">
                  <Image
                    src={displayImages[currentImageIndex]}
                    alt={`${factoryName} 이미지 ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    priority={currentImageIndex === 0}
                    quality={85}
                  />
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 text-white flex items-center justify-center"
                      >
                        ‹
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/75 text-white flex items-center justify-center"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>
                {displayImages.length > 1 && (
                  <>
                    <div
                      ref={thumbnailRef}
                      className="mt-3 flex gap-2 overflow-x-auto"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {displayImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-[66px] h-[66px] rounded-md overflow-hidden border ${
                            index === currentImageIndex ? "border-black" : "border-gray-200"
                          }`}
                        >
                          <Image src={image} alt={`${factoryName} 썸네일 ${index + 1}`} fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center gap-1.5 mt-2">
                      {displayImages.map((_, index) => (
                        <span
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full ${index === currentImageIndex ? "bg-black" : "bg-gray-300"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full h-[560px] md:h-[620px] lg:h-[640px] xl:h-[660px] bg-[#f3f4f6] rounded-xl flex items-center justify-center text-gray-400">
                이미지 준비 중
              </div>
            )}
          </section>

          <section className="pt-1 lg:pt-0.5">
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <h1 className="text-[44px] leading-[1.08] font-extrabold tracking-[-0.02em] text-[#111111]">{factoryName}</h1>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full bg-[#f1f2f4] text-[12px] font-semibold text-[#555]">{primaryBadge}</span>
                  <span className="px-3 py-1 rounded-full bg-[#fdf0f2] text-[12px] font-semibold text-[#8f5b62]">{secondaryBadge}</span>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors relative mt-1"
                title="링크 복사"
              >
                {shareCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share className="w-4 h-4 text-gray-600" />}
              </button>
            </div>

            <div className="space-y-4 text-[15px] text-[#222] leading-[1.62]">
              <div><span className="font-semibold">• 한 줄 소개</span><p className="mt-0.5">{factory.intro || "-"}</p></div>
              <div><span className="font-semibold">• 위치</span><p className="mt-0.5">{factory.address || factory.admin_district || "-"}</p></div>
              <div><span className="font-semibold">• 작업 가능 원단</span><p className="mt-0.5">{factory.main_fabrics || "-"}</p></div>
              <div><span className="font-semibold">• 주요 생산품목</span><p className="mt-0.5">{majorItems || "-"}</p></div>
              <div>
                <span className="font-semibold">• 최소 발주수량</span>
                <p className="mt-0.5">최소수량: {minOrderText} &nbsp;|&nbsp; 최대수량: {maxCapaText}</p>
              </div>
              <div><span className="font-semibold">• 개발 의뢰 방식</span><p className="mt-0.5">작업지시서 기반 상담/의뢰</p></div>
              <div><span className="font-semibold">• 주요 거래처</span><p className="mt-0.5">{factory.distribution || "-"}</p></div>
              <div><span className="font-semibold">• 주요 브랜드</span><p className="mt-0.5">{factory.brands_supplied || "-"}</p></div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-7">
              <div className="rounded-lg bg-[#f5f6f8] py-4 px-3 text-center min-h-[84px] flex flex-col justify-center">
                <div className="text-xs text-gray-500 mb-1">행정동</div>
                <div className="text-sm font-semibold">{factory.admin_district || "-"}</div>
              </div>
              <div className="rounded-lg bg-[#f5f6f8] py-4 px-3 text-center min-h-[84px] flex flex-col justify-center">
                <div className="text-xs text-gray-500 mb-1">대표자</div>
                <div className="text-sm font-semibold">{factory.contact_name || "-"}</div>
              </div>
              <div className="rounded-lg bg-[#f5f6f8] py-4 px-3 text-center min-h-[84px] flex flex-col justify-center">
                <div className="text-xs text-gray-500 mb-1">업력</div>
                <div className="text-sm font-semibold">{experienceText}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Button
                onClick={handleConsultRequest}
                className="h-[50px] rounded-md bg-[#111111] hover:bg-[#000000] text-white font-semibold text-[15px] flex items-center justify-between px-4"
              >
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" />작업지시서 상담 예약</span>
                <span>→</span>
              </Button>
              <Button
                onClick={handleKakaoInquiry}
                className="h-[50px] rounded-md bg-[#111111] hover:bg-[#000000] text-white font-semibold text-[15px] flex items-center justify-between px-4"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  봉제공장 문의하기
                </span>
                <span>→</span>
              </Button>
            </div>

            <div className="mt-6">
              <Link
                href="/factories"
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                목록으로 돌아가기
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 