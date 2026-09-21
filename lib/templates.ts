import type { ProductCategory } from "./types";

export const TEMPLATE_LIBRARY_FILTERS = [
  { id: "all", label: "전체" },
  { id: "garment", label: "도식화 템플릿" },
  { id: "techpack", label: "제품 템플릿" },
  { id: "label", label: "에셋" },
  { id: "fabric", label: "원단" },
] as const;

export const TEMPLATE_PLAN_FILTERS = [
  { id: "all", label: "전체" },
  { id: "free", label: "무료", badge: "FREE" },
  { id: "premium", label: "프리미엄" },
] as const;

export const TEMPLATE_TYPE_FILTERS = [
  { id: "all", label: "전체" },
  { id: "apparel", label: "의류" },
  { id: "underwear", label: "속옷" },
  { id: "bag", label: "가방" },
  { id: "jewelry", label: "쥬얼리" },
] as const;

export const TEMPLATE_GENDER_FILTERS = [
  { id: "all", label: "전체" },
  { id: "female", label: "여성" },
  { id: "male", label: "남성" },
  { id: "unisex", label: "공용" },
] as const;

export const TEMPLATE_AGE_FILTERS = [
  { id: "all", label: "전체" },
  { id: "adult", label: "성인" },
  { id: "kids", label: "아동" },
] as const;

export const TEMPLATE_GROUP_FILTERS = [
  { id: "all", label: "전체" },
  { id: "tops", label: "상의" },
  { id: "bottoms", label: "하의" },
  { id: "dress", label: "원피스" },
  { id: "outer", label: "아우터" },
] as const;

export const TEMPLATE_CATEGORY_FILTERS = [
  { id: "all", label: "전체" },
  { id: "hoodie", label: "후디" },
  { id: "tee", label: "티셔츠" },
  { id: "shirt", label: "셔츠" },
  { id: "jacket", label: "재킷" },
  { id: "pants", label: "팬츠" },
  { id: "skirt", label: "스커트" },
  { id: "knit", label: "니트" },
  { id: "vest", label: "베스트" },
] as const;

export type TemplateChipId = (typeof TEMPLATE_LIBRARY_FILTERS)[number]["id"];
export type TemplatePlanFilterId = (typeof TEMPLATE_PLAN_FILTERS)[number]["id"];
export type TemplateTypeFilterId = (typeof TEMPLATE_TYPE_FILTERS)[number]["id"];
export type TemplateGenderFilterId = (typeof TEMPLATE_GENDER_FILTERS)[number]["id"];
export type TemplateAgeFilterId = (typeof TEMPLATE_AGE_FILTERS)[number]["id"];
export type TemplateGroupFilterId = (typeof TEMPLATE_GROUP_FILTERS)[number]["id"];
export type TemplateCategoryFilterId = (typeof TEMPLATE_CATEGORY_FILTERS)[number]["id"];
export type ServiceTemplateKind = Exclude<TemplateChipId, "all">;

const CATEGORY_GROUP: Record<ProductCategory, Exclude<TemplateGroupFilterId, "all">> = {
  hoodie: "tops",
  tee: "tops",
  shirt: "tops",
  vest: "tops",
  knit: "tops",
  pants: "bottoms",
  skirt: "bottoms",
  jacket: "outer",
};

export function templateMatchesGroup(category: ProductCategory | undefined, group: TemplateGroupFilterId) {
  if (group === "all") return true;
  if (!category) return false;
  return CATEGORY_GROUP[category] === group;
}

export function garmentTemplates() {
  return serviceTemplates.filter((t) => t.category && !t.asset);
}

const QUERY_HINTS: { test: RegExp; categories?: ProductCategory[]; groups?: Exclude<TemplateGroupFilterId, "all">[] }[] = [
  { test: /여름|아웃핏/, categories: ["tee", "pants", "skirt"] },
  { test: /티셔츠|그래픽\s*티|\btee\b/, categories: ["tee"] },
  { test: /코트|재킷|자켓|아우터|stadium/, categories: ["jacket"], groups: ["outer"] },
  { test: /스커트|롱스커트|a라인/, categories: ["skirt"] },
  { test: /원피스|드레스|dress/, groups: ["dress"] },
  { test: /후디|후드|hoodie/, categories: ["hoodie"] },
  { test: /팬츠|카고|바지/, categories: ["pants"] },
  { test: /셔츠|옥스포드/, categories: ["shirt"] },
  { test: /베스트|조끼|니트/, categories: ["vest", "knit"] },
  { test: /상의/, groups: ["tops"] },
  { test: /하의/, groups: ["bottoms"] },
];

