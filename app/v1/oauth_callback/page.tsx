"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useUser } from "@clerk/nextjs";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { user, isSignedIn, isLoaded: userLoaded } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // URL 파라미터 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('OAuth 콜백 파라미터:', { code: code ? '있음' : '없음', error });
        console.log('Clerk 상태:', { signInLoaded, userLoaded, isSignedIn, user: user?.id });

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
          return;
        }

        // Clerk이 로드될 때까지 대기
        if (!signInLoaded || !userLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다. 대기 중...');
          return;
        }

        // 이미 로그인된 상태인지 확인
        if (isSignedIn && user) {
          console.log('이미 로그인된 상태입니다:', user.id);
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          // 즉시 메인 페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }

        // 인증 코드가 있으면 커스텀 OAuth 처리
        if (code) {
          try {
            // OAuth 콜백 API 호출
            const response = await fetch('/api/auth/oauth-callback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ code }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              console.log('OAuth 로그인 성공:', result.user);
              setStatus('success');
              setMessage('로그인이 완료되었습니다!');
              
              // 잠시 후 메인 페이지로 리다이렉트
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            } else {
              console.error('OAuth 로그인 실패:', result);
              
              if (result.code === 'USER_EXISTS') {
                setStatus('success');
                setMessage('이미 가입된 계정입니다. 로그인을 완료합니다.');
                setTimeout(() => {
                  window.location.href = '/';
                }, 2000);
              } else {
                setStatus('error');
                setMessage(result.error || '로그인 중 오류가 발생했습니다.');
              }
            }
          } catch (apiError) {
            console.error('OAuth API 오류:', apiError);
            setStatus('error');
            setMessage('서버 연결 오류가 발생했습니다.');
          }
        } else {
          // 인증 코드가 없으면 Clerk이 자동으로 처리했을 가능성이 높음
          console.log('인증 코드가 없습니다. Clerk 상태 확인 중...');
          
          // Clerk 상태를 다시 확인
          setTimeout(() => {
            if (isSignedIn && user) {
              console.log('Clerk이 자동으로 로그인을 처리했습니다:', user.id);
              setStatus('success');
              setMessage('로그인이 완료되었습니다!');
              
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            } else {
              console.log('Clerk 로그인 상태가 확인되지 않았습니다. 강제 리다이렉트');
              setStatus('success');
              setMessage('로그인이 완료되었습니다!');
              
              setTimeout(() => {
                window.location.href = '/';
              }, 2000);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams, signInLoaded, userLoaded, isSignedIn, user]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
      )}
      {status === 'success' && (
        <div className="text-green-500 text-4xl mb-4">✓</div>
      )}
      {status === 'error' && (
        <div className="text-red-500 text-4xl mb-4">✗</div>
      )}
      
      <h2 className="text-xl font-semibold mb-2">
        {status === 'loading' && '로그인 처리 중...'}
        {status === 'success' && '로그인 완료!'}
        {status === 'error' && '오류 발생'}
      </h2>
      <p className="text-gray-600">{message}</p>
      
      {status === 'error' && (
        <button
          onClick={() => router.push('/sign-in')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          로그인 페이지로 돌아가기
        </button>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">로딩 중...</h2>
      <p className="text-gray-600">페이지를 불러오는 중입니다.</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Suspense fallback={<LoadingFallback />}>
        <OAuthCallbackContent />
      </Suspense>
    </div>
  );
} 