#!/usr/bin/env bun

/**
 * OAuth 로그인 테스트 스크립트
 * Google OAuth 설정이 올바르게 작동하는지 확인합니다.
 */

console.log('🧪 OAuth 로그인 테스트 준비 중...\n');

// 환경 변수 확인
const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

console.log('📋 필수 환경 변수 확인:');
let allEnvVarsPresent = true;

requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ${envVar}: ✅ 설정됨`);
  } else {
    console.log(`   ${envVar}: ❌ 누락`);
    allEnvVarsPresent = false;
  }
});

if (!allEnvVarsPresent) {
  console.log('\n❌ 일부 환경 변수가 누락되었습니다.');
  console.log('   .env.local 파일을 확인하고 개발 서버를 재시작해주세요.');
  process.exit(1);
}

// Google OAuth 리디렉션 URI 확인
const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://donggori.clerk.accounts.dev/v1/oauth_callback';
console.log(`\n📋 리디렉션 URI: ${redirectUri}`);

// 테스트 URL 생성
const clientId = process.env.GOOGLE_CLIENT_ID;
const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
  `client_id=${clientId}&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}&` +
  `response_type=code&` +
  `scope=openid%20email%20profile&` +
  `access_type=offline&` +
  `prompt=consent`;

console.log('\n🔗 테스트 URL 생성됨');
console.log('   이 URL로 접속하여 OAuth 플로우를 테스트할 수 있습니다:');
console.log(`   ${testUrl}`);

console.log('\n📋 테스트 체크리스트:');
console.log('   1. 브라우저에서 http://localhost:3000 접속');
console.log('   2. 로그인 버튼 클릭');
console.log('   3. Google 로그인 선택');
console.log('   4. OAuth 동의 화면 확인');
console.log('   5. 성공적으로 리디렉션되는지 확인');

console.log('\n⚠️  주의사항:');
console.log('   - Google Cloud Console에 리디렉션 URI가 등록되어 있어야 합니다');
console.log('   - 개발 서버가 실행 중이어야 합니다 (bun run dev)');
console.log('   - 브라우저 캐시를 삭제했는지 확인하세요');

console.log('\n🎯 예상 결과:');
console.log('   ✅ 성공: Google 로그인 후 앱으로 정상 리디렉션');
console.log('   ❌ 실패: "redirect_uri_mismatch" 오류 발생');

console.log('\n📚 추가 정보:');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - Clerk 대시보드: https://dashboard.clerk.com/');
console.log('   - 문제 해결 가이드: docs/oauth-quick-fix-checklist.md');
