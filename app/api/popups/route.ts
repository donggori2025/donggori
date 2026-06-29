import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import type { PopupItem } from "@/lib/types";

function isPopupActive(popup: PopupItem, now: Date) {
  if (popup.is_active === false) return false;
  const start = popup.start_at ? new Date(popup.start_at) : null;
  const end = popup.end_at ? new Date(popup.end_at) : null;
  if (start && now < start) return false;
  if (end && now > end) return false;
  return true;
}

/** slug/이미지 기준 중복 제거 (과거 중복 삽입 대비) */
function dedupePopups(popups: PopupItem[]): PopupItem[] {
  const seen = new Set<string>();
  const result: PopupItem[] = [];
  for (const popup of popups) {
    const key = popup.slug || popup.image_url || popup.id;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(popup);
  }
  return result;
}

export async function GET() {
  const now = new Date();
  const supabase = getServiceSupabase();

  let query = supabase.from("popups").select("*");
  const { data, error } = await query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase.from("popups").select("*").order("created_at", { ascending: false });
    if (fallback.error) return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
    const filtered = (fallback.data || []).filter((p: PopupItem) => isPopupActive(p, now));
    return NextResponse.json({ success: true, data: dedupePopups(filtered) });
  }

  const filtered = dedupePopups((data || []).filter((p: PopupItem) => isPopupActive(p, now)));
  return NextResponse.json({ success: true, data: filtered });
}
