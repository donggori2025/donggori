import type { Product } from "@/lib/types";
import { miscCompleteness } from "@/lib/misc-board";

export type CompletenessAreaId =
  | "basic"
  | "design"
  | "fabric"
  | "size"
  | "notes"
  | "files"
  | "schedule";

export type SpecTabId = "basic" | "fabric" | "size" | "notes" | "misc" | "print";

export type AreaFill = "empty" | "partial" | "complete";

export type CompletenessStage = "draft" | "in_progress" | "review" | "ready";

export const COMPLETENESS_WEIGHTS: Record<CompletenessAreaId, number> = {
  basic: 15,
  design: 20,
  fabric: 25,
  size: 25,
  notes: 5,
  files: 5,
  schedule: 5,
};

export const AREA_LABEL: Record<CompletenessAreaId, string> = {
  basic: "기본 정보",
  design: "Design",
  fabric: "원단·부자재",
  size: "사이즈 스펙",
  notes: "작업 시 주의사항",
  files: "인쇄",
  schedule: "납기·담당",
};

export const STAGE_META: Record<CompletenessStage, { label: string; tone: string; ink: string }> = {
  draft: { label: "초안", tone: "bg-mist", ink: "text-stone" },
  in_progress: { label: "작성 중", tone: "bg-peach", ink: "text-peach-ink" },
  review: { label: "검토 필요", tone: "bg-butter", ink: "text-butter-ink" },
  ready: { label: "생산 준비 완료", tone: "bg-mint", ink: "text-mint-ink" },
};

function notesText(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").trim();
}

function identityFilledCount(product: Product) {
  const idn = product.specs.identity;
  const fields = [
    product.specs.description,
    idn?.brand,
    idn?.item,
    idn?.gender,
    idn?.season,
  ];
  return fields.filter((v) => Boolean(v?.trim())).length;
}

export function areaFill(product: Product, area: CompletenessAreaId): AreaFill {
  const s = product.specs;
  if (area === "basic") {
    const n = identityFilledCount(product);
    if (n >= 3) return "complete";
    if (n > 0 || Boolean(s.identity?.extras?.some((a) => a.value.trim()))) return "partial";
    return "empty";
  }
  if (area === "design") {
    return product.nodes.length > 0 ? "complete" : "empty";
  }
  if (area === "fabric") {
    const mats = s.materials.length;
    const extras = s.trims.length + s.labels.length;
    if (mats > 0) return "complete";
    if (extras > 0) return "partial";
    return "empty";
  }
  if (area === "size") {
    const hasQty =
      s.quantity.some((q) => q.qty > 0) ||
      s.colorways.some((c) => Object.values(c.qtyBySize ?? {}).some((n) => n > 0));
    if (s.measurements.length > 0) return "complete";
    if (hasQty) return "partial";
    return "empty";
  }
  if (area === "notes") return s.notes.some((n) => notesText(n.body)) ? "complete" : "empty";
  if (area === "files") {
    const prints = (product.files ?? []).filter((f) => f.kind === "label" || f.kind === "print");
    const hasLabel = prints.some((f) => f.kind === "label");
    const hasPrint = prints.some((f) => f.kind === "print");
    if (hasLabel && hasPrint) return "complete";
    if (hasLabel || hasPrint) return "partial";
    return "empty";
  }
  const idn = s.identity;
  const due = Boolean(idn?.sampleDue?.trim() || idn?.productionDue?.trim());
  const manager = Boolean(idn?.manager?.trim());
  if (due && manager) return "complete";
  if (due || manager) return "partial";
  return "empty";
}

export function specTabFill(product: Product, tab: SpecTabId): AreaFill {
  if (tab === "misc") {
    return miscCompleteness(product.specs) ? "complete" : "empty";
  }
  if (tab === "basic") return areaFill(product, "basic");
  if (tab === "fabric") return areaFill(product, "fabric");
  if (tab === "size") return areaFill(product, "size");
  if (tab === "notes") return areaFill(product, "notes");
  if (tab === "print") return areaFill(product, "files");
  return "empty";
}

export function specTabRequired(tab: SpecTabId) {
  return tab === "basic" || tab === "fabric" || tab === "size";
}

export function specTabStatusLabel(product: Product, tab: SpecTabId) {
  const fill = specTabFill(product, tab);
  if (fill === "complete") return "완료";
  if (fill === "partial") return "작성 중";
  return specTabRequired(tab) ? "미작성" : "선택";
}

function areaScore(fill: AreaFill, weight: number) {
  if (fill === "complete") return weight;
  if (fill === "partial") return Math.round(weight * 0.45);
  return 0;
}

