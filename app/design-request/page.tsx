"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabaseClient";
import { getAppUserIdentity, isAppLoggedIn } from "@/lib/utils";

type RequesterType = "기업" | "개인" | "관공서";
type ProductType = "의류" | "유니폼" | "굿즈" | "기타";
const OPEN_KAKAO_CHAT_URL = "https://open.kakao.com/o/sLFYzFki";

export default function DesignRequestPage() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
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

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-2 md:px-6">
      <h1 className="text-2xl md:text-3xl font-extrabold mb-2">디자인 의뢰하기</h1>
      <p className="text-gray-600 mb-8">
        원하시는 상품 정보를 남겨주시면 디자인 가능 여부와 진행 방안을 안내드립니다.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">의뢰자 구분 *</label>
            <div className="relative">
              <select
                value={requesterType}
                onChange={(e) => setRequesterType(e.target.value as RequesterType)}
                className="w-full border rounded-lg px-3 py-2 pr-10 appearance-none"
              >
                <option value="기업">기업</option>
                <option value="개인">개인</option>
                <option value="관공서">관공서</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">원하는 상품 유형 *</label>
            <div className="relative">
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType | "")}
                className="w-full border rounded-lg px-3 py-2 pr-10 appearance-none"
              >
                <option value="">상품 유형을 선택해주세요</option>
                <option value="의류">의류</option>
                <option value="유니폼">유니폼</option>
                <option value="굿즈">굿즈</option>
                <option value="기타">기타</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path d="M6 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {productType && (
          <div>
            <label className="block text-sm font-semibold mb-2">선택한 상품 유형 상세 *</label>
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
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">상품명/프로젝트명 *</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 2026 S/S 반팔 티셔츠"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">담당자명 *</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="담당자명을 입력해주세요"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">연락처 *</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@company.com"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">요청 내용 *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="원하시는 디자인 방향, 용도, 수량, 일정 등을 자유롭게 적어주세요."
            className="w-full min-h-[130px] border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">레퍼런스 이미지 업로드</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onImageChange}
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <p className="text-xs text-gray-500 mt-2">최대 10장까지 업로드할 수 있습니다.</p>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
              {previewUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} className="relative border rounded-lg overflow-hidden">
                  <img src={url} alt={`reference-${idx}`} className="w-full h-28 object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-3 rounded-lg font-bold disabled:bg-gray-300"
        >
          {submitting ? "의뢰 접수 중..." : "디자인 의뢰하기"}
        </button>
      </form>
    </div>
  );
}
