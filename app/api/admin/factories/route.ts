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
  const { data, error } = await supabase.from("donggori").select("*").order("id", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("donggori").insert({
    // 전달된 모든 컬럼을 그대로 허용 (화이트리스트 필요 시 교체)
    ...body,
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


