const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealData() {
  try {
    console.log('🔍 실제 공장 데이터 확인 중...\n');
    
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, address, business_type')
      .order('company_name');

    if (error) {
      console.error('❌ 데이터 가져오기 실패:', error);
      return;
    }

    console.log(`📊 총 ${data.length}개 공장 발견\n`);
    
    console.log('🏢 공장별 정보:');
    console.log('='.repeat(80));
    
    data.forEach((factory, index) => {
      const companyName = factory.company_name || '이름 없음';
      console.log(`${index + 1}. ${companyName}`);
      console.log(`   ID: ${factory.id}`);
      console.log(`   주소: ${factory.address || '주소 없음'}`);
      console.log(`   업태: ${factory.business_type || '업태 없음'}`);
      console.log('');
    });

    // 공장명별 분류
    const nameGroups = {};
    data.forEach(factory => {
      const name = factory.company_name || '이름 없음';
      if (!nameGroups[name]) {
        nameGroups[name] = [];
      }
      nameGroups[name].push({
        id: factory.id,
        address: factory.address || '주소 없음',
        business_type: factory.business_type || '업태 없음'
      });
    });

    console.log('🏢 공장명별 정보:');
    console.log('='.repeat(50));
    
    Object.entries(nameGroups).forEach(([name, factories]) => {
      console.log(`\n🏭 공장명: ${name}`);
      factories.forEach(factory => {
        console.log(`   ID: ${factory.id}, 주소: ${factory.address}, 업태: ${factory.business_type}`);
      });
    });

    // 주소별 분류
    const addressGroups = {};
    data.forEach(factory => {
      const address = factory.address || '주소 없음';
      if (!addressGroups[address]) {
        addressGroups[address] = [];
      }
      addressGroups[address].push(factory.company_name || '이름 없음');
    });

    console.log('\n📍 주소별 공장 분포:');
    console.log('='.repeat(50));
    
    Object.entries(addressGroups).forEach(([address, companies]) => {
      console.log(`\n🏢 주소: ${address}`);
      console.log(`   공장들: ${companies.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkRealData(); 