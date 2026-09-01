import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, error: "이메일 인증은 현재 운영하지 않습니다. 카카오 또는 네이버를 이용해주세요." },
    { status: 410 }
  );
}
