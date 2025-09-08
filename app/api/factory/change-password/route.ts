import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { validateFactoryLogin } from "@/lib/factoryAuth";

export async function POST(req: NextRequest) {
  try {
    const { currentPassword, newPassword, companyName } = await req.json();

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

    // 추가 인증 없이 진행: 로그인 시 설정된 쿠키만 사용
    const supabase = getServiceSupabase();

    // 토큰에서 봉제공장 정보 추출 (실제로는 JWT 토큰을 디코딩해야 함)
    // 여기서는 간단히 쿠키에서 정보를 가져오는 방식으로 구현
    const factoryAuthCookie = req.headers.get('cookie');
    if (!factoryAuthCookie) {
      return NextResponse.json(
        { success: false, error: "봉제공장 인증 정보가 없습니다." },
        { status: 401 }
      );
    }

    // 쿠키에서 봉제공장 정보 파싱 (factory_user 우선, 없으면 factory_auth 호환)
    const factoryUserMatch = factoryAuthCookie.match(/(?:^|; )factory_user=([^;]+)/);
    const legacyFactoryAuthMatch = factoryAuthCookie.match(/(?:^|; )factory_auth=([^;]+)/);
    const rawFactory = factoryUserMatch?.[1] ?? legacyFactoryAuthMatch?.[1];
    if (!rawFactory) {
      return NextResponse.json(
        { success: false, error: "봉제공장 인증 정보를 찾을 수 없습니다." },
        { status: 401 }
      );
    }

    let factoryAuth;
    try {
      factoryAuth = JSON.parse(decodeURIComponent(rawFactory));
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "봉제공장 인증 정보가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 현재 비밀번호 확인
    const isValidPassword = validateFactoryLogin(factoryAuth.factoryId, currentPassword);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // company_name 일치 확인
    const { data: factoryRows, error: findError } = await supabase
      .from('factories')
      .select('id, company_name')
      .eq('id', factoryAuth.factoryId)
      .limit(1);
    if (findError || !factoryRows || factoryRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "봉제공장 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }
    const dbName = (factoryRows[0].company_name || '').trim();
    const inputName = (companyName || '').trim();
    if (!inputName || dbName !== inputName) {
      return NextResponse.json(
        { success: false, error: "회사명이 일치하지 않습니다." },
        { status: 400 }
      );
    }

    // 새 비밀번호로 업데이트
    const { error: updateError } = await supabase
      .from('factories')
      .update({ password: newPassword })
      .eq('id', factoryAuth.factoryId);

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

// CORS/프리플라이트 또는 헬스체크 용도
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 204 });
}

export async function GET() {
  return NextResponse.json({ ok: true, route: 'factory/change-password' });
}
