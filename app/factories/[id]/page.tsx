"use client";
import { useEffect, useMemo, useState, useRef } from "react";
import { useAppAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Factory } from "@/lib/factoryCatalog";
import { Share, ArrowLeft, Check, MessageCircle, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFactoryImages } from "@/lib/hooks/useFactoryImages";
import { DONGGORI_OPEN_KAKAO_CHAT_URL } from "@/lib/site";


export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isSignedIn } = useAppAuth();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMajorItemsModal, setShowMajorItemsModal] = useState(false);
  const [majorItemsOverflow, setMajorItemsOverflow] = useState(false);
  
  // 공장 이미지 훅 사용
  const { images: factoryImages, loading: imagesLoading } = useFactoryImages(factory);
  const displayImages = useMemo(
    () =>
      factoryImages.filter(
        (img) =>
          img &&
          img !== "/logo_donggori.png" &&
          !img.includes("unsplash") &&
          !img.includes("logo_donggori")
      ),
    [factoryImages]
  );
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const majorItemsRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setFactoryId(resolved.id);
    })();
  }, [params]);

  useEffect(() => {
    const id = factoryId;
    if (!id) return;
    async function fetchFactory() {
      setLoading(true);
      const response = await fetch(`/api/factories/${encodeURIComponent(String(id))}`, { cache: "no-store" });
      const payload = response.ok ? await response.json() : null;
      setFactory(payload?.data ?? null);
      
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
  }, [currentImageIndex, displayImages.length]);

  useEffect(() => {
    if (displayImages.length === 0) {
      setCurrentImageIndex(0);
      return;
    }
    if (currentImageIndex >= displayImages.length) {
      setCurrentImageIndex(0);
    }
  }, [currentImageIndex, displayImages.length]);

  const majorItems = [
    factory?.top_items_upper,
    factory?.top_items_lower,
    factory?.top_items_outer,
    factory?.top_items_dress_skirt,
    factory?.top_items_bag,
    factory?.top_items_fashion_accessory,
    factory?.top_items_underwear,
    factory?.top_items_sports_leisure,
    factory?.top_items_pet,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .join(", ");

  // 훅 순서 고정: 조건부 return 이전에 배치
  useEffect(() => {
    const element = majorItemsRef.current;
    if (!element) {
      setMajorItemsOverflow(false);
      return;
    }

    const checkOverflow = () => {
      setMajorItemsOverflow(element.scrollHeight > element.clientHeight + 1);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [majorItems]);

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

  const handleKakaoInquiry = async () => {
    if (!isSignedIn || !user) {
      const nextPath = factoryId ? `/factories/${factoryId}` : "/factories";
      window.location.href = `/sign-in?next=${encodeURIComponent(nextPath)}`;
      return;
    }

    const resolvedFactoryId = factoryId || String(factory.id || "");
    const factoryName = factory.company_name || factory.name || "공장";
    const contact = user.phoneNumber || user.email;
    if (!resolvedFactoryId || !user.name || !contact) {
      alert("문의에 필요한 이름과 연락처를 마이페이지에서 확인해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/match-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: user.name,
          factory_id: resolvedFactoryId,
          contact,
          description: "빠른 공장 문의",
          additional_info: JSON.stringify({ requestType: "quick-inquiry" }),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "문의를 저장하지 못했습니다.");

      const inquiryCode = payload?.id ? `INQ-${String(payload.id).slice(-8)}` : "INQ";
      const inquiryText = [
        `[${factoryName} 문의]`,
        "",
        "- 요청 구분: 문의하기",
        `- 문의번호: ${inquiryCode}`,
        `- 업장명: ${factoryName}`,
        `- 문의자: ${user.name}`,
        `- 문의일: ${new Date().toLocaleDateString("ko-KR")}`,
        "",
        "동고리를 통해 문의드립니다.",
      ].join("\n");

      await navigator.clipboard.writeText(inquiryText).catch(() => undefined);
      alert("문의가 저장되었습니다. 카카오 오픈채팅에서 상담을 이어가주세요.");
      window.location.assign(DONGGORI_OPEN_KAKAO_CHAT_URL);
    } catch (error) {
      alert(error instanceof Error ? error.message : "문의를 저장하지 못했습니다.");
    }
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

  const handleConsultRequest = () => {
    if (!isSignedIn) {
      goToRequestAfterSignIn("standard");
      return;
    }
    const resolvedFactoryId = factoryId || String(factory.id || "");
    window.location.href = `/factories/${resolvedFactoryId}/request?service=standard`;
  };

  const factoryName = factory.company_name || "공장";
  const primaryBadge = factory.admin_district || "지역 정보 확인 중";
  const secondaryBadge = factory.factory_type ? `${factory.factory_type} 전문` : "업종 정보 없음";

  const minOrderText = factory.moq || factory.minOrder ? `${factory.moq || factory.minOrder}pcs` : "-";
  const maxCapaText = factory.monthly_capacity ? `${factory.monthly_capacity}pcs` : "-";
  const currentYear = new Date().getFullYear();
  const experienceText = factory.established_year && factory.established_year > 1900 && factory.established_year <= currentYear
    ? `${currentYear - factory.established_year + 1}년차`
    : factory.established_year
      ? String(factory.established_year)
      : "-";

  const activeImageIndex =
    displayImages.length > 0 ? Math.min(currentImageIndex, displayImages.length - 1) : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1250px] mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[640px_1fr] gap-8 xl:gap-9 items-start">
          <section>
            {displayImages.length > 0 ? (
              <div className="relative">
                <div className="relative w-full h-[560px] md:h-[620px] lg:h-[640px] xl:h-[660px] bg-[#f7f7f8] rounded-xl overflow-hidden">
                  <Image
                    src={displayImages[activeImageIndex]}
                    alt={`${factoryName} 이미지 ${activeImageIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    priority={activeImageIndex === 0}
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
                      className="mt-3 flex flex-nowrap gap-2 overflow-x-auto snap-x snap-mandatory"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {displayImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-[66px] h-[66px] shrink-0 snap-start rounded-md overflow-hidden border ${
                            index === activeImageIndex ? "border-black" : "border-gray-200"
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
                          className={`w-1.5 h-1.5 rounded-full ${index === activeImageIndex ? "bg-black" : "bg-gray-300"}`}
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
              <div>
                <span className="font-semibold">• 주요 생산품목</span>
                <p
                  ref={majorItemsRef}
                  className="mt-0.5"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {majorItems || "-"}
                </p>
                {majorItemsOverflow && (
                  <button
                    type="button"
                    onClick={() => setShowMajorItemsModal(true)}
                    className="mt-1 text-xs text-gray-500 underline underline-offset-2 hover:text-gray-700"
                  >
                    더보기
                  </button>
                )}
              </div>
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
      {showMajorItemsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
          onClick={() => setShowMajorItemsModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-[#111]">주요 생산품목</h3>
              <button
                type="button"
                onClick={() => setShowMajorItemsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                닫기
              </button>
            </div>
            <p className="text-sm text-[#222] leading-relaxed whitespace-pre-wrap">
              {majorItems || "-"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
