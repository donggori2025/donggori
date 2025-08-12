const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

// 서비스 롤 키를 사용하여 RLS 정책 우회
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 테스트용 공지사항 데이터
const testNotices = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: '플랫폼 오픈 안내',
    content: '의류 디자이너와 봉제공장을 연결하는 플랫폼이 정식 오픈했습니다! 많은 이용 바랍니다.\n\n새로운 기능들:\n- AI 매칭 서비스\n- 실시간 채팅\n- 파일 공유 시스템\n\n앞으로 더 많은 기능이 추가될 예정입니다.',
    category: '공지',
    created_at: '2024-06-23T00:00:00Z',
    updated_at: '2024-06-23T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: '매칭 서비스 베타 오픈',
    content: '봉제공장 매칭 서비스가 베타로 오픈되었습니다. 피드백 환영합니다.\n\n베타 기간 동안 무료로 이용하실 수 있습니다.\n\n문의사항이 있으시면 언제든 연락주세요.',
    category: '일반',
    created_at: '2024-06-24T00:00:00Z',
    updated_at: '2024-06-24T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: '채용공고 안내',
    content: '동대문 봉제공장에서 생산관리 직원을 채용합니다. 많은 지원 바랍니다.\n\n채용 조건:\n- 경력 3년 이상\n- 생산관리 경험자 우대\n- 주 5일 근무\n\n지원 방법: 이메일로 이력서 제출',
    category: '채용공고',
    created_at: '2024-06-25T00:00:00Z',
    updated_at: '2024-06-25T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: '시스템 점검 안내',
    content: '더 나은 서비스를 위해 시스템 점검을 실시합니다.\n\n점검 시간: 2024년 6월 26일 오전 2시 ~ 4시\n\n점검 중에는 서비스 이용이 제한될 수 있습니다.\n\n불편을 끼쳐 죄송합니다.',
    category: '공지',
    created_at: '2024-06-26T00:00:00Z',
    updated_at: '2024-06-26T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: '신규 공장 등록 안내',
    content: '새로운 봉제공장들이 플랫폼에 등록되었습니다.\n\n등록된 공장:\n- 서울패션공장\n- 부산의류제작소\n- 대구섬유공장\n\n많은 관심 부탁드립니다.',
    category: '일반',
    created_at: '2024-06-27T00:00:00Z',
    updated_at: '2024-06-27T00:00:00Z'
  }
];

async function addTestNotices() {
  console.log('🚀 테스트 공지사항 추가 시작...\n');

  try {
    // 기존 데이터 확인
    console.log('1. 기존 공지사항 확인...');
    const { data: existingNotices, error: checkError } = await supabase
      .from('notices')
      .select('id');

    if (checkError) {
      console.error('❌ 기존 데이터 확인 오류:', checkError);
      return;
    }

    console.log(`📊 기존 공지사항: ${existingNotices.length}개`);

    // 중복 ID 확인
    const existingIds = existingNotices.map(n => n.id);
    const newNotices = testNotices.filter(notice => !existingIds.includes(notice.id));

    if (newNotices.length === 0) {
      console.log('✅ 모든 테스트 공지사항이 이미 존재합니다.');
      return;
    }

    console.log(`📝 추가할 공지사항: ${newNotices.length}개`);

    // 공지사항 추가
    const { data: insertedData, error: insertError } = await supabase
      .from('notices')
      .insert(newNotices)
      .select();

    if (insertError) {
      console.error('❌ 공지사항 추가 오류:', insertError);
      return;
    }

    console.log('✅ 공지사항 추가 성공!');
    console.log(`📊 추가된 공지사항: ${insertedData.length}개`);

    // 추가된 공지사항 목록
    console.log('\n📋 추가된 공지사항:');
    insertedData.forEach((notice, index) => {
      console.log(`\n${index + 1}. ${notice.title}`);
      console.log(`   ID: ${notice.id}`);
      console.log(`   카테고리: ${notice.category}`);
      console.log(`   생성일: ${notice.created_at}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 스크립트 실행
addTestNotices()
  .then(() => {
    console.log('\n✅ 작업 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 작업 실패:', error);
    process.exit(1);
  });
