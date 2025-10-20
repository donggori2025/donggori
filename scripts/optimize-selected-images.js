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

async function optimizeFactoryImages(factoryName) {
  const factoryPath = path.join(__dirname, '../public/동고리_사진데이터', factoryName);
  
  if (!fs.existsSync(factoryPath)) {
    console.log(`⚠️  ${factoryName} 폴더가 존재하지 않습니다.`);
    return;
  }

  console.log(`\n📁 ${factoryName} 이미지 최적화 시작...`);
  
  const files = fs.readdirSync(factoryPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  if (imageFiles.length === 0) {
    console.log(`⚠️  ${factoryName}에 이미지 파일이 없습니다.`);
    return;
  }

  // 백업 폴더 생성
  const backupPath = path.join(factoryPath, 'backup');
  if (!fs.existsSync(backupPath)) {
    fs.mkdirSync(backupPath);
  }

  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  let successCount = 0;

  for (const file of imageFiles) {
    const inputPath = path.join(factoryPath, file);
    const backupFilePath = path.join(backupPath, file);
    
    // 원본 파일을 백업 폴더로 복사 (이미 백업이 있으면 스킵)
    if (!fs.existsSync(backupFilePath)) {
      fs.copyFileSync(inputPath, backupFilePath);
    }
    
    // 이미지 최적화
    const result = await optimizeImage(inputPath, inputPath, OPTIMIZATION_CONFIG.web);
    
    if (result) {
      totalOriginalSize += result.originalSize;
      totalOptimizedSize += result.optimizedSize;
      successCount++;
    }
  }

  const totalReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);
  console.log(`\n📊 ${factoryName} 최적화 완료:`);
  console.log(`   성공: ${successCount}/${imageFiles.length}개`);
  console.log(`   총 용량: ${(totalOriginalSize/1024/1024).toFixed(2)}MB → ${(totalOptimizedSize/1024/1024).toFixed(2)}MB`);
  console.log(`   용량 감소: ${totalReduction}%`);
  
  return { totalOriginalSize, totalOptimizedSize, successCount, totalFiles: imageFiles.length };
}

async function optimizeSelectedFactories() {
  // 테스트용으로 몇 개 공장만 선택
  const testFactories = ['강훈무역', '건영실업', '경림패션', '기훈패션', '나르샤'];
  
  console.log(`🚀 ${testFactories.length}개 공장의 이미지 최적화를 시작합니다...`);
  
  let grandTotalOriginal = 0;
  let grandTotalOptimized = 0;
  let grandSuccessCount = 0;
  let grandTotalFiles = 0;

  for (const factory of testFactories) {
    const result = await optimizeFactoryImages(factory);
    if (result) {
      grandTotalOriginal += result.totalOriginalSize;
      grandTotalOptimized += result.totalOptimizedSize;
      grandSuccessCount += result.successCount;
      grandTotalFiles += result.totalFiles;
    }
  }

  const grandTotalReduction = ((grandTotalOriginal - grandTotalOptimized) / grandTotalOriginal * 100).toFixed(1);
  console.log('\n🎉 선택된 공장들의 이미지 최적화가 완료되었습니다!');
  console.log(`📊 전체 결과:`);
  console.log(`   성공: ${grandSuccessCount}/${grandTotalFiles}개`);
  console.log(`   총 용량: ${(grandTotalOriginal/1024/1024).toFixed(2)}MB → ${(grandTotalOptimized/1024/1024).toFixed(2)}MB`);
  console.log(`   용량 감소: ${grandTotalReduction}%`);
  console.log('💡 원본 파일들은 각 공장 폴더의 backup 폴더에 보관되어 있습니다.');
}

// 스크립트 실행
if (require.main === module) {
  optimizeSelectedFactories().catch(console.error);
}

module.exports = { optimizeImage, optimizeFactoryImages, optimizeSelectedFactories };
