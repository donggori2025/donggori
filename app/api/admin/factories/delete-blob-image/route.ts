import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/adminSession";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { url } = await req.json();
    if (typeof url !== "string") {
      return NextResponse.json({ success: false, error: "url이 필요합니다." }, { status: 400 });
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" || !parsed.hostname.endsWith(".public.blob.vercel-storage.com")) {
        return NextResponse.json({ success: false, error: "동고리 Blob 이미지 URL만 삭제할 수 있습니다." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ success: false, error: "유효하지 않은 URL입니다." }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Blob 이미지 삭제 오류:", error);
    return NextResponse.json({ success: false, error: "삭제 실패" }, { status: 500 });
  }
}
