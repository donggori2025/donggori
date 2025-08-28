#!/usr/bin/env bun

/**
 * OAuth 플로우 디버깅 스크립트
 */

console.log('🔍 OAuth 플로우 디버깅 시작...\n');

// 현재 환경 변수 확인
const envContent = await Bun.file('.env.local').text();
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 현재 OAuth 설정:');
console.log(`   GOOGLE_CLIENT_ID: ${envVars.GOOGLE_CLIENT_ID ? '설정됨' : '누락'}`);
console.log(`   GOOGLE_CLIENT_SECRET: ${envVars.GOOGLE_CLIENT_SECRET ? '설정됨' : '누락'}`);
console.log(`   GOOGLE_REDIRECT_URI: ${envVars.GOOGLE_REDIRECT_URI || '기본값'}`);
console.log(`   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? '설정됨' : '누락'}`);
console.log(`   CLERK_SECRET_KEY: ${envVars.CLERK_SECRET_KEY ? '설정됨' : '누락'}`);

console.log('\n🔍 문제 진단:');

// 1. Google Cloud Console 설정 확인
console.log('\n1️⃣ Google Cloud Console 설정:');
console.log('   - [Google Cloud Console](https://console.cloud.google.com/)에서 다음 URI들이 등록되어 있는지 확인:');
console.log('     ✅ https://clerk.donggori.com/v1/oauth_callback');
console.log('     ✅ https://donggori.clerk.accounts.dev/v1/oauth_callback');
console.log('     ✅ http://localhost:3000/v1/oauth_callback');
console.log('     ✅ http://localhost:3000/v1/oauth_callback');

// 2. Clerk 설정 확인
console.log('\n2️⃣ Clerk 설정:');
console.log('   - [Clerk 대시보드](https://dashboard.clerk.com/)에서 OAuth 설정 확인:');
console.log('     ✅ Google OAuth가 활성화되어 있는지 확인');
console.log('     ✅ 리디렉션 URL이 올바르게 설정되어 있는지 확인');

// 3. 개발 서버 확인
console.log('\n3️⃣ 개발 서버:');
console.log('   - 개발 서버가 실행 중인지 확인: bun run dev');
console.log('   - 포트 3000에서 실행 중인지 확인');

// 4. 브라우저 확인
console.log('\n4️⃣ 브라우저:');
console.log('   - 브라우저 캐시 삭제');
console.log('   - 개발자 도구 > Network 탭에서 OAuth 요청 확인');
console.log('   - 개발자 도구 > Console 탭에서 오류 메시지 확인');

console.log('\n🔧 해결 방법:');

console.log('\n방법 1: Google Cloud Console에 URI 추가');
console.log('1. [Google Cloud Console](https://console.cloud.google.com/) 접속');
console.log('2. API 및 서비스 → 사용자 인증 정보');
console.log('3. OAuth 2.0 클라이언트 ID 클릭');
console.log('4. 승인된 리디렉션 URI에 다음 추가:');
console.log('   https://clerk.donggori.com/v1/oauth_callback');
console.log('5. 저장');

console.log('\n방법 2: Clerk 설정 확인');
console.log('1. [Clerk 대시보드](https://dashboard.clerk.com/) 접속');
console.log('2. User & Authentication → Social Connections');
console.log('3. Google OAuth 설정 확인');
console.log('4. 리디렉션 URL이 올바르게 설정되어 있는지 확인');

console.log('\n방법 3: 환경 변수 확인');
console.log('1. .env.local 파일에서 OAuth 설정 확인');
console.log('2. 개발 서버 재시작: bun run dev');
console.log('3. 브라우저 캐시 삭제');

console.log('\n📚 추가 정보:');
console.log('- [Clerk OAuth 문서](https://clerk.com/docs/authentication/social-connections)');
console.log('- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)');
console.log('- 문제 해결 가이드: docs/clerk-domain-issue-guide.md');
