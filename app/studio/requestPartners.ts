import { requestQuantity } from "@/lib/presentationDemo";
import { productionItems, type Factory } from "@/lib/factoryCatalog";
import { getFactoryImages } from "@/lib/factoryImages";
import { getMoqValue, recommendFactoriesFromPrompt } from "@/lib/factoryMatching";
import sampleProfiles from "./sampleProfiles.json";
import { partners, type Partner } from "./case";

function requestedItems(factories: Factory[], request: string) {
  const text = request.replace(/\s+/g, "");
  const catalog = new Set(factories.flatMap(productionItems));
  const termsByItem = Array.from(catalog, item => {
    const names = item.split("/").map(name => name.trim());
    const terms = names.flatMap(name => [name.replace(/\s+/g, ""), name.split(/\s+/).at(-1) ?? ""]);
    return { item, terms: terms.filter(term => term.length >= 2 && text.includes(term)) };
  });
  // "반소매 티셔츠" takes precedence over the overlapping "티셔츠" and "셔츠".
  const mentioned = [...new Set(termsByItem.flatMap(row => row.terms))];
  const specific = new Set(mentioned.filter(term => !mentioned.some(other => other !== term && other.includes(term))));
  return new Set(termsByItem.filter(row => row.terms.some(term => specific.has(term))).map(row => row.item));
}

// Compare public profile details only within the shortlist the designer actually sees.
function profileDetails(factory: Factory) {
  const details = new Map<string, { highlight: string; ending: string; question: string }>();
  const intro = factory.intro ?? "";
  if (/샘플부터\s*(?:본)?생산까지/.test(intro)) {
    details.set("샘플", { highlight: "샘플부터 생산까지", ending: " 진행합니다", question: "이 조건으로 샘플을 먼저 만든 뒤 본생산까지 맡길 수 있을까요?" });
  }
  if (/패턴.{0,12}그레이딩/.test(intro) && /그레이딩.{0,6}(작업|요청이 주업무)/.test(intro)) {
    details.set("그레이딩", { highlight: "패턴과 사이즈별 그레이딩", ending: "을 다룹니다", question: "이번 의뢰의 패턴 제작과 사이즈별 그레이딩도 함께 맡길 수 있을까요?" });
  }
  for (const fabric of (factory.main_fabrics ?? "").split(/[,/·|]/).map(s => s.trim())) {
    if (fabric && !/^(기타|토탈|없음|미등록|-)$/u.test(fabric) && !/\d|최소|수량/.test(fabric)) {
      details.set(fabric, { highlight: `등록 원단은 ${fabric}`, ending: "입니다", question: `이 조건에 맞는 ${fabric} 원단을 추천해 주실 수 있을까요?` });
    }
  }
  for (const machine of (factory.equipment ?? "").split("|").map(entry => entry.split("·").at(-1)?.trim())) {
    if (machine && ["바텍", "체인", "지그재그", "단추달이", "에어스냅기", "CAD 패턴 입력기", "패턴 출력기"].includes(machine)) {
      details.set(machine, { highlight: `${machine} 장비`, ending: "를 갖추고 있습니다", question: `이번 작업에 ${machine} 장비를 활용할 공정이 있을까요?` });
    }
  }
  return details;
}

function publicProfile(factory: Factory) {
  const rows = [
    ["소재지", factory.admin_district || factory.region], ["업종", factory.factory_type], ["거래 방식", factory.business_type],
    ["주요 원단", factory.main_fabrics], ["제작 품목", productionItems(factory).join(", ") || factory.items.join(", ")],
    ["작업 공정", factory.processes.join(", ")], ["재봉 장비", factory.sewing_machines],
    ["패턴·마무리 장비", factory.pattern_machines], ["특수 장비", factory.special_machines],
    ["기타 보유 장비", factory.equipment?.split("|").map(entry => entry.split("·").at(-1)?.trim()).filter(name =>
      name && ![factory.sewing_machines, factory.pattern_machines, factory.special_machines].some(group => group?.split(",").some(part => part.trim() === name))
    ).join(", ")], ["납품처", factory.brands_supplied], ["유통 방식", factory.distribution],
    ["특수 기술", factory.special_tech], ["종사자 수", factory.employees], ["배송 방식", factory.delivery], ["설립 연도", factory.established_year], ["월 생산량", factory.monthly_capacity && `${factory.monthly_capacity.toLocaleString("ko-KR")}장`],
  ] as const;
  return rows.flatMap(([label, value]) => value ? [{ label, value: String(value) }] : []);
}

