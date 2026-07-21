/**
 * address 기준으로 admin_district를 재계산합니다.
 * 사용: node scripts/fixAdminDistricts.js --dry-run
 *       node scripts/fixAdminDistricts.js --apply
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

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

async function main() {
  const apply = process.argv.includes("--apply");
  const { data, error } = await supabase.from("donggori").select("id, company_name, address, admin_district");
  if (error) throw error;

  let changed = 0;
  for (const row of data || []) {
    const next = extractAdminDistrict(row.address);
    if (row.admin_district === next) continue;
    changed += 1;
    console.log(`${row.company_name}: ${row.admin_district || "(없음)"} → ${next || "(없음)"}`);
    if (apply) {
      const { error: uerr } = await supabase
        .from("donggori")
        .update({ admin_district: next })
        .eq("id", row.id);
      if (uerr) throw uerr;
    }
  }

  console.log(`\n${apply ? "반영" : "미리보기"}: ${changed}건`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
