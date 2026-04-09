import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 로컬 스토리지 래퍼 유틸리티
 */
export const storage = {
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      // JSON.parse 시도
      try {
        return JSON.parse(item);
      } catch {
        // JSON 파싱 실패 시 원본 문자열 반환 (문자열 타입인 경우)
        return item as T;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
};

/**
 * 네이버맵 환경 변수 검증
 */
export function validateNaverMapConfig() {
  const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;

  const validation = {
    hasClientId: false,
    isValidClientId: false,
    errorMessage: '',
    debugInfo: {
      clientId: clientId ? `***${clientId.slice(-4)}` : '없음',
      clientIdLength: clientId?.length || 0,
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production'
    }
  };

  // Client ID 존재 여부 확인
  if (!clientId) {
    validation.errorMessage = 'NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경 변수가 설정되지 않았습니다.';
    return validation;
  }

  validation.hasClientId = true;

  // Client ID 유효성 확인
  if (clientId === 'your-naver-map-client-id' || clientId.length < 10) {
    validation.errorMessage = '유효하지 않은 Client ID입니다. 실제 발급받은 Client ID로 설정해주세요.';
    return validation;
  }

  validation.isValidClientId = true;
  return validation;
}

/**
 * 네이버맵 설정 상태를 콘솔에 출력
 */
export function logNaverMapConfig() {
  const validation = validateNaverMapConfig();

  console.group('🗺️ 네이버맵 설정 상태');
  console.log('✅ Client ID 설정:', validation.hasClientId ? '설정됨' : '설정되지 않음');
  console.log('✅ Client ID 유효성:', validation.isValidClientId ? '유효함' : '유효하지 않음');
  console.log('🔍 디버그 정보:', validation.debugInfo);

  if (validation.errorMessage) {
    console.error('❌ 오류:', validation.errorMessage);
  }

  console.groupEnd();

  return validation;
}

/**
 * 쿠키 관련 유틸리티 함수
 */
export const cookies = {
  /**
   * 쿠키에서 값을 가져옵니다
   */
  get: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  },

  /**
   * 쿠키에 값을 설정합니다
   */
  set: (name: string, value: string, options?: { maxAge?: number; path?: string }): void => {
    if (typeof document === 'undefined') return;
    const { maxAge = 60 * 60 * 24 * 7, path = '/' } = options || {};
    document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}`;
  },

  /**
   * 쿠키를 삭제합니다
   */
  remove: (name: string, path = '/'): void => {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=${path}; max-age=0`;
  }
};

/**
 * 사용자 인증 관련 유틸리티
 */
export interface UserIdentity {
  name: string;
  phone: string;
  id: string;
  email: string;
}

/**
 * 로그인 상태 확인
 */
export function isAppLoggedIn(): boolean {
  try {
    if (typeof document === 'undefined') return false;
    
    // 일반 로그인 확인
    if (document.cookie.includes('isLoggedIn=true')) return true;
    if (typeof localStorage !== 'undefined' && (localStorage.getItem('userType') || localStorage.getItem('isLoggedIn') === 'true')) return true;
    
    // 소셜 로그인 쿠키 확인
    const kakaoUser = cookies.get('kakao_user');
    if (kakaoUser) {
      try {
        const user = JSON.parse(decodeURIComponent(kakaoUser));
        if (user && user.id && user.email) return true;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('카카오 사용자 쿠키 파싱 오류:', e);
        }
      }
    }
    
    const naverUser = cookies.get('naver_user');
    if (naverUser) {
      try {
        const user = JSON.parse(decodeURIComponent(naverUser));
        if (user && user.id && user.email) return true;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('네이버 사용자 쿠키 파싱 오류:', e);
        }
      }
    }
    
    const factoryUser = cookies.get('factory_user');
    if (factoryUser) {
      try {
        const user = JSON.parse(decodeURIComponent(factoryUser));
        if (user && user.id) return true;
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('팩토리 사용자 쿠키 파싱 오류:', e);
        }
      }
    }
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('로그인 상태 확인 오류:', error);
    }
  }
  return false;
}

/**
 * 사용자 정보 가져오기 (쿠키/localStorage 기반)
 */
export function getAppUserIdentity(appUser?: any): UserIdentity {
  try {
    const name = localStorage.getItem('userName') || '';
    const phone = localStorage.getItem('userPhone') || '';
    
    if (appUser) {
      return {
        name: appUser.name || name,
        phone: appUser.phoneNumber || phone,
        id: appUser.id || '',
        email: appUser.email || ''
      };
    }
    
    // 카카오 사용자 정보 확인
    const kakao = cookies.get('kakao_user');
    if (kakao) {
      try {
        const u = JSON.parse(decodeURIComponent(kakao));
        if (u && u.id && u.email) {
          return { 
            name: u.name || name, 
            phone: u.phoneNumber || phone,
            id: u.id,
            email: u.email
          };
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('카카오 사용자 정보 파싱 오류:', e);
        }
      }
    }
    
    // 네이버 사용자 정보 확인 (우선순위 3)
    const naver = cookies.get('naver_user');
    if (naver) {
      try {
        const u = JSON.parse(decodeURIComponent(naver));
        if (u && u.id && u.email) {
          return { 
            name: u.name || name, 
            phone: u.phoneNumber || phone,
            id: u.id,
            email: u.email
          };
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('네이버 사용자 정보 파싱 오류:', e);
        }
      }
    }
    
    // 기본값 반환
    return { name, phone, id: '', email: '' };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('사용자 정보 가져오기 오류:', error);
    }
    return { name: '', phone: '', id: '', email: '' };
  }
}
