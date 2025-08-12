const { list } = require('@vercel/blob');

// 환경 변수 확인
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

async function checkVercelBlob() {
  console.log('🔍 Vercel Blob Storage 확인...\n');

  try {
    // 1. 전체 이미지 목록 확인
    console.log('1. 전체 이미지 목록 확인...');
    const { blobs } = await list();
    
    console.log(`📊 전체 이미지 개수: ${blobs.length}개`);
    
    if (blobs.length === 0) {
      console.log('⚠️ 업로드된 이미지가 없습니다.');
      return;
    }

    // 2. 우정패션, 우진모피 폴더 확인
    console.log('\n2. 우정패션, 우진모피 폴더 확인...');
    
    const targetFolders = ['우정패션', '우진모피'];
    
    for (const folder of targetFolders) {
      console.log(`\n--- ${folder} 폴더 ---`);
      
      const { blobs: folderBlobs } = await list({ prefix: `${folder}/` });
      
      console.log(`📁 ${folder} 폴더 이미지 개수: ${folderBlobs.length}개`);
      
      if (folderBlobs.length > 0) {
        console.log('📋 이미지 목록:');
        folderBlobs.forEach((blob, index) => {
          console.log(`   ${index + 1}. ${blob.pathname} (${blob.size} bytes)`);
        });
      } else {
        console.log(`   ⚠️ ${folder} 폴더에 이미지가 없습니다.`);
      }
    }

    // 3. 전체 폴더 구조 확인
    console.log('\n3. 전체 폴더 구조 확인...');
    const folders = new Set();
    
    blobs.forEach(blob => {
      const pathParts = blob.pathname.split('/');
      if (pathParts.length > 1) {
        folders.add(pathParts[0]);
      }
    });
    
    console.log(`📂 전체 폴더 개수: ${folders.size}개`);
    console.log('📋 폴더 목록:');
    Array.from(folders).sort().forEach(folder => {
      console.log(`   - ${folder}`);
    });

  } catch (error) {
    console.error('❌ Vercel Blob 확인 중 오류:', error);
  }
}

// 스크립트 실행
checkVercelBlob()
  .then(() => {
    console.log('\n✅ 확인 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 확인 실패:', error);
    process.exit(1);
  });
