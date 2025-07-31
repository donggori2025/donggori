import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ 설정됨' : '❌ 설정되지 않음');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ 설정됨' : '❌ 설정되지 않음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkNewDonggoriTable() {
  console.log('🔍 새로운 donggori 테이블 구조 확인 중...\n');

  try {
    // 1. 테이블 존재 여부 확인
    console.log('1️⃣ 테이블 존재 여부 확인...');
    const { data: tableData, error: tableError } = await supabase
      .from('donggori')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ donggori 테이블 접근 실패:', tableError);
      return;
    }

    console.log('✅ donggori 테이블 접근 성공\n');

    // 2. 전체 데이터 개수 확인
    console.log('2️⃣ 데이터 개수 확인...');
    const { count, error: countError } = await supabase
      .from('donggori')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 데이터 개수 확인 실패:', countError);
    } else {
      console.log(`✅ 총 ${count}개의 레코드가 있습니다.\n`);
    }

    // 3. 샘플 데이터로 컬럼 구조 확인
    console.log('3️⃣ 컬럼 구조 확인...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('donggori')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('❌ 샘플 데이터 조회 실패:', sampleError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      console.log('📋 컬럼 목록:');
      const columns = Object.keys(sampleData[0]);
      columns.forEach((column, index) => {
        const sampleValue = sampleData[0][column];
        const valueType = typeof sampleValue;
        const isNull = sampleValue === null;
        const isArray = Array.isArray(sampleValue);
        
        console.log(`  ${index + 1}. ${column}: ${valueType}${isArray ? ' (array)' : ''}${isNull ? ' (null)' : ''}`);
        if (!isNull && !isArray && typeof sampleValue === 'string' && sampleValue.length > 50) {
          console.log(`     샘플값: "${sampleValue.substring(0, 50)}..."`);
        } else if (!isNull && !isArray) {
          console.log(`     샘플값: ${JSON.stringify(sampleValue)}`);
        }
      });
      console.log('');

      // 4. 각 레코드의 상세 정보
      console.log('4️⃣ 샘플 데이터 상세 정보:');
      sampleData.forEach((record, index) => {
        console.log(`\n📄 레코드 ${index + 1}:`);
        Object.entries(record).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === 'string' && value.length > 100) {
              console.log(`  ${key}: "${value.substring(0, 100)}..."`);
            } else {
              console.log(`  ${key}: ${JSON.stringify(value)}`);
            }
          }
        });
      });
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.');
    }

    // 5. 특정 컬럼들의 데이터 타입 분석
    console.log('\n5️⃣ 주요 컬럼 데이터 타입 분석...');
    const importantColumns = ['id', 'company_name', 'address', 'lat', 'lng', 'business_type', 'moq', 'monthly_capacity'];
    
    for (const column of importantColumns) {
      const { data: columnData, error: columnError } = await supabase
        .from('donggori')
        .select(column)
        .limit(10);

      if (!columnError && columnData && columnData.length > 0) {
        const nonNullValues = columnData.filter(item => item[column] !== null);
        if (nonNullValues.length > 0) {
          const sampleValue = nonNullValues[0][column];
          console.log(`  ${column}: ${typeof sampleValue} (${nonNullValues.length}/${columnData.length} non-null)`);
        } else {
          console.log(`  ${column}: null values only`);
        }
      } else {
        console.log(`  ${column}: 컬럼이 존재하지 않거나 접근할 수 없음`);
      }
    }

  } catch (error) {
    console.error('❌ 테이블 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkNewDonggoriTable().then(() => {
  console.log('\n✅ 테이블 구조 확인 완료');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
}); 