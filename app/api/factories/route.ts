import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapPublicFactoryRows, PUBLIC_FACTORY_SELECT } from "@/lib/factoryPrivacy";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET() {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("donggori")
      .select(PUBLIC_FACTORY_SELECT)
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: "공장 정보를 불러오지 못했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: mapPublicFactoryRows((data || []) as unknown as Record<string, unknown>[]),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "공장 정보를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
