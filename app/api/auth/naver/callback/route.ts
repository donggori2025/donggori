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
    const nextPath = safeNextPath(request.cookies.get(oauthNextCookieName('naver'))?.value);

    if (!verifyOAuthState(state, request.cookies.get(oauthStateCookieName('naver'))?.value)) {
      return NextResponse.redirect(new URL('/sign-in?error=invalid_oauth_state', request.url));
    }

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
        redirect_uri: getOAuthCallbackUrl('naver', request.nextUrl.origin),
      }),
    });

    if (!tokenResponse.ok) {
      console.error('네이버 OAuth 토큰 교환 실패:', tokenResponse.status);
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

    if (userInfo.resultcode !== '00') {
      console.error('네이버 사용자 정보 조회 실패:', userInfo.message);
      return NextResponse.redirect(new URL('/sign-in?error=user_info_error', request.url));
    }

    const naverUser = userInfo.response;
    const existingUser = await getUserByExternalId(naverUser.id, 'naver');
    if (existingUser) {
      const response = NextResponse.redirect(new URL(nextPath, request.url));
      const { token } = await createSessionRecord({
        type: 'sns', userId: existingUser.id, userEmail: existingUser.email,
        externalId: naverUser.id, provider: 'naver', isInitialized: true,
        ttlSec: SESSION_DURATIONS.SOCIAL,
      });
      response.cookies.set('sns_access_token', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
        path: '/', maxAge: SESSION_DURATIONS.SOCIAL,
      });
      clearOAuthStateCookie(response, 'naver');
      clearOAuthNextCookie(response, 'naver');
      
      return response;
    }

    const email = typeof naverUser.email === 'string' ? naverUser.email.trim().toLowerCase() : null;
    if (!email) {
      console.error('네이버 신규 사용자의 이메일이 없습니다.');
      const response = NextResponse.redirect(new URL('/sign-in?error=no_email', request.url));
      clearOAuthStateCookie(response, 'naver');
      clearOAuthNextCookie(response, 'naver');
      return response;
    }

    if (await getUserByEmail(email)) {
      const response = NextResponse.redirect(new URL(`/sign-in?error=account_link_required&provider=naver&next=${encodeURIComponent(nextPath)}`, request.url));
      clearOAuthStateCookie(response, 'naver');
      clearOAuthNextCookie(response, 'naver');
      return response;
    }

    // 네이버는 전화번호를 제공하지 않으므로 회원가입 페이지로 이동
    console.log('네이버 사용자 회원가입 페이지로 이동');
    
    const response = NextResponse.redirect(new URL(`/sign-up?provider=naver&next=${encodeURIComponent(nextPath)}`, request.url));
    
    await setVerificationProofCookie(response, 'signup_proof', {
      type: 'sns', email, externalId: naverUser.id, provider: 'naver',
    });
    clearOAuthStateCookie(response, 'naver');
    clearOAuthNextCookie(response, 'naver');

    return response;

  } catch (error) {
    console.error('네이버 OAuth 콜백 처리 오류:', error);
    return NextResponse.redirect(new URL('/sign-in?error=server_error', request.url));
  }
}
