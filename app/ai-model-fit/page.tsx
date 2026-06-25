"use client";

import { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  FIT_TEMPLATES,
  IMAGE_GEN_TOOLS,
  MODEL_FEATURES,
  MODEL_GENDERS,
  MODEL_MOODS,
  MODEL_SIZES,
  buildModelFitPrompts,
  findTemplateByCategories,
  getTemplateDisplayImageUrl,
  type FitTemplate,
  type ModelFeature,
  type ModelGender,
  type ModelMood,
  type ModelSize,
} from "@/lib/aiModelFit";
import { PAGE_CONTAINER_CLASS } from "@/lib/layout";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Wand2,
  X,
} from "lucide-react";

type CustomStep = "gender" | "size" | "features" | "mood" | "prompt";

const CUSTOM_STEPS: { id: CustomStep; label: string }[] = [
  { id: "gender", label: "성별" },
  { id: "size", label: "사이즈" },
  { id: "features", label: "모델 특징" },
  { id: "mood", label: "무드" },
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

function MultiChipGroup({
  label,
  options,
  values,
  onToggle,
}: {
  label: string;
  options: readonly { id: ModelFeature; label: string }[];
  values: ModelFeature[];
  onToggle: (id: ModelFeature) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = values.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(opt.id)}
              className={`px-4 py-2 rounded-full text-sm border transition inline-flex items-center gap-1 ${
                active
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
              }`}
            >
              {active && <Check className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          );
        })}
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
                  ? "bg-violet-600 text-white border-violet-600"
                  : done
                    ? "bg-violet-50 text-violet-700 border-violet-200"
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
          className="inline-flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 font-medium"
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
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-violet-300 hover:bg-violet-50/40 transition group"
            >
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white">
                <Image src={tool.logo} alt={tool.name} width={44} height={44} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 group-hover:text-violet-700">{tool.name}</p>
                <p className="text-xs text-gray-500 truncate">{tool.description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-violet-600 shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AiModelFitPage() {
  const [templateFilterGender, setTemplateFilterGender] = useState<ModelGender | "all">("all");
  const [templateFilterMood, setTemplateFilterMood] = useState<ModelMood | "all">("all");
  const [templateSearch, setTemplateSearch] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState<FitTemplate | null>(null);
  const [modalGender, setModalGender] = useState<ModelGender>("female");
  const [modalSize, setModalSize] = useState<ModelSize>("regular");
  const [modalMood, setModalMood] = useState<ModelMood>("studio");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const [customStep, setCustomStep] = useState<CustomStep>("gender");
  const [gender, setGender] = useState<ModelGender>("female");
  const [size, setSize] = useState<ModelSize>("regular");
  const [mood, setMood] = useState<ModelMood>("studio");
  const [features, setFeatures] = useState<ModelFeature[]>(["east-asian", "natural"]);
  const [customPrompt, setCustomPrompt] = useState("");

  const customStepIndex = CUSTOM_STEPS.findIndex((s) => s.id === customStep);

  const filteredTemplates = useMemo(() => {
    return FIT_TEMPLATES.filter((t) => {
      if (templateFilterGender !== "all" && t.gender !== templateFilterGender) return false;
      if (templateFilterMood !== "all" && t.mood !== templateFilterMood) return false;
      if (templateSearch.trim()) {
        const q = templateSearch.trim().toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [templateFilterGender, templateFilterMood, templateSearch]);

  const modalDisplayTemplate = useMemo(() => {
    if (!selectedTemplate) return null;
    return findTemplateByCategories(modalGender, modalMood, modalSize) ?? selectedTemplate;
  }, [selectedTemplate, modalGender, modalMood, modalSize]);

  const modalPrompts = useMemo(() => {
    if (!selectedTemplate) return null;
    const genderLabel = MODEL_GENDERS.find((g) => g.id === modalGender)?.label ?? "";
    const moodLabel = MODEL_MOODS.find((m) => m.id === modalMood)?.label ?? "";
    return buildModelFitPrompts({
      gender: modalGender,
      size: modalSize,
      mood: modalMood,
      features: selectedTemplate.features,
      templateTitle: `${genderLabel} · ${moodLabel}`,
    });
  }, [selectedTemplate, modalGender, modalSize, modalMood]);

  const modalImageUrl = useMemo(
    () => (modalDisplayTemplate ? getTemplateDisplayImageUrl(modalDisplayTemplate) : null),
    [modalDisplayTemplate]
  );

  const customPrompts = useMemo(
    () =>
      buildModelFitPrompts({
        gender,
        size,
        features,
        mood,
        customPrompt,
      }),
    [gender, size, features, mood, customPrompt]
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

  const openTemplate = (template: FitTemplate) => {
    setSelectedTemplate(template);
    setModalGender(template.gender);
    setModalSize(template.size);
    setModalMood(template.mood);
    setShowTemplateModal(true);
  };

  const openCustomFlow = () => {
    setCustomStep("gender");
    setGender("female");
    setSize("regular");
    setMood("studio");
    setFeatures(["east-asian", "natural"]);
    setCustomPrompt("");
    setShowCustomModal(true);
  };

  const toggleFeature = useCallback((id: ModelFeature) => {
    setFeatures((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }, []);

  const goNextCustom = () => {
    const order: CustomStep[] = ["gender", "size", "features", "mood", "prompt"];
    const idx = order.indexOf(customStep);
    if (idx < order.length - 1) setCustomStep(order[idx + 1]);
  };

  const goPrevCustom = () => {
    const order: CustomStep[] = ["gender", "size", "features", "mood", "prompt"];
    const idx = order.indexOf(customStep);
    if (idx > 0) setCustomStep(order[idx - 1]);
    else setShowCustomModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <div className={`${PAGE_CONTAINER_CLASS} py-8 md:py-10 space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI 모델핏</h1>
            <p className="mt-2 text-sm md:text-base text-gray-600">
              예시를 참고하거나 옵션을 선택해 이미지 생성용 프롬프트를 만들어보세요.
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
            <h2 className="text-lg font-bold text-gray-900">예시 모델컷</h2>
            <p className="text-sm text-gray-500">총 {FIT_TEMPLATES.length}개 · 클릭하면 프롬프트를 확인할 수 있습니다.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="예시 검색..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
            <select
              value={templateFilterGender}
              onChange={(e) => setTemplateFilterGender(e.target.value as ModelGender | "all")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">전체 성별</option>
              {MODEL_GENDERS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
            <select
              value={templateFilterMood}
              onChange={(e) => setTemplateFilterMood(e.target.value as ModelMood | "all")}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">전체 무드</option>
              {MODEL_MOODS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => openTemplate(template)}
                className="text-left rounded-xl overflow-hidden border border-gray-200 hover:border-violet-400 hover:shadow-md transition bg-white group"
              >
                <div className="relative aspect-[3/4] bg-gray-100">
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

      {/* 예시 프롬프트 모달 */}
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
              <div className="relative aspect-[3/4] md:aspect-auto md:h-full md:min-h-[520px] bg-gray-100 shrink-0">
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
                  <h3 className="text-lg font-bold text-gray-900">프롬프트 설정</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="modal-gender" className="block text-xs font-medium text-gray-500 mb-1">성별</label>
                      <select
                        id="modal-gender"
                        value={modalGender}
                        onChange={(e) => setModalGender(e.target.value as ModelGender)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        {MODEL_GENDERS.map((g) => (
                          <option key={g.id} value={g.id}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-size" className="block text-xs font-medium text-gray-500 mb-1">사이즈</label>
                      <select
                        id="modal-size"
                        value={modalSize}
                        onChange={(e) => setModalSize(e.target.value as ModelSize)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        {MODEL_SIZES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="modal-mood" className="block text-xs font-medium text-gray-500 mb-1">무드</label>
                      <select
                        id="modal-mood"
                        value={modalMood}
                        onChange={(e) => setModalMood(e.target.value as ModelMood)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
                      >
                        {MODEL_MOODS.map((m) => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{modalDisplayTemplate?.description}</p>
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

      {/* 직접 생성 모달 */}
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
            <p className="text-sm text-gray-500 mb-4">카테고리를 선택하고 추가 내용을 작성하세요.</p>

            <StepProgress steps={CUSTOM_STEPS} currentIndex={customStepIndex} />

            {customStep === "gender" && (
              <ChipGroup label="모델 성별" options={MODEL_GENDERS} value={gender} onChange={setGender} />
            )}
            {customStep === "size" && (
              <ChipGroup label="신체 사이즈" options={MODEL_SIZES} value={size} onChange={setSize} />
            )}
            {customStep === "features" && (
              <MultiChipGroup
                label="모델 특징 (복수 선택)"
                options={MODEL_FEATURES}
                values={features}
                onToggle={toggleFeature}
              />
            )}
            {customStep === "mood" && (
              <ChipGroup label="무드" options={MODEL_MOODS} value={mood} onChange={setMood} />
            )}
            {customStep === "prompt" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="custom-prompt-extra" className="block text-sm font-semibold text-gray-800 mb-2">
                    추가 작성 (선택)
                  </label>
                  <textarea
                    id="custom-prompt-extra"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="한글로 작성하면 한글 프롬프트에, English로 작성하면 영문 프롬프트에 반영됩니다."
                    rows={4}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 resize-y"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    한글·영문 혼합 입력 시 각 언어에 맞는 프롬프트에만 추가됩니다.
                  </p>
                </div>
                <PromptBlock
                  label="English Prompt"
                  text={customPrompts.en}
                  onCopy={() => copyText(customPrompts.en, "영문 프롬프트")}
                />
                <PromptBlock
                  label="한글 프롬프트"
                  text={customPrompts.ko}
                  onCopy={() => copyText(customPrompts.ko, "한글 프롬프트")}
                />
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
              <Button type="button" variant="ghost" onClick={goPrevCustom}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                {customStep === "gender" ? "닫기" : "이전"}
              </Button>
              {customStep !== "prompt" ? (
                <Button type="button" className="bg-[#111] hover:bg-black" onClick={goNextCustom}>
                  다음 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="bg-[#111] hover:bg-black"
                  onClick={() => handleTryGenerate(customPrompts.en)}
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
