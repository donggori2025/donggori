const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성
const supabaseUrl = 'https://qjqjqjqjqjqjqjqjqj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqcWpxanFqcWpxanFqcWpxanFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzAsImV4cCI6MjA1MDU0ODk3MH0.qjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqjqj';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFactoryData() {
  try {
    console.log('🔍 공장 데이터 확인 중...');
    
    // 공장 데이터 조회
    const { data: factories, error } = await supabase
      .from('donggori')
      .select('id, company_name, name, address, business_type')
      .order('company_name');

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`✅ 총 ${factories.length}개의 공장 데이터 확인됨\n`);

    // 공장별 정보 출력
    factories.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name || factory.name}`);
      console.log(`   - ID: ${factory.id}`);
      console.log(`   - 주소: ${factory.address || '주소 없음'}`);
      console.log(`   - 업종: ${factory.business_type || '업종 없음'}`);
      console.log('');
    });

    // 주소별 분포 확인
    const addressCount = {};
    factories.forEach(factory => {
      const address = factory.address || '주소 없음';
      addressCount[address] = (addressCount[address] || 0) + 1;
    });

    console.log('📍 주소별 공장 분포:');
    Object.entries(addressCount).forEach(([address, count]) => {
      console.log(`   - ${address}: ${count}개`);
    });

  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error);
  }
}

checkFactoryData(); 