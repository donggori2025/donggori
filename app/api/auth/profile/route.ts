import { NextRequest, NextResponse } from "next/server";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { getServiceSupabase } from "@/lib/supabaseService";

const phonePattern = /^[0-9]{2,3}-?[0-9]{3,4}-?[0-9]{4}$/;

export async function PATCH(request: NextRequest) {
  const auth = await getRequestAuth();
  if (!auth.authenticated || auth.role !== "user" || !auth.userId) return unauthorized();

  const body = await request.json().catch(() => null);
  const name = String(body?.name ?? "").trim();
  const phoneNumber = String(body?.phoneNumber ?? "").trim();

  if (!name || name.length > 50) {
    return NextResponse.json({ error: "이름은 1~50자로 입력해주세요." }, { status: 400 });
  }
  if (phoneNumber && !phonePattern.test(phoneNumber)) {
    return NextResponse.json({ error: "올바른 전화번호를 입력해주세요." }, { status: 400 });
  }
  const updates = { name, phoneNumber };
  const { data, error } = await getServiceSupabase()
    .from("users")
    .update(updates)
    .eq("id", auth.userId)
    .select("id,email,name,phoneNumber,profileImage,signupMethod")
    .single();

  if (error) return NextResponse.json({ error: "프로필을 저장하지 못했습니다." }, { status: 500 });
  return NextResponse.json({ user: data });
}
