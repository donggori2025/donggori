require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificFactory() {
  console.log('🔍 18번 업장 "나인" 상세 데이터 확인 중...\n');

  try {
    // 18번 업장 데이터 조회
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .eq('id', 18)
      .single();

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    if (!data) {
      console.log('❌ 18번 업장을 찾을 수 없습니다.');
      return;
    }

    console.log('📊 18번 업장 "나인" 전체 데이터:');
    console.log('='.repeat(80));
    
    // 모든 필드를 순서대로 출력
    Object.entries(data).forEach(([key, value]) => {
      const valueType = typeof value;
      const isNull = value === null;
      const isEmpty = value === '';
      const isEmptyString = value === '(없음)';
      
      console.log(`${key}:`);
      console.log(`  타입: ${valueType}`);
      console.log(`  값: ${JSON.stringify(value)}`);
      console.log(`  null: ${isNull}, 빈문자열: ${isEmpty}, "(없음)": ${isEmptyString}`);
      console.log('');
    });

    // 특수 장비 관련 필드들 특별 확인
    console.log('🔍 특수 장비 관련 필드 상세 분석:');
    console.log('='.repeat(50));
    
    const specialRelatedFields = [
      'special_machines',
      'special_tech', 
      'equipment',
      'sewing_machines',
      'pattern_machines'
    ];

    specialRelatedFields.forEach(field => {
      const value = data[field];
      console.log(`${field}:`);
      console.log(`  값: ${JSON.stringify(value)}`);
      console.log(`  길이: ${value ? value.length : 0}`);
      console.log(`  공백제거 후: ${value ? value.trim() : 'null'}`);
      console.log(`  공백제거 후 길이: ${value ? value.trim().length : 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

checkSpecificFactory();
