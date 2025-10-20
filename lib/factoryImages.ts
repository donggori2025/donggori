// Vercel Blob Storage 사용
import { getVercelBlobImageUrl } from './vercelBlobConfig';

function getProxyUrl(folderName: string, fileName: string) {
  // API 프록시 사용: 서버가 NFC/NFD, 실제 디렉터리명 스캔 후 안전하게 서빙
  return `/api/factory-images/url?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(fileName)}`;
}

// 업장 이름과 이미지 폴더 매칭
const factoryImageMapping: Record<string, string> = {
  // 기존 공장들
  '강훈무역': '강훈무역',
  '건영실업': '건영실업',
  '경림패션': '경림패션',
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

// 업장 이름으로 모든 이미지 URL 생성 (배포 환경 호환)
export function getFactoryImages(factoryName: string): string[] {
  const folderName = getFactoryImageFolder(factoryName);
  
  if (!folderName) {
    return ['/logo_donggori.png'];
  }

  // 각 공장별 실제 첫 번째 이미지 파일명 매핑
  const firstImageFiles: Record<string, string> = {
    'jk패션': 'KakaoTalk_20250902_230359893.jpg',
    '강훈무역': '20250710_103857.jpg',
    '건영실업': '20250715_101845.jpg',
    '경림패션': '20250710_113356.jpg',
    '기훈패션': 'KakaoTalk_20250902_230310883.jpg',
    '꼬메오': '20250714_160113.jpg',
    '나르샤': 'KakaoTalk_20250902_230256978.jpg',
    '나인': '20250710_111150.jpg',
    '뉴에일린': '20250708_160127.jpg',
    '다래디자인': 'KakaoTalk_20250902_230419383.jpg',
    '다엘': '20250715_105148.jpg',
    '다온패션': 'KakaoTalk_20250902_230530170.jpg',
    '대명어패럴': '20250709_104228.jpg',
    '더시크컴퍼니': '20250709_225247.jpg',
    '라이브': '20250711_155242.jpg',
    '라인스': '20250709_105019.jpg',
    '레오실업': 'KakaoTalk_20250902_230515328.jpg',
    '미호패션': '20250716_090508.jpg',
    '민경패션': 'KakaoTalk_20250902_230615438.jpg',
    '바비패션': 'KakaoTalk_20250902_230235575.jpg',
    '백산실업': '20250710_110456.jpg',
    '부연사': '20250710_111234.jpg',
    '새가온': '20250710_112012.jpg',
    '선화사': '20250710_112750.jpg',
    '수미어패럴': 'KakaoTalk_20250902_230700123.jpg',
    '스마일': '20250710_113528.jpg',
    '시즌': '20250710_114306.jpg',
    '실루엣컴퍼니': '20250710_115044.jpg',
    '아트': '20250710_115822.jpg',
    '에이스': '20250710_120600.jpg',
    '오르다': '20250709_135416.jpg',
    '오성섬유': '20250715_182743.jpg',
    '오스카 디자인': '20250711_101241.jpg',
    '우정샘플': '20250714_111200.jpg',
    '우정패션': '20250714_111200.jpg',
    '우진모피': '20250715_103650.jpg',
    '유화섬유': '20250714_093043.jpg',
    '유화 섬유': '20250714_093043.jpg',
    '으뜸어패럴': 'KakaoTalk_20250902_230214593.jpg',
    '재민상사': '20250714_120323.jpg',
    '정인어패럴': 'KakaoTalk_20250902_230604583.jpg',
    '조아스타일': '20250714_121748.jpg',
    '좋은사람': '114498789873579979_1220069723.jpg',
    '태경패션': 'KakaoTalk_20250902_230457546.jpg',
    '태광사': 'KakaoTalk_20250902_230445963.jpg',
    '태성어패럴': 'KakaoTalk_20250902_230331718.jpg',
    '하늘패션': '20250712_172704.jpg',
    '혜민사': '20250710_131750.jpg',
    '화담어패럴': 'KakaoTalk_20250716_103440984.jpg',
    '화신사': '20250715_180243.jpg',
    '희란패션': '20250709_110315.jpg',
    '희망사': '20250715_190601.jpg',
  };

  const imageFile = firstImageFiles[folderName] || '20250710_103857.jpg';
  const imageUrl = `/api/factory-images/url?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(imageFile)}`;
  
  return [imageUrl];
}

// 업장 이름으로 대표 이미지 경로 생성 (썸네일용)
export function getFactoryMainImage(factoryName: string): string {
  return getFactoryThumbnailImage(factoryName);
}

// 이미지 존재 여부 확인 (선택적)
export function hasFactoryImages(factoryName: string): boolean {
  return getFactoryImageFolder(factoryName) !== null;
}