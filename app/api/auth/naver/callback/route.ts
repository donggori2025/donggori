import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    console.error('네이버 OAuth: code가 없습니다.');
    return NextResponse.redirect(new URL('/sign-in?error=no_code', request.url));
  }

  try {
    // 1. 액세스 토큰 교환
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.oauth.naver.clientId,
        client_secret: config.oauth.naver.clientSecret,
        code: code,
        state: state || '',
      }),
    });

    if (!tokenResponse.ok) {
      console.error('네이버 OAuth: 토큰 교환 실패', await tokenResponse.text());
      return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 사용자 정보 가져오기
    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('네이버 OAuth: 사용자 정보 가져오기 실패', await userResponse.text());
      return NextResponse.redirect(new URL('/sign-in?error=user_info_failed', request.url));
    }

    const userData = await userResponse.json();
    const naverUser = userData.response;

    console.log('네이버 사용자 정보:', {
      email: naverUser.email,
      name: naverUser.name,
      profileImage: naverUser.profile_image,
      naverId: naverUser.id
    });

    // 3. 통합 사용자 관리 시스템에 저장
    const userPayload = {
      email: naverUser.email,
      name: naverUser.name,
      profileImage: naverUser.profile_image,
      loginMethod: 'naver' as const,
      externalId: naverUser.id,
      kakaoMessageConsent: false
    };

    const userResponse2 = await fetch(`${request.nextUrl.origin}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse2.ok) {
      console.error('통합 사용자 관리: 사용자 저장 실패', await userResponse2.text());
      return NextResponse.redirect(new URL('/sign-in?error=user_save_failed', request.url));
    }

    const { data: savedUser } = await userResponse2.json();

    // 4. 쿠키 설정 (기존 호환성 유지)
    const naverUserCookie = JSON.stringify({
      email: naverUser.email,
      name: naverUser.name,
      profileImage: naverUser.profile_image,
      naverId: naverUser.id
    });

    const response = NextResponse.redirect(new URL('/', request.url));
    
    // 쿠키 설정
    response.cookies.set('naver_user', naverUserCookie, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    });

    response.cookies.set('userType', 'naver', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    });

    response.cookies.set('isLoggedIn', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('네이버 OAuth 콜백 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=callback_failed', request.url));
  }
}
