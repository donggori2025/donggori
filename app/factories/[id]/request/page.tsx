"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Factory } from "@/lib/factoryCatalog";
import { useAppAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import type { RequestFormData } from "@/lib/types";
import { DONGGORI_OPEN_KAKAO_CHAT_URL } from "@/lib/site";


export default function FactoryRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: authUser, isSignedIn, isLoaded } = useAppAuth();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  
  // 폼 상태
  const [formData, setFormData] = useState<RequestFormData>({
    brandName: "",
    name: "",
    contact: "",
    sample: "미보유",
    pattern: "미보유", 
    qc: "미희망",
    finishing: "미희망",
    packaging: "미희망",
    detailDescription: "",
    detailRequest: "",
    files: [],
    links: [],
    agreeToTerms: false
  });

  // 새로운 링크 입력을 위한 상태
  const [newLink, setNewLink] = useState("");

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

  // 진입 시 로그인 강제 체크 (직접 URL 접근 포함)
  useEffect(() => {
    if (!isLoaded || isSignedIn) return;
    if (!isSignedIn) {
      alert("로그인/회원가입 후 이용 가능합니다.");
      if (typeof window !== "undefined") {
        const nextPath = `${window.location.pathname}${window.location.search || ""}`;
        router.replace(`/sign-in?next=${encodeURIComponent(nextPath)}`);
      } else if (factoryId) {
        router.replace(`/sign-in?next=${encodeURIComponent(`/factories/${factoryId}/request`)}`);
      } else {
        router.replace("/sign-in");
      }
    }
  }, [factoryId, isLoaded, isSignedIn, router]);

  // 로그인한 유저의 이름을 자동으로 입력
  useEffect(() => {
    if (!isSignedIn || !authUser) return;
    setFormData(prev => ({
      ...prev,
      name: prev.name || authUser.name || "",
      contact: prev.contact || authUser.phoneNumber || authUser.email,
    }));
  }, [isSignedIn, authUser]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleAddLink = () => {
    if (newLink.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, newLink.trim()]
      }));
      setNewLink(""); // 입력 필드 초기화
    }
  };

  const handleLinkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLink(e.target.value);
  };

  const handleLinkKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  };


  const removeLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index)
    }));
  };

  // 의뢰 내용을 클립보드에 복사할 텍스트 생성
  const generateRequestText = () => {
    const factoryName = factory?.company_name || factory?.name || '공장';
    
    let text = `[${factoryName} 의뢰 문의]\n\n`;
    text += `- 요청 구분: 의뢰하기\n`;
    text += `- 디자이너: ${formData.name}\n`;
    text += `- 연락처: ${formData.contact}\n`;
    text += `- 브랜드: ${formData.brandName || '미입력'}\n\n`;
    
    if (formData.detailDescription) {
      text += `- 상세 설명:\n${formData.detailDescription}\n\n`;
    }
    
    if (formData.detailRequest) {
      text += `- 상세 요청사항:\n${formData.detailRequest}\n\n`;
    }
    
    text += `- 샘플/패턴 유무:\n`;
    text += `• 샘플: ${formData.sample || '미입력'}\n`;
    text += `• 패턴: ${formData.pattern || '미입력'}\n`;
    text += `• QC: ${formData.qc || '미입력'}\n`;
    text += `• 시아게: ${formData.finishing || '미입력'}\n`;
    text += `• 포장: ${formData.packaging || '미입력'}\n\n`;
    
    if (formData.links.length > 0) {
      text += `- 참고 링크:\n`;
      formData.links.forEach((link, index) => {
        text += `${index + 1}. ${link}\n`;
      });
      text += `\n`;
    }
    
    text += `- 의뢰일: ${new Date().toLocaleDateString('ko-KR')}.\n\n`;
    text += `동고리를 통해 문의드립니다. 감사합니다! 🙏`;
    
    text += `\n첨부 파일은 이 채팅방에 직접 보내겠습니다.`;
    return text;
  };

  // 문의하기 버튼용 간단 문의 텍스트 생성
  const generateInquiryText = () => {
    const factoryName = factory?.company_name || factory?.name || '공장';

    let text = `[${factoryName} 문의]\n\n`;
    text += `- 요청 구분: 문의하기\n`;
    text += `- 이름: ${formData.name || "미입력"}\n`;
    text += `- 연락처: ${formData.contact || "미입력"}\n`;
    text += `- 문의일: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
    text += `동고리를 통해 문의드립니다.`;
    return text;
  };

  // 클립보드 복사 및 카카오톡 연결
  const copyToClipboardAndOpenKakao = async () => {
    try {
      const requestText = generateRequestText();
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(requestText);
      
      // 고정 오픈카카오톡 URL로 이동
      alert('의뢰 내용이 클립보드에 복사되었습니다!\n카카오톡 채팅창에 붙여넣기 한 뒤 전송해주세요.\n확인을 누르면 카카오톡으로 이동합니다.');
      window.open(DONGGORI_OPEN_KAKAO_CHAT_URL, '_blank');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('클립보드 복사 오류:', error);
      }
      alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
    }
  };

  // 문의하기 버튼 전용: 문의 텍스트 복사 후 카카오톡 이동
  const copyInquiryAndOpenKakao = async () => {
    try {
      const inquiryText = generateInquiryText();
      await navigator.clipboard.writeText(inquiryText);
      alert('문의 내용이 클립보드에 복사되었습니다!\n카카오톡 채팅창에 붙여넣기 한 뒤 전송해주세요.\n확인을 누르면 카카오톡으로 이동합니다.');
      window.open(DONGGORI_OPEN_KAKAO_CHAT_URL, '_blank');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('문의 클립보드 복사 오류:', error);
      }
      window.open(DONGGORI_OPEN_KAKAO_CHAT_URL, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factory) {
      alert("공장 정보가 로딩되지 않았습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    if (!factoryId) {
      if (process.env.NODE_ENV === 'development') {
        console.error('의뢰 제출 중 오류: factoryId 누락');
      }
      alert('공장 정보(ID)가 확인되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
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

    // 버튼 클릭 시 즉시 제출 중 상태로 변경
    setSubmitting(true);

    try {
      // 공장명 누락 방지: company_name 또는 name이 반드시 있어야 함
      const factoryName = factory.company_name || factory.name;
      if (!factoryName) {
        alert("공장명 정보가 없습니다. 잠시 후 다시 시도해 주세요.");
        return;
      }
      
      // Attachments are intentionally sent in the central Kakao chat, not public Storage.
      try {
        const payload = {
          user_name: formData.name,
          factory_id: factoryId,
          items: [],
          quantity: 0,
          description: `브랜드: ${formData.brandName || '미입력'}\n연락처: ${formData.contact}`,
          contact: formData.contact,
          deadline: '',
          budget: '',
          additional_info: JSON.stringify({
            brandName: formData.brandName,
            sample: formData.sample,
            pattern: formData.pattern,
            qc: formData.qc,
            finishing: formData.finishing,
            packaging: formData.packaging,
            description: formData.detailDescription,
            request: formData.detailRequest,
            links: formData.links,
          })
        } as const;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('의뢰 제출 payload:', payload);
        }

        const res = await fetch('/api/match-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          if (process.env.NODE_ENV === 'development') {
            console.error('의뢰 제출 중 오류(서버):', err);
          }
          setSubmitting(false);
          alert(`의뢰 제출 중 오류가 발생했습니다.\n${err?.error || res.statusText}`);
          return;
        }

        // 의뢰 내용을 클립보드에 복사하고 카카오톡으로 연결
        await copyToClipboardAndOpenKakao();
        
        // 팝업이 뜬 후 제출 상태 해제
        setSubmitting(false);
      } catch (dbError: unknown) {
        const error = dbError as Error;
        if (process.env.NODE_ENV === 'development') {
          console.error('데이터베이스 저장 중 예외 발생:', dbError, {
            message: error?.message,
            stack: error?.stack,
          });
        }
        setSubmitting(false);
        alert('데이터베이스 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      
      // 성공 후 폼 초기화
      setFormData({
        brandName: "",
        name: "",
        contact: "",
        sample: "미보유",
        pattern: "미보유", 
        qc: "미희망",
        finishing: "미희망",
        packaging: "미희망",
        detailDescription: "",
        detailRequest: "",
        files: [],
        links: [],
        agreeToTerms: false
      });
      
    } catch (error: unknown) {
      const err = error as Error;
      if (process.env.NODE_ENV === 'development') {
        console.error('의뢰 제출 중 오류:', error, {
          message: err?.message,
          stack: err?.stack,
        });
      }
      setSubmitting(false);
      alert('의뢰 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
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

  if (!isLoaded || !isSignedIn) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로그인 확인 중...</div>;
  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

  const factoryName = factory.company_name || factory.name || "공장";
  const factoryType = factory.factory_type || factory.business_type || "봉제공장";
  const factoryIntro = factory.intro || factory.intro_text || factory.description;
  const factoryLocation = factory.address || factory.admin_district || factory.region;
  const factoryFabrics = factory.main_fabrics;
  const factoryMoq = factory.moq || factory.minOrder;

  const summaryItems = [
    factoryIntro ? { label: "한 줄 소개", value: factoryIntro } : null,
    factoryLocation ? { label: "위치", value: factoryLocation } : null,
    factoryFabrics ? { label: "작업 가능 원단", value: factoryFabrics } : null,
    factoryMoq ? { label: "최소 발주수량", value: `${factoryMoq}pcs` } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
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
                {/* 상세 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상세 설명</label>
                  <textarea
                    placeholder="제품, 원단, 수량, 납기 등 상세 설명을 입력해주세요"
                    value={formData.detailDescription}
                    onChange={(e) => handleInputChange("detailDescription", e.target.value)}
                    className="w-full h-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                {/* 상세 요청사항 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">상세 요청사항</label>
                  <textarea
                    placeholder="특이사항, 요청사항, 참고사항을 입력해주세요"
                    value={formData.detailRequest}
                    onChange={(e) => handleInputChange("detailRequest", e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  도면·레퍼런스 파일은 의뢰 접수 후 열리는 동고리 카카오톡 채팅방에 보내주세요.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faddit 작업지시서</label>
                  <div className="space-y-2">
                    {/* 기존 링크들 */}
                    {formData.links.map((link, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-blue-600 truncate flex-1">{link}</span>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="text-black hover:text-gray-700 ml-2 px-2 py-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    
                    {/* 새로운 링크 입력 */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="링크를 입력해주세요"
                        value={newLink}
                        onChange={handleLinkInputChange}
                        onKeyPress={handleLinkKeyPress}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleAddLink}
                        disabled={!newLink.trim()}
                        className={`px-4 py-2 rounded-lg border ${
                          newLink.trim() 
                            ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600" 
                            : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                        }`}
                      >
                        추가
                      </button>
                    </div>
                  </div>
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
                  <div className="mt-2 space-y-2">
                    <Link href="/terms/privacy" className="text-sm text-gray-500 hover:text-gray-700 block">
                      개인정보 취급방침 &gt;
                    </Link>
                    <Link href="/terms/service" className="text-sm text-gray-500 hover:text-gray-700 block">
                      이용약관 &gt;
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <Button
              type="submit"
              disabled={submitting || loading || !factory || !(factory.company_name || factory.name) || !formData.agreeToTerms}
              className={`w-full py-4 rounded-lg font-bold ${
                formData.agreeToTerms && factory && (factory.company_name || factory.name) && !loading && !submitting
                  ? "bg-gray-800 text-white hover:bg-gray-900" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  의뢰 처리 중...
                </>
              ) : (
                "공정 의뢰하기"
              )}
            </Button>
          </form>
        </div>

        {/* 오른쪽: 업장 요약 */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 lg:sticky lg:top-8">
            <div className="font-bold text-lg mb-1">{factoryName}</div>
            <div className="text-xs text-gray-500 mb-4">{factoryType}</div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              {summaryItems.length > 0 ? (
                summaryItems.map((item) => (
                  <div key={item.label}>
                    <div className="text-xs font-semibold text-gray-500">{item.label}</div>
                    <p className="text-sm text-gray-800 mt-0.5 leading-relaxed line-clamp-3">{item.value}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">업장 정보를 준비 중입니다.</p>
              )}
            </div>

            <Button 
              className="w-full bg-gray-100 text-black rounded-lg py-3 font-bold hover:bg-gray-200 text-sm lg:text-base flex items-center justify-center gap-2"
              onClick={() => {
                copyInquiryAndOpenKakao();
              }}
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

      {/* 나가기 확인 팝업 */}
      {showExitConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg border border-gray-200">
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
