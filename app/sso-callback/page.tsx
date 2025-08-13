"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('로그인 처리 중...');

  useEffect(() => {
    const handleSSOCallback = async () => {
      try {
        console.log('SSO 콜백 처리 시작');
        console.log('현재 URL:', window.location.href);
        console.log('URL 파라미터:', window.location.search);
        console.log('Clerk 상태:', { isLoaded, isSignedIn, user: user?.id });

        if (!isLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다. 대기 중...');
          return;
        }

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const state = urlParams.get('state');

        console.log('URL 파라미터 상세:', { code: code ? '있음' : '없음', error, state });

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage(`OAuth 오류: ${error}`);
          return;
        }

        if (isSignedIn && user) {
          console.log('SSO 로그인 성공:', user.id);
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          // OAuth 코드가 있지만 로그인되지 않은 경우
          if (code) {
            console.log('OAuth 코드는 있지만 로그인되지 않았습니다. Clerk이 처리 중일 수 있습니다.');
            setStatus('loading');
            setMessage('로그인 처리 중...');
            
            // Clerk이 OAuth를 처리할 시간을 더 줍니다
            setTimeout(() => {
              if (isSignedIn && user) {
                console.log('지연된 SSO 로그인 성공:', user.id);
                setStatus('success');
                setMessage('로그인이 완료되었습니다!');
                
                setTimeout(() => {
                  window.location.href = '/';
                }, 1000);
              } else {
                console.log('지연 후에도 로그인되지 않았습니다.');
                setStatus('error');
                setMessage('로그인 처리에 실패했습니다. 다시 시도해주세요.');
              }
            }, 5000);
          } else {
            console.log('OAuth 코드가 없고 로그인되지 않았습니다.');
            setStatus('error');
            setMessage('로그인 처리에 실패했습니다.');
          }
        }
      } catch (error) {
        console.error('SSO 콜백 처리 오류:', error);
        setStatus('error');
        setMessage('로그인 중 오류가 발생했습니다.');
      }
    };

    handleSSOCallback();
  }, [isLoaded, isSignedIn, user]);

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
