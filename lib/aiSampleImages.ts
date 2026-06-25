/** 검증된 Unsplash 이미지 ID — 모델핏(인물) 예시용 */
export const VERIFIED_UNSPLASH_IDS = [
  "1524504388940-b1c1722653e1",
  "1517841905240-472988babdf9",
  "1534528741775-53994a69daeb",
  "1488426862026-3ee34a7d66df",
  "1469334031218-e382a71b716b",
  "1494790108377-be9c29b29330",
  "1544005313-94ddf0286df2",
  "1438761681033-6461ffad8d80",
  "1529626455594-4ff0802cfb7e",
  "1529139574466-a303027c1d8b",
  "1496442226666-8d4d0e62e6e9",
  "1487412720507-e7ab37603c6f",
  "1519741497674-611481863552",
  "1558611848-73f7eb4001a1",
  "1544716278-ca5e3f4abd8c",
  "1554151228-14d9def656e4",
  "1571019613454-1cb2f99b2d8b",
  "1581044777550-4cfa60707c03",
  "1507003211169-0a1dd7228f2d",
  "1500648767791-00dcc994a43e",
  "1506794778202-cad84cf45f1d",
  "1507591064344-4c6ce005b128",
  "1519085360753-af0119f7cbe7",
  "1472099645785-5658abf4ff4e",
  "1560250097-0b93528c311a",
  "1503342217505-b0a15ec3261c",
  "1612349317150-e413f6a5b16d",
  "1617137968427-85924c800a22",
  "1522075469751-3a6694fb2f61",
  "1531746020798-e6953c6e8e04",
  "1515886657613-9f3515b0c78f",
  "1529156069898-49953e39b3ac",
  "1515378791036-0648a3ef77b2",
  "1464983953574-0892a716854b",
  "1506744038136-46273834b3fb",
  "1512436991641-6745cdb1723f",
  "1465101046530-73398c7f28ca",
  "1542291026-7eec264c27ff",
  "1558769132-cb1aea458c5e",
  "1441986300917-64674bd600d8",
  "1495474472287-4d71bcdd2085",
  "1566073771259-6a8506099945",
  "1507525428034-b723cf961d3e",
  "1434389677669-e08b4cac3105",
  "1542272604-787c3835535d",
  "1489987707025-afc232f7ea0f",
  "1556821840-3a63f95609a7",
  "1541099649105-f69ad21f3246",
  "1521572163474-6864f9cf17ab",
  "1553062407-98eeb64c6a62",
  "1567401893414-76b7b1e5a7a5",
  "1558618666-fcd25c85cd64",
] as const;

/** 검증된 Unsplash 이미지 ID — 의류·패션 상품 예시용 (인물 클로즈업 제외) */
export const CLOTHING_UNSPLASH_IDS = [
  "1512436991641-6745cdb1723f",
  "1465101046530-73398c7f28ca",
  "1503342217505-b0a15ec3261c",
  "1515378791036-0648a3ef77b2",
  "1464983953574-0892a716854b",
  "1506744038136-46273834b3fb",
  "1529156069898-49953e39b3ac",
  "1542291026-7eec264c27ff",
  "1441986300917-64674bd600d8",
  "1495474472287-4d71bcdd2085",
  "1566073771259-6a8506099945",
  "1507525428034-b723cf961d3e",
  "1434389677669-e08b4cac3105",
  "1542272604-787c3835535d",
  "1489987707025-afc232f7ea0f",
  "1556821840-3a63f95609a7",
  "1541099649105-f69ad21f3246",
  "1553062407-98eeb64c6a62",
  "1567401893414-76b7b1e5a7a5",
  "1558618666-fcd25c85cd64",
  "1571019613454-1cb2f99b2d8b",
  "1581044777550-4cfa60707c03",
  "1544716278-ca5e3f4abd8c",
  "1554151228-14d9def656e4",
  "1558611848-73f7eb4001a1",
  "1515886657613-9f3515b0c78f",
  "1558769132-cb1aea458c5e",
  "1521572163474-6864f9cf17ab",
  "1531746020798-e6953c6e8e04",
  "1522075469751-3a6694fb2f61",
] as const;

const CLOTHING_CROP_VARIANTS = ["center", "entropy", "edges", "top", "bottom"] as const;

type ImageSize = "preview" | "full";

function unsplashUrl(
  id: string,
  crop: string,
  size: ImageSize
): string {
  const w = size === "preview" ? 480 : 900;
  const q = size === "preview" ? 80 : 85;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=${crop}&w=${w}&q=${q}`;
}

/** 모델핏 예시 — 사람(포트레이트) 이미지 */
export function getModelSampleImageUrl(index: number, size: ImageSize = "preview"): string {
  if (index < VERIFIED_UNSPLASH_IDS.length) {
    return unsplashUrl(VERIFIED_UNSPLASH_IDS[index], "faces", size);
  }
  const fallback = index - VERIFIED_UNSPLASH_IDS.length;
  const gender = fallback % 2 === 0 ? "women" : "men";
  const num = (fallback % 48) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
}

/** 의류 생성 예시 — 의류·패션 상품 이미지 */
export function getClothingSampleImageUrl(index: number, size: ImageSize = "preview"): string {
  const id = CLOTHING_UNSPLASH_IDS[index % CLOTHING_UNSPLASH_IDS.length];
  const crop =
    CLOTHING_CROP_VARIANTS[
      Math.floor(index / CLOTHING_UNSPLASH_IDS.length) % CLOTHING_CROP_VARIANTS.length
    ];
  return unsplashUrl(id, crop, size);
}

export function bumpImageWidth(url: string, width = 1200, quality = 90): string {
  if (url.includes("randomuser.me")) return url;
  if (url.includes("w=")) return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, `q=${quality}`);
  return `${url}${url.includes("?") ? "&" : "?"}w=${width}&q=${quality}`;
}
