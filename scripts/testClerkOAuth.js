#!/usr/bin/env bun

/**
 * Clerk OAuth 설정 테스트 스크립트
 */

console.log('🧪 Clerk OAuth 설정 테스트...\n');

// 환경 변수 확인
const envContent = await Bun.file('.env.local').text();
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 Clerk 설정 확인:');
console.log(`   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '설정됨' : '누락'}`);
console.log(`   CLERK_SECRET_KEY: ${envVars.CLERK_SECRET_KEY ? '설정됨' : '누락'}`);
console.log(`   NEXT_PUBLIC_CLERK_FRONTEND_API: ${envVars.NEXT_PUBLIC_CLERK_FRONTEND_API || '기본 도메인 사용'}`);

console.log('\n🔍 Clerk 대시보드 확인 사항:');
console.log('1. [Clerk 대시보드](https://dashboard.clerk.com/) 접속');
console.log('2. User & Authentication → Social Connections');
console.log('3. Google OAuth 설정 확인:');
console.log('   - Google OAuth가 활성화되어 있는지 확인');
console.log('   - Client ID와 Client Secret이 올바르게 설정되어 있는지 확인');
console.log('   - Redirect URLs에 다음이 포함되어 있는지 확인:');
console.log('     ✅ https://clerk.donggori.com/v1/oauth_callback');
console.log('     ✅ https://donggori.clerk.accounts.dev/v1/oauth_callback');
console.log('     ✅ http://localhost:3000/v1/oauth_callback');
console.log('     ✅ http://localhost:3001/v1/oauth_callback');

console.log('\n🔧 문제 해결 방법:');

console.log('\n방법 1: Clerk OAuth 설정 확인');
console.log('1. Clerk 대시보드에서 Google OAuth 설정 재확인');
console.log('2. Client ID와 Client Secret이 Google Cloud Console과 일치하는지 확인');
console.log('3. Redirect URLs가 올바르게 설정되어 있는지 확인');

console.log('\n방법 2: Google Cloud Console 재확인');
console.log('1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 확인');
console.log('2. 승인된 리디렉션 URI에 다음이 모두 포함되어 있는지 확인:');
console.log('   - https://clerk.donggori.com/v1/oauth_callback');
console.log('   - https://donggori.clerk.accounts.dev/v1/oauth_callback');
console.log('   - http://localhost:3000/v1/oauth_callback');
console.log('   - http://localhost:3001/v1/oauth_callback');

console.log('\n방법 3: 개발 서버 재시작');
console.log('1. 개발 서버 중지: Ctrl+C');
console.log('2. 개발 서버 재시작: bun run dev');
console.log('3. 브라우저 캐시 삭제');

console.log('\n방법 4: 간단한 테스트');
console.log('1. 브라우저에서 http://localhost:3001 접속');
console.log('2. 로그인 버튼 클릭');
console.log('3. Google 로그인 선택');
console.log('4. 개발자 도구 > Console 탭에서 오류 메시지 확인');

console.log('\n📚 추가 정보:');
console.log('- [Clerk OAuth 문서](https://clerk.com/docs/authentication/social-connections)');
console.log('- [Clerk 대시보드](https://dashboard.clerk.com/)');
console.log('- [Google Cloud Console](https://console.cloud.google.com/)');
