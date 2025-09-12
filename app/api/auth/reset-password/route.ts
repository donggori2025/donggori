import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { success: false, error: "이메일과 새 비밀번호가 필요합니다." },
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

    // 이메일로 사용자 찾기
    const { data: users, error: findError } = await supabase
      .from('users')
      .select('id, email, phoneNumber')
      .eq('email', email)
      .limit(1);

    if (findError) {
      console.error('사용자 조회 오류:', findError);
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "해당 이메일로 가입된 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const user = users[0];

    // Supabase를 통해 비밀번호 업데이트
    try {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      const { error: updateError } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', user.id);

      if (updateError) {
        console.error('비밀번호 업데이트 오류:', updateError);
        return NextResponse.json(
          { success: false, error: "비밀번호 업데이트에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "비밀번호가 성공적으로 재설정되었습니다."
      });

    } catch (updateError) {
      console.error('비밀번호 해싱/업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, error: "비밀번호 업데이트 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
