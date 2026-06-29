import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { validatePopupBody } from "@/lib/adminHelpers";
import { insertPopupRow } from "@/lib/adminPopupDb";
import { STATIC_PROMO_POPUPS } from "@/lib/promoPopups";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from("popups").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({
    success: true,
    data: data ?? [],
    staticPopups: STATIC_PROMO_POPUPS,
  });
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
