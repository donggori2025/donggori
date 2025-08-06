// Clerk 문제 깊이 진단 스크립트
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.local' });

console.log('🔍 Clerk 문제 깊이 진단 중...\n');

// 환경 변수 확인
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const allowedDomains = process.env.CLERK_ALLOWED_EMAIL_DOMAINS;

console.log('📋 현재 설정 상태:');
console.log(`- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_SECRET_KEY: ${clerkSecretKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_ALLOWED_EMAIL_DOMAINS: ${allowedDomains || '❌ 설정되지 않음'}`);

console.log('\n🔍 가능한 원인들:');

console.log('\n1️⃣ Clerk 대시보드 설정 문제:');
console.log('   - Allowlist가 활성화되었는지 확인');
console.log('   - 도메인 목록에 faddit.co.kr이 정확히 포함되었는지 확인');
console.log('   - 설정이 저장되었는지 확인');

console.log('\n2️⃣ 다른 Clerk 설정 문제:');
console.log('   - User & Authentication > Email, Phone, Username > Email Addresses');
console.log('   - User & Authentication > Social Connections > OAuth 설정');
console.log('   - User & Authentication > User Management > Sign-up restrictions');

console.log('\n3️⃣ 코드 문제:');
console.log('   - 브라우저 개발자 도구에서 JavaScript 오류 확인');
console.log('   - Network 탭에서 API 호출 실패 확인');
console.log('   - Console 탭에서 Clerk 관련 오류 확인');

console.log('\n4️⃣ 환경 문제:');
console.log('   - 개발 서버가 올바르게 실행 중인지 확인');
console.log('   - 환경 변수가 올바르게 로드되었는지 확인');
console.log('   - 브라우저 캐시 문제');

console.log('\n5️⃣ Clerk 계정 문제:');
console.log('   - Pro 플랜이 올바르게 활성화되었는지 확인');
console.log('   - API 키가 올바른지 확인');
console.log('   - 도메인 설정이 올바른지 확인');

console.log('\n🚨 즉시 확인해야 할 사항:');

console.log('\nA. 브라우저 개발자 도구 확인:');
console.log('   1. F12 또는 우클릭 > 검사');
console.log('   2. Console 탭에서 오류 메시지 확인');
console.log('   3. Network 탭에서 실패한 API 호출 확인');

console.log('\nB. Clerk 대시보드 로그 확인:');
console.log('   1. Clerk 대시보드 > Logs 섹션');
console.log('   2. 실패한 인증 시도 로그 확인');
console.log('   3. 오류 메시지 확인');

console.log('\nC. 테스트 방법:');
console.log('   1. 시크릿 모드에서 테스트');
console.log('   2. 다른 브라우저에서 테스트');
console.log('   3. 다른 이메일 도메인으로 테스트');

console.log('\nD. 임시 해결책:');
console.log('   1. Allowlist를 비활성화하고 모든 도메인 허용');
console.log('   2. 또는 faddit.co.kr 대신 다른 이메일 사용');
console.log('   3. Clerk 지원팀에 문의');

console.log('\n💡 디버깅 명령어:');
console.log('1. 개발 서버 재시작: bun dev');
console.log('2. 환경 변수 확인: bun run scripts/checkClerkConfig.js');
console.log('3. 브라우저 캐시 삭제 후 하드 새로고침');

console.log('\n🔧 추가 확인사항:');
console.log('- Clerk 대시보드에서 "Logs" 섹션 확인');
console.log('- 실패한 인증 시도 로그 확인');
console.log('- API 키가 올바른지 확인');
console.log('- 도메인 설정이 올바른지 확인');

if (!clerkPublishableKey || !clerkSecretKey) {
  console.log('\n❌ Clerk 키가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('\n✅ 진단 완료');
console.log('\n📞 다음 단계:');
console.log('1. 브라우저 개발자 도구에서 오류 확인');
console.log('2. Clerk 대시보드 로그 확인');
console.log('3. 필요시 Clerk 지원팀에 문의'); 