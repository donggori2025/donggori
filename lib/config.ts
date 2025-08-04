// 환경 변수 검증 및 설정
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  naver: {
    clientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
  },
  vercel: {
    blobStoreToken: process.env.BLOB_READ_WRITE_TOKEN,
  },
} as const;

// 환경 변수 검증 함수
export const validateConfig = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Supabase 설정 검증
  if (!config.supabase.url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  }
  if (!config.supabase.anonKey) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }

  // Clerk 설정 검증
  if (!config.clerk.publishableKey) {
    errors.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.');
  }

  // Naver Maps 설정 검증
  if (!config.naver.clientId) {
    warnings.push('NEXT_PUBLIC_NAVER_MAP_CLIENT_ID가 설정되지 않았습니다. (지도 기능 제한)');
  }

  // Vercel Blob 설정 검증
  if (!config.vercel.blobStoreToken) {
    warnings.push('BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다. (이미지 업로드 기능 제한)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// 개발 환경에서만 설정 검증 로그 출력
if (process.env.NODE_ENV === 'development') {
  const validation = validateConfig();
  
  if (validation.errors.length > 0) {
    console.error('❌ 필수 환경 변수 누락:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ 선택적 환경 변수 누락:', validation.warnings);
  }
  
  if (validation.isValid) {
    console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
  }
} 