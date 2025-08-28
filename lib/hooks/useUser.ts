import { useState, useEffect } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { User } from '@/lib/userService';

interface UnifiedUser extends User {
  isLoggedIn: boolean;
  loginMethod: 'google' | 'naver' | 'kakao' | 'email';
}

export function useUnifiedUser() {
  const { user: clerkUser } = useClerkUser();
  const [unifiedUser, setUnifiedUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      
      try {
        // 1. Clerk 사용자 확인 (구글 로그인)
        if (clerkUser) {
          const response = await fetch(`/api/users?email=${encodeURIComponent(clerkUser.emailAddresses[0]?.emailAddress || '')}`);
          if (response.ok) {
            const { data } = await response.json();
            if (data) {
              setUnifiedUser({
                ...data,
                isLoggedIn: true
              });
              setLoading(false);
              return;
            }
          }
        }

        // 2. 쿠키에서 소셜 로그인 사용자 확인
        if (typeof window !== 'undefined') {
          // 네이버 사용자 확인
          const naverUserCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('naver_user='));
          
          if (naverUserCookie) {
            try {
              const naverUserData = JSON.parse(decodeURIComponent(naverUserCookie.split('=')[1]));
              const response = await fetch(`/api/users?externalId=${naverUserData.naverId}&loginMethod=naver`);
              if (response.ok) {
                const { data } = await response.json();
                if (data) {
                  setUnifiedUser({
                    ...data,
                    isLoggedIn: true
                  });
                  setLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('네이버 사용자 정보 파싱 오류:', error);
            }
          }

          // 카카오 사용자 확인
          const kakaoUserCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('kakao_user='));
          
          if (kakaoUserCookie) {
            try {
              const kakaoUserData = JSON.parse(decodeURIComponent(kakaoUserCookie.split('=')[1]));
              const response = await fetch(`/api/users?externalId=${kakaoUserData.kakaoId}&loginMethod=kakao`);
              if (response.ok) {
                const { data } = await response.json();
                if (data) {
                  setUnifiedUser({
                    ...data,
                    isLoggedIn: true
                  });
                  setLoading(false);
                  return;
                }
              }
            } catch (error) {
              console.error('카카오 사용자 정보 파싱 오류:', error);
            }
          }
        }

        // 3. 로그인되지 않은 상태
        setUnifiedUser(null);
      } catch (error) {
        console.error('사용자 정보 로딩 오류:', error);
        setUnifiedUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [clerkUser]);

  // 사용자 정보 업데이트
  const updateUser = async (updateData: Partial<User>) => {
    if (!unifiedUser) return false;

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: unifiedUser.id,
          ...updateData
        })
      });

      if (response.ok) {
        const { data } = await response.json();
        setUnifiedUser({
          ...data,
          isLoggedIn: true
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('사용자 정보 업데이트 오류:', error);
      return false;
    }
  };

  // 로그아웃
  const logout = () => {
    // 쿠키 삭제
    if (typeof window !== 'undefined') {
      document.cookie = 'naver_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'kakao_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
    
    setUnifiedUser(null);
    window.location.href = '/';
  };

  return {
    user: unifiedUser,
    loading,
    updateUser,
    logout,
    isLoggedIn: !!unifiedUser?.isLoggedIn
  };
}