function ratio(filled: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((Math.min(filled, total) / total) * 100);
}

export function areaPercent(product: Product, area: CompletenessAreaId): number {
  const s = product.specs;
  if (area === "basic") return ratio(identityFilledCount(product), 5);
  if (area === "design") return product.nodes.length > 0 ? 100 : 0;
  if (area === "fabric") {
    const filled = (s.materials.length > 0 ? 2 : 0) + (s.trims.length > 0 ? 1 : 0) + (s.labels.length > 0 ? 1 : 0);
    return ratio(filled, 4);
  }
  if (area === "size") {
    const hasMeas = s.measurements.length > 0;
    const hasQty =
      s.quantity.some((q) => q.qty > 0) ||
      s.colorways.some((c) => Object.values(c.qtyBySize ?? {}).some((n) => n > 0));
    return ratio((hasMeas ? 1 : 0) + (hasQty ? 1 : 0), 2);
  }
  if (area === "notes") return s.notes.some((n) => notesText(n.body)) ? 100 : 0;
  if (area === "files") {
    const prints = (product.files ?? []).filter((f) => f.kind === "label" || f.kind === "print");
    return ratio(
      (prints.some((f) => f.kind === "label") ? 1 : 0) + (prints.some((f) => f.kind === "print") ? 1 : 0),
      2,
    );
  }
  const idn = s.identity;
  return ratio(
    (idn?.sampleDue?.trim() || idn?.productionDue?.trim() ? 1 : 0) + (idn?.manager?.trim() ? 1 : 0),
    2,
  );
}

export function areaGaps(product: Product, area: CompletenessAreaId): string[] {
  const s = product.specs;
  const idn = s.identity;
  if (area === "basic") {
    return [
      [s.description, "설명"],
      [idn?.brand, "브랜드"],
      [idn?.item, "아이템"],
      [idn?.gender, "성별"],
      [idn?.season, "시즌"],
    ]
      .filter(([v]) => !String(v ?? "").trim())
      .map(([, label]) => label);
  }
  if (area === "design") return product.nodes.length > 0 ? [] : ["도식화"];
  if (area === "fabric") {
    const gaps: string[] = [];
    if (s.materials.length === 0) gaps.push("원단");
    if (s.trims.length === 0) gaps.push("부자재");
    if (s.labels.length === 0) gaps.push("라벨");
    return gaps;
  }
  if (area === "size") {
    const gaps: string[] = [];
    if (s.measurements.length === 0) gaps.push("사이즈 스펙");
    const hasQty =
      s.quantity.some((q) => q.qty > 0) ||
      s.colorways.some((c) => Object.values(c.qtyBySize ?? {}).some((n) => n > 0));
    if (!hasQty) gaps.push("수량");
    return gaps;
  }
  if (area === "notes") return s.notes.some((n) => notesText(n.body)) ? [] : ["주의사항"];
  if (area === "files") {
    const prints = (product.files ?? []).filter((f) => f.kind === "label" || f.kind === "print");
    const gaps: string[] = [];
    if (!prints.some((f) => f.kind === "label")) gaps.push("라벨 파일");
    if (!prints.some((f) => f.kind === "print")) gaps.push("인쇄 파일");
    return gaps;
  }
  const gaps: string[] = [];
  if (!idn?.sampleDue?.trim() && !idn?.productionDue?.trim()) gaps.push("납기");
  if (!idn?.manager?.trim()) gaps.push("담당자");
  return gaps;
}

export function jumpSectionOf(area: CompletenessAreaId) {
  if (area === "files") return "print";
  if (area === "schedule") return "basic";
  return area;
}

export function productCompleteness(product: Product) {
  const areas = (Object.keys(COMPLETENESS_WEIGHTS) as CompletenessAreaId[]).map((id) => {
    const fill = areaFill(product, id);
    return {
      id,
      label: AREA_LABEL[id],
      fill,
      weight: COMPLETENESS_WEIGHTS[id],
      score: areaScore(fill, COMPLETENESS_WEIGHTS[id]),
      percent: areaPercent(product, id),
      gaps: areaGaps(product, id),
    };
  });
  const percent = Math.min(
    100,
    areas.reduce((sum, a) => sum + a.score, 0),
  );
  const stage: CompletenessStage =
    percent >= 100 ? "ready" : percent >= 71 ? "review" : percent >= 31 ? "in_progress" : "draft";
  const missing = areas.filter((a) => a.fill !== "complete");
  return { percent, stage, areas, missing };
}

export function completenessStageOf(product: Product) {
  return productCompleteness(product).stage;
}
