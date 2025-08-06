// Clerk 설정 확인 및 도메인 제한 문제 진단 스크립트 (Pro 플랜)
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.local' });

console.log('🔍 Clerk Pro 플랜 설정 확인 중...\n');

// 환경 변수 확인
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const allowedDomains = process.env.CLERK_ALLOWED_EMAIL_DOMAINS;

console.log('📋 환경 변수 상태:');
console.log(`- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${clerkPublishableKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_SECRET_KEY: ${clerkSecretKey ? '✅ 설정됨' : '❌ 설정되지 않음'}`);
console.log(`- CLERK_ALLOWED_EMAIL_DOMAINS: ${allowedDomains || '❌ 설정되지 않음'}`);

if (allowedDomains) {
  const domains = allowedDomains.split(',').map(d => d.trim());
  console.log(`\n📧 허용된 도메인 목록:`);
  domains.forEach(domain => {
    const isFaddit = domain === 'faddit.co.kr';
    console.log(`  ${isFaddit ? '🔴' : '✅'} ${domain}${isFaddit ? ' (문제 도메인)' : ''}`);
  });
  
  if (!domains.includes('faddit.co.kr')) {
    console.log('\n⚠️  문제 발견: faddit.co.kr 도메인이 허용 목록에 포함되지 않았습니다.');
    console.log('해결 방법:');
    console.log('1. .env.local 파일에 CLERK_ALLOWED_EMAIL_DOMAINS에 faddit.co.kr 추가');
    console.log('2. Clerk 대시보드에서 Allowlist 설정 확인');
  } else {
    console.log('\n✅ faddit.co.kr 도메인이 허용 목록에 포함되어 있습니다.');
  }
} else {
  console.log('\n⚠️  CLERK_ALLOWED_EMAIL_DOMAINS가 설정되지 않았습니다.');
  console.log('Pro 플랜에서는 Allowlist를 사용하는 것을 권장합니다.');
}

console.log('\n🔧 Clerk Pro 플랜 해결 방법:');
console.log('1. Clerk 대시보드에서 User & Authentication > Restrictions > Allowlist 활성화');
console.log('2. Allowlist에 다음 도메인들 추가:');
console.log('   - gmail.com');
console.log('   - naver.com');
console.log('   - kakao.com');
console.log('   - faddit.co.kr');
console.log('3. .env.local 파일에 CLERK_ALLOWED_EMAIL_DOMAINS 설정');
console.log('4. User & Authentication > Email, Phone, Username > Email Addresses 확인');

console.log('\n📝 Pro 플랜 추가 확인사항:');
console.log('- User & Authentication > Restrictions > Allowlist 활성화 여부');
console.log('- User & Authentication > Email, Phone, Username > Allowed email domains');
console.log('- User & Authentication > Social Connections > 각 OAuth 제공자 설정');
console.log('- User & Authentication > User Management > Sign-up restrictions');

console.log('\n🚀 Pro 플랜 권장 설정:');
console.log('1. Allowlist 활성화 후 허용 도메인 추가');
console.log('2. Blocklist는 비활성화 상태 유지');
console.log('3. Sign-up mode는 Public 유지');
console.log('4. "Disable allowlist and blocklist restrictions on sign-in" 비활성화');

if (!clerkPublishableKey || !clerkSecretKey) {
  console.log('\n❌ Clerk 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
  process.exit(1);
}

console.log('\n✅ Pro 플랜 설정 확인 완료');
console.log('\n💡 다음 단계:');
console.log('1. Clerk 대시보드에서 Allowlist 활성화');
console.log('2. faddit.co.kr 도메인 추가');
console.log('3. 테스트 진행'); 