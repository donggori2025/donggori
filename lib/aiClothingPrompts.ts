import { getClothingSampleImageUrl, bumpImageWidth } from "@/lib/aiSampleImages";
import { splitCustomPromptByLanguage } from "@/lib/aiModelFit";

export type ClothingGender = "female" | "male" | "unisex";
export type GarmentType = "top" | "bottom" | "dress" | "outerwear" | "set";
export type ClothingStyle = "casual" | "minimal" | "street" | "formal" | "vintage";
export type ClothingSeason = "spring" | "summer" | "fall" | "winter" | "all";
export type ProductView = "flat-lay" | "hanger" | "mannequin" | "ghost";

export const CLOTHING_GENDERS = [
  { id: "female" as const, label: "여성" },
  { id: "male" as const, label: "남성" },
  { id: "unisex" as const, label: "유니섹스" },
];

export const GARMENT_TYPES = [
  { id: "top" as const, label: "상의" },
  { id: "bottom" as const, label: "하의" },
  { id: "dress" as const, label: "원피스" },
  { id: "outerwear" as const, label: "아우터" },
  { id: "set" as const, label: "세트" },
];

export const CLOTHING_STYLES = [
  { id: "casual" as const, label: "캐주얼" },
  { id: "minimal" as const, label: "미니멀" },
  { id: "street" as const, label: "스트릿" },
  { id: "formal" as const, label: "포멀" },
  { id: "vintage" as const, label: "빈티지" },
];

export const CLOTHING_SEASONS = [
  { id: "spring" as const, label: "봄" },
  { id: "summer" as const, label: "여름" },
  { id: "fall" as const, label: "가을" },
  { id: "winter" as const, label: "겨울" },
  { id: "all" as const, label: "사계절" },
];

export const PRODUCT_VIEWS = [
  { id: "flat-lay" as const, label: "플랫레이" },
  { id: "hanger" as const, label: "행거" },
  { id: "mannequin" as const, label: "마네킹" },
  { id: "ghost" as const, label: "고스트" },
];

export interface ClothingTemplate {
  id: string;
  title: string;
  description: string;
  previewUrl: string;
  imageUrl: string;
  gender: ClothingGender;
  type: GarmentType;
  style: ClothingStyle;
  season: ClothingSeason;
  view: ProductView;
}

