import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import type { PopupItem } from "@/lib/types";
import { ensurePopupSeeds } from "@/lib/ensurePopupSeeds";

function isPopupActive(popup: PopupItem, now: Date) {
  if (popup.is_active === false) return false;
  const start = popup.start_at ? new Date(popup.start_at) : null;
  const end = popup.end_at ? new Date(popup.end_at) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

export async function GET() {
  const now = new Date();
  const supabase = getServiceSupabase();
  await ensurePopupSeeds(supabase);

  let query = supabase.from("popups").select("*");
  const { data, error } = await query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    if (fallback.error) return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
    const filtered = (fallback.data || []).filter((p: PopupItem) => isPopupActive(p, now));
    return NextResponse.json({ success: true, data: filtered });
  }

  const filtered = (data || []).filter((p: PopupItem) => isPopupActive(p, now));
  return NextResponse.json({ success: true, data: filtered });
}
