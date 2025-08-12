// factoryImages.ts의 함수들을 시뮬레이션
const factoryImageMapping = {
  '우정패션': '우정패션',
  '우진모피': '우진모피',
};

const factoryImageFiles = {
  '우정패션': [
    '20250714_111200.jpg',
    '20250714_111228.jpg',
    '20250714_111415.jpg',
    '20250714_111424.jpg',
    '20250714_111438.jpg',
    'KakaoTalk_20250716_094918963.jpg',
    'KakaoTalk_20250716_094918963_01.jpg',
    'KakaoTalk_20250716_094918963_02.jpg',
    'KakaoTalk_20250716_094918963_03.jpg'
  ],
  '우진모피': [
    '20250715_103650.jpg',
    '20250715_103942.jpg',
    '20250715_103950.jpg',
    '20250715_104002.jpg',
    '20250715_104013.jpg',
    '20250715_104041.jpg',
    '20250715_104044.jpg',
    '20250715_104122.jpg',
    '20250715_104710.jpg',
    '20250715_104804.jpg'
  ],
};

// Vercel Blob URL 생성 함수 시뮬레이션
function getVercelBlobImageUrl(folderName, fileName) {
  return `https://donggori.blob.vercel-storage.com/${folderName}/${fileName}`;
}

// 업장 이름으로 이미지 폴더 찾기
function getFactoryImageFolder(factoryName) {
  return factoryImageMapping[factoryName] || null;
}

// 업장 이름으로 썸네일 이미지 URL 생성
function getFactoryThumbnailImage(factoryName) {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    return '/logo_donggori.png';
  }

  const imageFiles = factoryImageFiles[factoryName];
  
  if (!imageFiles || imageFiles.length === 0) {
    return '/logo_donggori.png';
  }

  if (imageFiles[0].startsWith('/')) {
    return imageFiles[0];
  }

  // 우정패션과 우진모피는 로컬 이미지 사용
  if (factoryName === '우정패션' || factoryName === '우진모피') {
    return `/동고리_사진데이터/${folderName}/${imageFiles[0]}`;
  }

  return getVercelBlobImageUrl(folderName, imageFiles[0]);
}

// 업장 이름으로 모든 이미지 URL 생성
function getFactoryImages(factoryName) {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    return ['/logo_donggori.png'];
  }

  const imageFiles = factoryImageFiles[factoryName];
  
  if (!imageFiles) {
    return ['/logo_donggori.png'];
  }

  if (imageFiles[0].startsWith('/')) {
    return imageFiles;
  }

  // 우정패션과 우진모피는 로컬 이미지 사용
  if (factoryName === '우정패션' || factoryName === '우진모피') {
    return imageFiles.map(fileName => `/동고리_사진데이터/${folderName}/${fileName}`);
  }

  return imageFiles.map(fileName => getVercelBlobImageUrl(folderName, fileName));
}

// 업장 이름으로 대표 이미지 경로 생성
function getFactoryMainImage(factoryName) {
  return getFactoryThumbnailImage(factoryName);
}

async function testSpecificImageMapping() {
  console.log('🧪 우정패션, 우진모피 이미지 매핑 테스트...\n');

  const testFactories = ['우정패션', '우진모피'];

  testFactories.forEach((factoryName) => {
    console.log(`\n--- ${factoryName} 테스트 ---`);
    
    const folder = getFactoryImageFolder(factoryName);
    const mainImage = getFactoryMainImage(factoryName);
    const allImages = getFactoryImages(factoryName);
    
    console.log(`📁 폴더: ${folder || '없음'}`);
    console.log(`📸 대표 이미지: ${mainImage}`);
    console.log(`🖼️  전체 이미지: ${allImages.length}개`);
    
    if (allImages.length > 0) {
      console.log('📋 이미지 목록:');
      allImages.forEach((image, index) => {
        console.log(`   ${index + 1}. ${image}`);
      });
    }
    
    // 이미지 URL 유효성 검사
    console.log('\n🔍 이미지 URL 분석:');
    if (mainImage && mainImage !== '/logo_donggori.png') {
      console.log(`   ✅ 대표 이미지 URL: ${mainImage}`);
      console.log(`   📊 URL 길이: ${mainImage.length}자`);
      console.log(`   🌐 Vercel Blob 포함: ${mainImage.includes('vercel-storage.com')}`);
    } else {
      console.log(`   ⚠️ 기본 이미지 사용: ${mainImage}`);
    }
  });

  console.log('\n✅ 테스트 완료');
}

// 테스트 실행
testSpecificImageMapping()
  .then(() => {
    console.log('\n✅ 모든 테스트 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 테스트 실패:', error);
    process.exit(1);
  });
