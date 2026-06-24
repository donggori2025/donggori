import type { Factory } from "@/lib/factories";

/** 프롬프트에서 제외할 불용어 */
const STOP_WORDS = new Set([
  "하고", "에서", "으로", "까지", "이나", "이며", "있는", "없는", "필요", "필요해요",
  "찾고", "싶어요", "가능한", "공장을", "공장", "업체", "곳이", "함께", "진행할",
  "제작과", "본생산을", "내외", "정도", "정도의", "정도로", "원하는", "원해요",
  "해주세요", "부탁", "문의", "제작", "생산", "진행", "가능", "합니다", "입니다",
  "있어요", "없어요", "해요", "되요", "돼요", "싶은", "하고싶", "할수",
]);

/** 동의어 그룹 — 프롬프트·업장 텍스트 매칭에 공통 사용 */
export const KEYWORD_GROUPS: Record<string, string[]> = {
  아동복: ["아동복", "아동", "키즈", "유아", "어린이", "kid", "kids"],
  여성복: ["여성복", "여성", "우먼", "레이디", "숙녀", "숙녀복"],
  남성복: ["남성복", "남성", "맨즈", "남복"],
  운동복: ["운동복", "스포츠", "레저", "기능성", "트레이닝", "요가"],
  자켓: ["자켓", "재킷", "아우터", "점퍼", "블루종", "코트", "outer"],
  셔츠: ["셔츠", "블라우스", "와이셔츠", "shirt"],
  니트: ["니트", "편물", "다이마루", "스웨터", "가디건"],
  샘플: ["샘플", "소량", "시제", "프로토"],
  본생산: ["본생산", "양산", "대량"],
  봉제: ["봉제", "임가공", "cmt", "완성", "시아게"],
  패턴: ["패턴", "패턴실", "cad", "캐드"],
  원단: ["원단", "직기", "우븐", "직물", "fabrics"],
};

const HIGH_VALUE_KEYWORDS = new Set([
  "아동복", "여성복", "남성복", "운동복", "자켓", "셔츠", "니트", "원단", "봉제", "패턴",
]);

