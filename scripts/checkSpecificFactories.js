const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSpecificFactories() {
  console.log('🔍 우정패션, 우진모피 공장 데이터 확인...\n');

  const targetFactories = ['우정패션', '우진모피'];

  try {
    for (const factoryName of targetFactories) {
      console.log(`\n--- ${factoryName} 확인 ---`);
      
      // 1. Supabase에서 공장 데이터 조회
      const { data: factoryData, error } = await supabase
        .from('donggori')
        .select('*')
        .ilike('company_name', `%${factoryName}%`)
        .limit(5);

      if (error) {
        console.error(`❌ ${factoryName} 조회 오류:`, error);
        continue;
      }

      if (factoryData.length === 0) {
        console.log(`⚠️ ${factoryName}을 찾을 수 없습니다.`);
        continue;
      }

      console.log(`✅ ${factoryData.length}개의 ${factoryName} 관련 공장을 찾았습니다.`);

      factoryData.forEach((factory, index) => {
        console.log(`\n${index + 1}. 공장 정보:`);
        console.log(`   ID: ${factory.id}`);
        console.log(`   회사명: ${factory.company_name}`);
        console.log(`   이미지: ${factory.image || '(없음)'}`);
        console.log(`   주소: ${factory.address || '(없음)'}`);
        console.log(`   지역: ${factory.admin_district || '(없음)'}`);
      });
    }

    // 2. 전체 공장 목록에서 확인
    console.log('\n\n--- 전체 공장 목록에서 확인 ---');
    const { data: allFactories, error: allError } = await supabase
      .from('donggori')
      .select('id, company_name, image')
      .order('company_name');

    if (allError) {
      console.error('❌ 전체 공장 목록 조회 오류:', allError);
      return;
    }

    console.log(`📊 전체 ${allFactories.length}개 공장 중:`);
    
    const matchingFactories = allFactories.filter(f => 
      f.company_name && (
        f.company_name.includes('우정') || 
        f.company_name.includes('우진')
      )
    );

    console.log(`🔍 우정/우진 관련 공장: ${matchingFactories.length}개`);
    matchingFactories.forEach(factory => {
      console.log(`   - ${factory.company_name} (ID: ${factory.id}, 이미지: ${factory.image || '없음'})`);
    });

  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkSpecificFactories()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 확인 실패:', error);
    process.exit(1);
  });
