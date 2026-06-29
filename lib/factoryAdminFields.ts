export const FACTORY_FIELD_LABELS: Record<string, string> = {
  id: "ID",
  company_name: "업장명",
  address: "주소",
  business_type: "업종",
  phone_number: "연락처",
  moq: "최소주문량",
  monthly_capacity: "월생산량",
  admin_district: "행정구역",
  intro: "소개",
  lat: "위도",
  lng: "경도",
  image: "대표 이미지",
  images: "이미지 목록",
  created_at: "생성일",
  updated_at: "수정일",
  owner_user_id: "소유자 ID",
  email: "이메일",
  contact_name: "담당자명",
  established_year: "설립년도",
  main_fabrics: "주요 원단",
  distribution: "유통",
  delivery: "배송",
  factory_type: "공장 유형",
  equipment: "장비",
  sewing_machines: "재봉틀",
  pattern_machines: "패턴기",
  special_machines: "특수 기계",
  top_items_upper: "상의",
  top_items_lower: "하의",
  top_items_outer: "아우터",
  top_items_dress_skirt: "드레스·스커트",
  top_items_bag: "가방",
  top_items_fashion_accessory: "패션 잡화",
  top_items_underwear: "속옷",
  top_items_sports_leisure: "스포츠·레저",
  top_items_pet: "펫용품",
  items: "생산 품목",
  processes: "공정",
  kakao_url: "카카오 채널 URL",
};

export const FACTORY_FIELD_SECTIONS = [
  {
    title: "기본 정보",
    fields: [
      "company_name",
      "contact_name",
      "phone_number",
      "email",
      "address",
      "admin_district",
      "intro",
      "established_year",
      "kakao_url",
    ],
  },
  {
    title: "생산·운영",
    fields: [
      "factory_type",
      "business_type",
      "main_fabrics",
      "distribution",
      "delivery",
      "moq",
      "monthly_capacity",
      "processes",
    ],
  },
  {
    title: "생산 품목",
    fields: [
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
    ],
  },
  {
    title: "설비",
    fields: ["equipment", "sewing_machines", "pattern_machines", "special_machines"],
  },
  {
    title: "위치",
    fields: ["lat", "lng"],
  },
  {
    title: "시스템",
    fields: ["id", "created_at", "updated_at", "owner_user_id"],
  },
] as const;

export const READONLY_FACTORY_FIELDS = new Set([
  "id",
  "created_at",
  "updated_at",
  "owner_user_id",
]);

export const IMAGE_FACTORY_FIELDS = new Set(["images", "image"]);

export const LONG_TEXT_FACTORY_FIELDS = new Set([
  "intro",
  "main_fabrics",
  "processes",
  "equipment",
  "distribution",
  "delivery",
  "items",
  "top_items_upper",
  "top_items_lower",
  "top_items_outer",
  "top_items_dress_skirt",
  "top_items_bag",
  "top_items_fashion_accessory",
  "top_items_underwear",
  "top_items_sports_leisure",
  "top_items_pet",
]);

export function getFactoryFieldLabel(columnName: string): string {
  return FACTORY_FIELD_LABELS[columnName] ?? columnName;
}
