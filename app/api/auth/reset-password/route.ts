import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, otpCode } = await req.json();

    if (!email || !newPassword || !otpCode) {
      return NextResponse.json(
        { success: false, error: "이메일, 새 비밀번호, 인증 코드가 모두 필요합니다." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: otpRecords, error: otpError } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("purpose", "reset")
      .order("created_at", { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: "인증 요청을 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    if (otpRecord.code !== otpCode) {
      return NextResponse.json(
        { success: false, error: "인증 코드가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: "인증 코드가 만료되었습니다." },
        { status: 400 }
      );
    }

    if (otpRecord.consumed_at) {
      return NextResponse.json(
        { success: false, error: "이미 사용된 인증 코드입니다." },
        { status: 400 }
      );
    }

    const { data: users, error: findError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .limit(1);

    if (findError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const user = users[0];

    const bcrypt = await import("bcryptjs");
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

    await supabase
      .from("email_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", otpRecord.id);

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다.",
    });
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
