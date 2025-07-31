const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// 환경변수 설정
require('dotenv').config({ path: '.env.local' });

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

// 업장별 이미지 매핑
const factoryImageMapping = {
  '강훈무역': '강훈무역',
  '건영실업': '건영실업',
  '경림패션': '경림패션',
  '꼬메오패션': '꼬메오패션',
  '나인': '나인',
  '뉴에일린': '뉴에일린',
  '다엘': '다엘',
  '대명어패럴': '대명어패럴',
  '더시크컴퍼니': '더시크컴퍼니',
  '라이브 어패럴': '라이브 어패럴',
  '라인스': '라인스',
  '백산실업': '백산실업',
  '부연사': '부연사',
  '새가온': '새가온',
  '선화사': '선화사',
  '스마일': '스마일',
  '시즌': '시즌',
  '실루엣컴퍼니': '실루엣컴퍼니',
  '아트패션': '아트패션',
  '에이스': '에이스',
  '오르다': '오르다',
  '오성섬유': '오성섬유',
  '오스카 디자인': '오스카 디자인',
  '우정샘플': '우정샘플',
  '우정패션': '우정패션',
  '우진모피': '우진모피',
  '유화 섬유': '유화 섬유',
  '재민상사': '재민상사',
  '좋은사람': '좋은사람',
  '하늘패션': '하늘패션',
  '혜민사': '혜민사',
  '화담어패럴': '화담어패럴',
  '화신사': '화신사',
  '희란패션': '희란패션',
  '희망사': '희망사',
};

async function uploadImageToBlob(filePath, folderName, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { url } = await put(`${folderName}/${fileName}`, fileBuffer, {
      access: 'public',
      allowOverwrite: true,
    });
    console.log(`✅ 업로드 성공: ${folderName}/${fileName} -> ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ 업로드 실패: ${folderName}/${fileName}`, error.message);
    return null;
  }
}

async function uploadFactoryImages() {
  const basePath = path.join(__dirname, '../public/동고리_사진데이터');
  
  console.log('🚀 Vercel Blob Storage에 이미지 업로드를 시작합니다...\n');

  for (const [factoryName, folderName] of Object.entries(factoryImageMapping)) {
    const folderPath = path.join(basePath, folderName);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  폴더가 존재하지 않음: ${folderName}`);
      continue;
    }

    console.log(`📁 ${factoryName} 이미지 업로드 중...`);
    
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png')
    );

    if (imageFiles.length === 0) {
      console.log(`⚠️  이미지 파일이 없음: ${folderName}`);
      continue;
    }

    let successCount = 0;
    for (const fileName of imageFiles) {
      const filePath = path.join(folderPath, fileName);
      const url = await uploadImageToBlob(filePath, folderName, fileName);
      if (url) successCount++;
      
      // API 제한을 피하기 위한 짧은 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ ${factoryName}: ${successCount}/${imageFiles.length} 파일 업로드 완료\n`);
  }

  console.log('🎉 모든 이미지 업로드가 완료되었습니다!');
}

// 스크립트 실행
uploadFactoryImages().catch(console.error); 