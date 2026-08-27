import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessMatchRequest } from "@/lib/matchRequestAuth";

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
    if (!auth.authenticated) {
      return unauthorized();
    }
    if (auth.role === "factory") {
      return unauthorized("의뢰는 일반 사용자 또는 관리자만 생성할 수 있습니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await req.json();

    // 일반 사용자는 요청 본문의 사용자 식별자를 신뢰하지 않는다.
    // 로그인 세션에서 확인한 본인 정보로 강제해 타인 명의 의뢰 생성을 막는다.
    if (auth.role === "user") {
      body.user_id = auth.userId;
      body.user_email = auth.email;
      body.status = "pending";
    }

    const required = ["user_id", "user_email", "user_name", "factory_id", "factory_name"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `필수 필드가 누락되었습니다: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("match_requests")
      .insert({
        user_id: body.user_id,
        user_email: body.user_email,
        user_name: body.user_name,
        factory_id: body.factory_id,
        factory_name: body.factory_name,
        status: body.status ?? "pending",
        items: body.items ?? [],
        quantity: body.quantity ?? 0,
        description: body.description ?? "",
        contact: body.contact ?? "",
        deadline: body.deadline ?? "",
        budget: body.budget ?? "",
        additional_info: body.additional_info ?? null,
        created_at: body.created_at ?? new Date().toISOString(),
        updated_at: body.updated_at ?? new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message, code: insertError.code },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error?.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated) {
      return unauthorized();
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userEmail = searchParams.get("userEmail");
    const factoryId = searchParams.get("factoryId");
    const factoryName = searchParams.get("factoryName");
    const requestId = searchParams.get("id");

    if (requestId) {
      const { data, error } = await supabase
        .from("match_requests")
        .select("*")
        .eq("id", requestId)
        .limit(1);
      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      if (data?.[0] && !canAccessMatchRequest(auth, data[0])) {
        return unauthorized("해당 의뢰를 조회할 권한이 없습니다.");
      }
      return NextResponse.json({ success: true, data });
    }

    if (!userId && !userEmail && !factoryId && !factoryName) {
      return NextResponse.json(
        { success: false, error: "쿼리 파라미터가 필요합니다: userId/userEmail 또는 factoryId/factoryName" },
        { status: 400 }
      );
    }

    if (auth.role === "user") {
      if (factoryId && !userId && !userEmail) {
        return unauthorized("자신의 의뢰 내역만 조회할 수 있습니다.");
      }
      if ((userId && userId !== auth.userId) || (userEmail && userEmail !== auth.email)) {
        return unauthorized("자신의 의뢰 내역만 조회할 수 있습니다.");
      }
    }
    if (auth.role === "factory" && (
      userId || userEmail || factoryName || (factoryId && factoryId !== auth.userId)
    )) {
      return unauthorized("자신의 공장 의뢰만 조회할 수 있습니다.");
    }

    // 조건을 하나의 쿼리로 합쳐 Supabase 타입 이슈를 피하고, 결과를 예측 가능하게 만듭니다.
    let query = supabase.from("match_requests").select("*");
    if (auth.role === "user") {
      if (auth.userId) query = query.eq("user_id", auth.userId);
      else if (auth.email) query = query.eq("user_email", auth.email);
    } else if (auth.role === "admin") {
      if (userId) query = query.eq("user_id", userId);
      if (userEmail) query = query.eq("user_email", userEmail);
    }
    if (auth.role === "factory") {
      query = query.eq("factory_id", auth.userId);
    } else {
      if (factoryId) query = query.eq("factory_id", factoryId);
      if (factoryName) query = query.eq("factory_name", factoryName);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error?.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated) {
      return unauthorized();
    }
    if (auth.role !== "admin" && auth.role !== "factory") {
      return unauthorized("의뢰 상태는 공장 또는 관리자만 변경할 수 있습니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { id, status } = await req.json();
    const allowedStatuses = new Set(["pending", "accepted", "rejected", "completed"]);
    if (!id || !allowedStatuses.has(status)) {
      return NextResponse.json({ success: false, error: "id와 status가 필요합니다." }, { status: 400 });
    }

    const { data: target, error: targetError } = await supabase
      .from("match_requests")
      .select("id,user_id,user_email,factory_id")
      .eq("id", id)
      .maybeSingle();
    if (targetError) {
      return NextResponse.json({ success: false, error: targetError.message }, { status: 500 });
    }
    if (!target) {
      return NextResponse.json({ success: false, error: "의뢰를 찾을 수 없습니다." }, { status: 404 });
    }
    if (!canAccessMatchRequest(auth, target)) {
      return unauthorized("해당 의뢰를 수정할 권한이 없습니다.");
    }

    const { error } = await supabase
      .from("match_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { success: false, error: error?.message || "알 수 없는 오류" },
      { status: 500 }
    );
  }
}
