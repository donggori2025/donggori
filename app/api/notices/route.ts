import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function GET() {
  // 공개: 노출기간 필터 + 최신순
  const now = new Date();
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  const filtered = (data || []).filter((n: any) => {
    if (!n.start_at && !n.end_at) return true;
    const start = n.start_at ? new Date(n.start_at) : null;
    const end = n.end_at ? new Date(n.end_at) : null;
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
  });
  return NextResponse.json({ success: true, data: filtered });
}


