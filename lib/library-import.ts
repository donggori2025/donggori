import { assetDriveChip } from "./drive";
import type { Colorway, LibraryAsset, Material, MeasurementRow, TrimItem } from "./types";

export type LibraryImportKind = "fabric" | "trim" | "sizespec" | "qty";

export const IMPORT_KIND_LABEL: Record<LibraryImportKind, string> = {
  fabric: "원단",
  trim: "부자재",
  sizespec: "사이즈 스펙",
  qty: "색상별 수량",
};

export function matchesImportKind(asset: LibraryAsset, kind: LibraryImportKind): boolean {
  const chip = assetDriveChip(asset.kind, asset.name);
  if (kind === "fabric") return chip === "fabric" || chip === "rib";
  if (kind === "trim") return chip === "trim";
  if (kind === "sizespec") return chip === "sizespec";
  return chip === "qty";
}

const SPEC_IMPORT_KINDS: LibraryImportKind[] = ["fabric", "trim", "sizespec", "qty"];

export function isSpecLibraryAsset(asset: LibraryAsset) {
  return SPEC_IMPORT_KINDS.some((kind) => matchesImportKind(asset, kind));
}

export function importKindOfAsset(asset: LibraryAsset): LibraryImportKind | null {
  if (matchesImportKind(asset, "sizespec")) return "sizespec";
  if (matchesImportKind(asset, "qty")) return "qty";
  if (matchesImportKind(asset, "trim")) return "trim";
  if (matchesImportKind(asset, "fabric")) return "fabric";
  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function str(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function materialFromAsset(asset: LibraryAsset, id: string): Material {
  const data = asRecord(asset.data);
  const metaParts = asset.meta.split(" · ").map((p) => p.trim()).filter(Boolean);
  const weightFromName = asset.name.match(/(\d+\s?g)/i)?.[1]?.replace(" ", "") ?? "";
  return {
    id,
    name: str(data?.name, asset.name),
    composition: str(data?.composition, metaParts[0] ?? ""),
    weight: str(data?.weight, weightFromName),
    supplier: str(data?.supplier, metaParts.slice(1).join(" · ")),
    color: str(data?.color, "#e8e8e8"),
    position: str(data?.position),
    consumption: str(data?.consumption),
    colorName: str(data?.colorName),
    memo: str(data?.memo, asset.meta),
    status: str(data?.status),
    image: str(data?.image) || undefined,
  };
}

export function trimFromAsset(asset: LibraryAsset, id: string): TrimItem {
  const data = asRecord(asset.data);
  return {
    id,
    name: str(data?.name, asset.name),
    type: str(data?.type, asset.kind || "Trim"),
    spec: str(data?.spec, asset.meta),
    color: str(data?.color, "#e8e8e8"),
    position: str(data?.position),
    qty: str(data?.qty),
    attach: str(data?.attach),
    memo: str(data?.memo, asset.meta),
    status: str(data?.status),
    image: str(data?.image) || undefined,
  };
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && v.trim() !== "") : [];
}

function numMap(value: unknown): Record<string, number> {
  const record = asRecord(value);
  if (!record) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(record)) {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n)) out[k] = n;
  }
  return out;
}

export function sizeSpecFromAsset(asset: LibraryAsset): {
  sizeRange: string[];
  measurements: MeasurementRow[];
} {
  const data = asRecord(asset.data);
  const sizeRange = stringList(data?.sizeRange);
  const raw = Array.isArray(data?.measurements) ? data.measurements : [];
  const measurements: MeasurementRow[] = raw.map((row, i) => {
    const r = asRecord(row);
    const values = numMap(r?.values);
    for (const key of ["xs", "s", "m", "l", "xl"] as const) {
      const label = key.toUpperCase();
      if (values[label] != null) continue;
      const n = Number(r?.[key]);
      if (Number.isFinite(n)) values[label] = n > 200 ? n / 10 : n;
    }
    return {
      pom: str(r?.pom, String.fromCharCode(65 + i)),
      label: str(r?.label, "측정 항목"),
      values,
      grade: Number.isFinite(Number(r?.grade)) ? Number(r?.grade) : 2,
      tolerance: str(r?.tolerance, "±5"),
    };
  });
  if (!measurements.length) {
    measurements.push({ pom: "A", label: asset.name, values: {}, grade: 2, tolerance: "±5" });
  }
  return {
    sizeRange: sizeRange.length ? sizeRange : ["S", "M", "L", "XL"],
    measurements,
  };
}

export function qtyFromAsset(asset: LibraryAsset): {
  sizeRange: string[];
  colorways: Omit<Colorway, "id">[];
} {
  const data = asRecord(asset.data);
  const sizeRange = stringList(data?.sizeRange);
  const raw = Array.isArray(data?.colorways) ? data.colorways : [];
  const colorways: Omit<Colorway, "id">[] = raw.map((row) => {
    const r = asRecord(row);
    const name = str(r?.name, asset.name);
    return {
      name,
      main: str(r?.main, name),
      sub: str(r?.sub),
      code: str(r?.code),
      hex: str(r?.hex, "#cfcfcf"),
      qtyBySize: numMap(r?.qtyBySize),
      memo: str(r?.memo),
    };
  });
  if (!colorways.length) {
    colorways.push({
      name: asset.name,
      main: asset.name,
      sub: "",
      code: "",
      hex: "#cfcfcf",
      qtyBySize: {},
      memo: "",
    });
  }
  const fromQty = Object.keys(colorways[0]?.qtyBySize ?? {});
  return {
    sizeRange: sizeRange.length ? sizeRange : fromQty.length ? fromQty : ["S", "M", "L", "XL"],
    colorways,
  };
}
