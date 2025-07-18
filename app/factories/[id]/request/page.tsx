"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Factory } from "@/lib/factories";

export default function FactoryRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("standard");
  
  // 폼 상태
  const [formData, setFormData] = useState({
    brandName: "",
    name: "",
    contact: "",
    sample: "미보유",
    pattern: "미보유", 
    qc: "미희망",
    finishing: "미희망",
    packaging: "미희망",
    files: [] as File[],
    links: [] as string[],
    agreeToTerms: false
  });

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

  useEffect(() => {
    const service = searchParams.get("service");
    if (service) {
      setSelectedService(service);
    }
  }, [searchParams]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
    }));
  };

  const handleAddLink = () => {
    const link = prompt("링크를 입력해주세요:");
    if (link) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!formData.contact.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("개인정보 취급방침 및 서비스 이용 약관에 동의해주세요.");
      return;
    }
    // TODO: 공장 사장님에게 전달하는 로직 구현
    console.log("의뢰 제출:", formData);
  };

  const handleExitClick = () => {
    // 폼에 데이터가 입력되었는지 확인
    const hasData = formData.brandName.trim() || 
                   formData.name.trim() || 
                   formData.contact.trim() || 
                   formData.files.length > 0 || 
                   formData.links.length > 0 ||
                   formData.sample !== "미보유" ||
                   formData.pattern !== "미보유" ||
                   formData.qc !== "미희망" ||
                   formData.finishing !== "미희망" ||
                   formData.packaging !== "미희망";
    
    if (hasData) {
      setShowExitConfirm(true);
    } else {
      window.history.back();
    }
  };

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    window.history.back();
  };
  const handleCancelExit = () => {
    setShowExitConfirm(false);
  };

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

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

  const currentService = serviceData[selectedService as keyof typeof serviceData];

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-2 md:px-6">
      {/* 뒤로가기 링크 */}
      <div className="mb-6">
        <button 
          onClick={handleExitClick}
          className="text-gray-600 hover:text-gray-800"
        >
          ← 돌아가기
        </button>
      </div>

      {/* 2단 레이아웃 */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* 왼쪽: 의뢰 폼 */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-lg mb-4">기본 정보</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명</label>
                  <input
                    type="text"
                    placeholder="브랜드명을 입력해주세요."
                    value={formData.brandName}
                    onChange={(e) => handleInputChange("brandName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
                  <input
                    type="text"
                    placeholder="이름을 입력해주세요."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처 *</label>
                  <input
                    type="tel"
                    placeholder="연락처를 입력해주세요."
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 샘플/패턴 유무 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-lg mb-4">샘플/패턴 유무</h2>
              <div className="space-y-4">
                {[
                  { key: "sample", label: "샘플" },
                  { key: "pattern", label: "패턴" },
                  { key: "qc", label: "QC" },
                  { key: "finishing", label: "시아게" },
                  { key: "packaging", label: "포장" }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={item.key}
                          value={item.key === "sample" || item.key === "pattern" ? "보유" : "희망"}
                          checked={formData[item.key as keyof typeof formData] === (item.key === "sample" || item.key === "pattern" ? "보유" : "희망")}
                          onChange={(e) => handleInputChange(item.key, e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">{item.key === "sample" || item.key === "pattern" ? "보유" : "희망"}</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={item.key}
                          value={item.key === "sample" || item.key === "pattern" ? "미보유" : "미희망"}
                          checked={formData[item.key as keyof typeof formData] === (item.key === "sample" || item.key === "pattern" ? "미보유" : "미희망")}
                          onChange={(e) => handleInputChange(item.key, e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm">{item.key === "sample" || item.key === "pattern" ? "미보유" : "미희망"}</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 작업지시서 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-bold text-lg mb-4">작업지시서</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">파일</label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    + 파일 업로드
                  </label>
                  {formData.files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faddit 작업지시서</label>
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                      <span className="text-sm text-blue-600 truncate">{link}</span>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    + 링크 추가
                  </button>
                </div>
              </div>
            </div>

            {/* 개인정보 동의 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="agree-terms" className="text-sm">
                    [필수] 개인정보 취급방침 및 서비스 이용 약관에 동의합니다.
                  </label>
                  <div className="mt-2 space-x-4">
                    <Link href="/terms/privacy" className="text-sm text-blue-600 hover:underline">
                      개인정보 취급방침 &gt;
                    </Link>
                    <Link href="/terms/service" className="text-sm text-blue-600 hover:underline">
                      이용약관 &gt;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={!formData.agreeToTerms}
              className={`w-full py-3 rounded-lg font-bold ${
                formData.agreeToTerms 
                  ? "bg-gray-800 text-white hover:bg-gray-900" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              공정 의뢰하기
            </Button>
          </form>
        </div>

        {/* 오른쪽: 선택된 서비스 정보 */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="font-bold text-lg mb-2">{factory.company_name}</div>
            <div className="text-xs text-gray-500 mb-2">봉제공장</div>
            
            {/* 선택된 서비스 표시 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold">{currentService.title}</div>
                  <div className="text-xs text-gray-500">{currentService.subtitle}</div>
                </div>
                <div className="text-sm font-semibold text-blue-600">{currentService.price}</div>
              </div>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {currentService.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <Button className="w-full bg-yellow-400 text-black rounded-full font-bold py-2">
              문의하기
            </Button>
          </div>
        </div>
      </div>

      {/* 나가기 확인 팝업 */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">정말 나가시겠습니까?</h3>
            <p className="text-gray-600 mb-6">지금 나가시면 작성하셨던 내용은 저장되지 않습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelExit}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleConfirmExit}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 