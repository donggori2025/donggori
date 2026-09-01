import { NextRequest, NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseService";
import { createSessionRecord, revokeSessionToken } from "@/lib/session";
import { SESSION_DURATIONS } from "@/lib/sessionConfig";
import { readSignupProof } from "@/lib/signupProof";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      name,
      phoneNumber,
      signupMethod = "email",
    } = await request.json();

    if (signupMethod === "email") {
      return NextResponse.json(
        { error: "이메일 회원가입은 현재 운영하지 않습니다. 카카오 또는 네이버를 이용해주세요." },
        { status: 410 }
      );
    }

    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();

    if (!normalizedEmail || !normalizedName) {
      return NextResponse.json({ error: "이메일과 이름은 필수입니다." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "올바른 이메일 형식을 입력해주세요." }, { status: 400 });
    }

    if (!["kakao", "naver"].includes(signupMethod)) {
      return NextResponse.json({ error: "지원하지 않는 가입 방식입니다." }, { status: 400 });
    }

    const proofToken = request.cookies.get("signup_proof")?.value;
    const proof = await readSignupProof(proofToken);
    const proofMatches = proof?.email === normalizedEmail
      && proof.type === "sns"
      && proof.provider === signupMethod
      && !!proof.externalId;
    if (!proofMatches) {
      return NextResponse.json(
        { error: "가입 인증 정보가 없거나 만료되었습니다. 인증을 다시 진행해주세요." },
        { status: 401 }
      );
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

    const verifiedExternalId = proof.externalId;
    if (verifiedExternalId) {
      const { data: existingSocial, error: socialFindError } = await supabase
        .from("users")
        .select("id")
        .eq("signupMethod", signupMethod)
        .eq("externalId", verifiedExternalId)
        .maybeSingle();
      if (socialFindError) {
        return NextResponse.json({ error: "회원 정보 조회 중 오류가 발생했습니다." }, { status: 500 });
      }
      if (existingSocial) {
        return NextResponse.json({ error: "이미 가입된 소셜 계정입니다." }, { status: 409 });
      }
    }

    const { data: created, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          email: normalizedEmail,
          name: normalizedName,
          phoneNumber: String(phoneNumber || ""),
          password: null,
          profileImage: null,
          signupMethod,
          externalId: verifiedExternalId,
        },
      ])
      .select("id,email,name,phoneNumber,profileImage,signupMethod")
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "이미 가입된 계정입니다." }, { status: 409 });
      }
      return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
    }

    const response = NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: created,
      },
      { status: 201 }
    );

    const ttlSec = SESSION_DURATIONS.SOCIAL;
    const { token } = await createSessionRecord({
      type: "sns",
      userId: created.id,
      userEmail: created.email,
      externalId: verifiedExternalId,
      provider: signupMethod,
      isInitialized: true,
      ttlSec,
    });
    response.cookies.set("sns_access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ttlSec,
    });
    response.cookies.set("signup_proof", "", { path: "/", maxAge: 0 });
    await revokeSessionToken(proofToken!).catch(() => undefined);

    return response;
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json({ error: "회원가입 중 오류가 발생했습니다." }, { status: 500 });
  }
}
