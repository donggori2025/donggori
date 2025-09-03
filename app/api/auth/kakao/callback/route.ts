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

    // Kakao는 client_secret이 선택 사항일 수 있으므로 clientId만 필수로 체크
    if (!kakaoClientId) {
      console.error('카카오 OAuth 설정이 누락되었습니다:', {
        hasClientId: !!kakaoClientId,
        hasClientSecret: !!kakaoClientSecret,
      });
      return NextResponse.redirect(new URL('/sign-in?error=oauth_config_missing&provider=kakao', request.url));
    }

    // 카카오 OAuth 토큰 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId,
      code,
      redirect_uri: kakaoRedirectUri,
    });
    if (kakaoClientSecret) {
      tokenParams.append('client_secret', kakaoClientSecret);
    }

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('카카오 OAuth 토큰 교환 실패:', errorText);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_token_http_error');
      url.searchParams.set('detail', encodeURIComponent(errorText.slice(0, 180)));
      return NextResponse.redirect(url);
    }

    let tokenData: any;
    try {
      tokenData = await tokenResponse.json();
    } catch (e) {
      console.error('카카오 토큰 JSON 파싱 실패');
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_token_parse_error');
      return NextResponse.redirect(url);
    }
    console.log('카카오 OAuth 토큰 교환 성공');

    if (!tokenData?.access_token) {
      console.error('카카오 액세스 토큰 없음:', tokenData);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_token_missing');
      return NextResponse.redirect(url);
    }

    // 액세스 토큰을 사용하여 사용자 정보 가져오기 (GET + query 로 요청)
    const propertyKeys = '["kakao_account.email","kakao_account.name","kakao_account.phone_number","kakao_account.profile"]';
    const userInfoUrl = `https://kapi.kakao.com/v2/user/me?property_keys=${encodeURIComponent(propertyKeys)}`;
    const userInfoResponse = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text();
      console.error('카카오 사용자 정보 조회 실패:', errorText);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_userinfo_http_error');
      url.searchParams.set('detail', encodeURIComponent(errorText.slice(0, 180)));
      return NextResponse.redirect(url);
    }

    let userInfo: any;
    try {
      userInfo = await userInfoResponse.json();
    } catch (e) {
      console.error('카카오 사용자 정보 JSON 파싱 실패');
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_userinfo_parse_error');
      return NextResponse.redirect(url);
    }
    console.log('카카오 사용자 정보:', userInfo);

    if (userInfo.id === undefined) {
      console.error('카카오 사용자 정보 조회 실패:', userInfo);
      return NextResponse.redirect(new URL('/sign-in?error=user_info_error', request.url));
    }

    const kakaoUser = userInfo;
    const email = kakaoUser.kakao_account?.email;
    const name = kakaoUser.kakao_account?.profile?.nickname || kakaoUser.kakao_account?.name || generateRandomName();
    const phoneNumber = kakaoUser.kakao_account?.phone_number;
    const profileImage = kakaoUser.kakao_account?.profile?.profile_image_url || undefined;

    console.log('카카오 사용자 정보 추출:', {
      email,
      name,
      phoneNumber,
      profileImage,
      kakaoId: kakaoUser.id
    });

    if (!email) {
      console.error('카카오 사용자 이메일이 없습니다. 회원가입 페이지로 유도합니다.');
      const response = NextResponse.redirect(new URL('/sign-up?provider=kakao', request.url));
      response.cookies.set('temp_kakao_user', JSON.stringify({
        email: undefined,
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
      // snsAccessToken 발급 (초기화되지 않음)
      try {
        await fetch(`${request.nextUrl.origin}/api/auth/sns/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalId: kakaoUser.id.toString(), provider: 'kakao', isInitialized: false })
        });
      } catch {}
      return response;
    }

    // 기존 사용자 확인 (중복 회원가입 방지)
    let existingUser = await getUserByExternalId(kakaoUser.id.toString(), 'kakao');
    
    if (!existingUser) {
      // 이메일로도 확인 (다른 소셜 로그인으로 가입한 사용자)
      existingUser = await getUserByEmail(email);
      if (existingUser) {
        console.log('이미 다른 방법으로 가입된 사용자:', existingUser.email);
        // 기존 사용자 정보를 업데이트하여 카카오 연동
        try {
          const updatedUser = await linkSocialAccount(existingUser.id, kakaoUser.id.toString(), 'kakao');
          existingUser = updatedUser;
          console.log('카카오 계정 연동 완료:', existingUser.email);
        } catch (updateError) {
          console.error('사용자 정보 업데이트 실패:', updateError);
        }
      }
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
      // snsAccessToken 발급 (초기화됨)
      try {
        await fetch(`${request.nextUrl.origin}/api/auth/sns/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: existingUser.email, externalId: kakaoUser.id.toString(), provider: 'kakao', isInitialized: true })
        });
      } catch {}
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
      // snsAccessToken 발급 (초기화되지 않음)
      try {
        await fetch(`${request.nextUrl.origin}/api/auth/sns/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, externalId: kakaoUser.id.toString(), provider: 'kakao', isInitialized: false })
        });
      } catch {}

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

      // snsAccessToken 발급 (초기화됨)
      try {
        await fetch(`${request.nextUrl.origin}/api/auth/sns/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: newUser.email, externalId: kakaoUser.id.toString(), provider: 'kakao', isInitialized: true })
        });
      } catch {}

      return response;

    } catch (error) {
      console.error('카카오 사용자 생성 실패:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('이미 등록된 전화번호')) {
          return NextResponse.redirect(new URL('/sign-in?error=duplicate_phone', request.url));
        } else if (error.message.includes('이미 등록된 이메일')) {
          return NextResponse.redirect(new URL('/sign-in?error=duplicate_email', request.url));
        }
      }
      
      return NextResponse.redirect(new URL('/sign-in?error=user_creation_failed', request.url));
    }

  } catch (error) {
    console.error('카카오 OAuth 콜백 처리 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=server_error', request.url));
  }
}
