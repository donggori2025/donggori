const { list } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

async function checkBlobRoot() {
  try {
    console.log('🔍 Vercel Blob Storage의 루트 디렉토리를 확인합니다...\n');
    
    // 루트 디렉토리의 모든 blob 목록 조회
    const { blobs } = await list();
    
    console.log(`📊 총 ${blobs.length}개의 파일이 있습니다.\n`);
    
    // 경로별로 그룹화
    const paths = {};
    
    blobs.forEach(blob => {
      const pathParts = blob.pathname.split('/');
      const rootPath = pathParts[0];
      
      if (!paths[rootPath]) {
        paths[rootPath] = [];
      }
      paths[rootPath].push(blob.pathname);
    });
    
    console.log('📁 루트 디렉토리 구조:');
    console.log('='.repeat(50));
    
    Object.entries(paths).forEach(([rootPath, files]) => {
      console.log(`\n📂 ${rootPath} (${files.length}개 파일):`);
      files.slice(0, 5).forEach(file => {
        console.log(`  - ${file}`);
      });
      if (files.length > 5) {
        console.log(`  ... (${files.length - 5}개 더)`);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n📈 총 ${Object.keys(paths).length}개의 루트 경로가 있습니다.`);
    
  } catch (error) {
    console.error('❌ Blob 조회 실패:', error);
  }
}

checkBlobRoot(); 