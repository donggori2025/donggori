import type { Factory } from "./factoryCatalog";

export type MapFactory = Pick<Factory, "id" | "name" | "region" | "lat" | "lng"> & Partial<Factory>;

const filterColumns = [
  "admin_district", "intro", "factory_type", "moq", "monthly_capacity", "business_type",
  "distribution", "delivery", "main_fabrics", "processes", "equipment", "sewing_machines",
  "pattern_machines", "special_machines", "top_items_upper", "top_items_lower", "top_items_outer",
  "top_items_dress_skirt", "top_items_bag", "top_items_fashion_accessory", "top_items_underwear",
  "top_items_sports_leisure", "top_items_pet",
] as const;

// Send one cover and the searchable fields. Galleries belong on the factory detail page.
export function toMapFactory(factory: Factory): MapFactory {
  const row: MapFactory = {
    id: factory.id, name: factory.name, region: factory.region,
    lat: Math.round(factory.lat * 100) / 100 || 0, lng: Math.round(factory.lng * 100) / 100 || 0,
  };
  if (factory.company_name && factory.company_name !== factory.name) row.company_name = factory.company_name;
  if (factory.image && factory.image !== "/logo_donggori.png") row.image = factory.image;
  const fields = filterColumns.flatMap(key => {
    const value = factory[key];
    return value == null || value === "" || (Array.isArray(value) && !value.length) ? [] : [[key, value]];
  });
  return Object.assign(row, Object.fromEntries(fields));
}
