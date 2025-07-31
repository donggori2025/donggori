const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  console.log('DB에 저장된 이미지 URL들을 확인합니다...\n');

  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, images')
      .not('images', 'is', null);

    if (error) {
      console.error('DB 조회 오류:', error);
      return;
    }

    console.log(`총 ${data.length}개의 공장에서 이미지 데이터를 찾았습니다.\n`);

    data.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name} (ID: ${factory.id})`);
      console.log(`   이미지 개수: ${factory.images ? factory.images.length : 0}`);
      if (factory.images && factory.images.length > 0) {
        console.log(`   첫 번째 이미지: ${factory.images[0]}`);
      }
      console.log('');
    });

    // 이미지가 있는 공장들만 필터링
    const factoriesWithImages = data.filter(f => f.images && f.images.length > 0);
    console.log(`이미지가 있는 공장: ${factoriesWithImages.length}개`);
    console.log(`이미지가 없는 공장: ${data.length - factoriesWithImages.length}개`);

  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  checkImages().catch(console.error);
} 