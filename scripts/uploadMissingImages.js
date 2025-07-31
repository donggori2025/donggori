const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// 환경 변수 설정
require('dotenv').config({ path: '.env.local' });

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  process.exit(1);
}

// 누락된 업장들의 이미지 업로드
async function uploadMissingFactoryImages() {
  const missingFactories = [
    {
      name: '재민상사',
      files: [
        '20250714_120323.jpg',
        '20250714_120423.jpg',
        '20250714_120430.jpg',
        '20250714_120452.jpg',
        'KakaoTalk_20250715_163600624.jpg'
      ]
    },
    {
      name: '아트패션',
      files: [
        '20250709_112748.jpg',
        '20250709_112919.jpg',
        '20250709_112925.jpg',
        '20250709_112951.jpg',
        '20250709_113042.jpg'
      ]
    }
  ];

  for (const factory of missingFactories) {
    console.log(`📁 ${factory.name} 이미지 업로드 중...`);
    
    for (const fileName of factory.files) {
      try {
        const filePath = path.join('public/동고리_사진데이터', factory.name, fileName);
        
        if (!fs.existsSync(filePath)) {
          console.log(`⚠️ 파일 없음: ${filePath}`);
          continue;
        }

        const fileContent = fs.readFileSync(filePath);
        const file = new File([fileContent], fileName, {
          type: 'image/jpeg',
        });

        const { url } = await put(`${factory.name}/${fileName}`, file, {
          access: 'public',
        });

        console.log(`✅ 업로드 완료: ${factory.name}/${fileName} -> ${url}`);
        
        // API 제한을 피하기 위한 지연
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ 업로드 실패: ${factory.name}/${fileName}`, error.message);
      }
    }
  }
}

// 메인 실행
async function main() {
  console.log('🚀 누락된 업장 이미지 업로드 시작...');
  
  try {
    await uploadMissingFactoryImages();
    console.log('🎉 누락된 업장 이미지 업로드 완료!');
  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
} 