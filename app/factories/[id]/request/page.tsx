"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Factory } from "@/lib/factories";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { isAppLoggedIn, getAppUserIdentity, storage } from "@/lib/utils";
import type { RequestFormData } from "@/lib/types";

const OPEN_KAKAO_CHAT_URL = "https://open.kakao.com/o/sLFYzFki";

export default function FactoryRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [factory, setFactory] = useState<Factory | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [factoryId, setFactoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("standard");
  
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

  // 로그인한 유저의 이름을 자동으로 입력
  useEffect(() => {
    // Clerk가 로드될 때까지 기다림
    if (!clerkLoaded) return;
    
    // 로그인 확인 및 기본 사용자 정보 채우기
    if (!isAppLoggedIn() && !clerkUser) {
      alert('로그인 후 이용 가능합니다.');
      if (factoryId) router.replace(`/sign-in?next=/factories/${factoryId}/request`);
      return;
    }
    
    const nameFromUrl = searchParams.get("name");
    const userIdentity = getAppUserIdentity(clerkUser);
    
    // 개발 환경에서만 디버깅 정보 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('사용자 정보:', {
        clerkLoaded,
        clerkUser: clerkUser ? {
          id: clerkUser.id,
          firstName: clerkUser.firstName,
          fullName: clerkUser.fullName,
          email: clerkUser.emailAddresses?.[0]?.emailAddress,
          phone: clerkUser.phoneNumbers?.[0]?.phoneNumber
        } : null,
        userIdentity,
        nameFromUrl
      });
    }
    
    setFormData(prev => ({
      ...prev,
      // URL 파라미터보다는 실제 로그인한 사용자 정보를 우선 사용
      name: prev.name || userIdentity.name || (nameFromUrl ? decodeURIComponent(nameFromUrl) : ''),
      contact: prev.contact || userIdentity.phone
    }));
    
    // 올바른 사용자 정보를 localStorage에 저장 (캐싱)
    if (userIdentity.name) {
      storage.set('userName', userIdentity.name);
    }
    if (userIdentity.phone) {
      storage.set('userPhone', userIdentity.phone);
    }
  }, [searchParams, factoryId, router, clerkLoaded, clerkUser]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // 파일 크기 및 형식 검증
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.ppt', '.pptx', '.png', '.jpg', '.jpeg'];
    
    for (const file of files) {
      // 파일 크기 검증
      if (file.size > maxSize) {
        alert(`${file.name} 파일이 10MB를 초과합니다.`);
        return;
      }
      
      // 파일 형식 검증
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        alert(`${file.name} 파일 형식이 지원되지 않습니다. (지원 형식: PDF, PPT, PNG, JPG)`);
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...files]
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

  // 의뢰 내용을 클립보드에 복사할 텍스트 생성
  const generateRequestText = (fileUrls: string[] = []) => {
    const factoryName = factory?.company_name || factory?.name || '공장';
    const serviceName = currentService.title;
    
    let text = `[${factoryName} 의뢰 문의]\n\n`;
    text += `- 서비스: ${serviceName}\n`;
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
    
    // 첨부 파일 다운로드 링크 추가
    if (formData.files.length > 0 && fileUrls.length > 0) {
      text += `\n\n- 첨부 파일 다운로드:\n`;
      formData.files.forEach((file, index) => {
        if (fileUrls[index]) {
          text += `${index + 1}. ${file.name} -> ${fileUrls[index]}\n`;
        } else {
          text += `${index + 1}. ${file.name}\n`;
        }
      });
    }
    
    return text;
  };

  // 클립보드 복사 및 카카오톡 연결
  const copyToClipboardAndOpenKakao = async (fileUrls: string[] = []) => {
    try {
      const requestText = generateRequestText(fileUrls);
      
      // 클립보드에 복사
      await navigator.clipboard.writeText(requestText);
      
      // 고정 오픈카카오톡 URL로 이동
      alert('의뢰 내용이 클립보드에 복사되었습니다!\n카카오톡 채팅창에 붙여넣기 한 뒤 전송해주세요.\n확인을 누르면 카카오톡으로 이동합니다.');
      window.open(OPEN_KAKAO_CHAT_URL, '_blank');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('클립보드 복사 오류:', error);
      }
      alert('클립보드 복사에 실패했습니다. 수동으로 복사해주세요.');
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
      
      // 1. 첨부파일 Supabase Storage 업로드
      const uploadedFileUrls: string[] = [];
      if (formData.files.length > 0) {
        try {
          for (const file of formData.files) {
            // Supabase Storage 키는 일부 특수문자를 허용하지 않으므로 안전한 파일명으로 정규화
            const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
            // 버킷 내부 경로만 전달 (버킷명 중복 제거)
            const filePath = `${Date.now()}_${safeName}`;
            const { error: uploadError } = await supabase.storage.from('match-request-files').upload(filePath, file);
            if (uploadError) {
              if (process.env.NODE_ENV === 'development') {
                console.error('파일 업로드 오류:', uploadError);
              }
              setSubmitting(false);
              alert(`파일 업로드 중 오류가 발생했습니다: ${file.name}\n오류: ${uploadError.message}`);
              return;
            }
            // publicUrl 생성
            const { data: publicUrlData } = supabase.storage.from('match-request-files').getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              uploadedFileUrls.push(publicUrlData.publicUrl);
            }
          }
        } catch (fileError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('파일 업로드 중 예외 발생:', fileError);
          }
          setSubmitting(false);
          alert('파일 업로드 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
          return;
        }
      }

      // 서버 API 경유로 의뢰 데이터 저장 (RLS 회피 및 상세 오류 전달)
      try {
        const loggedInUser = getAppUserIdentity(clerkUser);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('의뢰 제출 시 사용자 정보:', loggedInUser);
        }
        
        const payload = {
          user_id: loggedInUser.id || `user_${Date.now()}`,
          user_email: loggedInUser.email || `${formData.name || 'user'}@example.com`,
          user_name: formData.name,
          factory_id: factoryId,
          factory_name: factoryName,
          status: 'pending',
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
            files: uploadedFileUrls,
            links: formData.links,
            selectedService: selectedService,
            serviceDetails: {
              standard: { title: 'Standard', subtitle: '봉제공정' },
              deluxe: { title: 'Deluxe', subtitle: '패턴/샘플 + 공장' },
              premium: { title: 'Premium', subtitle: '올인원(기획/디자인~)' }
            }
          }),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

        // 성공 시 알림톡 전송 호출
        const { id: newId } = await res.json();
        if (newId) {
          try {
            await fetch(`/api/requests/${newId}/notify-factory`, { method: 'POST' });
          } catch (notifyErr) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('알림톡 전송 호출 실패(무시):', notifyErr);
            }
          }
        }

        // 의뢰 내용을 클립보드에 복사하고 카카오톡으로 연결
        await copyToClipboardAndOpenKakao(uploadedFileUrls);
        
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

  if (loading) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">로딩 중...</div>;
  if (!factory) return <div className="max-w-xl mx-auto py-10 px-4 text-center text-gray-500">존재하지 않는 공장입니다.</div>;

  const serviceData = {
    standard: {
      title: "Standard",
      subtitle: "봉제공정",
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
      features: [
        "샘플/패턴실 매칭",
        "봉제공장 매칭",
        "작업지시서 전달"
      ]
    },
    premium: {
      title: "Premium",
      subtitle: "올인원(기획/디자인~)",
      features: [
        "디자인(도식화, 패턴) 기획 컨설팅",
        "샘플/패턴실 매칭",
        "봉제공장 매칭",
        "작업지시서 전달"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">파일</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.ppt,.pptx,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="inline-block px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black focus:border-black">
                    + 파일 업로드
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    지원 형식: PDF, PPT, PNG, JPG (최대 10MB)
                  </p>
                  {formData.files.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {formData.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-black hover:text-gray-700"
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

        {/* 오른쪽: 선택된 서비스 정보 */}
        <div className="w-full lg:w-[380px] flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="font-bold text-lg mb-2">{factory.company_name}</div>
            <div className="text-xs text-gray-500 mb-2">봉제공장</div>
            
            {/* 선택된 서비스 표시 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="mb-2">
                <div className="font-semibold">{currentService.title}</div>
                <div className="text-xs text-gray-500">{currentService.subtitle}</div>
              </div>
              <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                {currentService.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>

            <Button 
              className="w-full bg-gray-100 text-black rounded-lg py-3 font-bold hover:bg-gray-200 text-sm lg:text-base flex items-center justify-center gap-2"
              onClick={() => {
                window.open(OPEN_KAKAO_CHAT_URL, '_blank');
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