import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServiceSupabase } from "@/lib/supabaseService";
import { deleteImageFromBlob } from "@/lib/vercelBlobConfig";

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
    const { factoryId, imageUrl } = await req.json();

    if (!factoryId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "factoryId와 imageUrl이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. 현재 업장의 이미지 정보 가져오기
    const { data: factory, error: fetchError } = await supabase
      .from("donggori")
      .select("images")
      .eq("id", factoryId)
      .single();

    if (fetchError) {
      return NextResponse.json(
        { success: false, error: "업장 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 이미지 배열에서 해당 이미지 제거
    const currentImages = factory.images || [];
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    // 3. DB 업데이트
    const { error: updateError } = await supabase
      .from("donggori")
      .update({ images: updatedImages })
      .eq("id", factoryId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "이미지 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 4. Vercel Blob에서 이미지 파일 삭제
    try {
      await deleteImageFromBlob(imageUrl);
    } catch (blobError) {
      console.warn("Blob에서 이미지 삭제 실패:", blobError);
      // Blob 삭제 실패해도 DB는 업데이트되었으므로 성공으로 처리
    }

    return NextResponse.json({ 
      success: true, 
      message: "이미지가 삭제되었습니다.",
      remainingImages: updatedImages
    });

  } catch (error) {
    console.error("이미지 삭제 오류:", error);
    return NextResponse.json(
      { success: false, error: "이미지 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
