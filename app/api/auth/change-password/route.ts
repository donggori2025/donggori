import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";
import { revokeUserSessions } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated || auth.role !== "user" || !auth.userId) {
      return unauthorized("로그인이 필요합니다.");
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호와 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 10) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 10자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password")
      .eq("id", auth.userId)
      .maybeSingle();

    if (error || !user || !user.password) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "비밀번호 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    await revokeUserSessions(user.id);

    const response = NextResponse.json({
      success: true,
      message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
    });
    response.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set("sns_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
