import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "이 엔드포인트는 더 이상 사용되지 않습니다. /api/auth/signup을 사용해주세요." },
    { status: 410 }
  );
}
