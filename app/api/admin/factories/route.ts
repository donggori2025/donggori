import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { validateFactoryPatch } from "@/lib/adminHelpers";

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
    const validated = validateFactoryPatch(body, true);
    if (!validated.ok) return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
    const supabase = getServiceSupabase();
    const { error } = await supabase.from("donggori").insert(validated.data);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}

