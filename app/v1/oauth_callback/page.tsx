"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
          return;
        }

        if (!code) {
          console.error('인증 코드가 없습니다.');
          setStatus('error');
          setMessage('인증 코드를 찾을 수 없습니다.');
          return;
        }

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
            router.push('/');
          }, 2000);
        } else {
          console.error('OAuth 로그인 실패:', result);
          
          if (result.code === 'USER_EXISTS') {
            setStatus('success');
            setMessage('이미 가입된 계정입니다. 로그인을 완료합니다.');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setStatus('error');
            setMessage(result.error || '로그인 중 오류가 발생했습니다.');
          }
        }
      } catch (error) {
        console.error('OAuth 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('서버 연결 오류가 발생했습니다.');
      }
    };

    handleOAuthCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
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
    </div>
  );
} 