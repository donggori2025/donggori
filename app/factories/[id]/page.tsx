"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
// Clerk 제거 운영에 맞춰 로컬/쿠키/Supabase 기반 확인으로 전환
import { Button } from "@/components/ui/button";
import { Factory } from "@/lib/factories";
import { Share, ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getFactoryMainImage, getFactoryImages } from "@/lib/factoryImages";
import PricingTable from "@/components/PricingTable";

export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user: any = null;
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>('standard');
  const [shareCopied, setShareCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
          images: getFactoryImages(companyName), // 업장 이름으로 모든 이미지 가져오기
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
    if (thumbnailRef.current && factory && factory.images && factory.images.length > 0) {
      // 화면 크기에 따른 썸네일 크기 계산
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const isTablet = window.innerWidth < 768; // md breakpoint
      
      let thumbnailWidth = 64; // w-16 (mobile)
      if (!isMobile && isTablet) {
        thumbnailWidth = 80; // w-20 (tablet)
      } else if (!isTablet) {
        thumbnailWidth = 96; // w-24 (desktop)
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
    const inquiry = {
      id: Date.now(),
      userId: 'custom',
      factoryId: factory.id,
      factoryName: factory.company_name,
      date: new Date().toISOString().slice(0, 10),
      status: "카톡 문의 완료",
      method: "카카오톡",
      image: factory.images?.[0] || factory.image,
    };
    const prev = JSON.parse(localStorage.getItem("inquiries") || "[]");
    localStorage.setItem("inquiries", JSON.stringify([inquiry, ...prev]));
    window.open(factory.kakaoUrl || "https://open.kakao.com/o/some-link", "_blank");
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

  // 서비스 플랜 데이터
  const servicePlans = {
    standard: {
      title: "Standard",
      subtitle: "봉제공정",
      price: "39,000원 (VAT 포함)",
      features: [
        "봉제공장 매칭",
        "작업지시서 전달"
      ],
      sampleFee: "샘플비 10,000원",
      unitPrice: "장단 단가 16,800원"
    },
    deluxe: {
      title: "Deluxe", 
      subtitle: "패턴/샘플 + 공정",
      price: "89,000원 (VAT 포함)",
      features: [
        "샘플/패턴실 매칭",
        "봉제공장 매칭",
        "작업지시서 전달"
      ]
    },
    premium: {
      title: "Premium",
      subtitle: "올인원(기획/디자인~)",
      price: "159,000원 (VAT 포함)", 
      features: [
        "디자인(도식화, 패턴) 기획 컨설팅",
        "샘플/패턴실 매칭",
        "봉제공장 매칭",
        "작업지시서 전달"
      ]
    }
  };

  const togglePlan = (planKey: string) => {
    setSelectedPlan(selectedPlan === planKey ? null : planKey);
  };

  // 실제 공장 이미지 배열 (DB에서 가져온 이미지들)
  const factoryImages = factory.images && factory.images.length > 0 
    ? factory.images.filter(img => 
        img && 
        img !== '/logo_donggori.png' && 
        !img.includes('동고') && 
        !img.includes('unsplash') &&
        !img.includes('logo_donggori')
      )
    : factory.image && 
      factory.image !== '/logo_donggori.png' && 
      !factory.image.includes('동고') && 
      !factory.image.includes('unsplash') &&
      !factory.image.includes('logo_donggori')
      ? [factory.image] 
      : []; // 이미지가 없으면 빈 배열

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row px-4 lg:px-6 pt-8 lg:pt-12">
        {/* 왼쪽: 스크롤 가능한 상세 정보 */}
        <div className="flex-1 min-w-0 p-4 lg:p-6 order-2 lg:order-1">
          <div className="bg-white rounded-xl p-6 mb-6">
            {/* 이미지 갤러리 */}
            <div className="mb-8">
              {factoryImages.length > 0 ? (
                <div className="relative">
                  {/* 메인 이미지 */}
                  <div className="relative w-full h-80 sm:h-96 md:h-[500px] overflow-hidden rounded-lg">
                    <Image
                      src={factoryImages[currentImageIndex]}
                      alt={`${factory.company_name} 이미지 ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  
                  {/* 화살표 버튼들 */}
                  {factoryImages.length > 1 && (
                    <>
                      {/* 왼쪽 화살표 */}
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? factoryImages.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {/* 오른쪽 화살표 */}
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === factoryImages.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                  
                  {/* 썸네일 이미지들 */}
                  {factoryImages.length > 1 && (
                    <div 
                      ref={thumbnailRef}
                      className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {factoryImages.map((image: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500 scale-105' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${factory.company_name} 썸네일 ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* 이미지 인디케이터 */}
                  {factoryImages.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      {factoryImages.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-80 sm:h-96 md:h-[500px] bg-gray-100 flex items-center justify-center rounded-lg">
                  <div className="text-gray-400 text-lg font-medium">
                    이미지 준비 중
                  </div>
                </div>
              )}
            </div>

            {/* 상단 헤더 */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* 업장 이미지 - 첫 번째 사진 사용 */}
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                    {factory && factory.images && factory.images.length > 0 && 
                     factory.images[0] && 
                     factory.images[0] !== '/logo_donggori.png' && 
                     !factory.images[0].includes('동고') && 
                     !factory.images[0].includes('unsplash') ? (
                      <Image
                        src={factory.images[0]}
                        alt={factory.company_name || "공장 이미지"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : factory && factory.image && 
                      factory.image !== '/logo_donggori.png' && 
                      !factory.image.includes('동고') && 
                      !factory.image.includes('unsplash') ? (
                      <Image
                        src={factory.image}
                        alt={factory.company_name || "공장 이미지"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {factory && factory.company_name ? factory.company_name.charAt(0) : "재"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold">{factory.company_name || "재민상사"}</h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-2">
                      <span>연락 가능 시간 : 연중무휴</span>
                      <span>응답 시간: 1시간 이내</span>
                      <span>세금계산서 발행 가능</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleKakaoInquiry}
                  className="bg-gray-800 text-white px-4 lg:px-6 py-2 rounded-lg hover:bg-gray-700 w-full sm:w-auto"
                >
                  문의하기
                </Button>
              </div>
            </div>

            {/* 위치 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">위치</h2>
              <p className="text-gray-700">
                {factory.address || factory.admin_district || "주소 정보가 없습니다."}
              </p>
            </div>
            <div className="border-b border-gray-200 mb-8"></div>

            {/* 주요 정보 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">주요 정보</h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-600">업태:</span>
                  <span className="ml-2">{factory.business_type || "봉제업"}</span>
                </div>
                {factory.factory_type && (
                  <div>
                    <span className="font-semibold text-gray-600">공장 타입:</span>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      {factory.factory_type}
                    </span>
                  </div>
                )}
                {factory.main_fabrics && (
                  <div>
                    <span className="font-semibold text-gray-600">주요 원단:</span>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {factory.main_fabrics}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-gray-600">주요품목:</span>
                  <span className="ml-2">{factory.top_items_upper || factory.top_items_lower || factory.top_items_outer || "상의, 하의, 아우터"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">MOQ(최소 주문 수량):</span>
                  <span className="ml-2">{factory.moq || factory.minOrder || "100"}</span>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 mb-8"></div>

            {/* 보유 장비 */}
            {splitChips(factory.sewing_machines).length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3">보유 장비</h2>
                  <div className="flex flex-wrap gap-2">
                    {splitChips(factory.sewing_machines).map((item, i) => (
                      <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="border-b border-gray-200 mb-8"></div>
              </>
            )}

            {/* 패턴 장비 */}
            {splitChips(factory.pattern_machines).length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3">패턴 장비</h2>
                  <div className="flex flex-wrap gap-2">
                    {splitChips(factory.pattern_machines).map((item, i) => (
                      <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="border-b border-gray-200 mb-8"></div>
              </>
            )}

            {/* 특수 장비 */}
            {splitChips(factory.special_machines).length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-bold mb-3">특수 장비</h2>
                  <div className="flex flex-wrap gap-2">
                    {splitChips(factory.special_machines).map((item, i) => (
                      <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="border-b border-gray-200 mb-8"></div>
              </>
            )}

            {/* 플랜 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-6">플랜</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(servicePlans).map(([key, plan]) => (
                  <div key={key} className="bg-white p-6">
                    <div className="text-center mb-4 bg-gray-50 rounded-lg p-4">
                      <h3 className="font-bold text-xl mb-2">{plan.title}</h3>
                      <p className="text-sm text-gray-600">{plan.subtitle}</p>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-8"></div>

            {/* 플랜 정보 */}
            <div className="mb-8">
              <div className="mb-4">
                <h2 className="text-lg font-bold">패키지별 정보를 확인해보세요</h2>
              </div>
              
              <div className="space-y-6">
                {/* 공통점 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">공통점</h4>
                  <p className="text-base text-gray-600">모든 패키지는 의류 생산을 위한 기본 지원을 제공하며, 작업지시서 전달을 통해 의뢰자가 요청한 사양이 정확히 생산 공장에 전달되도록 보장합니다.</p>
                  <p className="text-base text-gray-600 mt-2">또한, 기본적인 생산 A/S를 지원하여 초도 생산 시 발생할 수 있는 문제를 최소화합니다.</p>
                </div>
                
                {/* 주요 특징 */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">주요 특징</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-800">• Standard :</p>
                      <p className="text-base text-gray-600">봉제공장 매칭을 통해 바로 생산에 착수할 수 있으며, 작업지시서를 기반으로 최소한의 의류 생산 지원을 제공합니다. 단순한 의뢰나 소량 생산에 적합한 패키지입니다.</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">• Deluxe :</p>
                      <p className="text-base text-gray-600">샘플/패턴실 매칭까지 지원하여 사전 검증과 품질 확인이 가능하며, 봉제공장 매칭과 작업지시서 전달까지 일괄 지원합니다. 소량 샘플 제작이나 본생산 이전 검증 단계에 적합합니다.</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">• Premium :</p>
                      <p className="text-base text-gray-600">디자인(도식화·패턴) 기획 단계부터 컨설팅을 지원하며, 샘플/패턴실 매칭과 봉제공장 매칭, 작업지시서 전달까지 풀 패키지를 제공합니다. 브랜드 기획·개발 단계나 정식 런칭 준비에 최적화된 패키지입니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 mb-8"></div>

            {/* 공정 단가표 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">공정 단가표</h2>
              <PricingTable />
            </div>
            <div className="border-b border-gray-200 mb-8"></div>

            {/* 전문가 정보 */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">전문가 정보</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg px-4 py-4 text-center">
                  <div className="font-semibold text-gray-600 mb-1">행정동</div>
                  <div className="text-base">{factory.admin_district || "장안동 제2동"}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-4 text-center">
                  <div className="font-semibold text-gray-600 mb-1">월 CAPA</div>
                  <div className="text-base">{factory.monthly_capacity || "2000"}</div>
                </div>
                <div className="bg-gray-50 rounded-lg px-4 py-4 text-center">
                  <div className="font-semibold text-gray-600 mb-1">배송</div>
                  <div className="text-base">{factory.delivery || "업체 배달 서비스"}</div>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold mb-3">소개</h4>
                <p className="text-base text-gray-600 mb-6">
                  {factory.intro || "동대문구장한로34길23~2 지층에 위치하고있읍니다"}
                </p>
                {factory.special_machines && factory.special_machines.trim() !== '' && (
                  <>
                    <h4 className="font-semibold mb-3">특수 장비</h4>
                    <p className="text-base text-gray-600 mb-6">
                      {factory.special_machines}
                    </p>
                  </>
                )}
                {factory.brands_supplied && factory.brands_supplied.trim() !== '' && (
                  <>
                    <h4 className="font-semibold mb-3">주요 거래처</h4>
                    <p className="text-base text-gray-600">
                      {factory.brands_supplied}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="mt-12 mb-8">
              <Link 
                href="/factories" 
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">목록으로 돌아가기</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 오른쪽: 고정 사이드바 (sticky) */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 h-fit order-1 lg:order-2 lg:mt-4 lg:sticky lg:top-24 lg:self-start">
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-sm lg:text-base">{factory.company_name || "재민상사"}</h3>
                <p className="text-xs text-gray-500">봉제공장</p>
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              title="링크 복사"
            >
              {shareCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Share className="w-4 h-4" />
              )}
              {shareCopied && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                  링크가 복사되었습니다!
                </div>
              )}
            </button>
          </div>

          {/* 서비스 플랜 */}
          <div className="space-y-4">
            {/* Standard */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button 
                onClick={() => togglePlan('standard')}
                className="w-full flex items-center justify-between font-bold text-base lg:text-lg mb-2"
              >
                Standard
                {selectedPlan === 'standard' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {selectedPlan === 'standard' && (
                <div className="mt-3">
                  <ul className="text-xs lg:text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 봉제공장 매칭</li>
                    <li>• 작업지시서 전달</li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm"
                    onClick={() => {
                      if (!isAppLoggedIn()) {
                        alert('로그인 후 이용 가능합니다.');
                        return;
                      }
                      const userName = getAppUserName();
                      window.location.href = `/factories/${factoryId}/request?service=standard&name=${encodeURIComponent(userName)}`;
                    }}
                  >
                    공정 의뢰하기
                  </Button>
                </div>
              )}
            </div>

            {/* Deluxe */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button 
                onClick={() => togglePlan('deluxe')}
                className="w-full flex items-center justify-between font-bold text-base lg:text-lg mb-2"
              >
                Deluxe
                {selectedPlan === 'deluxe' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {selectedPlan === 'deluxe' && (
                <div className="mt-3">
                  <ul className="text-xs lg:text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 샘플/패턴실 매칭</li>
                    <li>• 봉제공장 매칭</li>
                    <li>• 작업지시서 전달</li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm"
                    onClick={() => {
                      if (!isAppLoggedIn()) {
                        alert('로그인 후 이용 가능합니다.');
                        return;
                      }
                      const userName = getAppUserName();
                      window.location.href = `/factories/${factoryId}/request?service=deluxe&name=${encodeURIComponent(userName)}`;
                    }}
                  >
                    패턴/샘플 의뢰하기
                  </Button>
                </div>
              )}
            </div>

            {/* Premium */}
            <div className="bg-gray-50 rounded-lg p-4">
              <button 
                onClick={() => togglePlan('premium')}
                className="w-full flex items-center justify-between font-bold text-base lg:text-lg mb-2"
              >
                Premium
                {selectedPlan === 'premium' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {selectedPlan === 'premium' && (
                <div className="mt-3">
                  <ul className="text-xs lg:text-sm text-gray-600 space-y-1 mb-4">
                    <li>• 디자인(도식화, 패턴) 기획 컨설팅</li>
                    <li>• 샘플/패턴실 매칭</li>
                    <li>• 봉제공장 매칭</li>
                    <li>• 작업지시서 전달</li>
                  </ul>
                  <Button 
                    className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm"
                    onClick={() => {
                      if (!isAppLoggedIn()) {
                        alert('로그인 후 이용 가능합니다.');
                        return;
                      }
                      const userName = getAppUserName();
                      window.location.href = `/factories/${factoryId}/request?service=premium&name=${encodeURIComponent(userName)}`;
                    }}
                  >
                    올인원 의뢰하기
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 하단 문의 버튼 */}
          <div className="mt-6">
            <Button 
              onClick={handleKakaoInquiry}
              className="w-full bg-gray-100 text-black rounded-lg py-3 font-bold hover:bg-gray-200 text-sm lg:text-base flex items-center justify-center gap-2"
            >
              <Image 
                src="/kakao_lastlast.svg" 
                alt="카카오톡" 
                width={20} 
                height={20}
                className="w-5 h-5"
              />
              문의하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 