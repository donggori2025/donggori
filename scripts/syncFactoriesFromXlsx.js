/**
 * 업장정보 엑셀 → Supabase donggori 테이블 최신화
 *
 * 엑셀의 ID 컬럼은 DB id와 무관한 자체 일련번호이므로 상호명으로 매칭합니다.
 * 엑셀에 없는 컬럼(email, lat, lng, image, kakao_url 등)은 건드리지 않습니다.
 *
 * 사용:
 *   node scripts/syncFactoriesFromXlsx.js "/path/to/file.xlsx"            # 미리보기(기본)
 *   node scripts/syncFactoriesFromXlsx.js "/path/to/file.xlsx" --apply    # 실제 반영
 *   node scripts/syncFactoriesFromXlsx.js "/path/to/file.xlsx" --report report.json
 */
const fs = require("fs");
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

/** 엑셀 헤더 → donggori 컬럼 */
const COLUMN_MAP = {
  공장명: "company_name",
  "대표자 성함": "contact_name",
  연락처: "phone_number",
  "주소 및 행정동": "address",
  행정동: "admin_district",
  "공장 한줄 소개": "intro",
  공장유형: "factory_type",
  사업유형: "business_type",
  주요원단: "main_fabrics",
  거래유형: "distribution",
  MOQ: "moq",
  CAPA: "monthly_capacity",
  "작업 진행했던 브랜드": "brands_supplied",
  상의: "top_items_upper",
  하의: "top_items_lower",
  아우터: "top_items_outer",
  "원피스/스커트": "top_items_dress_skirt",
  가방잡화: "top_items_bag",
  스포츠레저: "top_items_sports_leisure",
  반려동물: "top_items_pet",
  패션잡화: "top_items_fashion_accessory",
  속옷: "top_items_underwear",
  장비: "equipment",
  재봉틀: "sewing_machines",
  패턴기: "pattern_machines",
  특수기계: "special_machines",
  특수기술: "special_tech",
  배송: "delivery",
};

/** 엑셀에 없는 컬럼 — 기존 DB 값을 보존한다 */
const PRESERVED_COLUMNS = ["id", "email", "lat", "lng", "established_year", "employees", "image", "kakao_url"];

const NUMERIC_COLUMNS = new Set(["phone_number", "moq"]);

