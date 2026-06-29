import * as XLSX from "xlsx";
import { getFactoryFieldLabel } from "@/lib/factoryAdminFields";

/** 엑셀 내보내기 컬럼 순서 (DB 필드명) */
export const FACTORY_EXPORT_FIELD_ORDER = [
  "id",
  "company_name",
  "contact_name",
  "phone_number",
  "email",
  "address",
  "admin_district",
  "intro",
  "established_year",
  "factory_type",
  "business_type",
  "main_fabrics",
  "distribution",
  "delivery",
  "moq",
  "monthly_capacity",
  "processes",
  "top_items_upper",
  "top_items_lower",
  "top_items_outer",
  "top_items_dress_skirt",
  "top_items_bag",
  "top_items_fashion_accessory",
  "top_items_underwear",
  "top_items_sports_leisure",
  "top_items_pet",
  "items",
  "equipment",
  "sewing_machines",
  "pattern_machines",
  "special_machines",
  "lat",
  "lng",
  "image",
  "images",
  "kakao_url",
  "created_at",
  "updated_at",
] as const;

function formatCellValue(value: unknown): string | number {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return String(value);
}

export function factoryToExcelRow(factory: Record<string, unknown>): Record<string, string | number> {
  const row: Record<string, string | number> = {};
  const keys = new Set<string>([
    ...FACTORY_EXPORT_FIELD_ORDER,
    ...Object.keys(factory),
  ]);

  for (const key of keys) {
    if (key.startsWith("__")) continue;
    const header = getFactoryFieldLabel(key);
    row[header] = formatCellValue(factory[key]);
  }

  // 고정 순서로 재정렬
  const ordered: Record<string, string | number> = {};
  for (const key of FACTORY_EXPORT_FIELD_ORDER) {
    const header = getFactoryFieldLabel(key);
    if (header in row) ordered[header] = row[header];
  }
  for (const [header, value] of Object.entries(row)) {
    if (!(header in ordered)) ordered[header] = value;
  }
  return ordered;
}

export function buildFactoriesWorkbook(factories: Record<string, unknown>[]): Buffer {
  const rows = factories
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map(factoryToExcelRow);

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "업장목록");

  if (rows[0]) {
    ws["!cols"] = Object.keys(rows[0]).map((key) => ({
      wch: Math.min(48, Math.max(key.length + 2, 12)),
    }));
  }

  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

export function factoriesExportFilename(date = new Date()) {
  const stamp = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `동고리_업장목록_${stamp}.xlsx`;
}
