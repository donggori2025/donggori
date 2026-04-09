import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated || (auth.role !== "admin" && auth.role !== "factory")) {
      return unauthorized("관리자 또는 공장 인증이 필요합니다.");
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ ok: false, error: "url이 필요합니다." }, { status: 400 });
    }

    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes("vercel-storage.com") && !parsed.hostname.includes("blob.")) {
        return NextResponse.json({ ok: false, error: "유효하지 않은 이미지 URL입니다." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "유효하지 않은 URL 형식입니다." }, { status: 400 });
    }

    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "삭제 실패" }, { status: 400 });
  }
}
