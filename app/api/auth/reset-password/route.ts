import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabaseService";
import { readSignupProof } from "@/lib/signupProof";
import { revokeSessionToken, revokeUserSessions } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, newPassword } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !newPassword) {
      return NextResponse.json(
        { success: false, error: "이메일과 새 비밀번호가 필요합니다." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 10) {
      return NextResponse.json(
        { success: false, error: "비밀번호는 10자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const proofToken = req.cookies.get("reset_proof")?.value;
    const proof = await readSignupProof(proofToken);
    if (proof?.type !== "local" || proof.email !== normalizedEmail) {
      return NextResponse.json(
        { success: false, error: "비밀번호 재설정 인증이 없거나 만료되었습니다." },
        { status: 401 }
      );
    }
    await revokeSessionToken(proofToken!);

    const supabase = getServiceSupabase();

    const { data: users, error: findError } = await supabase
      .from("users")
      .select("id, email, signupMethod")
      .eq("email", normalizedEmail)
      .limit(1);

    if (findError || !users || users.length === 0) {
      return NextResponse.json(
        { success: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const user = users[0];

    if (user.signupMethod && user.signupMethod !== "email") {
      return NextResponse.json(
        { success: false, error: "소셜 로그인으로 가입된 계정입니다." },
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
      message: "비밀번호가 재설정되었습니다. 모든 기기에서 다시 로그인해주세요.",
    });
    response.cookies.set("reset_proof", "", { path: "/", maxAge: 0 });
    response.cookies.set("access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    response.cookies.set("sns_access_token", "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
