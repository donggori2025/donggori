#!/usr/bin/env bun

console.log('🔍 Clerk OAuth 설정 확인 중...\n');

// 환경 변수 확인
const requiredEnvVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY'
];

console.log('📋 환경 변수 확인:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: 설정되지 않음`);
  }
});

console.log('\n🔧 Clerk OAuth 설정 체크리스트:');
console.log('1. Clerk 대시보드에서 OAuth 설정 확인:');
console.log('   - https://dashboard.clerk.com/');
console.log('   - User & Authentication > Social Connections');
console.log('   - Google OAuth가 활성화되어 있는지 확인');

console.log('\n2. Google Cloud Console 설정 확인:');
console.log('   - https://console.cloud.google.com/');
console.log('   - APIs & Services > Credentials');
console.log('   - OAuth 2.0 Client IDs에서 리디렉션 URI 확인');

console.log('\n3. 필요한 리디렉션 URI:');
console.log('   - https://donggori.clerk.accounts.dev/sso-callback');
console.log('   - https://clerk.donggori.com/sso-callback (커스텀 도메인 사용 시)');
console.log('   - http://localhost:3000/sso-callback (개발 환경)');

console.log('\n4. Clerk 대시보드에서 OAuth 설정:');
console.log('   - Social Connections > Google');
console.log('   - Client ID와 Client Secret이 올바르게 설정되어 있는지 확인');
console.log('   - Authorized redirect URIs에 위의 URI들이 포함되어 있는지 확인');

console.log('\n5. 현재 앱 설정 확인:');
console.log('   - app/layout.tsx에서 frontendApi가 주석 처리되어 있음');
console.log('   - 이는 기본 Clerk 도메인을 사용한다는 의미');

console.log('\n🚨 문제 해결 방법:');
console.log('1. Clerk 대시보드에서 Google OAuth 설정을 다시 확인');
console.log('2. Google Cloud Console에서 리디렉션 URI 추가');
console.log('3. 환경 변수가 올바르게 설정되어 있는지 확인');
console.log('4. 브라우저 캐시 및 쿠키 삭제 후 재시도');

console.log('\n📝 디버깅 팁:');
console.log('- 브라우저 개발자 도구에서 Network 탭 확인');
console.log('- OAuth 리디렉트 과정에서 어떤 URL로 이동하는지 확인');
console.log('- Clerk 대시보드의 로그에서 OAuth 오류 확인');
