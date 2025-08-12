const { createClient } = require('@supabase/supabase-js');

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNoticesTable() {
  console.log('🔍 공지사항 테이블 확인...\n');

  try {
    // 1. 테이블 존재 여부 확인
    console.log('1. 테이블 존재 여부 확인...');
    const { data: tableData, error: tableError } = await supabase
      .from('notices')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ 테이블 접근 오류:', {
        message: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      });
      return;
    }

    console.log('✅ 테이블 접근 성공');

    // 2. 컬럼 구조 확인
    console.log('\n2. 컬럼 구조 확인...');
    if (tableData && tableData.length > 0) {
      const firstRow = tableData[0];
      console.log('📋 컬럼 목록:');
      Object.keys(firstRow).forEach(key => {
        console.log(`   - ${key}: ${typeof firstRow[key]} (${firstRow[key] ? '값 있음' : '값 없음'})`);
      });
    } else {
      console.log('⚠️ 테이블에 데이터가 없습니다.');
    }

    // 3. 전체 데이터 개수 확인
    console.log('\n3. 전체 데이터 개수 확인...');
    const { count, error: countError } = await supabase
      .from('notices')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ 데이터 개수 조회 오류:', countError);
    } else {
      console.log(`📊 전체 공지사항 개수: ${count}개`);
    }

    // 4. 실제 데이터 샘플 확인
    console.log('\n4. 실제 데이터 샘플 확인...');
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (noticesError) {
      console.error('❌ 공지사항 데이터 조회 오류:', noticesError);
    } else {
      console.log(`📋 최근 공지사항 ${notices.length}개:`);
      notices.forEach((notice, index) => {
        console.log(`\n${index + 1}. 공지사항:`);
        console.log(`   ID: ${notice.id}`);
        console.log(`   제목: ${notice.title}`);
        console.log(`   카테고리: ${notice.category}`);
        console.log(`   생성일: ${notice.created_at}`);
        console.log(`   내용: ${(notice.content || '').slice(0, 50)}...`);
      });
    }

    // 5. API 엔드포인트 테스트
    console.log('\n5. API 엔드포인트 테스트...');
    try {
      const response = await fetch('http://localhost:3000/api/notices');
      const json = await response.json();
      
      if (response.ok) {
        console.log('✅ API 엔드포인트 정상 작동');
        console.log(`📊 API에서 반환된 공지사항: ${json.data?.length || 0}개`);
      } else {
        console.error('❌ API 엔드포인트 오류:', json);
      }
    } catch (error) {
      console.error('❌ API 엔드포인트 테스트 실패:', error.message);
    }

  } catch (error) {
    console.error('❌ 확인 중 오류 발생:', error);
  }
}

// 스크립트 실행
checkNoticesTable()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 확인 실패:', error);
    process.exit(1);
  });
