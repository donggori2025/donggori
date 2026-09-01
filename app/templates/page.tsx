"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Layers, Tag } from "lucide-react";
import { FilterChip } from "@/components/filter-chip";
import { MiniFlat } from "@/components/ui";
import { useWorkspace } from "@/lib/store";
import {
  serviceTemplates,
  TEMPLATE_AGE_FILTERS,
  TEMPLATE_CATEGORY_FILTERS,
  TEMPLATE_GENDER_FILTERS,
  TEMPLATE_GROUP_FILTERS,
  TEMPLATE_KIND_LABEL,
  TEMPLATE_LIBRARY_FILTERS,
  TEMPLATE_PLAN_FILTERS,
  TEMPLATE_TYPE_FILTERS,
  templateMatchesGroup,
  type ServiceTemplate,
  type TemplateAgeFilterId,
  type TemplateCategoryFilterId,
  type TemplateChipId,
  type TemplateGenderFilterId,
  type TemplateGroupFilterId,
  type TemplatePlanFilterId,
  type TemplateTypeFilterId,
} from "@/lib/templates";

export default function TemplatesPage() {
  const router = useRouter();
  const { currentWorkspace, createProduct, createAsset } = useWorkspace();
  const [library, setLibrary] = useState<TemplateChipId>("all");
  const [plan, setPlan] = useState<TemplatePlanFilterId>("all");
  const [type, setType] = useState<TemplateTypeFilterId>("all");
  const [gender, setGender] = useState<TemplateGenderFilterId>("all");
  const [age, setAge] = useState<TemplateAgeFilterId>("all");
  const [group, setGroup] = useState<TemplateGroupFilterId>("all");
  const [category, setCategory] = useState<TemplateCategoryFilterId>("all");
  const [preview, setPreview] = useState<ServiceTemplate | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      serviceTemplates.filter((t) => {
        if (library !== "all" && t.kind !== library) return false;
        if (plan === "premium") return false;
        if (type === "apparel") {
          if (t.kind !== "garment" && t.kind !== "techpack") return false;
        } else if (type !== "all") {
          return false;
        }
        if (gender !== "all") return false;
        if (age !== "all") return false;
        if (!templateMatchesGroup(t.category, group)) return false;
        if (category !== "all" && t.category !== category) return false;
        return true;
      }),
    [library, plan, type, gender, age, group, category],
  );

  function applyTemplate(tpl: ServiceTemplate) {
    if (tpl.asset) {
      createAsset({
        ...tpl.asset,
        meta: `${tpl.asset.meta} · ${currentWorkspace.name}`,
      });
      setPreview(null);
      setCopied(`${tpl.name}을(를) 라이브러리에 저장했습니다.`);
      return;
    }
    const id = createProduct(tpl.name, { category: tpl.category, description: tpl.description });
    setPreview(null);
    router.push(`/products/${id}`);
  }

  return (
    <div className="canvas-dot min-h-full bg-paper fade-up">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <header>
          <p className="text-[11px] tracking-[0.18em] text-stone uppercase">Faddit Catalog</p>
          <h1 className="mt-1 text-[36px] font-semibold leading-none tracking-tight">템플릿</h1>
          <p className="mt-2 max-w-xl text-[14px] text-stone">제품 정의의 시작점입니다.</p>
          <p className="mt-1 max-w-xl text-[13px] text-stone">
            도식화, 기본 Spec, Size Spec이 포함된 템플릿으로 새 제품을 만듭니다.
          </p>
        </header>

        <div className="mt-8 flex flex-nowrap gap-2">
          <FilterChip
            label="라이브러리"
            value={library}
            options={[...TEMPLATE_LIBRARY_FILTERS]}
            onChange={(id) => setLibrary(id as TemplateChipId)}
          />
          <FilterChip
            label="플랜"
            value={plan}
            options={[...TEMPLATE_PLAN_FILTERS]}
            onChange={(id) => setPlan(id as TemplatePlanFilterId)}
          />
          <FilterChip
            label="종류"
            value={type}
            options={[...TEMPLATE_TYPE_FILTERS]}
            onChange={(id) => setType(id as TemplateTypeFilterId)}
          />
          <FilterChip
            label="성별"
            value={gender}
            options={[...TEMPLATE_GENDER_FILTERS]}
            onChange={(id) => setGender(id as TemplateGenderFilterId)}
          />
          <FilterChip
            label="연령"
            value={age}
            options={[...TEMPLATE_AGE_FILTERS]}
            onChange={(id) => setAge(id as TemplateAgeFilterId)}
          />
          <FilterChip
            label="품목군"
            value={group}
            options={[...TEMPLATE_GROUP_FILTERS]}
            onChange={(id) => setGroup(id as TemplateGroupFilterId)}
          />
          <FilterChip
            label="품목"
            value={category}
            options={[...TEMPLATE_CATEGORY_FILTERS]}
            onChange={(id) => setCategory(id as TemplateCategoryFilterId)}
          />
        </div>

        {copied && (
          <p className="mt-6 rounded-2xl border border-mist bg-snow px-4 py-3 text-[13px] text-ink">{copied}</p>
        )}

        <div className="drive-file-grid-fill mt-8">
          {visible.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setPreview(tpl)}
              className="group w-full min-w-0 rounded-2xl border border-mist bg-snow p-3 text-left transition hover:border-fog"
            >
              <div className="flex h-32 items-center justify-center rounded-2xl bg-paper">
                {tpl.category ? (
                  <MiniFlat category={tpl.category} className="h-24 w-20 transition group-hover:scale-[1.03]" />
                ) : tpl.kind === "label" ? (
                  <Tag size={24} className="text-stone" strokeWidth={1.5} />
                ) : (
                  <Layers size={24} className="text-stone" strokeWidth={1.5} />
                )}
              </div>
              <div className="mt-2.5 min-w-0">
                <p className="truncate text-[13px] font-medium">{tpl.name}</p>
                <p className="truncate text-[11px] text-stone">{tpl.meta}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay" onClick={() => setPreview(null)}>
          <div
            className="w-[420px] rounded-3xl bg-snow p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-36 items-center justify-center rounded-2xl bg-paper">
              {preview.category ? (
                <MiniFlat category={preview.category} className="h-28 w-24" />
              ) : preview.kind === "label" ? (
                <Tag size={28} className="text-stone" strokeWidth={1.5} />
              ) : (
                <Layers size={28} className="text-stone" strokeWidth={1.5} />
              )}
            </div>
            <p className="mt-4 text-[11px] tracking-wide text-stone uppercase">{TEMPLATE_KIND_LABEL[preview.kind]}</p>
            <p className="mt-1 text-[18px] font-semibold tracking-tight">{preview.name}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-stone">{preview.description}</p>
            <p className="mt-3 text-[12px] text-stone">
              {currentWorkspace.name}에 {preview.asset ? "라이브러리 에셋으로" : "제품으로"} 복제합니다.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full px-3 py-1.5 text-[13px] text-stone"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(preview)}
                className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[13px] text-snow"
              >
                <Copy size={13} />
                템플릿 사용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
