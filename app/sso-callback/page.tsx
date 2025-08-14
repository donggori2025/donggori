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
        console.log('Clerk 상태:', { isLoaded, isSignedIn, user: user?.id });

        if (!isLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다. 대기 중...');
          return;
        }

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage(`OAuth 오류: ${error}`);
          return;
        }

        // 이미 로그인된 상태인지 확인
        if (isSignedIn && user) {
          console.log('SSO 로그인 성공:', user.id);
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          // 사용자 타입 설정
          localStorage.setItem('userType', 'user');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }

        // 로그인되지 않은 경우, Clerk이 자동으로 처리할 시간을 줍니다
        console.log('로그인 처리 대기 중...');
        setStatus('loading');
        setMessage('로그인 처리 중...');
        
        // 최대 5초 대기
        let attempts = 0;
        const maxAttempts = 10;
        const checkInterval = setInterval(() => {
          attempts++;
          console.log(`로그인 상태 확인 시도 ${attempts}/${maxAttempts}`);
          
          if (isSignedIn && user) {
            console.log('로그인 성공:', user.id);
            clearInterval(checkInterval);
            setStatus('success');
            setMessage('로그인이 완료되었습니다!');
            
            // 사용자 타입 설정
            localStorage.setItem('userType', 'user');
            
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          } else if (attempts >= maxAttempts) {
            console.log('최대 대기 시간 초과');
            clearInterval(checkInterval);
            setStatus('error');
            setMessage('로그인 처리에 실패했습니다. 다시 시도해주세요.');
          }
        }, 500);
        
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
