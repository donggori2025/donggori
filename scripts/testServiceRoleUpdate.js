const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testServiceRoleUpdate() {
  console.log('🔍 Service Role로 공장 정보 업데이트 테스트...\n');

  try {
    const factoryId = "1";
    const parsedId = parseInt(factoryId);
    
    console.log('FactoryId:', factoryId, 'Type:', typeof factoryId);
    console.log('ParsedId:', parsedId, 'Type:', typeof parsedId);
    
    // 1. 조회 테스트
    console.log('\n1. 조회 테스트...');
    const { data: selectData, error: selectError } = await supabaseService
      .from('donggori')
      .select('id, company_name, kakao_url')
      .eq('id', parsedId)
      .single();
    
    if (selectError) {
      console.error('❌ 조회 오류:', selectError);
    } else {
      console.log('✅ 조회 성공:', selectData);
    }
    
    // 2. 업데이트 테스트
    console.log('\n2. 업데이트 테스트...');
    const { data: updateData, error: updateError } = await supabaseService
      .from('donggori')
      .update({ 
        kakao_url: 'https://open.kakao.com/o/sJD4pZQh',
        company_name: '스티치'
      })
      .eq('id', parsedId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ 업데이트 오류:', updateError);
    } else {
      console.log('✅ 업데이트 성공:', updateData);
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

testServiceRoleUpdate()
  .then(() => {
    console.log('\n✅ 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
