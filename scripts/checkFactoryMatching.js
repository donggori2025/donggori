const { createClient } = require('@supabase/supabase-js');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 새로 추가된 업장들
const newFactories = [
  '건영실업',
  '우정패션', 
  '우진모피',
  '화담어패럴'
];

async function findFactoryInDB(factoryName) {
  try {
    // company_name 필드에서만 검색
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .ilike('company_name', `%${factoryName}%`)
      .limit(1);

    if (error) {
      console.error(`DB 검색 오류 (${factoryName}):`, error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error(`DB 검색 중 오류 (${factoryName}):`, error);
    return null;
  }
}

async function checkNewFactories() {
  console.log('=== 새로 추가된 업장들의 DB 매칭 확인 ===\n');
  
  for (const factoryName of newFactories) {
    console.log(`검색 중: ${factoryName}`);
    const factoryData = await findFactoryInDB(factoryName);
    
    if (factoryData) {
      console.log(`✅ 매칭 성공: ${factoryData.company_name || factoryData.name} (ID: ${factoryData.id})`);
    } else {
      console.log(`❌ 매칭 실패: ${factoryName} - DB에서 찾을 수 없습니다.`);
    }
    console.log('');
  }
}

// 스크립트 실행
if (require.main === module) {
  checkNewFactories().catch(console.error);
} 