const { list } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

async function checkBlobImages() {
  try {
    console.log('🔍 Vercel Blob Storage의 이미지들을 확인합니다...\n');
    
    // 모든 blob 목록 조회
    const { blobs } = await list();
    
    console.log(`📊 총 ${blobs.length}개의 파일이 업로드되어 있습니다.\n`);
    
    // 폴더별로 그룹화
    const folders = {};
    
    blobs.forEach(blob => {
      const pathParts = blob.pathname.split('/');
      if (pathParts.length >= 2) {
        const folderName = pathParts[0];
        const fileName = pathParts[1];
        
        if (!folders[folderName]) {
          folders[folderName] = [];
        }
        folders[folderName].push(fileName);
      }
    });
    
    console.log('📁 폴더별 이미지 현황:');
    console.log('='.repeat(50));
    
    Object.entries(folders).forEach(([folderName, files]) => {
      console.log(`\n📂 ${folderName} (${files.length}개 파일):`);
      files.forEach(file => {
        console.log(`  - ${file}`);
      });
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📈 총 ${Object.keys(folders).length}개의 폴더가 있습니다.`);
    
    // 누락된 업장들 확인
    const expectedFactories = [
      '강훈무역', '건영실업', '경림패션', '꼬메오패션', '나인', '뉴에일린', '다엘',
      '대명어패럴', '더시크컴퍼니', '라이브 어패럴', '라인스', '백산실업', '부연사',
      '새가온', '선화사', '스마일', '시즌', '실루엣컴퍼니', '아트패션', '에이스',
      '오르다', '오성섬유', '오스카 디자인', '우정샘플', '우정패션', '우진모피',
      '유화 섬유', '재민상사', '좋은사람', '하늘패션', '혜민사', '화담어패럴',
      '화신사', '희란패션', '조아스타일'
    ];
    
    const missingFactories = expectedFactories.filter(factory => !folders[factory]);
    
    if (missingFactories.length > 0) {
      console.log('\n❌ 누락된 업장들:');
      missingFactories.forEach(factory => {
        console.log(`  - ${factory}`);
      });
    } else {
      console.log('\n✅ 모든 업장의 이미지가 업로드되어 있습니다!');
    }
    
  } catch (error) {
    console.error('❌ Blob 조회 실패:', error);
  }
}

checkBlobImages(); 