export function samplePartners(factories: Factory[]): Partner[] {
  return partners.map(partner => {
    const factory = factories.find(row => row.id === partner.id);
    if (!factory) return { ...partner, ...sampleProfiles.find(profile => profile.id === partner.id) };
    return { ...partner, about: factory.intro || partner.about, profile: publicProfile(factory) };
  });
}

export function requestPartners(factories: Factory[], request: string, sheetItem?: string, preference = ""): Partner[] {
  const quantity = requestQuantity(request);
  const items = sheetItem ? new Set([sheetItem]) : requestedItems(factories, request);
  const districts = new Set(factories.map(f => f.admin_district).filter(dong => dong && request.includes(dong)));
  const candidates = factories.filter(factory => {
    const minimum = getMoqValue(factory);
    return (!quantity || !minimum || minimum <= quantity)
      && (!districts.size || districts.has(factory.admin_district))
      && (!items.size || productionItems(factory).some(item => items.has(item)));
  });

  const rankingPrompt = sheetItem ? sheetItem + " " + request : request;
  const ranked = recommendFactoriesFromPrompt(candidates, rankingPrompt, candidates.length);
  const shortlist = ranked.map(factory => {
    const registered = productionItems(factory);
    const item = registered.find(item => items.has(item)) ?? registered.find(item =>
      factory.hitKeywords.some(keyword => item.includes(keyword))
    ) ?? registered[0];
    const exactItem = Boolean(item && items.has(item));
    const stars = exactItem ? 3 : item && factory.hitKeywords.some(keyword => item.includes(keyword)) ? 2 : 1;
    const matchesPreference = preference && [...profileDetails(factory).keys()].some(key => preference.includes(key));
    return { factory, item, stars, matchesPreference: Boolean(matchesPreference) };
  }).sort((a, b) => b.stars - a.stars || Number(b.matchesPreference) - Number(a.matchesPreference)).slice(0, 3);

  const profiles = shortlist.map(({ factory }) => profileDetails(factory));
  return shortlist.map(({ factory, item, stars }, index) => {
    const commonality = (key: string) => profiles.filter(profile => profile.has(key)).length;
    const detail = [...profiles[index]].sort(([a], [b]) =>
      Number(preference.includes(b)) - Number(preference.includes(a)) || Number(request.includes(b)) - Number(request.includes(a)) || commonality(a) - commonality(b)
    )[0]?.[1];
    const district = factory.admin_district || factory.region;
    const base = item ? `${item.replaceAll("/", "·")} 제작업체` : `${district} 제작업체`;
    const reason = detail ? `${base}로, ${detail.highlight}${detail.ending}.` : `${district} 지역에 등록된 ${item || "의류"} 제작업체입니다.`;
    return {
      id: factory.id, name: factory.company_name || factory.name, district: factory.admin_district || factory.region,
      item: item || factory.factory_type || "품목 상담 필요",
      stars,
      highlight: detail?.highlight ?? (item || district || "의류"),
      question: detail?.question ?? (item ? `${item.replaceAll("/", "·")} 제작 경험을 바탕으로 이번 의뢰도 진행해 주실 수 있을까요?` : `${district} 작업장에서 이 조건으로 제작이 가능할까요?`),
      profile: publicProfile(factory),
      reason, about: factory.intro || [factory.admin_district || factory.region, factory.factory_type].filter(Boolean).join(" · "),
      photos: getFactoryImages(factory),
    };
  });
}
