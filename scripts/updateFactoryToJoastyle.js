const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateFactoryToJoastyle() {
  try {
    console.log('기존 공장을 조아스타일로 업데이트합니다...');

    // 먼저 조아스타일이 이미 있는지 확인
    const { data: existingData, error: checkError } = await supabase
      .from('donggori')
      .select('id, company_name')
      .ilike('company_name', '%조아%');

    if (checkError) {
      console.error('기존 데이터 확인 중 오류:', checkError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('이미 조아스타일 관련 데이터가 있습니다:', existingData);
      return;
    }

    // 기존 공장 중 하나를 조아스타일로 업데이트 (예: ID가 큰 것 중 하나)
    const { data: factories, error: fetchError } = await supabase
      .from('donggori')
      .select('id, company_name')
      .order('id', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('공장 목록 조회 중 오류:', fetchError);
      return;
    }

    if (!factories || factories.length === 0) {
      console.error('업데이트할 공장을 찾을 수 없습니다.');
      return;
    }

    const factoryToUpdate = factories[0];
    console.log('업데이트할 공장:', factoryToUpdate);

    // 조아스타일로 업데이트
    const { data, error } = await supabase
      .from('donggori')
      .update({
        company_name: '조아스타일',
        contact_name: '조아스타일 담당자',
        phone_number: 212345678,
        email: 'contact@joastyle.com',
        address: '서울특별시 동대문구 이문동',
        lat: 37.5679,
        lng: 126.9789,
        admin_district: '이문동',
        intro: '조아스타일 - 고품질 의류 제작 전문 업체입니다.',
        moq: 50,
        monthly_capacity: 1000,
        brands_supplied: '조아스타일',
        business_type: '봉제',
        top_items_upper: '티셔츠, 블라우스',
        top_items_lower: '바지, 스커트',
        top_items_outer: '자켓, 코트',
        factory_type: '봉제',
        main_fabrics: '다이마루'
      })
      .eq('id', factoryToUpdate.id)
      .select();

    if (error) {
      console.error('공장 업데이트 중 오류:', error);
      return;
    }

    console.log('공장이 성공적으로 조아스타일로 업데이트되었습니다:', data);
    console.log('업데이트된 ID:', data[0].id);

  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

updateFactoryToJoastyle();
