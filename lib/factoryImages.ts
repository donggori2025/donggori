// Vercel Blob Storage 사용
import { getVercelBlobImageUrl, getVercelBlobThumbnailUrl } from './vercelBlobConfig';

// 업장 이름과 이미지 폴더 매칭
const factoryImageMapping: Record<string, string> = {
  // 정확한 매칭
  '강훈무역': '강훈무역',
  '건영실업': '건영실업',
  '경림패션': '경림패션',
  '꼬메오패션': '꼬메오패션',
  '나인': '나인',
  '뉴에일린': '뉴에일린',
  '다엘': '다엘',
  '대명어패럴': '대명어패럴',
  '더시크컴퍼니': '더시크컴퍼니',
  '라이브 어패럴': '라이브 어패럴',
  '라인스': '라인스',
  '백산실업': '백산실업',
  '부연사': '부연사',
  '새가온': '새가온',
  '선화사': '선화사',
  '스마일': '스마일',
  '시즌': '시즌',
  '실루엣컴퍼니': '실루엣컴퍼니',
  '아트패션': '아트패션',
  '에이스': '에이스',
  '오르다': '오르다',
  '오성섬유': '오성섬유',
  '오스카 디자인': '오스카 디자인',
  '우정샘플': '우정샘플',
  '우정패션': '우정패션',
  '우진모피': '우진모피',
  '유화 섬유': '유화 섬유',
  '재민상사': '재민상사',
  '좋은사람': '좋은사람',
  '하늘패션': '하늘패션',
  '혜민사': '혜민사',
  '화담어패럴': '화담어패럴',
  '화신사': '화신사',
  '희란패션': '희란패션',
  '희망사': '희망사',
};

// 업장 이름으로 이미지 폴더 찾기
export function getFactoryImageFolder(factoryName: string): string | null {
  return factoryImageMapping[factoryName] || null;
}

// 업장 이름으로 썸네일 이미지 URL 생성 (Vercel Blob 사용)
export function getFactoryThumbnailImage(factoryName: string): string {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    // 기본 이미지 반환
    return '/logo_donggori.png';
  }

  // Vercel Blob에서 썸네일 이미지 URL 생성
  return getVercelBlobThumbnailUrl(folderName);
}

// 업장 이름으로 모든 이미지 URL 생성 (Vercel Blob 사용)
export function getFactoryImages(factoryName: string): string[] {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    return ['/logo_donggori.png'];
  }

  // Vercel Blob에서 이미지 URL들 생성
  // 실제로는 동적으로 이미지 목록을 가져와야 하지만, 
  // 현재는 기본 이미지들을 반환
  const imageFiles = [
    '20250710_103857.jpg',
    '20250710_103905.jpg', 
    '20250710_104157.jpg',
    '20250710_104242.jpg',
    '20250710_104321.jpg'
  ];

  return imageFiles.map(fileName => getVercelBlobImageUrl(folderName, fileName));
}

// 업장 이름으로 대표 이미지 경로 생성 (썸네일용)
export function getFactoryMainImage(factoryName: string): string {
  return getFactoryThumbnailImage(factoryName);
}

// 이미지 존재 여부 확인 (선택적)
export function hasFactoryImages(factoryName: string): boolean {
  return getFactoryImageFolder(factoryName) !== null;
} 