const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '설정됨' : '없음');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '설정됨' : '없음');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addJoastyleToSupabase() {
  try {
    console.log('조아스타일 데이터를 Supabase에 추가합니다...');

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

    // 기존 데이터 구조 확인을 위해 샘플 데이터 가져오기
    const { data: sampleData, error: sampleError } = await supabase
      .from('donggori')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('샘플 데이터 조회 중 오류:', sampleError);
      return;
    }

    if (sampleData && sampleData.length > 0) {
      console.log('기존 데이터 구조:', Object.keys(sampleData[0]));
      
      // 기존 데이터를 복사해서 조아스타일로 수정
      const sample = sampleData[0];
      const joastyleData = {
        ...sample,
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
      };
      
      // ID 제거 (자동 생성되도록)
      delete joastyleData.id;
      
      console.log('추가할 데이터:', joastyleData);
      
      const { data, error } = await supabase
        .from('donggori')
        .insert(joastyleData)
        .select();

      if (error) {
        console.error('조아스타일 데이터 추가 중 오류:', error);
        return;
      }

      console.log('조아스타일 데이터가 성공적으로 추가되었습니다:', data);
      console.log('추가된 ID:', data[0].id);
    }

  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
  }
}

addJoastyleToSupabase();
