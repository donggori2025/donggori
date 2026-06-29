import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { requireAdmin } from "@/lib/adminSession";
import { removeDuplicatePopups } from "@/lib/ensurePopupSeeds";

export async function POST() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const supabase = getServiceSupabase();
    const removed = await removeDuplicatePopups(supabase);
    return NextResponse.json({ success: true, removed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "중복 정리 실패";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
