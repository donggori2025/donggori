// Vercel Blob Storage 사용
import { getVercelBlobImageUrl } from './vercelBlobConfig';

function getProxyUrl(folderName: string, fileName: string) {
  // API 프록시 사용: 서버가 NFC/NFD, 실제 디렉터리명 스캔 후 안전하게 서빙
  return `/api/factory-images/url?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(fileName)}`;
}

// 업장 이름과 이미지 폴더 매칭
const factoryImageMapping: Record<string, string> = {
  // 기존 공장들
  '강훈무역': '강훈(리더밴드)',
  '건영실업': '건영실업',
  '경림패션': '경림사',
  '꼬메오패션': '꼬메오',
  '나인': '나인',
  '뉴에일린': '뉴에일린',
  '다엘': '다엘',
  '대명어패럴': '대명어패럴',
  '더시크컴퍼니': '더시크컴퍼니',
  '라이브 어패럴': '라이브',
  '라인스': '라인스',
  '백산실업': '백산실업',
  '부연사': '부연사',
  '새가온': '새가온',
  '선화사': '선화사',
  '스마일': '스마일',
  '시즌': '시즌',
  '실루엣컴퍼니': '실루엣컴퍼니',
  '아트패션': '아트',
  '에이스': '에이스',
  '오르다': '오르다',
  '오성섬유': '오성섬유',
  '오스카 디자인': '오스카',
  '우정샘플': '우정샘플',
  '우정패션': '우정샘플',
  '우진모피': '우진모피',
  '유화 섬유': '유화섬유',
  '재민상사': '재민상사',
  '좋은사람': '좋은사람',
  '하늘패션': '하늘패션',
  '혜민사': '혜민사',
  '화담어패럴': '화담어패럴',
  '화신사': '화신사',
  '희란패션': '희란패션',
  // 새로 추가된 공장들
  'jk패션': 'jk패션',
  '기훈패션': '기훈패션',
  '나르샤': '나르샤',
  '다래디자인': '다래디자인',
  '다온패션': '다온패션',
  '레오실업': '레오실업',
  '민경패션': '민경패션',
  '바비패션': '바비패션',
  '수미어패럴': '수미어패럴',
  '으뜸어패럴': '으뜸어패럴',
  '조아스타일': '조아스타일',
  '태경패션': '태경패션',
  '태광사': '태광사',
  '태성어패럴': '태성어패럴',
  // 추가 공장들
  '미호패션': '미호패션',
  '박원니트': '박원니트',
  '희망사': '희망사',
};

// 업장별 실제 업로드된 이미지 파일명들 (동적으로 생성)
const factoryImageFiles: Record<string, string[]> = {};

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

  // 첫 번째 이미지를 썸네일로 사용
  const images = getFactoryImages(factoryName);
  return images.length > 0 ? images[0] : '/logo_donggori.png';
}

// 업장 이름으로 모든 이미지 URL 생성 (Vercel Blob 사용)
export function getFactoryImages(factoryName: string): string[] {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    return ['/logo_donggori.png'];
  }

  // 클라이언트에서는 useFactoryImages 훅을 사용하도록 안내
  // 서버 사이드에서는 기본 이미지만 반환
  return ['/logo_donggori.png'];
}

// 업장 이름으로 대표 이미지 경로 생성 (썸네일용)
export function getFactoryMainImage(factoryName: string): string {
  return getFactoryThumbnailImage(factoryName);
}

// 이미지 존재 여부 확인 (선택적)
export function hasFactoryImages(factoryName: string): boolean {
  return getFactoryImageFolder(factoryName) !== null;
}