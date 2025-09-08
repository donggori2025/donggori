const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDonggoriTable() {
  console.log('🔍 donggori 테이블 구조 확인 중...\n');

  try {
    // 1. 테이블 존재 여부 확인
    console.log('1. 테이블 존재 여부 확인...');
    const { data: tableData, error: tableError } = await supabase
      .from('donggori')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ 테이블 접근 오류:', {
        message: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      });
      return;
    }

    console.log('✅ 테이블 접근 성공');

    // 2. 컬럼 구조 확인
    console.log('\n2. 컬럼 구조 확인...');
    if (tableData && tableData.length > 0) {
      const firstRow = tableData[0];
      console.log('📋 컬럼 목록:');
      Object.keys(firstRow).forEach(key => {
        console.log(`   - ${key}: ${typeof firstRow[key]} (${firstRow[key] ? '값 있음' : '값 없음'})`);
      });
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.');
    }

    // 3. images 컬럼 특별 확인
    console.log('\n3. images 컬럼 확인...');
    const { data: imagesData, error: imagesError } = await supabase
      .from('donggori')
      .select('id, images')
      .limit(5);

    if (imagesError) {
      console.error('❌ images 컬럼 조회 오류:', {
        message: imagesError.message,
        code: imagesError.code,
        details: imagesError.details,
        hint: imagesError.hint
      });
    } else {
      console.log('✅ images 컬럼 조회 성공');
      console.log('📊 images 컬럼 샘플 데이터:');
      imagesData.forEach((row, index) => {
        console.log(`   ${index + 1}. ID: ${row.id}, images: ${JSON.stringify(row.images)}`);
      });
    }

    // 4. 전체 데이터 개수 확인
    console.log('\n4. 전체 데이터 개수 확인...');
    const { count, error: countError } = await supabase
      .from('donggori')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 데이터 개수 조회 오류:', countError);
    } else {
      console.log(`📈 전체 데이터 개수: ${count}개`);
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', {
      message: error.message,
      stack: error.stack
    });
  }
}

// 스크립트 실행
checkDonggoriTable()
  .then(() => {
    console.log('\n✅ 테이블 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
