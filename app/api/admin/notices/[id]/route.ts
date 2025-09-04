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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const { id } = await params;
  const supabase = getServiceSupabase();
  
  // image_urls 컬럼이 없을 경우를 대비한 안전한 업데이트
  const updateData: any = {
    title: body.title,
    content: body.content ?? "",
    category: body.category ?? "일반",
    start_at: body.start_at ?? null,
    end_at: body.end_at ?? null,
    updated_at: new Date().toISOString(),
  };
  
  // image_urls가 제공된 경우에만 추가
  if (body.image_urls !== undefined) {
    updateData.image_urls = body.image_urls;
  }
  
  const { error } = await supabase
    .from("notices")
    .update(updateData)
    .eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


