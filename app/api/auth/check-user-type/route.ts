import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("id, signupMethod")
      .eq("email", email)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({
        exists: false,
        message: "계정 정보를 확인할 수 없습니다.",
      });
    }

    const isSocialUser =
      user.signupMethod && ["kakao", "naver", "google"].includes(user.signupMethod);

    return NextResponse.json({
      exists: true,
      isSocialUser: !!isSocialUser,
      signupMethod: isSocialUser ? user.signupMethod : "email",
      message: isSocialUser
        ? `${user.signupMethod === "kakao" ? "카카오" : user.signupMethod === "naver" ? "네이버" : "소셜"}로 가입된 계정입니다.`
        : "일반 회원가입 계정입니다.",
    });
  } catch (error) {
    console.error("사용자 타입 확인 오류:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
