const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFactoryId1() {
  console.log('🔍 factoryId=1 데이터 확인 중...\n');

  try {
    // 1. id=1인 데이터 조회
    console.log('1. id=1인 데이터 조회...');
    const { data: factory1, error: error1 } = await supabase
      .from('donggori')
      .select('*')
      .eq('id', 1)
      .single();

    if (error1) {
      console.error('❌ id=1 조회 오류:', error1);
    } else {
      console.log('✅ id=1 데이터:', factory1);
    }

    // 2. id=1인 데이터 조회 (문자열로)
    console.log('\n2. id="1"인 데이터 조회...');
    const { data: factory1Str, error: error1Str } = await supabase
      .from('donggori')
      .select('*')
      .eq('id', '1')
      .single();

    if (error1Str) {
      console.error('❌ id="1" 조회 오류:', error1Str);
    } else {
      console.log('✅ id="1" 데이터:', factory1Str);
    }

    // 3. 처음 5개 데이터의 id 확인
    console.log('\n3. 처음 5개 데이터의 id 확인...');
    const { data: first5, error: error5 } = await supabase
      .from('donggori')
      .select('id, company_name')
      .limit(5);

    if (error5) {
      console.error('❌ 처음 5개 조회 오류:', error5);
    } else {
      console.log('✅ 처음 5개 데이터:');
      first5.forEach((item, index) => {
        console.log(`   ${index + 1}. id: ${item.id} (${typeof item.id}), company_name: ${item.company_name}`);
      });
    }

    // 4. id=1 업데이트 테스트
    console.log('\n4. id=1 업데이트 테스트...');
    const { data: updateTest, error: updateError } = await supabase
      .from('donggori')
      .update({ company_name: '테스트 업데이트' })
      .eq('id', 1)
      .select()
      .single();

    if (updateError) {
      console.error('❌ id=1 업데이트 오류:', updateError);
    } else {
      console.log('✅ id=1 업데이트 성공:', updateTest);
      
      // 원래대로 복구
      const { data: restoreTest, error: restoreError } = await supabase
        .from('donggori')
        .update({ company_name: '스티치' })
        .eq('id', 1)
        .select()
        .single();
      
      if (restoreError) {
        console.error('❌ 복구 오류:', restoreError);
      } else {
        console.log('✅ 복구 성공:', restoreTest);
      }
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

checkFactoryId1()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
