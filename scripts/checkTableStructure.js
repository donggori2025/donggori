const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 donggori 테이블 구조 확인 중...\n');

  try {
    // 1. 샘플 데이터 조회로 컬럼 구조 파악
    console.log('1. 샘플 데이터 조회');
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    if (data.length > 0) {
      const sampleRecord = data[0];
      console.log('✅ 샘플 데이터 조회 성공');
      console.log('📋 테이블 컬럼 구조:');
      console.log('='.repeat(50));
      
      Object.keys(sampleRecord).forEach((key, index) => {
        const value = sampleRecord[key];
        const type = typeof value;
        const isArray = Array.isArray(value);
        const isNull = value === null;
        
        console.log(`${index + 1}. ${key}`);
        console.log(`   타입: ${type}${isArray ? ' (배열)' : ''}`);
        console.log(`   값: ${isNull ? 'null' : JSON.stringify(value)}`);
        console.log('');
      });

      // 2. 이미지 관련 컬럼 확인
      console.log('2. 이미지 관련 컬럼 확인');
      const imageRelatedColumns = Object.keys(sampleRecord).filter(key => 
        key.toLowerCase().includes('image') || 
        key.toLowerCase().includes('img') || 
        key.toLowerCase().includes('photo') ||
        key.toLowerCase().includes('picture')
      );

      if (imageRelatedColumns.length > 0) {
        console.log('📸 이미지 관련 컬럼 발견:');
        imageRelatedColumns.forEach(col => {
          console.log(`   - ${col}: ${typeof sampleRecord[col]}`);
        });
      } else {
        console.log('❌ 이미지 관련 컬럼이 없습니다.');
      }

      // 3. 배열 타입 컬럼 확인
      console.log('\n3. 배열 타입 컬럼 확인');
      const arrayColumns = Object.keys(sampleRecord).filter(key => 
        Array.isArray(sampleRecord[key])
      );

      if (arrayColumns.length > 0) {
        console.log('📦 배열 타입 컬럼:');
        arrayColumns.forEach(col => {
          const arr = sampleRecord[col];
          console.log(`   - ${col}: ${arr.length}개 요소`);
          if (arr.length > 0) {
            console.log(`     첫 번째 요소: ${typeof arr[0]} - ${JSON.stringify(arr[0])}`);
          }
        });
      } else {
        console.log('❌ 배열 타입 컬럼이 없습니다.');
      }

    } else {
      console.log('❌ 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

checkTableStructure();
