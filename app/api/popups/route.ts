import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function GET() {
  // 공개: 현재 노출 기간에 해당하는 팝업만 반환 (서버에서 필터)
  const now = new Date();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const filtered = (data || []).filter((p: any) => {
    if (!p.start_at && !p.end_at) return true;
    const start = p.start_at ? new Date(p.start_at) : null;
    const end = p.end_at ? new Date(p.end_at) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  });
  return NextResponse.json({ success: true, data: filtered });
}