const CLOTHING_PHOTOS: {
  gender: ClothingGender;
  type: GarmentType;
  tag: string;
  photoId: string;
}[] = [
  { gender: "female", type: "top", tag: "블라우스", photoId: "1434389677669-e08b4cac3105" },
  { gender: "male", type: "bottom", tag: "티셔츠", photoId: "1523381210436-271946d82c4f" },
  { gender: "unisex", type: "dress", tag: "니트", photoId: "1576563761091-bb7163f46941" },
  { gender: "female", type: "outerwear", tag: "셔츠", photoId: "1594933910745-41910ff34762" },
  { gender: "male", type: "set", tag: "후디", photoId: "1618354691372-d42c4c641d07" },
  { gender: "unisex", type: "top", tag: "데님", photoId: "1542272604-787c3835535d" },
  { gender: "female", type: "bottom", tag: "스커트", photoId: "1582555176455-7d1569cc4732" },
  { gender: "male", type: "dress", tag: "슬랙스", photoId: "1624373519858-d8241ef533ae" },
  { gender: "unisex", type: "outerwear", tag: "원피스", photoId: "1595776617277-6849faba64ca" },
  { gender: "female", type: "set", tag: "재킷", photoId: "1566170037871-7d0b6037e1cc" },
  { gender: "male", type: "top", tag: "코트", photoId: "1539533018447-63fcfb55ceaf" },
  { gender: "unisex", type: "bottom", tag: "맨투맨", photoId: "1551028719-00167bb16c4c" },
  { gender: "female", type: "dress", tag: "후리스", photoId: "1489987707025-afc232f7ea0f" },
  { gender: "male", type: "outerwear", tag: "가디건", photoId: "1556905054-24def24de977" },
  { gender: "unisex", type: "set", tag: "트렌치", photoId: "1598033126332-fa017cdef6be" },
  { gender: "female", type: "top", tag: "블레이저", photoId: "1620799140408-edc5dcbda05e" },
  { gender: "male", type: "bottom", tag: "패딩", photoId: "1622445275511-248137275718" },
  { gender: "unisex", type: "dress", tag: "조거", photoId: "1556821840-3a63f95609a7" },
  { gender: "female", type: "outerwear", tag: "치노", photoId: "1473966960360-6e6f8de82c40" },
  { gender: "male", type: "set", tag: "오버올", photoId: "1541099649105-f69ad21f3246" },
  { gender: "unisex", type: "top", tag: "크롭", photoId: "1591047139829-de91ebc83547" },
  { gender: "female", type: "bottom", tag: "와이드", photoId: "1544022613-e87ca75a784f" },
  { gender: "male", type: "dress", tag: "맥시", photoId: "1552902865-d72fa245ed11" },
  { gender: "unisex", type: "outerwear", tag: "슬립", photoId: "1551488827-b07a3955f877" },
  { gender: "female", type: "set", tag: "볼레로", photoId: "1515886657613-9f3515b0c78f" },
  { gender: "male", type: "top", tag: "린넨", photoId: "1503342217505-b0a15ec3261c" },
  { gender: "unisex", type: "bottom", tag: "그래픽", photoId: "1496747614446-174da47e5717" },
  { gender: "female", type: "dress", tag: "플리츠", photoId: "1521572163474-6864f9cf17ab" },
  { gender: "male", type: "outerwear", tag: "레깅스", photoId: "1558171813-52645dfdfab4" },
  { gender: "unisex", type: "set", tag: "트랙", photoId: "1591195853828-6de52c1ffb40" },
  { gender: "female", type: "top", tag: "수트", photoId: "1515372034583-a7beff9488e1" },
  { gender: "male", type: "bottom", tag: "캐미", photoId: "1445205170230-d053b830f50c" },
  { gender: "unisex", type: "dress", tag: "숏팬츠", photoId: "1441986300917-64674bd600d8" },
  { gender: "female", type: "outerwear", tag: "윈드", photoId: "1558769132-cb1aea458c5e" },
  { gender: "male", type: "set", tag: "퍼", photoId: "1544967080-df340035b8a2" },
  { gender: "unisex", type: "top", tag: "봄버", photoId: "1631049307263-da46d38dbb85" },
  { gender: "female", type: "bottom", tag: "베이직", photoId: "1636767007939-d866674456d2" },
  { gender: "male", type: "dress", tag: "오버핏", photoId: "1649971236444-5a4f273fc333" },
  { gender: "unisex", type: "outerwear", tag: "레이어드", photoId: "1652937756577-a83a8dd1c6cf" },
  { gender: "female", type: "set", tag: "체크", photoId: "1664572880242-64261a029a39" },
  { gender: "male", type: "top", tag: "스트라이프", photoId: "1670406706315-6d0e89143a7d" },
  { gender: "unisex", type: "bottom", tag: "도트", photoId: "1682687220063-47c9a8de3af5" },
  { gender: "female", type: "dress", tag: "프릴", photoId: "1690574373190-a880139da9ae" },
  { gender: "male", type: "outerwear", tag: "하이넥", photoId: "1704068541045-716a45afb0ea" },
  { gender: "unisex", type: "set", tag: "터틀넥", photoId: "1713263220507-aa4645d5ab12" },
  { gender: "female", type: "top", tag: "오프숄더", photoId: "1689009805345-814a83d8451e" },
  { gender: "male", type: "bottom", tag: "슬리브리스", photoId: "1698364233383-94e425f58f4b" },
  { gender: "unisex", type: "dress", tag: "워크셔츠", photoId: "1704478906372-8a2ab2790614" },
  { gender: "female", type: "outerwear", tag: "플란넬", photoId: "1720774784599-dddee5e85f0e" },
  { gender: "male", type: "set", tag: "헨리넥", photoId: "1551698612-51afe1330173" },
  { gender: "unisex", type: "top", tag: "폴로", photoId: "1553062407-98eeb64c6a62" },
  { gender: "female", type: "bottom", tag: "옥스포드", photoId: "1556906788-dcca0fedd41f" },
  { gender: "male", type: "dress", tag: "데님재킷", photoId: "1567401893414-76b7b1e5a7a5" },
  { gender: "unisex", type: "outerwear", tag: "레더", photoId: "1583743810859-52e8f962065a" },
  { gender: "female", type: "set", tag: "울코트", photoId: "1617137115625-22a7f9d96363" },
  { gender: "male", type: "top", tag: "니트원피스", photoId: "1490481651871-ab68de25d574" },
  { gender: "unisex", type: "bottom", tag: "셔츠원피스", photoId: "1548039253-f59953a66cf3" },
  { gender: "female", type: "dress", tag: "랩", photoId: "1490577634897-34c7adab9349" },
  { gender: "male", type: "outerwear", tag: "미디", photoId: "1562157873-818bc7806f1a" },
  { gender: "unisex", type: "set", tag: "테니스", photoId: "1556908938-d89285c92761" },
  { gender: "female", type: "top", tag: "버뮤다", photoId: "1558618666-fcd25c85cd64" },
  { gender: "male", type: "bottom", tag: "카고", photoId: "1556909114-f6e7ad7d6346" },
  { gender: "unisex", type: "dress", tag: "조끼", photoId: "1520979104739-394b3bc69b38" },
  { gender: "female", type: "outerwear", tag: "가죽", photoId: "1544716278-ca5e3f4abd8c" },
  { gender: "male", type: "set", tag: "니트세트", photoId: "1554151228-14d9def656e4" },
  { gender: "unisex", type: "top", tag: "투피스", photoId: "1566492031773-ba4d64ad0e4b" },
  { gender: "female", type: "bottom", tag: "트레이닝", photoId: "1571019613454-1cb2f99b2d8b" },
  { gender: "male", type: "dress", tag: "홈웨어", photoId: "1581044777550-4cfa60707c03" },
  { gender: "unisex", type: "outerwear", tag: "스포츠", photoId: "1596738037101-ff2a0c117990" },
  { gender: "female", type: "set", tag: "리조트", photoId: "1614204614920-1f0df782756e" },
  { gender: "male", type: "top", tag: "비즈니스", photoId: "1617032215425-a1487dfebb62" },
  { gender: "unisex", type: "bottom", tag: "오피스룩", photoId: "1620891531103-3f4a0e1cc00d" },
  { gender: "female", type: "dress", tag: "캐주얼셋", photoId: "1524250404020-1f9671f5b111" },
  { gender: "male", type: "outerwear", tag: "데님셋", photoId: "1532074201576-7252612617bd" },
  { gender: "unisex", type: "set", tag: "코디", photoId: "1566073771259-6a8506099945" },
  { gender: "female", type: "top", tag: "시즌룩", photoId: "1495474472287-4d71bcdd2085" },
  { gender: "male", type: "bottom", tag: "봄룩", photoId: "1507525428034-b723cf961d3e" },
  { gender: "unisex", type: "dress", tag: "여름룩", photoId: "1524756001127-f48c242aef90" },
  { gender: "female", type: "outerwear", tag: "가을룩", photoId: "1542291026-7eec264c27ff" },
  { gender: "male", type: "set", tag: "겨울룩", photoId: "1515378965400-fcfd7c28d4f8" },
  { gender: "unisex", type: "top", tag: "아노락", photoId: "1465101046530-73398c7f28ca" },
  { gender: "female", type: "bottom", tag: "바머", photoId: "1512436991641-6745cdb1723f" },
  { gender: "male", type: "dress", tag: "맥코트", photoId: "1475180390428-79bfbb2ce34f" },
  { gender: "unisex", type: "outerwear", tag: "하이브리드", photoId: "1506744038136-46273834b3fb" },
  { gender: "female", type: "set", tag: "패치", photoId: "1464983953574-0892a716854b" },
  { gender: "male", type: "top", tag: "모노", photoId: "1515378791036-0648a3ef77b2" },
  { gender: "unisex", type: "bottom", tag: "컬러", photoId: "1529156069898-49953e39b3ac" },
  { gender: "female", type: "dress", tag: "그레이", photoId: "1531746020798-e6953c6e8e04" },
  { gender: "male", type: "outerwear", tag: "필름", photoId: "1522075469751-3a6694fb2f61" },
  { gender: "unisex", type: "set", tag: "클린", photoId: "1617137968427-85924c800a22" },
  { gender: "female", type: "top", tag: "소프트", photoId: "1677297628966-0f7eea3e6211" },
  { gender: "male", type: "bottom", tag: "파스텔", photoId: "1501196358065-6af95af8c8d9" },
  { gender: "unisex", type: "dress", tag: "뮤트", photoId: "1573494563572-15698e91db1d" },
  { gender: "female", type: "outerwear", tag: "선라이트", photoId: "1519345187854-9aaa6e4cae37" },
  { gender: "male", type: "set", tag: "시네마", photoId: "1504257435637-176871c9526d" },
  { gender: "unisex", type: "top", tag: "골든", photoId: "1612349317150-e413f6a5b16d" },
  { gender: "female", type: "bottom", tag: "웜톤", photoId: "1531427186611-30db933a1288" },
  { gender: "male", type: "dress", tag: "쿨톤", photoId: "1542909168-82c3e7bca551" },
  { gender: "unisex", type: "outerwear", tag: "프레시", photoId: "1506153754-4377eb8e2645" },
  { gender: "female", type: "set", tag: "그루브", photoId: "1521119989653-83d488a683da" },
];

