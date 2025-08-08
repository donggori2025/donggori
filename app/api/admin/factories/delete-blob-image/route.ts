import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { del } from "@vercel/blob";

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
