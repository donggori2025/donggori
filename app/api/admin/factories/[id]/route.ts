import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabaseService";

function requireAdmin() {
  const session = cookies().get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase
    .from("donggori")
    .update({ ...body })
    .eq("id", params.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const auth = requireAdmin();
  if (auth) return auth;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("donggori").delete().eq("id", params.id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


