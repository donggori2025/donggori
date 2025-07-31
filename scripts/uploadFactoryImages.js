const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 이미지 파일 정보 (실제 이미지 파일명으로 수정 필요)
const factoryImages = [
  {
    factoryId: "1",
    factoryName: "서울패션공장",
    images: [
      // 실제 이미지 파일명으로 수정
      // "factory1_image1.jpg",
      // "factory1_image2.jpg",
    ]
  },
  {
    factoryId: "2", 
    factoryName: "부산의류제작소",
    images: [
      // "factory2_image1.jpg",
      // "factory2_image2.jpg",
    ]
  },
  // 추가 공장들...
];

async function uploadImageToStorage(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from('factory-images')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg', // 또는 적절한 MIME 타입
        upsert: true
      });

    if (error) {
      console.error(`이미지 업로드 실패 (${fileName}):`, error);
      return null;
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('factory-images')
      .getPublicUrl(fileName);

    console.log(`이미지 업로드 성공: ${fileName}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`이미지 업로드 중 오류 (${fileName}):`, error);
    return null;
  }
}

async function updateFactoryImages(factoryId, imageUrls) {
  try {
    const { error } = await supabase
      .from('donggori')
      .update({ 
        images: imageUrls,
        image: imageUrls[0] || null // 첫 번째 이미지를 대표 이미지로 설정
      })
      .eq('id', factoryId);

    if (error) {
      console.error(`DB 업데이트 실패 (공장 ID: ${factoryId}):`, error);
      return false;
    }

    console.log(`DB 업데이트 성공: 공장 ID ${factoryId}`);
    return true;
  } catch (error) {
    console.error(`DB 업데이트 중 오류 (공장 ID: ${factoryId}):`, error);
    return false;
  }
}

async function processFactoryImages() {
  console.log('봉제공장 이미지 업로드를 시작합니다...');

  for (const factory of factoryImages) {
    console.log(`\n처리 중: ${factory.factoryName} (ID: ${factory.factoryId})`);
    
    const imageUrls = [];
    
    for (const imageFile of factory.images) {
      // 실제 이미지 파일 경로로 수정 필요
      const imagePath = path.join(__dirname, 'images', imageFile);
      
      if (!fs.existsSync(imagePath)) {
        console.warn(`이미지 파일을 찾을 수 없습니다: ${imagePath}`);
        continue;
      }

      const fileName = `factory_${factory.factoryId}_${imageFile}`;
      const publicUrl = await uploadImageToStorage(imagePath, fileName);
      
      if (publicUrl) {
        imageUrls.push(publicUrl);
      }
    }

    if (imageUrls.length > 0) {
      await updateFactoryImages(factory.factoryId, imageUrls);
    } else {
      console.warn(`${factory.factoryName}에 업로드된 이미지가 없습니다.`);
    }
  }

  console.log('\n이미지 업로드 작업이 완료되었습니다.');
}

// 스크립트 실행
if (require.main === module) {
  processFactoryImages().catch(console.error);
}

module.exports = {
  uploadImageToStorage,
  updateFactoryImages,
  processFactoryImages
}; 