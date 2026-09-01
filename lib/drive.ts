export const DRIVE_CHIPS = [
  { id: "all", label: "전체" },
  { id: "techpack", label: "제품" },
  { id: "label", label: "라벨" },
  { id: "fabric", label: "원단" },
  { id: "rib", label: "시보리원단" },
  { id: "print", label: "인쇄물" },
  { id: "other", label: "기타" },
  { id: "trim", label: "부자재" },
  { id: "sizespec", label: "사이즈스펙" },
  { id: "qty", label: "수량" },
  { id: "upload", label: "업로드" },
] as const;

export type DriveChipId = (typeof DRIVE_CHIPS)[number]["id"];

export function assetDriveChip(kind: string, name: string): Exclude<DriveChipId, "all" | "techpack" | "upload"> {
  const blob = `${kind} ${name}`.toLowerCase();
  if (/사이즈스펙|사이즈 스펙|size.?spec|measurement/.test(blob)) return "sizespec";
  if (/색상별|수량|quantity|\bqty\b/.test(blob)) return "qty";
  if (/rib|시보리/.test(blob)) return "rib";
  if (/label|라벨/.test(blob)) return "label";
  if (/fabric|원단|fleece|jersey|twill/.test(blob)) return "fabric";
  if (/trim|hardware|부자재|eyelet|snap|drawcord|button/.test(blob)) return "trim";
  if (/graphic|print|인쇄|artwork/.test(blob)) return "print";
  return "other";
}

export const DRIVE_CHIP_LABEL: Record<DriveChipId, string> = Object.fromEntries(
  DRIVE_CHIPS.map((c) => [c.id, c.label]),
) as Record<DriveChipId, string>;

export const LIBRARY_CHIPS = DRIVE_CHIPS.filter((c) =>
  c.id === "all" || c.id === "fabric" || c.id === "rib" || c.id === "trim" || c.id === "sizespec" || c.id === "qty",
);
