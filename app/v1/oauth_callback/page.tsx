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
        const provider = searchParams.get('provider');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const profileImage = searchParams.get('profileImage');
        const naverId = searchParams.get('naverId');

        console.log('OAuth 콜백 파라미터:', { 
          code: code ? '있음' : '없음', 
          error, 
          provider, 
          email, 
          name 
        });
        console.log('Clerk 상태:', { userLoaded, isSignedIn, user: user?.id });

        if (error) {
          console.error('OAuth 오류:', error);
          setStatus('error');
          setMessage('로그인 중 오류가 발생했습니다.');
          return;
        }

        // 네이버 OAuth 처리
        if (provider === 'naver' && email && name) {
          console.log('네이버 OAuth 처리 시작:', { email, name });
          setStatus('loading');
          setMessage('네이버 로그인 처리 중...');

          try {
            // Clerk OAuth 회원가입 API 호출
            const signupResponse = await fetch('/api/auth/oauth-signup', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name,
                picture: profileImage,
                naverId,
                signupMethod: 'naver',
              }),
            });

            const signupResult = await signupResponse.json();

            if (signupResponse.ok) {
              console.log('네이버 OAuth 회원가입 성공:', signupResult.user.id);
              setStatus('success');
              setMessage('네이버 로그인이 완료되었습니다!');
              
              // 사용자 타입 설정
              localStorage.setItem('userType', 'user');
              
              // 즉시 메인 페이지로 리다이렉트
              setTimeout(() => {
                window.location.href = '/';
              }, 1000);
              return;
            } else {
              console.error('네이버 OAuth 회원가입 실패:', signupResult);
              
              // 이미 존재하는 사용자인 경우
              if (signupResult.code === 'USER_EXISTS') {
                setStatus('success');
                setMessage('네이버 로그인이 완료되었습니다!');
                
                // 사용자 타입 설정
                localStorage.setItem('userType', 'user');
                
                setTimeout(() => {
                  window.location.href = '/';
                }, 1000);
                return;
              }

              setStatus('error');
              setMessage(signupResult.error || '로그인 처리에 실패했습니다.');
              return;
            }
          } catch (signupError) {
            console.error('네이버 OAuth 회원가입 API 호출 오류:', signupError);
            setStatus('error');
            setMessage('로그인 서비스에 연결할 수 없습니다.');
            return;
          }
        }

        // 기존 Clerk OAuth 처리
        if (!userLoaded) {
          console.log('Clerk이 아직 로드되지 않았습니다. 대기 중...');
          return;
        }

        if (isSignedIn && user) {
          console.log('로그인된 상태입니다:', user.id);
          setStatus('success');
          setMessage('로그인이 완료되었습니다!');
          
          localStorage.setItem('userType', 'user');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
          return;
        }

        if (code) {
          console.log('OAuth 코드가 있습니다. Clerk이 자동으로 처리합니다...');
          setStatus('loading');
          setMessage('로그인 처리 중...');
          
          setTimeout(() => {
            if (isSignedIn && user) {
              console.log('Clerk이 OAuth 콜백을 처리했습니다:', user.id);
              setStatus('success');
              setMessage('로그인이 완료되었습니다!');
              
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
          console.log('OAuth 코드가 없습니다.');
          if (isSignedIn && user) {
            setStatus('success');
            setMessage('로그인이 완료되었습니다!');
            
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