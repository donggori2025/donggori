import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminSession";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  const supabase = getServiceSupabase();

  const [factoriesRes, noticesRes, popupsRes] = await Promise.all([
    supabase.from("donggori").select("id", { count: "exact", head: true }).neq("company_name", "희망사"),
    supabase.from("notices").select("id", { count: "exact", head: true }),
    supabase.from("popups").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      factories: factoriesRes.count ?? 0,
      notices: noticesRes.count ?? 0,
      popups: popupsRes.count ?? 0,
    },
  });
}
