import { NextRequest, NextResponse } from 'next/server';
import { generateRandomName } from '@/lib/randomNameGenerator';
import { config } from '@/lib/config';
import { createUser, getUserByExternalId, getUserByEmail } from '@/lib/userService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('카카오 OAuth 콜백 파라미터:', { code: code ? '있음' : '없음', state, error });

    if (error) {
      console.error('카카오 OAuth 오류:', error);
      return NextResponse.redirect(new URL('/sign-in?error=kakao_oauth_error', request.url));
    }

    if (!code) {
      console.error('카카오 OAuth 코드가 없습니다.');
      return NextResponse.redirect(new URL('/sign-in?error=no_code', request.url));
    }

    // 카카오 OAuth 환경 변수 검증
    const kakaoClientId = config.oauth.kakao.clientId;
    const kakaoClientSecret = config.oauth.kakao.clientSecret;
    const kakaoRedirectUri = config.oauth.kakao.redirectUri;

    if (!kakaoClientId || !kakaoClientSecret) {
      console.error('카카오 OAuth 설정이 누락되었습니다:', {
        hasClientId: !!kakaoClientId,
        hasClientSecret: !!kakaoClientSecret,
      });
      return NextResponse.redirect(new URL('/sign-in?error=oauth_config_missing&provider=kakao', request.url));
    }

    // 카카오 OAuth 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: kakaoClientId,
        client_secret: kakaoClientSecret,
        code,
        redirect_uri: kakaoRedirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('카카오 OAuth 토큰 교환 실패:', errorData);
      return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log('카카오 OAuth 토큰 교환 성공');

    // 액세스 토큰을 사용하여 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        property_keys: '["kakao_account.email", "kakao_account.name", "kakao_account.phone_number"]',
      }),
    });

    if (!userInfoResponse.ok) {
      console.error('카카오 사용자 정보 조회 실패');
      return NextResponse.redirect(new URL('/sign-in?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log('카카오 사용자 정보:', userInfo);

    if (userInfo.id === undefined) {
      console.error('카카오 사용자 정보 조회 실패:', userInfo);
      return NextResponse.redirect(new URL('/sign-in?error=user_info_error', request.url));
    }

    const kakaoUser = userInfo;
    const email = kakaoUser.kakao_account?.email;
    const name = kakaoUser.kakao_account?.name || generateRandomName();
    const phoneNumber = kakaoUser.kakao_account?.phone_number;
    const profileImage = undefined;

    console.log('카카오 사용자 정보 추출:', {
      email,
      name,
      phoneNumber,
      profileImage,
      kakaoId: kakaoUser.id
    });

    if (!email) {
      console.error('카카오 사용자 이메일이 없습니다.');
      return NextResponse.redirect(new URL('/sign-in?error=no_email', request.url));
    }

    // 기존 사용자 확인
    let existingUser = await getUserByExternalId(kakaoUser.id.toString(), 'kakao');
    
    if (!existingUser) {
      // 이메일로도 확인
      existingUser = await getUserByEmail(email);
    }

    if (existingUser) {
      // 기존 사용자가 있으면 로그인 처리
      console.log('기존 카카오 사용자 로그인:', existingUser.email);
      
      const response = NextResponse.redirect(new URL('/', request.url));
      
      // 사용자 정보를 쿠키에 저장
      response.cookies.set('kakao_user', JSON.stringify({
        email: existingUser.email,
        name: existingUser.name,
        phoneNumber: existingUser.phoneNumber,
        profileImage: existingUser.profileImage,
        kakaoId: kakaoUser.id,
        isOAuthUser: true,
        signupMethod: 'kakao',
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      response.cookies.set('userType', 'user', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      response.cookies.set('isLoggedIn', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      return response;
    }

    // 전화번호가 없으면 회원가입 페이지로 이동
    if (!phoneNumber) {
      console.log('카카오 사용자 전화번호 없음, 회원가입 페이지로 이동');
      
      const response = NextResponse.redirect(new URL('/sign-up?provider=kakao', request.url));
      
      // 임시 사용자 정보를 쿠키에 저장
      response.cookies.set('temp_kakao_user', JSON.stringify({
        email,
        name,
        phoneNumber: undefined,
        profileImage,
        kakaoId: kakaoUser.id,
        isOAuthUser: true,
        signupMethod: 'kakao',
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24시간 (임시)
      });

      return response;
    }

    // 새 사용자 생성
    try {
      const newUser = await createUser({
        email,
        name,
        phoneNumber,
        profileImage,
        signupMethod: 'kakao',
        externalId: kakaoUser.id.toString(),
        kakaoMessageConsent: false,
      });

      console.log('새 카카오 사용자 생성 성공:', newUser.email);

      const response = NextResponse.redirect(new URL('/', request.url));
      
      // 사용자 정보를 쿠키에 저장
      response.cookies.set('kakao_user', JSON.stringify({
        email: newUser.email,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        profileImage: newUser.profileImage,
        kakaoId: kakaoUser.id,
        isOAuthUser: true,
        signupMethod: 'kakao',
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      response.cookies.set('userType', 'user', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      response.cookies.set('isLoggedIn', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7일
      });

      return response;

    } catch (error) {
      console.error('카카오 사용자 생성 실패:', error);
      
      if (error instanceof Error && error.message.includes('이미 등록된')) {
        return NextResponse.redirect(new URL('/sign-in?error=duplicate_user', request.url));
      }
      
      return NextResponse.redirect(new URL('/sign-in?error=user_creation_failed', request.url));
    }

  } catch (error) {
    console.error('카카오 OAuth 콜백 처리 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=server_error', request.url));
  }
}
