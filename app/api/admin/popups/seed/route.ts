import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { ensurePopupSeeds } from "@/lib/ensurePopupSeeds";

export async function POST() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const supabase = getServiceSupabase();
    await ensurePopupSeeds(supabase);
    return NextResponse.json({ success: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "기본 팝업 등록 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
