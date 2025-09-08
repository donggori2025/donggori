import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword, factoryId } = await req.json();
    
    // 봉제공장 사용자인 경우
    if (factoryId) {
      console.log('봉제공장 비밀번호 변경 요청:', { factoryId, newPassword: newPassword ? newPassword.substring(0, 3) + '***' : '' });
      
      if (!newPassword) {
        return NextResponse.json(
          { success: false, error: "새 비밀번호가 필요합니다." },
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

      // 새 비밀번호로 업데이트
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
      return NextResponse.json({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다."
      });
    }
    
    // 일반 사용자인 경우 (기존 Clerk 로직)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호와 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // Clerk를 통해 현재 비밀번호 확인 및 새 비밀번호로 업데이트
    try {
      // 1. 현재 비밀번호 확인을 위해 로그인 시도
      const verifyResponse = await fetch('https://api.clerk.com/v1/sessions/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          password: currentPassword,
        }),
      });

      if (!verifyResponse.ok) {
        return NextResponse.json(
          { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
          { status: 400 }
        );
      }

      // 2. 새 비밀번호로 업데이트
      const updateResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: newPassword,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Clerk 비밀번호 업데이트 오류:', errorData);
        return NextResponse.json(
          { success: false, error: "비밀번호 업데이트에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다."
      });

    } catch (clerkError) {
      console.error('Clerk API 호출 오류:', clerkError);
      return NextResponse.json(
        { success: false, error: "비밀번호 변경 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

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
