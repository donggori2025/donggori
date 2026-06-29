/**
 * 기본 팝업(FADDIT 등)을 DB에 등록
 * 사용: node scripts/seedDefaultPopups.js
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SEEDS = [
  {
    slug: "faddit-creator-crew-contest",
    title: "FADDIT CREATOR CREW 1기",
    image_url: "/popups/faddit-creator-crew-contest.png",
    link_url: "https://open.kakao.com/o/pXWBTRri",
    start_at: "2026-06-22",
    end_at: "2026-07-10",
    sort_order: 0,
  },
  {
    slug: "faddit-promo",
    title: "FADDIT",
    image_url:
      "https://res.cloudinary.com/dvvqaywkd/image/upload/v1780636668/Frame_433_vvd1kq.png",
    link_url:
      "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=pc_top_banner",
    link_url_mobile:
      "https://faddit.co.kr/?utm_source=donggori&utm_medium=display&utm_campaign=launch_faddit_202606&utm_content=mobile_banner",
    sort_order: 1,
  },
];

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

async function insertSeed(supabase, seed) {
  const row = {
    ...seed,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  let { error } = await supabase.from("popups").insert(row);
  if (error) {
    const { slug, link_url_mobile, sort_order, ...minimal } = row;
    ({ error } = await supabase.from("popups").insert(minimal));
  }
  return error;
}

async function main() {
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  for (const seed of SEEDS) {
    const { data: existing } = await supabase.from("popups").select("id").eq("slug", seed.slug).maybeSingle();
    if (existing) {
      console.log(`⏭️  이미 있음: ${seed.slug}`);
      continue;
    }
    const error = await insertSeed(supabase, seed);
    if (error) {
      console.error(`❌ ${seed.slug}:`, error.message);
    } else {
      console.log(`✅ 등록: ${seed.slug}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
