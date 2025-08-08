import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put } from "@vercel/blob";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: "파일이 없습니다." }, { status: 400 });
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
    }

    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "파일 크기는 10MB 이하여야 합니다." }, { status: 400 });
    }

    // 파일명 생성 (중복 방지)
    const timestamp = Date.now();
    const fileName = `factory-images/${timestamp}-${file.name}`;

    // Vercel Blob에 업로드
    const blob = await put(fileName, file, {
      access: 'public',
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: fileName
    });

  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    return NextResponse.json({ 
      success: false, 
      error: "이미지 업로드에 실패했습니다." 
    }, { status: 500 });
  }
}
