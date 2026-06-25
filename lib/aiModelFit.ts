import { getModelSampleImageUrl, bumpImageWidth } from "@/lib/aiSampleImages";

export const MODEL_GENDERS = [
  { id: "female", label: "여성" },
  { id: "male", label: "남성" },
  { id: "unisex", label: "유니섹스" },
] as const;

export const MODEL_SIZES = [
  { id: "slim", label: "슬림 (44~55)" },
  { id: "regular", label: "레귤러 (55~66)" },
  { id: "plus", label: "플러스 (66~)" },
] as const;

export const MODEL_FEATURES = [
  { id: "east-asian", label: "동아시아형" },
  { id: "western", label: "서양형" },
  { id: "short-hair", label: "숏헤어" },
  { id: "long-hair", label: "롱헤어" },
  { id: "natural", label: "내추럴 메이크업" },
  { id: "editorial", label: "에디토리얼 메이크업" },
] as const;

export const MODEL_MOODS = [
  { id: "studio", label: "스튜디오 클린" },
  { id: "street", label: "스트릿 캐주얼" },
  { id: "luxury", label: "럭셔리 무드" },
  { id: "minimal", label: "미니멀 화이트" },
  { id: "outdoor", label: "아웃도어 라이트" },
] as const;

export type ModelGender = (typeof MODEL_GENDERS)[number]["id"];
export type ModelSize = (typeof MODEL_SIZES)[number]["id"];
export type ModelFeature = (typeof MODEL_FEATURES)[number]["id"];
export type ModelMood = (typeof MODEL_MOODS)[number]["id"];

export interface GarmentPlacement {
  top: number;
  left: number;
  width: number;
}

export interface FitTemplate {
  id: string;
  title: string;
  description: string;
  previewUrl: string;
  modelImageUrl: string;
  gender: ModelGender;
  size: ModelSize;
  features: ModelFeature[];
  mood: ModelMood;
  placement: GarmentPlacement;
}

