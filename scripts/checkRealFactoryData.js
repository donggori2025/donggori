const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정 (실제 값)
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.qjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealFactoryData() {
  try {
    console.log('🔍 실제 공장 데이터 확인 중...\n');
    
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, address, business_type, name')
      .order('company_name');

    if (error) {
      console.error('❌ 데이터 가져오기 실패:', error);
      return;
    }

    console.log(`📊 총 ${data.length}개 공장 발견\n`);
    
    console.log('🏢 공장별 정보:');
    console.log('='.repeat(80));
    
    data.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name || factory.name || '이름 없음'}`);
      console.log(`   ID: ${factory.id}`);
      console.log(`   주소: ${factory.address || '주소 없음'}`);
      console.log(`   업태: ${factory.business_type || '업태 없음'}`);
      console.log('');
    });

    // 주소별 분류
    const addressGroups = {};
    data.forEach(factory => {
      const address = factory.address || '주소 없음';
      if (!addressGroups[address]) {
        addressGroups[address] = [];
      }
      addressGroups[address].push(factory.company_name || factory.name || '이름 없음');
    });

    console.log('📍 주소별 공장 분포:');
    console.log('='.repeat(50));
    
    Object.entries(addressGroups).forEach(([address, companies]) => {
      console.log(`\n🏢 주소: ${address}`);
      console.log(`   공장들: ${companies.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkRealFactoryData(); 