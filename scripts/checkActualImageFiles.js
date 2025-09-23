import { readdir } from 'fs/promises';
import { join } from 'path';

async function checkActualImageFiles() {
  console.log('🔍 실제 이미지 파일 구조 확인 중...\n');

  const imageFolders = [
    '강훈무역',
    '건영실업', 
    '경림패션',
    '꼬메오패션',
    '나인',
    '뉴에일린',
    '다엘',
    '대명어패럴',
    '더시크컴퍼니',
    '라이브 어패럴',
    '라인스',
    '백산실업',
    '부연사',
    '새가온',
    '선화사',
    '스마일',
    '시즌',
    '실루엣컴퍼니',
    '아트패션',
    '에이스',
    '오르다',
    '오성섬유',
    '오스카 디자인',
    '우정샘플',
    '우정패션',
    '우진모피',
    '유화 섬유',
    '재민상사',
    '좋은사람',
    '하늘패션',
    '혜민사',
    '화담어패럴',
    '화신사',
    '희란패션',
    '조아스타일',
  ];

  for (const folder of imageFolders) {
    try {
      const folderPath = join(process.cwd(), 'public', '동고리_사진데이터', folder);
      const files = await readdir(folderPath);
      
      // jpg 파일만 필터링
      const jpgFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));
      
      console.log(`${folder}:`);
      console.log(`  📁 폴더 존재: ✅`);
      console.log(`  📸 이미지 파일: ${jpgFiles.length}개`);
      
      if (jpgFiles.length > 0) {
        // 첫 번째 이미지 파일명 출력
        console.log(`  🖼️  첫 번째 이미지: ${jpgFiles[0]}`);
        
        // 모든 이미지 파일명 출력 (최대 5개)
        const displayFiles = jpgFiles.slice(0, 5);
        displayFiles.forEach((file, index) => {
          console.log(`     ${index + 1}. ${file}`);
        });
        
        if (jpgFiles.length > 5) {
          console.log(`     ... 외 ${jpgFiles.length - 5}개 더`);
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`${folder}: ❌ 폴더 접근 실패`);
      console.log('');
    }
  }

  console.log('✅ 실제 이미지 파일 구조 확인 완료');
}

checkActualImageFiles().catch(console.error); 