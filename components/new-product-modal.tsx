"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, LayoutTemplate, SquareDashed } from "lucide-react";
import { useWorkspace } from "@/lib/store";

export function NewProductModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { createProduct } = useWorkspace();
  const [step, setStep] = useState<"choose" | "blank" | "reference">("choose");
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const makeBlank = (productName: string) => {
    const id = createProduct(productName.trim() || "새 제품");
    onClose();
    router.push(`/products/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={onClose}>
      <div
        className="w-[440px] rounded-3xl bg-snow p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "choose" && (
          <>
            <p className="text-[18px] font-semibold tracking-tight">제품을 어떻게 시작할까요?</p>
            <div className="mt-4 space-y-2">
              <StartRow
                icon={<LayoutTemplate size={18} strokeWidth={1.7} />}
                title="템플릿으로 시작"
                body="티셔츠, 후드, 셔츠 등 기본 구조에서 시작합니다."
                cta="템플릿 선택"
                onClick={() => {
                  onClose();
                  router.push("/templates");
                }}
              />
              <StartRow
                icon={<ImagePlus size={18} strokeWidth={1.7} />}
                title="레퍼런스로 시작"
                body="이미지나 기존 제품을 참고해 제품을 정의합니다."
                cta="레퍼런스 추가"
                onClick={() => setStep("reference")}
              />
              <StartRow
                icon={<SquareDashed size={18} strokeWidth={1.7} />}
                title="빈 제품으로 시작"
                body="처음부터 자유롭게 제품을 만듭니다."
                cta="빈 제품 만들기"
                onClick={() => setStep("blank")}
              />
            </div>
          </>
        )}

        {step === "blank" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              makeBlank(name);
            }}
          >
            <p className="text-[18px] font-semibold tracking-tight">빈 제품 만들기</p>
            <p className="mt-1 text-[13px] text-stone">이름을 정한 뒤 Design에서 형태를 만듭니다.</p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Oversized Hoodie #10"
              className="mt-4 h-11 w-full rounded-2xl bg-paper px-4 text-[14px] outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setStep("choose")} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                뒤로
              </button>
              <button className="rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow">만들기</button>
            </div>
          </form>
        )}

        {step === "reference" && (
          <div>
            <p className="text-[18px] font-semibold tracking-tight">레퍼런스 추가</p>
            <p className="mt-1 text-[13px] text-stone">참고 이미지를 올리면 새 제품 Design에서 이어갈 수 있습니다.</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 flex h-28 w-full items-center justify-center rounded-2xl border border-dashed border-fog bg-paper text-[13px] text-stone hover:text-ink"
            >
              이미지 선택
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                makeBlank(file?.name.replace(/\.[^.]+$/, "") || "레퍼런스 제품");
              }}
            />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={() => setStep("choose")} className="rounded-full px-3 py-1.5 text-[13px] text-stone">
                뒤로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StartRow({
  icon,
  title,
  body,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-2xl border border-mist px-3.5 py-3 text-left hover:border-fog hover:bg-paper"
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-paper text-ink">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-relaxed text-stone">{body}</span>
        <span className="mt-2 inline-block text-[12px] font-medium">{cta} →</span>
      </span>
    </button>
  );
}
