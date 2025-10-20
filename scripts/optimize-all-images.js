const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 더 적극적인 이미지 최적화 설정
const OPTIMIZATION_CONFIG = {
  web: {
    width: 1000,        // 최대 너비를 더 작게
    height: 600,         // 최대 높이를 더 작게
    quality: 75,        // JPEG 품질을 더 낮게 (75%)
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

async function optimizeAllImages() {
  const basePath = path.join(__dirname, '../public/동고리_사진데이터');
  
  if (!fs.existsSync(basePath)) {
    console.error('❌ 동고리_사진데이터 폴더를 찾을 수 없습니다.');
    return;
  }

  const factories = fs.readdirSync(basePath).filter(item => {
    const itemPath = path.join(basePath, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`🚀 총 ${factories.length}개 공장의 이미지 최적화를 시작합니다...`);
  
  let grandTotalOriginal = 0;
  let grandTotalOptimized = 0;
  let grandSuccessCount = 0;
  let grandTotalFiles = 0;

  for (const factory of factories) {
    const factoryPath = path.join(basePath, factory);
    console.log(`\n📁 ${factory} 이미지 최적화 시작...`);
    
    const files = fs.readdirSync(factoryPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log(`⚠️  ${factory}에 이미지 파일이 없습니다.`);
      continue;
    }

    let factoryOriginalSize = 0;
    let factoryOptimizedSize = 0;
    let factorySuccessCount = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(factoryPath, file);
      
      // 이미지 최적화
      const result = await optimizeImage(inputPath, inputPath, OPTIMIZATION_CONFIG.web);
      
      if (result) {
        factoryOriginalSize += result.originalSize;
        factoryOptimizedSize += result.optimizedSize;
        factorySuccessCount++;
      }
    }

    const factoryReduction = ((factoryOriginalSize - factoryOptimizedSize) / factoryOriginalSize * 100).toFixed(1);
    console.log(`📊 ${factory} 최적화 완료:`);
    console.log(`   성공: ${factorySuccessCount}/${imageFiles.length}개`);
    console.log(`   총 용량: ${(factoryOriginalSize/1024/1024).toFixed(2)}MB → ${(factoryOptimizedSize/1024/1024).toFixed(2)}MB`);
    console.log(`   용량 감소: ${factoryReduction}%`);

    grandTotalOriginal += factoryOriginalSize;
    grandTotalOptimized += factoryOptimizedSize;
    grandSuccessCount += factorySuccessCount;
    grandTotalFiles += imageFiles.length;
  }

  const grandTotalReduction = ((grandTotalOriginal - grandTotalOptimized) / grandTotalOriginal * 100).toFixed(1);
  console.log('\n🎉 모든 이미지 최적화가 완료되었습니다!');
  console.log(`📊 전체 결과:`);
  console.log(`   성공: ${grandSuccessCount}/${grandTotalFiles}개`);
  console.log(`   총 용량: ${(grandTotalOriginal/1024/1024).toFixed(2)}MB → ${(grandTotalOptimized/1024/1024).toFixed(2)}MB`);
  console.log(`   용량 감소: ${grandTotalReduction}%`);
  console.log(`   절약된 용량: ${((grandTotalOriginal - grandTotalOptimized)/1024/1024).toFixed(2)}MB`);
}

// 스크립트 실행
if (require.main === module) {
  optimizeAllImages().catch(console.error);
}

module.exports = { optimizeImage, optimizeAllImages };
