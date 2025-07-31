const fs = require('fs');
const path = require('path');

// 현재 public 폴더에 있는 업장들
const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
const currentFolders = fs.readdirSync(dataPath).filter(item => {
  const itemPath = path.join(dataPath, item);
  return fs.statSync(itemPath).isDirectory() && item !== '.DS_Store';
});

console.log('=== 최종 업장 현황 확인 ===\n');

console.log('📋 현재 모든 업장 목록 (정렬됨):');
currentFolders.sort().forEach(folder => {
  const folderPath = path.join(dataPath, folder);
  const imageFiles = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });
  console.log(`- ${folder}: ${imageFiles.length}개 이미지`);
});

console.log('\n🔍 새로 추가된 업장들 (추정):');
const newFactories = ['건영실업', '우정패션', '우진모피', '화담어패럴'];
newFactories.forEach(factory => {
  if (currentFolders.includes(factory)) {
    const folderPath = path.join(dataPath, factory);
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    console.log(`✅ ${factory}: ${imageFiles.length}개 이미지`);
  } else {
    console.log(`❌ ${factory}: 폴더가 없습니다`);
  }
});

console.log('\n📊 통계:');
console.log(`- 총 업장 수: ${currentFolders.length}개`);
console.log(`- 새로 추가된 업장: ${newFactories.filter(f => currentFolders.includes(f)).length}개`); 