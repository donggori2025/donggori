require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBrandsAndSpecial() {
  console.log('🔍 brands_supplied와 special_machines 데이터 확인 중...\n');

  try {
    const { data, error } = await supabase
      .from('donggori')
      .select('id, company_name, brands_supplied, special_machines')
      .order('id')
      .limit(20);

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log('📊 업장별 brands_supplied와 special_machines 데이터:');
    console.log('='.repeat(80));
    
    data.forEach((factory, index) => {
      console.log(`${index + 1}. ${factory.company_name} (ID: ${factory.id})`);
      console.log(`   brands_supplied: "${factory.brands_supplied || '(없음)'}"`);
      console.log(`   special_machines: "${factory.special_machines || '(없음)'}"`);
      console.log('');
    });

    // 데이터 분석
    const withBrands = data.filter(f => f.brands_supplied && f.brands_supplied.trim() !== '');
    const withSpecial = data.filter(f => f.special_machines && f.special_machines.trim() !== '');
    
    console.log('📈 데이터 분석:');
    console.log(`   총 ${data.length}개 업장 중:`);
    console.log(`   - brands_supplied가 있는 업장: ${withBrands.length}개`);
    console.log(`   - special_machines가 있는 업장: ${withSpecial.length}개`);

  } catch (error) {
    console.error('❌ 스크립트 실행 중 오류:', error);
  }
}

checkBrandsAndSpecial();
