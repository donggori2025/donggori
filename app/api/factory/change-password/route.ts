import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { validateFactoryLogin } from "@/lib/factoryAuth";

export async function POST(req: NextRequest) {
  try {
    const { factoryId, currentPassword, newPassword } = await req.json();

    if (!factoryId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "봉제공장 ID, 현재 비밀번호와 새 비밀번호가 필요합니다." },
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

    // 현재 비밀번호 확인
    const isValidPassword = validateFactoryLogin(factoryId, currentPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 새 비밀번호로 업데이트
    const { error: updateError } = await supabase
      .from('factories')
      .update({ password: newPassword })
      .eq('id', factoryId);

    if (updateError) {
      console.error('비밀번호 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, error: "비밀번호 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다."
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