function buildClothingTemplates(targetCount = 100): ClothingTemplate[] {
  return Array.from({ length: targetCount }, (_, index) => {
    const photo = CLOTHING_PHOTOS[index % CLOTHING_PHOTOS.length];
    const style = CLOTHING_STYLES[index % CLOTHING_STYLES.length];
    const season = CLOTHING_SEASONS[index % CLOTHING_SEASONS.length];
    const view = PRODUCT_VIEWS[index % PRODUCT_VIEWS.length];
    const genderLabel = CLOTHING_GENDERS.find((g) => g.id === photo.gender)?.label ?? "";
    const typeLabel = GARMENT_TYPES.find((t) => t.id === photo.type)?.label ?? "";

    return {
      id: `cloth-${String(index + 1).padStart(3, "0")}`,
      title: `${genderLabel} ${typeLabel} · ${style.label}`,
      description: `${photo.tag} · ${season.label} · ${view.label}`,
      previewUrl: getClothingSampleImageUrl(index, "preview"),
      imageUrl: getClothingSampleImageUrl(index, "full"),
      gender: photo.gender,
      type: photo.type,
      style: style.id,
      season: season.id,
      view: view.id,
    };
  });
}

export const CLOTHING_TEMPLATES: ClothingTemplate[] = buildClothingTemplates(100);

