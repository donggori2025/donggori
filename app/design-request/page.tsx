"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getAppUserIdentity, isAppLoggedIn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import {
  CalendarDays,
  ClipboardCheck,
  ImageIcon,
  MessageCircleMore,
  Palette,
  Send,
  Shirt,
  Upload,
} from "lucide-react";

type RequesterType = "기업" | "개인" | "관공서";
type ProductType = "의류" | "유니폼" | "굿즈" | "기타";
const OPEN_KAKAO_CHAT_URL = "https://open.kakao.com/o/sLFYzFki";

const REQUESTER_TYPES: RequesterType[] = ["기업", "개인", "관공서"];
const PRODUCT_TYPES: ProductType[] = ["의류", "유니폼", "굿즈", "기타"];

const FLOW_STEPS = [
  { label: "상담예약", icon: CalendarDays },
  { label: "상담접수", icon: ClipboardCheck },
  { label: "방문상담진행", icon: MessageCircleMore },
  { label: "샘플, 패턴실 연계", icon: Shirt },
] as const;

const GUIDE_STEPS = [
  {
    step: "01",
    text: "의뢰 내용을 바탕으로 상품 유형, 제작 방식, 예산·일정에 맞는 디자인 진행 방향을 안내해드립니다.",
  },
  {
    step: "02",
    text: "디자인 및 제작 관련 상담도 가능합니다. (소재 선택, 샘플 제작 가능 여부, 제작 프로세스 문의 등)",
  },
  {
    step: "03",
    text: "안내 후 실제 제작 및 거래 진행 여부는 의뢰자 판단으로 결정됩니다. 이후 세부 진행은 당사자 간 협의를 통해 진행되며, 서비스는 의뢰 접수와 연결 지원 단계까지 제공됩니다.",
  },
] as const;

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              value === opt
                ? "bg-[#111] text-white border-[#111]"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DesignRequestPage() {
  const router = useRouter();
  const { user: clerkUser } = useAppAuth();
  const [requesterType, setRequesterType] = useState<RequesterType>("기업");
  const [productType, setProductType] = useState<ProductType | "">("");
  const [productTypeDetail, setProductTypeDetail] = useState("");
  const [productName, setProductName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const previewUrls = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    setImages((prev) => [...prev, ...selected].slice(0, 10));
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const generateRequestText = (referenceImageUrls: string[]) => {
    let text = `[디자인 의뢰 문의]\n\n`;
    text += `- 의뢰자 구분: ${requesterType}\n`;
    text += `- 원하는 상품 유형: ${productType}\n`;
    text += `- 상품 유형 상세: ${productTypeDetail}\n`;
    text += `- 상품명/프로젝트명: ${productName}\n`;
    text += `- 담당자명: ${contactName}\n`;
    text += `- 연락처: ${phone}\n`;
    text += `- 이메일: ${email || "미입력"}\n\n`;
    text += `- 요청 내용:\n${description}\n\n`;
    text += `- 의뢰일: ${new Date().toLocaleDateString("ko-KR")}\n`;

    if (referenceImageUrls.length > 0) {
      text += `\n- 레퍼런스 이미지:\n`;
      referenceImageUrls.forEach((url, index) => {
        text += `${index + 1}. ${url}\n`;
      });
    }
    return text;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAppLoggedIn() && !clerkUser) {
      alert("로그인 후 이용 가능합니다.");
      router.push("/sign-in?next=/design-request");
      return;
    }
    if (!productName.trim() || !contactName.trim() || !phone.trim() || !description.trim()) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!productType) {
      alert("원하는 상품 유형을 선택해주세요.");
      return;
    }
    if (!productTypeDetail.trim()) {
      alert("선택한 상품 유형 상세를 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const userIdentity = getAppUserIdentity(clerkUser);
      if (!userIdentity.id || !userIdentity.email) {
        alert("사용자 정보 확인에 실패했습니다. 다시 로그인 후 시도해주세요.");
        return;
      }

      const uploadedReferenceUrls: string[] = [];
      for (const file of images) {
        const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
        const filePath = `design-requests/${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("match-request-files")
          .upload(filePath, file);
        if (uploadError) {
          alert(`레퍼런스 이미지 업로드 실패: ${file.name}`);
          return;
        }
        const { data } = supabase.storage.from("match-request-files").getPublicUrl(filePath);
        if (data?.publicUrl) uploadedReferenceUrls.push(data.publicUrl);
      }

      const payload = {
        user_id: userIdentity.id,
        user_email: userIdentity.email,
        user_name: contactName.trim(),
        factory_id: "design-request",
        factory_name: "디자인 의뢰",
        status: "pending",
        items: [productType],
        quantity: 0,
        description,
        contact: phone,
        deadline: "",
        budget: "",
        additional_info: JSON.stringify({
          requestType: "design",
          requesterType,
          productType,
          productTypeDetail,
          productName,
          contactName,
          email,
          description,
          referenceImages: uploadedReferenceUrls,
        }),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch("/api/match-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) {
        throw new Error(json?.error || "의뢰 등록 실패");
      }

      const requestText = generateRequestText(uploadedReferenceUrls);
      await navigator.clipboard.writeText(requestText);
      alert(
        "디자인 의뢰가 접수되었습니다.\n의뢰 내용이 클립보드에 복사되었습니다.\n카카오톡 채팅창에 붙여넣기 후 전송해주세요.\n확인을 누르면 오픈카카오채팅으로 이동합니다."
      );
      window.open(OPEN_KAKAO_CHAT_URL, "_blank");
      setProductType("");
      setProductTypeDetail("");
      setProductName("");
      setContactName("");
      setPhone("");
      setEmail("");
      setDescription("");
      setImages([]);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("디자인 의뢰 등록 오류:", error);
      }
      alert("디자인 의뢰 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition";

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className={`${PAGE_CONTAINER_CLASS} py-8 md:py-10 space-y-10`}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">디자인 의뢰하기</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">
            원하시는 상품 정보를 남겨주시면 디자인 가능 여부와 진행 방안을 안내드립니다.
          </p>
        </div>
        {/* 이용 안내 */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">이용 안내</h2>
            <p className="text-sm text-gray-600 mt-1">디자인 의뢰부터 제작 연계까지의 진행 방식을 확인하세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {GUIDE_STEPS.map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6"
              >
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-violet-50 text-violet-700 text-sm font-bold mb-3">
                  {item.step}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 진행 플로우 */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">진행 플로우</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FLOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative flex flex-col items-center text-center">
                  {index < FLOW_STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-9 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gradient-to-r from-violet-200 to-transparent" />
                  )}
                  <div className="w-16 h-16 md:w-[4.5rem] md:h-[4.5rem] rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mb-3">
                    <Icon className="w-7 h-7 text-violet-600" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{step.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 의뢰 폼 */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-900">의뢰 정보</h2>
              </div>

              <ChipGroup
                label="의뢰자 구분 *"
                options={REQUESTER_TYPES}
                value={requesterType}
                onChange={setRequesterType}
              />

              <ChipGroup
                label="원하는 상품 유형 *"
                options={PRODUCT_TYPES}
                value={productType}
                onChange={setProductType}
              />

              {productType && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    선택한 상품 유형 상세 *
                  </label>
                  <input
                    value={productTypeDetail}
                    onChange={(e) => setProductTypeDetail(e.target.value)}
                    placeholder={
                      productType === "의류"
                        ? "예: 반팔 티셔츠, 후드집업"
                        : productType === "유니폼"
                          ? "예: 병원 유니폼, 근무복"
                          : productType === "굿즈"
                            ? "예: 에코백, 파우치"
                            : "원하는 상품 유형을 입력해주세요"
                    }
                    className={inputClass}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    상품명/프로젝트명 *
                  </label>
                  <input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="예: 2026 S/S 반팔 티셔츠"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">담당자명 *</label>
                  <input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="담당자명을 입력해주세요"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">연락처 *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@company.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-900">요청 내용</h2>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="원하시는 디자인 방향, 용도, 수량, 일정 등을 자유롭게 적어주세요."
                className={`${inputClass} min-h-[140px] resize-y`}
              />
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-bold text-gray-900">레퍼런스 이미지</h2>
              </div>
              <label
                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition ${
                  images.length > 0
                    ? "border-violet-400 bg-violet-50/40"
                    : "border-gray-300 hover:border-violet-400 hover:bg-gray-50"
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onImageChange}
                  className="hidden"
                />
                <ImageIcon className="w-10 h-10 text-gray-400" />
                <p className="text-sm text-gray-600 text-center">
                  레퍼런스 이미지를 클릭해 업로드
                  <br />
                  <span className="text-xs text-gray-400">최대 10장 · PNG, JPG</span>
                </p>
              </label>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {previewUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`reference-${idx}`} className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs px-2 py-1 rounded-md"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-2">의뢰 접수</h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                접수 후 의뢰 내용이 클립보드에 복사되며, 카카오 오픈채팅으로 상담을 이어갈 수 있습니다.
              </p>
              <ul className="text-xs text-gray-500 space-y-2 mb-6">
                <li>· 로그인 후 이용 가능합니다</li>
                <li>· 필수 항목: 상품 유형, 담당자, 연락처, 요청 내용</li>
                <li>· 레퍼런스 이미지는 선택 사항입니다</li>
              </ul>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base font-bold bg-[#111] hover:bg-black"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    의뢰 접수 중...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    디자인 의뢰하기
                  </span>
                )}
              </Button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
