import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getRequestAuth, unauthorized } from "@/lib/authHelpers";

export const runtime = "nodejs";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: Request) {
  try {
    const auth = await getRequestAuth();
    if (!auth.authenticated || (auth.role !== "admin" && auth.role !== "factory")) {
      return unauthorized("관리자 또는 공장 인증이 필요합니다.");
    }

    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "factories");
    const filename = String(form.get("filename") || `image_${Date.now()}`);

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "파일이 필요합니다." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ ok: false, error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ ok: false, error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
    const safeFilename = filename.replace(/[^a-zA-Z0-9가-힣_.-]/g, "_");
    const key = `${safeFolder}/${Date.now()}_${safeFilename}`;

    const { url } = await put(key, file, { access: "public" });
    return NextResponse.json({ ok: true, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "업로드 실패" }, { status: 400 });
  }
}
