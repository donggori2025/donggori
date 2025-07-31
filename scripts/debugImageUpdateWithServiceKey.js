const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (서비스 롤 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

// 서비스 롤 키로 클라이언트 생성 (RLS 우회)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugImageUpdate() {
  console.log('서비스 롤 키로 DB 업데이트 디버깅을 시작합니다...\n');

  // 테스트용 이미지 URL 배열
  const testImageUrls = [
    'https://example.com/test1.jpg',
    'https://example.com/test2.jpg'
  ];

  // 공장 ID 2 (재민상사)로 테스트
  const factoryId = 2;

  console.log(`공장 ID ${factoryId}에 이미지 URL을 업데이트합니다...`);
  console.log(`업데이트할 이미지 URL들:`, testImageUrls);

  try {
    // 현재 상태 확인
    const { data: currentData, error: selectError } = await supabase
      .from('donggori')
      .select('id, company_name, images')
      .eq('id', factoryId)
      .single();

    if (selectError) {
      console.error('현재 데이터 조회 오류:', selectError);
      return;
    }

    console.log('현재 DB 상태:');
    console.log('  ID:', currentData.id);
    console.log('  공장명:', currentData.company_name);
    console.log('  현재 이미지:', currentData.images);

    // 이미지 업데이트
    const { data: updateData, error: updateError } = await supabase
      .from('donggori')
      .update({ images: testImageUrls })
      .eq('id', factoryId)
      .select();

    if (updateError) {
      console.error('업데이트 오류:', updateError);
      return;
    }

    console.log('\n업데이트 후 결과:');
    console.log('  업데이트된 데이터:', updateData);

    // 다시 조회해서 확인
    const { data: verifyData, error: verifyError } = await supabase
      .from('donggori')
      .select('id, company_name, images')
      .eq('id', factoryId)
      .single();

    if (verifyError) {
      console.error('검증 조회 오류:', verifyError);
      return;
    }

    console.log('\n검증 결과:');
    console.log('  ID:', verifyData.id);
    console.log('  공장명:', verifyData.company_name);
    console.log('  업데이트된 이미지:', verifyData.images);

  } catch (error) {
    console.error('전체 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  debugImageUpdate().catch(console.error);
} 