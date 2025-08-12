const https = require('https');

// API 호출 함수
function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testNoticeDetail() {
  console.log('🧪 공지사항 세부 페이지 테스트...\n');

  try {
    // 1. 공지사항 목록 가져오기
    console.log('1. 공지사항 목록 가져오기...');
    const listResponse = await fetchAPI('https://localhost:3000/api/notices');
    
    if (listResponse.status !== 200) {
      console.error('❌ 공지사항 목록 API 오류:', listResponse.status);
      return;
    }

    const notices = listResponse.data.data || [];
    console.log(`✅ 공지사항 ${notices.length}개 가져옴`);

    if (notices.length === 0) {
      console.log('⚠️ 공지사항이 없습니다.');
      return;
    }

    // 2. 첫 번째 공지사항의 세부 페이지 테스트
    const firstNotice = notices[0];
    console.log(`\n2. 첫 번째 공지사항 세부 페이지 테스트: ${firstNotice.title}`);
    console.log(`   ID: ${firstNotice.id}`);
    
    // 세부 페이지 URL 테스트 (실제로는 서버가 실행 중이어야 함)
    const detailUrl = `https://localhost:3000/notices/${firstNotice.id}`;
    console.log(`   URL: ${detailUrl}`);
    
    // 3. 공지사항 데이터 구조 확인
    console.log('\n3. 공지사항 데이터 구조:');
    console.log(`   제목: ${firstNotice.title}`);
    console.log(`   카테고리: ${firstNotice.category}`);
    console.log(`   생성일: ${firstNotice.created_at}`);
    console.log(`   내용 길이: ${(firstNotice.content || '').length}자`);
    
    // 4. 여러 공지사항 ID 확인
    console.log('\n4. 사용 가능한 공지사항 ID들:');
    notices.slice(0, 5).forEach((notice, index) => {
      console.log(`   ${index + 1}. ${notice.title} (ID: ${notice.id})`);
    });

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
  }
}

// 스크립트 실행
testNoticeDetail()
  .then(() => {
    console.log('\n✅ 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 테스트 실패:', error);
    process.exit(1);
  });