function normalizeCompanyName(name) {
  return String(name || "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase()
    .trim();
}

/** 상호명 뒤에 흔히 붙는 접미어를 제거해 개명 여부를 판단한다 (으뜸 ↔ 으뜸어패럴) */
function companyStem(name) {
  return normalizeCompanyName(name).replace(
    /(어패럴|에이패럴|어페럴|패션|의류|상사|산업|실업|무역|컴퍼니|업체|사)$/,
    ""
  );
}

function normalizePhoneDigits(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  // DB에 선행 0이 잘린 채 저장된 값(48186476)과 정상값(1048186476)을 같게 본다
  return digits.replace(/^0+/, "").slice(-8);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[b.length];
}

/**
 * 상호명이 같은 업장을 가리킬 만큼 닮았는지 판단한다.
 * 같은 사장님이 서로 다른 업장을 운영하는 경우(에이스/지은사)를 개명으로 오인하지 않기 위해
 * 연락처·대표자가 같아도 상호명이 닮지 않으면 동일 업장으로 보지 않는다.
 */
function isNameSimilar(a, b) {
  const x = normalizeCompanyName(a);
  const y = normalizeCompanyName(b);
  if (!x || !y) return false;
  if (x === y) return true;
  if (companyStem(a) && companyStem(a) === companyStem(b)) return true;

  const shorter = x.length <= y.length ? x : y;
  const longer = x.length <= y.length ? y : x;
  if (shorter.length >= 2 && longer.startsWith(shorter)) return true;

  const distance = levenshtein(x, y);
  return 1 - distance / Math.max(x.length, y.length) >= 0.6;
}

function addressKey(address) {
  return String(address || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase()
    .slice(0, 24);
}

function phoneToDbValue(phone) {
  const raw = String(phone ?? "").split(/[/,]/)[0].trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const num = Number(digits);
  return Number.isFinite(num) ? num : null;
}

function parseNumberish(value) {
  const raw = String(value ?? "").trim();
  if (!raw || /불명|판독|모름|없음/i.test(raw)) return null;
  const digits = raw.replace(/,/g, "").match(/\d+/);
  if (!digits) return null;
  const num = Number(digits[0]);
  return Number.isFinite(num) ? num : null;
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

/** 줄바꿈이 의미를 갖는 서술형 필드용 — 원문을 그대로 두고 앞뒤 공백만 정리한다 */
function cleanMultilineText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

const MULTILINE_COLUMNS = new Set(["intro", "special_tech", "brands_supplied"]);

function rowToFactory(row) {
  const companyName = cleanText(row["공장명"]);
  if (!companyName) return null;

  const record = {};
  for (const [header, column] of Object.entries(COLUMN_MAP)) {
    const raw = row[header];
    if (column === "phone_number") {
      record[column] = phoneToDbValue(raw);
    } else if (column === "moq") {
      record[column] = parseNumberish(raw);
    } else if (column === "address" || column === "equipment" || MULTILINE_COLUMNS.has(column)) {
      // 주소·장비의 구분자와 서술형 필드의 줄바꿈을 보존해야 하므로 앞뒤 공백만 제거
      record[column] = cleanMultilineText(raw);
    } else {
      record[column] = cleanText(raw);
    }
  }
  return record;
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

/**
 * 엑셀 값과 DB 값을 비교해 실제 변경분만 뽑는다.
 * 엑셀의 빈 셀은 "삭제"가 아니라 "미수집"인 경우가 많으므로 기존 값을 지우지 않는다.
 */
function diffFields(existing, incoming, { allowBlankOverwrite = false } = {}) {
  const changes = {};
  const preservedBlanks = [];

  for (const [column, nextValue] of Object.entries(incoming)) {
    const prevValue = existing[column];

    if (!allowBlankOverwrite && isBlank(nextValue) && !isBlank(prevValue)) {
      preservedBlanks.push(column);
      continue;
    }

    if (NUMERIC_COLUMNS.has(column)) {
      const prev = prevValue === null || prevValue === undefined ? null : Number(prevValue);
      const next = nextValue === null ? null : Number(nextValue);
      if (prev !== next) changes[column] = { from: prevValue ?? null, to: nextValue };
      continue;
    }

    const prev = prevValue === null || prevValue === undefined ? "" : String(prevValue);
    const next = nextValue === null ? "" : String(nextValue);
    if (prev !== next) changes[column] = { from: prevValue ?? null, to: nextValue };
  }
  return { changes, preservedBlanks };
}

/**
 * 상호명·연락처·대표자·주소를 조합해 동일 업장을 찾는다.
 * 상호명만 같은 경우(동명이인)와 상호명만 바뀐 경우(개명)를 모두 구분하기 위해
 * 단일 신호로는 확정하지 않고 최소 2개 신호가 맞을 때만 동일로 본다.
 */
function scoreMatch(incoming, candidate) {
  const namesEqual = normalizeCompanyName(incoming.company_name) === normalizeCompanyName(candidate.company_name);
  const namesSimilar = namesEqual || isNameSimilar(incoming.company_name, candidate.company_name);

  const incomingPhone = normalizePhoneDigits(incoming.phone_number);
  const candidatePhone = normalizePhoneDigits(candidate.phone_number);
  const phonesEqual = Boolean(incomingPhone) && incomingPhone === candidatePhone;

  const incomingOwner = cleanText(incoming.contact_name);
  const candidateOwner = cleanText(candidate.contact_name);
  const ownersEqual = Boolean(incomingOwner) && incomingOwner === candidateOwner;

  const incomingAddress = addressKey(incoming.address);
  const candidateAddress = addressKey(candidate.address);
  const addressesEqual = Boolean(incomingAddress) && incomingAddress === candidateAddress;

  const signals = [phonesEqual, ownersEqual, addressesEqual].filter(Boolean).length;

  // 한쪽이 비어 있으면 상충으로 보지 않는다 (DB에 연락처·대표자가 누락된 레코드가 많다)
  const conflicts =
    (incomingPhone && candidatePhone && !phonesEqual) ||
    (incomingOwner && candidateOwner && !ownersEqual) ||
    (incomingAddress && candidateAddress && !addressesEqual);
  const reasons = [
    namesEqual ? "상호명" : namesSimilar ? "상호명(유사)" : null,
    phonesEqual ? "연락처" : null,
    ownersEqual ? "대표자" : null,
    addressesEqual ? "주소" : null,
  ].filter(Boolean);

  let score = 0;
  if (namesEqual && signals >= 2) score = 100;
  else if (namesEqual && signals === 1) score = 95;
  else if (namesSimilar && phonesEqual && (ownersEqual || addressesEqual)) score = 90;
  else if (namesSimilar && phonesEqual) score = 85;
  else if (namesSimilar && ownersEqual && addressesEqual) score = 75;
  else if (namesEqual && !conflicts) score = 70;
  else if (namesSimilar && !conflicts) score = 68;
  else if (namesEqual) score = 65;
  else if (signals === 3) score = 60;

  return { score, reasons, namesEqual, namesSimilar, phonesEqual, ownersEqual };
}

function completeness(record) {
  return Object.values(record).filter((v) => v !== null && v !== undefined && String(v).trim() !== "").length;
}

async function fetchExisting() {
  const columns = ["id", ...new Set(Object.values(COLUMN_MAP))].join(", ");
  const all = [];
  const pageSize = 500;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("donggori")
      .select(columns)
      .order("id")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    all.push(...(data || []));
    if (!data || data.length < pageSize) break;
  }
  return all;
}

async function main() {
  const args = process.argv.slice(2);
  const xlsxPath = args.find((a) => !a.startsWith("--"));
  const apply = args.includes("--apply");
  const allowBlankOverwrite = args.includes("--allow-blank-overwrite");
  const reportIndex = args.indexOf("--report");
  const reportPath = reportIndex >= 0 ? args[reportIndex + 1] : null;

  if (!xlsxPath || !fs.existsSync(xlsxPath)) {
    console.error("엑셀 파일을 찾을 수 없습니다:", xlsxPath || "(경로 미지정)");
    process.exit(1);
  }

  console.log("📄 XLSX:", xlsxPath);
  console.log(apply ? "⚙️  모드: 실제 반영 (--apply)" : "🔍 모드: 미리보기 (변경 없음)");

  const wb = XLSX.readFile(xlsxPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const parsed = [];
  const duplicatesInExcel = [];
  const seen = new Map();

  for (const row of rows) {
    const factory = rowToFactory(row);
    if (!factory) continue;
    // 동명이인(같은 상호, 다른 대표/연락처)을 살리기 위해 상호명 단독이 아닌 조합 키를 쓴다
    const key = [
      normalizeCompanyName(factory.company_name),
      normalizePhoneDigits(factory.phone_number),
      cleanText(factory.contact_name),
    ].join("|");
    if (seen.has(key)) {
      duplicatesInExcel.push({ excelId: row["ID"], company_name: factory.company_name });
      continue;
    }
    seen.set(key, factory);
    parsed.push({ excelId: row["ID"], factory, key });
  }

  console.log(`\n엑셀 파싱: ${parsed.length}건 (원본 ${rows.length}행)`);
  if (duplicatesInExcel.length) {
    console.log(`  ⚠️  엑셀 내 상호명 중복 제외: ${duplicatesInExcel.length}건`);
    duplicatesInExcel.forEach((d) => console.log(`     - #${d.excelId} ${d.company_name}`));
  }

  const existing = await fetchExisting();
  console.log(`DB 기존: ${existing.length}건`);

  const toInsert = [];
  const toUpdate = [];
  const unchanged = [];
  const renamed = [];
  const matchedBy = [];
  const blanksPreserved = [];
  const matchedDbIds = new Set();

  // 확신도가 높은 매칭부터 DB 레코드를 선점하도록 정렬한다
  const scored = parsed.map((item) => {
    const ranked = existing
      .map((candidate) => ({ candidate, ...scoreMatch(item.factory, candidate) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || completeness(b.candidate) - completeness(a.candidate));
    return { ...item, ranked, bestScore: ranked[0]?.score || 0 };
  });
  scored.sort((a, b) => b.bestScore - a.bestScore);

  for (const item of scored) {
    const available = item.ranked.filter((r) => !matchedDbIds.has(r.candidate.id));
    const best = available[0];

    if (!best || best.score < 50) {
      toInsert.push({ excelId: item.excelId, factory: item.factory });
      continue;
    }

    matchedDbIds.add(best.candidate.id);
    matchedBy.push({ excelId: item.excelId, factory: item.factory, dbId: best.candidate.id });

    if (!best.namesEqual) {
      renamed.push({
        excelId: item.excelId,
        id: best.candidate.id,
        from: best.candidate.company_name,
        to: item.factory.company_name,
        reasons: best.reasons,
      });
    }

    const { changes, preservedBlanks } = diffFields(best.candidate, item.factory, { allowBlankOverwrite });
    if (preservedBlanks.length) {
      blanksPreserved.push({ id: best.candidate.id, company_name: item.factory.company_name, columns: preservedBlanks });
    }
    if (Object.keys(changes).length === 0) {
      unchanged.push({ id: best.candidate.id, company_name: item.factory.company_name });
    } else {
      toUpdate.push({ id: best.candidate.id, excelId: item.excelId, factory: item.factory, changes });
    }
  }

  const notInExcel = existing.filter((record) => !matchedDbIds.has(record.id));

  // 매칭되지 않고 남은 DB 레코드 중 이미 매칭된 업장과 닮은 것을 중복 후보로 보고만 한다 (자동 삭제·병합 없음)
  const dbDuplicates = [];
  for (const leftover of notInExcel) {
    const similar = matchedBy
      .map((m) => ({ m, ...scoreMatch(m.factory, leftover) }))
      .filter((r) => r.score >= 85)
      .sort((a, b) => b.score - a.score)[0];
    if (similar) {
      dbDuplicates.push({
        leftoverId: leftover.id,
        leftoverName: leftover.company_name,
        keptId: similar.m.dbId,
        keptName: similar.m.factory.company_name,
        reasons: similar.reasons,
      });
    }
  }

  console.log(`\n=== 요약 ===`);
  console.log(`  신규 등록: ${toInsert.length}건`);
  console.log(`  갱신 필요: ${toUpdate.length}건`);
  console.log(`  변경 없음: ${unchanged.length}건`);
  console.log(`  상호명 변경 감지: ${renamed.length}건`);
  console.log(`  DB 중복 추정: ${dbDuplicates.length}건`);
  console.log(`  엑셀에 없는 DB 업장: ${notInExcel.length}건 (삭제하지 않고 유지)`);

  if (toInsert.length) {
    console.log(`\n--- 신규 등록 대상 ---`);
    toInsert.forEach((t) =>
      console.log(`  + [엑셀#${t.excelId}] ${t.factory.company_name} (대표:${t.factory.contact_name || "-"}, 연락처:${t.factory.phone_number ?? "-"})`)
    );
  }

  if (renamed.length) {
    console.log(`\n--- 상호명 변경 (기존 레코드 갱신) ---`);
    renamed.forEach((r) =>
      console.log(`  ✎ #${r.id} "${r.from}" → "${r.to}" [일치: ${r.reasons.join("+")}]`)
    );
  }

  if (dbDuplicates.length) {
    console.log(`\n--- DB 중복 추정 (자동 삭제하지 않음, 수동 정리 권장) ---`);
    dbDuplicates.forEach((d) =>
      console.log(`  ! #${d.leftoverId} "${d.leftoverName}" ↔ #${d.keptId} "${d.keptName}" [${d.reasons.join("+")}]`)
    );
  }

  const duplicateIds = new Set(dbDuplicates.map((d) => d.leftoverId));
  const orphans = notInExcel.filter((r) => !duplicateIds.has(r.id));
  if (orphans.length) {
    console.log(`\n--- 엑셀에 없는 DB 업장 (유지) ---`);
    orphans.forEach((r) => console.log(`  · #${r.id} ${r.company_name}`));
  }

  if (toUpdate.length) {
    const fieldCounts = {};
    for (const item of toUpdate) {
      for (const column of Object.keys(item.changes)) {
        fieldCounts[column] = (fieldCounts[column] || 0) + 1;
      }
    }
    console.log(`\n--- 변경 필드별 건수 ---`);
    Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([column, count]) => console.log(`  ${column}: ${count}건`));

    console.log(`\n--- 갱신 예시 (최대 5건) ---`);
    toUpdate.slice(0, 5).forEach((item) => {
      console.log(`  ↻ #${item.id} ${item.factory.company_name}`);
      Object.entries(item.changes)
        .slice(0, 6)
        .forEach(([column, { from, to }]) => {
          const fromText = JSON.stringify(from ?? "").slice(0, 70);
          const toText = JSON.stringify(to ?? "").slice(0, 70);
          console.log(`      ${column}: ${fromText} → ${toText}`);
        });
    });
  }

  if (reportPath) {
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        { toInsert, toUpdate, unchanged, renamed, dbDuplicates, notInExcel, duplicatesInExcel, blanksPreserved },
        null,
        2
      )
    );
    console.log(`\n📝 상세 리포트: ${reportPath}`);
  }

  if (blanksPreserved.length) {
    const columnCounts = {};
    blanksPreserved.forEach((b) => b.columns.forEach((c) => (columnCounts[c] = (columnCounts[c] || 0) + 1)));
    console.log(`\n--- 엑셀 빈 셀이라 기존 값을 지키지 않고 유지한 항목 (${blanksPreserved.length}개 업장) ---`);
    Object.entries(columnCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([column, count]) => console.log(`  ${column}: ${count}건 유지`));
  }

  console.log(`\n🔒 보존 컬럼(엑셀에 없어 건드리지 않음): ${PRESERVED_COLUMNS.join(", ")}`);

  if (!apply) {
    console.log(`\n미리보기이므로 DB를 변경하지 않았습니다. 반영하려면 --apply 를 붙여 실행하세요.`);
    return;
  }

  let updated = 0;
  for (const item of toUpdate) {
    const payload = Object.fromEntries(Object.entries(item.changes).map(([column, { to }]) => [column, to]));
    const { error } = await supabase.from("donggori").update(payload).eq("id", item.id);
    if (error) {
      console.error("UPDATE 실패:", error.message, item.factory.company_name);
      process.exit(1);
    }
    updated++;
  }

  let inserted = 0;
  if (toInsert.length) {
    const maxId = existing.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
    for (let i = 0; i < toInsert.length; i++) {
      const payload = { id: maxId + i + 1, ...toInsert[i].factory };
      const { error } = await supabase.from("donggori").insert(payload);
      if (error) {
        console.error("INSERT 실패:", error.message, payload.company_name);
        process.exit(1);
      }
      inserted++;
      console.log(`  + 등록: ${payload.company_name} (#${payload.id})`);
    }
  }

  const { count } = await supabase.from("donggori").select("id", { count: "exact", head: true });
  console.log(`\n✅ 완료: 갱신 ${updated}건, 신규 ${inserted}건`);
  console.log(`📊 DB 총 업장 수: ${count ?? "?"}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
