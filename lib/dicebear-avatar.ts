import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/voxel-art.json" with { type: "json" };

const voxelStyle = new Style(definition);

export const NONE = "none";
export const RANDOM = "random";

export type VoxelAvatarConfig = {
  seed: string;
  backgroundColor?: string;
  skinColor?: string;
  hairColor?: string;
  shirtColor?: string;
  hatColor?: string;
  topVariant?: string;
  eyesVariant?: string;
  eyebrowsVariant?: string;
  noseVariant?: string;
  mouthVariant?: string;
  cheeksVariant?: string;
  outfitVariant?: string;
  glassesVariant?: string;
  beardVariant?: string;
};

export const DEFAULT_AVATAR: VoxelAvatarConfig = {
  seed: "jay@faddit.co.kr",
};

export const TOP_VARIANTS = [
  "short",
  "spiky",
  "bowl",
  "sideSwept",
  "curly",
  "mohawk",
  "buns",
  "ponytail",
  "bob",
  "shoulderLength",
  "longStraight",
  "longWavy",
  "partedLong",
  "braids",
  "twinTails",
  "cap",
  "beanie",
  "animalEars",
  "bunnyEars",
  "afro",
  "halfShaved",
] as const;

export const EYE_VARIANTS = ["open", "soft", "happy", "sleepy", "side", "closed", "wide", "star"] as const;
export const EYEBROW_VARIANTS = ["flat", "raised", "angry", "soft"] as const;
export const NOSE_VARIANTS = ["block", "wide", "small", "tall"] as const;
export const CHEEK_VARIANTS = ["blush", "pixel", "freckles"] as const;
export const MOUTH_VARIANTS = [
  "smile",
  "bigSmile",
  "wideSmile",
  "grin",
  "laugh",
  "smirk",
  "flat",
  "frown",
  "ooh",
  "tongue",
] as const;
export const OUTFIT_VARIANTS = [
  "hoodie",
  "plain",
  "jacket",
  "coat",
  "dress",
  "overalls",
  "suit",
  "tie",
  "stripes",
  "checker",
] as const;
export const GLASSES_VARIANTS = ["round", "square", "cat", "shades", "visor"] as const;
export const BEARD_VARIANTS = ["stubble", "mustache", "goatee", "full"] as const;

export const BG_COLORS = ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"];
export const SKIN_COLORS = ["f5d0b0", "eab890", "dda878", "c99062", "b07347", "95562f", "7d4a26", "6a3d1f"];
export const HAIR_COLORS = [
  "2c222b",
  "3b2f2f",
  "5a3825",
  "7b4a2d",
  "a56b46",
  "c98850",
  "d9b380",
  "e8d4a8",
  "b55239",
  "d6455d",
  "6d5acf",
  "3fb27f",
];
export const HAT_COLORS = ["c68a5f", "f2f2f2", "8d95d6", "e0876d", "5ba8a0", "d9a03c", "a06fb8", "4a6fa5"];
export const SHIRT_COLORS = [
  "e64980",
  "f76707",
  "fab005",
  "40c057",
  "12b886",
  "228be6",
  "4c6ef5",
  "7950f2",
  "e8590c",
  "495057",
];

