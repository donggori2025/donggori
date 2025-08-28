import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    console.error('카카오 OAuth: code가 없습니다.');
    return NextResponse.redirect(new URL('/sign-in?error=no_code', request.url));
  }

  try {
    // 1. 액세스 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.oauth.kakao.clientId,
        client_secret: config.oauth.kakao.clientSecret,
        code: code,
        redirect_uri: config.oauth.kakao.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('카카오 OAuth: 토큰 교환 실패', await tokenResponse.text());
      return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        property_keys: '["kakao_account.email", "kakao_account.name", "kakao_account.phone_number", "properties.nickname", "properties.profile_image"]',
      }),
    });

    if (!userResponse.ok) {
      console.error('카카오 OAuth: 사용자 정보 가져오기 실패', await userResponse.text());
      return NextResponse.redirect(new URL('/sign-in?error=user_info_failed', request.url));
    }

    const userData = await userResponse.json();
    const kakaoUser = userData;

    console.log('카카오 사용자 정보:', {
      email: kakaoUser.kakao_account?.email,
      name: kakaoUser.kakao_account?.name || kakaoUser.properties?.nickname,
      profileImage: kakaoUser.properties?.profile_image,
      phoneNumber: kakaoUser.kakao_account?.phone_number,
      kakaoId: kakaoUser.id
    });

    // 3. 통합 사용자 관리 시스템에 저장
    const userPayload = {
      email: kakaoUser.kakao_account?.email,
      name: kakaoUser.kakao_account?.name || kakaoUser.properties?.nickname,
      phone: kakaoUser.kakao_account?.phone_number,
      profileImage: kakaoUser.properties?.profile_image,
      loginMethod: 'kakao' as const,
      externalId: kakaoUser.id.toString(),
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
    const kakaoUserCookie = JSON.stringify({
      email: kakaoUser.kakao_account?.email,
      name: kakaoUser.kakao_account?.name || kakaoUser.properties?.nickname,
      profileImage: kakaoUser.properties?.profile_image,
      phoneNumber: kakaoUser.kakao_account?.phone_number,
      kakaoId: kakaoUser.id
    });

    const response = NextResponse.redirect(new URL('/', request.url));
    
    // 쿠키 설정
    response.cookies.set('kakao_user', kakaoUserCookie, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
      path: '/',
    });

    response.cookies.set('userType', 'kakao', {
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
    console.error('카카오 OAuth 콜백 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=callback_failed', request.url));
  }
}
