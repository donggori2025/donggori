import { NextRequest, NextResponse } from 'next/server';
import { generateRandomName } from '@/lib/randomNameGenerator';
import { config } from '@/lib/config';
import { createUser, getUserByExternalId, getUserByEmail, linkSocialAccount } from '@/lib/userService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('네이버 OAuth 콜백 파라미터:', { code: code ? '있음' : '없음', state, error });

    if (error) {
      console.error('네이버 OAuth 오류:', error);
      return NextResponse.redirect(new URL('/sign-in?error=naver_oauth_error', request.url));
    }

    if (!code) {
      console.error('네이버 OAuth 코드가 없습니다.');
      return NextResponse.redirect(new URL('/sign-in?error=no_code', request.url));
    }

    // 네이버 OAuth 환경 변수 검증
    const naverClientId = config.oauth.naver.clientId;
    const naverClientSecret = config.oauth.naver.clientSecret;

    if (!naverClientId || !naverClientSecret) {
      console.error('네이버 OAuth 설정이 누락되었습니다:', {
        hasClientId: !!naverClientId,
        hasClientSecret: !!naverClientSecret,
      });
      return NextResponse.redirect(new URL('/sign-in?error=oauth_config_missing&provider=naver', request.url));
    }

    // 네이버 OAuth 토큰 교환
    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: naverClientId,
        client_secret: naverClientSecret,
        code,
        state: state || '',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('네이버 OAuth 토큰 교환 실패:', errorData);
      return NextResponse.redirect(new URL('/sign-in?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    console.log('네이버 OAuth 토큰 교환 성공');

    // 액세스 토큰을 사용하여 사용자 정보 가져오기
    const userInfoResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('네이버 사용자 정보 조회 실패');
      return NextResponse.redirect(new URL('/sign-in?error=user_info_failed', request.url));
    }

    const userInfo = await userInfoResponse.json();
    console.log('네이버 사용자 정보:', userInfo);

    if (userInfo.resultcode !== '00') {
      console.error('네이버 사용자 정보 조회 실패:', userInfo.message);
      return NextResponse.redirect(new URL('/sign-in?error=user_info_error', request.url));
    }

    const naverUser = userInfo.response;
    const email = naverUser.email;
    const name = naverUser.name || naverUser.nickname || generateRandomName();
    const profileImage = naverUser.profile_image;

    console.log('네이버 사용자 정보 추출:', {
      email,
      name,
      profileImage,
      naverId: naverUser.id
    });

    if (!email) {
      console.error('네이버 사용자 이메일이 없습니다.');
      return NextResponse.redirect(new URL('/sign-in?error=no_email', request.url));
    }

    // 기존 사용자 확인 (중복 회원가입 방지)
    let existingUser = await getUserByExternalId(naverUser.id, 'naver');
    
    if (!existingUser) {
      // 이메일로도 확인 (다른 소셜 로그인으로 가입한 사용자)
      existingUser = await getUserByEmail(email);
      if (existingUser) {
        console.log('이미 다른 방법으로 가입된 사용자:', existingUser.email);
        // 기존 사용자 정보를 업데이트하여 네이버 연동
        try {
          const updatedUser = await linkSocialAccount(existingUser.id, naverUser.id, 'naver');
          existingUser = updatedUser;
          console.log('네이버 계정 연동 완료:', existingUser.email);
        } catch (updateError) {
          console.error('사용자 정보 업데이트 실패:', updateError);
        }
      }
    }

    if (existingUser) {
      // 기존 사용자가 있으면 로그인 처리
      console.log('기존 네이버 사용자 로그인:', existingUser.email);
      
      const response = NextResponse.redirect(new URL('/', request.url));
      
      // 사용자 정보를 쿠키에 저장
      response.cookies.set('naver_user', JSON.stringify({
        email: existingUser.email,
        name: existingUser.name,
        phoneNumber: existingUser.phoneNumber,
        profileImage: existingUser.profileImage,
        naverId: naverUser.id,
        isOAuthUser: true,
        signupMethod: 'naver',
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

    // 네이버는 전화번호를 제공하지 않으므로 회원가입 페이지로 이동
    console.log('네이버 사용자 회원가입 페이지로 이동');
    
    const response = NextResponse.redirect(new URL('/sign-up?provider=naver', request.url));
    
    // 임시 사용자 정보를 쿠키에 저장
    response.cookies.set('temp_naver_user', JSON.stringify({
      email,
      name,
      phoneNumber: undefined,
      profileImage,
      naverId: naverUser.id,
      isOAuthUser: true,
      signupMethod: 'naver',
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24시간 (임시)
    });

    return response;

  } catch (error) {
    console.error('네이버 OAuth 콜백 처리 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=server_error', request.url));
  }
}
