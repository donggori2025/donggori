const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// AWS S3 클라이언트 설정
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'donggori-images';

// 이미지 업로드 함수
async function uploadImageToS3(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });

    await s3Client.send(command);
    console.log(`✅ 업로드 완료: ${key}`);
  } catch (error) {
    console.error(`❌ 업로드 실패: ${key}`, error);
  }
}

// 폴더 내 모든 이미지 업로드
async function uploadFolderImages(folderPath, s3Folder) {
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')) {
      const filePath = path.join(folderPath, file);
      const s3Key = `${s3Folder}/${file}`;
      await uploadImageToS3(filePath, s3Key);
    }
  }
}

// 썸네일 이미지 업로드
async function uploadThumbnails() {
  const thumbnailsPath = path.join(__dirname, '../public/compressed_images');
  
  if (fs.existsSync(thumbnailsPath)) {
    const files = fs.readdirSync(thumbnailsPath);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.jpg')) {
        const filePath = path.join(thumbnailsPath, file);
        const s3Key = `thumbnails/${file}`;
        await uploadImageToS3(filePath, s3Key);
      }
    }
  }
}

// 메인 실행 함수
async function main() {
  console.log('🚀 이미지 업로드 시작...');
  
  const imagesPath = path.join(__dirname, '../public/동고리_사진데이터');
  
  if (fs.existsSync(imagesPath)) {
    const folders = fs.readdirSync(imagesPath);
    
    for (const folder of folders) {
      const folderPath = path.join(imagesPath, folder);
      
      if (fs.statSync(folderPath).isDirectory()) {
        console.log(`📁 폴더 처리 중: ${folder}`);
        await uploadFolderImages(folderPath, folder);
      }
    }
  }
  
  // 썸네일 업로드
  console.log('📸 썸네일 업로드 중...');
  await uploadThumbnails();
  
  console.log('✅ 모든 이미지 업로드 완료!');
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { uploadImageToS3, uploadFolderImages, uploadThumbnails }; 