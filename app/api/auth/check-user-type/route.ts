import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ error: "지원하지 않는 엔드포인트입니다." }, { status: 410 });
}