const VARIANT_LABELS: Record<string, string> = {
  random: "랜덤",
  none: "없음",
  short: "단발",
  curly: "컬",
  bob: "보브",
  bowl: "보울",
  braids: "브레이드",
  longStraight: "긴 생머리",
  longWavy: "긴 웨이브",
  ponytail: "포니테일",
  twinTails: "트윈테일",
  spiky: "스파이키",
  mohawk: "모히칸",
  cap: "캡",
  beanie: "비니",
  open: "뜬 눈",
  happy: "웃는 눈",
  soft: "부드러운 눈",
  wide: "큰 눈",
  sleepy: "졸린 눈",
  closed: "감은 눈",
  star: "별",
  side: "옆보기",
  smile: "미소",
  bigSmile: "활짝",
  wideSmile: "넓은 미소",
  grin: "활짝 이",
  sideSwept: "사이드",
  buns: "번",
  shoulderLength: "어깨 길이",
  partedLong: "가르마",
  animalEars: "동물 귀",
  bunnyEars: "토끼 귀",
  afro: "아프로",
  halfShaved: "반삭",
  blush: "블러시",
  pixel: "픽셀",
  freckles: "주근깨",
  raised: "올라간 눈썹",
  angry: "화난 눈썹",
  block: "블록",
  small: "작은 코",
  tall: "긴 코",
  laugh: "웃음",
  smirk: "씨익",
  flat: "무표정",
  frown: "찡그림",
  ooh: "오",
  tongue: "혀",
  hoodie: "후디",
  plain: "무지",
  jacket: "재킷",
  coat: "코트",
  dress: "원피스",
  overalls: "오버롤",
  suit: "수트",
  tie: "넥타이",
  stripes: "스트라이프",
  checker: "체크",
  round: "둥근 안경",
  square: "사각 안경",
  cat: "캣아이",
  shades: "선글라스",
  visor: "바이저",
  stubble: "수염 잔털",
  mustache: "콧수염",
  goatee: "고티",
  "eyes.soft": "부드러운 눈",
  "eyes.wide": "큰 눈",
  "eyebrows.flat": "일자 눈썹",
  "eyebrows.soft": "부드러운 눈썹",
  "mouth.flat": "무표정",
  "nose.wide": "넓은 코",
  "nose.small": "작은 코",
  "nose.tall": "긴 코",
  full: "풀 비어드",
};

export function variantLabel(value: string, group?: string) {
  if (group) {
    const keyed = VARIANT_LABELS[`${group}.${value}`];
    if (keyed) return keyed;
  }
  return VARIANT_LABELS[value] ?? value;
}

function hex(value?: string) {
  if (!value) return undefined;
  return value.replace(/^#/, "");
}

function partOptions(variant: string | undefined, key: string) {
  if (!variant || variant === RANDOM) return {};
  if (variant === NONE) return { [`${key}Probability`]: 0 };
  return { [`${key}Variant`]: [variant], [`${key}Probability`]: 100 };
}

export function createVoxelAvatar(config: VoxelAvatarConfig, size = 128) {
  const options: Record<string, unknown> = {
    seed: config.seed || "faddit",
    size,
  };

  const bg = hex(config.backgroundColor);
  const skin = hex(config.skinColor);
  const hair = hex(config.hairColor);
  const shirt = hex(config.shirtColor);
  const hat = hex(config.hatColor);
  if (bg) options.backgroundColor = [bg];
  if (skin) options.skinColor = [skin];
  if (hair) options.hairColor = [hair];
  if (shirt) options.shirtColor = [shirt];
  if (hat) options.hatColor = [hat];

  Object.assign(
    options,
    partOptions(config.topVariant, "top"),
    partOptions(config.eyesVariant, "eyes"),
    partOptions(config.eyebrowsVariant, "eyebrows"),
    partOptions(config.noseVariant, "nose"),
    partOptions(config.mouthVariant, "mouth"),
    partOptions(config.cheeksVariant, "cheeks"),
    partOptions(config.outfitVariant, "outfit"),
    partOptions(config.glassesVariant, "glasses"),
    partOptions(config.beardVariant, "beard"),
  );

  const cleaned = JSON.parse(JSON.stringify(options)) as Record<string, unknown>;
  try {
    return new Avatar(voxelStyle, cleaned);
  } catch {
    return new Avatar(voxelStyle, { seed: String(cleaned.seed ?? "faddit"), size });
  }
}

export function avatarDataUri(config: VoxelAvatarConfig, size = 128) {
  return createVoxelAvatar(config, size).toDataUri();
}

export function randomSeed() {
  return `face-${Math.random().toString(36).slice(2, 8)}`;
}

export function avatarConfigForSeed(seed: string, backgroundColor?: string): VoxelAvatarConfig {
  return {
    seed,
    backgroundColor: backgroundColor?.replace(/^#/, ""),
  };
}
