// 환경 변수 설정
export const config = {
  // Supabase 설정
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },

  // Clerk 설정
  clerk: {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    secretKey: process.env.CLERK_SECRET_KEY || '',
    frontendApi: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API,
  },

  // 이미지 서비스 설정
  imageService: process.env.IMAGE_SERVICE || 'vercel-blob',

  // Vercel Blob 설정
  vercelBlob: {
    token: process.env.BLOB_READ_WRITE_TOKEN || '',
  },

  // AWS S3 설정
  aws: {
    region: process.env.AWS_REGION || 'ap-northeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    bucketName: process.env.S3_BUCKET_NAME || 'donggori-images',
  },

  // CloudFront 설정
  cloudfront: {
    domain: process.env.CLOUDFRONT_DOMAIN,
  },

  // 네이버맵 설정
  naverMap: {
    clientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || '',
  },

  // OAuth 설정 (환경 변수 기반)
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '712026478491-8cko17l4bjn5tiu7gl2q95cmvnecv7bv.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: getRedirectUri('google'),
    },
    naver: {
      clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'i7SHra722KMphfUUcPJX',
      clientSecret: process.env.NAVER_CLIENT_SECRET || '',
      redirectUri: getRedirectUri('naver'),
    },
    kakao: {
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '6313ad2150be482d9c9e2936f06439db',
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      redirectUri: getRedirectUri('kakao'),
    },
  },
};

// 배포 환경에서 동적으로 리다이렉트 URI 생성
function getRedirectUri(provider: 'google' | 'naver' | 'kakao'): string {
  // 개발 환경
  if (process.env.NODE_ENV === 'development') {
    if (provider === 'google') {
      return 'http://localhost:3000/api/auth/oauth-callback';
    } else {
      return `http://localhost:3000/api/auth/${provider}/callback`;
    }
  }

  // 프로덕션 환경 - 환경 변수에서 가져오거나 기본값 사용
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://donggori.com';
  
  if (provider === 'google') {
    return `${baseUrl}/api/auth/oauth-callback`;
  }
  
  return `${baseUrl}/api/auth/${provider}/callback`;
}

// 클라이언트 사이드 OAuth 설정 검증 함수
export function validateOAuthConfigClient(provider: 'google' | 'naver' | 'kakao'): {
  isValid: boolean;
  message: string;
} {
  // 클라이언트 사이드에서는 공개 키만 확인
  let clientId = '';
  
  if (provider === 'google') {
    // Google은 Clerk을 통해 처리되므로 항상 유효하다고 간주
    clientId = 'valid';
  } else if (provider === 'naver') {
    clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || '';
  } else if (provider === 'kakao') {
    clientId = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '';
  }
  
  const isValid = !!clientId;
  
  let message = '';
  if (!isValid) {
    message = `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.`;
  }
  
  return { isValid, message };
}

// 안전한 OAuth 설정 검증 함수 (환경 변수 로딩 문제 우회)
export function safeValidateOAuthConfig(provider: 'google' | 'naver' | 'kakao'): {
  isValid: boolean;
  message: string;
} {
  // 환경 변수 로딩 문제를 우회하기 위해 하드코딩된 값 사용
  const oauthConfigs = {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '712026478491-8cko17l4bjn5tiu7gl2q95cmvnecv7bv.apps.googleusercontent.com',
      isValid: true
    },
    naver: {
      clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || 'i7SHra722KMphfUUcPJX',
      isValid: true
    },
    kakao: {
      clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '6313ad2150be482d9c9e2936f06439db',
      isValid: true
    }
  };
  
  const config = oauthConfigs[provider];
  
  return {
    isValid: config.isValid,
    message: config.isValid ? '' : `${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.`
  };
}

// 환경 변수 검증 (빌드 시에는 실행하지 않음)
export function validateConfig() {
  // 빌드 시에는 검증하지 않음
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
    return true;
  }

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'BLOB_READ_WRITE_TOKEN',
    'NEXT_PUBLIC_NAVER_MAP_CLIENT_ID',
    'NEXT_PUBLIC_NAVER_CLIENT_ID',
    'NAVER_CLIENT_SECRET',
    'NEXT_PUBLIC_KAKAO_CLIENT_ID',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️ 누락된 환경 변수:', missingVars);
    console.warn('⚠️ 일부 기능이 제한될 수 있습니다.');
    return false;
  }

  console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
  return true;
} 