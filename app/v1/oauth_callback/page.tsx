"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoaded } = useSignIn();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        if (!isLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다.');
          return;
        }

        // URL 파라미터 확인
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        console.log('OAuth 콜백 파라미터:', { code: code ? '있음' : '없음', error });

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
          return;
        }

        // Clerk의 OAuth 콜백 처리
        try {
          const result = await signIn.attemptFirstFactor({
            strategy: 'oauth_callback',
          });

          console.log('Clerk OAuth 결과:', result);

          if (result.status === 'complete') {
            console.log('OAuth 로그인 성공');
            setStatus('success');
            setMessage('로그인이 완료되었습니다!');
            
            // 잠시 후 메인 페이지로 리다이렉트
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            console.error('OAuth 로그인 실패:', result);
            setStatus('error');
            setMessage('로그인 중 오류가 발생했습니다.');
          }
        } catch (clerkError) {
          console.error('Clerk OAuth 오류:', clerkError);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams, signIn, isLoaded]);

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