/** 예시 모델컷 — 템플릿마다 서로 다른 이미지 1장 */
const FASHION_MODEL_PHOTOS: { gender: ModelGender; tag: string; photoId: string }[] = [
  { gender: "female", tag: "스튜디오", photoId: "1524504388940-b1c1722653e1" },
  { gender: "female", tag: "스트릿", photoId: "1517841905240-472988babdf9" },
  { gender: "female", tag: "에디토리얼", photoId: "1534528741775-53994a69daeb" },
  { gender: "female", tag: "내추럴", photoId: "1488426862026-3ee34a7d66df" },
  { gender: "female", tag: "아웃도어", photoId: "1469334031218-e382a71b716b" },
  { gender: "female", tag: "캐주얼", photoId: "1494790108377-be9c29b29330" },
  { gender: "female", tag: "럭셔리", photoId: "1544005313-94ddf0286df2" },
  { gender: "female", tag: "미니멀", photoId: "1438761681033-6461ffad8d80" },
  { gender: "female", tag: "룩북", photoId: "1529626455594-4ff0802cfb7e" },
  { gender: "female", tag: "패션", photoId: "1529139574466-a303027c1d8b" },
  { gender: "female", tag: "클린", photoId: "1522335783443-b1fd75475b41" },
  { gender: "female", tag: "모던", photoId: "1522337360788-8a13f7a6be74" },
  { gender: "female", tag: "라이프", photoId: "1508214751190-bcfd4ca60f91" },
  { gender: "female", tag: "뷰티", photoId: "1531123897727-6f129e1688ce" },
  { gender: "female", tag: "어반", photoId: "1521577350393-687d7b1c10ab" },
  { gender: "female", tag: "위크", photoId: "1496442226666-8d4d0e62e6e9" },
  { gender: "female", tag: "포트레이트", photoId: "1524504397849-b58600dc9d70" },
  { gender: "female", tag: "비즈니스", photoId: "1487412720507-e7ab37603c6f" },
  { gender: "female", tag: "시크", photoId: "1519741497674-611481863552" },
  { gender: "female", tag: "소프트", photoId: "1502823403479-6ccfcf4fb304" },
  { gender: "female", tag: "캣워크", photoId: "1509634176034-48c3a48b8a2c" },
  { gender: "female", tag: "매거진", photoId: "1529629766668-1f381df9b279" },
  { gender: "female", tag: "클래식", photoId: "1483986762654-25500f53c3cf" },
  { gender: "female", tag: "선셋", photoId: "1500917293891-ef795e08f329" },
  { gender: "female", tag: "시티", photoId: "1515884975505-c3e0c18589d9" },
  { gender: "female", tag: "윈터", photoId: "1548142813-0773ee567b68" },
  { gender: "female", tag: "코지", photoId: "1558611848-73f7eb4001a1" },
  { gender: "female", tag: "오피스", photoId: "1552374196-334cb0ac0d51" },
  { gender: "female", tag: "데일리", photoId: "1556905811-aff55ebaa50" },
  { gender: "female", tag: "프로필", photoId: "1573496359142-b8d87734a5a4" },
  { gender: "female", tag: "커리어", photoId: "1573497013638-91c9b38f7f8c" },
  { gender: "female", tag: "봄", photoId: "1583394838333-cd242b0a1bce" },
  { gender: "female", tag: "여름", photoId: "1594744802523-89647b425cb6" },
  { gender: "female", tag: "가을", photoId: "1595153500018-c36793b830ec" },
  { gender: "female", tag: "겨울", photoId: "1607746882571-6a02ab38dce4" },
  { gender: "female", tag: "트렌드", photoId: "1614204614920-1f0df782756e" },
  { gender: "female", tag: "빈티지", photoId: "1617032215425-a1487dfebb62" },
  { gender: "female", tag: "모노", photoId: "1620891531103-3f4a0e1cc00d" },
  { gender: "female", tag: "컬러", photoId: "1524250404020-1f9671f5b111" },
  { gender: "female", tag: "그레이", photoId: "1532074201576-7252612617bd" },
  { gender: "female", tag: "필름", photoId: "1544716278-ca5e3f4abd8c" },
  { gender: "female", tag: "내추럴2", photoId: "1554151228-14d9def656e4" },
  { gender: "female", tag: "스튜디오2", photoId: "1566492031773-ba4d64ad0e4b" },
  { gender: "female", tag: "에디2", photoId: "1571019613454-1cb2f99b2d8b" },
  { gender: "female", tag: "패션2", photoId: "1581044777550-4cfa60707c03" },
  { gender: "female", tag: "쇼룸", photoId: "1596738037101-ff2a0c117990" },
  { gender: "male", tag: "정면", photoId: "1507003211169-0a1dd7228f2d" },
  { gender: "male", tag: "스트릿", photoId: "1500648767791-00dcc994a43e" },
  { gender: "male", tag: "클래식", photoId: "1506794778202-cad84cf45f1d" },
  { gender: "male", tag: "미니멀", photoId: "1507591064344-4c6ce005b128" },
  { gender: "male", tag: "아웃도어", photoId: "1519085360753-af0119f7cbe7" },
  { gender: "male", tag: "캐주얼", photoId: "1472099645785-5658abf4ff4e" },
  { gender: "male", tag: "비즈니스", photoId: "1560250097-0b93528c311a" },
  { gender: "male", tag: "어반", photoId: "1568602471122-7832951cc8c5" },
  { gender: "male", tag: "포트레이트", photoId: "1557860881099-02287d7adf87" },
  { gender: "male", tag: "시티", photoId: "1573494563572-15698e91db1d" },
  { gender: "male", tag: "라이프", photoId: "1501196358065-6af95af8c8d9" },
  { gender: "male", tag: "스포츠", photoId: "1519345187854-9aaa6e4cae37" },
  { gender: "male", tag: "데님", photoId: "1503342217505-b0a15ec3261c" },
  { gender: "male", tag: "수트", photoId: "1612349317150-e413f6a5b16d" },
  { gender: "male", tag: "캐주얼2", photoId: "1504257435637-176871c9526d" },
  { gender: "male", tag: "룩북", photoId: "1521119989653-83d488a683da" },
  { gender: "male", tag: "모던", photoId: "1531427186611-30db933a1288" },
  { gender: "male", tag: "필드", photoId: "1542909168-82c3e7bca551" },
  { gender: "male", tag: "윈터", photoId: "1506153754-4377eb8e2645" },
  { gender: "male", tag: "오피스", photoId: "1617137968427-85924c800a22" },
  { gender: "unisex", tag: "모던", photoId: "1522075469751-3a6694fb2f61" },
  { gender: "unisex", tag: "라이프", photoId: "1531746020798-e6953c6e8e04" },
  { gender: "unisex", tag: "에디토리얼", photoId: "1515886657613-9f3515b0c78f" },
  { gender: "unisex", tag: "스트릿", photoId: "1529156069898-49953e39b3ac" },
  { gender: "unisex", tag: "캐주얼", photoId: "1515378791036-0648a3ef77b2" },
  { gender: "unisex", tag: "스튜디오", photoId: "1464983953574-0892a716854b" },
  { gender: "unisex", tag: "어반", photoId: "1506744038136-46273834b3fb" },
  { gender: "unisex", tag: "시즌", photoId: "1475180390428-79bfbb2ce34f" },
  { gender: "unisex", tag: "무드", photoId: "1551488827-b07a3955f877" },
  { gender: "female", tag: "셔츠", photoId: "1512436991641-6745cdb1723f" },
  { gender: "female", tag: "아우터", photoId: "1465101046530-73398c7f28ca" },
  { gender: "female", tag: "액세서리", photoId: "1515378965400-fcfd7c28d4f8" },
  { gender: "female", tag: "스니커즈", photoId: "1542291026-7eec264c27ff" },
  { gender: "female", tag: "백스테이지", photoId: "1558769132-cb1aea458c5e" },
  { gender: "female", tag: "쇼핑", photoId: "1441986300917-64674bd600d8" },
  { gender: "female", tag: "카페", photoId: "1495474472287-4d71bcdd2085" },
  { gender: "female", tag: "호텔", photoId: "1566073771259-6a8506099945" },
  { gender: "female", tag: "비치", photoId: "1507525428034-b723cf961d3e" },
  { gender: "female", tag: "플래시", photoId: "1524756001127-f48c242aef90" },
  { gender: "male", tag: "재킷", photoId: "1620799140408-edc5dcbda05e" },
  { gender: "male", tag: "후드", photoId: "1677297628966-0f7eea3e6211" },
  { gender: "male", tag: "티셔츠", photoId: "1622563595788-1015bc96840a" },
  { gender: "male", tag: "조끼", photoId: "1633332755198-6a8924d23918" },
  { gender: "male", tag: "가죽", photoId: "1642543492544-31f968a5c975" },
  { gender: "male", tag: "체크", photoId: "1652937756577-a83a8dd1c6cf" },
  { gender: "male", tag: "니트", photoId: "1664572880242-64261a029a39" },
  { gender: "male", tag: "코트", photoId: "1670406706315-6d0e89143a7d" },
  { gender: "unisex", tag: "오버핏", photoId: "1682687220063-47c9a8de3af5" },
  { gender: "unisex", tag: "레이어드", photoId: "1690574373190-a880139da9ae" },
  { gender: "unisex", tag: "베이직", photoId: "1704068541045-716a45afb0ea" },
  { gender: "female", tag: "로맨틱", photoId: "1713263220507-aa4645d5ab12" },
  { gender: "female", tag: "선라이트", photoId: "1689009805345-814a83d8451e" },
  { gender: "male", tag: "시네마", photoId: "1720774784599-dddee5e85f0e" },
  { gender: "female", tag: "뮤트", photoId: "1698364233383-94e425f58f4b" },
  { gender: "unisex", tag: "소프트", photoId: "1704478906372-8a2ab2790614" },
];

