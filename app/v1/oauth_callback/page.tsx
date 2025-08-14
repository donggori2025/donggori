"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
        console.log('Clerk 상태:', { userLoaded, isSignedIn, user: user?.id });

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
          return;
        }

        // Clerk이 로드될 때까지 대기
        if (!userLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다. 대기 중...');
          return;
        }

        // 이미 로그인된 상태인지 확인
        if (isSignedIn && user) {
          console.log('로그인된 상태입니다:', user.id);
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          // 사용자 타입 설정
          localStorage.setItem('userType', 'user');
          
          // 즉시 메인 페이지로 리다이렉트
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }

        // 인증 코드가 있으면 Clerk이 자동으로 처리할 것임
        if (code) {
          console.log('OAuth 코드가 있습니다. Clerk이 자동으로 처리합니다...');
          setStatus('loading');
          setMessage('로그인 처리 중...');
          
          // Clerk이 자동으로 OAuth 콜백을 처리하도록 대기
          setTimeout(() => {
            if (isSignedIn && user) {
              console.log('Clerk이 OAuth 콜백을 처리했습니다:', user.id);
              setStatus('success');
              setMessage('로그인이 완료되었습니다!');
              
              // 사용자 타입 설정
              localStorage.setItem('userType', 'user');
              
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
            } else {
              console.log('Clerk이 OAuth 콜백을 처리하지 못했습니다.');
              setStatus('error');
              setMessage('로그인 처리에 실패했습니다.');
            }
          }, 3000);
        } else {
          // 인증 코드가 없으면 이미 처리되었거나 오류
          console.log('OAuth 코드가 없습니다.');
          if (isSignedIn && user) {
            setStatus('success');
            setMessage('로그인이 완료되었습니다!');
            
            // 사용자 타입 설정
            localStorage.setItem('userType', 'user');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else {
            setStatus('error');
            setMessage('로그인 처리에 실패했습니다.');
          }
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams, userLoaded, isSignedIn, user]);

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