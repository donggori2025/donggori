import { NextRequest, NextResponse } from 'next/server';
import { generateRandomName } from '@/lib/randomNameGenerator';

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: '인증 코드가 없습니다.' },
        { status: 400 }
      );
    }

    // Google OAuth 환경 변수 검증
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/v1/oauth_callback';

    if (!googleClientId || !googleClientSecret) {
      console.error('Google OAuth 설정이 누락되었습니다:', {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
      });
      return NextResponse.json(
        { error: 'OAuth 설정이 완료되지 않았습니다. 관리자에게 문의하세요.' },
        { status: 500 }
      );
    }

    // Google OAuth 토큰 교환
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('OAuth token exchange failed:', errorData);
      
      // Google OAuth 오류 응답 파싱
      let errorMessage = 'OAuth 토큰 교환에 실패했습니다.';
      try {
        const errorJson = JSON.parse(errorData);
        if (errorJson.error === 'redirect_uri_mismatch') {
          errorMessage = '리디렉션 URI가 일치하지 않습니다. Google Cloud Console에서 설정을 확인해주세요.';
          console.error('Redirect URI mismatch. Expected:', googleRedirectUri);
        } else if (errorJson.error === 'invalid_request') {
          errorMessage = '잘못된 요청입니다. OAuth 설정을 확인해주세요.';
        } else if (errorJson.error) {
          errorMessage = `OAuth 오류: ${errorJson.error}`;
        }
      } catch (e) {
        console.error('Error parsing OAuth error response:', e);
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          redirectUri: googleRedirectUri
        },
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

    // 이름이 없거나 비어있는 경우 랜덤 이름 생성
    let userName = userInfo.name;
    if (!userName || userName.trim() === '') {
      userName = generateRandomName();
      console.log('OAuth 사용자 이름이 없어 랜덤 이름 생성:', userName);
    }

    // Clerk OAuth 회원가입 API 호출
    try {
      const signupResponse = await fetch(`${request.nextUrl.origin}/api/auth/oauth-signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userInfo.email,
          name: userName,
          picture: userInfo.picture,
          googleId: userInfo.id,
        }),
      });

      const signupResult = await signupResponse.json();

      if (signupResponse.ok) {
        console.log('OAuth 회원가입 성공:', signupResult.user.id);
        
        const response = NextResponse.json({
          success: true,
          user: signupResult.user,
          message: signupResult.message,
        });

        // 보안을 위해 HttpOnly 쿠키로 토큰 저장
        response.cookies.set('auth_token', tokenData.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7일
        });

        return response;
      } else {
        console.error('OAuth 회원가입 실패:', signupResult);
        
        // 이미 존재하는 사용자인 경우
        if (signupResult.code === 'USER_EXISTS') {
          return NextResponse.json({
            success: false,
            error: '이미 가입된 이메일입니다.',
            code: 'USER_EXISTS',
            user: {
              email: userInfo.email,
              name: userName,
              picture: userInfo.picture,
            }
          }, { status: 409 });
        }

        return NextResponse.json({
          success: false,
          error: signupResult.error || '회원가입 중 오류가 발생했습니다.',
        }, { status: 500 });
      }

    } catch (signupError) {
      console.error('OAuth 회원가입 API 호출 오류:', signupError);
      return NextResponse.json({
        success: false,
        error: '회원가입 서비스에 연결할 수 없습니다.',
      }, { status: 500 });
    }

  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 