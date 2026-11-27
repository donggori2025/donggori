import { NextResponse } from "next/server";
import { getPublicFactoryList } from "@/lib/publicFactoryList";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getPublicFactoryList();
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "private, max-age=30" } });
  } catch {
    return NextResponse.json(
      { success: false, error: "공장 정보를 불러오지 못했습니다." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
