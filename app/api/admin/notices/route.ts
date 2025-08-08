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

export async function GET() {
  const auth = requireAdmin();
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
  const auth = requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("notices").insert({
    title: body.title,
    content: body.content ?? "",
    category: body.category ?? "일반",
    image_urls: body.image_urls ?? [],
    start_at: body.start_at ?? null,
    end_at: body.end_at ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}


