import type { Factory } from "./factoryCatalog";

export const EMPTY_FILTERS = {
  admin_district: [] as string[],
  moq: [] as string[],
  monthly_capacity: [] as string[],
  business_type: [] as string[],
  distribution: [] as string[],
  delivery: [] as string[],
  items: [] as string[],
  equipment: [] as string[],
  sewing_machines: [] as string[],
  pattern_machines: [] as string[],
  special_machines: [] as string[],
  factory_type: [] as string[],
  main_fabrics: [] as string[],
  processes: [] as string[],
};

export type DirectoryFilters = typeof EMPTY_FILTERS;

export const moqRanges = [
  { label: "0-50", min: 0, max: 50 },
  { label: "51-100", min: 51, max: 100 },
  { label: "101-300", min: 101, max: 300 },
  { label: "301+", min: 301, max: Infinity },
];
const monthlyCapacityRanges = [
  { label: "0-100", min: 0, max: 100 },
  { label: "101-300", min: 101, max: 300 },
  { label: "301-500", min: 301, max: 500 },
  { label: "501+", min: 501, max: Infinity },
];

export function filterDirectoryFactories<T extends Partial<Factory>>(factories: T[], selected: DirectoryFilters, search: string) {
  return factories.filter(f => {
    const itemList = [f.top_items_upper, f.top_items_lower, f.top_items_outer, f.top_items_dress_skirt, f.top_items_bag, f.top_items_fashion_accessory, f.top_items_underwear, f.top_items_sports_leisure, f.top_items_pet];
    const itemValues = itemList.flatMap((value) => typeof value === "string" ? value.split(/[,|]/).map((item) => item.trim()).filter(Boolean) : []);
    // 검색어 필터
    const searchMatch = !search ||
      (typeof f.company_name === 'string' && f.company_name.includes(search)) ||
      (typeof f.name === 'string' && f.name.includes(search)) ||
      (typeof f.intro === 'string' && f.intro.includes(search)) ||
      itemList.some(i => typeof i === 'string' && i && i.includes(search));
    // MOQ/월생산량 range 필터
    const moqValue = typeof f.moq === 'number' ? f.moq : (typeof f.moq === 'string' ? Number(f.moq) : undefined);
    const moqMatch = selected.moq.length === 0 || selected.moq.some(rangeLabel => {
      const range = moqRanges.find(r => r.label === rangeLabel);
      return range && typeof moqValue === 'number' && moqValue >= range.min && moqValue <= range.max;
    });
    const monthlyCapacityMatch = selected.monthly_capacity.length === 0 || selected.monthly_capacity.some(rangeLabel => {
      const range = monthlyCapacityRanges.find(r => r.label === rangeLabel);
      return range && typeof f.monthly_capacity === 'number' && f.monthly_capacity >= range.min && f.monthly_capacity <= range.max;
    });
    // business_type, distribution, delivery, equipment 분리 필터
    const businessTypeArr = f.business_type ? String(f.business_type).split(',').map((v: string) => v.trim()) : [];
    const distributionArr = f.distribution ? String(f.distribution).split(',').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    const deliveryArr = f.delivery ? String(f.delivery).split(',').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    const equipmentArr = f.equipment ? String(f.equipment).split('|').map((v: string) => v.trim()).filter((v): v is string => typeof v === 'string') : [];
    // 재봉기/패턴기/특수기 필터: 쉼표 분리 후 일부라도 포함되면 통과
    const sewingArr = typeof f.sewing_machines === 'string' ? f.sewing_machines.split(',').map(s => s.trim()) : [];
    const patternArr = typeof f.pattern_machines === 'string' ? f.pattern_machines.split(',').map(s => s.trim()) : [];
    const specialArr = typeof f.special_machines === 'string' ? f.special_machines.split(',').map(s => s.trim()) : [];
    const mainFabricsArr = typeof f.main_fabrics === 'string' ? f.main_fabrics.split(',').map(s => s.trim()).filter(Boolean) : [];
    const processesArr = Array.isArray(f.processes)
      ? f.processes.flatMap((value) => String(value).split(',').map((item) => item.trim()).filter(Boolean))
      : typeof f.processes === 'string'
        ? String(f.processes).split(',').map((item) => item.trim()).filter(Boolean)
        : [];
    return (
      searchMatch &&
      (selected.admin_district.length === 0 || (typeof f.admin_district === 'string' && selected.admin_district.includes(f.admin_district))) &&
      moqMatch &&
      monthlyCapacityMatch &&
      (selected.business_type.length === 0 || businessTypeArr.filter((v): v is string => typeof v === 'string').some(v => selected.business_type.includes(v))) &&
      (selected.distribution.length === 0 || distributionArr.filter((v): v is string => typeof v === 'string').some(v => selected.distribution.includes(v))) &&
      (selected.delivery.length === 0 || deliveryArr.filter((v): v is string => typeof v === 'string').some(v => selected.delivery.includes(v))) &&
      (selected.items.length === 0 || itemValues.some(i => selected.items.includes(i))) &&
      (selected.equipment.length === 0 || equipmentArr.filter((v): v is string => typeof v === 'string').some(v => selected.equipment.includes(v))) &&
      (selected.sewing_machines.length === 0 || sewingArr.some(v => selected.sewing_machines.includes(v))) &&
      (selected.pattern_machines.length === 0 || patternArr.some(v => selected.pattern_machines.includes(v))) &&
      (selected.special_machines.length === 0 || specialArr.some(v => selected.special_machines.includes(v))) &&
      (selected.factory_type.length === 0 || (typeof f.factory_type === 'string' && selected.factory_type.includes(f.factory_type))) &&
      (selected.main_fabrics.length === 0 || mainFabricsArr.some(value => selected.main_fabrics.includes(value))) &&
      (selected.processes.length === 0 || processesArr.some(value => selected.processes.includes(value)))
    );
  });
}

export function readDirectoryQuery(params: URLSearchParams) {
  const selected = { ...EMPTY_FILTERS };
  for (const key of Object.keys(selected) as (keyof DirectoryFilters)[]) {
    selected[key] = [...new Set(params.getAll(key === "admin_district" ? "district" : key).filter(Boolean))];
  }
  return { selected, search: params.get("q") || "" };
}

export function directoryHref(path: string, selected: DirectoryFilters, search: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("q", search.trim());
  for (const [key, values] of Object.entries(selected)) {
    for (const value of values) params.append(key === "admin_district" ? "district" : key, value);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
