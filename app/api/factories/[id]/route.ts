import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapPublicFactoryRow, PUBLIC_FACTORY_SELECT } from "@/lib/factoryPrivacy";

export const runtime = "nodejs";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: "id가 필요합니다." }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("donggori")
      .select(PUBLIC_FACTORY_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "업장을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: mapPublicFactoryRow(data as unknown as Record<string, unknown>),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error?.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
