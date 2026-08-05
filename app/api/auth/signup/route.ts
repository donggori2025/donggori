import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabaseService";
import { createSessionRecord } from "@/lib/session";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      phoneNumber,
      profileImage,
      signupMethod = "email",
      externalId,
      kakaoMessageConsent = false,
    } = await request.json();

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();

    if (!normalizedEmail || !normalizedName) {
      return NextResponse.json({ error: "이메일과 이름은 필수입니다." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "올바른 이메일 형식을 입력해주세요." }, { status: 400 });
    }

    if (!["email", "kakao", "naver"].includes(signupMethod)) {
      return NextResponse.json({ error: "지원하지 않는 가입 방식입니다." }, { status: 400 });
    }

    if (signupMethod === "email") {
      if (!password || String(password).length < 6) {
        return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
      }
    }

    const supabase = getServiceSupabase();
    const { data: existing, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ error: "회원 정보 조회 중 오류가 발생했습니다." }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }

    const hashedPassword =
      signupMethod === "email" && password ? await bcrypt.hash(String(password), 12) : null;

    if (signupMethod !== "email" && !externalId) {
      return NextResponse.json({ error: "소셜 계정 정보가 없습니다. 다시 로그인해주세요." }, { status: 400 });
    }

    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          email: normalizedEmail,
          name: normalizedName,
          phoneNumber: String(phoneNumber || ""),
          password: hashedPassword,
          profileImage: profileImage || null,
          signupMethod,
          externalId: externalId || null,
          kakaoMessageConsent: Boolean(kakaoMessageConsent),
        },
      ])
      .select("id,email,name,phoneNumber,profileImage,signupMethod")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }

    const response = NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: created,
      },
      { status: 201 }
    );

    // 소셜 회원가입은 브라우저가 조작 가능한 프로필 쿠키가 아닌 서버 검증 세션으로 인증한다.
    if (signupMethod !== "email") {
      const { token } = await createSessionRecord({
        type: "sns",
        userId: created.id,
        userEmail: created.email,
        externalId: externalId || null,
        provider: signupMethod,
        isInitialized: true,
        ttlSec: SESSION_DURATIONS.SOCIAL,
      });
      response.cookies.set("sns_access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATIONS.SOCIAL,
      });
    }

    return response;
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
