/**
 * 누락된 생산품목·의류 카테고리·장비 필드를 업장별로 다양하게 보강
 *
 * 사용:
 *   node scripts/fillMissingFactoryCategories.js --dry-run
 *   node scripts/fillMissingFactoryCategories.js --apply
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const REPORT_PATH = path.join(__dirname, "output/factory-category-fill-report.json");

/** 업장 성향별 프로필 — 서로 다른 조합 */
const PROFILES = [
  {
    factory_type: "봉제",
    main_fabrics: "다이마루",
    business_type: "임가공 전문(CMT)",
    distribution: "CMT",
    top_items_upper: "맨투맨/스웨트, 후드 티셔츠, 긴소매 티셔츠",
    top_items_lower: "코튼 팬츠, 트레이닝/조거 팬츠",
    top_items_outer: "후드 집업, 카디건",
    top_items_dress_skirt: "",
    top_items_sports_leisure: "스포츠 상의",
    sewing_machines: "사절본봉기, 오버로크, 니혼오버",
    pattern_machines: "재단기, 재단판, 바쿰다이",
    special_machines: "",
    special_tech: "다이마루 상·하의 임가공 전문",
  },
  {
    factory_type: "봉제",
    main_fabrics: "직기",
    business_type: "브랜드 전문(완사입)",
    distribution: "완사입",
    top_items_upper: "셔츠/블라우스, 피케/카라 티셔츠",
    top_items_lower: "슈트 팬츠/슬랙스, 코튼 팬츠",
    top_items_outer: "슈트/블레이저 재킷, 환절기 코트",
    top_items_dress_skirt: "스커트",
    top_items_fashion_accessory: "유니폼",
    sewing_machines: "쌍침기, 사절본봉기, 오버로크, 인타로크",
    pattern_machines: "재단기, 재단판, 아이롱, 실와인더",
    special_machines: "단추달이",
    special_tech: "남성 정장·셔츠 위주 직기 전문",
  },
  {
    factory_type: "봉제",
    main_fabrics: "다이마루",
    business_type: "임가공 전문(CMT)",
    distribution: "CMT",
    top_items_upper: "니트/스웨터, 맨투맨/스웨트",
    top_items_lower: "레깅스, 코튼 팬츠",
    top_items_outer: "카디건, 플리스/뽀글이",
    top_items_dress_skirt: "",
    top_items_underwear: "이너웨어",
    sewing_machines: "오버로크, 사절본봉기, 컴퓨터재봉기",
    pattern_machines: "재단기, 연단기",
    special_machines: "",
    special_tech: "니트·편물 상의 전문",
  },
  {
    factory_type: "봉제",
    main_fabrics: "토탈",
    business_type: "양산",
    distribution: "완사입",
    top_items_upper: "반소매 티셔츠, 민소매 티셔츠, 후드 티셔츠",
    top_items_lower: "데님 팬츠, 숏 팬츠",
    top_items_outer: "트러커 재킷, 블루종/MA-1",
    top_items_dress_skirt: "원피스",
    top_items_bag: "가방/잡화",
    sewing_machines: "사절본봉기, 사절삼봉, 오버로크, 가이루퍼",
    pattern_machines: "재단기, 재단판, 패턴판",
    special_machines: "지그재그",
    special_tech: "여성복 토탈 생산 가능",
  },
  {
    factory_type: "봉제",
    main_fabrics: "다이마루",
    business_type: "미니오더",
    distribution: "CMT",
    top_items_upper: "후드 티셔츠, 맨투맨/스웨트, 반소매 티셔츠",
    top_items_lower: "트레이닝/조거 팬츠, 숏 팬츠",
    top_items_outer: "아노락 재킷, 트레이닝 재킷",
    top_items_sports_leisure: "요가복, 스포츠 하의",
    sewing_machines: "오버로크, 니혼오버, 사절본봉기",
    pattern_machines: "재단기, 바쿰다이",
    special_machines: "",
    special_tech: "소량·스포츠웨어 대응",
  },
  {
    factory_type: "봉제",
    main_fabrics: "직기",
    business_type: "임가공 전문(CMT)",
    distribution: "CMT",
    top_items_upper: "셔츠/블라우스, 긴소매 티셔츠",
    top_items_lower: "데님 팬츠, 슈트 팬츠/슬랙스",
    top_items_outer: "겨울 싱글 코트, 재킷",
    top_items_dress_skirt: "원피스, 스커트",
    top_items_fashion_accessory: "단체복",
    sewing_machines: "쌍침기, 오버로크, 인타로크, 니혼바리",
    pattern_machines: "재단기, 재단판, 아이롱",
    special_machines: "바텍",
    special_tech: "원피스·셔츠 혼합 생산",
  },
  {
    factory_type: "샘플",
    main_fabrics: "토탈",
    business_type: "샘플 제작",
    distribution: "샘플",
    top_items_upper: "셔츠/블라우스, 맨투맨/스웨트",
    top_items_lower: "코튼 팬츠, 데님 팬츠",
    top_items_outer: "카디건, 슈트/블레이저 재킷",
    top_items_dress_skirt: "원피스",
    sewing_machines: "사절본봉기, 쌍침기, 오버로크",
    pattern_machines: "재단기, CAD 패턴 입력기, 패턴 출력기",
    special_machines: "",
    special_tech: "패턴·샘플 제작 전문",
  },
  {
    factory_type: "패턴",
    main_fabrics: "토탈",
    business_type: "수패턴",
    distribution: "패턴",
    top_items_upper: "셔츠/블라우스, 피케/카라 티셔츠",
    top_items_lower: "슈트 팬츠/슬랙스",
    top_items_outer: "슈트/블레이저 재킷",
    top_items_dress_skirt: "스커트",
    sewing_machines: "사절본봉기, 쌍침기",
    pattern_machines: "재단기, 재단판, CAD 패턴 입력기, 패턴 출력기, 마카 출력기",
    special_machines: "",
    special_tech: "패턴·그레이딩 전문",
  },
  {
    factory_type: "봉제",
    main_fabrics: "다이마루",
    business_type: "브랜드 전문(완사입)",
    distribution: "완사입",
    top_items_upper: "맨투맨/스웨트, 니트/스웨터",
    top_items_lower: "코튼 팬츠, 트레이닝/조거 팬츠",
    top_items_outer: "롱패딩/헤비 아우터, 숏패딩/헤비 아우터",
    top_items_dress_skirt: "",
    top_items_sports_leisure: "등산복",
    sewing_machines: "사절본봉기, 사절삼봉, 오버로크, 니혼오버, 가이루퍼",
    pattern_machines: "재단기, 재단판",
    special_machines: "에어스냅기",
    special_tech: "패딩·다이마루 아우터 전문",
  },
  {
    factory_type: "나염",
    main_fabrics: "토탈",
    business_type: "나염/전사/자수업",
    distribution: "임가공",
    top_items_upper: "반소매 티셔츠, 기본티",
    top_items_lower: "코튼 팬츠",
    top_items_outer: "",
    top_items_fashion_accessory: "유니폼, 단체복",
    sewing_machines: "오버로크, 사절본봉기",
    pattern_machines: "재단기",
    special_machines: "나나인치",
    special_tech: "나염·전사 후가공 가능",
  },
  {
    factory_type: "봉제",
    main_fabrics: "기타",
    business_type: "임가공 전문(CMT)",
    distribution: "CMT",
    top_items_upper: "셔츠/블라우스, 반소매 티셔츠",
    top_items_lower: "데님 팬츠, 숏 팬츠, 점프 슈트/오버올",
    top_items_outer: "트러커 재킷, 레더/라이더스 재킷",
    top_items_dress_skirt: "스커트",
    sewing_machines: "사절본봉기, 오버로크, 니혼바리, 스쿠이",
    pattern_machines: "재단기, 재단판, 해사기",
    special_machines: "벨트고리기",
    special_tech: "데님·캐주얼 하의 전문",
  },
  {
    factory_type: "봉제",
    main_fabrics: "기타",
    business_type: "임가공 전문(CMT)",
    distribution: "CMT",
    top_items_upper: "기타 상의, 스포츠 상의",
    top_items_lower: "기타 바지, 스포츠 하의",
    top_items_outer: "기타 아우터",
    top_items_dress_skirt: "원피스",
    top_items_pet: "반려동물 의류",
    top_items_fashion_accessory: "유아동복",
    sewing_machines: "사절본봉기, 오버로크, 컴퓨터재봉기",
    pattern_machines: "재단기, 재단판",
    special_machines: "체인",
    special_tech: "유아동·반려동물 의류 대응",
  },
];

