import { getFactoryMainImage, getFactoryImages, getFactoryImageFolder } from '../lib/factoryImages.js';

// 테스트할 업장 이름들
const testFactories = [
  '강훈무역',
  '건영실업',
  '경림패션',
  '꼬메오패션',
  '나인',
  '뉴에일린',
  '다엘',
  '대명어패럴',
  '더시크컴퍼니',
  '라이브 어패럴',
  '라인스',
  '백산실업',
  '부연사',
  '새가온',
  '선화사',
  '스마일',
  '시즌',
  '실루엣컴퍼니',
  '아트패션',
  '에이스',
  '오르다',
  '오성섬유',
  '오스카 디자인',
  '우정샘플',
  '우정패션',
  '우진모피',
  '유화 섬유',
  '재민상사',
  '좋은사람',
  '하늘패션',
  '혜민사',
  '화담어패럴',
  '화신사',
  '희란패션',
  '조아스타일',
  // 매칭되지 않는 업장들
  '존재하지 않는 업장',
  '테스트 업장',
  '새로운 업장'
];

function testImageMatching() {
  console.log('🔍 이미지 매칭 테스트 시작...\n');

  testFactories.forEach((factoryName, index) => {
    console.log(`${index + 1}. ${factoryName}`);
    
    const folder = getFactoryImageFolder(factoryName);
    const mainImage = getFactoryMainImage(factoryName);
    const allImages = getFactoryImages(factoryName);
    
    if (folder) {
      console.log(`   ✅ 폴더: ${folder}`);
      console.log(`   📸 대표 이미지: ${mainImage}`);
      console.log(`   🖼️  전체 이미지: ${allImages.length}개`);
      if (allImages.length > 0) {
        console.log(`      첫 번째 이미지: ${allImages[0]}`);
      }
    } else {
      console.log(`   ❌ 매칭되는 폴더 없음`);
      console.log(`   📸 기본 이미지: ${mainImage}`);
    }
    console.log('');
  });

  console.log('✅ 이미지 매칭 테스트 완료');
}

testImageMatching(); 