const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정 (실제 값으로 수정)
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.qjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFactoryAddresses() {
  try {
    console.log('🔍 공장 주소 정보 확인 중...\n');
    
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, address, business_type')
      .order('company_name');

    if (error) {
      console.error('❌ 데이터 가져오기 실패:', error);
      return;
    }

    console.log(`📊 총 ${data.length}개 공장 발견\n`);
    
    // 주소별로 그룹화
    const addressGroups = {};
    data.forEach(factory => {
      const address = factory.address || '주소 없음';
      if (!addressGroups[address]) {
        addressGroups[address] = [];
      }
      addressGroups[address].push(factory.company_name);
    });

    console.log('📍 주소별 공장 분포:');
    console.log('='.repeat(50));
    
    Object.entries(addressGroups).forEach(([address, companies]) => {
      console.log(`\n🏢 주소: ${address}`);
      console.log(`   공장들: ${companies.join(', ')}`);
    });

    // 동별 분포 확인
    const districtGroups = {};
    data.forEach(factory => {
      const address = factory.address || '';
      let district = '기타';
      
      if (address.includes('장안')) district = '장안동';
      else if (address.includes('답십리')) district = '답십리동';
      else if (address.includes('신설')) district = '신설동';
      else if (address.includes('용두')) district = '용두동';
      else if (address.includes('제기')) district = '제기동';
      else if (address.includes('청량리')) district = '청량리동';
      else if (address.includes('회기')) district = '회기동';
      else if (address.includes('이문')) district = '이문동';
      else if (address.includes('전농')) district = '전농동';
      
      if (!districtGroups[district]) {
        districtGroups[district] = [];
      }
      districtGroups[district].push(factory.company_name);
    });

    console.log('\n\n🗺️ 동별 공장 분포:');
    console.log('='.repeat(50));
    
    Object.entries(districtGroups).forEach(([district, companies]) => {
      console.log(`\n🏘️ ${district}: ${companies.length}개 공장`);
      console.log(`   ${companies.join(', ')}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

checkFactoryAddresses(); 