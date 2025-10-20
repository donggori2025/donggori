const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 이미지 최적화 설정
const OPTIMIZATION_CONFIG = {
  web: {
    width: 1200,        // 최대 너비
    height: 800,         // 최대 높이
    quality: 80,        // JPEG 품질 (80%)
    format: 'jpeg'
  }
};

async function optimizeImage(inputPath, outputPath, config) {
  try {
    // 임시 파일로 최적화 후 원본 파일로 교체
    const tempPath = outputPath + '.tmp';
    
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: config.quality })
      .toFile(tempPath);
    
    // 임시 파일을 원본 파일로 교체
    fs.renameSync(tempPath, outputPath);
    
    const originalSize = fs.statSync(inputPath).size;
    const optimizedSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(inputPath)}: ${(originalSize/1024/1024).toFixed(2)}MB → ${(optimizedSize/1024/1024).toFixed(2)}MB (${reduction}% 감소)`);
    
    return { originalSize, optimizedSize, reduction };
  } catch (error) {
    console.error(`✗ ${path.basename(inputPath)} 최적화 실패:`, error.message);
    return null;
  }
}

async function testOptimization() {
  const factoryPath = path.join(__dirname, '../public/동고리_사진데이터/강훈무역');
  
  if (!fs.existsSync(factoryPath)) {
    console.log('⚠️  강훈무역 폴더가 존재하지 않습니다.');
    return;
  }

  console.log('📁 강훈무역 이미지 최적화 테스트...');
  
  const files = fs.readdirSync(factoryPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file) && file.includes('KakaoTalk')
  ).slice(0, 3); // KakaoTalk 파일들 중 처음 3개만 테스트

  if (imageFiles.length === 0) {
    console.log('⚠️  이미지 파일이 없습니다.');
    return;
  }

  // 백업 폴더 생성
  const backupPath = path.join(factoryPath, 'backup');
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath);
  }

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(factoryPath, file);
    const backupFilePath = path.join(backupPath, file);
    
    // 원본 파일을 백업 폴더로 복사
    fs.copyFileSync(inputPath, backupFilePath);
    
    // 이미지 최적화
    const result = await optimizeImage(inputPath, inputPath, OPTIMIZATION_CONFIG.web);
    
    if (result) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
    }
  }

  const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  console.log(`\n📊 테스트 결과:`);
  console.log(`   총 용량: ${(totalOriginalSize/1024/1024).toFixed(2)}MB → ${(totalOptimizedSize/1024/1024).toFixed(2)}MB`);
  console.log(`   용량 감소: ${totalReduction}%`);
}

// 스크립트 실행
testOptimization().catch(console.error);
