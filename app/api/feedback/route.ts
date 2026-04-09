import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await req.json();
    const { factory_id, rating, user_answers, timestamp } = body;

    const { error } = await supabase.from("matching_feedback").insert({
      factory_id,
      rating,
      user_answers: JSON.stringify(user_answers),
      created_at: timestamp || new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "피드백이 성공적으로 저장되었습니다." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated) {
      return unauthorized("피드백 조회에는 인증이 필요합니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get("factory_id");

    let query = supabase.from("matching_feedback").select("*");
    if (factoryId) {
      query = query.eq("factory_id", factoryId);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
