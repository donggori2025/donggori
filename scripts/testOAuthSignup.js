#!/usr/bin/env bun

/**
 * OAuth 회원가입 테스트 스크립트
 */

console.log('🧪 OAuth 회원가입 테스트 준비 중...\n');

// 테스트 데이터
const testUserData = {
  email: 'test@example.com',
  name: '테스트 사용자',
  picture: 'https://example.com/avatar.jpg',
  googleId: '123456789'
};

console.log('📋 테스트 데이터:');
console.log(`   이메일: ${testUserData.email}`);
console.log(`   이름: ${testUserData.name}`);
console.log(`   프로필 사진: ${testUserData.picture}`);
console.log(`   Google ID: ${testUserData.googleId}`);

console.log('\n🔗 테스트 방법:');
console.log('1. 브라우저에서 http://localhost:3001 접속');
console.log('2. 로그인 버튼 클릭');
console.log('3. Google 로그인 선택');
console.log('4. 계정 선택 후 OAuth 동의');
console.log('5. 회원가입 완료 확인');

console.log('\n📋 예상 결과:');
console.log('   ✅ 성공: OAuth 콜백 페이지에서 "로그인 완료!" 메시지 표시');
console.log('   ✅ 기존 사용자: "이미 가입된 계정입니다" 메시지 표시');
console.log('   ❌ 실패: 오류 메시지 표시');

console.log('\n🔍 디버깅 방법:');
console.log('1. 브라우저 개발자 도구 > Console 탭 확인');
console.log('2. Network 탭에서 API 호출 상태 확인');
console.log('3. 서버 로그 확인 (터미널에서)');

console.log('\n⚠️  주의사항:');
console.log('- Google Cloud Console에 리디렉션 URI가 등록되어 있어야 합니다');
console.log('- Clerk 설정이 올바르게 되어 있어야 합니다');
console.log('- 개발 서버가 실행 중이어야 합니다 (bun run dev)');

console.log('\n📚 추가 정보:');
console.log('- Clerk 대시보드: https://dashboard.clerk.com/');
console.log('- Google Cloud Console: https://console.cloud.google.com/');
console.log('- 문제 해결 가이드: docs/clerk-domain-issue-guide.md');
