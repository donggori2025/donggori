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
    if (!auth.authenticated) {
      return unauthorized();
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const body = await req.json();

    const required = ["user_id", "user_email", "user_name", "factory_id", "factory_name", "status"];
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
    }

    const queries: Array<ReturnType<typeof supabase.from>> = [];
    if (userId) queries.push(supabase.from("match_requests").select("*").eq("user_id", userId));
    if (userEmail) queries.push(supabase.from("match_requests").select("*").eq("user_email", userEmail));
    if (factoryId) queries.push(supabase.from("match_requests").select("*").eq("factory_id", factoryId));
    if (factoryName) queries.push(supabase.from("match_requests").select("*").eq("factory_name", factoryName));

    const results = await Promise.all(queries);
    const anyError = results.find((r) => r.error);
    if (anyError && anyError.error) {
      return NextResponse.json({ success: false, error: anyError.error.message }, { status: 500 });
    }

    const mergedMap = new Map<string, unknown>();
    for (const r of results) {
      for (const row of (r.data || []) as any[]) {
        mergedMap.set(row.id, row);
      }
    }
    const merged = Array.from(mergedMap.values()).sort((a: any, b: any) => {
      const ta = a.created_at ? Date.parse(a.created_at) : 0;
      const tb = b.created_at ? Date.parse(b.created_at) : 0;
      return tb - ta;
    });

    return NextResponse.json({ success: true, data: merged });
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

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "서버 설정 오류" }, { status: 500 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id와 status가 필요합니다." }, { status: 400 });
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
