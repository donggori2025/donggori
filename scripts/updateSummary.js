const fs = require('fs');
const path = require('path');

console.log('=== 우정패션 & 우진모피 업데이트 작업 요약 ===\n');

const updateFactories = [
  { name: '우정패션', folder: '우정패션' },
  { name: '우진모피', folder: '우진모피' }
];

console.log('🔄 업데이트할 업장들:');
updateFactories.forEach(factory => {
  const folderPath = path.join(__dirname, '../public/동고리_사진데이터', factory.folder);
  
  if (fs.existsSync(folderPath)) {
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    
    console.log(`📁 ${factory.name}:`);
    console.log(`  - 새 이미지 개수: ${imageFiles.length}개`);
    console.log(`  - 폴더 경로: ${folderPath}`);
    
    // 이미지 파일 목록 (처음 3개만)
    console.log(`  - 새 이미지 파일들:`);
    imageFiles.slice(0, 3).forEach(file => {
      console.log(`    * ${file}`);
    });
    if (imageFiles.length > 3) {
      console.log(`    ... 외 ${imageFiles.length - 3}개 더`);
    }
    console.log('');
  } else {
    console.log(`❌ ${factory.name}: 폴더를 찾을 수 없습니다.`);
  }
});

console.log('📋 업데이트 작업 순서:');
console.log('1. 기존 DB에서 우정패션과 우진모피 데이터 찾기');
console.log('2. 기존 이미지들을 Supabase Storage에서 삭제');
console.log('3. 새 이미지들을 Supabase Storage에 업로드');
console.log('4. DB의 images 필드를 새 이미지 URL들로 업데이트');
console.log('5. 첫 번째 이미지를 대표 이미지(image)로 설정');

console.log('\n⚠️  주의사항:');
console.log('- 기존 이미지들이 완전히 삭제되고 새 이미지로 교체됩니다');
console.log('- 업데이트 전에 백업을 권장합니다');
console.log('- 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) 설정이 필요합니다');

console.log('\n🚀 실행 방법:');
console.log('1. 환경변수 설정');
console.log('2. node scripts/updateFactoryData.js 실행');
console.log('3. 업데이트 완료 후 웹사이트에서 확인'); 