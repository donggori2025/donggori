'use client';

import React, { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

function OAuthCallbackHandler() {
  const { user, isSignedIn, isLoaded } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (code || error) {
        console.log('OAuth 콜백 감지:', { code: code ? '있음' : '없음', error });
        console.log('Clerk 상태:', { isLoaded, isSignedIn, user: user?.id });

        if (error) {
          console.error('OAuth 오류:', error);
          alert(`OAuth 오류: ${error}`);
          return;
        }

        if (isSignedIn && user) {
          console.log('OAuth 로그인 성공:', user.id);
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        } else if (code) {
          console.log('OAuth 코드는 있지만 로그인되지 않았습니다. Clerk이 처리 중일 수 있습니다.');
          setTimeout(() => {
            if (isSignedIn && user) {
              console.log('지연된 OAuth 로그인 성공:', user.id);
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
            } else {
              console.log('OAuth 처리 실패');
            }
          }, 3000);
        }
      }
    };

    if (isLoaded) {
      handleOAuthCallback();
    }
  }, [searchParams, isLoaded, isSignedIn, user]);

  return null;
}

export default OAuthCallbackHandler;


