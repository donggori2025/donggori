/**
 * 상호명·대표자명·전화번호 기준으로 네이버 검색 API를 활용해 업장 정보를 보강합니다.
 *
 * 사용:
 *   node scripts/enrichFactoriesFromSearch.js --dry-run --limit 10
 *   node scripts/enrichFactoriesFromSearch.js --apply --min-confidence 0.75 --limit 50
 *   node scripts/enrichFactoriesFromSearch.js --dry-run --id 29
 *
 * 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   KAKAO_REST_API_KEY (권장, 카카오 로컬 검색)
 *   NEXT_PUBLIC_NAVER_CLIENT_ID, NAVER_CLIENT_SECRET (네이버 검색 API — 앱에 검색 권한 필요)
 *   DATA_GO_KR_SERVICE_KEY (선택, 사업자등록번호 상태조회)
 */
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const naverClientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const naverClientSecret = process.env.NAVER_CLIENT_SECRET;
const kakaoRestKey = process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "";
const dataGoKrKey = process.env.DATA_GO_KR_SERVICE_KEY || "";

if (!supabaseUrl || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요");
  process.exit(1);
}

const hasKakaoSearch = Boolean(kakaoRestKey);
const hasNaverSearch = Boolean(naverClientId && naverClientSecret);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

const OUTPUT_DIR = path.join(__dirname, "output");
const REPORT_PATH = path.join(OUTPUT_DIR, "factory-enrich-report.json");

const FACTORY_TYPES = ["봉제", "샘플", "패턴", "나염", "QC", "시야게"];
const MAIN_FABRICS = ["다이마루", "직기", "토탈", "기타"];

