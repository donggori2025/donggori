import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/adminSession";

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string;

    if (!file || !folder) {
      return NextResponse.json(
        { success: false, error: "file과 folder가 필요합니다." },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const pathname = `${folder}/${timestamp}-${safeName}`;

    const blob = await put(pathname, file, { access: 'public' });

    return NextResponse.json({ success: true, url: blob.url, pathname });
  } catch (error) {
    console.error("업장 이미지 업로드 오류:", error);
    return NextResponse.json({ success: false, error: "업로드 실패" }, { status: 500 });
  }
}
