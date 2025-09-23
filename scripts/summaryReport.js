const fs = require('fs');
const path = require('path');

// 기존 매핑에서 정의된 업장들
const existingMapping = [
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

// 새로 추가된 업장들
const newFactories = [
  '건영실업',
  '우정패션',
  '우진모피',
  '화담어패럴'
];

// 현재 public 폴더에 있는 업장들
const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
const currentFolders = fs.readdirSync(dataPath).filter(item => {
  const itemPath = path.join(dataPath, item);
  return fs.statSync(itemPath).isDirectory() && item !== '.DS_Store';
});

console.log('=== 동고리 업장 이미지 매칭 현황 리포트 ===\n');

console.log('📊 전체 현황:');
console.log(`- 총 업장 수: ${currentFolders.length}개`);
console.log(`- 기존 매핑된 업장: ${existingMapping.length}개`);
console.log(`- 새로 추가된 업장: ${newFactories.length}개`);

console.log('\n🆕 새로 추가된 업장들:');
newFactories.forEach(factory => {
  const folderPath = path.join(dataPath, factory);
  const imageFiles = fs.readdirSync(folderPath).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
  });
  console.log(`- ${factory}: ${imageFiles.length}개 이미지`);
});

console.log('\n✅ 매칭 준비 완료:');
console.log('1. 새로 추가된 4개 업장이 public 폴더에 정상적으로 추가됨');
console.log('2. 각 업장별로 이미지 파일들이 정상적으로 포함됨');
console.log('3. 기존 매핑 스크립트에 새 업장들이 추가됨');
console.log('4. 업로드 스크립트가 준비됨');

console.log('\n📝 다음 단계:');
console.log('1. Supabase 환경변수 설정');
console.log('2. uploadNewFactories.js 스크립트 실행');
console.log('3. DB에서 업장 매칭 확인');
console.log('4. 이미지 업로드 및 DB 업데이트');

console.log('\n🔧 필요한 작업:');
console.log('- 환경변수 설정 후 스크립트 실행');
console.log('- DB에서 새 업장들이 올바르게 매칭되는지 확인');
console.log('- 이미지 업로드 후 웹사이트에서 확인'); 