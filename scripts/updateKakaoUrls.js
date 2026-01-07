const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabaseService = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const DEFAULT_KAKAO_URL = 'https://open.kakao.com/o/sJD4pZQh';

async function updateKakaoUrls() {
  console.log('🔍 오픈 채팅방 링크가 없는 업장에 기본 링크 추가...\n');

  try {
    // 1. 모든 공장 조회
    console.log('1. 공장 목록 조회 중...');
    const { data: factories, error: selectError } = await supabaseService
      .from('donggori')
      .select('id, company_name, kakao_url');

    if (selectError) {
      console.error('❌ 조회 오류:', selectError);
      return;
    }

    console.log(`✅ 총 ${factories.length}개의 공장을 조회했습니다.\n`);

    // 2. kakao_url이 없거나 빈 문자열인 공장 필터링
    const factoriesToUpdate = factories.filter(factory => {
      const kakaoUrl = factory.kakao_url;
      return !kakaoUrl || kakaoUrl.trim() === '';
    });

    console.log(`📝 업데이트가 필요한 공장: ${factoriesToUpdate.length}개\n`);

    if (factoriesToUpdate.length === 0) {
      console.log('✅ 모든 공장에 오픈 채팅방 링크가 이미 설정되어 있습니다.');
      return;
    }

    // 3. 업데이트 진행
    let successCount = 0;
    let errorCount = 0;

    for (const factory of factoriesToUpdate) {
      try {
        const { error: updateError } = await supabaseService
          .from('donggori')
          .update({ 
            kakao_url: DEFAULT_KAKAO_URL
          })
          .eq('id', factory.id);

        if (updateError) {
          console.error(`❌ [${factory.company_name || factory.id}] 업데이트 실패:`, updateError.message);
          errorCount++;
        } else {
          console.log(`✅ [${factory.company_name || factory.id}] 업데이트 완료`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ [${factory.company_name || factory.id}] 예외 발생:`, err);
        errorCount++;
      }
    }

    console.log('\n📊 업데이트 결과:');
    console.log(`   ✅ 성공: ${successCount}개`);
    console.log(`   ❌ 실패: ${errorCount}개`);
    console.log(`   📝 기본 링크: ${DEFAULT_KAKAO_URL}`);

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

updateKakaoUrls()
  .then(() => {
    console.log('\n✅ 작업 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });

