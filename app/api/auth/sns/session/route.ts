import { NextResponse } from 'next/server';

// 세션은 OAuth 콜백과 회원가입 서버 라우트에서만 직접 발급한다.
// 이 공개 엔드포인트는 이메일만으로 타인 세션을 만들 수 있었으므로 폐기한다.
export async function POST() {
  return NextResponse.json({ error: '지원하지 않는 엔드포인트입니다.' }, { status: 410 });
}

