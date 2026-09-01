const FALLBACK_IMAGE = "/logo_donggori.png";
const LEGACY_BLOB_BASE = "https://m7fjtbfe2aen7kcw.public.blob.vercel-storage.com";

// DB-managed URLs win. These verified Blob files preserve listings whose
// image columns were never backfilled after the storage migration.
const LEGACY_FACTORY_IMAGES: Record<string, [folder: string, file: string]> = {
  "강훈무역": ["강훈무역", "20250710_103857.jpg"],
  "건영실업": ["건영실업", "20250715_101845.jpg"],
  "경림패션": ["경림패션", "20250710_113356.jpg"],
  "나인": ["나인", "20250710_111150.jpg"],
  "뉴에일린": ["뉴에일린", "20250708_160127.jpg"],
  "다엘": ["다엘", "20250715_105148.jpg"],
  "대명어패럴": ["대명어패럴", "20250709_104228.jpg"],
  "더시크컴퍼니": ["더시크컴퍼니", "20250709_225247.jpg"],
  "라인스": ["라인스", "20250709_105019.jpg"],
  "백산실업": ["백산실업", "20250715_170154.jpg"],
  "부연사": ["부연사", "20250710_130032.jpg"],
  "새가온": ["새가온", "20250714_152602.jpg"],
  "선화사": ["선화사", "20250709_115204.jpg"],
  "스마일업체": ["스마일업체", "20250711_104314.jpg"],
  "스마일": ["스마일", "KakaoTalk_20250902_230342248.jpg"],
  "시즌": ["시즌", "20250710_112809.jpg"],
  "실루엣컴퍼니": ["실루엣컴퍼니", "20250710_123520.jpg"],
  "에이스": ["에이스", "20250714_114137.jpg"],
  "오르다": ["오르다", "20250709_135416.jpg"],
  "오성섬유": ["오성섬유", "20250715_182743.jpg"],
  "오스카 디자인": ["오스카 디자인", "20250711_101241.jpg"],
  "우정샘플": ["우정샘플", "20250714_111200.jpg"],
  "우정패션": ["우정패션", "20250714_111200.jpg"],
  "우진모피": ["우진모피", "20250715_103650.jpg"],
  "유화 섬유": ["유화 섬유", "20250714_093043.jpg"],
  "재민상사": ["재민상사", "20250714_120323.jpg"],
  "좋은사람": ["좋은사람", "114498789873579979_1220069723.jpg"],
  "하늘패션": ["하늘패션", "20250712_172704.jpg"],
  "혜민사": ["혜민사", "20250710_131750.jpg"],
  "화신사": ["화신사", "20250715_180243.jpg"],
  "희란패션": ["희란패션", "20250709_110315.jpg"],
  "jk패션": ["jk패션", "KakaoTalk_20250902_230359893.jpg"],
  "기훈패션": ["기훈패션", "KakaoTalk_20250902_230310883.jpg"],
  "나르샤": ["나르샤", "KakaoTalk_20250902_230256978.jpg"],
  "다래디자인": ["다래디자인", "KakaoTalk_20250902_230419383.jpg"],
  "다온패션": ["다온패션", "KakaoTalk_20250902_230530170.jpg"],
  "레오실업": ["레오실업", "KakaoTalk_20250902_230515328.jpg"],
  "민경패션": ["민경패션", "KakaoTalk_20250902_230615438.jpg"],
  "바비패션": ["바비패션", "KakaoTalk_20250902_230235575.jpg"],
  "수미어패럴": ["수미어패럴", "KakaoTalk_20250902_230321148.jpg"],
  "으뜸어패럴": ["으뜸어패럴", "KakaoTalk_20250902_230214593.jpg"],
  "조아스타일": ["조아스타일", "20250714_121748.jpg"],
  "태경패션": ["태경패션", "KakaoTalk_20250902_230457546.jpg"],
  "태광사": ["태광사", "KakaoTalk_20250902_230445963.jpg"],
  "태성어패럴": ["태성어패럴", "KakaoTalk_20250902_230331718.jpg"],
  "미호패션": ["미호패션", "20250716_090508.jpg"],
  "박원니트": ["박원니트", "20250711_102529.jpg"],
  "정인어패럴": ["정인어패럴", "KakaoTalk_20250902_230604583.jpg"],
  "미니팩토리": ["미니팩토리", "21-10-15-S1810.jpg"],
  "신원자수": ["신원자수", "temp_1755482617691.-314581507.jpeg"],
  "옷 만드는 사람들": ["옷 만드는 사람들", "temp_1755505483924.1451555862.jpeg"],
  "제훈사 (구 아이템)": ["제훈사", "temp_1754980701768.1010321190.jpeg"],
  "부라더": ["부라더", "20250818_184415.jpg"],
};

function strings(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()));
  } catch {
    // A single URL is the normal legacy format.
  }
  return [value.trim()];
}

/** Prefer administered image URLs and preserve verified legacy thumbnails as a fallback. */
export function getFactoryImages(value: unknown): string[] {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const storedImages = Array.from(new Set([...strings(row.images), ...strings(row.image)]))
    .filter((url) => url !== FALLBACK_IMAGE);
  if (storedImages.length > 0) return storedImages;

  const companyName = String(row.company_name || row.name || "").trim();
  const legacyImage = LEGACY_FACTORY_IMAGES[companyName];
  if (legacyImage) return [`${LEGACY_BLOB_BASE}/${encodeURIComponent(legacyImage[0])}/${encodeURIComponent(legacyImage[1])}`];
  return [];
}

export function getFactoryMainImage(value: unknown): string {
  return getFactoryImages(value)[0] || FALLBACK_IMAGE;
}

export function hasFactoryImages(value: unknown): boolean {
  return getFactoryImages(value).length > 0;
}
