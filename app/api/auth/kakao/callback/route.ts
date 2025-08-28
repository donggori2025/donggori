import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  console.log('카카오 OAuth 콜백 시작:', { code: !!code, error });

  if (error) {
    console.error('카카오 OAuth 에러:', error);
    return NextResponse.redirect(new URL(`/sign-in?error=kakao_oauth_error&message=${encodeURIComponent(error)}`, request.url));
  }

  if (!code) {
    console.error('카카오 OAuth: code가 없습니다.');
    return NextResponse.redirect(new URL('/sign-in?error=no_code', request.url));
  }

  if (!config.oauth.kakao.clientId || !config.oauth.kakao.clientSecret) {
    console.error('카카오 OAuth 설정 누락:', {
      clientId: !!config.oauth.kakao.clientId,
      clientSecret: !!config.oauth.kakao.clientSecret
    });
    return NextResponse.redirect(new URL('/sign-in?error=oauth_config_missing', request.url));
  }

  try {
    console.log('카카오 액세스 토큰 교환 시작');
    
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
      const errorText = await tokenResponse.text();
      console.error('카카오 OAuth: 토큰 교환 실패', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('카카오 액세스 토큰 획득 성공');

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
      const errorText = await userResponse.text();
      console.error('카카오 OAuth: 사용자 정보 가져오기 실패', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorText
      });
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

    console.log('통합 사용자 시스템에 저장 시작:', userPayload);

    const userResponse2 = await fetch(`${request.nextUrl.origin}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse2.ok) {
      const errorText = await userResponse2.text();
      console.error('통합 사용자 관리: 사용자 저장 실패', {
        status: userResponse2.status,
        statusText: userResponse2.statusText,
        error: errorText
      });
      return NextResponse.redirect(new URL('/sign-in?error=user_save_failed', request.url));
    }

    const { data: savedUser } = await userResponse2.json();
    console.log('통합 사용자 시스템 저장 성공:', savedUser);

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

    console.log('카카오 OAuth 로그인 완료 - 홈페이지로 리다이렉트');
    return response;

  } catch (error) {
    console.error('카카오 OAuth 콜백 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=callback_failed', request.url));
  }
}