const FEATURE_VARIANTS: ModelFeature[][] = [
  ["east-asian", "natural"],
  ["east-asian", "long-hair", "natural"],
  ["east-asian", "short-hair", "editorial"],
  ["western", "long-hair", "editorial"],
  ["western", "short-hair", "natural"],
];

function buildSampleTemplates(targetCount = 100): FitTemplate[] {
  return Array.from({ length: targetCount }, (_, index) => {
    const photo = FASHION_MODEL_PHOTOS[index % FASHION_MODEL_PHOTOS.length];
    const mood = MODEL_MOODS[index % MODEL_MOODS.length];
    const size = MODEL_SIZES[index % MODEL_SIZES.length];
    const genderLabel = MODEL_GENDERS.find((g) => g.id === photo.gender)?.label ?? "";
    const placementShift = index % 6;

    return {
      id: `sample-${String(index + 1).padStart(3, "0")}`,
      title: `${genderLabel} · ${mood.label}`,
      description: `${photo.tag} · ${size.label} · 샘플 ${index + 1}`,
      previewUrl: getModelSampleImageUrl(index, "preview"),
      modelImageUrl: getModelSampleImageUrl(index, "full"),
      gender: photo.gender,
      size: size.id,
      features: [...FEATURE_VARIANTS[index % FEATURE_VARIANTS.length]],
      mood: mood.id,
      placement: {
        top: 295 + placementShift * 6,
        left: 195 + (index % 4) * 12,
        width: 355 + (index % 5) * 10,
      },
    };
  });
}

