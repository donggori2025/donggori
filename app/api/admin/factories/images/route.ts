import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { list } from "@vercel/blob";

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session) {
    return NextResponse.json({ success: false, error: "관리자 인증 필요" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");

    if (!folder) {
      return NextResponse.json(
        { success: false, error: "folder 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const { blobs } = await list({ prefix: `${folder}/` });

    const images = blobs.map(b => ({
      url: b.url,
      pathname: b.pathname,
      size: b.size,
      uploadedAt: b.uploadedAt,
    }));

    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error("이미지 목록 조회 오류:", error);
    return NextResponse.json(
      { success: false, error: "이미지 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
