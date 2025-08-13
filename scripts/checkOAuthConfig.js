#!/usr/bin/env bun

/**
 * OAuth 설정 확인 스크립트
 * Google OAuth와 Clerk 설정을 검증합니다.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 OAuth 설정 확인 중...\n');

// 환경 변수 로드
const envPath = join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('⚠️  .env.local 파일을 찾을 수 없습니다.');
  console.log('   환경 변수를 직접 확인해주세요.\n');
}

// 환경 변수 파싱
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

// Google OAuth 설정 확인
console.log('📋 Google OAuth 설정:');
const googleClientId = process.env.GOOGLE_CLIENT_ID || envVars.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || envVars.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || envVars.GOOGLE_REDIRECT_URI;

console.log(`   Client ID: ${googleClientId ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`   Client Secret: ${googleClientSecret ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`   Redirect URI: ${googleRedirectUri || '기본값: http://localhost:3000/v1/oauth_callback'}`);

// Clerk 설정 확인
console.log('\n📋 Clerk 설정:');
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || envVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY || envVars.CLERK_SECRET_KEY;
const clerkFrontendApi = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || envVars.NEXT_PUBLIC_CLERK_FRONTEND_API;

console.log(`   Publishable Key: ${clerkPublishableKey ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`   Secret Key: ${clerkSecretKey ? '✅ 설정됨' : '❌ 누락'}`);
console.log(`   Frontend API: ${clerkFrontendApi || '기본 Clerk 도메인 사용'}`);

// 레이아웃 파일 확인
console.log('\n📋 레이아웃 설정:');
try {
  const layoutPath = join(process.cwd(), 'app', 'layout.tsx');
  const layoutContent = readFileSync(layoutPath, 'utf8');
  
  const hasFrontendApi = layoutContent.includes('frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}');
  const isCommented = layoutContent.includes('// frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}');
  
  if (hasFrontendApi && !isCommented) {
    console.log('   Clerk 커스텀 도메인: ✅ 활성화됨');
  } else if (isCommented) {
    console.log('   Clerk 커스텀 도메인: ⚠️  주석 처리됨 (기본 도메인 사용)');
  } else {
    console.log('   Clerk 커스텀 도메인: ❌ 설정되지 않음');
  }
} catch (error) {
  console.log('   레이아웃 파일을 읽을 수 없습니다.');
}

// 권장 리디렉션 URI 목록
console.log('\n📋 Google Cloud Console에 등록해야 할 리디렉션 URI:');

if (clerkFrontendApi) {
  console.log(`   ✅ https://${clerkFrontendApi}/v1/oauth_callback (커스텀 도메인)`);
} else {
  console.log('   ✅ https://donggori.clerk.accounts.dev/v1/oauth_callback (기본 도메인)');
}

console.log('   ✅ http://localhost:3000/v1/oauth_callback (개발용)');
console.log('   ✅ http://127.0.0.1:3000/v1/oauth_callback (개발용 대안)');

// 문제 진단
console.log('\n🔍 문제 진단:');

const issues = [];

if (!googleClientId) {
  issues.push('❌ Google Client ID가 설정되지 않았습니다.');
}

if (!googleClientSecret) {
  issues.push('❌ Google Client Secret이 설정되지 않았습니다.');
}

if (!clerkPublishableKey) {
  issues.push('❌ Clerk Publishable Key가 설정되지 않았습니다.');
}

if (!clerkSecretKey) {
  issues.push('❌ Clerk Secret Key가 설정되지 않았습니다.');
}

if (issues.length === 0) {
  console.log('✅ 모든 필수 설정이 완료되었습니다.');
  console.log('\n💡 다음 단계:');
  console.log('   1. Google Cloud Console에서 리디렉션 URI 등록');
  console.log('   2. Clerk 커스텀 도메인 설정 확인');
  console.log('   3. 개발 서버 재시작: bun run dev');
} else {
  console.log('⚠️  다음 문제들을 해결해주세요:');
  issues.forEach(issue => console.log(`   ${issue}`));
}

console.log('\n📚 추가 정보:');
console.log('   - Google Cloud Console: https://console.cloud.google.com/');
console.log('   - Clerk 대시보드: https://dashboard.clerk.com/');
console.log('   - 가이드 문서: docs/clerk-domain-issue-guide.md');
