import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { validateFactoryLogin } from "@/lib/factoryAuth";

export async function POST(req: NextRequest) {
  try {
    const { factoryId, currentPassword, newPassword } = await req.json();
    
    console.log('비밀번호 변경 요청:', { 
      factoryId, 
      currentPassword: currentPassword ? currentPassword.substring(0, 3) + '***' : '', 
      newPassword: newPassword ? newPassword.substring(0, 3) + '***' : '' 
    });

    if (!factoryId || !currentPassword || !newPassword) {
      console.log('필수 파라미터 누락:', { factoryId: !!factoryId, currentPassword: !!currentPassword, newPassword: !!newPassword });
      return NextResponse.json(
        { success: false, error: "봉제공장 ID, 현재 비밀번호와 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      console.log('비밀번호 길이 부족:', newPassword.length);
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 현재 비밀번호 확인
    // factoryId를 username으로 변환 (factory01 형식)
    const username = `factory${factoryId.padStart(2, '0')}`;
    console.log('비밀번호 검증 시작:', { factoryId, username, currentPassword: currentPassword.substring(0, 3) + '***' });
    const factoryAuth = validateFactoryLogin(username, currentPassword);
    console.log('비밀번호 검증 결과:', factoryAuth ? '성공' : '실패');
    
    if (!factoryAuth) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 새 비밀번호로 업데이트
    console.log('데이터베이스 업데이트 시작:', { factoryId, newPassword: newPassword.substring(0, 3) + '***' });
    const { error: updateError } = await supabase
      .from('FactoryAuth')
      .update({ password: newPassword })
      .eq('factoryId', factoryId);

    if (updateError) {
      console.error('비밀번호 업데이트 오류:', updateError);
      return NextResponse.json(
        { success: false, error: "비밀번호 업데이트에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log('비밀번호 업데이트 성공');
    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다."
    });

  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    console.error('에러 상세:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
