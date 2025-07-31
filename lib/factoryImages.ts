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

// 업장별 실제 업로드된 이미지 파일명들
const factoryImageFiles: Record<string, string[]> = {
  '강훈무역': [
    '20250710_103857.jpg',
    '20250710_103905.jpg',
    '20250710_104157.jpg',
    '20250710_104242.jpg',
    '20250710_104321.jpg'
  ],
  '건영실업': [
    '20250715_101845.jpg',
    '20250715_102913.jpg',
    '20250715_102934.jpg',
    '20250715_102936.jpg',
    'KakaoTalk_20250716_132620778.jpg'
  ],
  '경림패션': [
    '20250710_113356.jpg',
    '20250710_113435.jpg',
    '20250710_113456.jpg',
    '20250710_113602.jpg',
    '20250710_113613.jpg'
  ],
  '꼬메오패션': [
    '20250714_160113.jpg',
    '20250714_160151.jpg',
    '20250714_160227.jpg',
    '20250714_160228.jpg',
    '20250714_160230.jpg'
  ],
  '나인': [
    '20250710_111150.jpg',
    '20250710_112153.jpg',
    '20250710_112246.jpg',
    '20250710_112303.jpg',
    '20250710_112327.jpg'
  ],
  '뉴에일린': [
    '20250708_160127.jpg',
    '20250708_160310.jpg',
    '20250708_160433.jpg',
    '20250708_162059.jpg',
    '20250708_162123.jpg'
  ],
  '다엘': [
    '20250715_105148.jpg',
    '20250715_105227.jpg',
    '20250715_105259.jpg',
    '20250715_105435.jpg',
    '20250715_105441.jpg'
  ],
  '대명어패럴': [
    '20250709_104228.jpg',
    '20250709_104706.jpg',
    '20250709_104717.jpg',
    '20250709_104801.jpg',
    '20250709_104805.jpg'
  ],
  '더시크컴퍼니': [
    '20250709_225247.jpg',
    '20250710_145051.jpg',
    '20250715_160832.jpg',
    '20250715_212315.jpg',
    '20250715_212318.jpg'
  ],
  '우정패션': [
    '20250714_111200.jpg',
    '20250714_111228.jpg',
    '20250714_111415.jpg',
    '20250714_111424.jpg',
    '20250714_111438.jpg'
  ],
  '우진모피': [
    '20250715_103650.jpg',
    '20250715_103942.jpg',
    '20250715_103950.jpg',
    '20250715_104002.jpg',
    '20250715_104013.jpg'
  ],
  '화담어패럴': [
    'KakaoTalk_20250716_103440984.jpg',
    'KakaoTalk_20250716_103440984_01.jpg',
    'KakaoTalk_20250716_103440984_02.jpg',
    'KakaoTalk_20250716_103440984_03.jpg',
    'KakaoTalk_20250716_103440984_04.jpg'
  ],
  // 누락된 업장들 추가
  '재민상사': [
    '20250714_120323.jpg',
    '20250714_120423.jpg',
    '20250714_120430.jpg',
    '20250714_120452.jpg',
    'KakaoTalk_20250715_163600624.jpg'
  ],
  '아트패션': [
    '20250709_112748.jpg',
    '20250709_112919.jpg',
    '20250709_112925.jpg',
    '20250709_112951.jpg',
    '20250709_113042.jpg'
  ],
  // 기본 이미지 사용할 업장들 (업로드되지 않은 경우)
  '라이브 어패럴': ['/logo_donggori.png'],
  '라인스': ['/logo_donggori.png'],
  '백산실업': ['/logo_donggori.png'],
  '부연사': ['/logo_donggori.png'],
  '새가온': ['/logo_donggori.png'],
  '선화사': ['/logo_donggori.png'],
  '스마일': ['/logo_donggori.png'],
  '시즌': ['/logo_donggori.png'],
  '실루엣컴퍼니': ['/logo_donggori.png'],
  '에이스': ['/logo_donggori.png'],
  '오르다': ['/logo_donggori.png'],
  '오성섬유': ['/logo_donggori.png'],
  '오스카 디자인': ['/logo_donggori.png'],
  '우정샘플': ['/logo_donggori.png'],
  '유화 섬유': ['/logo_donggori.png'],
  '좋은사람': ['/logo_donggori.png'],
  '하늘패션': ['/logo_donggori.png'],
  '혜민사': ['/logo_donggori.png'],
  '화신사': ['/logo_donggori.png'],
  '희란패션': ['/logo_donggori.png'],
  '희망사': ['/logo_donggori.png'],
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

  // 실제 업로드된 이미지 파일명들 사용
  const imageFiles = factoryImageFiles[factoryName];
  
  if (!imageFiles) {
    return ['/logo_donggori.png'];
  }

  // 첫 번째 파일이 기본 이미지 경로인 경우 (업로드되지 않은 업장들)
  if (imageFiles[0].startsWith('/')) {
    return imageFiles;
  }

  // Vercel Blob에서 이미지 URL들 생성
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