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

async function checkNoticesPopups() {
  console.log('🔍 notices와 popups 테이블 확인 중...\n');

  try {
    // 1. notices 테이블 확인
    console.log('1. notices 테이블 확인...');
    const { data: noticesData, error: noticesError } = await supabaseService
      .from('notices')
      .select('*')
      .limit(5);

    if (noticesError) {
      console.error('❌ notices 테이블 오류:', noticesError);
    } else {
      console.log('✅ notices 테이블 접근 성공');
      console.log('📊 notices 데이터 개수:', noticesData?.length || 0);
      if (noticesData && noticesData.length > 0) {
        console.log('📋 첫 번째 공지사항:', noticesData[0]);
      }
    }

    // 2. popups 테이블 확인
    console.log('\n2. popups 테이블 확인...');
    const { data: popupsData, error: popupsError } = await supabaseService
      .from('popups')
      .select('*')
      .limit(5);

    if (popupsError) {
      console.error('❌ popups 테이블 오류:', popupsError);
    } else {
      console.log('✅ popups 테이블 접근 성공');
      console.log('📊 popups 데이터 개수:', popupsData?.length || 0);
      if (popupsData && popupsData.length > 0) {
        console.log('📋 첫 번째 팝업:', popupsData[0]);
      }
    }

    // 3. 테이블이 없으면 생성
    if (noticesError && noticesError.code === 'PGRST116') {
      console.log('\n3. notices 테이블이 없습니다. 생성하시겠습니까?');
      console.log('SQL: CREATE TABLE IF NOT EXISTS public.notices (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, content text, category text DEFAULT \'일반\', start_at timestamptz, end_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());');
    }

    if (popupsError && popupsError.code === 'PGRST116') {
      console.log('\n4. popups 테이블이 없습니다. 생성하시겠습니까?');
      console.log('SQL: CREATE TABLE IF NOT EXISTS public.popups (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, content text, start_at timestamptz, end_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());');
    }

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
  }
}

checkNoticesPopups()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
