import { NextRequest, NextResponse } from "next/server";
import { readSignupProof } from "@/lib/signupProof";

export async function GET(request: NextRequest) {
  const proof = await readSignupProof(request.cookies.get("signup_proof")?.value);
  if (!proof || proof.type !== "sns" || !["kakao", "naver"].includes(proof.provider || "")) {
    return NextResponse.json(
      { error: "소셜 가입 인증 정보가 없거나 만료되었습니다." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    { provider: proof.provider, email: proof.email },
    { headers: { "Cache-Control": "no-store" } }
  );
}
