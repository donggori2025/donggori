import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { isPublicNoticeVisible, PUBLIC_NOTICE_SELECT, type PublicNotice } from "@/lib/notices";

export async function GET() {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase
    .from("notices")
    .select(PUBLIC_NOTICE_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ success: false, error: "공지사항을 불러오지 못했습니다." }, { status: 500 });
  const filtered = (data as PublicNotice[] || []).filter((notice) => isPublicNoticeVisible(notice));
  return NextResponse.json({ success: true, data: filtered });
}