export const FIT_TEMPLATES: FitTemplate[] = buildSampleTemplates(100);

const MOOD_MODEL_IMAGES: Record<ModelGender, Record<ModelMood, string>> = {
  female: {
    studio:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
    street:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85",
    luxury:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85",
    minimal:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85",
    outdoor:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=85",
  },
  male: {
    studio:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=85",
    street:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85",
    luxury:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85",
    minimal:
      "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=900&q=85",
    outdoor:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=85",
  },
  unisex: {
    studio:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85",
    street:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
    luxury:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85",
    minimal:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=85",
    outdoor:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=900&q=85",
  },
};

const DEFAULT_PLACEMENT: GarmentPlacement = { top: 320, left: 210, width: 380 };

export function resolveModelImage(
  gender: ModelGender,
  mood: ModelMood,
  templateId?: string | null
): { modelImageUrl: string; placement: GarmentPlacement } {
  if (templateId) {
    const template = FIT_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      return { modelImageUrl: template.modelImageUrl, placement: template.placement };
    }
  }
  return {
    modelImageUrl: MOOD_MODEL_IMAGES[gender][mood],
    placement: DEFAULT_PLACEMENT,
  };
}

export function getTemplateById(id: string): FitTemplate | undefined {
  return FIT_TEMPLATES.find((t) => t.id === id);
}

export function findTemplateByCategories(
  gender: ModelGender,
  mood: ModelMood,
  size?: ModelSize
): FitTemplate | undefined {
  if (size) {
    const exact = FIT_TEMPLATES.find(
      (t) => t.gender === gender && t.mood === mood && t.size === size
    );
    if (exact) return exact;
  }
  return (
    FIT_TEMPLATES.find((t) => t.gender === gender && t.mood === mood) ??
    FIT_TEMPLATES.find((t) => t.gender === gender)
  );
}

export function getTemplateDisplayImageUrl(template: FitTemplate): string {
  return bumpImageWidth(template.modelImageUrl || template.previewUrl);
}

const GENDER_EN: Record<ModelGender, string> = {
  female: "female",
  male: "male",
  unisex: "unisex",
};

const SIZE_EN: Record<ModelSize, string> = {
  slim: "slim fit (KR 44-55)",
  regular: "regular fit (KR 55-66)",
  plus: "plus size (KR 66+)",
};

const MOOD_EN: Record<ModelMood, string> = {
  studio: "clean studio lighting, neutral backdrop",
  street: "urban street style, natural daylight",
  luxury: "luxury editorial mood, soft dramatic lighting",
  minimal: "minimal white background, soft shadows",
  outdoor: "outdoor natural light, lifestyle atmosphere",
};

const FEATURE_EN: Record<ModelFeature, string> = {
  "east-asian": "East Asian appearance",
  western: "Western appearance",
  "short-hair": "short hair",
  "long-hair": "long hair",
  natural: "natural makeup",
  editorial: "editorial makeup",
};

export interface ModelFitPromptInput {
  gender: ModelGender;
  size: ModelSize;
  features: ModelFeature[];
  mood: ModelMood;
  customPrompt?: string;
  templateTitle?: string;
}

function joinLabels<T extends string>(
  ids: T[],
  options: readonly { id: T; label: string }[]
): string {
  return ids
    .map((id) => options.find((o) => o.id === id)?.label ?? id)
    .join(", ");
}

