const fs = require('fs');
const path = require('path');

// 현재 public 폴더에 있는 업장들
const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
const currentFolders = fs.readdirSync(dataPath).filter(item => {
  const itemPath = path.join(dataPath, item);
  return fs.statSync(itemPath).isDirectory() && item !== '.DS_Store';
});

console.log('=== 업장 중복/유사성 확인 ===\n');

console.log('📋 현재 모든 업장 목록:');
currentFolders.sort().forEach(folder => {
  const folderPath = path.join(dataPath, folder);
  const imageFiles = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });
  console.log(`- ${folder}: ${imageFiles.length}개 이미지`);
});

console.log('\n🔍 유사한 이름의 업장들:');

// 우정 관련
const woongFactories = currentFolders.filter(folder => folder.includes('우정'));
if (woongFactories.length > 0) {
  console.log('우정 관련:');
  woongFactories.forEach(factory => {
    const folderPath = path.join(dataPath, factory);
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    console.log(`  - ${factory}: ${imageFiles.length}개 이미지`);
  });
}

// 우진 관련
const woojinFactories = currentFolders.filter(folder => folder.includes('우진'));
if (woojinFactories.length > 0) {
  console.log('우진 관련:');
  woojinFactories.forEach(factory => {
    const folderPath = path.join(dataPath, factory);
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    console.log(`  - ${factory}: ${imageFiles.length}개 이미지`);
  });
}

console.log(`\n📊 총 ${currentFolders.length}개의 업장이 있습니다.`);
console.log(`- 우정 관련: ${woongFactories.length}개`);
console.log(`- 우진 관련: ${woojinFactories.length}개`); 