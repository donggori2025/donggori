// 테스트용 봉제공장 인증 정보 생성
// 실제 Supabase 연결 없이 로그인 정보만 생성

console.log('봉제공장 인증 정보 생성 테스트');
console.log('='.repeat(50));

// 70개 봉제공장의 간단한 인증 정보 생성
const authData = [];

for (let i = 1; i <= 70; i++) {
  const factoryNumber = i.toString().padStart(2, '0');
  
  authData.push({
    id: i.toString(),
    factory_id: i.toString(),
    username: `factory${factoryNumber}`,
    password: `factory${factoryNumber}!`,
    factory_name: `봉제공장${factoryNumber}`,
  });
}

console.log('생성된 로그인 정보:');
console.log('공장명'.padEnd(15) + ' | ' + '아이디'.padEnd(15) + ' | ' + '비밀번호');
console.log('-'.repeat(50));

authData.forEach(auth => {
  console.log(
    auth.factory_name.padEnd(15) + ' | ' + 
    auth.username.padEnd(15) + ' | ' + 
    auth.password
  );
});

console.log('='.repeat(50));
console.log(`총 ${authData.length}개의 봉제공장 인증 정보가 생성되었습니다.`);
console.log('\nSupabase DB에 이 정보를 저장하려면:');
console.log('1. Supabase 프로젝트에서 factory_auth 테이블을 생성하세요');
console.log('2. 환경변수 NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 설정하세요');
console.log('3. bun run scripts/simpleFactoryAuth.js를 실행하세요');

// SQL 생성 스크립트도 출력
console.log('\n=== 테이블 생성 SQL ===');
console.log(`
CREATE TABLE factory_auth (
  id TEXT PRIMARY KEY,
  factory_id TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  factory_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`);

console.log('\n=== 샘플 INSERT SQL ===');
authData.slice(0, 5).forEach(auth => {
  console.log(`INSERT INTO factory_auth (id, factory_id, username, password, factory_name) VALUES ('${auth.id}', '${auth.factory_id}', '${auth.username}', '${auth.password}', '${auth.factory_name}');`);
});
console.log('-- ... 나머지 65개 공장도 동일한 형식으로 추가'); 