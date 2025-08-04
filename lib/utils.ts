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
      return item ? JSON.parse(item) : null;
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
      clientId: clientId ? '***' + clientId.slice(-4) : '없음',
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
