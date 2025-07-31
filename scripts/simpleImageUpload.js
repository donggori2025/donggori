const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 실제 이미지 파일들을 여기에 추가하세요
const imageFiles = [
  // 예시: 실제 이미지 파일명으로 수정
  // "factory1.jpg",
  // "factory2.jpg", 
  // "factory3.jpg",
];

async function uploadImages() {
  console.log('이미지 업로드를 시작합니다...');
  
  const uploadedUrls = [];
  
  for (const imageFile of imageFiles) {
    const imagePath = path.join(__dirname, 'images', imageFile);
    
    if (!fs.existsSync(imagePath)) {
      console.warn(`파일을 찾을 수 없습니다: ${imagePath}`);
      continue;
    }
    
    try {
      const fileBuffer = fs.readFileSync(imagePath);
      const fileName = `factory_${Date.now()}_${imageFile}`;
      
      const { data, error } = await supabase.storage
        .from('factory-images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
      
      if (error) {
        console.error(`업로드 실패 (${imageFile}):`, error);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from('factory-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push({
        fileName: imageFile,
        url: urlData.publicUrl
      });
      
      console.log(`업로드 성공: ${imageFile} -> ${urlData.publicUrl}`);
      
    } catch (error) {
      console.error(`업로드 중 오류 (${imageFile}):`, error);
    }
  }
  
  console.log('\n업로드된 이미지 URL들:');
  uploadedUrls.forEach(item => {
    console.log(`${item.fileName}: ${item.url}`);
  });
  
  return uploadedUrls;
}

// 스크립트 실행
if (require.main === module) {
  uploadImages().catch(console.error);
}

module.exports = { uploadImages }; 