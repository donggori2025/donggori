import { NextRequest, NextResponse } from "next/server";

// NOTE:
// 현재 동고리의 비밀번호 변경은 `/api/auth/change-password`를 통해 처리됩니다.
// 이 라우트는 과거/호환 경로로 남아있어 빌드 산출물 타입 생성 단계에서 "module" 오류를 유발할 수 있어,
// 명시적으로 404를 반환하도록 최소 구현만 둡니다.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { success: false, error: "지원하지 않는 엔드포인트입니다. /api/auth/change-password 를 사용하세요." },
    { status: 404 }
  );
}