const FILL_FIELDS = [
  "factory_type",
  "main_fabrics",
  "business_type",
  "distribution",
  "top_items_upper",
  "top_items_lower",
  "top_items_outer",
  "top_items_dress_skirt",
  "top_items_bag",
  "top_items_sports_leisure",
  "top_items_pet",
  "top_items_fashion_accessory",
  "top_items_underwear",
  "sewing_machines",
  "pattern_machines",
  "special_machines",
  "special_tech",
  "equipment",
];

function parseArgs() {
  return { apply: process.argv.includes("--apply") };
}

function isEmpty(value) {
  return value == null || String(value).trim() === "";
}

function hashSeed(id, name) {
  const s = `${id}:${name || ""}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pickProfile(factory) {
  const seed = hashSeed(factory.id, factory.company_name);
  const idx = seed % PROFILES.length;
  const alt = (seed >> 3) % PROFILES.length;
  const base = { ...PROFILES[idx] };

  // 같은 프로필만 반복되지 않도록 일부 카테고리는 보조 프로필에서 교차
  if (seed % 5 === 0 && PROFILES[alt]?.top_items_outer && isEmpty(factory.top_items_outer)) {
    base.top_items_outer = PROFILES[alt].top_items_outer;
  }
  if (seed % 7 === 0 && PROFILES[alt]?.top_items_dress_skirt) {
    base.top_items_dress_skirt = PROFILES[alt].top_items_dress_skirt;
  }
  if (seed % 4 === 0 && PROFILES[alt]?.top_items_sports_leisure) {
    base.top_items_sports_leisure = PROFILES[alt].top_items_sports_leisure;
  }

  return base;
}

function buildEquipment(sewing, pattern, special) {
  const parts = [];
  for (const name of String(sewing || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    parts.push(`재봉 기계·${name}`);
  }
  for (const name of String(pattern || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    parts.push(`패턴/재단 기계·${name}`);
  }
  for (const name of String(special || "").split(",").map((s) => s.trim()).filter(Boolean)) {
    parts.push(`특수 기계·${name}`);
  }
  return parts.join("|");
}

function needsCategoryFill(factory) {
  const categoryFields = [
    "factory_type",
    "main_fabrics",
    "top_items_upper",
    "top_items_lower",
    "top_items_outer",
    "sewing_machines",
    "pattern_machines",
    "equipment",
  ];
  return categoryFields.some((f) => isEmpty(factory[f]));
}

function buildPatch(factory) {
  const profile = pickProfile(factory);
  const patch = {};

  for (const field of FILL_FIELDS) {
    if (field === "equipment") continue;
    if (!isEmpty(factory[field])) continue;
    const value = profile[field];
    if (value && String(value).trim()) patch[field] = value;
  }

  if (isEmpty(factory.equipment)) {
    const sewing = patch.sewing_machines || factory.sewing_machines || "";
    const pattern = patch.pattern_machines || factory.pattern_machines || "";
    const special = patch.special_machines || factory.special_machines || "";
    const equipment = buildEquipment(sewing, pattern, special);
    if (equipment) patch.equipment = equipment;
  }

  return patch;
}

async function fetchAllFactories() {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  while (true) {
    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

async function main() {
  const { apply } = parseArgs();
  console.log(apply ? "🚀 DB 반영 모드" : "🔍 dry-run 모드 (--apply 로 실제 반영)");

  const factories = await fetchAllFactories();
  const targets = factories.filter(needsCategoryFill);
  console.log(`전체 ${factories.length}건 · 보강 대상 ${targets.length}건`);

  const report = [];
  let updated = 0;

  for (const factory of targets) {
    const patch = buildPatch(factory);
    if (Object.keys(patch).length === 0) continue;

    report.push({
      id: factory.id,
      company_name: factory.company_name,
      filled: Object.keys(patch),
      patch,
    });

    if (apply) {
      const { error } = await supabase.from("donggori").update(patch).eq("id", factory.id);
      if (error) {
        console.error(`❌ ${factory.company_name} (#${factory.id}):`, error.message);
        process.exit(1);
      }
      updated++;
      if (updated % 25 === 0) console.log(`  ... ${updated}건 반영`);
    }
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  const profileUsage = {};
  for (const row of report) {
    const key = row.patch.factory_type || row.patch.main_fabrics || "mixed";
    profileUsage[key] = (profileUsage[key] || 0) + 1;
  }

  console.log(`\n✅ 완료: ${apply ? `${updated}건 DB 반영` : `${report.length}건 보강 예정`}`);
  console.log(`   리포트: ${REPORT_PATH}`);
  console.log("   프로필 분포:", profileUsage);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
