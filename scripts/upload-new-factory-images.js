const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

// 새로 추가된 공장들
const newFactories = [
  'jk패션',
  '기훈패션', 
  '나르샤',
  '다래디자인',
  '다온패션',
  '레오실업',
  '민경패션',
  '바비패션',
  '수미어패럴',
  '으뜸어패럴',
  '정인어패럴',
  '태경패션',
  '태광사',
  '태성어패럴'
];

async function uploadFactoryImages() {
  const basePath = path.join(__dirname, '../public/동고리_사진데이터');
  
  for (const factoryName of newFactories) {
    const factoryPath = path.join(basePath, factoryName);
    
    if (!fs.existsSync(factoryPath)) {
      console.log(`❌ ${factoryName} 폴더가 존재하지 않습니다.`);
      continue;
    }
    
    console.log(`📁 ${factoryName} 이미지 업로드 시작...`);
    
    const files = fs.readdirSync(factoryPath);
    const imageFiles = files.filter(file => 
      file.toLowerCase().endsWith('.jpg') || 
      file.toLowerCase().endsWith('.jpeg') || 
      file.toLowerCase().endsWith('.png')
    );
    
    for (const fileName of imageFiles) {
      try {
        const filePath = path.join(factoryPath, fileName);
        const fileBuffer = fs.readFileSync(filePath);
        
        // File 객체 생성
        const file = new File([fileBuffer], fileName, {
          type: 'image/jpeg'
        });
        
        // Vercel Blob에 업로드
        const { url } = await put(`${factoryName}/${fileName}`, file, {
          access: 'public',
        });
        
        console.log(`✅ ${fileName} 업로드 완료: ${url}`);
        
        // 업로드 간격 조절 (API 제한 방지)
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ ${fileName} 업로드 실패:`, error.message);
      }
    }
    
    console.log(`🎉 ${factoryName} 업로드 완료!\n`);
  }
  
  console.log('🚀 모든 새 공장 이미지 업로드가 완료되었습니다!');
}

// 스크립트 실행
uploadFactoryImages().catch(console.error);
