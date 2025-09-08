import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { config } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get("requestId");
    const limit = Number(url.searchParams.get("limit") || 20);

    if (!config.supabase.url || !config.supabase.serviceRoleKey) {
      return NextResponse.json({ ok: false, error: "Supabase 설정 누락" }, { status: 500 });
    }

    const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false },
    });

    let query = supabase
      .from("message_logs")
      .select("id, work_order_id, channel, to, status, error, created_at, payload")
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (requestId) {
      query = query.eq("work_order_id", requestId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, count: data?.length || 0, data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "unknown" }, { status: 500 });
  }
}


