const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageUpload() {
  console.log('🔍 이미지 업로드 기능 테스트 시작...\n');

  try {
    // 1. 현재 이미지가 있는 업장 데이터 확인
    console.log('1. 현재 이미지가 있는 업장 데이터 확인');
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, images')
      .not('images', 'is', null)
      .limit(5);

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`📊 이미지가 있는 업장: ${data.length}개\n`);
    
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.company_name} (ID: ${item.id})`);
      console.log(`   이미지 개수: ${item.images ? item.images.length : 0}`);
      if (item.images && item.images.length > 0) {
        console.log(`   첫 번째 이미지: ${item.images[0]}`);
      }
      console.log('');
    });

    // 2. 이미지 필드 구조 확인
    console.log('2. 이미지 필드 구조 확인');
    const { data: allData, error: allError } = await supabase
      .from('donggori')
      .select('*')
      .limit(1);

    if (allError) {
      console.error('❌ 전체 데이터 조회 실패:', allError);
      return;
    }

    if (allData.length > 0) {
      const sampleRecord = allData[0];
      console.log('샘플 레코드의 이미지 필드:');
      console.log(`   images 타입: ${typeof sampleRecord.images}`);
      console.log(`   images 값: ${JSON.stringify(sampleRecord.images)}`);
      
      if (Array.isArray(sampleRecord.images)) {
        console.log(`   이미지 배열 길이: ${sampleRecord.images.length}`);
      }
    }

    // 3. 이미지 URL 유효성 테스트
    console.log('\n3. 이미지 URL 유효성 테스트');
    const testUrls = [
      'https://example.com/test1.jpg',
      'https://example.com/test2.png',
      'https://example.com/test3.jpeg'
    ];

    console.log('테스트 이미지 URL 배열:');
    testUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });

    // 4. 새 업장에 이미지 추가 테스트
    console.log('\n4. 새 업장에 이미지 추가 테스트');
    const testData = {
      company_name: '이미지 테스트 업장',
      address: '서울시 강남구 테스트로 123',
      business_type: '봉제업',
      images: testUrls
    };

    const { data: insertData, error: insertError } = await supabase
      .from('donggori')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ 테스트 데이터 삽입 실패:', insertError);
    } else {
      console.log('✅ 테스트 데이터 삽입 성공');
      console.log('삽입된 데이터:', insertData[0]);
      
      // 5. 삽입된 데이터 삭제
      console.log('\n5. 테스트 데이터 삭제');
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

testImageUpload();
