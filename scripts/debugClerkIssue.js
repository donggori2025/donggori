// Clerk 문제 상세 진단 스크립트
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.local' });

console.log('🔍 Clerk 문제 상세 진단 중...\n');

// 환경 변수 확인
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const allowedDomains = process.env.CLERK_ALLOWED_EMAIL_DOMAINS;

console.log('📋 현재 설정 상태:');
console.log(`- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_SECRET_KEY: ${clerkSecretKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_ALLOWED_EMAIL_DOMAINS: ${allowedDomains || '❌ 설정되지 않음'}`);

console.log('\n🔧 해결 단계별 체크리스트:');

console.log('\n1️⃣ Clerk 대시보드 설정:');
console.log('   □ "Enable allowlist" 체크박스 활성화');
console.log('   □ 도메인 목록에 faddit.co.kr 포함');
console.log('   □ 설정 저장 후 페이지 새로고침');

console.log('\n2️⃣ 환경 변수 설정:');
console.log('   □ .env.local 파일에 CLERK_ALLOWED_EMAIL_DOMAINS 설정');
console.log('   □ 개발 서버 재시작');

console.log('\n3️⃣ 브라우저 캐시:');
console.log('   □ 브라우저 캐시 삭제');
console.log('   □ 하드 새로고침 (Ctrl+Shift+R 또는 Cmd+Shift+R)');

console.log('\n4️⃣ 네트워크 확인:');
console.log('   □ 개발자 도구 > Network 탭에서 API 호출 확인');
console.log('   □ Console 탭에서 JavaScript 오류 확인');

console.log('\n5️⃣ 추가 확인사항:');
console.log('   □ User & Authentication > Email, Phone, Username > Email Addresses');
console.log('   □ User & Authentication > Social Connections > OAuth 설정');
console.log('   □ User & Authentication > User Management > Sign-up restrictions');

console.log('\n🚨 즉시 해결 방법:');
console.log('1. Clerk 대시보드에서 "Enable allowlist" 체크박스를 반드시 체크하세요');
console.log('2. 설정 저장 후 페이지 새로고침');
console.log('3. 개발 서버 재시작: bun dev');
console.log('4. 브라우저 캐시 삭제 후 테스트');

console.log('\n💡 문제가 지속되는 경우:');
console.log('- Clerk 대시보드에서 Logs 섹션 확인');
console.log('- 실패한 인증 시도 로그 확인');
console.log('- Clerk 지원팀에 문의');

if (!clerkPublishableKey || !clerkSecretKey) {
  console.log('\n❌ Clerk 키가 설정되지 않았습니다.');
  process.exit(1);
}

console.log('\n✅ 진단 완료'); 