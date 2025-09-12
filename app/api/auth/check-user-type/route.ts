import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "이메일이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 이메일로 사용자 정보 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, signupMethod, password')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('사용자 조회 오류:', error);
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "해당 이메일로 가입된 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 소셜 로그인 사용자인지 확인
    const isSocialUser = user.signupMethod && ['kakao', 'naver', 'google'].includes(user.signupMethod);
    const hasPassword = !!user.password;

    return NextResponse.json({
      isSocialUser,
      signupMethod: user.signupMethod,
      hasPassword,
      message: isSocialUser 
        ? `${user.signupMethod === 'kakao' ? '카카오' : user.signupMethod === 'naver' ? '네이버' : '소셜'}로 가입된 계정입니다.`
        : '일반 회원가입 계정입니다.'
    });

  } catch (error) {
    console.error('사용자 타입 확인 오류:', error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