function parseArgs(argv) {
  const args = {
    dryRun: true,
    limit: 0,
    id: null,
    minConfidence: 0.7,
    delayMs: 350,
    onlyMissing: true,
    mode: "auto", // auto | search | heuristic
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--apply") args.dryRun = false;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--all") args.onlyMissing = false;
    else if (arg === "--heuristic") args.mode = "heuristic";
    else if (arg === "--search") args.mode = "search";
    else if (arg.startsWith("--mode=")) args.mode = arg.split("=")[1] || "auto";
    else if (arg.startsWith("--limit=")) args.limit = Number(arg.split("=")[1]) || 0;
    else if (arg === "--limit") args.limit = Number(argv[++i]) || 0;
    else if (arg.startsWith("--id=")) args.id = Number(arg.split("=")[1]);
    else if (arg === "--id") args.id = Number(argv[++i]);
    else if (arg.startsWith("--min-confidence=")) {
      args.minConfidence = Number(arg.split("=")[1]) || 0.7;
    } else if (arg.startsWith("--delay=")) args.delayMs = Number(arg.split("=")[1]) || 350;
  }

  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeCompanyName(name) {
  return String(name || "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase()
    .trim();
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function stripHtml(text) {
  return String(text || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
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

function phonesMatch(a, b) {
  const pa = normalizePhone(a);
  const pb = normalizePhone(b);
  if (!pa || !pb) return false;
  if (pa === pb) return true;
  return pa.slice(-8) === pb.slice(-8);
}

function scoreLocalResult(factory, item) {
  const title = normalizeCompanyName(stripHtml(item.title));
  const factoryName = normalizeCompanyName(factory.company_name);
  let score = 0;
  const reasons = [];

  if (!title || !factoryName) return { score: 0, reasons: ["이름 없음"] };

  if (title === factoryName) {
    score += 0.45;
    reasons.push("상호명 정확 일치");
  } else if (title.includes(factoryName) || factoryName.includes(title)) {
    score += 0.3;
    reasons.push("상호명 부분 일치");
  } else {
    const factoryTokens = factoryName.match(/[\p{L}\p{N}]{2,}/gu) || [];
    const overlap = factoryTokens.filter((t) => title.includes(t)).length;
    if (overlap > 0) {
      score += Math.min(0.2, overlap * 0.08);
      reasons.push("상호명 토큰 일부 일치");
    }
  }

  if (phonesMatch(factory.phone_number, item.telephone)) {
    score += 0.35;
    reasons.push("전화번호 일치");
  }

  const addr = `${item.roadAddress || ""} ${item.address || ""}`;
  if (factory.address && addr) {
    const fa = normalizeCompanyName(factory.address);
    const sa = normalizeCompanyName(addr);
    if (fa && sa && (fa.includes(sa.slice(0, 8)) || sa.includes(fa.slice(0, 8)))) {
      score += 0.15;
      reasons.push("주소 일부 일치");
    }
  }

  const category = String(item.category || "");
  if (/의류|봉제|섬유|패션|자수|나염|샘플|임가공/i.test(category)) {
    score += 0.05;
    reasons.push("업종 관련");
  }

  return { score: Math.min(score, 1), reasons };
}

async function naverGet(url) {
  if (!hasNaverSearch) throw new Error("네이버 검색 API 미설정");
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": naverClientId,
      "X-Naver-Client-Secret": naverClientSecret,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

async function kakaoGet(url) {
  if (!hasKakaoSearch) throw new Error("KAKAO_REST_API_KEY 미설정");
  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${kakaoRestKey}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

function kakaoItemToLocalShape(doc) {
  return {
    title: doc.place_name,
    category: doc.category_name,
    description: doc.category_name,
    telephone: doc.phone,
    roadAddress: doc.road_address_name,
    address: doc.address_name,
    mapx: String(doc.x),
    mapy: String(doc.y),
  };
}

async function searchLocal(query) {
  const items = [];

  if (hasKakaoSearch) {
    const q = encodeURIComponent(query);
    const data = await kakaoGet(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=${q}&size=5`
    );
    items.push(...(data.documents || []).map(kakaoItemToLocalShape));
  }

  if (hasNaverSearch) {
    const q = encodeURIComponent(query);
    const data = await naverGet(
      `https://openapi.naver.com/v1/search/local.json?query=${q}&display=5&start=1&sort=random`
    );
    items.push(...(data.items || []));
  }

  return items;
}

async function searchWeb(query) {
  if (!hasNaverSearch) return [];
  const q = encodeURIComponent(query);
  const data = await naverGet(
    `https://openapi.naver.com/v1/search/webkr.json?query=${q}&display=5&start=1&sort=sim`
  );
  return data.items || [];
}

function extractBizNumbers(text) {
  const matches = String(text || "").match(/\d{3}-\d{2}-\d{5}|\d{10}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/-/g, "")))].filter((m) => m.length === 10);
}

async function verifyBusinessStatus(bizNo) {
  if (!dataGoKrKey) return null;

  const res = await fetch(
    `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${encodeURIComponent(dataGoKrKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ b_no: [bizNo] }),
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  const item = data?.data?.[0];
  if (!item) return null;

  return {
    bizNo,
    taxType: item.tax_type || null,
    endDate: item.end_dt || null,
    active: !item.end_dt,
  };
}

function inferFactoryMeta(textBundle) {
  const text = String(textBundle || "");
  const meta = {};

  if (/봉제|임가공|cmt|완성/i.test(text)) meta.factory_type = "봉제";
  else if (/샘플|시제|프로토/i.test(text)) meta.factory_type = "샘플";
  else if (/패턴|cad|캐드/i.test(text)) meta.factory_type = "패턴";
  else if (/나염|프린트/i.test(text)) meta.factory_type = "나염";
  else if (/자수/i.test(text)) meta.factory_type = "나염";
  else if (/qc|검품|품질/i.test(text)) meta.factory_type = "QC";
  else if (/시야게|시염|완성가공/i.test(text)) meta.factory_type = "시야게";

  if (/다이마루|니트|편물|스웨터/i.test(text)) meta.main_fabrics = "다이마루";
  else if (/직기|우븐|직물|섬유/i.test(text)) meta.main_fabrics = "직기";
  else if (/토탈|기성|완제/i.test(text)) meta.main_fabrics = "토탈";

  const businessMatch = text.match(
    /(의류|봉제|섬유|패션|자수|나염|임가공|제조|도매|소매|어패럴)[^\n,]{0,20}/i
  );
  if (businessMatch) meta.business_type = businessMatch[0].trim().slice(0, 40);

  const moqMatch = text.match(/(?:MOQ|최소\s*수량|최소\s*주문)\s*[:：]?\s*(\d{1,5})\s*(?:장|벌|개|ea)?/i);
  if (moqMatch) meta.moq = Number(moqMatch[1]);

  return meta;
}

function heuristicEnrich(factory) {
  const name = String(factory.company_name || "");
  const textBundle = [name, factory.address, factory.contact_name].join(" ");
  const inferred = inferFactoryMeta(textBundle);
  const patch = {};
  const filled = [];
  let confidence = 0.55;

  if (!factory.admin_district && factory.address) {
    const district = extractAdminDistrict(factory.address);
    if (district) {
      patch.admin_district = district;
      filled.push("admin_district");
      confidence += 0.05;
    }
  }

  if (!factory.factory_type && inferred.factory_type) {
    patch.factory_type = inferred.factory_type;
    filled.push("factory_type");
    confidence += 0.1;
  } else if (!factory.factory_type && /패션|어페럴|의류|상사|실업/i.test(name)) {
    patch.factory_type = "봉제";
    filled.push("factory_type");
    confidence += 0.05;
  }

  if (!factory.main_fabrics && inferred.main_fabrics) {
    patch.main_fabrics = inferred.main_fabrics;
    filled.push("main_fabrics");
    confidence += 0.05;
  }

  if (!factory.business_type) {
    if (inferred.business_type) {
      patch.business_type = inferred.business_type;
    } else if (/패션|어페럴|의류/i.test(name)) {
      patch.business_type = "의류 봉제";
    } else if (/섬유/i.test(name)) {
      patch.business_type = "섬유";
    } else if (/자수/i.test(name)) {
      patch.business_type = "자수";
    }
    if (patch.business_type) filled.push("business_type");
  }

  if (!factory.intro) {
    const bits = [`${name}은(는) 동대문 의류 산업 단지 소재 업체입니다.`];
    if (factory.contact_name) bits.push(`대표 ${factory.contact_name}`);
    if (factory.address) bits.push(factory.address);
    if (patch.factory_type) bits.push(`${patch.factory_type} 전문`);
    patch.intro = bits.join(" ").slice(0, 300);
    filled.push("intro");
  }

  return {
    id: factory.id,
    company_name: factory.company_name,
    contact_name: factory.contact_name,
    confidence: Math.min(0.55 + filled.length * 0.06, 0.82),
    match_reasons: ["이름·주소 기반 추론"],
    local_match_title: null,
    local_category: null,
    biz_status: null,
    filled_fields: filled,
    patch,
    skipped: Object.keys(patch).length === 0,
    source: "heuristic",
  };
}

function buildIntro(localItem, webItems, contactName) {
  const parts = [];
  const category = stripHtml(localItem?.category || "");
  const desc = stripHtml(localItem?.description || "");

  if (category) parts.push(category.replace(/>/g, " "));
  if (desc && desc !== category) parts.push(desc);

  for (const item of webItems.slice(0, 2)) {
    const snippet = stripHtml(item.description || "");
    if (snippet && !parts.join(" ").includes(snippet.slice(0, 20))) {
      parts.push(snippet);
    }
  }

  if (contactName) parts.push(`대표 ${contactName}`);

  const intro = parts.join(" · ").replace(/\s+/g, " ").trim();
  return intro.slice(0, 300) || null;
}

function needsEnrichment(factory) {
  return (
    !factory.intro ||
    !factory.address ||
    !factory.factory_type ||
    !factory.business_type ||
    !factory.main_fabrics ||
    !factory.moq
  );
}

function buildPatch(factory, localBest, webItems, inferred, bizStatus) {
  const patch = {};
  const filled = [];

  if (localBest) {
    const road = stripHtml(localBest.roadAddress || "");
    const jibun = stripHtml(localBest.address || "");
    const nextAddress = road || jibun;

    if (nextAddress && !factory.address) {
      patch.address = formatAddress(nextAddress);
      filled.push("address");
    }

    if (patch.address || factory.address) {
      const district = extractAdminDistrict(patch.address || factory.address);
      if (district && !factory.admin_district) {
        patch.admin_district = district;
        filled.push("admin_district");
      }
    }

    if (!factory.phone_number && localBest.telephone) {
      const digits = normalizePhone(localBest.telephone);
      if (digits) {
        patch.phone_number = Number(digits);
        filled.push("phone_number");
      }
    }
  }

  if (!factory.intro) {
    const intro = buildIntro(localBest, webItems, factory.contact_name);
    if (intro) {
      patch.intro = intro;
      filled.push("intro");
    }
  }

  if (!factory.business_type && inferred.business_type) {
    patch.business_type = inferred.business_type;
    filled.push("business_type");
  }

  if (!factory.factory_type && inferred.factory_type && FACTORY_TYPES.includes(inferred.factory_type)) {
    patch.factory_type = inferred.factory_type;
    filled.push("factory_type");
  }

  if (!factory.main_fabrics && inferred.main_fabrics && MAIN_FABRICS.includes(inferred.main_fabrics)) {
    patch.main_fabrics = inferred.main_fabrics;
    filled.push("main_fabrics");
  }

  if (!factory.moq && inferred.moq) {
    patch.moq = inferred.moq;
    filled.push("moq");
  }

  return { patch, filled, bizStatus };
}

async function enrichFactory(factory, mode) {
  if (mode === "heuristic" || (!hasKakaoSearch && !hasNaverSearch)) {
    return heuristicEnrich(factory);
  }

  const queries = [
    `${factory.company_name} 동대문`,
    `${factory.company_name} ${factory.contact_name || ""}`.trim(),
    `${factory.company_name} 봉제`,
  ];

  let localItems = [];
  for (const q of queries) {
    try {
      const items = await searchLocal(q);
      localItems = localItems.concat(items);
    } catch (err) {
      if (!localItems.length) throw err;
    }
    await sleep(120);
  }

  if (!localItems.length) {
    const fallback = heuristicEnrich(factory);
    fallback.match_reasons.push("검색 결과 없음 → 휴리스틱");
    fallback.confidence = Math.min(fallback.confidence, 0.65);
    return fallback;
  }

  const scored = localItems
    .map((item) => ({ item, ...scoreLocalResult(factory, item) }))
    .sort((a, b) => b.score - a.score);

  const localBest = scored[0]?.score > 0 ? scored[0] : null;

  const webQuery = `${factory.company_name} ${factory.contact_name || ""} 사업자`.trim();
  const webItems = await searchWeb(webQuery);

  const textBundle = [
    localBest?.item?.category,
    localBest?.item?.description,
    ...webItems.map((w) => `${w.title} ${w.description}`),
    factory.company_name,
  ].join(" ");

  const inferred = inferFactoryMeta(textBundle);

  let bizStatus = null;
  const bizCandidates = extractBizNumbers(textBundle);
  for (const bizNo of bizCandidates.slice(0, 2)) {
    bizStatus = await verifyBusinessStatus(bizNo);
    if (bizStatus) break;
    await sleep(100);
  }

  const confidence = localBest?.score || 0;
  const { patch, filled } = buildPatch(factory, localBest?.item, webItems, inferred, bizStatus);

  return {
    id: factory.id,
    company_name: factory.company_name,
    contact_name: factory.contact_name,
    confidence,
    match_reasons: localBest?.reasons || [],
    local_match_title: localBest ? stripHtml(localBest.item.title) : null,
    local_category: localBest ? stripHtml(localBest.item.category) : null,
    biz_status: bizStatus,
    filled_fields: filled,
    patch,
    skipped: Object.keys(patch).length === 0,
    source: "search",
  };
}

async function fetchFactories(args) {
  let query = supabase
    .from("donggori")
    .select(
      "id, company_name, contact_name, phone_number, address, intro, factory_type, business_type, main_fabrics, moq, admin_district"
    )
    .order("id");

  if (args.id) query = query.eq("id", args.id);

  const { data, error } = await query;
  if (error) throw error;

  let rows = data || [];
  if (args.onlyMissing) rows = rows.filter(needsEnrichment);
  if (args.limit > 0) rows = rows.slice(0, args.limit);
  return rows;
}

async function main() {
  const args = parseArgs(process.argv);
  const mode =
    args.mode === "heuristic"
      ? "heuristic"
      : args.mode === "search"
        ? "search"
        : hasKakaoSearch || hasNaverSearch
          ? "search"
          : "heuristic";

  const factories = await fetchFactories(args);

  console.log(`🔍 보강 대상: ${factories.length}건 (${args.dryRun ? "dry-run" : "apply"}, mode=${mode})`);
  if (!hasKakaoSearch && !hasNaverSearch && mode === "search") {
    console.error("검색 API 키가 없습니다. KAKAO_REST_API_KEY 또는 네이버 검색 API를 설정하세요.");
    process.exit(1);
  }
  if (mode === "heuristic") {
    console.log("ℹ️  검색 API 없이 상호명·주소 기반 추론으로 채웁니다.");
  } else {
    console.log(`ℹ️  검색 제공자: ${[hasKakaoSearch && "Kakao", hasNaverSearch && "Naver"].filter(Boolean).join(" + ")}`);
  }
  if (factories.length === 0) {
    console.log("대상 업장이 없습니다.");
    return;
  }

  const results = [];
  let applied = 0;

  for (let i = 0; i < factories.length; i++) {
    const factory = factories[i];
    process.stdout.write(`[${i + 1}/${factories.length}] ${factory.company_name} ... `);

    try {
      const result = await enrichFactory(factory, mode);
      results.push(result);

      const canApply =
        !args.dryRun &&
        result.confidence >= args.minConfidence &&
        !result.skipped;

      if (canApply) {
        const { error } = await supabase.from("donggori").update(result.patch).eq("id", factory.id);
        if (error) throw error;
        applied += 1;
        console.log(`✅ 적용 (신뢰도 ${result.confidence.toFixed(2)}, ${result.filled_fields.join(", ")})`);
      } else if (result.skipped) {
        console.log(`⏭️  채울 필드 없음 (신뢰도 ${result.confidence.toFixed(2)})`);
      } else {
        console.log(
          `📝 미적용 (신뢰도 ${result.confidence.toFixed(2)}, ${result.filled_fields.join(", ") || "없음"})`
        );
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      results.push({
        id: factory.id,
        company_name: factory.company_name,
        error: err.message,
      });
    }

    await sleep(args.delayMs);
  }

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), args, results }, null, 2));

  const enrichable = results.filter((r) => !r.error && !r.skipped).length;
  const highConfidence = results.filter((r) => r.confidence >= args.minConfidence && !r.skipped).length;

  console.log("\n--- 요약 ---");
  console.log(`보강 가능: ${enrichable}건`);
  console.log(`신뢰도 ${args.minConfidence} 이상: ${highConfidence}건`);
  if (!args.dryRun) console.log(`DB 반영: ${applied}건`);
  console.log(`리포트: ${REPORT_PATH}`);

  if (!dataGoKrKey) {
    console.log("\nℹ️  DATA_GO_KR_SERVICE_KEY 미설정 — 사업자등록 상태 자동검증은 건너뜁니다.");
  }
  if (!hasNaverSearch) {
    console.log("ℹ️  네이버 검색 API 미사용 — developers.naver.com에서 '검색' API 권한을 추가하면 웹검색·사업자번호 추출이 가능합니다.");
  }
  if (!hasKakaoSearch) {
    console.log("ℹ️  KAKAO_REST_API_KEY 미설정 — 카카오 로컬 검색(주소·전화 보강)을 쓰려면 REST API 키를 .env.local에 추가하세요.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
