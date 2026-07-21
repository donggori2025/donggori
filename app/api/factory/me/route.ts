import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

export async function GET(req: NextRequest) {
  try {
    const auth = await getRequestAuth(req);
    if (!auth.authenticated || (auth.role !== "factory" && auth.role !== "admin")) {
      return unauthorized("공장 인증이 필요합니다.");
    }

    const factoryId = req.nextUrl.searchParams.get("factoryId") || auth.userId;
    if (!factoryId) {
      return NextResponse.json({ success: false, error: "factoryId가 필요합니다." }, { status: 400 });
    }

    if (auth.role === "factory" && auth.userId !== String(factoryId)) {
      return unauthorized("자신의 공장 정보만 조회할 수 있습니다.");
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase
      .from("donggori")
      .select("*")
      .eq("id", parseInt(String(factoryId), 10))
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ success: false, error: "업장을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("공장 정보 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
