"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Factory } from "@/lib/factories";
import { useRouter } from "next/navigation";

export default function FactoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = useUser();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<'standard'|'deluxe'|'premium'>('standard');
  const router = useRouter();

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

  // 이미지 갤러리
  const SAMPLE_IMAGES = [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1465101178521-c1a9136a3c5a?auto=format&fit=crop&w=600&q=80"
  ];
  const images = Array.isArray(factory.images) && factory.images.length > 0
    ? factory.images
    : SAMPLE_IMAGES;

  // 장비/기술 등은 Chip 형태로 분리
  const splitChips = (val: string | null | undefined) =>
    typeof val === "string"
      ? val.split(/,|\|| /).map((v) => v.trim()).filter(Boolean)
      : [];

  // 상품(서비스) 정보
  const serviceData = {
    standard: {
      title: "Standard",
      subtitle: "봉제공정",
      price: "39,000원 (VAT 포함)",
      features: [
        "텍스트형 시안 1종",
        "슬로건 제작",
        "평생 A/S",
        "원본, 저작, 재산권 이전",
        "샘플비 10,000원",
        "장단 단가 16,800원"
      ]
    },
    deluxe: {
      title: "Deluxe",
      subtitle: "패턴/샘플 + 공장",
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
  const currentService = serviceData[selectedService];

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-2 md:px-6">
      {/* 이미지 갤러리 */}
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {images.map((img: string, idx: number) => (
          <div key={img + idx} className="aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <Image src={img} alt={factory.company_name + " 이미지"} width={400} height={300} className="object-cover w-full h-full" />
          </div>
        ))}
      </div>
      {/* 2단 레이아웃 */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* 왼쪽: 상세 정보 */}
        <div className="flex-1 min-w-0">
          {/* 업체명, 태그, 문의 버튼 */}
          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
            <span className="inline-block bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-xs">패턴</span>
            <span className="text-2xl font-bold ml-0 md:ml-4">{factory.company_name}</span>
            <span className="ml-0 md:ml-4 text-gray-500 text-sm">연락 가능 · 시간 : 연중무휴</span>
            <Button size="sm" className="ml-auto md:ml-4 bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" onClick={handleKakaoInquiry}>문의하기</Button>
          </div>
          {/* 주소 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">주소</div>
            <div className="text-gray-700 text-sm">{factory.address || '-'}</div>
          </div>
          {/* 주요 정보 - 표 형태 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">주요 정보</div>
            <table className="w-full text-sm text-left border-separate border-spacing-y-1">
              <tbody>
                <tr>
                  <th className="font-semibold text-gray-600 w-32 align-top">업종</th>
                  <td>{factory.business_type || '-'}</td>
                </tr>
                <tr>
                  <th className="font-semibold text-gray-600 w-32 align-top">공급 브랜드</th>
                  <td>{factory.brands_supplied || '-'}</td>
                </tr>
                <tr>
                  <th className="font-semibold text-gray-600 w-32 align-top">주요 원단</th>
                  <td>{factory.main_fabrics || '-'}</td>
                </tr>
                <tr>
                  <th className="font-semibold text-gray-600 w-32 align-top">최소 주문 수량</th>
                  <td>{factory.MOQ ?? factory.moq ?? factory.minOrder ?? '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* 보유 장비 - Chip 형태 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">봉제 장비</div>
            <div className="flex flex-wrap gap-2">
              {splitChips(factory.sewing_machines).length > 0
                ? splitChips(factory.sewing_machines).map((item, i) => (
                    <span key={item + i} className="bg-gray-100 rounded px-3 py-1 text-sm">{item}</span>
                  ))
                : <span className="text-gray-400">-</span>}
            </div>
          </div>
          {/* 패턴 장비 - Chip 형태 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">패턴 장비</div>
            <div className="flex flex-wrap gap-2">
              {splitChips(factory.pattern_machines).length > 0
                ? splitChips(factory.pattern_machines).map((item, i) => (
                    <span key={item + i} className="bg-gray-100 rounded px-3 py-1 text-sm">{item}</span>
                  ))
                : <span className="text-gray-400">-</span>}
            </div>
          </div>
          {/* 특수 장비 - Chip 형태 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">특수 장비</div>
            <div className="flex flex-wrap gap-2">
              {splitChips(factory.special_machines).length > 0
                ? splitChips(factory.special_machines).map((item, i) => (
                    <span key={item + i} className="bg-gray-100 rounded px-3 py-1 text-sm">{item}</span>
                  ))
                : <span className="text-gray-400">-</span>}
            </div>
          </div>
          {/* 제조사 정보 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">제조사 정보</div>
            <div className="flex flex-wrap gap-8 text-center">
              <div>
                <div className="text-xs text-gray-500 mb-1">행정구역</div>
                <div className="font-bold text-lg">{factory.admin_district || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">월 생산능력</div>
                <div className="font-bold text-lg">{factory.monthly_capacity || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">배송</div>
                <div className="font-bold text-lg">{factory.delivery || '-'}</div>
              </div>
            </div>
          </div>
          {/* 소개 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">소개</div>
            <div className="text-sm text-gray-700">{factory.intro || '-'}</div>
          </div>
          {/* 특수 보유 기술 */}
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="font-bold text-gray-700 mb-1">특수 보유 기술</div>
            <div className="text-sm text-gray-700">{factory.special_tech || '-'}</div>
          </div>
          <div className="text-center mt-8">
            <Link href="/factories" className="text-toss-blue hover:underline">← 목록으로 돌아가기</Link>
          </div>
        </div>
        {/* 오른쪽: 문의/상품/옵션 카드 */}
        <div className="w-full md:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <div className="font-bold text-lg mb-2">{factory.company_name}</div>
            <div className="text-xs text-gray-500 mb-4">봉제공장</div>
            {/* 상품 선택 탭 */}
            <div className="flex gap-2 mb-4">
              {(['standard','deluxe','premium'] as const).map((key) => (
                <button
                  key={key}
                  className={`flex-1 py-2 rounded-lg font-bold border transition text-sm ${selectedService===key ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
                  onClick={()=>setSelectedService(key)}
                >
                  {serviceData[key].title}
                </button>
              ))}
            </div>
            {/* 선택된 상품 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">{currentService.title}</div>
                  <div className="text-xs text-gray-500">{currentService.subtitle}</div>
                </div>
                <div className="text-sm font-semibold text-black">{currentService.price}</div>
              </div>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {currentService.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
            {/* 의뢰하기 버튼 */}
            <Button
              className="w-full bg-black text-white rounded-full font-bold py-2 mt-2"
              onClick={()=>router.push(`/factories/${factory.id}/request?service=${selectedService}`)}
            >
              의뢰하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 