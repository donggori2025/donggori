import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableSchema() {
  console.log('🔍 donggori 테이블 스키마 확인 중...\n');

  try {
    // 1. 테이블 존재 여부 확인
    console.log('1️⃣ 테이블 존재 여부 확인...');
    const { data: tableData, error: tableError } = await supabase
      .from('donggori')
      .select('*')
      .limit(0); // 데이터는 가져오지 않고 스키마만 확인

    if (tableError) {
      console.error('❌ donggori 테이블 접근 실패:', tableError);
      return;
    }

    console.log('✅ donggori 테이블 접근 성공\n');

    // 2. 빈 테이블에 더미 데이터 삽입해서 스키마 확인
    console.log('2️⃣ 스키마 확인을 위한 더미 데이터 삽입...');
    const dummyData = {
      id: 999999,
      company_name: '테스트 공장',
      address: '서울시 강남구',
      lat: 37.5665,
      lng: 126.9780
    };

    const { data: insertData, error: insertError } = await supabase
      .from('donggori')
      .insert(dummyData)
      .select();

    if (insertError) {
      console.error('❌ 더미 데이터 삽입 실패:', insertError);
      console.log('💡 이는 테이블 스키마가 예상과 다를 수 있음을 의미합니다.');
      
      // 다른 방법으로 스키마 확인
      console.log('\n3️⃣ 다른 방법으로 스키마 확인...');
      const { data: emptyData, error: emptyError } = await supabase
        .from('donggori')
        .select('*')
        .limit(1);

      if (emptyError) {
        console.error('❌ 빈 쿼리도 실패:', emptyError);
        return;
      }

      console.log('✅ 빈 쿼리 성공 - 테이블은 존재하지만 컬럼이 다를 수 있습니다.');
      return;
    }

    console.log('✅ 더미 데이터 삽입 성공');
    console.log('📋 삽입된 데이터:', insertData);

    // 3. 삽입된 데이터로 스키마 확인
    console.log('\n3️⃣ 스키마 분석...');
    if (insertData && insertData.length > 0) {
      const record = insertData[0];
      console.log('📋 컬럼 목록:');
      Object.entries(record).forEach(([key, value], index) => {
        const valueType = typeof value;
        const isNull = value === null;
        const isArray = Array.isArray(value);
        
        console.log(`  ${index + 1}. ${key}: ${valueType}${isArray ? ' (array)' : ''}${isNull ? ' (null)' : ''}`);
        if (!isNull && !isArray && typeof value === 'string' && value.length > 50) {
          console.log(`     샘플값: "${value.substring(0, 50)}..."`);
        } else if (!isNull && !isArray) {
          console.log(`     샘플값: ${JSON.stringify(value)}`);
        }
      });
    }

    // 4. 더미 데이터 삭제
    console.log('\n4️⃣ 더미 데이터 삭제...');
    const { error: deleteError } = await supabase
      .from('donggori')
      .delete()
      .eq('id', 999999);

    if (deleteError) {
      console.error('❌ 더미 데이터 삭제 실패:', deleteError);
    } else {
      console.log('✅ 더미 데이터 삭제 완료');
    }

  } catch (error) {
    console.error('❌ 테이블 스키마 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkTableSchema().then(() => {
  console.log('\n✅ 테이블 스키마 확인 완료');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
}); 