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

async function testDonggoriAccess() {
  console.log('🔍 donggori 테이블 접근 테스트 중...\n');

  try {
    // 1. 읽기 테스트
    console.log('1️⃣ 읽기 테스트...');
    const { data: readData, error: readError } = await supabase
      .from('donggori')
      .select('*')
      .limit(3);

    if (readError) {
      console.error('❌ 읽기 실패:', readError);
    } else {
      console.log('✅ 읽기 성공');
      console.log(`📊 ${readData.length}개 레코드 조회됨`);
      if (readData.length > 0) {
        console.log('📋 첫 번째 레코드 컬럼들:', Object.keys(readData[0]));
      }
    }

    // 2. 데이터 개수 확인
    console.log('\n2️⃣ 전체 데이터 개수 확인...');
    const { count, error: countError } = await supabase
      .from('donggori')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 개수 확인 실패:', countError);
    } else {
      console.log(`✅ 총 ${count}개의 레코드가 있습니다.`);
    }

    // 3. 특정 조건으로 검색 테스트
    console.log('\n3️⃣ 검색 테스트...');
    const { data: searchData, error: searchError } = await supabase
      .from('donggori')
      .select('company_name, address, phone_number')
      .ilike('company_name', '%스티치%')
      .limit(2);

    if (searchError) {
      console.error('❌ 검색 실패:', searchError);
    } else {
      console.log('✅ 검색 성공');
      console.log(`📊 ${searchData.length}개 결과`);
      searchData.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.company_name} - ${item.address}`);
      });
    }

    // 4. 위치 데이터 확인
    console.log('\n4️⃣ 위치 데이터 확인...');
    const { data: locationData, error: locationError } = await supabase
      .from('donggori')
      .select('company_name, address')
      .limit(5);

    if (locationError) {
      console.error('❌ 위치 데이터 조회 실패:', locationError);
    } else {
      console.log('✅ 위치 데이터 조회 성공');
      locationData.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.company_name}: ${item.address}`);
      });
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 스크립트 실행
testDonggoriAccess().then(() => {
  console.log('\n✅ 접근 테스트 완료');
  process.exit(0);
}).catch((error) => {
  console.error('❌ 스크립트 실행 실패:', error);
  process.exit(1);
}); 