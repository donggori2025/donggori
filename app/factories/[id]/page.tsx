"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Factory } from "@/lib/factories";
import { Share, ArrowLeft, ChevronDown, ChevronUp, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>('standard');
  const [shareCopied, setShareCopied] = useState(false);

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
      setFactory(data);
      setLoading(false);
    }
    fetchFactory();
  }, [factoryId]);

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

  const handleKakaoInquiry = () => {
    if (!user) return;
    const inquiry = {
      id: Date.now(),
      userId: user.id,
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
        "텍스트형 시안 1종",
        "슬로건 제작", 
        "평생 A/S",
        "원본, 저작, 재산권 이전"
      ],
      sampleFee: "샘플비 10,000원",
      unitPrice: "장단 단가 16,800원"
    },
    deluxe: {
      title: "Deluxe", 
      subtitle: "패턴/샘플 + 공정",
      price: "89,000원 (VAT 포함)",
      features: [
        "패턴 제작",
        "샘플 제작",
        "봉제 공정",
        "품질 검수",
        "배송 서비스",
        "기술 지원"
      ]
    },
    premium: {
      title: "Premium",
      subtitle: "올인원(기획/디자인~)",
      price: "159,000원 (VAT 포함)", 
      features: [
        "기획 및 디자인",
        "패턴 제작",
        "샘플 제작", 
        "봉제 공정",
        "품질 검수",
        "배송 서비스",
        "마케팅 지원"
      ]
    }
  };

  const togglePlan = (planKey: string) => {
    setSelectedPlan(selectedPlan === planKey ? null : planKey);
  };

  // 샘플 이미지 배열
  const sampleImages = [
    "/bozhin-karaivanov-p1jldJ9tZ6c-unsplash (1).jpg",
    "/logo_donggori.png",
    "/logo_donggori.svg",
    "/next.svg"
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row px-4 lg:px-6 pt-8 lg:pt-12">
        {/* 왼쪽: 스크롤 가능한 상세 정보 */}
        <div className="flex-1 min-w-0 p-4 lg:p-6 order-2 lg:order-1">
          <div className="bg-white rounded-xl p-6 mb-6">
            {/* 이미지 갤러리 */}
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto">
                {sampleImages.map((image, index) => (
                  <div key={index} className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={image}
                      alt={`업장 이미지 ${index + 1}`}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 상단 헤더 */}
            <div className="bg-gray-50 rounded-lg p-4 lg:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">재</span>
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
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">위치</h2>
              <p className="text-gray-700">
                (02522) 서울특별시 동대문구 장한로34길 23-2 (장안동) 지층
              </p>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 주요 정보 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">주요 정보</h2>
              <div className="space-y-4">
                <div>
                  <span className="font-semibold text-gray-600">업태:</span>
                  <span className="ml-2">{factory.business_type || "봉제업"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">주요품목:</span>
                  <span className="ml-2">{factory.top_items_upper || factory.top_items_lower || factory.top_items_outer || "상의, 하의, 아우터"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">주요원단:</span>
                  <span className="ml-2">{factory.main_fabrics || "다이마루"}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">MOQ(최소 주문 수량):</span>
                  <span className="ml-2">{factory.moq || factory.minOrder || "100"}</span>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 보유 장비 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">보유 장비</h2>
              <div className="flex flex-wrap gap-2">
                {splitChips(factory.sewing_machines).length > 0 ? (
                  splitChips(factory.sewing_machines).map((item, i) => (
                    <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">사절본봉기</span>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">사절삼봉</span>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">쌍침기</span>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">가이루퍼</span>
                  </>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 패턴 장비 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">패턴 장비</h2>
              <div className="flex flex-wrap gap-2">
                {splitChips(factory.pattern_machines).length > 0 ? (
                  splitChips(factory.pattern_machines).map((item, i) => (
                    <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">나나인치</span>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">바텍</span>
                  </>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 특수 장비 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">특수 장비</h2>
              <div className="flex flex-wrap gap-2">
                {splitChips(factory.special_machines).length > 0 ? (
                  splitChips(factory.special_machines).map((item, i) => (
                    <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm">{item}</span>
                  ))
                ) : (
                  <>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">나나인치</span>
                    <span className="bg-gray-50 px-3 py-1 rounded text-sm">바텍</span>
                  </>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 플랜 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">플랜</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(servicePlans).map(([key, plan]) => (
                  <div key={key} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">{plan.title}</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {plan.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 플랜 정보 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">플랜 정보</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">공통점</h4>
                  <p className="text-sm text-gray-600">패키지별 가격 정보를 확인해보세요</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">주요 특징</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Standard: 패키지별 가격 정보를 확인해보세요</p>
                    <p className="text-sm text-gray-600">Deluxe: 패키지별 가격 정보를 확인해보세요</p>
                    <p className="text-sm text-gray-600">Premium: 패키지별 가격 정보를 확인해보세요</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 공정 단가표 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">공정 단가표</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                공정 단가 정보가 없습니다.
              </div>
            </div>
            <div className="border-b border-gray-200 mb-6"></div>

            {/* 전문가 정보 */}
            <div className="mb-6">
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
              <div className="mt-4">
                <h4 className="font-semibold mb-2">소개</h4>
                <p className="text-base text-gray-600 mb-4">
                  {factory.intro || "동대문구장한로34길23~2 지층에 위치하고있읍니다"}
                </p>
                <h4 className="font-semibold mb-2">특수 보유 기술</h4>
                <p className="text-base text-gray-600 mb-4">
                  {factory.special_tech || "주로 다이마루티의류제조업이면서 바지및 반직기도 가능한업체이며 되도록이면 꼼꼼하게 작업해서업체만족도가 높습니다"}
                </p>
                <h4 className="font-semibold mb-2">주요 거래처</h4>
                <p className="text-base text-gray-600">
                  길트프리, 브랜다브랜든, 헬더
                </p>
              </div>
            </div>

            {/* 하단 네비게이션 */}
            <div className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">목록으로 돌아가기</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 고정 사이드바 */}
        <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6 h-fit order-1 lg:order-2 lg:mt-4">
          {/* 상단 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">재</span>
              </div>
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
                    <li>• 텍스트형 시안 1종</li>
                    <li>• 슬로건 제작</li>
                    <li>• 평생 A/S</li>
                    <li>• 원본, 저작, 재산권 이전</li>
                  </ul>
                  <div className="text-xs lg:text-sm text-gray-600 mb-2">샘플비 10,000원</div>
                  <div className="text-xs lg:text-sm text-gray-600 mb-4">장단 단가 16,800원</div>
                  <Button className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm">
                    <Link href={`/factories/${factoryId}/request?service=standard`} className="w-full">
                      공정 의뢰하기
                    </Link>
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
                    <li>• 패턴 제작</li>
                    <li>• 샘플 제작</li>
                    <li>• 봉제 공정</li>
                    <li>• 품질 검수</li>
                    <li>• 배송 서비스</li>
                    <li>• 기술 지원</li>
                  </ul>
                  <Button className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm">
                    <Link href={`/factories/${factoryId}/request?service=deluxe`} className="w-full">
                      패턴/샘플 의뢰하기
                    </Link>
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
                    <li>• 기획 및 디자인</li>
                    <li>• 패턴 제작</li>
                    <li>• 샘플 제작</li>
                    <li>• 봉제 공정</li>
                    <li>• 품질 검수</li>
                    <li>• 배송 서비스</li>
                    <li>• 마케팅 지원</li>
                  </ul>
                  <Button className="w-full bg-gray-800 text-white rounded-lg py-2 text-sm">
                    <Link href={`/factories/${factoryId}/request?service=premium`} className="w-full">
                      올인원 의뢰하기
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 하단 문의 버튼 */}
          <div className="mt-6">
            <Button 
              onClick={handleKakaoInquiry}
              className="w-full bg-yellow-400 text-black rounded-lg py-3 font-bold hover:bg-yellow-500 text-sm lg:text-base"
            >
              💬 문의하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 