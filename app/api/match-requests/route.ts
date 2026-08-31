import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { canAccessMatchRequest } from "@/lib/matchRequestAuth";

const REQUEST_SELECT = "id,user_id,user_email,user_name,factory_id,factory_name,status,items,quantity,description,contact,deadline,budget,additional_info,created_at,updated_at";

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
    if (auth.role !== "user") {
      return unauthorized("의뢰는 로그인한 사용자만 생성할 수 있습니다.");
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await req.json();

    const { data: account, error: accountError } = await supabase
      .from("users")
      .select("id,email,name")
      .eq("id", auth.userId)
      .maybeSingle();
    if (accountError || !account?.email || !account?.name) {
      return unauthorized("사용자 정보를 확인할 수 없습니다. 다시 로그인해주세요.");
    }

    // Client identity, status, timestamps and factory name are never trusted.
    body.user_id = account.id;
    body.user_email = account.email;
    body.status = "pending";

    const required = ["user_id", "user_email", "factory_id"];
    const missing = required.filter((k) => !body?.[k]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, error: `필수 필드가 누락되었습니다: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const userName = String(account.name).trim().slice(0, 80);
    const contact = String(body.contact || "").trim().slice(0, 60);
    const description = String(body.description || "").trim().slice(0, 4000);
    if (!userName || !contact) {
      return NextResponse.json({ success: false, error: "이름과 연락처를 입력해주세요." }, { status: 400 });
    }

    let factoryName = "디자인 의뢰";
    if (String(body.factory_id) !== "design-request") {
      const { data: factory, error: factoryError } = await supabase
        .from("donggori")
        .select("id,company_name")
        .eq("id", String(body.factory_id))
        .maybeSingle();
      if (factoryError) return NextResponse.json({ success: false, error: "공장 정보를 확인할 수 없습니다." }, { status: 500 });
      if (!factory?.company_name) return NextResponse.json({ success: false, error: "대상 공장을 찾을 수 없습니다." }, { status: 404 });
      factoryName = factory.company_name;
    }

    const now = new Date().toISOString();
    const { data: inserted, error: insertError } = await supabase
      .from("match_requests")
      .insert({
        user_id: body.user_id,
        user_email: body.user_email,
        user_name: userName,
        factory_id: body.factory_id,
        factory_name: factoryName,
        status: "pending",
        items: Array.isArray(body.items) ? body.items.filter((item: unknown) => typeof item === "string").slice(0, 20) : [],
        quantity: Math.max(0, Math.min(Number(body.quantity) || 0, 1_000_000_000)),
        description,
        contact,
        deadline: String(body.deadline || "").slice(0, 60),
        budget: String(body.budget || "").slice(0, 80),
        additional_info: typeof body.additional_info === "string" ? body.additional_info.slice(0, 8000) : null,
        created_at: now,
        updated_at: now,
      })
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: "의뢰를 저장하지 못했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: inserted?.id });
  } catch {
    return NextResponse.json(
      { success: false, error: "의뢰를 처리하지 못했습니다." },
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
    const requestId = searchParams.get("id");

    if (requestId) {
      const { data, error } = await supabase
        .from("match_requests")
        .select(REQUEST_SELECT)
        .eq("id", requestId)
        .limit(1);
      if (error) {
        return NextResponse.json({ success: false, error: "의뢰를 조회하지 못했습니다." }, { status: 500 });
      }
      if (data?.[0] && !canAccessMatchRequest(auth, data[0])) {
        return unauthorized("해당 의뢰를 조회할 권한이 없습니다.");
      }
      return NextResponse.json({ success: true, data });
    }

    // A user can only enumerate their own requests. Admin filters are optional.
    let query = supabase.from("match_requests").select(REQUEST_SELECT);
    if (auth.role === "user") {
      if (auth.userId) query = query.eq("user_id", auth.userId);
      else if (auth.email) query = query.eq("user_email", auth.email);
    } else if (auth.role === "admin") {
      if (userId) query = query.eq("user_id", userId);
      if (userEmail) query = query.eq("user_email", userEmail);
    } else {
      return unauthorized();
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ success: false, error: "의뢰내역을 조회하지 못했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch {
    return NextResponse.json(
      { success: false, error: "의뢰내역을 조회하지 못했습니다." },
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
    if (auth.role !== "admin") {
      return unauthorized("의뢰 상태는 관리자만 변경할 수 있습니다.");
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
      return NextResponse.json({ success: false, error: "의뢰를 확인하지 못했습니다." }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "의뢰 상태를 변경하지 못했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "의뢰 상태를 변경하지 못했습니다." },
      { status: 500 }
    );
  }
}
