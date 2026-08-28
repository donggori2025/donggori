import { getFactoryImages, getFactoryMainImage } from "./factoryImages";
import type { Factory } from "./factoryCatalog";

/** 공개 목록/상세에 노출해도 되는 업장 컬럼 (연락처·이메일·상세주소·대표자명 제외) */
export const PUBLIC_FACTORY_SELECT = [
  "id",
  "company_name",
  "admin_district",
  "intro",
  "intro_text",
  "description",
  "factory_type",
  "business_type",
  "main_fabrics",
  "distribution",
  "delivery",
  "moq",
  "monthly_capacity",
  "lat",
  "lng",
  "equipment",
  "sewing_machines",
  "pattern_machines",
  "special_machines",
  "special_tech",
  "top_items_upper",
  "top_items_lower",
  "top_items_outer",
  "top_items_dress_skirt",
  "top_items_bag",
  "top_items_fashion_accessory",
  "top_items_underwear",
  "top_items_sports_leisure",
  "top_items_pet",
  "brands_supplied",
  "established_year",
  "employees",
  "processes",
  "image",
  "images",
].join(",");

const HIDDEN_FACTORY_NAMES = new Set(["희망사"]);

function toPublicCoordinate(value: unknown, min: number, max: number): number {
  const coordinate = Number(value);
  if (!Number.isFinite(coordinate) || coordinate < min || coordinate > max) return 0;
  // Public markers show only an approximate neighbourhood, not a building-level location.
  return Math.round(coordinate * 100) / 100;
}

export function mapPublicFactoryRow(item: Record<string, unknown>): Factory {
  const companyName = String(item.company_name || item.name || "공장명 없음");

  return {
    id: String(item.id || ""),
    name: companyName,
    ownerUserId: "unknown",
    region: String(item.admin_district || "지역 없음"),
    items: [],
    minOrder: Number(item.moq) || 0,
    description: String(item.intro_text || item.intro || item.description || "설명 없음"),
    image: getFactoryMainImage(item),
    images: getFactoryImages(item),
    contact: "",
    // 0/0 means location is unavailable; valid coordinates are coarsened for public privacy.
    lat: toPublicCoordinate(item.lat, -90, 90),
    lng: toPublicCoordinate(item.lng, -180, 180),
    kakaoUrl: "",
    processes: item.processes
      ? Array.isArray(item.processes)
        ? (item.processes as string[])
        : [String(item.processes)]
      : [],
    business_type: item.business_type as string | undefined,
    equipment: item.equipment as string | undefined,
    sewing_machines: item.sewing_machines as string | undefined,
    pattern_machines: item.pattern_machines as string | undefined,
    special_machines: item.special_machines as string | undefined,
    top_items_upper: item.top_items_upper as string | undefined,
    top_items_lower: item.top_items_lower as string | undefined,
    top_items_outer: item.top_items_outer as string | undefined,
    top_items_dress_skirt: item.top_items_dress_skirt as string | undefined,
    top_items_bag: item.top_items_bag as string | undefined,
    top_items_fashion_accessory: item.top_items_fashion_accessory as string | undefined,
    top_items_underwear: item.top_items_underwear as string | undefined,
    top_items_sports_leisure: item.top_items_sports_leisure as string | undefined,
    top_items_pet: item.top_items_pet as string | undefined,
    moq: Number(item.moq) || undefined,
    monthly_capacity: Number(item.monthly_capacity) || undefined,
    admin_district: item.admin_district as string | undefined,
    intro: (item.intro_text || item.intro) as string | undefined,
    factory_type: item.factory_type as string | undefined,
    main_fabrics: item.main_fabrics as string | undefined,
    distribution: item.distribution as string | undefined,
    delivery: item.delivery as string | undefined,
    company_name: item.company_name as string | undefined,
    brands_supplied: item.brands_supplied as string | undefined,
    established_year: Number(item.established_year) || undefined,
  };
}

export function mapPublicFactoryRows(rows: Record<string, unknown>[]): Factory[] {
  return rows
    .filter((item) => {
      const companyName = String(item.company_name || item.name || "");
      return companyName && !HIDDEN_FACTORY_NAMES.has(companyName);
    })
    .map(mapPublicFactoryRow);
}
