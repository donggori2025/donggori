import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { validatePopupBody } from "@/lib/adminHelpers";
import { updatePopupRow } from "@/lib/adminPopupDb";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const body = await req.json();
  const validated = validatePopupBody(body);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const { id } = await params;
  const supabase = getServiceSupabase();
  const error = await updatePopupRow(supabase, id, validated.data);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (auth) return auth;
  const { id } = await params;
  const supabase = getServiceSupabase();
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