/** 추가 작성 텍스트를 언어별로 분리 (한글 → ko, 영문 → en) */
export function splitCustomPromptByLanguage(text: string): { en: string; ko: string } {
  const trimmed = text.trim();
  if (!trimmed) return { en: "", ko: "" };

  const hasHangul = /[\uAC00-\uD7A3\u3131-\u318E]/.test(trimmed);
  const hasLatin = /[a-zA-Z]/.test(trimmed);

  if (hasHangul && !hasLatin) return { en: "", ko: trimmed };
  if (hasLatin && !hasHangul) return { en: trimmed, ko: "" };

  const chunks = trimmed
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[,，])\s*/));

  const enParts: string[] = [];
  const koParts: string[] = [];

  for (const chunk of chunks) {
    const part = chunk.trim();
    if (!part) continue;
    const hangulCount = (part.match(/[\uAC00-\uD7A3\u3131-\u318E]/g) || []).length;
    const latinCount = (part.match(/[a-zA-Z]/g) || []).length;
    if (hangulCount > latinCount) koParts.push(part);
    else if (latinCount > 0) enParts.push(part);
    else if (hangulCount > 0) koParts.push(part);
  }

  return {
    en: enParts.join(", "),
    ko: koParts.join(" "),
  };
}

export function buildModelFitPrompts(input: ModelFitPromptInput): { en: string; ko: string } {
  const genderKo = MODEL_GENDERS.find((g) => g.id === input.gender)?.label ?? "";
  const sizeKo = MODEL_SIZES.find((s) => s.id === input.size)?.label ?? "";
  const moodKo = MODEL_MOODS.find((m) => m.id === input.mood)?.label ?? "";
  const featuresKo = joinLabels(input.features, MODEL_FEATURES);
  const featuresEn = input.features.map((f) => FEATURE_EN[f]).join(", ");

  const baseEn = [
    "Professional fashion e-commerce full-body model photoshoot",
    `${GENDER_EN[input.gender]} fashion model`,
    SIZE_EN[input.size],
    featuresEn,
    MOOD_EN[input.mood],
    "Front-facing or three-quarter pose, high resolution, realistic fabric drape and texture, clean composition suitable for online clothing catalog and lookbook",
  ]
    .filter(Boolean)
    .join(", ");

  const baseKo = [
    "전문 패션 이커머스 전신 모델 촬영.",
    `${genderKo} 패션 모델`,
    sizeKo,
    featuresKo ? `모델 특징: ${featuresKo}` : "",
    `무드: ${moodKo}`,
    "정면 또는 3/4 포즈, 고해상도, 사실적인 원단 드레이프와 질감, 온라인 의류 카탈로그·룩북에 적합한 깔끔한 구도.",
  ]
    .filter(Boolean)
    .join(" ");

  const extra = splitCustomPromptByLanguage(input.customPrompt || "");
  const titleNote = input.templateTitle ? `Reference style: ${input.templateTitle}.` : "";
  const titleNoteKo = input.templateTitle ? `참고 스타일: ${input.templateTitle}.` : "";

  return {
    en: [titleNote, baseEn, extra.en].filter(Boolean).join(" "),
    ko: [titleNoteKo, baseKo, extra.ko].filter(Boolean).join(" "),
  };
}

export function buildTemplatePrompts(template: FitTemplate): { en: string; ko: string } {
  return buildModelFitPrompts({
    gender: template.gender,
    size: template.size,
    features: template.features,
    mood: template.mood,
    templateTitle: template.title,
  });
}

export interface ImageGenTool {
  id: string;
  name: string;
  description: string;
  url: string;
  logo: string;
}

export const IMAGE_GEN_TOOLS: ImageGenTool[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "DALL·E 이미지 생성",
    url: "https://chatgpt.com/",
    logo: "/ai-tools/chatgpt.svg",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google 이미지 생성",
    url: "https://gemini.google.com/",
    logo: "/ai-tools/gemini.svg",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "고품질 AI 아트",
    url: "https://www.midjourney.com/",
    logo: "/ai-tools/midjourney.svg",
  },
  {
    id: "leonardo",
    name: "Leonardo AI",
    description: "패션·제품 이미지",
    url: "https://app.leonardo.ai/",
    logo: "/ai-tools/leonardo.svg",
  },
  {
    id: "ideogram",
    name: "Ideogram",
    description: "텍스트·룩북 생성",
    url: "https://ideogram.ai/",
    logo: "/ai-tools/ideogram.svg",
  },
];
