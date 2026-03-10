import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabase } from "@/lib/supabaseService";

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
      .select("id,email,name")
      .single();

    if (insertError) {
      return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: created,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}