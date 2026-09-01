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
    const auth = await getRequestAuth();
    if (!auth.authenticated || auth.role !== "user") {
      return unauthorized("로그인한 사용자만 피드백을 등록할 수 있습니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await req.json();
    const { factory_id, rating, user_answers } = body;
    const numericRating = Number(rating);
    const serializedAnswers = JSON.stringify(user_answers ?? {});
    if (!factory_id || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ success: false, error: "공장과 1~5점 평점이 필요합니다." }, { status: 400 });
    }
    if (serializedAnswers.length > 10_000) {
      return NextResponse.json({ success: false, error: "피드백 내용이 너무 깁니다." }, { status: 400 });
    }

    const feedback = {
      factory_id,
      rating: numericRating,
      user_answers: serializedAnswers,
      created_at: new Date().toISOString(),
    };

    const primary = await supabase.from("matching_feedback").insert(feedback);
    const usesLegacySchema = primary.error?.code === "42703" || primary.error?.code === "PGRST204";
    const fallback = usesLegacySchema
      ? await supabase.from("matching_feedback").insert({
          session_id: auth.userId || auth.email || "authenticated-user",
          payload: {
            factory_id,
            rating: numericRating,
            user_answers: user_answers ?? {},
            created_at: feedback.created_at,
          },
        })
      : null;
    const error = fallback ? fallback.error : primary.error;

    if (error) {
      console.error("[feedback] insert failed", { code: error.code, message: error.message });
      return NextResponse.json({ success: false, error: "피드백을 저장하지 못했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "피드백이 성공적으로 저장되었습니다." });
  } catch {
    return NextResponse.json({ success: false, error: "피드백을 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated || auth.role !== "admin") {
      return unauthorized("관리자만 피드백을 조회할 수 있습니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const factoryId = searchParams.get("factory_id");

    let query = supabase.from("matching_feedback").select("*");
    if (factoryId) query = query.eq("factory_id", factoryId);
    const primary = await query.order("created_at", { ascending: false });
    const usesLegacySchema = primary.error?.code === "42703" || primary.error?.code === "PGRST204";
    const fallback = usesLegacySchema
      ? await supabase.from("matching_feedback").select("id,session_id,payload")
      : null;
    const error = fallback ? fallback.error : primary.error;

    if (error) {
      console.error("[feedback] query failed", { code: error.code, message: error.message });
      return NextResponse.json({ success: false, error: "피드백을 조회하지 못했습니다." }, { status: 500 });
    }

    const data = fallback
      ? (fallback.data || [])
          .map((row) => {
            const payload = row.payload && typeof row.payload === "object"
              ? row.payload as Record<string, unknown>
              : {};
            return { id: row.id, session_id: row.session_id, ...payload } as Record<string, unknown>;
          })
          .filter((row) => !factoryId || String(row["factory_id"]) === factoryId)
          .sort((a, b) => String(b["created_at"] || "").localeCompare(String(a["created_at"] || "")))
      : primary.data;

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, error: "피드백을 조회하지 못했습니다." }, { status: 500 });
  }
}
