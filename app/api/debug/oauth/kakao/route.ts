import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
  const secret = process.env.KAKAO_CLIENT_SECRET;
  const computedRedirect = `${origin}/api/auth/kakao/callback`;

  return NextResponse.json({
    origin,
    hasClientId: !!clientId,
    hasClientSecret: !!secret,
    computedRedirect,
  });
}


