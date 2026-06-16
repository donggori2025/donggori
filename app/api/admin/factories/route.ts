import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";

type AllowedValue = string | number | boolean | null | string[];

function sanitizeFactoryPatch(input: unknown): Record<string, AllowedValue> {
  const body = (input && typeof input === "object" ? (input as Record<string, unknown>) : {}) as Record<
    string,
    unknown
  >;

  // `donggori` 테이블에 넣을 수 있는 안전한 컬럼만 허용합니다.
  // (운영 보안: 임의 컬럼 주입/권한 오남용 방지)
  const allowedKeys = new Set<string>([
    "company_name",
    "name",
    "address",
    "business_type",
    "phone_number",
    "contact",
    "contact_name",
    "email",
    "admin_district",
    "intro",
    "factory_type",
    "main_fabrics",
    "distribution",
    "delivery",
    "equipment",
    "sewing_machines",
    "pattern_machines",
    "special_machines",
    "processes",
    "top_items_upper",
    "top_items_lower",
    "top_items_outer",
    "top_items_dress_skirt",
    "top_items_bag",
    "top_items_fashion_accessory",
    "top_items_underwear",
    "top_items_sports_leisure",
    "top_items_pet",
    "items",
    "kakao_url",
    "image",
    "images",
    "lat",
    "lng",
    "moq",
    "minOrder",
    "monthly_capacity",
    "monthlyCapacity",
    "established_year",
    "establishedYear",
  ]);

  const out: Record<string, AllowedValue> = {};
  for (const [k, v] of Object.entries(body)) {
    if (!allowedKeys.has(k)) continue;
    if (v === undefined) continue;

    if (k === "images") {
      if (Array.isArray(v)) {
        out[k] = v.map((x) => String(x)).filter((x) => x.length > 0);
      } else if (typeof v === "string" && v.length > 0) {
        out[k] = [v];
      }
      continue;
    }

    if (k === "lat" || k === "lng" || k === "moq" || k === "minOrder" || k === "monthly_capacity" || k === "monthlyCapacity" || k === "established_year" || k === "establishedYear") {
      const num = typeof v === "number" ? v : Number(String(v));
      if (!Number.isNaN(num)) out[k] = num;
      continue;
    }

    // 나머지는 문자열로 저장(테이블 스키마에 따라 supabase에서 캐스팅)
    if (v === null) out[k] = null;
    else out[k] = String(v);
  }

  return out;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  // 운영 보안: 환경변수 값/프리픽스 등을 응답에 포함하지 않음
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!hasUrl) {
    return NextResponse.json(
      { success: false, error: "서버 설정 오류" },
      { status: 500 }
    );
  }
  if (!hasServiceKey) {
    return NextResponse.json(
      { success: false, error: "서버 설정 오류" },
      { status: 500 }
    );
  }
  
  try {
    // Supabase 클라이언트 생성 시도
    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch (clientError) {
      return NextResponse.json({ 
        success: false, 
        error: "서버 설정 오류"
      }, { status: 500 });
    }

    // 실제 데이터 조회 (희망사 제외)
    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .neq("company_name", "희망사")
      .order("id", { ascending: false });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: "데이터베이스 오류"
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ 
      success: false, 
      error: "서버 오류"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const body = await req.json();
    const patch = sanitizeFactoryPatch(body);
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, error: "등록할 데이터가 없습니다." }, { status: 400 });
    }
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("donggori").insert(patch);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}


