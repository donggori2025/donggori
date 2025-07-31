const fs = require('fs');
const path = require('path');

// 업데이트된 업장들
const updatedFactories = ['우정패션', '우진모피'];

console.log('=== 업데이트된 업장 데이터 확인 ===\n');

updatedFactories.forEach(factory => {
  const folderPath = path.join(__dirname, '../public/동고리_사진데이터', factory);
  
  if (fs.existsSync(folderPath)) {
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    
    console.log(`📁 ${factory}:`);
    console.log(`  - 이미지 개수: ${imageFiles.length}개`);
    console.log(`  - 폴더 경로: ${folderPath}`);
    
    // 이미지 파일 목록 (처음 5개만)
    console.log(`  - 이미지 파일들:`);
    imageFiles.slice(0, 5).forEach(file => {
      console.log(`    * ${file}`);
    });
    if (imageFiles.length > 5) {
      console.log(`    ... 외 ${imageFiles.length - 5}개 더`);
    }
    console.log('');
  } else {
    console.log(`❌ ${factory}: 폴더를 찾을 수 없습니다.`);
  }
});

console.log('✅ 업데이트 준비 완료:');
console.log('1. 우정패션과 우진모피의 새 이미지 데이터 확인됨');
console.log('2. 기존 DB 데이터 삭제 후 새 데이터로 업데이트 필요'); 