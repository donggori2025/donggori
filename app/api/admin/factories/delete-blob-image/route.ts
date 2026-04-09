import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/adminSession";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: "url이 필요합니다." }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blob 이미지 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "삭제 실패" }, { status: 500 });
  }
}
