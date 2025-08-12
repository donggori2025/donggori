const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// 환경 변수 확인
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

// 이미지 업로드 함수
async function uploadImageToBlob(filePath, folderName, fileName) {
  try {
    console.log(`📤 업로드 중: ${folderName}/${fileName}`);
    
    const fileBuffer = fs.readFileSync(filePath);
    const { url } = await put(`${folderName}/${fileName}`, fileBuffer, {
      access: 'public',
    });
    
    console.log(`✅ 업로드 완료: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ 업로드 실패 (${fileName}):`, error.message);
    return null;
  }
}

// 특정 공장의 이미지들 업로드
async function uploadFactoryImages(factoryName) {
  console.log(`\n🚀 ${factoryName} 이미지 업로드 시작...`);
  
  const localFolderPath = path.join(__dirname, '../public/동고리_사진데이터', factoryName);
  
  // 로컬 폴더 존재 확인
  if (!fs.existsSync(localFolderPath)) {
    console.error(`❌ 로컬 폴더를 찾을 수 없습니다: ${localFolderPath}`);
    return;
  }
  
  // 폴더 내 이미지 파일들 읽기
  const files = fs.readdirSync(localFolderPath)
    .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
  
  console.log(`📁 ${factoryName} 폴더에서 ${files.length}개의 이미지 파일을 찾았습니다.`);
  
  if (files.length === 0) {
    console.log(`⚠️ ${factoryName} 폴더에 이미지 파일이 없습니다.`);
    return;
  }
  
  const uploadedUrls = [];
  
  // 각 이미지 파일 업로드
  for (const file of files) {
    const filePath = path.join(localFolderPath, file);
    const url = await uploadImageToBlob(filePath, factoryName, file);
    
    if (url) {
      uploadedUrls.push(url);
    }
    
    // 업로드 간격 조절 (서버 부하 방지)
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 ${factoryName} 업로드 결과:`);
  console.log(`   ✅ 성공: ${uploadedUrls.length}개`);
  console.log(`   ❌ 실패: ${files.length - uploadedUrls.length}개`);
  
  if (uploadedUrls.length > 0) {
    console.log(`\n🔗 업로드된 URL들:`);
    uploadedUrls.forEach((url, index) => {
      console.log(`   ${index + 1}. ${url}`);
    });
  }
  
  return uploadedUrls;
}

// 메인 함수
async function uploadSpecificImages() {
  console.log('🚀 우정패션, 우진모피 이미지 업로드 시작...\n');
  
  const targetFactories = ['우정패션', '우진모피'];
  const results = {};
  
  for (const factoryName of targetFactories) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📸 ${factoryName} 처리 중...`);
    console.log(`${'='.repeat(50)}`);
    
    const urls = await uploadFactoryImages(factoryName);
    results[factoryName] = urls || [];
  }
  
  // 전체 결과 요약
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 전체 업로드 결과 요약');
  console.log(`${'='.repeat(50)}`);
  
  Object.entries(results).forEach(([factoryName, urls]) => {
    console.log(`\n🏭 ${factoryName}:`);
    console.log(`   📸 업로드된 이미지: ${urls.length}개`);
    if (urls.length > 0) {
      console.log(`   🔗 첫 번째 이미지: ${urls[0]}`);
    }
  });
  
  console.log('\n✅ 모든 업로드 작업이 완료되었습니다.');
}

// 스크립트 실행
uploadSpecificImages()
  .then(() => {
    console.log('\n🎉 스크립트 실행 완료');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
