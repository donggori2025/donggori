#!/usr/bin/env bun

/**
 * Google Cloud Console에 등록해야 할 리디렉션 URI 확인 스크립트
 */

console.log('🔍 Google Cloud Console에 등록해야 할 리디렉션 URI 목록\n');

// 현재 환경 변수 확인
const envContent = await Bun.file('.env.local').text();
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const googleRedirectUri = envVars.GOOGLE_REDIRECT_URI;
const clerkFrontendApi = envVars.NEXT_PUBLIC_CLERK_FRONTEND_API;

console.log('📋 현재 설정:');
console.log(`   GOOGLE_REDIRECT_URI: ${googleRedirectUri}`);
console.log(`   NEXT_PUBLIC_CLERK_FRONTEND_API: ${clerkFrontendApi || '설정되지 않음'}`);

console.log('\n📋 Google Cloud Console에 등록해야 할 리디렉션 URI:');

// 1. 현재 설정된 URI
if (googleRedirectUri) {
  console.log(`   ✅ ${googleRedirectUri} (현재 설정)`);
}

// 2. Clerk 커스텀 도메인 (오류 메시지에서 확인됨)
console.log('   ✅ https://clerk.donggori.com/v1/oauth_callback (Clerk 커스텀 도메인)');

// 3. Clerk 기본 도메인
console.log('   ✅ https://donggori.clerk.accounts.dev/v1/oauth_callback (Clerk 기본 도메인)');

// 4. 개발 환경
console.log('   ✅ http://localhost:3000/v1/oauth_callback (개발용)');
console.log('   ✅ http://localhost:3000/v1/oauth_callback (개발용 포트 3000)');
console.log('   ✅ http://127.0.0.1:3000/v1/oauth_callback (개발용 대안)');
console.log('   ✅ http://127.0.0.1:3000/v1/oauth_callback (개발용 대안 포트 3000)');

console.log('\n🚨 즉시 해결 방법:');
console.log('1. [Google Cloud Console](https://console.cloud.google.com/) 접속');
console.log('2. API 및 서비스 → 사용자 인증 정보');
console.log('3. OAuth 2.0 클라이언트 ID 클릭');
console.log('4. 승인된 리디렉션 URI에 다음 추가:');
console.log('   https://clerk.donggori.com/v1/oauth_callback');
console.log('5. 저장');

console.log('\n💡 추가 권장사항:');
console.log('- 위의 모든 URI를 등록하여 향후 문제 방지');
console.log('- 개발 환경과 프로덕션 환경 모두 지원');

console.log('\n📚 참고:');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- Clerk 대시보드: https://dashboard.clerk.com/');
