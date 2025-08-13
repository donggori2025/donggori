#!/usr/bin/env bun

// OAuth 설정 확인 스크립트
console.log('🔍 OAuth 설정 확인 중...\n');

// 환경 변수 로드
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

// Google OAuth 설정 확인
console.log('📋 Google OAuth 설정:');
const googleClientId = envVars.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = envVars.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = envVars.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI;

console.log(`  Client ID: ${googleClientId ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`  Client Secret: ${googleClientSecret ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`  Redirect URI: ${googleRedirectUri || 'http://localhost:3000/v1/oauth_callback'}`);

// Clerk 설정 확인
console.log('\n📋 Clerk 설정:');
const clerkPublishableKey = envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = envVars.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY;

console.log(`  Publishable Key: ${clerkPublishableKey ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`  Secret Key: ${clerkSecretKey ? '✅ 설정됨' : '❌ 누락'}`);

// 네이버맵 설정 확인
console.log('\n📋 네이버맵 설정:');
const naverClientId = envVars.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
console.log(`  Client ID: ${naverClientId ? '✅ 설정됨' : '❌ 누락'}`);

// 문제점 요약
console.log('\n🔍 문제점 요약:');
let issues = [];

if (!googleClientId) {
  issues.push('Google OAuth Client ID가 설정되지 않았습니다.');
}
if (!googleClientSecret) {
  issues.push('Google OAuth Client Secret이 설정되지 않았습니다.');
}
if (!clerkPublishableKey) {
  issues.push('Clerk Publishable Key가 설정되지 않았습니다.');
}
if (!clerkSecretKey) {
  issues.push('Clerk Secret Key가 설정되지 않았습니다.');
}

if (issues.length === 0) {
  console.log('✅ 모든 OAuth 설정이 올바르게 구성되었습니다.');
} else {
  console.log('❌ 다음 문제들을 해결해야 합니다:');
  issues.forEach((issue, index) => {
    console.log(`  ${index + 1}. ${issue}`);
  });
  
  console.log('\n💡 해결 방법:');
  console.log('1. .env.local 파일에 필요한 환경 변수를 추가하세요.');
  console.log('2. Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성하세요.');
  console.log('3. Clerk 대시보드에서 API 키를 확인하세요.');
}

console.log('\n📚 참고 문서:');
console.log('- Google OAuth: https://console.cloud.google.com/apis/credentials');
console.log('- Clerk: https://dashboard.clerk.com/');
console.log('- 네이버맵: https://www.ncloud.com/');
