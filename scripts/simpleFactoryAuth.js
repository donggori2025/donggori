const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 간단한 봉제공장 인증 정보 생성
async function generateSimpleFactoryAuth() {
  try {
    console.log('봉제공장 인증 정보 생성을 시작합니다...');

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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    console.log('생성된 인증 정보:');
    authData.forEach(auth => {
      console.log(`${auth.factory_name}: ${auth.username} / ${auth.password}`);
    });

    // 기존 데이터 삭제
    console.log('기존 데이터를 삭제합니다...');
    const { error: deleteError } = await supabase
      .from('factory_auth')
      .delete()
      .neq('id', '0');

    if (deleteError) {
      console.error('기존 데이터 삭제 중 오류:', deleteError);
      // 테이블이 없을 수 있으므로 계속 진행
    }

    // 새로운 인증 정보 삽입
    console.log('새로운 인증 정보를 삽입합니다...');
    const { data: insertData, error: insertError } = await supabase
      .from('factory_auth')
      .insert(authData)
      .select();

    if (insertError) {
      console.error('인증 정보 삽입 중 오류:', insertError);
      console.log('테이블 구조를 확인해주세요. 다음 SQL로 테이블을 생성할 수 있습니다:');
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
      return;
    }

    console.log(`\n✅ 성공적으로 ${insertData.length}개의 봉제공장 인증 정보를 생성했습니다!`);
    console.log('\n생성된 로그인 정보:');
    console.log('='.repeat(60));
    
    insertData.forEach(auth => {
      console.log(`${auth.factory_name.padEnd(15)} | ${auth.username.padEnd(15)} | ${auth.password}`);
    });
    
    console.log('='.repeat(60));
    console.log('\n이제 봉제공장들이 이 정보로 로그인할 수 있습니다.');
    console.log('\n예시:');
    console.log('- 아이디: factory01');
    console.log('- 비밀번호: factory01!');

  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

// 스크립트 실행
generateSimpleFactoryAuth(); 