const GENDER_EN: Record<ClothingGender, string> = {
  female: "women's",
  male: "men's",
  unisex: "unisex",
};

const TYPE_EN: Record<GarmentType, string> = {
  top: "top garment",
  bottom: "bottom garment",
  dress: "dress",
  outerwear: "outerwear jacket or coat",
  set: "coordinated outfit set",
};

const STYLE_EN: Record<ClothingStyle, string> = {
  casual: "casual everyday style",
  minimal: "minimal clean aesthetic",
  street: "streetwear urban style",
  formal: "formal tailored look",
  vintage: "vintage retro mood",
};

const SEASON_EN: Record<ClothingSeason, string> = {
  spring: "spring season",
  summer: "summer lightweight",
  fall: "autumn fall season",
  winter: "winter warm layering",
  all: "all-season versatile",
};

const VIEW_EN: Record<ProductView, string> = {
  "flat-lay": "flat lay product shot on clean background",
  hanger: "hanging on wooden or metal hanger",
  mannequin: "displayed on fashion mannequin, no face visible",
  ghost: "invisible ghost mannequin effect, hollow neck",
};

export interface ClothingPromptInput {
  gender: ClothingGender;
  type: GarmentType;
  style: ClothingStyle;
  season: ClothingSeason;
  view: ProductView;
  customPrompt?: string;
  templateTitle?: string;
  /** 옵션 선택 없이 직접 작성만 사용 */
  skipOptions?: boolean;
}

export function buildClothingPrompts(input: ClothingPromptInput): { en: string; ko: string } {
  if (input.skipOptions) {
    return splitCustomPromptByLanguage(input.customPrompt || "");
  }

  const genderKo = CLOTHING_GENDERS.find((g) => g.id === input.gender)?.label ?? "";
  const typeKo = GARMENT_TYPES.find((t) => t.id === input.type)?.label ?? "";
  const styleKo = CLOTHING_STYLES.find((s) => s.id === input.style)?.label ?? "";
  const seasonKo = CLOTHING_SEASONS.find((s) => s.id === input.season)?.label ?? "";
  const viewKo = PRODUCT_VIEWS.find((v) => v.id === input.view)?.label ?? "";

  const baseEn = [
    "Professional fashion e-commerce product photography",
    `${GENDER_EN[input.gender]} ${TYPE_EN[input.type]}`,
    STYLE_EN[input.style],
    SEASON_EN[input.season],
    VIEW_EN[input.view],
    "No model face, clothing only, high resolution, realistic fabric texture and stitching detail, clean white or neutral background, suitable for online fashion store catalog",
  ]
    .filter(Boolean)
    .join(", ");

  const baseKo = [
    "전문 패션 이커머스 의류 상품 촬영.",
    `${genderKo} ${typeKo}`,
    `스타일: ${styleKo}`,
    `시즌: ${seasonKo}`,
    `촬영 방식: ${viewKo}`,
    "모델 얼굴 없이 의류만, 고해상도, 사실적인 원단 질감과 스티치 디테일, 깔끔한 화이트 또는 뉴트럴 배경, 온라인 패션 스토어 카탈로그에 적합.",
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

export function findClothingTemplateByCategories(
  gender: ClothingGender,
  type: GarmentType,
  style?: ClothingStyle
): ClothingTemplate | undefined {
  if (style) {
    const exact = CLOTHING_TEMPLATES.find(
      (t) => t.gender === gender && t.type === type && t.style === style
    );
    if (exact) return exact;
  }
  return (
    CLOTHING_TEMPLATES.find((t) => t.gender === gender && t.type === type) ??
    CLOTHING_TEMPLATES.find((t) => t.gender === gender)
  );
}

export function getClothingDisplayImageUrl(template: ClothingTemplate): string {
  return bumpImageWidth(template.imageUrl || template.previewUrl);
}
