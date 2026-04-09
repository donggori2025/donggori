import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

const ALLOWED_COLUMNS = new Set([
  "company_name",
  "name",
  "address",
  "phone_number",
  "contact",
  "business_type",
  "intro",
  "description",
  "moq",
  "monthly_capacity",
  "image",
  "images",
  "lat",
  "lng",
  "admin_district",
  "updated_at",
]);

export async function POST(request: NextRequest) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated || (auth.role !== "admin" && auth.role !== "factory")) {
      return unauthorized("관리자 또는 공장 인증이 필요합니다.");
    }

    const body = await request.json();
    const { factoryId, updateData } = body;

    if (!factoryId || !updateData) {
      return NextResponse.json(
        { success: false, error: "factoryId와 updateData가 필요합니다." },
        { status: 400 }
      );
    }

    if (auth.role === "factory" && auth.userId !== String(factoryId)) {
      return unauthorized("자신의 공장 정보만 수정할 수 있습니다.");
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (ALLOWED_COLUMNS.has(key)) {
        sanitized[key] = value;
      }
    }

    if (Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        { success: false, error: "수정 가능한 필드가 없습니다." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabaseService
      .from("donggori")
      .update(sanitized)
      .eq("id", parseInt(factoryId))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("공장 정보 업데이트 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
