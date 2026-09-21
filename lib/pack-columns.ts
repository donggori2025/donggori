export type PackItemColumn = { key: string; label: string; extra?: boolean };

export const FABRIC_PACK_COLUMNS: PackItemColumn[] = [
  { key: "name", label: "품명" },
  { key: "position", label: "위치" },
  { key: "colorName", label: "컬러" },
  { key: "consumption", label: "소요량" },
  { key: "yardage", label: "요척", extra: true },
  { key: "price", label: "가격", extra: true },
];

export const TRIM_PACK_COLUMNS: PackItemColumn[] = [
  { key: "name", label: "품명" },
  { key: "position", label: "위치" },
  { key: "type", label: "종류" },
  { key: "qty", label: "수량" },
  { key: "yardage", label: "요척", extra: true },
  { key: "price", label: "가격", extra: true },
];

export function visiblePackColumns(all: PackItemColumn[], stored?: string[]) {
  if (!stored?.length) return all.filter((col) => !col.extra);
  const allowed = new Set(all.map((col) => col.key));
  const picked = stored.filter((key) => allowed.has(key));
  const set = new Set(picked);
  const ordered = all.filter((col) => set.has(col.key));
  return ordered.length ? ordered : all;
}

export function togglePackColumn(all: PackItemColumn[], selected: string[], key: string) {
  const visible = visiblePackColumns(all, selected).map((col) => col.key);
  if (visible.includes(key)) {
    const next = visible.filter((item) => item !== key);
    return next.length ? next : visible;
  }
  return all.map((col) => col.key).filter((item) => item === key || visible.includes(item));
}
