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

// 새로 추가된 업장들의 매핑
const newFactoryMapping = {
  '건영실업': '건영실업',
  '우정패션': '우정패션',
  '우진모피': '우진모피',
  '화담어패럴': '화담어패럴'
};

async function uploadImageToStorage(filePath, fileName) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from('factory-images')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
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

async function findFactoryInDB(factoryName) {
  try {
    // company_name 필드에서만 검색
    const { data, error } = await supabase
      .from('donggori')
      .select('*')
      .ilike('company_name', `%${factoryName}%`)
      .limit(1);

    if (error) {
      console.error(`DB 검색 오류 (${factoryName}):`, error);
      return null;
    }

    if (data && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error(`DB 검색 중 오류 (${factoryName}):`, error);
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

async function processNewFactories() {
  console.log('새로 추가된 봉제공장 이미지 업로드를 시작합니다...');
  
  const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
  
  if (!fs.existsSync(dataPath)) {
    console.error('동고리_사진데이터 폴더를 찾을 수 없습니다.');
    return;
  }

  for (const folderName of Object.keys(newFactoryMapping)) {
    console.log(`\n처리 중: ${folderName}`);
    
    const folderPath = path.join(dataPath, folderName);
    
    if (!fs.existsSync(folderPath)) {
      console.warn(`${folderName} 폴더를 찾을 수 없습니다.`);
      continue;
    }
    
    const imageFiles = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });

    if (imageFiles.length === 0) {
      console.warn(`${folderName} 폴더에 이미지 파일이 없습니다.`);
      continue;
    }

    console.log(`${folderName}: ${imageFiles.length}개의 이미지 파일 발견`);

    // DB에서 해당 공장 찾기
    const mappedName = newFactoryMapping[folderName];
    const factoryData = await findFactoryInDB(mappedName);

    if (!factoryData) {
      console.warn(`DB에서 공장을 찾을 수 없습니다: ${mappedName}`);
      continue;
    }

    console.log(`DB에서 공장을 찾았습니다: ${factoryData.company_name || factoryData.name} (ID: ${factoryData.id})`);

    // 이미지 업로드
    const imageUrls = [];
    for (const imageFile of imageFiles) {
      const imagePath = path.join(folderPath, imageFile);
      const fileName = `factory_${factoryData.id}_${Date.now()}_${imageFile}`;
      
      const publicUrl = await uploadImageToStorage(imagePath, fileName);
      if (publicUrl) {
        imageUrls.push(publicUrl);
      }
    }

    if (imageUrls.length > 0) {
      await updateFactoryImages(factoryData.id, imageUrls);
      console.log(`${folderName}: ${imageUrls.length}개의 이미지 업로드 완료`);
    } else {
      console.warn(`${folderName}: 업로드된 이미지가 없습니다.`);
    }
  }

  console.log('\n새로 추가된 업장들의 이미지 업로드 작업이 완료되었습니다.');
}

// 스크립트 실행
if (require.main === module) {
  processNewFactories().catch(console.error);
} 