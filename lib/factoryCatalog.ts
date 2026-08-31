export interface Factory {
  id: string;
  name: string;
  ownerUserId: string;
  region: string;
  items: string[];
  minOrder: number;
  description: string;
  image: string;
  images?: string[];
  contact: string;
  lat: number;
  lng: number;
  kakaoUrl: string;
  processes: string[];
  business_type?: string;
  equipment?: string;
  sewing_machines?: string;
  pattern_machines?: string;
  special_machines?: string;
  top_items_upper?: string;
  top_items_lower?: string;
  top_items_outer?: string;
  top_items_dress_skirt?: string;
  top_items_bag?: string;
  top_items_fashion_accessory?: string;
  top_items_underwear?: string;
  top_items_sports_leisure?: string;
  top_items_pet?: string;
  moq?: number;
  monthly_capacity?: number;
  admin_district?: string;
  intro?: string;
  phone_number?: string;
  factory_type?: string;
  main_fabrics?: string;
  distribution?: string;
  delivery?: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  address?: string;
  established_year?: number;
  brands_supplied?: string;
  [key: string]: string | number | string[] | undefined;
}

export function isSelectableRegion(region: string | undefined | null): boolean {
  const value = String(region ?? "").trim();
  return value.endsWith("동") && value !== "용신동";
}

export async function fetchFactoriesFromDB(): Promise<Factory[]> {
  try {
    const response = await fetch("/api/factories", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload?.data) ? (payload.data as Factory[]) : [];
  } catch {
    return [];
  }
}
