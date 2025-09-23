const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정 (서비스 롤 키 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서비스 롤 키 필요

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase 환경변수가 설정되지 않았습니다.');
  console.log('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 확인해주세요.');
  process.exit(1);
}

// 서비스 롤 키로 클라이언트 생성 (RLS 우회)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 공장 이름 매핑 (DB의 공장명과 폴더명 매칭)
const factoryNameMapping = {
  '희란패션': '희란패션',
  '화신사': '화신사',
  '혜민사': '혜민사',
  '하늘패션': '하늘패션',
  '좋은사람': '좋은사람',
  '재민상사': '재민상사',
  '유화 섬유': '유화섬유',
  '우진모피': '우진모피',
  '우정샘플': '우정샘플',
  '오스카 디자인': '오스카디자인',
  '오성섬유': '오성섬유',
  '오르다': '오르다',
  '에이스': '에이스',
  '아트패션': '아트패션',
  '실루엣컴퍼니': '실루엣컴퍼니',
  '시즌': '시즌',
  '스마일': '스마일',
  '선화사': '선화사',
  '새가온': '새가온',
  '부연사': '부연사',
  '백산실업': '백산실업',
  '라인스': '라인스',
  '라이브 어패럴': '라이브어패럴',
  '더시크컴퍼니': '더시크컴퍼니',
  '대명어패럴': '대명어패럴',
  '다엘': '다엘',
  '뉴에일린': '뉴에일린',
  '나인': '나인',
  '꼬메오패션': '꼬메오패션',
  '경림패션': '경림패션',
  '강훈무역': '강훈무역'
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

async function processFactoryImages() {
  console.log('봉제공장 이미지 업로드를 시작합니다...');
  
  const dataPath = path.join(__dirname, '../public/동고리_사진데이터');
  
  if (!fs.existsSync(dataPath)) {
    console.error('동고리_사진데이터 폴더를 찾을 수 없습니다.');
    return;
  }

  const factoryFolders = fs.readdirSync(dataPath).filter(item => {
    const itemPath = path.join(dataPath, item);
    return fs.statSync(itemPath).isDirectory() && item !== '.DS_Store';
  });

  console.log(`총 ${factoryFolders.length}개의 공장 폴더를 발견했습니다.`);

  for (const folderName of factoryFolders) {
    console.log(`\n처리 중: ${folderName}`);
    
    const folderPath = path.join(dataPath, folderName);
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
    const mappedName = factoryNameMapping[folderName] || folderName;
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

  console.log('\n이미지 업로드 작업이 완료되었습니다.');
}

// 스크립트 실행
if (require.main === module) {
  processFactoryImages().catch(console.error);
}

module.exports = {
  uploadImageToStorage,
  findFactoryInDB,
  updateFactoryImages,
  processFactoryImages
}; 