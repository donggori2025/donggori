const fs = require('fs');
const path = require('path');

// 기존 매핑에서 정의된 업장들
const existingMapping = [
  '희망사',
  '희란패션', 
  '화신사',
  '혜민사',
  '하늘패션',
  '좋은사람',
  '재민상사',
  '유화 섬유',
  '우진모피',
  '우정샘플',
  '오스카 디자인',
  '오성섬유',
  '오르다',
  '에이스',
  '아트패션',
  '실루엣컴퍼니',
  '시즌',
  '스마일',
  '선화사',
  '새가온',
  '부연사',
  '백산실업',
  '라인스',
  '라이브 어패럴',
  '더시크컴퍼니',
  '대명어패럴',
  '다엘',
  '뉴에일린',
  '나인',
  '꼬메오패션',
  '경림패션',
  '강훈무역'
];

// 현재 public 폴더에 있는 업장들
const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
const currentFolders = fs.readdirSync(dataPath).filter(item => {
  const itemPath = path.join(dataPath, item);
  return fs.statSync(itemPath).isDirectory() && item !== '.DS_Store';
});

console.log('=== 현재 public 폴더에 있는 업장들 ===');
currentFolders.forEach(folder => {
  console.log(`- ${folder}`);
});

console.log('\n=== 기존 매핑에 없는 새로운 업장들 ===');
const newFactories = currentFolders.filter(folder => !existingMapping.includes(folder));
newFactories.forEach(factory => {
  console.log(`- ${factory}`);
});

console.log(`\n총 ${currentFolders.length}개의 업장 폴더가 있습니다.`);
console.log(`그 중 ${newFactories.length}개가 새로 추가된 업장입니다.`);

// 각 업장별 이미지 개수 확인
console.log('\n=== 각 업장별 이미지 개수 ===');
currentFolders.forEach(folder => {
  const folderPath = path.join(dataPath, folder);
  const imageFiles = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });
  console.log(`${folder}: ${imageFiles.length}개 이미지`);
}); 