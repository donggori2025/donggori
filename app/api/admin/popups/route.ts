import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { validatePopupBody } from "@/lib/adminHelpers";
import { insertPopupRow } from "@/lib/adminPopupDb";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  const supabase = getServiceSupabase();

  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    if (fallback.error) return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: fallback.data ?? [] });
  }

  return NextResponse.json({ success: true, data: data ?? [] });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const validated = validatePopupBody(body);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const supabase = getServiceSupabase();
  const error = await insertPopupRow(supabase, validated.data);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
