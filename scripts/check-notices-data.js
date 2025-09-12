const { createClient } = require('@supabase/supabase-js');

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function checkNotices() {
  try {
    console.log('공지사항 데이터 확인 중...\n');
    
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('데이터 조회 오류:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('공지사항이 없습니다.');
      return;
    }
    
    console.log(`총 ${data.length}개의 공지사항이 있습니다:\n`);
    
    data.forEach((notice, index) => {
      console.log(`${index + 1}. 공지사항`);
      console.log(`   ID: ${notice.id}`);
      console.log(`   제목: ${notice.title}`);
      console.log(`   카테고리: ${notice.category}`);
      console.log(`   생성일 (created_at): ${notice.created_at}`);
      console.log(`   시작일 (start_at): ${notice.start_at || '없음'}`);
      console.log(`   종료일 (end_at): ${notice.end_at || '없음'}`);
      console.log(`   활성 상태: ${notice.is_active}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

checkNotices();
