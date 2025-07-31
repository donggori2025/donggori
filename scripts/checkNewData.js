const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNewData() {
  console.log('새로 추가된 공장 데이터를 확인합니다...\n');

  try {
    // 전체 데이터 조회
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    if (error) {
      console.error('DB 조회 오류:', error);
      return;
    }

    console.log(`최근 추가된 공장 데이터 (최대 10개):\n`);

    data.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name} (ID: ${factory.id})`);
      console.log(`   지역: ${factory.admin_district}`);
      console.log(`   MOQ: ${factory.moq}`);
      console.log(`   월생산량: ${factory.monthly_capacity}`);
      console.log(`   이미지 개수: ${factory.images ? factory.images.length : 0}`);
      if (factory.images && factory.images.length > 0) {
        console.log(`   첫 번째 이미지: ${factory.images[0]}`);
      }
      console.log(`   주요 품목: ${factory.top_items_upper || '-'}`);
      console.log(`   비즈니스 타입: ${factory.business_type || '-'}`);
      console.log('');
    });

    // 전체 공장 수 확인
    const { count, error: countError } = await supabase
      .from('donggori')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('전체 개수 조회 오류:', countError);
    } else {
      console.log(`전체 공장 수: ${count}개`);
    }

    // 이미지가 있는 공장 수 확인
    const { data: factoriesWithImages, error: imageError } = await supabase
      .from('donggori')
      .select('id')
      .not('images', 'is', null)
      .not('images', 'eq', '{}');

    if (imageError) {
      console.error('이미지 데이터 조회 오류:', imageError);
    } else {
      console.log(`이미지가 있는 공장 수: ${factoriesWithImages.length}개`);
    }

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkNewData().catch(console.error);
} 