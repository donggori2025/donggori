/**
 * 신규 업장 엑셀 → Supabase donggori 테이블 등록/갱신
 * 사용: node scripts/importFactoriesFromXlsx.js "/path/to/file.xlsx"
 */
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
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

function normalizeCompanyName(name) {
  return String(name || "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase()
    .trim();
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function phoneToDbValue(phone) {
  const raw = String(phone || "").split(/[/,]/)[0].trim();
  const digits = normalizePhone(raw);
  if (!digits) return null;
  const num = Number(digits);
  return Number.isFinite(num) ? num : null;
}

function extractAdminDistrict(address) {
  const addr = String(address || "");
  const dongMatch = addr.match(
    /(용두|장안|답십리|전농|이문|제기|신설|외대|휘경|용답|황학|회기|청량리|답십리2|이문2|장안1|장안2|용두1)(?:\d+)?동/
  );
  if (dongMatch) {
    const raw = dongMatch[0];
    if (raw.includes("답십리2")) return "답십리2동";
    if (raw.includes("이문2")) return "이문2동";
    if (raw.includes("장안1")) return "장안1동";
    if (raw.includes("장안2")) return "장안2동";
    if (raw.includes("용두1")) return "용두1동";
    if (/동$/.test(raw)) return raw;
    return `${raw}동`;
  }
  if (addr.includes("동대문구")) {
    const m = addr.match(/동대문구\s*([^\s,]+동)/);
    if (m) return m[1];
  }
  return null;
}

function formatAddress(address) {
  const raw = String(address || "").trim();
  if (!raw) return "";
  if (raw.includes("서울")) return raw;
  return `서울특별시 동대문구 ${raw}`;
}

function isChecked(value) {
  const v = String(value || "").trim();
  return v === "✓" || v === "O" || v === "o" || v.toLowerCase() === "y";
}

function collectChecked(row, prefix) {
  return Object.entries(row)
    .filter(([key, value]) => key.startsWith(prefix) && isChecked(value))
    .map(([key]) => key.replace(prefix, "").trim())
    .filter(Boolean);
}

function parseNumberish(value) {
  const raw = String(value ?? "").trim();
  if (!raw || /불명|판독|모름|없음/i.test(raw)) return null;
  const digits = raw.replace(/,/g, "").match(/\d+/);
  if (!digits) return null;
  const num = Number(digits[0]);
  return Number.isFinite(num) ? num : null;
}

function joinTopItems(parts) {
  return parts.filter(Boolean).join(", ") || null;
}

function mapFactoryType(types) {
  if (types.length === 0) return "봉제";
  const joined = types.join(",");
  if (joined.includes("나염") || joined.includes("전사") || joined.includes("자수")) return "나염";
  if (joined.includes("패턴")) return "패턴";
  if (joined.includes("샘플")) return "샘플";
  if (joined.includes("QC") || joined.includes("포장")) return "QC";
  if (joined.includes("시아게") || joined.includes("완성")) return "시야게";
  return "봉제";
}

function mapMainFabrics(fabrics) {
  if (fabrics.length === 0) return null;
  if (fabrics.some((f) => f.includes("다이마루"))) return "다이마루";
  if (fabrics.some((f) => f.includes("니트") || f.includes("편물"))) return "니트";
  if (fabrics.some((f) => f.includes("직물") || f.includes("우븐"))) return "직기";
  if (fabrics.some((f) => f.includes("데님"))) return "데님";
  return "토탈";
}

function rowToFactory(row) {
  const companyName = String(row["공장명"] || "").replace(/\s+/g, " ").trim();
  if (!companyName) return null;

  const factoryTypes = collectChecked(row, "공장유형_");
  const processes = collectChecked(row, "제공작업_");
  const fabrics = collectChecked(row, "작업원단_");
  const distributions = collectChecked(row, "거래유형_");

  const topUpper = joinTopItems([
    isChecked(row["여성_상의"]) ? "여성 상의" : "",
    isChecked(row["여성_블라우스"]) ? "블라우스" : "",
    isChecked(row["남성_상의"]) ? "남성 상의" : "",
    isChecked(row["남성_셔츠"]) ? "셔츠" : "",
    isChecked(row["특수_기본티"]) ? "기본티" : "",
  ]);

  const topLower = joinTopItems([
    isChecked(row["여성_하의"]) ? "여성 하의" : "",
    isChecked(row["남성_하의"]) ? "남성 하의" : "",
    isChecked(row["남성_팬츠"]) ? "팬츠" : "",
  ]);

  const topOuter = joinTopItems([
    isChecked(row["아우터_코트"]) ? "코트" : "",
    isChecked(row["아우터_패딩"]) ? "패딩" : "",
    isChecked(row["아우터_재킷"]) ? "재킷" : "",
    isChecked(row["아우터_점퍼"]) ? "점퍼" : "",
    isChecked(row["아우터_기타"]) ? "아우터 기타" : "",
  ]);

  const topDress = joinTopItems([
    isChecked(row["여성_원피스"]) ? "원피스" : "",
    isChecked(row["여성_스커트"]) ? "스커트" : "",
  ]);

  const topBag = isChecked(row["특수_잡화(가방 등)"]) ? "가방/잡화" : null;
  const topSports = joinTopItems([
    isChecked(row["기능성_요가복"]) ? "요가복" : "",
    isChecked(row["기능성_등산복"]) ? "등산복" : "",
    isChecked(row["기능성_수영복"]) ? "수영복" : "",
    isChecked(row["기능성_기타"]) ? "기능성 의류" : "",
  ]);
  const topPet = isChecked(row["특수_반려동물 의류"]) ? "반려동물 의류" : null;
  const topAccessory = joinTopItems([
    isChecked(row["특수_유니폼"]) ? "유니폼" : "",
    isChecked(row["특수_유아동복"]) ? "유아동복" : "",
    isChecked(row["특수_단체복"]) ? "단체복" : "",
    isChecked(row["특수_무대의상"]) ? "무대의상" : "",
  ]);

  const extraItems = String(row["기타 생산품목 직접입력"] || "").trim();
  const businessType = [...factoryTypes, ...processes].join(", ") || null;

  return {
    company_name: companyName,
    contact_name: String(row["대표자 성함"] || "").replace(/\s+/g, " ").trim() || null,
    phone_number: phoneToDbValue(row["연락처"]),
    email: String(row["이메일"] || "").trim() || null,
    address: formatAddress(row["주소 및 행정동"]),
    admin_district: extractAdminDistrict(row["주소 및 행정동"]),
    intro: String(row["공장 한줄 소개"] || "").trim() || null,
    established_year: String(row["설립연도(업력)"] || "").trim() || null,
    employees: parseNumberish(row["종사자 수"]),
    factory_type: mapFactoryType(factoryTypes),
    business_type: businessType,
    main_fabrics: mapMainFabrics(fabrics),
    distribution: distributions.join(", ") || null,
    brands_supplied: String(row["작업 진행했던 브랜드"] || "").trim() || null,
    moq: parseNumberish(row["MOQ"]),
    monthly_capacity: String(row["CAPA"] ?? "").trim() || null,
    top_items_upper: topUpper,
    top_items_lower: topLower,
    top_items_outer: topOuter,
    top_items_dress_skirt: topDress,
    top_items_bag: topBag,
    top_items_sports_leisure: topSports,
    top_items_pet: topPet,
    top_items_fashion_accessory: topAccessory || (extraItems ? extraItems : null),
  };
}

function parseXlsx(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows.map(rowToFactory).filter(Boolean);
}

async function fetchExistingFactories() {
  const { data, error } = await supabase
    .from("donggori")
    .select("id, company_name, phone_number, address");
  if (error) throw error;
  return data || [];
}

function findExistingMatch(factory, existing) {
  const target = normalizeCompanyName(factory.company_name);
  const exact = existing.filter((f) => normalizeCompanyName(f.company_name) === target);
  if (exact.length === 0) return null;
  if (exact.length === 1) return exact[0];

  const byExactLabel = exact.find((f) => f.company_name === factory.company_name);
  if (byExactLabel) return byExactLabel;

  return exact.sort((a, b) => String(a.company_name).length - String(b.company_name).length)[0];
}

async function main() {
  const xlsxPath =
    process.argv[2] ||
    path.join(process.env.HOME || "", "Downloads/[동고리]신규명단최종합본_260622.xlsx");

  if (!fs.existsSync(xlsxPath)) {
    console.error("엑셀 파일을 찾을 수 없습니다:", xlsxPath);
    process.exit(1);
  }

  console.log("📄 XLSX:", xlsxPath);
  const parsed = parseXlsx(xlsxPath);
  console.log(`파싱: ${parsed.length}건`);

  const existing = await fetchExistingFactories();
  const maxId = existing.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0);

  const toInsert = [];
  const toUpdate = [];
  const skipped = [];

  const seenNames = new Set();
  for (const factory of parsed) {
    const nameKey = normalizeCompanyName(factory.company_name);
    if (seenNames.has(nameKey)) {
      skipped.push({ factory, reason: "엑셀 내 상호명 중복" });
      continue;
    }
    seenNames.add(nameKey);

    const match = findExistingMatch(factory, existing);
    if (match) {
      toUpdate.push({ id: match.id, factory });
    } else {
      toInsert.push(factory);
    }
  }

  console.log(`신규 등록: ${toInsert.length}건`);
  console.log(`기존 갱신: ${toUpdate.length}건`);
  if (skipped.length) console.log(`제외: ${skipped.length}건`);

  let inserted = 0;
  for (let i = 0; i < toInsert.length; i++) {
    const payload = { id: maxId + i + 1, ...toInsert[i] };
    const { error } = await supabase.from("donggori").insert(payload);
    if (error) {
      console.error("INSERT 실패:", error.message, payload.company_name);
      process.exit(1);
    }
    inserted++;
    console.log(`  + 등록: ${payload.company_name} (#${payload.id})`);
  }

  let updated = 0;
  for (const { id, factory } of toUpdate) {
    const { error } = await supabase.from("donggori").update(factory).eq("id", id);
    if (error) {
      console.error("UPDATE 실패:", error.message, factory.company_name);
      process.exit(1);
    }
    updated++;
    console.log(`  ↻ 갱신: ${factory.company_name} (#${id})`);
  }

  const { count } = await supabase.from("donggori").select("id", { count: "exact", head: true });
  console.log(`\n✅ 완료: 신규 ${inserted}건, 갱신 ${updated}건`);
  console.log(`📊 DB 총 업장 수: ${count ?? "?"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
