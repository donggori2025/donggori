const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// getFactoryImages 함수 시뮬레이션
async function getFactoryImages(factoryId) {
  try {
    console.log('공장 이미지 조회 시작:', { factoryId });

    const { data, error } = await supabase
      .from('donggori')
      .select('image')
      .eq('id', factoryId)
      .single();

    if (error) {
      console.error('공장 이미지 조회 중 오류:', {
        factoryId,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      return [];
    }

    // image 컬럼은 단일 문자열이므로 배열로 변환
    const imageUrl = data?.image;
    const images = imageUrl ? [imageUrl] : [];
    
    console.log('공장 이미지 조회 성공:', { factoryId, imageUrl, images });
    return images;
  } catch (error) {
    console.error('공장 이미지 조회 중 예외 발생:', {
      factoryId,
      error: error instanceof Error ? error.message : String(error),
      fullError: error
    });
    return [];
  }
}

// getFactoryProfileImage 함수 시뮬레이션
async function getFactoryProfileImage(factoryId) {
  try {
    console.log('공장 프로필 이미지 조회 시작:', { factoryId });
    
    const images = await getFactoryImages(factoryId);
    const profileImage = images.length > 0 ? images[0] : null;
    
    console.log('공장 프로필 이미지 조회 완료:', { factoryId, profileImage });
    return profileImage;
  } catch (error) {
    console.error('공장 프로필 이미지 조회 중 예외 발생:', {
      factoryId,
      error: error instanceof Error ? error.message : String(error),
      fullError: error
    });
    return null;
  }
}

async function testFactoryImages() {
  console.log('🧪 공장 이미지 함수 테스트 시작...\n');

  try {
    // 1. 먼저 이미지가 있는 공장들을 찾기
    console.log('1. 이미지가 있는 공장 찾기...');
    const { data: factories, error } = await supabase
      .from('donggori')
      .select('id, company_name, image')
      .not('image', 'is', null)
      .neq('image', '')
      .limit(5);

    if (error) {
      console.error('❌ 공장 목록 조회 실패:', error);
      return;
    }

    if (factories.length === 0) {
      console.log('⚠️ 이미지가 있는 공장이 없습니다. 모든 공장을 테스트합니다.');
      
      // 이미지가 없는 공장들도 테스트
      const { data: allFactories, error: allError } = await supabase
        .from('donggori')
        .select('id, company_name, image')
        .limit(3);

      if (allError) {
        console.error('❌ 전체 공장 목록 조회 실패:', allError);
        return;
      }

      console.log(`✅ ${allFactories.length}개의 공장 데이터를 가져왔습니다.\n`);

      // 각 공장에 대해 이미지 함수 테스트
      for (const factory of allFactories) {
        console.log(`\n--- 공장 테스트: ${factory.company_name} (ID: ${factory.id}) ---`);
        
        // 원본 데이터 확인
        console.log('📋 원본 데이터:', {
          id: factory.id,
          company_name: factory.company_name,
          image: factory.image || '(빈 값)'
        });

        // getFactoryImages 테스트
        console.log('\n🔍 getFactoryImages 테스트...');
        const images = await getFactoryImages(factory.id);
        console.log('결과:', images);

        // getFactoryProfileImage 테스트
        console.log('\n👤 getFactoryProfileImage 테스트...');
        const profileImage = await getFactoryProfileImage(factory.id);
        console.log('결과:', profileImage);
      }
    } else {
      console.log(`✅ ${factories.length}개의 이미지가 있는 공장 데이터를 가져왔습니다.\n`);

      // 각 공장에 대해 이미지 함수 테스트
      for (const factory of factories) {
        console.log(`\n--- 공장 테스트: ${factory.company_name} (ID: ${factory.id}) ---`);
        
        // 원본 데이터 확인
        console.log('📋 원본 데이터:', {
          id: factory.id,
          company_name: factory.company_name,
          image: factory.image
        });

        // getFactoryImages 테스트
        console.log('\n🔍 getFactoryImages 테스트...');
        const images = await getFactoryImages(factory.id);
        console.log('결과:', images);

        // getFactoryProfileImage 테스트
        console.log('\n👤 getFactoryProfileImage 테스트...');
        const profileImage = await getFactoryProfileImage(factory.id);
        console.log('결과:', profileImage);
      }
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

// 테스트 실행
testFactoryImages()
  .then(() => {
    console.log('\n✅ 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 테스트 실패:', error);
    process.exit(1);
  });
