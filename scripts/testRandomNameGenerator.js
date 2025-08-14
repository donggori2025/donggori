#!/usr/bin/env bun

// 랜덤 이름 생성기 테스트 스크립트
import { generateRandomName, isNameUsed, getUsedNames, clearUsedNames, validateName } from '../lib/randomNameGenerator.js';

console.log('🧪 랜덤 이름 생성기 테스트\n');

// 1. 기본 랜덤 이름 생성 테스트
console.log('1️⃣ 기본 랜덤 이름 생성 테스트:');
for (let i = 0; i < 10; i++) {
  const name = generateRandomName();
  console.log(`  ${i + 1}. ${name}`);
}

// 2. 중복 확인 테스트
console.log('\n2️⃣ 중복 확인 테스트:');
const testNames = [];
for (let i = 0; i < 20; i++) {
  const name = generateRandomName();
  testNames.push(name);
}

const uniqueNames = new Set(testNames);
console.log(`  생성된 이름 수: ${testNames.length}`);
console.log(`  고유한 이름 수: ${uniqueNames.size}`);
console.log(`  중복 여부: ${testNames.length === uniqueNames.size ? '✅ 중복 없음' : '❌ 중복 있음'}`);

// 3. 이름 유효성 검사 테스트
console.log('\n3️⃣ 이름 유효성 검사 테스트:');
const testCases = [
  '', // 빈 문자열
  'a', // 너무 짧음
  'abcdefghijk', // 너무 김
  '김', // 너무 짧음
  '김한재', // 유효함
  'John123', // 유효함
  '김한재!', // 특수문자 포함
  '김 한재', // 공백 포함
  '행복42', // 랜덤 이름 형식
  '희망15', // 랜덤 이름 형식
];

testCases.forEach((testCase, index) => {
  const result = validateName(testCase);
  console.log(`  ${index + 1}. "${testCase}" -> ${result.isValid ? '✅ 유효' : '❌ 유효하지 않음'}`);
  if (!result.isValid) {
    console.log(`     오류: ${result.error}`);
  }
});

// 4. 사용된 이름 목록 확인
console.log('\n4️⃣ 사용된 이름 목록:');
const usedNames = getUsedNames();
console.log(`  총 ${usedNames.length}개의 이름이 생성되었습니다.`);
console.log('  처음 10개:', usedNames.slice(0, 10));

// 5. 랜덤 이름 패턴 확인
console.log('\n5️⃣ 랜덤 이름 패턴 확인:');
const randomNames = usedNames.filter(name => /^[가-힣]+[0-9]{2}$/.test(name));
console.log(`  랜덤 이름 패턴 매칭: ${randomNames.length}개`);
console.log('  예시:', randomNames.slice(0, 5));

// 6. 성능 테스트
console.log('\n6️⃣ 성능 테스트:');
const startTime = Date.now();
for (let i = 0; i < 100; i++) {
  generateRandomName();
}
const endTime = Date.now();
console.log(`  100개 이름 생성 시간: ${endTime - startTime}ms`);

// 7. 초기화 테스트
console.log('\n7️⃣ 초기화 테스트:');
console.log(`  초기화 전 사용된 이름 수: ${getUsedNames().length}`);
clearUsedNames();
console.log(`  초기화 후 사용된 이름 수: ${getUsedNames().length}`);

console.log('\n✅ 테스트 완료!');

