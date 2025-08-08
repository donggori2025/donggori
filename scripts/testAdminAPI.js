const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAPI() {
  console.log('🔍 관리자 API 테스트 시작...\n');

  try {
    // 1. 현재 donggori 테이블 데이터 확인
    console.log('1. 현재 donggori 테이블 데이터 확인');
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, address, business_type, phone_number')
      .limit(5);

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`📊 총 ${data.length}개 데이터 발견\n`);
    
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.company_name || '이름 없음'} (ID: ${item.id})`);
      console.log(`   주소: ${item.address || '주소 없음'}`);
      console.log(`   업종: ${item.business_type || '업종 없음'}`);
      console.log(`   연락처: ${item.phone_number || '연락처 없음'}`);
      console.log('');
    });

    // 2. 스키마 정보 생성 테스트
    console.log('2. 스키마 정보 생성 테스트');
    if (data.length > 0) {
      const sampleRecord = data[0];
      const schemaInfo = Object.keys(sampleRecord).map(key => ({
        column_name: key,
        data_type: typeof sampleRecord[key],
        is_nullable: sampleRecord[key] === null,
        character_maximum_length: null,
        column_default: null
      }));

      console.log('생성된 스키마 정보:');
      schemaInfo.forEach(col => {
        console.log(`   ${col.column_name}: ${col.data_type}${col.is_nullable ? ' (nullable)' : ' (required)'}`);
      });
    }

    // 3. 새 데이터 삽입 테스트
    console.log('\n3. 새 데이터 삽입 테스트');
    const testData = {
      company_name: '테스트 업장',
      address: '서울시 강남구 테스트로 123',
      business_type: '봉제업',
      moq: 100,
      monthly_capacity: 10000,
      admin_district: '강남구',
      intro: '테스트용 업장입니다.',
      lat: 37.5665,
      lng: 126.9780
    };

    const { data: insertData, error: insertError } = await supabase
      .from('donggori')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ 데이터 삽입 실패:', insertError);
    } else {
      console.log('✅ 테스트 데이터 삽입 성공');
      console.log('삽입된 데이터:', insertData[0]);
      
      // 4. 삽입된 데이터 삭제
      console.log('\n4. 테스트 데이터 삭제');
      const { error: deleteError } = await supabase
        .from('donggori')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.error('❌ 테스트 데이터 삭제 실패:', deleteError);
      } else {
        console.log('✅ 테스트 데이터 삭제 성공');
      }
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

testAdminAPI();
