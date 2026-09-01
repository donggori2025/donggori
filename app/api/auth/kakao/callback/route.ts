import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getUserByExternalId, getUserByEmail } from '@/lib/oauthUsers';
import { createSessionRecord } from '@/lib/session';
import { SESSION_DURATIONS } from '@/lib/sessionConfig';
import { setVerificationProofCookie } from '@/lib/signupProof';
import { clearOAuthNextCookie, clearOAuthStateCookie, getOAuthCallbackUrl, oauthNextCookieName, oauthStateCookieName, safeNextPath, verifyOAuthState } from '@/lib/oauthState';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const nextPath = safeNextPath(request.cookies.get(oauthNextCookieName('kakao'))?.value);

    if (!verifyOAuthState(state, request.cookies.get(oauthStateCookieName('kakao'))?.value)) {
      return NextResponse.redirect(new URL('/sign-in?error=invalid_oauth_state', request.url));
    }

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
    const kakaoRedirectUri = getOAuthCallbackUrl('kakao', request.nextUrl.origin);

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
      console.error('카카오 OAuth 토큰 교환 실패:', tokenResponse.status);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_token_http_error');
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
      console.error('카카오 액세스 토큰이 없습니다.');
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_token_missing');
      return NextResponse.redirect(url);
    }

    // 액세스 토큰을 사용하여 사용자 정보 가져오기 (GET + query 로 요청)
    const propertyKeys = '["kakao_account.email"]';
    const userInfoUrl = `https://kapi.kakao.com/v2/user/me?property_keys=${encodeURIComponent(propertyKeys)}`;
    const userInfoResponse = await fetch(userInfoUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('카카오 사용자 정보 조회 실패:', userInfoResponse.status);
      const url = new URL('/sign-in', request.url);
      url.searchParams.set('error', 'kakao_userinfo_http_error');
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
    if (userInfo.id === undefined) {
      console.error('카카오 사용자 식별자가 없습니다.');
      return NextResponse.redirect(new URL('/sign-in?error=user_info_error', request.url));
    }

    const externalId = userInfo.id.toString();
    const kakaoEmail = userInfo.kakao_account?.email;
    const email = userInfo.kakao_account?.is_email_valid && userInfo.kakao_account?.is_email_verified
      ? String(kakaoEmail).trim().toLowerCase()
      : null;

    // 제공자 ID가 이미 등록된 사용자는 이메일 제공 여부와 무관하게 로그인한다.
    const existingUser = await getUserByExternalId(externalId, 'kakao');
    if (existingUser) {
      const response = NextResponse.redirect(new URL(nextPath, request.url));
      const { token } = await createSessionRecord({
        type: 'sns', userId: existingUser.id, userEmail: existingUser.email,
        externalId, provider: 'kakao', isInitialized: true,
        ttlSec: SESSION_DURATIONS.SOCIAL,
      });
      response.cookies.set('sns_access_token', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
        path: '/', maxAge: SESSION_DURATIONS.SOCIAL,
      });
      clearOAuthStateCookie(response, 'kakao');
      clearOAuthNextCookie(response, 'kakao');
      
      return response;
    }

    if (!email) {
      const response = NextResponse.redirect(new URL('/sign-in?error=no_email', request.url));
      clearOAuthStateCookie(response, 'kakao');
      clearOAuthNextCookie(response, 'kakao');
      return response;
    }

    // 이메일만 같은 다른 계정에 제공자 ID를 자동 연결하지 않는다.
    if (email && await getUserByEmail(email)) {
      const response = NextResponse.redirect(new URL(`/sign-in?error=account_link_required&provider=kakao&next=${encodeURIComponent(nextPath)}`, request.url));
      clearOAuthStateCookie(response, 'kakao');
      clearOAuthNextCookie(response, 'kakao');
      return response;
    }

    // 신규 사용자는 폼에서 필수 약관과 누락 정보를 입력한다.
    const response = NextResponse.redirect(new URL(`/sign-up?provider=kakao&next=${encodeURIComponent(nextPath)}`, request.url));
    await setVerificationProofCookie(response, 'signup_proof', {
      type: 'sns', email, externalId, provider: 'kakao',
    });
    clearOAuthStateCookie(response, 'kakao');
    clearOAuthNextCookie(response, 'kakao');
    return response;

  } catch (error: any) {
    console.error('카카오 OAuth 콜백 처리 오류:', error);
    const url = new URL('/sign-in', request.url);
    url.searchParams.set('error', 'server_error');
    return NextResponse.redirect(url);
  }
}
