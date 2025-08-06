import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '인증 코드가 없습니다.' },
        { status: 400 }
      );
    }

    // 여기서 OAuth 제공자(예: Google, Naver, Kakao 등)의 토큰 엔드포인트로 요청
    // 실제 구현에서는 환경 변수에서 클라이언트 ID와 시크릿을 가져와야 합니다
    
    // 예시: Google OAuth
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/v1/oauth_callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('OAuth token exchange failed:', errorData);
      return NextResponse.json(
        { error: 'OAuth 토큰 교환에 실패했습니다.' },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    
    // 액세스 토큰을 사용하여 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: '사용자 정보를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    const userInfo = await userInfoResponse.json();

    // 여기서 사용자 정보를 데이터베이스에 저장하거나 세션을 설정할 수 있습니다
    // 예시: 세션 쿠키 설정
    const response = NextResponse.json({
      success: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
    });

    // 보안을 위해 HttpOnly 쿠키로 토큰 저장
    response.cookies.set('auth_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
    });

    return response;

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 