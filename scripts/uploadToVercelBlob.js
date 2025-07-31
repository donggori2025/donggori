const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

// 환경 변수 설정
require('dotenv').config({ path: '.env.local' });

const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN이 설정되지 않았습니다.');
  console.log('Vercel 대시보드에서 Blob Storage를 설정하고 토큰을 가져오세요.');
  process.exit(1);
}

// 이미지 업로드 함수
async function uploadImageToVercelBlob(filePath, blobPath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const file = new File([fileContent], path.basename(filePath), {
      type: 'image/jpeg',
    });

    const { url } = await put(blobPath, file, {
      access: 'public',
    });

    console.log(`✅ 업로드 완료: ${blobPath} -> ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ 업로드 실패: ${blobPath}`, error.message);
    return null;
  }
}

// 폴더 내 모든 이미지 업로드
async function uploadFolderImages(folderPath, folderName) {
  try {
    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.png') ||
      file.toLowerCase().endsWith('.jpeg')
    );

    console.log(`📁 ${folderName} 폴더에서 ${imageFiles.length}개 이미지 발견`);

    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file);
      const blobPath = `${folderName}/${file}`;
      
      await uploadImageToVercelBlob(filePath, blobPath);
      
      // API 제한을 피하기 위한 지연
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`✅ ${folderName} 폴더 업로드 완료`);
  } catch (error) {
    console.error(`❌ ${folderName} 폴더 업로드 실패:`, error.message);
  }
}

// 썸네일 이미지 업로드
async function uploadThumbnails() {
  const sourcePath = 'public/동고리_사진데이터';
  
  try {
    const folders = fs.readdirSync(sourcePath);
    
    for (const folder of folders) {
      const folderPath = path.join(sourcePath, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory()) {
        // 첫 번째 이미지를 썸네일로 사용
        const files = fs.readdirSync(folderPath);
        const imageFiles = files.filter(file => 
          file.toLowerCase().endsWith('.jpg') || 
          file.toLowerCase().endsWith('.png')
        );
        
        if (imageFiles.length > 0) {
          const thumbnailFile = imageFiles[0];
          const thumbnailPath = path.join(folderPath, thumbnailFile);
          const blobPath = `thumbnails/${folder}.jpg`;
          
          await uploadImageToVercelBlob(thumbnailPath, blobPath);
          console.log(`✅ 썸네일 업로드: ${folder}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ 썸네일 업로드 실패:', error.message);
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 Vercel Blob Storage에 이미지 업로드 시작...');
  
  const sourcePath = 'public/동고리_사진데이터';
  
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ 이미지 폴더를 찾을 수 없습니다:', sourcePath);
    return;
  }

  try {
    const folders = fs.readdirSync(sourcePath);
    console.log(`📁 총 ${folders.length}개 폴더 발견`);

    // 썸네일 먼저 업로드
    console.log('🖼️ 썸네일 이미지 업로드 중...');
    await uploadThumbnails();

    // 각 폴더의 이미지들 업로드
    for (const folder of folders) {
      const folderPath = path.join(sourcePath, folder);
      const stats = fs.statSync(folderPath);
      
      if (stats.isDirectory()) {
        console.log(`📁 ${folder} 폴더 업로드 중...`);
        await uploadFolderImages(folderPath, folder);
      }
    }

    console.log('🎉 모든 이미지 업로드 완료!');
  } catch (error) {
    console.error('❌ 업로드 중 오류 발생:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
} 