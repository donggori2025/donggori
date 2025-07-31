const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 환경 변수 설정
require('dotenv').config({ path: '.env.local' });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'donggori-images';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error('❌ AWS 인증 정보가 설정되지 않았습니다.');
  console.log('AWS_ACCESS_KEY_ID와 AWS_SECRET_ACCESS_KEY를 .env.local에 설정하세요.');
  process.exit(1);
}

// 이미지 업로드 함수
async function uploadImageToS3(filePath, s3Key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });

    await s3Client.send(command);
    console.log(`✅ 업로드 완료: ${s3Key}`);
    return true;
  } catch (error) {
    console.error(`❌ 업로드 실패: ${s3Key}`, error.message);
    return false;
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
      const s3Key = `${folderName}/${file}`;

      await uploadImageToS3(filePath, s3Key);

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
          const s3Key = `thumbnails/${folder}.jpg`;

          await uploadImageToS3(thumbnailPath, s3Key);
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
  console.log('🚀 AWS S3에 이미지 업로드 시작...');

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