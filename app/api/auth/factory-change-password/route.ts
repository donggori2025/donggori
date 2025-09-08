import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

// GET 메서드 추가 (테스트용)
export async function GET() {
  return NextResponse.json({ 
    message: "Factory change-password API is working",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('=== 비밀번호 변경 API 시작 ===');
    
    const body = await req.json();
    console.log('요청 body:', { 
      factoryId: body.factoryId, 
      newPassword: body.newPassword ? body.newPassword.substring(0, 3) + '***' : '' 
    });

    const { factoryId, newPassword } = body;

    // 필수 파라미터 검증
    if (!factoryId || !newPassword) {
      console.log('필수 파라미터 누락:', { 
        factoryId: !!factoryId, 
        newPassword: !!newPassword 
      });
      return NextResponse.json(
        { success: false, error: "봉제공장 ID와 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    // 새 비밀번호 길이 검증
    if (newPassword.length < 6) {
      console.log('비밀번호 길이 부족:', newPassword.length);
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    console.log('Supabase 클라이언트 생성 완료');

    // FactoryAuth 테이블에서 봉제공장 정보 확인
    console.log('봉제공장 정보 확인 시작...');
    const { data: authData, error: authError } = await supabase
      .from('FactoryAuth')
      .select('*')
      .eq('factoryId', factoryId)
      .single();

    if (authError) {
      console.error('FactoryAuth 조회 오류:', authError);
      return NextResponse.json(
        { success: false, error: "봉제공장 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!authData) {
      console.log('FactoryAuth 데이터 없음');
      return NextResponse.json(
        { success: false, error: "봉제공장 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log('FactoryAuth 데이터 조회 성공:', { 
      id: authData.id, 
      factoryId: authData.factoryId, 
      name: authData.name 
    });

    // 새 비밀번호로 업데이트 (현재 비밀번호 확인 없이)
    console.log('비밀번호 업데이트 시작...');
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
    console.log('=== 비밀번호 변경 API 완료 ===');
    
    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다."
    });

  } catch (error) {
    console.error('=== 비밀번호 변경 API 오류 ===');
    console.error('에러:', error);
    console.error('에러 타입:', typeof error);
    console.error('에러 메시지:', error instanceof Error ? error.message : String(error));
    console.error('에러 스택:', error instanceof Error ? error.stack : undefined);
    
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