function normalizeText(value: string): string {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeToken(value: string): string {
  return normalizeText(value).replace(/\s+/g, "");
}

export function splitMultiValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[,|/]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

/** 업장 상세의 모든 검색 가능 필드를 하나의 텍스트로 합칩니다. */
export function buildFactorySearchText(factory: Factory | Record<string, unknown>): string {
  const f = factory as Record<string, unknown>;
  const parts: string[] = [
    f.company_name,
    f.name,
    f.intro,
    f.intro_text,
    f.description,
    f.factory_type,
    f.business_type,
    f.main_fabrics,
    f.admin_district,
    f.region,
    f.address,
    f.equipment,
    f.distribution,
    f.delivery,
    f.brands_supplied,
    f.sewing_machines,
    f.pattern_machines,
    f.special_machines,
    f.top_items_upper,
    f.top_items_lower,
    f.top_items_outer,
    f.top_items_dress_skirt,
    f.top_items_bag,
    f.top_items_fashion_accessory,
    f.top_items_underwear,
    f.top_items_sports_leisure,
    f.top_items_pet,
    ...(Array.isArray(f.processes) ? f.processes : splitMultiValues(f.processes)),
    ...(Array.isArray(f.items) ? f.items : splitMultiValues(f.items)),
  ];

  return normalizeText(parts.filter(Boolean).join(" "));
}

/** 프롬프트에서 검색 키워드를 추출합니다. */
export function extractPromptKeywords(prompt: string): string[] {
  const normalizedPrompt = normalizeText(prompt);
  const found = new Set<string>();

  // 동의어 그룹 스캔 (부분 문자열 포함)
  for (const [canonical, aliases] of Object.entries(KEYWORD_GROUPS)) {
    const hit = aliases.some((alias) => normalizedPrompt.includes(normalizeToken(alias)));
    if (hit) found.add(canonical);
  }

  // 토큰 분리 후 불용어 제거
  const tokens = normalizedPrompt
    .split(/[\s,./()+\-:]+/)
    .map((v) => v.trim())
    .filter((v) => v.length >= 2 && !STOP_WORDS.has(v));

  for (const token of tokens) {
    const bare = token.replace(/(을|를|이|가|은|는|에|의|과|와|로|도|만|부터|까지|에서)$/u, "");
    if (bare.length >= 2 && !STOP_WORDS.has(bare)) {
      found.add(bare);
    }
    found.add(token);
  }

  return Array.from(found);
}

function getKeywordAliases(keyword: string): string[] {
  const normalized = normalizeToken(keyword);
  for (const [canonical, aliases] of Object.entries(KEYWORD_GROUPS)) {
    if (canonical === keyword || aliases.some((a) => normalizeToken(a) === normalized)) {
      return [canonical, ...aliases.map(normalizeToken)];
    }
  }
  return [normalized];
}

function keywordMatchStrength(keyword: string, searchText: string): "none" | "alias" | "exact" {
  const normalizedSearch = normalizeToken(searchText);
  const normalizedKeyword = normalizeToken(keyword);

  if (normalizedKeyword.length >= 2 && normalizedSearch.includes(normalizedKeyword)) {
    return "exact";
  }

  const aliases = getKeywordAliases(keyword).filter((alias) => alias !== normalizedKeyword);
  if (aliases.some((alias) => alias.length >= 2 && normalizedSearch.includes(alias))) {
    return "alias";
  }

  return "none";
}

function keywordMatchesText(keyword: string, searchText: string): boolean {
  return keywordMatchStrength(keyword, searchText) !== "none";
}

export function getMoqValue(factory: Factory | Record<string, unknown>): number | null {
  const f = factory as Factory;
  const fromMoq = typeof f.moq === "number" ? f.moq : Number(f.moq);
  if (!Number.isNaN(fromMoq) && fromMoq > 0) return fromMoq;
  const fromMinOrder = typeof f.minOrder === "number" ? f.minOrder : Number(f.minOrder);
  if (!Number.isNaN(fromMinOrder) && fromMinOrder > 0) return fromMinOrder;
  return null;
}

export interface FactoryPromptScore {
  score: number;
  hitKeywords: string[];
  matchDetails: string[];
}

/** 자유 입력 프롬프트 기준 업장 점수 */
export function scoreFactoryForPrompt(
  factory: Factory | Record<string, unknown>,
  prompt: string
): FactoryPromptScore {
  const normalizedPrompt = normalizeText(prompt);
  const searchText = buildFactorySearchText(factory);
  const keywords = extractPromptKeywords(prompt);
  const hitKeywords: string[] = [];
  const matchDetails: string[] = [];
  let score = 0;

  for (const keyword of keywords) {
    const strength = keywordMatchStrength(keyword, searchText);
    if (strength === "none") continue;

    const baseWeight = HIGH_VALUE_KEYWORDS.has(keyword) ? 28 : 12;
    const weight = strength === "exact" ? baseWeight : Math.round(baseWeight * 0.5);
    score += weight;
    hitKeywords.push(keyword);
    matchDetails.push(strength === "exact" ? keyword : `${keyword}(연관)`);
  }

  const moqValue = getMoqValue(factory);

  if (
    (normalizedPrompt.includes("샘플") || normalizedPrompt.includes("소량")) &&
    moqValue !== null &&
    moqValue <= 100
  ) {
    score += 18;
    matchDetails.push(`MOQ ${moqValue}`);
  }
  if (
    (normalizedPrompt.includes("대량") || normalizedPrompt.includes("양산") || normalizedPrompt.includes("본생산")) &&
    moqValue !== null &&
    moqValue >= 300
  ) {
    score += 18;
    matchDetails.push(`MOQ ${moqValue}`);
  }
  if (
    (normalizedPrompt.includes("스포츠") || normalizedPrompt.includes("기능성") || normalizedPrompt.includes("운동복")) &&
    keywordMatchesText("다이마루", searchText)
  ) {
    score += 10;
    matchDetails.push("기능성/다이마루");
  }
  if (
    (normalizedPrompt.includes("자켓") || normalizedPrompt.includes("아우터")) &&
    splitMultiValues((factory as Factory).top_items_outer).length > 0
  ) {
    score += 10;
    matchDetails.push("아우터 품목");
  }
  if (
    normalizedPrompt.includes("셔츠") &&
    splitMultiValues((factory as Factory).top_items_upper).length > 0
  ) {
    score += 8;
    matchDetails.push("상의 품목");
  }

  return {
    score: Math.min(100, score),
    hitKeywords,
    matchDetails: Array.from(new Set(matchDetails)),
  };
}

export function recommendFactoriesFromPrompt<T extends Factory | Record<string, unknown>>(
  factories: T[],
  prompt: string,
  count = 3
): Array<T & { score: number; hitKeywords: string[]; matchDetails?: string[] }> {
  const scored = factories.map((factory) => {
    const result = scoreFactoryForPrompt(factory, prompt);
    return {
      ...factory,
      score: result.score,
      hitKeywords: result.hitKeywords,
      matchDetails: result.matchDetails,
    };
  });

  const sorted = scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.hitKeywords.length - a.hitKeywords.length;
  });
  const topScore = sorted[0]?.score ?? 0;

  const promptCategories = extractPromptKeywords(prompt).filter((kw) => HIGH_VALUE_KEYWORDS.has(kw));
  let candidates = sorted;
  if (promptCategories.length > 0) {
    const categoryMatched = sorted.filter((factory) =>
      promptCategories.some((cat) => keywordMatchesText(cat, buildFactorySearchText(factory)))
    );
    if (categoryMatched.length > 0) candidates = categoryMatched;
  }

  if (topScore === 0) {
    // 점수가 전부 0이면 무작위가 아니라 키워드 부분 일치(느슨) 재시도
    const loose = factories
      .map((factory) => {
        const text = buildFactorySearchText(factory);
        const looseHits = extractPromptKeywords(prompt).filter((kw) =>
          normalizeToken(text).includes(normalizeToken(kw))
        );
        return {
          ...factory,
          score: looseHits.length * 5,
          hitKeywords: looseHits,
          matchDetails: looseHits,
        };
      })
      .filter((f) => f.score > 0)
      .sort((a, b) => b.score - a.score);

    if (loose.length > 0) return loose.slice(0, count) as Array<T & { score: number; hitKeywords: string[] }>;
    return candidates.slice(0, count);
  }

  return candidates.slice(0, count);
}