export function templatesMatchingQuery(query: string, templates = garmentTemplates()) {
  const q = query.trim().toLowerCase();
  if (!q) return templates;
  const hinted = QUERY_HINTS.filter((hint) => hint.test.test(q));
  return templates.filter((t) => {
    const blob = `${t.name} ${t.description} ${t.meta} ${t.category ?? ""}`.toLowerCase();
    if (blob.includes(q)) return true;
    return hinted.some((hint) => {
      if (hint.categories && t.category && hint.categories.includes(t.category)) return true;
      return Boolean(hint.groups?.some((group) => templateMatchesGroup(t.category, group)));
    });
  });
}

export interface ServiceTemplate {
  id: string;
  name: string;
  kind: ServiceTemplateKind;
  description: string;
  meta: string;
  category?: ProductCategory;
  asset?: { group: "design" | "production"; kind: string; name: string; meta: string };
}

export const TEMPLATE_KIND_LABEL: Record<ServiceTemplateKind, string> = {
  techpack: "제품",
  garment: "의류",
  label: "라벨",
  fabric: "원단",
};

/** Catalog provided by Faddit — not workspace-owned. Duplicate into Library / products. */
export const serviceTemplates: ServiceTemplate[] = [
  {
    id: "tpl-hoodie",
    name: "Oversized Hoodie",
    kind: "techpack",
    category: "hoodie",
    description: "드롭숄더 오버사이즈 후디 스타터 테크팩. 캥거루 포켓, 이중 후드, 1x1 립.",
    meta: "제품 템플릿 · 후디",
  },
  {
    id: "tpl-tee",
    name: "Box Graphic Tee",
    kind: "techpack",
    category: "tee",
    description: "박스 실루엣 티셔츠 테크팩. 그래픽 위치와 기본 사이즈 스펙이 들어 있습니다.",
    meta: "제품 템플릿 · 티셔츠",
  },
  {
    id: "tpl-pants",
    name: "Wide Cargo Pants",
    kind: "garment",
    category: "pants",
    description: "사이드 포켓 2, 스트링 웨이스트의 와이드 카고 팬츠 의류 템플릿.",
    meta: "의류 · 팬츠",
  },
  {
    id: "tpl-jacket",
    name: "Stadium Jacket",
    kind: "garment",
    category: "jacket",
    description: "스냅 여밈 스타디움 재킷. 립 커프와 컬러 블록 기준선을 제공합니다.",
    meta: "의류 · 재킷",
  },
  {
    id: "tpl-shirt",
    name: "Oxford Shirt",
    kind: "garment",
    category: "shirt",
    description: "옥스포드 셔츠 기본 패턴. 칼라, 플래킷, 커프 기준선이 포함됩니다.",
    meta: "의류 · 셔츠",
  },
  {
    id: "tpl-vest",
    name: "Knit Vest",
    kind: "garment",
    category: "vest",
    description: "V넥 니트 베스트. 게이지와 넥 립 스펙을 바로 복제할 수 있습니다.",
    meta: "의류 · 베스트",
  },
  {
    id: "tpl-skirt",
    name: "Long A-line Skirt",
    kind: "garment",
    category: "skirt",
    description: "A라인 롱스커트 도식화. 웨이스트와 헴 기준선이 들어 있습니다.",
    meta: "의류 · 스커트",
  },
  {
    id: "tpl-main-label",
    name: "Woven Main Label",
    kind: "label",
    description: "40×25mm 다마스크 메인 라벨 프리셋. 백넥 부착 기준으로 복제합니다.",
    meta: "라벨 · 40×25",
    asset: { group: "design", kind: "Label", name: "Woven Main Label", meta: "Faddit 템플릿 · Woven · 40×25" },
  },
  {
    id: "tpl-care-label",
    name: "Care Label v1",
    kind: "label",
    description: "20×70mm 새틴 프린트 케어라벨. 사이드심 부착 위치와 세탁 아이콘 칸.",
    meta: "라벨 · 20×70",
    asset: { group: "design", kind: "Label", name: "Care Label v1", meta: "Faddit 템플릿 · Satin · 20×70" },
  },
  {
    id: "tpl-fleece",
    name: "Cotton Fleece 420g",
    kind: "fabric",
    description: "후디·스웻 기본 기모 원단 프리셋. C80/P20, 420g 스펙을 워크스페이스에 저장합니다.",
    meta: "원단 · C80/P20",
    asset: { group: "production", kind: "Fabric", name: "Cotton Fleece 420g", meta: "Faddit 템플릿 · C80/P20 · 420g" },
  },
  {
    id: "tpl-jersey",
    name: "Cotton Jersey 240g",
    kind: "fabric",
    description: "티셔츠용 코튼 저지 프리셋. 중량·혼용률을 그대로 복제해 제품에 붙일 수 있습니다.",
    meta: "원단 · C100",
    asset: { group: "production", kind: "Fabric", name: "Cotton Jersey 240g", meta: "Faddit 템플릿 · C100 · 240g" },
  },
];
