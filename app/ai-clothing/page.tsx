"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CLOTHING_GENDERS,
  CLOTHING_SEASONS,
  CLOTHING_STYLES,
  CLOTHING_TEMPLATES,
  GARMENT_TYPES,
  PRODUCT_VIEWS,
  buildClothingPrompts,
  getClothingDisplayImageUrl,
  type ClothingGender,
  type ClothingSeason,
  type ClothingStyle,
  type ClothingTemplate,
  type GarmentType,
  type ProductView,
} from "@/lib/aiClothingPrompts";
import { IMAGE_GEN_TOOLS } from "@/lib/aiModelFit";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Shirt,
  Wand2,
  X,
} from "lucide-react";

type CustomStep = "type" | "style" | "season" | "view" | "gender" | "prompt";

const CUSTOM_STEPS: { id: CustomStep; label: string }[] = [
  { id: "type", label: "의류 종류" },
  { id: "style", label: "스타일" },
  { id: "season", label: "시즌" },
  { id: "view", label: "촬영 방식" },
  { id: "gender", label: "성별" },
  { id: "prompt", label: "추가 작성" },
];

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`px-4 py-2 rounded-full text-sm border transition ${
              value === opt.id
                ? "bg-[#111] text-white border-[#111]"
                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepProgress({
  steps,
  currentIndex,
}: {
  steps: { label: string }[];
  currentIndex: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
      {steps.map((step, idx) => {
        const done = idx < currentIndex;
        const active = idx === currentIndex;
        return (
          <div key={step.label} className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                active
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : done
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-white text-gray-400 border-gray-200"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">
                {done ? "✓" : idx + 1}
              </span>
              {step.label}
            </div>
            {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300" />}
          </div>
        );
      })}
    </div>
  );
}

function PromptBlock({
  label,
  text,
  onCopy,
}: {
  label: string;
  text: string;
  onCopy: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 font-medium"
        >
          <Copy className="w-3.5 h-3.5" /> 복사
        </button>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4 whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}

function ToolRedirectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/50" onClick={onClose} aria-label="닫기" />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">프롬프트가 복사되었습니다</h3>
          <p className="text-sm text-gray-500 mt-1">아래 이미지 생성 툴에서 붙여넣기 후 생성해보세요.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {IMAGE_GEN_TOOLS.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition group"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white">
                <Image src={tool.logo} alt={tool.name} width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 group-hover:text-emerald-700">{tool.name}</p>
                <p className="text-xs text-gray-500 truncate">{tool.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AiClothingPage() {
  const [filterGender, setFilterGender] = useState<ClothingGender | "all">("all");
  const [filterType, setFilterType] = useState<GarmentType | "all">("all");
  const [filterStyle, setFilterStyle] = useState<ClothingStyle | "all">("all");
  const [templateSearch, setTemplateSearch] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<ClothingTemplate | null>(null);
  const [modalGender, setModalGender] = useState<ClothingGender>("female");
  const [modalType, setModalType] = useState<GarmentType>("top");
  const [modalStyle, setModalStyle] = useState<ClothingStyle>("casual");
  const [modalSeason, setModalSeason] = useState<ClothingSeason>("all");
  const [modalView, setModalView] = useState<ProductView>("flat-lay");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const [customStep, setCustomStep] = useState<CustomStep>("type");
  const [selectionSkipped, setSelectionSkipped] = useState(false);
  const [gender, setGender] = useState<ClothingGender>("female");
  const [type, setType] = useState<GarmentType>("top");
  const [style, setStyle] = useState<ClothingStyle>("casual");
  const [season, setSeason] = useState<ClothingSeason>("all");
  const [view, setView] = useState<ProductView>("flat-lay");
  const [customPrompt, setCustomPrompt] = useState("");

  const customStepIndex = CUSTOM_STEPS.findIndex((s) => s.id === customStep);

  const filteredTemplates = useMemo(() => {
    return CLOTHING_TEMPLATES.filter((t) => {
      if (filterGender !== "all" && t.gender !== filterGender) return false;
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterStyle !== "all" && t.style !== filterStyle) return false;
      if (templateSearch.trim()) {
        const q = templateSearch.trim().toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [filterGender, filterType, filterStyle, templateSearch]);

  const modalPrompts = useMemo(() => {
    if (!selectedTemplate) return null;
    const genderLabel = CLOTHING_GENDERS.find((g) => g.id === modalGender)?.label ?? "";
    const typeLabel = GARMENT_TYPES.find((t) => t.id === modalType)?.label ?? "";
    return buildClothingPrompts({
      gender: modalGender,
      type: modalType,
      style: modalStyle,
      season: modalSeason,
      view: modalView,
      templateTitle: `${genderLabel} ${typeLabel}`,
    });
  }, [selectedTemplate, modalGender, modalType, modalStyle, modalSeason, modalView]);

  const modalImageUrl = useMemo(
    () => (selectedTemplate ? getClothingDisplayImageUrl(selectedTemplate) : null),
    [selectedTemplate]
  );

  const customPrompts = useMemo(
    () =>
      buildClothingPrompts({
        gender,
        type,
        style,
        season,
        view,
        customPrompt,
        skipOptions: selectionSkipped,
      }),
    [gender, type, style, season, view, customPrompt, selectionSkipped]
  );

  const copyText = useCallback(async (text: string, label?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyToast(label ? `${label} 복사됨` : "복사됨");
      window.setTimeout(() => setCopyToast(null), 2000);
    } catch {
      setCopyToast("복사에 실패했습니다");
      window.setTimeout(() => setCopyToast(null), 2000);
    }
  }, []);

  const handleTryGenerate = useCallback(
    async (enPrompt: string) => {
      await copyText(enPrompt);
      setShowToolModal(true);
    },
    [copyText]
  );

  const openTemplate = (template: ClothingTemplate) => {
    setSelectedTemplate(template);
    setModalGender(template.gender);
    setModalType(template.type);
    setModalStyle(template.style);
    setModalSeason(template.season);
    setModalView(template.view);
    setShowTemplateModal(true);
  };

  const openCustomFlow = () => {
    setCustomStep("type");
    setSelectionSkipped(false);
    setGender("female");
    setType("top");
    setStyle("casual");
    setSeason("all");
    setView("flat-lay");
    setCustomPrompt("");
    setShowCustomModal(true);
  };

  const skipToPrompt = () => {
    setSelectionSkipped(true);
    setCustomStep("prompt");
  };

  const goNextCustom = () => {
    const order: CustomStep[] = ["type", "style", "season", "view", "gender", "prompt"];
    const idx = order.indexOf(customStep);
    if (idx < order.length - 1) setCustomStep(order[idx + 1]);
  };

  const goPrevCustom = () => {
    const order: CustomStep[] = ["type", "style", "season", "view", "gender", "prompt"];
    const idx = order.indexOf(customStep);
    if (customStep === "prompt" && selectionSkipped) {
      setSelectionSkipped(false);
      setCustomStep("type");
      return;
    }
    if (idx > 0) setCustomStep(order[idx - 1]);
    else setShowCustomModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className={`${PAGE_CONTAINER_CLASS} py-8 md:py-10 space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI 의류 생성</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              예시 의류를 참고하거나 옵션을 선택해 의류 상품 이미지 생성용 프롬프트를 만들어보세요.
            </p>
          </div>
          <Button
            type="button"
            className="bg-[#111] hover:bg-black shrink-0"
            onClick={openCustomFlow}
          >
            <Wand2 className="w-4 h-4 mr-2" /> 직접 생성하기
          </Button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">예시 의류</h2>
            <p className="text-sm text-gray-500">
              총 {CLOTHING_TEMPLATES.length}개 · 클릭하면 프롬프트를 확인할 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="예시 검색..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value as ClothingGender | "all")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">전체 성별</option>
              {CLOTHING_GENDERS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as GarmentType | "all")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">전체 종류</option>
              {GARMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterStyle}
              onChange={(e) => setFilterStyle(e.target.value as ClothingStyle | "all")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">전체 스타일</option>
              {CLOTHING_STYLES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => openTemplate(template)}
                className="text-left rounded-xl overflow-hidden border border-gray-200 hover:border-emerald-400 hover:shadow-md transition bg-white group"
              >
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={template.previewUrl}
                    alt={template.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 200px"
                  />
                </div>
                <div className="px-3.5 py-2.5 sm:px-4 sm:py-3">
                  <p className="font-semibold text-xs text-gray-900 line-clamp-1">{template.title}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{template.description}</p>
                </div>
              </button>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-12">조건에 맞는 예시가 없습니다.</p>
          )}
        </div>
      </div>

      {showTemplateModal && selectedTemplate && modalPrompts && modalImageUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTemplateModal(false)}
            aria-label="닫기"
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col">
            <button
              type="button"
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-white/90 hover:bg-gray-100 text-gray-500 shadow-sm"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-[minmax(280px,420px)_1fr] flex-1 min-h-0 overflow-hidden">
              <div className="relative aspect-square md:aspect-auto md:h-full md:min-h-[480px] bg-gray-100 shrink-0">
                <Image
                  src={modalImageUrl}
                  alt={selectedTemplate.title}
                  fill
                  className="object-cover md:rounded-l-2xl"
                  sizes="(max-width: 768px) 100vw, 420px"
                  quality={90}
                  priority
                />
              </div>
              <div className="p-5 md:p-7 space-y-4 overflow-y-auto">
                <div className="space-y-3 pr-8">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-gray-900">의류 프롬프트 설정</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="modal-gender" className="block text-xs font-medium text-gray-500 mb-1">성별</label>
                      <select
                        id="modal-gender"
                        value={modalGender}
                        onChange={(e) => setModalGender(e.target.value as ClothingGender)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        {CLOTHING_GENDERS.map((g) => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-type" className="block text-xs font-medium text-gray-500 mb-1">종류</label>
                      <select
                        id="modal-type"
                        value={modalType}
                        onChange={(e) => setModalType(e.target.value as GarmentType)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        {GARMENT_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-style" className="block text-xs font-medium text-gray-500 mb-1">스타일</label>
                      <select
                        id="modal-style"
                        value={modalStyle}
                        onChange={(e) => setModalStyle(e.target.value as ClothingStyle)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        {CLOTHING_STYLES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-season" className="block text-xs font-medium text-gray-500 mb-1">시즌</label>
                      <select
                        id="modal-season"
                        value={modalSeason}
                        onChange={(e) => setModalSeason(e.target.value as ClothingSeason)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        {CLOTHING_SEASONS.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label htmlFor="modal-view" className="block text-xs font-medium text-gray-500 mb-1">촬영 방식</label>
                      <select
                        id="modal-view"
                        value={modalView}
                        onChange={(e) => setModalView(e.target.value as ProductView)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      >
                        {PRODUCT_VIEWS.map((v) => (
                          <option key={v.id} value={v.id}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{selectedTemplate.description}</p>
                </div>
                <PromptBlock
                  label="English Prompt"
                  text={modalPrompts.en}
                  onCopy={() => copyText(modalPrompts.en, "영문 프롬프트")}
                />
                <PromptBlock
                  label="한글 프롬프트"
                  text={modalPrompts.ko}
                  onCopy={() => copyText(modalPrompts.ko, "한글 프롬프트")}
                />
                <Button
                  type="button"
                  className="w-full bg-[#111] hover:bg-black"
                  onClick={() => handleTryGenerate(modalPrompts.en)}
                >
                  생성해보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCustomModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowCustomModal(false)}
            aria-label="닫기"
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-5 md:p-6">
            <button
              type="button"
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">직접 프롬프트 생성</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectionSkipped
                ? "원하는 내용을 직접 작성하세요. 옵션 선택 없이도 프롬프트를 만들 수 있습니다."
                : "의류 옵션을 선택하고 추가 내용을 작성하세요."}
            </p>

            {!selectionSkipped && customStep !== "prompt" && (
              <button
                type="button"
                onClick={skipToPrompt}
                className="mb-4 text-sm text-emerald-600 hover:text-emerald-800 font-medium underline underline-offset-2"
              >
                선택 없이 바로 작성하기
              </button>
            )}

            <StepProgress steps={CUSTOM_STEPS} currentIndex={customStepIndex} />

            {customStep === "type" && (
              <ChipGroup label="의류 종류" options={GARMENT_TYPES} value={type} onChange={setType} />
            )}
            {customStep === "style" && (
              <ChipGroup label="스타일" options={CLOTHING_STYLES} value={style} onChange={setStyle} />
            )}
            {customStep === "season" && (
              <ChipGroup label="시즌" options={CLOTHING_SEASONS} value={season} onChange={setSeason} />
            )}
            {customStep === "view" && (
              <ChipGroup label="촬영 방식" options={PRODUCT_VIEWS} value={view} onChange={setView} />
            )}
            {customStep === "gender" && (
              <ChipGroup label="타겟 성별" options={CLOTHING_GENDERS} value={gender} onChange={setGender} />
            )}
            {customStep === "prompt" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="custom-prompt-extra" className="block text-sm font-semibold text-gray-800 mb-2">
                    {selectionSkipped ? "프롬프트 작성" : "추가 작성 (선택)"}
                  </label>
                  <textarea
                    id="custom-prompt-extra"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder={
                      selectionSkipped
                        ? "예: Professional fashion product photo, women's navy cotton oversized t-shirt, flat lay on white background\n또는\n여성용 네이비 오버핏 코튼 티셔츠, 화이트 배경 플랫레이 촬영"
                        : "예: 오버핏 실루엣, 코튼 100%, 네이비 컬러, 앞면 로고 없음"
                    }
                    rows={selectionSkipped ? 6 : 4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    {selectionSkipped
                      ? "한글·영문 혼합 입력 시 각 언어 프롬프트에 자동 분리됩니다."
                      : "한글·영문 혼합 입력 시 각 언어에 맞는 프롬프트에만 추가됩니다."}
                  </p>
                </div>
                {(customPrompts.en || customPrompts.ko) ? (
                  <>
                    {customPrompts.en && (
                      <PromptBlock
                        label="English Prompt"
                        text={customPrompts.en}
                        onCopy={() => copyText(customPrompts.en, "영문 프롬프트")}
                      />
                    )}
                    {customPrompts.ko && (
                      <PromptBlock
                        label="한글 프롬프트"
                        text={customPrompts.ko}
                        onCopy={() => copyText(customPrompts.ko, "한글 프롬프트")}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    위에 프롬프트를 입력하면 미리보기가 표시됩니다.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={goPrevCustom}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {customStep === "type" && !selectionSkipped ? "닫기" : "이전"}
              </Button>
              {customStep !== "prompt" ? (
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" onClick={goNextCustom}>
                    건너뛰기
                  </Button>
                  <Button type="button" className="bg-[#111] hover:bg-black" onClick={goNextCustom}>
                    다음 <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  className="bg-[#111] hover:bg-black"
                  disabled={!customPrompts.en && !customPrompts.ko}
                  onClick={() => handleTryGenerate(customPrompts.en || customPrompts.ko)}
                >
                  생성해보기
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <ToolRedirectModal open={showToolModal} onClose={() => setShowToolModal(false)} />

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-[#111] text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {copyToast}
        </div>
      )}
    </div>
  );
}
