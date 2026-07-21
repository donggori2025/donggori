/**
 * Supabase donggori 업장 목록 → 엑셀보내기 (빈 필드 보강)
 * 사용: node scripts/exportFactoriesToXlsx.js [출력경로.xlsx]
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

function formatPhone(phone) {
  if (phone == null || phone === "") return "";
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return String(phone).trim();
  if (digits.length === 11) return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  if (digits.length === 10) return digits.replace(/(\d{2,3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  return digits;
}

function firstNonEmpty(...values) {
  for (const v of values) {
    if (v == null) continue;
    const s = typeof v === "string" ? v.trim() : v;
    if (s !== "" && s !== 0) return v;
    if (s === 0) return v;
  }
  return "";
}

function joinItems(parts) {
  return parts.filter((p) => p && String(p).trim()).join(", ");
}

function buildTopItemsSummary(row) {
  return joinItems([
    row.top_items_upper,
    row.top_items_lower,
    row.top_items_outer,
    row.top_items_dress_skirt,
    row.top_items_bag,
    row.top_items_sports_leisure,
    row.top_items_pet,
    row.top_items_fashion_accessory,
    row.top_items_underwear,
  ]);
}

function parseFactoryImageMapping() {
  const filePath = path.join(__dirname, "../lib/factoryImages.ts");
  const content = fs.readFileSync(filePath, "utf8");
  const companyToFolder = {};
  const folderFiles = {};

  const mappingBlock = content.match(/const factoryImageMapping[^=]*=\s*\{([\s\S]*?)\};/);
  if (mappingBlock) {
    const re = /'([^']+)':\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(mappingBlock[1]))) companyToFolder[m[1]] = m[2];
  }

  const filesBlock = content.match(/const allImageFiles[^=]*=\s*\{([\s\S]*?)\n  \};/);
  if (filesBlock) {
    const entryRe = /'([^']+)':\s*\[([^\]]*)\]/g;
    let m;
    while ((m = entryRe.exec(filesBlock[1]))) {
      const files = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
      folderFiles[m[1]] = files;
    }
  }

  return { companyToFolder, folderFiles };
}

function listLocalPhotoFolders() {
  const baseCandidates = [
    path.join(__dirname, "../public/동고리_사진데이터"),
    path.join(__dirname, "../public/동고리_사진데이터"),
  ];
  const folders = {};
  for (const base of baseCandidates) {
    if (!fs.existsSync(base)) continue;
    for (const name of fs.readdirSync(base)) {
      const full = path.join(base, name);
      if (!fs.statSync(full).isDirectory()) continue;
      const files = fs.readdirSync(full).filter((f) => /\.(jpg|jpeg|png|gif)$/i.test(f));
      if (!folders[name] || files.length > (folders[name].files?.length || 0)) {
        folders[name] = { path: full, files };
      }
    }
  }
  return folders;
}

function loadSupplementalXlsx() {
  const supplemental = new Map();
  const sources = [
    path.join(process.env.HOME || "", "Downloads/[동고리]신규명단최종합본_260622.xlsx"),
    path.join(process.env.HOME || "", "Downloads/[동고리] 봉제공장 데이터_260505.xlsx"),
    path.join(process.env.HOME || "", "Downloads/[동고리]봉제공장DB_251219 (1).xlsx"),
  ];

  for (const filePath of sources) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const wb = XLSX.readFile(filePath);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      for (const row of rows) {
        const name = String(row["공장명"] || row.company_name || "").trim();
        if (!name) continue;
        const key = normalizeCompanyName(name);
        const prev = supplemental.get(key) || {};
        supplemental.set(key, {
          ...prev,
          company_name: name,
          contact_name: firstNonEmpty(row.contact_name, row["대표자 성함"], prev.contact_name),
          phone_number: firstNonEmpty(row.phone_number, row["연락처"], prev.phone_number),
          email: firstNonEmpty(row.email, row["이메일"], prev.email),
          address: firstNonEmpty(row.address, row["주소 및 행정동"], prev.address),
          admin_district: firstNonEmpty(row.admin_district, prev.admin_district),
          intro: firstNonEmpty(row.intro, row["공장 한줄 소개"], prev.intro),
          established_year: firstNonEmpty(row.established_year, row["설립연도(업력)"], prev.established_year),
          employees: firstNonEmpty(row.employees, row["종사자 수"], prev.employees),
          moq: firstNonEmpty(row.moq, row.MOQ, prev.moq),
          monthly_capacity: firstNonEmpty(row.monthly_capacity, row.CAPA, prev.monthly_capacity),
          brands_supplied: firstNonEmpty(row.brands_supplied, row["작업 진행했던 브랜드"], prev.brands_supplied),
          factory_type: firstNonEmpty(row.factory_type, prev.factory_type),
          business_type: firstNonEmpty(row.business_type, prev.business_type),
          main_fabrics: firstNonEmpty(row.main_fabrics, prev.main_fabrics),
          distribution: firstNonEmpty(row.distribution, prev.distribution),
        });
      }
      console.log(`📎 보조 데이터: ${path.basename(filePath)} (${rows.length}행)`);
    } catch (e) {
      console.warn(`⚠️ 보조 파일 읽기 실패: ${filePath}`, e.message);
    }
  }

  return supplemental;
}

function resolveImages(companyName, imageMeta, localFolders) {
  const folder = imageMeta.companyToFolder[companyName];
  if (!folder) {
    const alt = Object.entries(imageMeta.companyToFolder).find(
      ([name]) => normalizeCompanyName(name) === normalizeCompanyName(companyName)
    );
    if (!alt) return { hasImages: "N", count: 0, folder: "" };
    return resolveImages(alt[0], imageMeta, localFolders);
  }

  const listed = imageMeta.folderFiles[folder]?.length || 0;
  const local = localFolders[folder]?.files?.length || 0;
  const count = Math.max(listed, local);
  return { hasImages: count > 0 ? "Y" : "N", count, folder };
}

function enrichFactory(factory, ctx) {
  const key = normalizeCompanyName(factory.company_name);
  const sup = ctx.supplemental.get(key) || {};

  const merged = {
    ...factory,
    contact_name: firstNonEmpty(factory.contact_name, sup.contact_name),
    phone_number: firstNonEmpty(factory.phone_number, sup.phone_number),
    email: firstNonEmpty(factory.email, sup.email),
    address: firstNonEmpty(factory.address, sup.address),
    admin_district: firstNonEmpty(
      factory.admin_district,
      sup.admin_district,
      extractAdminDistrict(factory.address),
      extractAdminDistrict(sup.address)
    ),
    intro: firstNonEmpty(factory.intro, sup.intro),
    established_year: firstNonEmpty(factory.established_year, sup.established_year),
    employees: firstNonEmpty(factory.employees, sup.employees),
    moq: firstNonEmpty(factory.moq, sup.moq),
    monthly_capacity: firstNonEmpty(factory.monthly_capacity, sup.monthly_capacity),
    brands_supplied: firstNonEmpty(factory.brands_supplied, sup.brands_supplied),
    factory_type: firstNonEmpty(factory.factory_type, sup.factory_type),
    business_type: firstNonEmpty(factory.business_type, sup.business_type),
    main_fabrics: firstNonEmpty(factory.main_fabrics, sup.main_fabrics),
    distribution: firstNonEmpty(factory.distribution, sup.distribution),
  };

  merged.address = formatAddress(merged.address);
  if (!merged.admin_district && merged.address) {
    merged.admin_district = extractAdminDistrict(merged.address) || "";
  }

  const hasCoords =
    factory.lat != null &&
    factory.lng != null &&
    String(factory.lat).trim() !== "" &&
    String(factory.lng).trim() !== "";
  merged.lat = hasCoords ? Number(factory.lat) : "";
  merged.lng = hasCoords ? Number(factory.lng) : "";

  const images = resolveImages(merged.company_name, ctx.imageMeta, ctx.localFolders);
  merged._hasImages = images.hasImages;
  merged._imageCount = images.count;
  merged._imageFolder = images.folder;

  merged.intro = firstNonEmpty(factory.intro, sup.intro) || "";

  return {
    ID: merged.id,
    공장명: merged.company_name || "",
    "대표자 성함": merged.contact_name || "",
    연락처: formatPhone(merged.phone_number),
    이메일: merged.email || "",
    "주소 및 행정동": merged.address || "",
    행정동: merged.admin_district || "",
    "공장 한줄 소개": merged.intro || "",
    "설립연도(업력)": merged.established_year || "",
    "종사자 수": merged.employees ?? "",
    공장유형: merged.factory_type || "",
    사업유형: merged.business_type || "",
    주요원단: merged.main_fabrics || "",
    거래유형: merged.distribution || "",
    MOQ: merged.moq ?? "",
    CAPA: merged.monthly_capacity ?? "",
    "작업 진행했던 브랜드": merged.brands_supplied || "",
    "주요 생산품목(통합)": buildTopItemsSummary(merged),
    상의: merged.top_items_upper || "",
    하의: merged.top_items_lower || "",
    아우터: merged.top_items_outer || "",
    "원피스/스커트": merged.top_items_dress_skirt || "",
    가방잡화: merged.top_items_bag || "",
    스포츠레저: merged.top_items_sports_leisure || "",
    반려동물: merged.top_items_pet || "",
    패션잡화: merged.top_items_fashion_accessory || "",
    속옷: merged.top_items_underwear || "",
    장비: merged.equipment || "",
    재봉틀: merged.sewing_machines || "",
    패턴기: merged.pattern_machines || "",
    특수기계: merged.special_machines || "",
    특수기술: merged.special_tech || "",
    배송: merged.delivery || "",
    위도: merged.lat,
    경도: merged.lng,
    "이미지 보유": merged._hasImages,
    "이미지 수": merged._imageCount,
    "이미지 폴더": merged._imageFolder || "",
    "DB 이미지 URL": merged.image || "",
    카카오URL: merged.kakao_url || "",
  };
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
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const defaultOut = path.join(__dirname, `../동고리_업장목록_${date}.xlsx`);
  const outPath = process.argv[2] ? path.resolve(process.argv[2]) : defaultOut;

  console.log("📥 DB 업장 조회 중...");
  const factories = await fetchAllFactories();
  console.log(`   ${factories.length}건`);

  const ctx = {
    supplemental: loadSupplementalXlsx(),
    imageMeta: parseFactoryImageMapping(),
    localFolders: listLocalPhotoFolders(),
  };

  const rows = factories
    .sort((a, b) => Number(a.id) - Number(b.id))
    .map((f) => enrichFactory(f, ctx));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "업장목록");

  const colWidths = Object.keys(rows[0] || {}).map((key) => ({
    wch: Math.min(48, Math.max(key.length + 2, 12)),
  }));
  ws["!cols"] = colWidths;

  XLSX.writeFile(wb, outPath);

  const filled = {
    address: rows.filter((r) => r["주소 및 행정동"]).length,
    phone: rows.filter((r) => r.연락처).length,
    intro: rows.filter((r) => r["공장 한줄 소개"]).length,
    coord: rows.filter((r) => r.위도 && r.경도).length,
    images: rows.filter((r) => r["이미지 보유"] === "Y").length,
  };

  console.log("\n✅ 엑셀 저장 완료");
  console.log(`   경로: ${outPath}`);
  console.log(`   총 ${rows.length}건`);
  console.log(`   주소 ${filled.address} · 연락처 ${filled.phone} · 소개 ${filled.intro} · 좌표 ${filled.coord} · 이미지 ${filled.images}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
