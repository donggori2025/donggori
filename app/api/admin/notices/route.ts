import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabaseService";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const supabase = getServiceSupabase();
  
  // image_urls 컬럼이 없을 경우를 대비한 안전한 삽입
  const insertData: any = {
    title: body.title,
    content: body.content ?? "",
    category: body.category ?? "일반",
    start_at: body.start_at ?? null,
    end_at: body.end_at ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // image_urls가 제공된 경우에만 추가
  if (body.image_urls !== undefined) {
    insertData.image_urls = body.image_urls;
  }
  
  const { error } = await supabase.from("notices").insert(insertData);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


