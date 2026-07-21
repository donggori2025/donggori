/**
 * 추가 업장 CSV → Supabase donggori 테이블 일괄 등록
 * 사용: node scripts/importFactoriesFromCsv.js "/path/to/file.csv"
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

function normalizeContactName(name) {
  return String(name || "").replace(/\s+/g, "").trim();
}

function phoneToDbValue(phone) {
  const digits = normalizePhone(phone);
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

function parseCsv(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const header = lines[0].replace(/^\uFEFF/, "").trim();
  const rows = [];

  // 업체명,연락처 형식 (폐원단 배출 명단 등)
  if (/업체명/.test(header) && /연락처/.test(header)) {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const comma = line.indexOf(",");
      if (comma < 0) continue;
      const companyName = line.slice(0, comma).trim();
      const phone = line.slice(comma + 1).trim();
      if (!companyName) continue;
      rows.push({
        seq: String(i),
        contact_name: null,
        phone_number: phoneToDbValue(phone),
        company_name: companyName.replace(/\s+/g, " ").trim(),
        address: null,
        admin_district: null,
      });
    }
    return rows;
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(",");
    if (parts.length < 4) continue;

    const [seq, contactName, phone, companyName, ...addressParts] = parts;
    const address = addressParts.join(",").trim();

    if (!String(companyName || "").trim()) continue;

    rows.push({
      seq: String(seq || "").trim(),
      contact_name: normalizeContactName(contactName),
      phone_number: phoneToDbValue(phone),
      company_name: String(companyName || "").replace(/\s+/g, " ").trim(),
      address: formatAddress(address),
      admin_district: extractAdminDistrict(address),
    });
  }

  return rows;
}

function dedupeRows(rows) {
  const seenName = new Set();
  const seenPhone = new Set();
  const unique = [];
  const skipped = [];

  for (const row of rows) {
    const nameKey = normalizeCompanyName(row.company_name);
    const phoneKey = normalizePhone(row.phone_number);

    if (!nameKey) {
      skipped.push({ row, reason: "상호명 없음" });
      continue;
    }

    if (seenName.has(nameKey)) {
      skipped.push({ row, reason: "CSV 내 상호명 중복" });
      continue;
    }

    if (phoneKey && seenPhone.has(phoneKey)) {
      skipped.push({ row, reason: "CSV 내 전화번호 중복" });
      continue;
    }

    seenName.add(nameKey);
    if (phoneKey) seenPhone.add(phoneKey);
    unique.push(row);
  }

  return { unique, skipped };
}

async function fetchExistingFactories() {
  const { data, error } = await supabase.from("donggori").select("id, company_name, phone_number, address");
  if (error) throw error;
  return data || [];
}

function filterAgainstExisting(rows, existing) {
  const existingNames = new Set(existing.map((f) => normalizeCompanyName(f.company_name)));
  const existingPhones = new Set(
    existing.map((f) => normalizePhone(f.phone_number)).filter(Boolean)
  );

  const toInsert = [];
  const skipped = [];

  for (const row of rows) {
    const nameKey = normalizeCompanyName(row.company_name);
    const phoneKey = normalizePhone(row.phone_number);

    if (existingNames.has(nameKey)) {
      skipped.push({ row, reason: "DB 기존 상호명과 중복" });
      continue;
    }

    if (phoneKey && existingPhones.has(phoneKey)) {
      skipped.push({ row, reason: "DB 기존 전화번호와 중복" });
      continue;
    }

    toInsert.push(row);
    existingNames.add(nameKey);
    if (phoneKey) existingPhones.add(phoneKey);
  }

  return { toInsert, skipped };
}

async function main() {
  const csvPath =
    process.argv[2] ||
    path.join(process.env.HOME || "", "Downloads/추가 업장_260624 - 시트1.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV 파일을 찾을 수 없습니다:", csvPath);
    process.exit(1);
  }

  console.log("📄 CSV:", csvPath);
  const parsed = parseCsv(csvPath);
  console.log(`파싱: ${parsed.length}행`);

  const { unique, skipped: csvSkipped } = dedupeRows(parsed);
  console.log(`CSV 중복 제거 후: ${unique.length}건 (제외 ${csvSkipped.length}건)`);

  const existing = await fetchExistingFactories();
  console.log(`DB 기존 업장: ${existing.length}건`);

  const maxId = existing.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0);

  const { toInsert, skipped: dbSkipped } = filterAgainstExisting(unique, existing);
  console.log(`신규 등록 대상: ${toInsert.length}건 (DB중복 제외 ${dbSkipped.length}건)`);

  if (toInsert.length === 0) {
    console.log("등록할 신규 업장이 없습니다.");
    return;
  }

  const payload = toInsert.map((row, index) => ({
    id: maxId + index + 1,
    company_name: row.company_name,
    contact_name: row.contact_name || null,
    phone_number: row.phone_number ?? null,
    address: row.address || null,
    admin_district: row.admin_district || null,
    intro: null,
    business_type: null,
    moq: null,
    monthly_capacity: null,
  }));

  const batchSize = 50;
  let inserted = 0;
  for (let i = 0; i < payload.length; i += batchSize) {
    const batch = payload.slice(i, i + batchSize);
    const { error } = await supabase.from("donggori").insert(batch);
    if (error) {
      console.error("INSERT 실패:", error.message, batch[0]);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`  ... ${inserted}/${payload.length} 등록`);
  }

  const { count } = await supabase.from("donggori").select("id", { count: "exact", head: true });
  console.log(`\n✅ 완료: ${inserted}건 신규 등록`);
  console.log(`📊 DB 총 업장 수: ${count ?? "?"}`);

  const allSkipped = [...csvSkipped, ...dbSkipped];
  if (allSkipped.length > 0) {
    console.log(`\n⚠️ 제외 ${allSkipped.length}건 (상위 15건):`);
    allSkipped.slice(0, 15).forEach(({ row, reason }) => {
      console.log(`  - [${reason}] ${row.company_name} (${row.phone_number})`);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
