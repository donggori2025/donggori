#!/usr/bin/env bun

// OAuth 리디렉션 URI 디버깅 스크립트
console.log('🔍 OAuth 리디렉션 URI 디버깅...\n');

// 현재 환경 정보
console.log('📋 환경 정보:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`  현재 호스트: ${process.env.VERCEL_URL || 'localhost:3000'}`);

// 환경 변수에서 리디렉션 URI 확인
const envPath = '.env.local';
let envVars = {};

try {
  const envContent = Bun.file(envPath).text();
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  }
} catch (error) {
  console.log(`⚠️  ${envPath} 파일을 찾을 수 없습니다.`);
}

// Google OAuth 리디렉션 URI 확인
console.log('\n📋 Google OAuth 리디렉션 URI:');
const googleRedirectUri = envVars.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/v1/oauth_callback';
console.log(`  환경 변수: ${googleRedirectUri}`);

// Clerk 리디렉션 URI 확인
console.log('\n📋 Clerk 리디렉션 URI:');
console.log(`  코드에서 사용: /v1/oauth_callback`);
console.log(`  완전한 URL: ${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}/v1/oauth_callback` : 'http://localhost:3000/v1/oauth_callback'}`);

// Google Cloud Console에 등록해야 할 URI들
console.log('\n📋 Google Cloud Console에 등록해야 할 URI들:');

const developmentUris = [
  'http://localhost:3000/v1/oauth_callback',
  'http://127.0.0.1:3000/v1/oauth_callback'
];

const productionUris = [
  'https://your-domain.com/v1/oauth_callback',
  'https://www.your-domain.com/v1/oauth_callback'
];

if (process.env.NODE_ENV === 'production') {
  console.log('  🚀 프로덕션 환경:');
  productionUris.forEach(uri => {
    console.log(`    - ${uri}`);
  });
} else {
  console.log('  🔧 개발 환경:');
  developmentUris.forEach(uri => {
    console.log(`    - ${uri}`);
  });
}

// 문제 진단
console.log('\n🔍 문제 진단:');

const currentUri = googleRedirectUri;
const expectedUris = process.env.NODE_ENV === 'production' ? productionUris : developmentUris;

if (expectedUris.includes(currentUri)) {
  console.log('✅ 리디렉션 URI가 올바르게 설정되었습니다.');
} else {
  console.log('❌ 리디렉션 URI가 올바르지 않습니다.');
  console.log(`   현재: ${currentUri}`);
  console.log(`   예상: ${expectedUris.join(' 또는 ')}`);
}

// 해결 방법
console.log('\n💡 해결 방법:');

if (!envVars.GOOGLE_REDIRECT_URI && !process.env.GOOGLE_REDIRECT_URI) {
  console.log('1. .env.local 파일에 GOOGLE_REDIRECT_URI 설정:');
  console.log('   GOOGLE_REDIRECT_URI=http://localhost:3000/v1/oauth_callback');
} else {
  console.log('1. Google Cloud Console에서 다음 URI들이 등록되어 있는지 확인:');
  expectedUris.forEach(uri => {
    console.log(`   - ${uri}`);
  });
}

console.log('\n2. Google Cloud Console 설정 확인:');
console.log('   - https://console.cloud.google.com/apis/credentials');
console.log('   - OAuth 2.0 클라이언트 ID 선택');
console.log('   - "승인된 리디렉션 URI" 섹션 확인');

console.log('\n3. Clerk 대시보드 설정 확인:');
console.log('   - https://dashboard.clerk.com/');
console.log('   - User & Authentication > Social Connections');
console.log('   - 각 OAuth 제공자의 Redirect URLs 확인');

// 추가 디버깅 정보
console.log('\n🔧 추가 디버깅 정보:');
console.log('현재 요청이 어떤 URI로 오는지 확인하려면:');
console.log('1. 브라우저 개발자 도구 > Network 탭');
console.log('2. OAuth 로그인 시도');
console.log('3. Google OAuth 요청의 redirect_uri 파라미터 확인');
